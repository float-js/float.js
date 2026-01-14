/**
 * API Route Example
 * 
 * Float.js API routes support all HTTP methods
 * and use the standard Request/Response API
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || 'World';

  return Response.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    framework: 'Float.js',
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  return Response.json({
    message: 'Data received!',
    data: body,
    timestamp: new Date().toISOString(),
    method: 'POST',
  });
}
