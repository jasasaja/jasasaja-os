import type { FastifyInstance } from "fastify";
import { eq, asc, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../shared/core/db.ts";
import { AppError } from "../shared/core/index.ts";
import { learningPaths, lessons } from "../../db/schema/index.ts";

const pathIdParamsSchema = z.object({
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
}
