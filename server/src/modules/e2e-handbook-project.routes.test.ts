import assert from "node:assert/strict";
import test, { after, afterEach, before } from "node:test";
import Fastify, { type FastifyInstance } from "fastify";
import { registerApiErrorHandlers } from "../app.ts";
import { registerHandbookRoutes } from "./handbook/routes.ts";
import { registerProjectRoutes } from "./projects/routes.ts";
import { assertDbMockDone, installDbMock, pushQuery, resetDbMock, teardownDbMock } from "../test/db-mock.ts";

const CAT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ITEM_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const VERSION_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const TASK_ID = "44444444-4444-4444-8444-444444444444";

const HANDBOOK_CONTENT = {
  purpose: [{ type: "paragraph", text: "Tujuan" }],
  whenToUse: [],
  procedure: [{ type: "paragraph", text: "Langkah" }],
  checklist: [],
  templates: [],
  deliverables: [],
  provenance: { labels: ["JASASAJA Supplement"] },
};

function handbookItemRow() {
  return [ITEM_ID, CAT_ID, "Item E2E", "Summary", new Date("2026-01-01T00:00:00.000Z"), new Date("2026-01-02T00:00:00.000Z")];
}

function handbookVersionRow(overrides?: Partial<Record<number, unknown>>) {
  const row = [
    VERSION_ID,
    ITEM_ID,
    1,
    "Draft",
    HANDBOOK_CONTENT,
    "initial",
    null,
    new Date("2026-01-01T00:00:00.000Z"),
    new Date("2026-01-02T00:00:00.000Z"),
  ];
  if (overrides) for (const [k, v] of Object.entries(overrides)) row[Number(k)] = v as never;
  return row;
}

function projectRow() {
  return [PROJECT_ID, "Project E2E", "Desc", "Planned", new Date("2026-01-01T00:00:00.000Z"), new Date("2026-01-02T00:00:00.000Z")];
}

function taskRow() {
  return [
    TASK_ID,
    PROJECT_ID,
    null,
    "Task E2E",
    null,
    "Todo",
    null,
    ITEM_ID,
    null,
    new Date("2026-01-01T00:00:00.000Z"),
    new Date("2026-01-02T00:00:00.000Z"),
  ];
}

async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify();
  registerHandbookRoutes(app);
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

