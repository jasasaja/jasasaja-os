import type { FastifyInstance } from "fastify";
import { and, asc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../shared/core/db.ts";
import { AppError } from "../shared/core/index.ts";
import {
  handbookItemVersions,
  handbookItems,
  projectMilestones,
  projectTasks,
  projects,
} from "../../db/schema/index.ts";

type ProjectRow = typeof projects.$inferSelect;
type MilestoneRow = typeof projectMilestones.$inferSelect;
type TaskRow = typeof projectTasks.$inferSelect;
type HandbookItemRow = typeof handbookItems.$inferSelect;
type HandbookVersionRow = typeof handbookItemVersions.$inferSelect;
type Db = ReturnType<typeof getDb>["db"];
type HandbookReference = ReturnType<typeof resolveHandbookReference>;

const milestoneStatusSchema = z.enum(["Planned", "In Progress", "Completed"]);
const taskStatusSchema = z.enum(["Todo", "In Progress", "Done", "Blocked"]);

// C2/OD-008: tanggal disimpan sebagai `date` (YYYY-MM-DD), bukan timestamp.
const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus berformat YYYY-MM-DD.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    );
  }, "Tanggal tidak valid.");

const projectIdParamSchema = z.object({
  projectId: z.string().uuid("Parameter projectId harus UUID yang valid."),
});

const listProjectsQuerySchema = z
  .object({
    // Schema belum memiliki kolom `stage`; `status` dipakai sebagai label tahap proyek.
    status: z.enum(["Planned", "Active", "Completed", "Archived"]).optional(),
    q: z
      .string()
      .trim()
      .min(1, "Pencarian tidak boleh kosong.")
      .max(200, "Pencarian maksimal 200 karakter.")
      .optional(),
  })
  .strict();

const createProjectBodySchema = z
  .object({
    name: z.string().trim().min(1, "Nama project wajib diisi.").max(200, "Nama project maksimal 200 karakter."),
    description: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter.").nullable().optional(),
    // Schema belum memiliki kolom `stage`; `status` dipakai sebagai label tahap proyek.
    status: z.enum(["Planned", "Active", "Completed", "Archived"]).optional(),
  })
  .strict();

