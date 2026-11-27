import pg from "pg";
import { mock } from "node:test";
import { closeDb } from "../modules/shared/core/db.ts";

type QueryConfig = {
  text?: string;
  name?: string;
  rowMode?: string;
  values?: unknown[];
};

export type QueryExpectation = {
  pattern: RegExp;
  rows?: unknown[];
  error?: Error;
};

const { Pool } = pg;

let queue: QueryExpectation[] = [];
let queryMock: { mock: { restore: () => void } } | undefined;
let connectMock: { mock: { restore: () => void } } | undefined;
let endMock: { mock: { restore: () => void } } | undefined;
let installed = false;

function normalizeText(config: string | QueryConfig): string {
  return typeof config === "string" ? config : (config.text ?? config.name ?? "");
}

function normalizeParams(config: string | QueryConfig, params?: unknown[]): unknown[] {
  if (Array.isArray(params)) return params;
  if (typeof config === "object" && Array.isArray(config.values)) return config.values;
  return [];
}

async function fakeQuery(config: string | QueryConfig, params?: unknown[]) {
  const text = normalizeText(config);
  const values = normalizeParams(config, params);
  const trimmed = text.trim().toLowerCase();
  if (
    trimmed === "begin" ||
    trimmed === "commit" ||
    trimmed === "rollback" ||
    trimmed.startsWith("savepoint ") ||
    trimmed.startsWith("release savepoint ") ||
    trimmed.startsWith("rollback to savepoint ")
  ) {
    return { rows: [], rowCount: 0 };
  }

  const next = queue.shift();
  if (!next) {
    throw new Error(`Unexpected query: ${text} :: ${JSON.stringify(values)}`);
  }
  if (!next.pattern.test(text)) {
    throw new Error(
      `Query mismatch. Expected ${next.pattern}, got: ${text} :: ${JSON.stringify(values)}`,
    );
  }
  if (next.error) throw next.error;
  return { rows: next.rows ?? [], rowCount: (next.rows ?? []).length };
}

const fakeClient = {
  query: fakeQuery,
  release: () => {},
};

export function installDbMock(): void {
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
  queue = [];
  if (installed) return;
  queryMock = mock.method(Pool.prototype as any, "query", fakeQuery) as any;
  connectMock = mock.method(Pool.prototype as any, "connect", async () => fakeClient) as any;
  endMock = mock.method(Pool.prototype as any, "end", async () => {}) as any;
  installed = true;
}

export function pushQuery(expectation: QueryExpectation): void {
  queue.push(expectation);
}

export function resetDbMock(): void {
  queue = [];
}

export function assertDbMockDone(): void {
  if (queue.length > 0) {
    const patterns = queue.map((q) => String(q.pattern)).join(", ");
    throw new Error(`Unused query expectations: ${patterns}`);
  }
}

export async function teardownDbMock(): Promise<void> {
  queue = [];
  await closeDb();
  if (installed) {
    queryMock?.mock.restore();
    connectMock?.mock.restore();
    endMock?.mock.restore();
    queryMock = undefined;
    connectMock = undefined;
    endMock = undefined;
    installed = false;
  }
}
