import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const start1 = Date.now();
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  console.log("PROXY AUDIO: Parse URL time", Date.now() - start1);

  if (!url) return new NextResponse("Missing url", { status: 400 });

  const start2 = Date.now();
  // Optional safety: allow only your storage domain
  const allowedHost = "storage.googleapis.com";
  const u = new URL(url);
  if (u.hostname !== allowedHost) {
    return new NextResponse("Forbidden host", { status: 403 });
  }
  console.log("PROXY AUDIO: Host validation time", Date.now() - start2);

  const start3 = Date.now();
  const res = await fetch(url);
  console.log("PROXY AUDIO: Fetch time", Date.now() - start3);

  if (!res.ok) return new NextResponse("Upstream fetch failed", { status: 502 });

  const start4 = Date.now();
  const contentType = res.headers.get("content-type") ?? "audio/mpeg";
  const body = await res.arrayBuffer();
  console.log("PROXY AUDIO: Buffer creation time", Date.now() - start4);

  const start5 = Date.now();
  const response = new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      // cache if you want:
      "Cache-Control": "public, max-age=3600",
    },
  });
  console.log("PROXY AUDIO: Response creation time", Date.now() - start5);

  return response;
}
