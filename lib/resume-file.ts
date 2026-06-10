import { readFileSync } from "node:fs";
import { join } from "node:path";
import mammoth from "mammoth";
import WordExtractor from "word-extractor";
import {
  MAX_RESUME_FILE_SIZE,
  RESUME_FILE_ACCEPT,
  RESUME_FILE_LABEL,
} from "@/lib/resume-upload-config";

export type ResumeFileKind = "pdf" | "doc" | "docx";

interface ResumeFileParseResult {
  fileType: ResumeFileKind;
  text: string;
  warnings: string[];
}

const PDF_MIME_TYPES = new Set(["application/pdf"]);
const DOC_MIME_TYPES = new Set(["application/msword"]);
const DOCX_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
]);

export { MAX_RESUME_FILE_SIZE, RESUME_FILE_ACCEPT, RESUME_FILE_LABEL };

const pdfWorkerDataUrl = `data:text/javascript;base64,${readFileSync(
  join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs")
).toString("base64")}`;

export function resolveResumeFileKind(
  fileName: string,
  mimeType: string
): ResumeFileKind | null {
  const extension = getFileExtension(fileName);

  if (extension === ".pdf" || PDF_MIME_TYPES.has(mimeType)) {
    return "pdf";
  }
  if (extension === ".docx" || DOCX_MIME_TYPES.has(mimeType)) {
    return "docx";
  }
  if (extension === ".doc" || DOC_MIME_TYPES.has(mimeType)) {
    return "doc";
  }

  return null;
}

export async function parseResumeFile(file: File): Promise<ResumeFileParseResult> {
  const fileType = resolveResumeFileKind(file.name, file.type);
  if (!fileType) {
    throw new Error("暂不支持该文件类型，请上传 PDF、DOC 或 DOCX 文件");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed =
    fileType === "pdf"
      ? { text: await extractPdfText(buffer), warnings: [] }
      : fileType === "docx"
        ? await extractDocxText(buffer)
        : { text: await extractDocText(buffer), warnings: [] };

  if (!parsed.text) {
    throw new Error("文件已上传，但未能提取到可用文本，请确认文件不是扫描件或已加密");
  }

  return {
    fileType,
    text: parsed.text,
    warnings: parsed.warnings,
  };
}

function getFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.slice(lastDot).toLowerCase();
}

async function extractPdfText(buffer: Buffer) {
  type PdfTextItem = {
    str: string;
    transform: number[];
    hasEOL?: boolean;
  };
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerDataUrl;
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });

  try {
    const document = await loadingTask.promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const lines: string[] = [];
      let currentLine: string[] = [];
      let lastY: number | null = null;

      for (const item of textContent.items as PdfTextItem[]) {
        if (typeof item.str !== "string") {
          continue;
        }

        const currentY = item.transform[5];
        if (lastY !== null && Math.abs(lastY - currentY) > 6) {
          if (currentLine.length > 0) {
            lines.push(currentLine.join(""));
          }
          currentLine = [];
        }

        currentLine.push(item.str);
        lastY = currentY;

        if (item.hasEOL) {
          lines.push(currentLine.join(""));
          currentLine = [];
          lastY = null;
        }
      }

      if (currentLine.length > 0) {
        lines.push(currentLine.join(""));
      }

      pages.push(lines.join("\n"));
      page.cleanup();
    }

    return normalizeExtractedText(pages.join("\n\n"));
  } finally {
    await loadingTask.destroy();
  }
}

async function extractDocxText(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: normalizeExtractedText(result.value),
    warnings: result.messages.map((message) => message.message),
  };
}

async function extractDocText(buffer: Buffer) {
  const extractor = new WordExtractor();
  const document = await extractor.extract(buffer);

  return normalizeExtractedText(document.getBody());
}

function normalizeExtractedText(text: string) {
  return text
    .normalize("NFKC")
    .replace(/\r/g, "")
    .replace(/([\u3400-\u9fff])[ \t]+(?=[\u3400-\u9fff])/g, "$1")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
