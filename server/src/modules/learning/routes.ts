import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../shared/core/db.ts";
import { AppError } from "../shared/core/index.ts";
import { learningPaths, lessonProgress, lessonVersions, lessons } from "../../db/schema/index.ts";

const pathIdParamsSchema = z.object({
  id: z.string().uuid("Parameter id harus UUID yang valid."),
});

const pathIdParamSchema = z.object({
  pathId: z.string().uuid("Parameter pathId harus UUID yang valid."),
});

const lessonIdParamsSchema = z.object({
  id: z.string().uuid("Parameter id harus UUID yang valid."),
});

const createPathBodySchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(200, "Judul maksimal 200 karakter."),
  description: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter.").optional(),
});

const updatePathBodySchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(200, "Judul maksimal 200 karakter.").optional(),
  description: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter.").nullable().optional(),
}).refine((value) => value.title !== undefined || value.description !== undefined, {
  message: "Minimal satu field harus diubah.",
  path: ["body"],
});

const contentBlockSchema = z.object({
  type: z.string().trim().min(1, "Block type wajib diisi.").max(100, "Block type terlalu panjang."),
}).passthrough();

const contentJsonSchema = z.object({
  blocks: z.array(contentBlockSchema).min(1, "Content blocks minimal berisi 1 block."),
}).passthrough();

const createLessonBodySchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(200, "Judul maksimal 200 karakter."),
  summary: z.string().trim().max(2000, "Ringkasan maksimal 2000 karakter.").optional(),
  contentJson: contentJsonSchema,
  changeNote: z.string().trim().max(500, "Change note maksimal 500 karakter.").optional(),
});

const createVersionBodySchema = z.object({
  contentJson: contentJsonSchema,
  changeNote: z.string().trim().max(500, "Change note maksimal 500 karakter.").optional(),
});

const approveVersionBodySchema = z.object({
  versionId: z.string().uuid("versionId harus UUID yang valid."),
});

const lessonProgressStatusSchema = z.enum(["Not Started", "In Progress", "Completed", "Mastered"]);

const updateLessonProgressBodySchema = z.object({
  status: lessonProgressStatusSchema,
});

