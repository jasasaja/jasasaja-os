import assert from "node:assert/strict";
import test, { after, afterEach, before } from "node:test";
import Fastify, { type FastifyInstance } from "fastify";
import { registerApiErrorHandlers } from "../../app.ts";
import { registerLearningRoutes } from "./routes.ts";
import { assertDbMockDone, installDbMock, pushQuery, resetDbMock, teardownDbMock } from "../../test/db-mock.ts";

const PATH_ID = "aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa";
const LESSON_ID = "bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb";

function pathRow() {
  return [PATH_ID, "Path A", "Desc", new Date("2026-01-01T00:00:00.000Z"), new Date("2026-01-02T00:00:00.000Z")];
}

async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify();
  registerLearningRoutes(app);
  registerApiErrorHandlers(app);
  await app.ready();
  return app;
}

let app: FastifyInstance;

before(async () => {
  installDbMock();
  app = await buildTestApp();
});

afterEach(() => {
  assertDbMockDone();
  resetDbMock();
});

after(async () => {
  await app.close();
  await teardownDbMock();
});

test("GET /api/learning/paths returns list", async () => {
  pushQuery({ pattern: /from "learning_paths".*order by "learning_paths"\."created_at" asc/is, rows: [pathRow()] });
  const res = await app.inject({ method: "GET", url: "/api/learning/paths" });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().data[0].title, "Path A");
});

test("POST /api/learning/paths validates required title", async () => {
  const res = await app.inject({ method: "POST", url: "/api/learning/paths", payload: { title: "" } });
  assert.equal(res.statusCode, 400);
  assert.equal(res.json().error.code, "VALIDATION_ERROR");
});

test("POST /api/learning/paths creates path", async () => {
  pushQuery({ pattern: /insert into "learning_paths"/is, rows: [pathRow()] });
  const res = await app.inject({ method: "POST", url: "/api/learning/paths", payload: { title: "Path A" } });
  assert.equal(res.statusCode, 201);
  assert.equal(res.json().data.id, PATH_ID);
});

test("GET /api/learning/lessons/:id returns 404 when missing", async () => {
  pushQuery({ pattern: /from "lessons".*where "lessons"\."id" = \$1 limit \$2/is, rows: [] });
  const res = await app.inject({ method: "GET", url: `/api/learning/lessons/${LESSON_ID}` });
  assert.equal(res.statusCode, 404);
  assert.equal(res.json().error.code, "NOT_FOUND");
});

test("GET /api/learning/lessons/:id/progress returns default when no row", async () => {
  pushQuery({ pattern: /select "id" from "lessons" where "lessons"\."id" = \$1 limit \$2/is, rows: [[LESSON_ID]] });
  pushQuery({ pattern: /from "lesson_progress" where "lesson_progress"\."lesson_id" = \$1 limit \$2/is, rows: [] });
  const res = await app.inject({ method: "GET", url: `/api/learning/lessons/${LESSON_ID}/progress` });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json().data, {
    id: null,
    lessonId: LESSON_ID,
    status: "Not Started",
    masteredAt: null,
    createdAt: null,
    updatedAt: null,
  });
});
