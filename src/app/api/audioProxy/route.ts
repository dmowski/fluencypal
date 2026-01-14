import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return new NextResponse("Missing url", { status: 400 });

  // Optional safety: allow only your storage domain
  const allowedHost = "storage.googleapis.com";
  const u = new URL(url);
  if (u.hostname !== allowedHost) {
    return new NextResponse("Forbidden host", { status: 403 });
  }

  const res = await fetch(url);
  if (!res.ok) return new NextResponse("Upstream fetch failed", { status: 502 });

  const contentType = res.headers.get("content-type") ?? "audio/mpeg";
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      // cache if you want:
      "Cache-Control": "public, max-age=3600",
    },
  });
}
