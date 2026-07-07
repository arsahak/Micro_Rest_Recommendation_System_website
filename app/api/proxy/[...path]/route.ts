import { type NextRequest, NextResponse } from "next/server";

const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:8000";

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const qs = request.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND}/api/${path.join("/")}${qs ? `?${qs}` : ""}`;

  const proxyHeaders: Record<string, string> = { "Content-Type": "application/json" };

  // Forward the JWT from the browser so the backend can authenticate the request
  const auth = request.headers.get("Authorization");
  if (auth) proxyHeaders["Authorization"] = auth;

  const init: RequestInit = {
    method: request.method,
    headers: proxyHeaders,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Backend server is not reachable. Please ensure it is running." },
      { status: 503 }
    );
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
