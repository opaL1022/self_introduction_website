// app/api/ls/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const EXCLUDED_DIRS = new Set(["fonts"]);     // << 你想排除的目录名
const ALLOWED_EXTS = /\.(txt|md)$/i;                   // << 你想允许的文件后缀

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let rel = searchParams.get("path") || "";
    rel = rel.replace(/^\/+/, "");
    if (rel === "" || rel === ".") rel = "";
    const dir = path.join(process.cwd(), "public", rel);

    const entries = await fs.readdir(dir, { withFileTypes: true });
    const filtered = entries.filter((d) => {
      if (d.isDirectory()) {
        // 目录：只有当它不在排除列表里才保留
        return !EXCLUDED_DIRS.has(d.name);
      } else {
        // 文件：只保留你想要的后缀
        return ALLOWED_EXTS.test(d.name);
      }
    });

    const names = filtered.map((d) =>
      d.isDirectory() ? d.name + "/" : d.name
    );
    return NextResponse.json(names);
  } catch (e: any) {
    return NextResponse.json({ error: "Cannot list directory: " + e.message }, { status: 400 });
  }
}