function toLessonVersion(row: typeof lessonVersions.$inferSelect) {
  return {
    id: row.id,
    lessonId: row.lessonId,
    version: row.version,
    status: row.status,
    contentJson: row.contentJson,
    changeNote: row.changeNote,
    approvedAt: row.approvedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toLessonProgress(row: typeof lessonProgress.$inferSelect) {
  return {
    id: row.id,
    lessonId: row.lessonId,
    status: row.status,
    masteredAt: row.masteredAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function registerLearningRoutes(app: FastifyInstance): void {
  app.get("/api/learning/paths", async () => {
    const { db } = getDb();
    const rows = await db
      .select({
        id: learningPaths.id,
        title: learningPaths.title,
        description: learningPaths.description,
        createdAt: learningPaths.createdAt,
        updatedAt: learningPaths.updatedAt,
      })
      .from(learningPaths)
      .orderBy(asc(learningPaths.createdAt));

    return {
      data: rows,
    };
  });

  app.get("/api/learning/paths/:id", async (request) => {
    const params = pathIdParamsSchema.parse(request.params);
    const { db } = getDb();

    const pathRows = await db
      .select({
        id: learningPaths.id,
        title: learningPaths.title,
        description: learningPaths.description,
        createdAt: learningPaths.createdAt,
        updatedAt: learningPaths.updatedAt,
      })
      .from(learningPaths)
      .where(eq(learningPaths.id, params.id))
      .limit(1);

    const path = pathRows[0];
    if (!path) {
      throw new AppError(404, "NOT_FOUND", "Learning path tidak ditemukan.");
    }

    const lessonRows = await db
      .select({
        id: lessons.id,
        learningPathId: lessons.learningPathId,
        title: lessons.title,
        summary: lessons.summary,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
      })
      .from(lessons)
      .where(eq(lessons.learningPathId, params.id))
      .orderBy(asc(lessons.createdAt));

    return {
      data: {
        ...path,
        lessons: lessonRows,
      },
    };
  });

  app.post("/api/learning/paths", async (request, reply) => {
    const body = createPathBodySchema.parse(request.body);
    const { db } = getDb();

    const rows = await db
      .insert(learningPaths)
      .values({
        title: body.title,
        description: body.description,
        createdAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .returning({
        id: learningPaths.id,
        title: learningPaths.title,
        description: learningPaths.description,
        createdAt: learningPaths.createdAt,
        updatedAt: learningPaths.updatedAt,
      });

    reply.status(201);
    return { data: rows[0] };
  });

  app.patch("/api/learning/paths/:id", async (request) => {
    const params = pathIdParamsSchema.parse(request.params);
    const body = updatePathBodySchema.parse(request.body);
    const { db } = getDb();

    const updates: Record<string, unknown> = {
      updatedAt: sql`now()`,
    };
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;

    const rows = await db
      .update(learningPaths)
      .set(updates)
      .where(eq(learningPaths.id, params.id))
      .returning({
        id: learningPaths.id,
        title: learningPaths.title,
        description: learningPaths.description,
        createdAt: learningPaths.createdAt,
        updatedAt: learningPaths.updatedAt,
      });

    const updated = rows[0];
    if (!updated) {
      throw new AppError(404, "NOT_FOUND", "Learning path tidak ditemukan.");
    }

    return { data: updated };
  });

  app.post("/api/learning/paths/:pathId/lessons", async (request, reply) => {
    const params = pathIdParamSchema.parse(request.params);
    const body = createLessonBodySchema.parse(request.body);
    const { db } = getDb();

    const result = await db.transaction(async (tx) => {
      const pathRows = await tx
        .select({ id: learningPaths.id })
        .from(learningPaths)
        .where(eq(learningPaths.id, params.pathId))
        .limit(1);

      if (!pathRows[0]) {
        throw new AppError(404, "NOT_FOUND", "Learning path tidak ditemukan.");
      }

      const lessonRows = await tx
        .insert(lessons)
        .values({
          learningPathId: params.pathId,
          title: body.title,
          summary: body.summary,
          createdAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .returning();

      const lesson = lessonRows[0];

      const versionRows = await tx
        .insert(lessonVersions)
        .values({
          lessonId: lesson.id,
          version: 1,
          status: "Draft",
          contentJson: body.contentJson,
          changeNote: body.changeNote,
          createdAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .returning();

      return { lesson, version: versionRows[0] };
    });

    reply.status(201);
    return {
      data: {
        id: result.lesson.id,
        learningPathId: result.lesson.learningPathId,
        title: result.lesson.title,
        summary: result.lesson.summary,
        createdAt: result.lesson.createdAt,
        updatedAt: result.lesson.updatedAt,
        initialVersion: toLessonVersion(result.version),
      },
    };
  });

  app.get("/api/learning/lessons/:id", async (request) => {
    const params = lessonIdParamsSchema.parse(request.params);
    const { db } = getDb();

    const lessonRows = await db
      .select({
        id: lessons.id,
        learningPathId: lessons.learningPathId,
        title: lessons.title,
        summary: lessons.summary,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
      })
      .from(lessons)
      .where(eq(lessons.id, params.id))
      .limit(1);

    const lesson = lessonRows[0];
    if (!lesson) {
      throw new AppError(404, "NOT_FOUND", "Lesson tidak ditemukan.");
    }

    const versionRows = await db
      .select()
      .from(lessonVersions)
      .where(eq(lessonVersions.lessonId, params.id))
      .orderBy(desc(lessonVersions.version));

    return {
      data: {
        ...lesson,
        versions: versionRows.map(toLessonVersion),
      },
    };
  });

  app.post("/api/learning/lessons/:id/versions", async (request, reply) => {
    const params = lessonIdParamsSchema.parse(request.params);
    const body = createVersionBodySchema.parse(request.body);
    const { db } = getDb();

    const result = await db.transaction(async (tx) => {
      const lessonRows = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.id, params.id))
        .limit(1);

      if (!lessonRows[0]) {
        throw new AppError(404, "NOT_FOUND", "Lesson tidak ditemukan.");
      }

      const latestRows = await tx
        .select({ version: lessonVersions.version })
        .from(lessonVersions)
        .where(eq(lessonVersions.lessonId, params.id))
        .orderBy(desc(lessonVersions.version))
        .limit(1);

      const nextVersion = (latestRows[0]?.version ?? 0) + 1;

      const versionRows = await tx
        .insert(lessonVersions)
        .values({
          lessonId: params.id,
          version: nextVersion,
          status: "Draft",
          contentJson: body.contentJson,
          changeNote: body.changeNote,
          createdAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .returning();

      await tx
        .update(lessons)
        .set({ updatedAt: sql`now()` })
        .where(eq(lessons.id, params.id));

      return versionRows[0];
    });

    reply.status(201);
    return { data: toLessonVersion(result) };
  });

  app.post("/api/learning/lessons/:id/approve", async (request) => {
    const params = lessonIdParamsSchema.parse(request.params);
    const body = approveVersionBodySchema.parse(request.body);
    const { db } = getDb();

    const result = await db.transaction(async (tx) => {
      const lessonRows = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.id, params.id))
        .limit(1);

      if (!lessonRows[0]) {
        throw new AppError(404, "NOT_FOUND", "Lesson tidak ditemukan.");
      }

      const targetRows = await tx
        .select()
        .from(lessonVersions)
        .where(and(eq(lessonVersions.id, body.versionId), eq(lessonVersions.lessonId, params.id)))
        .limit(1);

      const target = targetRows[0];
      if (!target) {
        throw new AppError(404, "NOT_FOUND", "Versi lesson tidak ditemukan.");
      }

      if (target.status !== "Draft") {
        throw new AppError(409, "CONFLICT", "Hanya versi Draft yang dapat di-approve.");
      }

      await tx
        .update(lessonVersions)
        .set({ status: "Deprecated", updatedAt: sql`now()` })
        .where(and(eq(lessonVersions.lessonId, params.id), eq(lessonVersions.status, "Approved")));

      const approvedRows = await tx
        .update(lessonVersions)
        .set({
          status: "Approved",
          approvedAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .where(eq(lessonVersions.id, target.id))
        .returning();

      await tx
        .update(lessons)
        .set({ updatedAt: sql`now()` })
        .where(eq(lessons.id, params.id));

      return approvedRows[0];
    });

    return { data: toLessonVersion(result) };
  });

  app.get("/api/learning/lessons/:id/progress", async (request) => {
    const params = lessonIdParamsSchema.parse(request.params);
    const { db } = getDb();

    const lessonRows = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.id, params.id))
      .limit(1);

    if (!lessonRows[0]) {
      throw new AppError(404, "NOT_FOUND", "Lesson tidak ditemukan.");
    }

    const progressRows = await db
      .select()
      .from(lessonProgress)
      .where(eq(lessonProgress.lessonId, params.id))
      .limit(1);

    const progress = progressRows[0];
    if (!progress) {
      return {
        data: {
          id: null,
          lessonId: params.id,
          status: "Not Started" as const,
          masteredAt: null,
          createdAt: null,
          updatedAt: null,
        },
      };
    }

    return { data: toLessonProgress(progress) };
  });

  const upsertLessonProgress = async (request: FastifyRequest) => {
    const params = lessonIdParamsSchema.parse(request.params);
    const body = updateLessonProgressBodySchema.parse(request.body);
    const { db } = getDb();

    const result = await db.transaction(async (tx) => {
      const lessonRows = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.id, params.id))
        .limit(1);

      if (!lessonRows[0]) {
        throw new AppError(404, "NOT_FOUND", "Lesson tidak ditemukan.");
      }

      const existingRows = await tx
        .select()
        .from(lessonProgress)
        .where(eq(lessonProgress.lessonId, params.id))
        .limit(1);

      const masteredAt = body.status === "Mastered" ? sql`now()` : null;
      const existing = existingRows[0];

      if (!existing) {
        const inserted = await tx
          .insert(lessonProgress)
          .values({
            lessonId: params.id,
            status: body.status,
            masteredAt,
            createdAt: sql`now()`,
            updatedAt: sql`now()`,
          })
          .returning();
        return inserted[0];
      }

      const updated = await tx
        .update(lessonProgress)
        .set({
          status: body.status,
          masteredAt,
          updatedAt: sql`now()`,
        })
        .where(eq(lessonProgress.lessonId, params.id))
        .returning();

      return updated[0];
    });

    return { data: toLessonProgress(result) };
  };

  app.patch("/api/learning/lessons/:id/progress", upsertLessonProgress);
  app.put("/api/learning/lessons/:id/progress", upsertLessonProgress);
}
