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
  handbookP2Category: "00000000-0000-4000-8000-000000000010",
  handbookP2Item: "00000000-0000-4000-8000-000000000011",
  handbookP2Version: "00000000-0000-4000-8000-000000000012",
  project: "00000000-0000-4000-8000-000000000007",
  milestone: "00000000-0000-4000-8000-000000000008",
  task: "00000000-0000-4000-8000-000000000009",
  projectP3: "00000000-0000-4000-8000-000000000013",
  milestoneP3: "00000000-0000-4000-8000-000000000014",
  taskP3: "00000000-0000-4000-8000-000000000015",
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

  // P2.4: satu paket standar tahap engineering yang lengkap dan Approved.
  // ID baru + label [SEED-P2] menjaga seed lama tetap utuh dan membedakan
  // data contoh development dari standar produksi.
  await db.insert(handbookCategories).values({
    id: SEED_IDS.handbookP2Category,
    name: "[SEED-P2] Software Development Lifecycle",
    description: "Contoh kategori tahap engineering untuk development lokal. Bukan data produksi.",
    sortOrder: 2,
  }).onConflictDoNothing({ target: handbookCategories.id });

  await db.insert(handbookItems).values({
    id: SEED_IDS.handbookP2Item,
    categoryId: SEED_IDS.handbookP2Category,
    title: "[SEED-P2] Code Review & Merge Readiness",
    summary: "Paket standar untuk meninjau perubahan kode sebelum merge. Seed development, bukan standar produksi.",
  }).onConflictDoNothing({ target: handbookItems.id });

  await db.insert(handbookItemVersions).values({
    id: SEED_IDS.handbookP2Version,
    handbookItemId: SEED_IDS.handbookP2Item,
    version: 1,
    status: "Approved",
    contentJson: {
      purpose: [
        { type: "heading", level: 2, text: "Purpose" },
        { type: "paragraph", text: "Memastikan setiap perubahan kode memiliki konteks, ditinjau secara konsisten, dan siap digabung tanpa menurunkan kualitas sistem." },
      ],
      whenToUse: [
        { type: "heading", level: 2, text: "When to use" },
        { type: "paragraph", text: "Gunakan sebelum menggabungkan perubahan ke branch utama, termasuk perbaikan kecil dan perubahan Dokumentasi." },
      ],
      procedure: [
        { type: "heading", level: 2, text: "Procedure" },
        { type: "list", style: "ordered", text: "Pastikan deskripsi perubahan menjelaskan masalah, pendekatan, dan risiko." },
        { type: "list", style: "ordered", text: "Jalankan pemeriksaan otomatis dan lampirkan hasilnya pada permintaan tinjauan." },
        { type: "list", style: "ordered", text: "Tinjau diff, validasi perilaku, dan minta perbaikan bila ada dampak yang belum diuji." },
        { type: "list", style: "ordered", text: "Catat keputusan tinjauan pada checklist sebelum menyetujui penggabungan." },
      ],
      checklist: [
        { type: "heading", level: 2, text: "Checklist" },
        { type: "list", style: "unordered", text: "Perubahan memiliki tujuan dan cakupan yang jelas." },
        { type: "list", style: "unordered", text: "Pemeriksaan otomatis lulus atau pengecualian tercatat." },
        { type: "list", style: "unordered", text: "Tidak ada secret, token, atau data sensitif pada diff." },
        { type: "list", style: "unordered", text: "Rollback dapat dilakukan tanpa kehilangan data pengguna." },
      ],
      templates: [
        { type: "heading", level: 2, text: "Templates/prompts" },
        { type: "code", language: "markdown", text: "## Ringkasan perubahan\n- Masalah: ...\n- Pendekatan: ...\n- Risiko: ...\n- Bukti verifikasi: ..." },
        { type: "paragraph", text: "Prompt tinjauan: Tinjau diff ini untuk korrektness, keamanan, dan kemudahan pemeliharaan. Catatkan temuan prioritas tinggi terlebih dahulu." },
      ],
      deliverables: [
        { type: "heading", level: 2, text: "Deliverables" },
        { type: "list", style: "unordered", text: "Permintaan tinjauan yang lengkap dengan bukti verifikasi." },
        { type: "list", style: "unordered", text: "Checklist tinjauan yang ditandatangani oleh peninjau." },
        { type: "list", style: "unordered", text: "Keputusan merge atau permintaan perbaikan yang tercatat." },
      ],
      provenance: {
        labels: ["JASASAJA Supplement", "Indonesian Explanation"],
        sourceTitle: "JASASAJA Personal OS — Engineering Handbook (development seed)",
        retrievalDate: "2026-11-26",
        lastReviewedDate: "2026-11-26",
      },
    },
    changeNote: "[SEED-P2] Paket standar lengkap enam bagian untuk development lokal.",
    approvedAt: new Date(),
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

  // P3.4: satu paket project development yang mereferensikan standar
  // [SEED-P2] yang sudah Approved. ID baru dan label [SEED-P3] menjaga
  // seed lama tetap utuh dan menandakan data contoh, bukan data produksi.
  await db.insert(projects).values({
    id: SEED_IDS.projectP3,
    name: "[SEED-P3] Project Workspace",
    description: "Contoh project development lokal dengan referensi handbook. Bukan data produksi.",
    status: "Active",
  }).onConflictDoNothing({ target: projects.id });

  await db.insert(projectMilestones).values({
    id: SEED_IDS.milestoneP3,
    projectId: SEED_IDS.projectP3,
    title: "[SEED-P3] Review standar engineering",
    targetDate: new Date("2026-12-01T00:00:00.000Z"),
    status: "In Progress",
  }).onConflictDoNothing({ target: projectMilestones.id });

  await db.insert(projectTasks).values({
    id: SEED_IDS.taskP3,
    projectId: SEED_IDS.projectP3,
    milestoneId: SEED_IDS.milestoneP3,
    title: "[SEED-P3] Terapkan checklist code review",
    description: "Task contoh yang mereferensikan item handbook [SEED-P2] berstatus Approved.",
    status: "Todo",
    dueDate: new Date("2026-12-24T00:00:00.000Z"),
    handbookItemId: SEED_IDS.handbookP2Item,
  }).onConflictDoNothing({ target: projectTasks.id });

  // Verification read (no secrets)
  const counts = await Promise.all([
    db.select({ id: learningPaths.id }).from(learningPaths).where(eq(learningPaths.id, SEED_IDS.learningPath)),
    db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, SEED_IDS.lesson)),
    db.select({ id: handbookItems.id }).from(handbookItems).where(eq(handbookItems.id, SEED_IDS.handbookItem)),
    db.select({ id: handbookItems.id }).from(handbookItems).where(eq(handbookItems.id, SEED_IDS.handbookP2Item)),
    db.select({ id: handbookItemVersions.id }).from(handbookItemVersions).where(eq(handbookItemVersions.id, SEED_IDS.handbookP2Version)),
    db.select({ id: projects.id }).from(projects).where(eq(projects.id, SEED_IDS.project)),
    db.select({ id: projects.id }).from(projects).where(eq(projects.id, SEED_IDS.projectP3)),
    db.select({ id: projectMilestones.id }).from(projectMilestones).where(eq(projectMilestones.id, SEED_IDS.milestoneP3)),
    db.select({ id: projectTasks.id }).from(projectTasks).where(eq(projectTasks.id, SEED_IDS.taskP3)),
  ]);

  console.log("SEED_OK", {
    learningPath: counts[0].length,
    lesson: counts[1].length,
    handbookItem: counts[2].length,
    handbookP2Item: counts[3].length,
    handbookP2Version: counts[4].length,
    project: counts[5].length,
    projectP3: counts[6].length,
    milestoneP3: counts[7].length,
    taskP3: counts[8].length,
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
