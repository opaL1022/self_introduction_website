import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let rel = url.searchParams.get("path") || "";
  rel = rel.replace(/^\/+/, "");
  const file = path.join(process.cwd(), "public", "terminal_root", rel);

  try {
    const text = await fs.readFile(file, "utf-8");
    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