test("continuous flow: handbook item -> approve -> project -> task with handbook ref -> project detail deep-link data", async () => {
  // 1) Create handbook item (category exists, insert item, insert draft v1)
  pushQuery({ pattern: /select "id" from "handbook_categories" where "handbook_categories"\."id" = \$1 limit \$2/is, rows: [[CAT_ID]] });
  pushQuery({ pattern: /insert into "handbook_items"/is, rows: [handbookItemRow()] });
  pushQuery({ pattern: /insert into "handbook_item_versions"/is, rows: [handbookVersionRow()] });
  const createdHandbook = await app.inject({
    method: "POST",
    url: "/api/handbook/items",
    payload: { categoryId: CAT_ID, title: "Item E2E", summary: "Summary", contentJson: HANDBOOK_CONTENT },
  });
  assert.equal(createdHandbook.statusCode, 201);
  assert.equal(createdHandbook.json().data.initialVersion.status, "Draft");

  // 2) Approve handbook version (select item for update, select target draft, deprecate old approved none, update approved, update item)
  pushQuery({ pattern: /select "id" from "handbook_items" where "handbook_items"\."id" = \$1 limit \$2 for update/is, rows: [[ITEM_ID]] });
  pushQuery({ pattern: /select .*from "handbook_item_versions" where .*"handbook_item_versions"\."id" = \$1.*"handbook_item_versions"\."handbook_item_id" = \$2.*limit \$3/is, rows: [handbookVersionRow()] });
  pushQuery({ pattern: /update "handbook_item_versions" set "status" = \$1, "updated_at" = now\(\) where .*"handbook_item_id" = \$2.*"status" = \$3.*<> \$4/is, rows: [] });
  pushQuery({
    pattern: /update "handbook_item_versions" set "status" = \$1, "approved_at" = now\(\), "updated_at" = now\(\) where "handbook_item_versions"\."id" = \$2 returning/is,
    rows: [handbookVersionRow({ 3: "Approved", 6: new Date("2026-01-03T00:00:00.000Z") })],
  });
  pushQuery({ pattern: /update "handbook_items" set "updated_at" = now\(\) where "handbook_items"\."id" = \$1/is, rows: [] });
  const approved = await app.inject({
    method: "POST",
    url: `/api/handbook/items/${ITEM_ID}/approve`,
    payload: { versionId: VERSION_ID },
  });
  assert.equal(approved.statusCode, 200);
  assert.equal(approved.json().data.status, "Approved");

  // 3) Create project
  pushQuery({ pattern: /insert into "projects"/is, rows: [projectRow()] });
  const createdProject = await app.inject({
    method: "POST",
    url: "/api/projects",
    payload: { name: "Project E2E", description: "Desc" },
  });
  assert.equal(createdProject.statusCode, 201);
  assert.equal(createdProject.json().data.id, PROJECT_ID);

  // 4) Create task referencing approved handbook item
  pushQuery({ pattern: /select "id" from "projects" where "projects"\."id" = \$1 limit \$2/is, rows: [[PROJECT_ID]] });
  pushQuery({ pattern: /select "id" from "handbook_items" where "handbook_items"\."id" = \$1 limit \$2/is, rows: [[ITEM_ID]] });
  pushQuery({ pattern: /insert into "project_tasks"/is, rows: [taskRow()] });
  pushQuery({ pattern: /select .*from "handbook_items" where "handbook_items"\."id" in/is, rows: [handbookItemRow()] });
  pushQuery({
    pattern: /select .*from "handbook_item_versions" where "handbook_item_versions"\."handbook_item_id" in/is,
    rows: [handbookVersionRow({ 3: "Approved", 6: new Date("2026-01-03T00:00:00.000Z") })],
  });
  const createdTask = await app.inject({
    method: "POST",
    url: `/api/projects/${PROJECT_ID}/tasks`,
    payload: { title: "Task E2E", handbookItemId: ITEM_ID },
  });
  assert.equal(createdTask.statusCode, 201);
  assert.equal(createdTask.json().data.handbookItemId, ITEM_ID);
  assert.equal(createdTask.json().data.handbookItem.hasApprovedVersion, true);
  assert.equal(createdTask.json().data.handbookItem.status, "Approved");

  // 5) Read project detail - includes task and handbook deep-link data
  pushQuery({ pattern: /select .*from "projects" where "projects"\."id" = \$1 limit \$2/is, rows: [projectRow()] });
  pushQuery({ pattern: /select .*from "project_milestones" where "project_milestones"\."project_id" = \$1 order by/is, rows: [] });
  pushQuery({ pattern: /select .*from "project_tasks" where "project_tasks"\."project_id" = \$1 order by/is, rows: [taskRow()] });
  pushQuery({ pattern: /select .*from "handbook_items" where "handbook_items"\."id" in/is, rows: [handbookItemRow()] });
  pushQuery({
    pattern: /select .*from "handbook_item_versions" where "handbook_item_versions"\."handbook_item_id" in/is,
    rows: [handbookVersionRow({ 3: "Approved", 6: new Date("2026-01-03T00:00:00.000Z") })],
  });
  const detail = await app.inject({ method: "GET", url: `/api/projects/${PROJECT_ID}` });
  assert.equal(detail.statusCode, 200);
  const body = detail.json();
  assert.equal(body.data.tasks.length, 1);
  assert.equal(body.data.tasks[0].handbookItem.id, ITEM_ID);
  assert.equal(body.data.tasks[0].handbookItem.status, "Approved");
  assert.equal(body.data.tasks[0].handbookItem.hasApprovedVersion, true);
  // Deep-link target for UI: /handbook?item=<id>
  assert.equal(body.data.tasks[0].handbookItemId, ITEM_ID);
});