const updateProjectBodySchema = z
  .object({
    name: z.string().trim().min(1, "Nama project wajib diisi.").max(200, "Nama project maksimal 200 karakter.").optional(),
    description: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter.").nullable().optional(),
    status: z.enum(["Planned", "Active", "Completed", "Archived"]).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.name !== undefined || value.description !== undefined || value.status !== undefined,
    { message: "Minimal satu field harus diubah.", path: ["body"] },
  );

const milestoneIdParamSchema = z.object({
  projectId: z.string().uuid("Parameter projectId harus UUID yang valid."),
  milestoneId: z.string().uuid("Parameter milestoneId harus UUID yang valid."),
});

const taskIdParamSchema = z.object({
  projectId: z.string().uuid("Parameter projectId harus UUID yang valid."),
  taskId: z.string().uuid("Parameter taskId harus UUID yang valid."),
});

const listTasksQuerySchema = z
  .object({
    milestoneId: z.string().uuid("Parameter milestoneId harus UUID yang valid.").optional(),
    status: taskStatusSchema.optional(),
  })
  .strict();

const createMilestoneBodySchema = z
  .object({
    title: z.string().trim().min(1, "Judul milestone wajib diisi.").max(200, "Judul maksimal 200 karakter."),
    targetDate: calendarDateSchema.optional(),
    status: milestoneStatusSchema.optional(),
  })
  .strict();

const updateMilestoneBodySchema = z
  .object({
    title: z.string().trim().min(1, "Judul milestone wajib diisi.").max(200, "Judul maksimal 200 karakter.").optional(),
    targetDate: calendarDateSchema.nullable().optional(),
    status: milestoneStatusSchema.optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.title !== undefined || value.targetDate !== undefined || value.status !== undefined,
    { message: "Minimal satu field harus diubah.", path: ["body"] },
  );

const createTaskBodySchema = z
  .object({
    title: z.string().trim().min(1, "Judul task wajib diisi.").max(200, "Judul maksimal 200 karakter."),
    description: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter.").nullable().optional(),
    milestoneId: z.string().uuid("Milestone ID harus UUID yang valid.").nullable().optional(),
    status: taskStatusSchema.optional(),
    dueDate: calendarDateSchema.optional(),
    // Referensi lintas modul tetap UUID eksplisit. Learning sengaja tidak di-resolve.
    handbookItemId: z.string().uuid("Handbook item ID harus UUID yang valid.").nullable().optional(),
    lessonId: z.string().uuid("Lesson ID harus UUID yang valid.").nullable().optional(),
  })
  .strict();

const updateTaskBodySchema = z
  .object({
    title: z.string().trim().min(1, "Judul task wajib diisi.").max(200, "Judul maksimal 200 karakter.").optional(),
    description: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter.").nullable().optional(),
    milestoneId: z.string().uuid("Milestone ID harus UUID yang valid.").nullable().optional(),
    status: taskStatusSchema.optional(),
    dueDate: calendarDateSchema.nullable().optional(),
    handbookItemId: z.string().uuid("Handbook item ID harus UUID yang valid.").nullable().optional(),
    lessonId: z.string().uuid("Lesson ID harus UUID yang valid.").nullable().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.milestoneId !== undefined ||
      value.status !== undefined ||
      value.dueDate !== undefined ||
      value.handbookItemId !== undefined ||
      value.lessonId !== undefined,
    { message: "Minimal satu field harus diubah.", path: ["body"] },
  );

function sanitizeSearchTerm(value: string): string {
  return value.replace(/[\\%_]/g, " ").replace(/\s+/g, " ").trim();
}

function toDateString(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function toDateValue(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toProjectSummary(
  row: ProjectRow,
  milestoneCount: number,
  taskCount: number,
) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    milestoneCount,
    taskCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function countProjectChildren(
  db: ReturnType<typeof getDb>["db"],
  projectId: string,
): Promise<{ milestoneCount: number; taskCount: number }> {
  const [milestoneRows, taskRows] = await Promise.all([
    db
      .select({ id: projectMilestones.id })
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, projectId)),
    db
      .select({ id: projectTasks.id })
      .from(projectTasks)
      .where(eq(projectTasks.projectId, projectId)),
  ]);

  return { milestoneCount: milestoneRows.length, taskCount: taskRows.length };
}

function toMilestone(row: MilestoneRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    targetDate: toDateString(row.targetDate),
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function resolveHandbookReference(
  item: HandbookItemRow,
  versions: HandbookVersionRow[],
) {
  let approved: HandbookVersionRow | null = null;
  let latest: HandbookVersionRow | null = null;

  for (const version of versions) {
    if (!latest || version.version > latest.version) {
      latest = version;
    }
    if (version.status === "Approved" && (!approved || version.version > approved.version)) {
      approved = version;
    }
  }

  const display = approved ?? latest;
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    status: display?.status ?? "Draft",
    version: display?.version ?? 0,
    hasApprovedVersion: approved !== null,
  };
}

// Ringkasan dibaca dari tabel shared schema; tidak mengimpor file internal modul handbook.
async function resolveHandbookReferences(
  db: Db,
  ids: (string | null)[],
): Promise<Map<string, HandbookReference>> {
  const handbookIds = Array.from(
    new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0)),
  );
  const references = new Map<string, HandbookReference>();
  if (handbookIds.length === 0) return references;

  const [items, versions] = await Promise.all([
    db.select().from(handbookItems).where(inArray(handbookItems.id, handbookIds)),
    db
      .select()
      .from(handbookItemVersions)
      .where(inArray(handbookItemVersions.handbookItemId, handbookIds)),
  ]);

  const versionsByItem = new Map<string, HandbookVersionRow[]>();
  for (const version of versions) {
    const list = versionsByItem.get(version.handbookItemId) ?? [];
    list.push(version);
    versionsByItem.set(version.handbookItemId, list);
  }

  for (const item of items) {
    references.set(
      item.id,
      resolveHandbookReference(item, versionsByItem.get(item.id) ?? []),
    );
  }

  return references;
}

async function assertProjectExists(db: Db, projectId: string): Promise<void> {
  const rows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!rows[0]) {
    throw new AppError(404, "NOT_FOUND", "Project tidak ditemukan.");
  }
}

