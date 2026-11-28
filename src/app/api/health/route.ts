export function GET(_request: Request): Response {
  return new Response(JSON.stringify({ data: { status: 'ok' } }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
