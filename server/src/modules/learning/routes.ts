import type { FastifyInstance } from "fastify";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../shared/core/db.ts";
import { AppError } from "../shared/core/index.ts";
import { learningPaths, lessons } from "../../db/schema/index.ts";

const pathIdParamsSchema = z.object({
  id: z.string().uuid("Parameter id harus UUID yang valid."),
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
}
