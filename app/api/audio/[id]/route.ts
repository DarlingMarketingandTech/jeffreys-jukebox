import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const DRIVE_ID = /^[A-Za-z0-9_-]{10,128}$/;

async function proxyDriveAudio(request: NextRequest, id: string) {
  if (!DRIVE_ID.test(id)) {
    return new Response("Invalid audio id", { status: 400 });
  }

  const upstreamHeaders = new Headers();
  const range = request.headers.get("range");
  if (range) upstreamHeaders.set("range", range);

  const driveUrl = new URL("https://drive.google.com/uc");
  driveUrl.searchParams.set("export", "download");
  driveUrl.searchParams.set("id", id);

  const upstream = await fetch(driveUrl, {
    headers: upstreamHeaders,
    redirect: "follow",
    cache: "no-store",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Recording unavailable", { status: upstream.status || 502 });
  }

  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyDriveAudio(request, id);
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const response = await proxyDriveAudio(request, id);
  return new Response(null, { status: response.status, headers: response.headers });
}
