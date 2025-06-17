// pages/api/ls.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string[] | { error: string }>
) {
  try {
    const rel = Array.isArray(req.query.path)
      ? req.query.path.join("/")
      : (req.query.path as string) || "";
    const dir = path.join(process.cwd(), "public", rel);
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const names = entries.map((d) =>
      d.isDirectory() ? d.name + "/" : d.name
    );
    res.status(200).json(names);
  } catch (e: unknown) {
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "string"
        ? e
        : "Unknown error";
    res.status(400).json({ error: `Cannot list directory: ${msg}` });
  }
}
