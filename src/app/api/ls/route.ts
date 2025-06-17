// app/api/ls/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// 设定：public/terminal_root 当作我们终端的根
const VIRTUAL_ROOT = path.join(process.cwd(), "public", "terminal_root");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let rel = searchParams.get("path") || "";
    rel = rel.replace(/^\/+/, "");
    if (rel === "" || rel === ".") rel = "";

    // 直接把 rel 接到 VIRTUAL_ROOT 下
    const dir = path.join(VIRTUAL_ROOT, rel);
    console.log("reading directory", dir);

    const entries = await fs.readdir(dir, { withFileTypes: true });

    const names = entries.map((d) => (d.isDirectory() ? d.name + "/" : d.name));
    return NextResponse.json(names);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Cannot list directory: " + e.message },
      { status: 400 }
    );
  }
}