async function assertMilestoneInProject(
  db: Db,
  projectId: string,
  milestoneId: string,
): Promise<void> {
  const rows = await db
    .select({ id: projectMilestones.id })
    .from(projectMilestones)
    .where(
      and(
        eq(projectMilestones.id, milestoneId),
        eq(projectMilestones.projectId, projectId),
      ),
    )
    .limit(1);
  if (!rows[0]) {
    throw new AppError(404, "NOT_FOUND", "Milestone tidak ditemukan pada project ini.");
  }
}

async function assertHandbookItemExists(db: Db, handbookItemId: string): Promise<void> {
  const rows = await db
    .select({ id: handbookItems.id })
    .from(handbookItems)
    .where(eq(handbookItems.id, handbookItemId))
    .limit(1);
  if (!rows[0]) {
    throw new AppError(404, "NOT_FOUND", "Item handbook tidak ditemukan.");
  }
}

function toTask(
  row: TaskRow,
  handbookReference: ReturnType<typeof resolveHandbookReference> | null,
) {
  return {
    id: row.id,
    projectId: row.projectId,
    milestoneId: row.milestoneId,
    title: row.title,
    description: row.description,
    status: row.status,
    dueDate: toDateString(row.dueDate),
    // Referensi lintas modul tetap berupa ID eksplisit. Learning sengaja tidak di-resolve.
    handbookItemId: row.handbookItemId,
    handbookItem: handbookReference,
    lessonId: row.lessonId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function registerProjectRoutes(app: FastifyInstance): void {
  app.get("/api/projects", async (request) => {
    const query = listProjectsQuerySchema.parse(request.query);
    const { db } = getDb();
    const filters: SQL[] = [];

    const term = query.q ? sanitizeSearchTerm(query.q) : "";
    if (term) {
      const pattern = `%${term}%`;
      const match = or(
        ilike(projects.name, pattern),
        ilike(projects.description, pattern),
      );
      if (match) {
        filters.push(match);
      }
    }

    const rows = await db
      .select()
      .from(projects)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(asc(projects.createdAt));

    const filtered = query.status ? rows.filter((row) => row.status === query.status) : rows;
    const projectIds = filtered.map((row) => row.id);

    const milestoneCountByProject = new Map<string, number>();
    const taskCountByProject = new Map<string, number>();

    if (projectIds.length > 0) {
      const milestones = await db
        .select({ projectId: projectMilestones.projectId })
        .from(projectMilestones)
        .where(inArray(projectMilestones.projectId, projectIds));

      for (const milestone of milestones) {
        milestoneCountByProject.set(
          milestone.projectId,
          (milestoneCountByProject.get(milestone.projectId) ?? 0) + 1,
        );
      }

      const tasks = await db
        .select({ projectId: projectTasks.projectId })
        .from(projectTasks)
        .where(inArray(projectTasks.projectId, projectIds));

      for (const task of tasks) {
        taskCountByProject.set(
          task.projectId,
          (taskCountByProject.get(task.projectId) ?? 0) + 1,
        );
      }
    }

    return {
      data: filtered.map((row) =>
        toProjectSummary(
          row,
          milestoneCountByProject.get(row.id) ?? 0,
          taskCountByProject.get(row.id) ?? 0,
        ),
      ),
    };
  });

  app.get("/api/projects/:projectId", async (request) => {
    const params = projectIdParamSchema.parse(request.params);
    const { db } = getDb();

    const projectRows = await db
      .select()
      .from(projects)
      .where(eq(projects.id, params.projectId))
      .limit(1);

    const project = projectRows[0];
    if (!project) {
      throw new AppError(404, "NOT_FOUND", "Project tidak ditemukan.");
    }

    const [milestones, tasks] = await Promise.all([
      db
        .select()
        .from(projectMilestones)
        .where(eq(projectMilestones.projectId, project.id))
        .orderBy(asc(projectMilestones.createdAt)),
      db
        .select()
        .from(projectTasks)
        .where(eq(projectTasks.projectId, project.id))
        .orderBy(asc(projectTasks.createdAt)),
    ]);

    const references = await resolveHandbookReferences(
      db,
      tasks.map((task) => task.handbookItemId),
    );

    return {
      data: {
        ...toProjectSummary(project, milestones.length, tasks.length),
        milestones: milestones.map(toMilestone),
        tasks: tasks.map((task) =>
          toTask(task, task.handbookItemId ? references.get(task.handbookItemId) ?? null : null),
        ),
      },
    };
  });

  app.post("/api/projects", async (request, reply) => {
    const body = createProjectBodySchema.parse(request.body);
    const { db } = getDb();

    const rows = await db
      .insert(projects)
      .values({
        name: body.name,
        description: body.description ?? null,
        status: body.status ?? "Planned",
        createdAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .returning();

    // Project baru belum memiliki milestone/task; turunan dikelola di P3.3.
    reply.status(201);
    return { data: toProjectSummary(rows[0], 0, 0) };
  });

  app.patch("/api/projects/:projectId", async (request) => {
    const params = projectIdParamSchema.parse(request.params);
    const body = updateProjectBodySchema.parse(request.body);
    const { db } = getDb();

    const updates: Record<string, unknown> = {
      updatedAt: sql`now()`,
    };
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;

    const rows = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, params.projectId))
      .returning();

    const updated = rows[0];
    if (!updated) {
      throw new AppError(404, "NOT_FOUND", "Project tidak ditemukan.");
    }

    const counts = await countProjectChildren(db, updated.id);
    return {
      data: toProjectSummary(updated, counts.milestoneCount, counts.taskCount),
    };
  });

  app.get("/api/projects/:projectId/milestones", async (request) => {
    const params = projectIdParamSchema.parse(request.params);
    const { db } = getDb();
    await assertProjectExists(db, params.projectId);

    const rows = await db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, params.projectId))
      .orderBy(asc(projectMilestones.createdAt));

    return { data: rows.map(toMilestone) };
  });

  app.post("/api/projects/:projectId/milestones", async (request, reply) => {
    const params = projectIdParamSchema.parse(request.params);
    const body = createMilestoneBodySchema.parse(request.body);
    const { db } = getDb();
    await assertProjectExists(db, params.projectId);

    const rows = await db
      .insert(projectMilestones)
      .values({
        projectId: params.projectId,
        title: body.title,
        targetDate: body.targetDate ? toDateValue(body.targetDate) : null,
        status: body.status ?? "Planned",
        createdAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .returning();

    reply.status(201);
    return { data: toMilestone(rows[0]) };
  });

  app.patch("/api/projects/:projectId/milestones/:milestoneId", async (request) => {
    const params = milestoneIdParamSchema.parse(request.params);
    const body = updateMilestoneBodySchema.parse(request.body);
    const { db } = getDb();
    await assertProjectExists(db, params.projectId);
    await assertMilestoneInProject(db, params.projectId, params.milestoneId);

    const updates: Record<string, unknown> = {
      updatedAt: sql`now()`,
    };
    if (body.title !== undefined) updates.title = body.title;
    if (body.targetDate !== undefined) {
      updates.targetDate = body.targetDate === null ? null : toDateValue(body.targetDate);
    }
    if (body.status !== undefined) updates.status = body.status;

    const rows = await db
      .update(projectMilestones)
      .set(updates)
      .where(
        and(
          eq(projectMilestones.id, params.milestoneId),
          eq(projectMilestones.projectId, params.projectId),
        ),
      )
      .returning();

    const updated = rows[0];
    if (!updated) {
      throw new AppError(404, "NOT_FOUND", "Milestone tidak ditemukan pada project ini.");
    }
    return { data: toMilestone(updated) };
  });

  app.get("/api/projects/:projectId/tasks", async (request) => {
    const params = projectIdParamSchema.parse(request.params);
    const query = listTasksQuerySchema.parse(request.query);
    const { db } = getDb();
    await assertProjectExists(db, params.projectId);
    if (query.milestoneId) {
      await assertMilestoneInProject(db, params.projectId, query.milestoneId);
    }

    const filters: SQL[] = [eq(projectTasks.projectId, params.projectId)];
    if (query.milestoneId) filters.push(eq(projectTasks.milestoneId, query.milestoneId));
    if (query.status) filters.push(eq(projectTasks.status, query.status));

    const rows = await db
      .select()
      .from(projectTasks)
      .where(and(...filters))
      .orderBy(asc(projectTasks.createdAt));

    const references = await resolveHandbookReferences(
      db,
      rows.map((row) => row.handbookItemId),
    );

    return {
      data: rows.map((row) =>
        toTask(row, row.handbookItemId ? references.get(row.handbookItemId) ?? null : null),
      ),
    };
  });

  app.post("/api/projects/:projectId/tasks", async (request, reply) => {
    const params = projectIdParamSchema.parse(request.params);
    const body = createTaskBodySchema.parse(request.body);
    const { db } = getDb();
    await assertProjectExists(db, params.projectId);
    if (body.milestoneId) {
      await assertMilestoneInProject(db, params.projectId, body.milestoneId);
    }
    if (body.handbookItemId) {
      await assertHandbookItemExists(db, body.handbookItemId);
    }

    const rows = await db
      .insert(projectTasks)
      .values({
        projectId: params.projectId,
        milestoneId: body.milestoneId ?? null,
        title: body.title,
        description: body.description ?? null,
        status: body.status ?? "Todo",
        dueDate: body.dueDate ? toDateValue(body.dueDate) : null,
        handbookItemId: body.handbookItemId ?? null,
        lessonId: body.lessonId ?? null,
        createdAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .returning();

    const task = rows[0];
    const references = await resolveHandbookReferences(db, [task.handbookItemId]);
    reply.status(201);
    return {
      data: toTask(task, task.handbookItemId ? references.get(task.handbookItemId) ?? null : null),
    };
  });

  app.patch("/api/projects/:projectId/tasks/:taskId", async (request) => {
    const params = taskIdParamSchema.parse(request.params);
    const body = updateTaskBodySchema.parse(request.body);
    const { db } = getDb();
    await assertProjectExists(db, params.projectId);
    if (body.milestoneId) {
      await assertMilestoneInProject(db, params.projectId, body.milestoneId);
    }
    if (body.handbookItemId) {
      await assertHandbookItemExists(db, body.handbookItemId);
    }

    const updates: Record<string, unknown> = {
      updatedAt: sql`now()`,
    };
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.milestoneId !== undefined) updates.milestoneId = body.milestoneId;
    if (body.status !== undefined) updates.status = body.status;
    if (body.dueDate !== undefined) {
      updates.dueDate = body.dueDate === null ? null : toDateValue(body.dueDate);
    }
    if (body.handbookItemId !== undefined) updates.handbookItemId = body.handbookItemId;
    if (body.lessonId !== undefined) updates.lessonId = body.lessonId;

    const rows = await db
      .update(projectTasks)
      .set(updates)
      .where(
        and(
          eq(projectTasks.id, params.taskId),
          eq(projectTasks.projectId, params.projectId),
        ),
      )
      .returning();

    const updated = rows[0];
    if (!updated) {
      throw new AppError(404, "NOT_FOUND", "Task tidak ditemukan pada project ini.");
    }
    const references = await resolveHandbookReferences(db, [updated.handbookItemId]);
    return {
      data: toTask(updated, updated.handbookItemId ? references.get(updated.handbookItemId) ?? null : null),
    };
  });
}
