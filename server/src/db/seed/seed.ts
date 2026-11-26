import { eq } from "drizzle-orm";
import { closeDb, getDb } from "../../modules/shared/core/db.ts";
import {
  handbookCategories,
  handbookItemVersions,
  handbookItems,
  learningPaths,
  lessonVersions,
  lessons,
  projectMilestones,
  projectTasks,
  projects,
} from "../schema/index.ts";

const SEED_IDS = {
  learningPath: "00000000-0000-4000-8000-000000000001",
  lesson: "00000000-0000-4000-8000-000000000002",
  lessonVersion: "00000000-0000-4000-8000-000000000003",
  handbookCategory: "00000000-0000-4000-8000-000000000004",
  handbookItem: "00000000-0000-4000-8000-000000000005",
  handbookItemVersion: "00000000-0000-4000-8000-000000000006",
  project: "00000000-0000-4000-8000-000000000007",
  milestone: "00000000-0000-4000-8000-000000000008",
  task: "00000000-0000-4000-8000-000000000009",
} as const;

async function seed() {
  const { db } = getDb();

  await db.insert(learningPaths).values({
    id: SEED_IDS.learningPath,
    title: "[SEED] Dasar TypeScript",
    description: "Contoh learning path untuk development lokal. Bukan data produksi.",
  }).onConflictDoNothing({ target: learningPaths.id });

  await db.insert(lessons).values({
    id: SEED_IDS.lesson,
    learningPathId: SEED_IDS.learningPath,
    title: "[SEED] Pengenalan TypeScript",
    summary: "Contoh lesson untuk verifikasi schema.",
  }).onConflictDoNothing({ target: lessons.id });

  await db.insert(lessonVersions).values({
    id: SEED_IDS.lessonVersion,
    lessonId: SEED_IDS.lesson,
    version: 1,
    status: "Draft",
    contentJson: {
      type: "doc",
      blocks: [
        { type: "heading", level: 1, text: "Pengenalan TypeScript" },
        { type: "paragraph", text: "Ini contoh konten JSON block (A1). Bukan data produksi." },
      ],
    },
    changeNote: "Seed awal development",
  }).onConflictDoNothing({ target: lessonVersions.id });

  await db.insert(handbookCategories).values({
    id: SEED_IDS.handbookCategory,
    name: "[SEED] Engineering Dasar",
    description: "Contoh kategori handbook untuk development lokal.",
    sortOrder: 1,
  }).onConflictDoNothing({ target: handbookCategories.id });

  await db.insert(handbookItems).values({
    id: SEED_IDS.handbookItem,
    categoryId: SEED_IDS.handbookCategory,
    title: "[SEED] Definition of Done",
    summary: "Contoh item handbook.",
  }).onConflictDoNothing({ target: handbookItems.id });

  await db.insert(handbookItemVersions).values({
    id: SEED_IDS.handbookItemVersion,
    handbookItemId: SEED_IDS.handbookItem,
    version: 1,
    status: "Draft",
    contentJson: {
      type: "doc",
      blocks: [
        { type: "heading", level: 1, text: "Definition of Done" },
        { type: "paragraph", text: "Contoh konten handbook JSON block (A1)." },
      ],
    },
    changeNote: "Seed awal development",
  }).onConflictDoNothing({ target: handbookItemVersions.id });

  await db.insert(projects).values({
    id: SEED_IDS.project,
    name: "[SEED] Proyek Contoh",
    description: "Contoh project untuk development lokal. Bukan data produksi.",
    status: "Planned",
  }).onConflictDoNothing({ target: projects.id });

  await db.insert(projectMilestones).values({
    id: SEED_IDS.milestone,
    projectId: SEED_IDS.project,
    title: "[SEED] Milestone 1",
    status: "Planned",
  }).onConflictDoNothing({ target: projectMilestones.id });

  await db.insert(projectTasks).values({
    id: SEED_IDS.task,
    projectId: SEED_IDS.project,
    milestoneId: SEED_IDS.milestone,
    title: "[SEED] Task 1",
    description: "Contoh task development lokal.",
    status: "Todo",
  }).onConflictDoNothing({ target: projectTasks.id });

  // Verification read (no secrets)
  const counts = await Promise.all([
    db.select({ id: learningPaths.id }).from(learningPaths).where(eq(learningPaths.id, SEED_IDS.learningPath)),
    db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, SEED_IDS.lesson)),
    db.select({ id: handbookItems.id }).from(handbookItems).where(eq(handbookItems.id, SEED_IDS.handbookItem)),
    db.select({ id: projects.id }).from(projects).where(eq(projects.id, SEED_IDS.project)),
  ]);

  console.log("SEED_OK", {
    learningPath: counts[0].length,
    lesson: counts[1].length,
    handbookItem: counts[2].length,
    project: counts[3].length,
  });
}

seed()
  .catch((error) => {
    console.error("SEED_FAILED", { message: error instanceof Error ? error.message : String(error) });
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
