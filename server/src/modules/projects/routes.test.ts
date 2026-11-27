import assert from "node:assert/strict";
import test, { after, afterEach, before } from "node:test";
import Fastify, { type FastifyInstance } from "fastify";
import { registerApiErrorHandlers } from "../../app.ts";
import { registerProjectRoutes } from "./routes.ts";
import { assertDbMockDone, installDbMock, pushQuery, resetDbMock, teardownDbMock } from "../../test/db-mock.ts";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const PROJECT_ID_2 = "22222222-2222-4222-8222-222222222222";
const MILESTONE_ID = "33333333-3333-4333-8333-333333333333";
const TASK_ID = "44444444-4444-4444-8444-444444444444";
const HANDBOOK_ID = "55555555-5555-4555-8555-555555555555";

function projectRow(overrides?: Partial<Record<number, unknown>>) {
  const row = [
    PROJECT_ID,
    "Project Alpha",
    "Deskripsi",
    "Planned",
    new Date("2026-01-01T00:00:00.000Z"),
    new Date("2026-01-02T00:00:00.000Z"),
  ];
  if (overrides) for (const [k, v] of Object.entries(overrides)) row[Number(k)] = v as never;
  return row;
}

function taskRow(overrides?: Partial<Record<number, unknown>>) {
  const row = [
    TASK_ID,
    PROJECT_ID,
    MILESTONE_ID,
    "Task A",
    "Desc",
    "Todo",
    null,
    HANDBOOK_ID,
    null,
    new Date("2026-01-01T00:00:00.000Z"),
    new Date("2026-01-02T00:00:00.000Z"),
  ];
  if (overrides) for (const [k, v] of Object.entries(overrides)) row[Number(k)] = v as never;
  return row;
}

async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify();
  registerProjectRoutes(app);
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

test("GET /api/projects returns project summaries", async () => {
  pushQuery({ pattern: /from "projects".*order by "projects"\."created_at" asc/is, rows: [projectRow()] });
  pushQuery({ pattern: /select .*"project_id".*from "project_milestones"/is, rows: [[PROJECT_ID]] });
  pushQuery({ pattern: /select .*"project_id".*from "project_tasks"/is, rows: [[PROJECT_ID], [PROJECT_ID]] });

  const res = await app.inject({ method: "GET", url: "/api/projects" });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.data.length, 1);
  assert.deepEqual(body.data[0], {
    id: PROJECT_ID,
    name: "Project Alpha",
    description: "Deskripsi",
    status: "Planned",
    milestoneCount: 1,
    taskCount: 2,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  });
});

test("POST /api/projects validates body", async () => {
  const res = await app.inject({
    method: "POST",
    url: "/api/projects",
    payload: { name: "" },
  });
  assert.equal(res.statusCode, 400);
  assert.equal(res.json().error.code, "VALIDATION_ERROR");
});

test("POST /api/projects creates project with defaults", async () => {
  pushQuery({
    pattern: /insert into "projects"/is,
    rows: [projectRow()],
  });

  const res = await app.inject({
    method: "POST",
    url: "/api/projects",
    payload: { name: "Project Alpha", description: "Deskripsi" },
  });
  assert.equal(res.statusCode, 201);
  assert.equal(res.json().data.milestoneCount, 0);
  assert.equal(res.json().data.taskCount, 0);
  assert.equal(res.json().data.status, "Planned");
});

test("GET /api/projects/:projectId returns 404 when missing", async () => {
  pushQuery({
    pattern: /from "projects".*where "projects"\."id" = \$1 limit \$2/is,
    rows: [],
  });
  const res = await app.inject({ method: "GET", url: `/api/projects/${PROJECT_ID}` });
  assert.equal(res.statusCode, 404);
  assert.equal(res.json().error.code, "NOT_FOUND");
});

test("POST /api/projects/:projectId/milestones rejects invalid calendar date", async () => {
  const res = await app.inject({
    method: "POST",
    url: `/api/projects/${PROJECT_ID}/milestones`,
    payload: { title: "M1", targetDate: "2026-02-30" },
  });
  assert.equal(res.statusCode, 400);
  assert.equal(res.json().error.code, "VALIDATION_ERROR");
});

test("PATCH milestone returns 404 when milestone belongs to different project", async () => {
  pushQuery({ pattern: /select "id" from "projects" where "projects"\."id" = \$1 limit \$2/is, rows: [[PROJECT_ID_2]] });
  pushQuery({
    pattern: /select "id" from "project_milestones" where .*"project_milestones"\."project_id" = \$2/is,
    rows: [],
  });
  const res = await app.inject({
    method: "PATCH",
    url: `/api/projects/${PROJECT_ID_2}/milestones/${MILESTONE_ID}`,
    payload: { title: "Nope" },
  });
  assert.equal(res.statusCode, 404);
  assert.equal(res.json().error.code, "NOT_FOUND");
});

test("POST task rejects missing handbook reference", async () => {
  pushQuery({ pattern: /select "id" from "projects" where "projects"\."id" = \$1 limit \$2/is, rows: [[PROJECT_ID]] });
  pushQuery({ pattern: /select "id" from "handbook_items" where "handbook_items"\."id" = \$1 limit \$2/is, rows: [] });
  const res = await app.inject({
    method: "POST",
    url: `/api/projects/${PROJECT_ID}/tasks`,
    payload: { title: "Task", handbookItemId: HANDBOOK_ID },
  });
  assert.equal(res.statusCode, 404);
  assert.equal(res.json().error.code, "NOT_FOUND");
});

test("POST task stores lessonId as raw UUID without lookup", async () => {
  const lessonId = "66666666-6666-4666-8666-666666666666";
  pushQuery({ pattern: /select "id" from "projects" where "projects"\."id" = \$1 limit \$2/is, rows: [[PROJECT_ID]] });
  pushQuery({
    pattern: /insert into "project_tasks"/is,
    rows: [taskRow({ 7: null, 8: lessonId })],
  });
  const res = await app.inject({
    method: "POST",
    url: `/api/projects/${PROJECT_ID}/tasks`,
    payload: { title: "Task A", lessonId },
  });
  assert.equal(res.statusCode, 201);
  assert.equal(res.json().data.lessonId, lessonId);
  assert.equal(res.json().data.handbookItem, null);
});
