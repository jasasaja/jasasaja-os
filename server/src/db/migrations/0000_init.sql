CREATE TYPE "public"."content_status" AS ENUM('Draft', 'Approved', 'Deprecated');--> statement-breakpoint
CREATE TYPE "public"."lesson_progress_status" AS ENUM('Not Started', 'In Progress', 'Completed', 'Mastered');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('Planned', 'In Progress', 'Completed');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('Planned', 'Active', 'Completed', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('Todo', 'In Progress', 'Done', 'Blocked');--> statement-breakpoint
CREATE TABLE "learning_paths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"status" "lesson_progress_status" DEFAULT 'Not Started' NOT NULL,
	"mastered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" "content_status" DEFAULT 'Draft' NOT NULL,
	"content_json" jsonb NOT NULL,
	"change_note" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learning_path_id" uuid,
	"title" text NOT NULL,
	"summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "handbook_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "handbook_item_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"handbook_item_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" "content_status" DEFAULT 'Draft' NOT NULL,
	"content_json" jsonb NOT NULL,
	"change_note" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "handbook_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"title" text NOT NULL,
	"summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"target_date" date,
	"status" "milestone_status" DEFAULT 'Planned' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"milestone_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'Todo' NOT NULL,
	"due_date" date,
	"handbook_item_id" uuid,
	"lesson_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'Planned' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_versions" ADD CONSTRAINT "lesson_versions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_learning_path_id_learning_paths_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handbook_item_versions" ADD CONSTRAINT "handbook_item_versions_handbook_item_id_handbook_items_id_fk" FOREIGN KEY ("handbook_item_id") REFERENCES "public"."handbook_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handbook_items" ADD CONSTRAINT "handbook_items_category_id_handbook_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."handbook_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_milestone_id_project_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."project_milestones"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_progress_lesson_uidx" ON "lesson_progress" USING btree ("lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_versions_lesson_version_uidx" ON "lesson_versions" USING btree ("lesson_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "handbook_item_versions_item_version_uidx" ON "handbook_item_versions" USING btree ("handbook_item_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_versions_one_approved_uidx" ON "lesson_versions" USING btree ("lesson_id") WHERE "status" = 'Approved';--> statement-breakpoint
CREATE UNIQUE INDEX "handbook_item_versions_one_approved_uidx" ON "handbook_item_versions" USING btree ("handbook_item_id") WHERE "status" = 'Approved';