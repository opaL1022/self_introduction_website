// app/api/ls/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const VIRTUAL_ROOT = path.join(process.cwd(), "public", "terminal_root");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let rel = searchParams.get("path") || "";
    rel = rel.replace(/^\/+/, "");
    if (rel === "" || rel === ".") rel = "";

    const dir = path.join(VIRTUAL_ROOT, rel);
    console.log("reading directory", dir);

    const entries = await fs.readdir(dir, { withFileTypes: true });

    const names = entries.map((d) => (d.isDirectory() ? d.name + "/" : d.name));
    return NextResponse.json(names);
  } catch (e: unknown) {
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "string"
        ? e
        : "Unknown error";
    return NextResponse.json(
      { error: `Cannot list directory: ${msg}` },
      { status: 400 }
    );
  }
}
