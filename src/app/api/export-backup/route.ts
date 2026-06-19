import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const DEFAULT_EXPORT_DIR = "E:\\Career Track\\Development\\Goaltrack Json Files";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { data: unknown; filename?: string };
    if (!body?.data) {
      return NextResponse.json({ error: "Missing backup data" }, { status: 400 });
    }

    const exportDir = process.env.GOALTRACK_EXPORT_DIR ?? DEFAULT_EXPORT_DIR;
    const filename =
      body.filename?.replace(/[^\w.-]/g, "_") ??
      `goaltrack-backup-${new Date().toISOString().slice(0, 10)}.json`;

    await mkdir(exportDir, { recursive: true });
    const filePath = path.join(exportDir, filename);
    await writeFile(filePath, JSON.stringify(body.data, null, 2), "utf-8");

    return NextResponse.json({ ok: true, path: filePath, filename });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
