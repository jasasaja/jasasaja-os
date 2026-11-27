import type { FastifyInstance } from "fastify";
import { and, asc, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../shared/core/db.ts";
import { AppError } from "../shared/core/index.ts";
import {
  handbookCategories,
  handbookItemVersions,
  handbookItems,
} from "../../db/schema/index.ts";

type ItemRow = typeof handbookItems.$inferSelect;
type VersionRow = typeof handbookItemVersions.$inferSelect;

const idParamSchema = z.object({
  id: z.string().uuid("Parameter id harus UUID yang valid."),
});

const listItemsQuerySchema = z
  .object({
    categoryId: z.string().uuid("Parameter categoryId harus UUID yang valid.").optional(),
    status: z.enum(["Draft", "Approved", "Deprecated"]).optional(),
    q: z
      .string()
      .trim()
      .min(1, "Pencarian tidak boleh kosong.")
      .max(200, "Pencarian maksimal 200 karakter.")
      .optional(),
  })
  .strict();

const handbookBlockSchema = z.object({
  type: z.string().trim().min(1, "Block type wajib diisi.").max(100, "Block type terlalu panjang."),
}).passthrough();

const sectionBlocksSchema = z.array(handbookBlockSchema);

const provenanceLabelSchema = z.enum([
  "Source Material",
  "Indonesian Explanation",
  "AI-generated Explanation",
  "JASASAJA Supplement",
  "Personal Note",
]);

// A1 + field standar handbook: keenam bagian wajib hadir sebagai array block,
// tetapi boleh kosong pada Draft. Provenance mengikuti prinsip source transparency.
const handbookContentJsonSchema = z
  .object({
    purpose: sectionBlocksSchema,
    whenToUse: sectionBlocksSchema,
    procedure: sectionBlocksSchema,
    checklist: sectionBlocksSchema,
    templates: sectionBlocksSchema,
    deliverables: sectionBlocksSchema,
    provenance: z
      .object({
        labels: z.array(provenanceLabelSchema).min(1, "Minimal satu label provenance wajib diisi."),
        sourceUrl: z.string().trim().max(2000, "URL sumber terlalu panjang.").optional(),
        sourceTitle: z.string().trim().max(300, "Judul sumber terlalu panjang.").optional(),
        retrievalDate: z.string().trim().max(50, "Tanggal retrieval terlalu panjang.").optional(),
        lastReviewedDate: z.string().trim().max(50, "Tanggal tinjauan terlalu panjang.").optional(),
      })
      .strict(),
  })
  .strict();

const createItemBodySchema = z
  .object({
    categoryId: z.string().uuid("Category ID harus UUID yang valid.").nullable().optional(),
    title: z.string().trim().min(1, "Judul wajib diisi.").max(200, "Judul maksimal 200 karakter."),
    summary: z.string().trim().max(2000, "Ringkasan maksimal 2000 karakter.").optional(),
    contentJson: handbookContentJsonSchema,
    changeNote: z.string().trim().max(500, "Change note maksimal 500 karakter.").optional(),
  })
  .strict();

// P2.3: konten baru selalu dibuat sebagai versi Draft append-only.
const createVersionBodySchema = z
  .object({
    contentJson: handbookContentJsonSchema,
    changeNote: z.string().trim().max(500, "Change note maksimal 500 karakter.").optional(),
  })
  .strict();

const approveVersionBodySchema = z
  .object({
    versionId: z.string().uuid("Version ID harus UUID yang valid."),
  })
  .strict();

// P2.2: PATCH hanya metadata. Perubahan konten wajib lewat endpoint versi (P2.3).
const updateItemBodySchema = z
  .object({
    title: z.string().trim().min(1, "Judul wajib diisi.").max(200, "Judul maksimal 200 karakter.").optional(),
    summary: z.string().trim().max(2000, "Ringkasan maksimal 2000 karakter.").nullable().optional(),
    categoryId: z.string().uuid("Category ID harus UUID yang valid.").nullable().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.title !== undefined || value.summary !== undefined || value.categoryId !== undefined,
    { message: "Minimal satu field harus diubah.", path: ["body"] },
  );

function sanitizeSearchTerm(value: string): string {
  // `%`, `_`, dan `\` adalah wildcard/escape LIKE, bukan operator pencarian.
  return value.replace(/[\\%_]/g, " ").replace(/\s+/g, " ").trim();
}

function toVersionSummary(row: VersionRow) {
  return {
    id: row.id,
    version: row.version,
    status: row.status,
    approvedAt: row.approvedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toVersion(row: VersionRow) {
  return {
    ...toVersionSummary(row),
    handbookItemId: row.handbookItemId,
    contentJson: row.contentJson,
    changeNote: row.changeNote,
  };
}

function resolveVersions(versions: VersionRow[]) {
  let approved: VersionRow | null = null;
  let latest: VersionRow | null = null;

  for (const version of versions) {
    if (!latest || version.version > latest.version) {
      latest = version;
    }
    if (version.status === "Approved" && (!approved || version.version > approved.version)) {
      approved = version;
    }
  }

  return { approved, latest };
}

function toItemSummary(item: ItemRow, versions: VersionRow[]) {
  const { approved, latest } = resolveVersions(versions);
  const display = approved ?? latest;

  return {
    id: item.id,
    categoryId: item.categoryId,
    title: item.title,
    summary: item.summary,
    // `status`/`version` mengikuti standar aktif bila ada; Draft tidak dipromosikan.
    status: display?.status ?? "Draft",
    version: display?.version ?? 0,
    activeVersion: approved ? toVersionSummary(approved) : null,
    latestVersion: latest ? toVersionSummary(latest) : null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function assertCategoryExists(
  db: ReturnType<typeof getDb>["db"],
  categoryId: string | null | undefined,
): Promise<void> {
  if (!categoryId) return;

  const rows = await db
    .select({ id: handbookCategories.id })
    .from(handbookCategories)
    .where(eq(handbookCategories.id, categoryId))
    .limit(1);

  if (!rows[0]) {
    throw new AppError(404, "NOT_FOUND", "Kategori handbook tidak ditemukan.");
  }
}

export function registerHandbookRoutes(app: FastifyInstance): void {
  app.get("/api/handbook/categories", async () => {
    const { db } = getDb();
    const rows = await db
      .select()
      .from(handbookCategories)
      .orderBy(asc(handbookCategories.sortOrder), asc(handbookCategories.name));

    return {
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
    };
  });

  app.get("/api/handbook/items", async (request) => {
    const query = listItemsQuerySchema.parse(request.query);
    const { db } = getDb();
    const filters: SQL[] = [];

    if (query.categoryId) {
      filters.push(eq(handbookItems.categoryId, query.categoryId));
    }

    const term = query.q ? sanitizeSearchTerm(query.q) : "";
    if (term) {
      const pattern = `%${term}%`;
      const match = or(
        ilike(handbookItems.title, pattern),
        ilike(handbookItems.summary, pattern),
      );
      if (match) {
        filters.push(match);
      }
    }

    const items = await db
      .select()
      .from(handbookItems)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(asc(handbookItems.createdAt));

    const versionsByItem = new Map<string, VersionRow[]>();
    if (items.length > 0) {
      const versions = await db
        .select()
        .from(handbookItemVersions)
        .where(
          inArray(
            handbookItemVersions.handbookItemId,
            items.map((item) => item.id),
          ),
        )
        .orderBy(asc(handbookItemVersions.version));

      for (const version of versions) {
        const list = versionsByItem.get(version.handbookItemId) ?? [];
        list.push(version);
        versionsByItem.set(version.handbookItemId, list);
      }
    }

    const data = items
      .map((item) => toItemSummary(item, versionsByItem.get(item.id) ?? []))
      .filter((item) => !query.status || item.status === query.status);

    return { data };
  });

  app.get("/api/handbook/items/:id", async (request) => {
    const params = idParamSchema.parse(request.params);
    const { db } = getDb();

    const itemRows = await db
      .select()
      .from(handbookItems)
      .where(eq(handbookItems.id, params.id))
      .limit(1);

    const item = itemRows[0];
    if (!item) {
      throw new AppError(404, "NOT_FOUND", "Item handbook tidak ditemukan.");
    }

    const versions = await db
      .select()
      .from(handbookItemVersions)
      .where(eq(handbookItemVersions.handbookItemId, item.id))
      .orderBy(asc(handbookItemVersions.version));

    const { approved, latest } = resolveVersions(versions);
    const display = approved ?? latest;

    return {
      data: {
        id: item.id,
        categoryId: item.categoryId,
        title: item.title,
        summary: item.summary,
        status: display?.status ?? "Draft",
        version: display?.version ?? 0,
        activeVersion: approved ? toVersion(approved) : null,
        latestVersion: latest ? toVersionSummary(latest) : null,
        versions: versions.map(toVersion),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    };
  });

  app.post("/api/handbook/items", async (request, reply) => {
    const body = createItemBodySchema.parse(request.body);
    const { db } = getDb();
    await assertCategoryExists(db, body.categoryId);

    const result = await db.transaction(async (tx) => {
      const itemRows = await tx
        .insert(handbookItems)
        .values({
          categoryId: body.categoryId,
          title: body.title,
          summary: body.summary,
          createdAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .returning();

      const item = itemRows[0];

      const versionRows = await tx
        .insert(handbookItemVersions)
        .values({
          handbookItemId: item.id,
          version: 1,
          status: "Draft",
          contentJson: body.contentJson,
          changeNote: body.changeNote,
          createdAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .returning();

      return { item, version: versionRows[0] };
    });

    reply.status(201);
    return {
      data: {
        id: result.item.id,
        categoryId: result.item.categoryId,
        title: result.item.title,
        summary: result.item.summary,
        createdAt: result.item.createdAt,
        updatedAt: result.item.updatedAt,
        initialVersion: toVersion(result.version),
      },
    };
  });

  app.patch("/api/handbook/items/:id", async (request) => {
    const params = idParamSchema.parse(request.params);
    const body = updateItemBodySchema.parse(request.body);
    const { db } = getDb();
    await assertCategoryExists(db, body.categoryId);

    const updates: Record<string, unknown> = {
      updatedAt: sql`now()`,
    };
    if (body.title !== undefined) updates.title = body.title;
    if (body.summary !== undefined) updates.summary = body.summary;
    if (body.categoryId !== undefined) updates.categoryId = body.categoryId;

    const rows = await db
      .update(handbookItems)
      .set(updates)
      .where(eq(handbookItems.id, params.id))
      .returning({
        id: handbookItems.id,
        categoryId: handbookItems.categoryId,
        title: handbookItems.title,
        summary: handbookItems.summary,
        createdAt: handbookItems.createdAt,
        updatedAt: handbookItems.updatedAt,
      });

    const updated = rows[0];
    if (!updated) {
      throw new AppError(404, "NOT_FOUND", "Item handbook tidak ditemukan.");
    }

    return { data: updated };
  });

  app.get("/api/handbook/items/:id/versions", async (request) => {
    const params = idParamSchema.parse(request.params);
    const { db } = getDb();

    const itemRows = await db
      .select({ id: handbookItems.id })
      .from(handbookItems)
      .where(eq(handbookItems.id, params.id))
      .limit(1);
    if (!itemRows[0]) {
      throw new AppError(404, "NOT_FOUND", "Item handbook tidak ditemukan.");
    }

    const versions = await db
      .select()
      .from(handbookItemVersions)
      .where(eq(handbookItemVersions.handbookItemId, params.id))
      .orderBy(desc(handbookItemVersions.version));

    return { data: versions.map(toVersion) };
  });

  app.post("/api/handbook/items/:id/versions", async (request, reply) => {
    const params = idParamSchema.parse(request.params);
    const body = createVersionBodySchema.parse(request.body);
    const { db } = getDb();

    const version = await db.transaction(async (tx) => {
      // Kunci baris item agar penomoran versi tetap monoton bila ada dua request bersamaan.
      const itemRows = await tx
        .select({ id: handbookItems.id })
        .from(handbookItems)
        .where(eq(handbookItems.id, params.id))
        .limit(1)
        .for("update");
      if (!itemRows[0]) {
        throw new AppError(404, "NOT_FOUND", "Item handbook tidak ditemukan.");
      }

      const maxRows = await tx
        .select({ maxVersion: sql<number>`coalesce(max(${handbookItemVersions.version}), 0)` })
        .from(handbookItemVersions)
        .where(eq(handbookItemVersions.handbookItemId, params.id));

      const nextVersion = Number(maxRows[0]?.maxVersion ?? 0) + 1;

      const rows = await tx
        .insert(handbookItemVersions)
        .values({
          handbookItemId: params.id,
          version: nextVersion,
          status: "Draft",
          contentJson: body.contentJson,
          changeNote: body.changeNote,
          createdAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .returning();

      await tx
        .update(handbookItems)
        .set({ updatedAt: sql`now()` })
        .where(eq(handbookItems.id, params.id));

      return rows[0];
    });

    reply.status(201);
    return { data: toVersion(version) };
  });

  app.post("/api/handbook/items/:id/approve", async (request) => {
    const params = idParamSchema.parse(request.params);
    const body = approveVersionBodySchema.parse(request.body);
    const { db } = getDb();

    const approved = await db.transaction(async (tx) => {
      // Lock item menyerialkan approval; partial unique index di migrasi menjadi
      // backstop jika ada writer lain di luar endpoint ini.
      const itemRows = await tx
        .select({ id: handbookItems.id })
        .from(handbookItems)
        .where(eq(handbookItems.id, params.id))
        .limit(1)
        .for("update");
      if (!itemRows[0]) {
        throw new AppError(404, "NOT_FOUND", "Item handbook tidak ditemukan.");
      }

      const targetRows = await tx
        .select()
        .from(handbookItemVersions)
        .where(
          and(
            eq(handbookItemVersions.id, body.versionId),
            eq(handbookItemVersions.handbookItemId, params.id),
          ),
        )
        .limit(1);
      const target = targetRows[0];
      if (!target) {
        throw new AppError(404, "NOT_FOUND", "Versi handbook tidak ditemukan pada item ini.");
      }
      if (target.status !== "Draft") {
        throw new AppError(409, "CONFLICT", "Hanya versi Draft yang dapat disetujui.");
      }

      // Turunkan standar lama lebih dulu agar partial unique index tidak bentrok.
      await tx
        .update(handbookItemVersions)
        .set({ status: "Deprecated", updatedAt: sql`now()` })
        .where(
          and(
            eq(handbookItemVersions.handbookItemId, params.id),
            eq(handbookItemVersions.status, "Approved"),
            sql`${handbookItemVersions.id} <> ${body.versionId}`,
          ),
        );

      const rows = await tx
        .update(handbookItemVersions)
        .set({
          status: "Approved",
          approvedAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .where(eq(handbookItemVersions.id, body.versionId))
        .returning();

      await tx
        .update(handbookItems)
        .set({ updatedAt: sql`now()` })
        .where(eq(handbookItems.id, params.id));

      return rows[0];
    });

    return { data: toVersion(approved) };
  });
}
