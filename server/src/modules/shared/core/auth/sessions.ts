import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { getDb } from "../db.ts";
import { sessions } from "../../../../db/schema/index.ts";
import { generateCsrfToken, generateOpaqueToken, hashToken } from "./crypto.ts";
import { getAuthConfig } from "./config.ts";

export type SessionRecord = {
  id: string;
  csrfToken: string;
  ownerSubject: string;
  ownerEmail: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type CreatedSession = {
  sessionToken: string;
  csrfToken: string;
  expiresAt: Date;
};

export async function createSession(input: { ownerSubject: string; ownerEmail: string }): Promise<CreatedSession> {
  const { db } = getDb();
  const config = getAuthConfig();
  const sessionToken = generateOpaqueToken(32);
  const tokenHash = hashToken(sessionToken);
  const csrfToken = generateCsrfToken();
  const ttlHours = Math.max(1, Math.floor(config.sessionTtlHours));

  const rows = await db
    .insert(sessions)
    .values({
      tokenHash,
      csrfToken,
      ownerSubject: input.ownerSubject,
      ownerEmail: input.ownerEmail.toLowerCase(),
      // C2: use DB now() in Asia/Jakarta (PGTZ) for consistency
      expiresAt: sql`now() + make_interval(hours => ${ttlHours})`,
      updatedAt: sql`now()`,
      createdAt: sql`now()`,
    })
    .returning({ expiresAt: sessions.expiresAt });

  const expiresAt = rows[0]?.expiresAt ?? new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  return { sessionToken, csrfToken, expiresAt };
}

export async function findActiveSessionByToken(sessionToken: string): Promise<SessionRecord | null> {
  const { db } = getDb();
  const tokenHash = hashToken(sessionToken);
  const rows = await db
    .select({
      id: sessions.id,
      csrfToken: sessions.csrfToken,
      ownerSubject: sessions.ownerSubject,
      ownerEmail: sessions.ownerEmail,
      expiresAt: sessions.expiresAt,
      revokedAt: sessions.revokedAt,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, sql`now()`),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function revokeSessionByToken(sessionToken: string): Promise<void> {
  const { db } = getDb();
  const tokenHash = hashToken(sessionToken);
  await db
    .update(sessions)
    .set({ revokedAt: sql`now()`, updatedAt: sql`now()` })
    .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)));
}
