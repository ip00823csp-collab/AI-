import { NextRequest, NextResponse } from "next/server";
import {
  MAX_RESUME_FILE_SIZE,
  parseResumeFile,
  resolveResumeFileKind,
} from "@/lib/resume-file";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "上传请求解析失败" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "请先选择一个简历文件" }, { status: 400 });
  }

  if (!file.name || !resolveResumeFileKind(file.name, file.type)) {
    return NextResponse.json(
      { error: "仅支持 PDF、DOC、DOCX 文件上传" },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "文件内容为空，请重新上传" }, { status: 400 });
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    return NextResponse.json(
      { error: "文件过大，请上传 5MB 以内的简历文件" },
      { status: 413 }
    );
  }

  try {
    const parsed = await parseResumeFile(file);
    return NextResponse.json({
      fileName: file.name,
      fileType: parsed.fileType,
      text: parsed.text,
      warnings: parsed.warnings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "文件解析失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
