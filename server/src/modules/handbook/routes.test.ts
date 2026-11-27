import assert from "node:assert/strict";
import test, { after, afterEach, before } from "node:test";
import Fastify, { type FastifyInstance } from "fastify";
import { registerApiErrorHandlers } from "../../app.ts";
import { registerHandbookRoutes } from "./routes.ts";
import { assertDbMockDone, installDbMock, pushQuery, resetDbMock, teardownDbMock } from "../../test/db-mock.ts";

const CAT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ITEM_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const VERSION_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const HANDBOOK_CONTENT = {
  purpose: [],
  whenToUse: [],
  procedure: [{ type: "paragraph", text: "Langkah" }],
  checklist: [],
  templates: [],
  deliverables: [],
  provenance: { labels: ["JASASAJA Supplement"] },
};

function categoryRow() {
  return [CAT_ID, "Kategori", "Desc", 1, new Date("2026-01-01T00:00:00.000Z"), new Date("2026-01-02T00:00:00.000Z")];
}

function itemRow() {
  return [ITEM_ID, CAT_ID, "Item A", "Summary", new Date("2026-01-01T00:00:00.000Z"), new Date("2026-01-02T00:00:00.000Z")];
}

function versionRow(overrides?: Partial<Record<number, unknown>>) {
  const row = [
    VERSION_ID,
    ITEM_ID,
    1,
    "Draft",
    HANDBOOK_CONTENT,
    null,
    null,
    new Date("2026-01-01T00:00:00.000Z"),
    new Date("2026-01-02T00:00:00.000Z"),
  ];
  if (overrides) for (const [k, v] of Object.entries(overrides)) row[Number(k)] = v as never;
  return row;
}

async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify();
  registerHandbookRoutes(app);
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

test("GET /api/handbook/categories returns categories", async () => {
  pushQuery({ pattern: /from "handbook_categories".*order by/is, rows: [categoryRow()] });
  const res = await app.inject({ method: "GET", url: "/api/handbook/categories" });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().data[0].name, "Kategori");
});

test("POST /api/handbook/items rejects invalid content shape", async () => {
  const res = await app.inject({
    method: "POST",
    url: "/api/handbook/items",
    payload: {
      title: "Item",
      contentJson: { purpose: [] }, // missing required sections
    },
  });
  assert.equal(res.statusCode, 400);
  assert.equal(res.json().error.code, "VALIDATION_ERROR");
});

test("POST /api/handbook/items creates draft v1 in transaction", async () => {
  pushQuery({
    pattern: /select "id" from "handbook_categories" where "handbook_categories"\."id" = \$1 limit \$2/is,
    rows: [[CAT_ID]],
  });
  pushQuery({ pattern: /insert into "handbook_items"/is, rows: [itemRow()] });
  pushQuery({ pattern: /insert into "handbook_item_versions"/is, rows: [versionRow()] });

  const res = await app.inject({
    method: "POST",
    url: "/api/handbook/items",
    payload: { categoryId: CAT_ID, title: "Item A", summary: "Summary", contentJson: HANDBOOK_CONTENT },
  });
  assert.equal(res.statusCode, 201);
  const body = res.json();
  assert.equal(body.data.initialVersion.version, 1);
  assert.equal(body.data.initialVersion.status, "Draft");
});

test("POST /api/handbook/items/:id/approve rejects non-draft target", async () => {
  pushQuery({ pattern: /select "id" from "handbook_items" where "handbook_items"\."id" = \$1 limit \$2 for update/is, rows: [[ITEM_ID]] });
  pushQuery({
    pattern: /select .*from "handbook_item_versions" where .*"handbook_item_versions"\."id" = \$1.*limit \$3/is,
    rows: [versionRow({ 3: "Approved", 6: new Date("2026-01-03T00:00:00.000Z") })],
  });

  const res = await app.inject({
    method: "POST",
    url: `/api/handbook/items/${ITEM_ID}/approve`,
    payload: { versionId: VERSION_ID },
  });
  assert.equal(res.statusCode, 409);
  assert.equal(res.json().error.code, "CONFLICT");
});
