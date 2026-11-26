import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

// C2: timestamps stored as local Asia/Jakarta (timestamp without timezone).
export const localTimestamp = (name: string) =>
  timestamp(name, { withTimezone: false, mode: "date" });

export const idColumn = (name = "id") =>
  uuid(name).defaultRandom().primaryKey();

export const createdAtColumn = () => localTimestamp("created_at").notNull().defaultNow();
export const updatedAtColumn = () => localTimestamp("updated_at").notNull().defaultNow();

export const contentStatusEnum = pgEnum("content_status", ["Draft", "Approved", "Deprecated"]);
export const lessonProgressStatusEnum = pgEnum("lesson_progress_status", [
  "Not Started",
  "In Progress",
  "Completed",
  "Mastered",
]);

// OD-003 / Step 6: server-side sessions for single owner auth guard.
export const sessions = pgTable(
  "sessions",
  {
    id: idColumn(),
    tokenHash: text("token_hash").notNull(),
    csrfToken: text("csrf_token").notNull(),
    ownerSubject: text("owner_subject").notNull(),
    ownerEmail: text("owner_email").notNull(),
    expiresAt: localTimestamp("expires_at").notNull(),
    revokedAt: localTimestamp("revoked_at"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_uidx").on(table.tokenHash),
  ],
);
