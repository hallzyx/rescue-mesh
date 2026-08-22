const ALLOWED_ORIGINS = [
  "http://127.0.0.1:43147",
  "http://127.0.0.1:43148",
  "http://127.0.0.1:43149",
  "http://localhost:43147",
  "http://localhost:43148",
  "http://localhost:43149",
];

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export function jsonWithCors(request: Request, body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders(request),
      ...(init?.headers ?? {}),
    },
  });
}

export function optionsWithCors(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
