import { date, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./shared.ts";

export const projectStatusEnum = pgEnum("project_status", ["Planned", "Active", "Completed", "Archived"]);
export const milestoneStatusEnum = pgEnum("milestone_status", ["Planned", "In Progress", "Completed"]);
export const taskStatusEnum = pgEnum("task_status", ["Todo", "In Progress", "Done", "Blocked"]);

export const projects = pgTable("projects", {
  id: idColumn(),
  name: text("name").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").notNull().default("Planned"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const projectMilestones = pgTable("project_milestones", {
  id: idColumn(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  // C2: calendar date without time
  targetDate: date("target_date", { mode: "date" }),
  status: milestoneStatusEnum("status").notNull().default("Planned"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const projectTasks = pgTable("project_tasks", {
  id: idColumn(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "restrict" }),
  milestoneId: uuid("milestone_id").references(() => projectMilestones.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("Todo"),
  // C2: calendar date without time
  dueDate: date("due_date", { mode: "date" }),
  // Cross-module references by explicit ID (no FK across module boundary)
  handbookItemId: uuid("handbook_item_id"),
  lessonId: uuid("lesson_id"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
