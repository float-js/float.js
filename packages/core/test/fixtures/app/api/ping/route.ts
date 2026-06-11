export function GET() {
  return new Response(JSON.stringify({ pong: true }), { headers: { 'content-type': 'application/json' } });
}
