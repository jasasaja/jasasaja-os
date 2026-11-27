import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test, { after, before } from "node:test";
import pg from "pg";
import Fastify, { type FastifyInstance } from "fastify";
import { registerApiErrorHandlers } from "../app.ts";
import { closeDb } from "./shared/core/db.ts";
import { authGuard } from "./shared/core/auth/guard.ts";
import { createSession } from "./shared/core/auth/sessions.ts";
import { registerHandbookRoutes } from "./handbook/routes.ts";
import { registerProjectRoutes } from "./projects/routes.ts";

const { Client } = pg;

const ADMIN_DB_URL =
  process.env.IT_ADMIN_DATABASE_URL?.trim() ||
  "postgresql://jasasaja:jasasaja_dev_local@localhost:5433/postgres";
const SCRATCH_DB_NAME = process.env.IT_SCRATCH_DB_NAME?.trim() || "jasasaja_os_integration_test";
const APP_ORIGIN = "http://localhost:3000";

function scratchDbUrl(): string {
  const u = new URL(ADMIN_DB_URL);
  u.pathname = `/${SCRATCH_DB_NAME}`;
  return u.toString();
}

async function canConnect(): Promise<boolean> {
  const client = new Client({ connectionString: ADMIN_DB_URL, connectionTimeoutMillis: 2000 });
  try {
    await client.connect();
    await client.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

async function adminQuery(sql: string, params?: unknown[]) {
  const client = new Client({ connectionString: ADMIN_DB_URL });
  await client.connect();
  try {
    return await client.query(sql, params);
  } finally {
    await client.end();
  }
}

async function recreateScratchDb(): Promise<void> {
  // terminate connections then drop/create
  await adminQuery(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [SCRATCH_DB_NAME],
  );
  await adminQuery(`DROP DATABASE IF EXISTS "${SCRATCH_DB_NAME}"`);
  await adminQuery(`CREATE DATABASE "${SCRATCH_DB_NAME}"`);
}

async function dropScratchDb(): Promise<void> {
  await adminQuery(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [SCRATCH_DB_NAME],
  );
  await adminQuery(`DROP DATABASE IF EXISTS "${SCRATCH_DB_NAME}"`);
}

async function applyMigrations(): Promise<void> {
  const migrationsDir = path.resolve(process.cwd(), "server/src/db/migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const client = new Client({ connectionString: scratchDbUrl() });
  await client.connect();
  try {
    for (const file of files) {
      const raw = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      const statements = raw
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const stmt of statements) {
        await client.query(stmt);
      }
    }
  } finally {
    await client.end();
  }
}

async function insertCategory(name: string): Promise<string> {
  const client = new Client({ connectionString: scratchDbUrl() });
  await client.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO handbook_categories (name, sort_order) VALUES ($1, 0) RETURNING id`,
      [name],
    );
    return rows[0].id as string;
  } finally {
    await client.end();
  }
}

const HANDBOOK_CONTENT = {
  purpose: [{ type: "paragraph", text: "Tujuan" }],
  whenToUse: [],
  procedure: [{ type: "paragraph", text: "Langkah" }],
  checklist: [],
  templates: [],
  deliverables: [],
  provenance: { labels: ["JASASAJA Supplement"] },
};

type SessionInfo = { cookie: string; csrfToken: string };

async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify();
  app.addHook("preHandler", authGuard);
  registerHandbookRoutes(app);
  registerProjectRoutes(app);
  registerApiErrorHandlers(app);
  await app.ready();
  return app;
}

const dbReady = await canConnect();

if (!dbReady) {
  test("DB integration (handbook+project) - skipped (postgres unavailable)", { skip: "postgres unavailable at IT_ADMIN_DATABASE_URL/default" }, () => {});
} else {
  let app: FastifyInstance;
  let session: SessionInfo;
  const savedEnv: Record<string, string | undefined> = {};

  before(async () => {
    for (const k of ["DATABASE_URL", "APP_BASE_URL", "SESSION_COOKIE_NAME", "SESSION_COOKIE_SECURE", "ALLOWED_ORIGINS"]) {
      savedEnv[k] = process.env[k];
    }
    process.env.APP_BASE_URL = APP_ORIGIN;
    process.env.SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME?.trim() || "jasasaja_session";
    process.env.SESSION_COOKIE_SECURE = "false";
    process.env.ALLOWED_ORIGINS = APP_ORIGIN;

    await closeDb();
    await recreateScratchDb();
    await applyMigrations();

    process.env.DATABASE_URL = scratchDbUrl();
    await closeDb(); // ensure getDb() uses new URL

    app = await buildTestApp();

    const created = await createSession({ ownerSubject: "it-owner", ownerEmail: "owner@example.com" });
    session = {
      cookie: `${process.env.SESSION_COOKIE_NAME}=${created.sessionToken}`,
      csrfToken: created.csrfToken,
    };
  });

  after(async () => {
    if (app) await app.close();
    await closeDb();
    await dropScratchDb().catch(() => {});
    for (const [k, v] of Object.entries(savedEnv)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  function authHeaders(extra?: Record<string, string>) {
    return {
      cookie: session.cookie,
      origin: APP_ORIGIN,
      "content-type": "application/json",
      "x-csrf-token": session.csrfToken,
      ...extra,
    };
  }

  test("real DB: handbook create -> approve enforces partial unique approved index", async () => {
    const categoryId = await insertCategory("IT Cat");

    // create item (draft v1)
    const createRes = await app.inject({
      method: "POST",
      url: "/api/handbook/items",
      headers: authHeaders(),
      payload: { categoryId, title: "IT Handbook", summary: "s", contentJson: HANDBOOK_CONTENT },
    });
    assert.equal(createRes.statusCode, 201);
    const itemId = createRes.json().data.id;
    const v1Id = createRes.json().data.initialVersion.id;
    assert.equal(createRes.json().data.initialVersion.status, "Draft");

    // approve v1
    const approveRes = await app.inject({
      method: "POST",
      url: `/api/handbook/items/${itemId}/approve`,
      headers: authHeaders(),
      payload: { versionId: v1Id },
    });
    assert.equal(approveRes.statusCode, 200);
    assert.equal(approveRes.json().data.status, "Approved");

    // create v2 draft
    const v2Res = await app.inject({
      method: "POST",
      url: `/api/handbook/items/${itemId}/versions`,
      headers: authHeaders(),
      payload: { contentJson: { ...HANDBOOK_CONTENT, purpose: [{ type: "paragraph", text: "v2" }] }, changeNote: "v2" },
    });
    assert.equal(v2Res.statusCode, 201);
    const v2Id = v2Res.json().data.id;

    // approve v2 - should deprecate v1, keep single approved
    const approveV2 = await app.inject({
      method: "POST",
      url: `/api/handbook/items/${itemId}/approve`,
      headers: authHeaders(),
      payload: { versionId: v2Id },
    });
    assert.equal(approveV2.statusCode, 200);

    // verify DB: only one approved version for item
    const client = new Client({ connectionString: scratchDbUrl() });
    await client.connect();
    try {
      const { rows } = await client.query(
        `SELECT status, COUNT(*)::int AS c FROM handbook_item_versions WHERE handbook_item_id=$1 GROUP BY status ORDER BY status`,
        [itemId],
      );
      const byStatus = Object.fromEntries(rows.map((r: any) => [r.status, r.c]));
      assert.equal(byStatus.Approved, 1);
      assert.equal(byStatus.Deprecated, 1);
    } finally {
      await client.end();
    }
  });

  test("real DB: project -> milestone -> task with handbook ref, ownership and FK checks", async () => {
    // create handbook item to reference
    const catId = await insertCategory("Cat2");
    const item = await app.inject({
      method: "POST",
      url: "/api/handbook/items",
      headers: authHeaders(),
      payload: { categoryId: catId, title: "Ref Item", contentJson: HANDBOOK_CONTENT },
    });
    const itemId = item.json().data.id;
    const versionId = item.json().data.initialVersion.id;
    await app.inject({ method: "POST", url: `/api/handbook/items/${itemId}/approve`, headers: authHeaders(), payload: { versionId } });

    // create project
    const projRes = await app.inject({
      method: "POST",
      url: "/api/projects",
      headers: authHeaders(),
      payload: { name: "IT Project", description: "desc" },
    });
    assert.equal(projRes.statusCode, 201);
    const projectId = projRes.json().data.id;

    // create milestone
    const msRes = await app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/milestones`,
      headers: authHeaders(),
      payload: { title: "MS1", status: "Planned" },
    });
    assert.equal(msRes.statusCode, 201);
    const milestoneId = msRes.json().data.id;

    // create task with handbook ref
    const taskRes = await app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/tasks`,
      headers: authHeaders(),
      payload: { title: "Task 1", milestoneId, handbookItemId: itemId },
    });
    assert.equal(taskRes.statusCode, 201);
    assert.equal(taskRes.json().data.handbookItemId, itemId);
    assert.equal(taskRes.json().data.handbookItem?.status, "Approved");

    // invalid handbook ref should fail with NOT_FOUND
    const badRef = await app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/tasks`,
      headers: authHeaders(),
      payload: { title: "Bad ref", handbookItemId: "00000000-0000-4000-8000-000000000099" },
    });
    assert.equal(badRef.statusCode, 404);
    assert.equal(badRef.json().error.code, "NOT_FOUND");

    // milestone ownership: create another project and try to use foreign milestone
    const proj2 = await app.inject({ method: "POST", url: "/api/projects", headers: authHeaders(), payload: { name: "P2" } });
    const project2Id = proj2.json().data.id;
    const cross = await app.inject({
      method: "POST",
      url: `/api/projects/${project2Id}/tasks`,
      headers: authHeaders(),
      payload: { title: "Cross", milestoneId },
    });
    assert.equal(cross.statusCode, 404);

    // project detail includes resolved handbook
    const detail = await app.inject({ method: "GET", url: `/api/projects/${projectId}`, headers: { cookie: session.cookie } });
    assert.equal(detail.statusCode, 200);
    const body = detail.json();
    assert.equal(body.data.tasks.length, 1);
    assert.equal(body.data.tasks[0].handbookItem.id, itemId);
    assert.equal(body.data.tasks[0].handbookItem.hasApprovedVersion, true);
  });

  test("real DB: auth guard rejects mutation without CSRF", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/projects",
      headers: { cookie: session.cookie, origin: APP_ORIGIN, "content-type": "application/json" },
      payload: { name: "No CSRF" },
    });
    assert.equal(res.statusCode, 403);
  });
}
