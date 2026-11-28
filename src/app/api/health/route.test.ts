import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GET } from './route.ts';

test('GET /api/health returns the Fastify-equivalent public envelope', async () => {
  const response = GET(new Request('http://localhost/api/health'));

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /^application\/json/);
  assert.deepEqual(await response.json(), { data: { status: 'ok' } });
});
