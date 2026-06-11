import { ai, streamResponse } from '@float.js/core';

export async function POST(request: Request) {
  const { messages } = await request.json();
  const last = messages[messages.length - 1]?.content ?? '';
  return streamResponse(ai.stream(last));
}
