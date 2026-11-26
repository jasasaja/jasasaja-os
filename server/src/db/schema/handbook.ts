import { integer, jsonb, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { contentStatusEnum, createdAtColumn, idColumn, localTimestamp, updatedAtColumn } from "./shared.ts";

export const handbookCategories = pgTable("handbook_categories", {
  id: idColumn(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const handbookItems = pgTable("handbook_items", {
  id: idColumn(),
  categoryId: uuid("category_id").references(() => handbookCategories.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  summary: text("summary"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const handbookItemVersions = pgTable(
  "handbook_item_versions",
  {
    id: idColumn(),
    handbookItemId: uuid("handbook_item_id")
      .notNull()
      .references(() => handbookItems.id, { onDelete: "restrict" }),
    version: integer("version").notNull(),
    status: contentStatusEnum("status").notNull().default("Draft"),
    // A1: structured JSON block content (Purpose, When to use, Procedure, Checklist, Templates/prompts, Deliverables, etc.)
    contentJson: jsonb("content_json").$type<Record<string, unknown>>().notNull(),
    changeNote: text("change_note"),
    approvedAt: localTimestamp("approved_at"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("handbook_item_versions_item_version_uidx").on(table.handbookItemId, table.version),
  ],
);
