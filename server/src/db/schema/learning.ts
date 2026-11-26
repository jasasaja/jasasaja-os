import { integer, jsonb, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { contentStatusEnum, createdAtColumn, idColumn, lessonProgressStatusEnum, localTimestamp, updatedAtColumn } from "./shared.ts";

export const learningPaths = pgTable("learning_paths", {
  id: idColumn(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const lessons = pgTable("lessons", {
  id: idColumn(),
  learningPathId: uuid("learning_path_id").references(() => learningPaths.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  summary: text("summary"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const lessonVersions = pgTable(
  "lesson_versions",
  {
    id: idColumn(),
    lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "restrict" }),
    version: integer("version").notNull(),
    status: contentStatusEnum("status").notNull().default("Draft"),
    contentJson: jsonb("content_json").$type<Record<string, unknown>>().notNull(),
    changeNote: text("change_note"),
    approvedAt: localTimestamp("approved_at"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("lesson_versions_lesson_version_uidx").on(table.lessonId, table.version),
  ],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: idColumn(),
    lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "restrict" }),
    status: lessonProgressStatusEnum("status").notNull().default("Not Started"),
    masteredAt: localTimestamp("mastered_at"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("lesson_progress_lesson_uidx").on(table.lessonId),
  ],
);
