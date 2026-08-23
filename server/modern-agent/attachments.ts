import path from "node:path";
import { Worker } from "node:worker_threads";

import type { NextFunction, Request, Response } from "express";
import multer from "multer";

export const MAX_AGENT_ATTACHMENTS = 5;
export const MAX_AGENT_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_AGENT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_AGENT_TOTAL_ATTACHMENT_BYTES = 25 * 1024 * 1024;
export const MAX_AGENT_KNOWLEDGE_CHARS = 40_000;
const MAX_EXTRACTED_CHARS = 120_000;
const MAX_ATTACHMENT_CONTEXT_CHARS = 80_000;
const EXTRACT_TIMEOUT_MS = 30_000;

export type AgentAttachmentKind = "image" | "document" | "spreadsheet" | "text";

export interface AgentAttachment {
  fileName: string;
  mimeType: string;
  size: number;
  kind: AgentAttachmentKind;
  text?: string;
  imageDataUrl?: string;
}

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const DOCUMENT_EXTENSIONS = new Set([".pdf", ".docx"]);
const SPREADSHEET_EXTENSIONS = new Set([".xlsx", ".xls", ".csv"]);
const TEXT_EXTENSIONS = new Set([".txt", ".md", ".json"]);
const ALLOWED_EXTENSIONS = new Set([
  ...IMAGE_EXTENSIONS,
  ...DOCUMENT_EXTENSIONS,
  ...SPREADSHEET_EXTENSIONS,
  ...TEXT_EXTENSIONS,
]);

const EXTRACT_WORKER_SOURCE = `
  (async () => {
    const { parentPort, workerData } = await import("node:worker_threads");
    const trim = (text, max = 120000) =>
      String(text || "").replace(/\\u0000/g, " ").trim().slice(0, max);
    try {
      const buffer = Buffer.from(workerData.buffer);
      const kind = workerData.kind;
      let text = "";
      if (kind === "pdf") {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        try {
          const result = await parser.getText();
          text = result.text || "";
        } finally {
          await parser.destroy().catch(() => {});
        }
      } else if (kind === "docx") {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        text = result.value || "";
      } else if (kind === "xlsx") {
        const ExcelJS = (await import("exceljs")).default;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const sheets = [];
        workbook.worksheets.slice(0, 8).forEach((sheet) => {
          const rows = [];
          sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rows.length >= 200) return;
            const values = [];
            for (let col = 1; col <= Math.min(row.cellCount, 30); col++) {
              values.push(String(sheet.getRow(rowNumber).getCell(col).text || "").trim());
            }
            if (values.some(Boolean)) rows.push(values.join(" | "));
          });
          if (rows.length) sheets.push("# " + sheet.name + "\\n" + rows.join("\\n"));
        });
        text = sheets.join("\\n\\n");
      } else if (kind === "xls") {
        const xlsxModule = await import("xlsx");
        const XLSX = xlsxModule.default || xlsxModule;
        const workbook = XLSX.read(buffer, { type: "buffer" });
        text = workbook.SheetNames.slice(0, 8)
          .map((name) => {
            const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name], {
              FS: " | ",
              RS: "\\n",
            });
            return csv ? "# " + name + "\\n" + csv.split("\\n").slice(0, 200).join("\\n") : "";
          })
          .filter(Boolean)
          .join("\\n\\n");
      } else {
        throw new Error("unsupported_file_type");
      }
      parentPort.postMessage({ ok: true, text: trim(text) });
    } catch (err) {
      parentPort.postMessage({
        ok: false,
        error: (err && err.message) || "extract_failed",
      });
    }
  })();
`;

function extensionOf(fileName: string): string {
  return path.extname(fileName || "").toLowerCase();
}

function kindFor(fileName: string): AgentAttachmentKind | null {
  const extension = extensionOf(fileName);
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (DOCUMENT_EXTENSIONS.has(extension)) return "document";
  if (SPREADSHEET_EXTENSIONS.has(extension)) return "spreadsheet";
  if (TEXT_EXTENSIONS.has(extension)) return "text";
  return null;
}

function hasExpectedSignature(file: Express.Multer.File): boolean {
  const extension = extensionOf(file.originalname);
  const buffer = file.buffer;
  if (!buffer.length) return false;
  if (extension === ".pdf") return buffer.subarray(0, 5).toString() === "%PDF-";
  if (extension === ".jpg" || extension === ".jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (extension === ".png") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    );
  }
  if (extension === ".webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString() === "RIFF" &&
      buffer.subarray(8, 12).toString() === "WEBP"
    );
  }
  if (extension === ".docx" || extension === ".xlsx") {
    return buffer.length >= 4 && buffer.subarray(0, 2).toString() === "PK";
  }
  if (extension === ".xls") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([208, 207, 17, 224, 161, 177, 26, 225]))
    );
  }
  return true;
}

const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AGENT_ATTACHMENT_BYTES,
    files: MAX_AGENT_ATTACHMENTS,
    fields: 5,
    fieldSize: 8 * 1024,
    parts: MAX_AGENT_ATTACHMENTS + 5,
  },
  fileFilter: (_req, file, callback) => {
    if (!kindFor(file.originalname)) {
      callback(new Error("unsupported_file_type"));
      return;
    }
    callback(null, true);
  },
});

/**
 * Parse multipart messages only. The wrapped Multer callback is intentional:
 * file-filter and file-size errors occur before the chat handler's try/catch.
 */
export function parseAgentAttachments(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.is("multipart/form-data")) {
    next();
    return;
  }
  const contentLength = Number(req.headers["content-length"] || 0);
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_AGENT_TOTAL_ATTACHMENT_BYTES + 1024 * 1024
  ) {
    res.status(400).json({ error: "إجمالي حجم المرفقات في الرسالة كبير جداً" });
    return;
  }

  attachmentUpload.array("files", MAX_AGENT_ATTACHMENTS)(
    req,
    res,
    (error: unknown) => {
      if (!error) {
        next();
        return;
      }
      if (error instanceof multer.MulterError) {
        const message =
          error.code === "LIMIT_FILE_SIZE"
            ? "حجم كل ملف يجب ألا يتجاوز 5 ميجابايت"
            : "عدد المرفقات كبير جداً";
        res.status(400).json({ error: message });
        return;
      }
      const message =
        error instanceof Error && error.message === "unsupported_file_type"
          ? "نوع الملف غير مدعوم. أرفق صورة أو PDF أو Word أو Excel أو ملفاً نصياً."
          : "تعذر رفع المرفق";
      res.status(400).json({ error: message });
    },
  );
}

function extractInWorker(
  buffer: Buffer,
  kind: "pdf" | "docx" | "xlsx" | "xls",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    );
    const worker = new Worker(EXTRACT_WORKER_SOURCE, {
      eval: true,
      workerData: { buffer: arrayBuffer, kind },
      transferList: [arrayBuffer],
    });
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate().catch(() => {});
      callback();
    };
    const timer = setTimeout(
      () => finish(() => reject(new Error("extract_timeout"))),
      EXTRACT_TIMEOUT_MS,
    );
    worker.on("message", (message: { ok: boolean; text?: string; error?: string }) =>
      finish(() =>
        message.ok
          ? resolve(message.text || "")
          : reject(new Error(message.error || "extract_failed")),
      ),
    );
    worker.on("error", (error) => finish(() => reject(error)));
    worker.on("exit", (code) => {
      if (code !== 0) finish(() => reject(new Error("extract_worker_exited")));
    });
  });
}

async function extractAttachmentText(file: Express.Multer.File): Promise<string> {
  const extension = extensionOf(file.originalname);
  if (extension === ".pdf") return extractInWorker(file.buffer, "pdf");
  if (extension === ".docx") return extractInWorker(file.buffer, "docx");
  if (extension === ".xlsx") return extractInWorker(file.buffer, "xlsx");
  if (extension === ".xls") return extractInWorker(file.buffer, "xls");
  return file.buffer
    .toString("utf-8")
    .replace(/\u0000/g, " ")
    .trim()
    .slice(0, MAX_EXTRACTED_CHARS);
}

export async function readAgentAttachments(
  files: Express.Multer.File[],
): Promise<AgentAttachment[]> {
  const attachments: AgentAttachment[] = [];
  let totalBytes = 0;
  for (const file of files) {
    const kind = kindFor(file.originalname);
    if (!kind || !hasExpectedSignature(file)) {
      throw new Error("invalid_file_content");
    }
    totalBytes += file.size;
    if (totalBytes > MAX_AGENT_TOTAL_ATTACHMENT_BYTES) {
      throw new Error("attachment_total_too_large");
    }
    if (kind === "image" && file.size > MAX_AGENT_IMAGE_BYTES) {
      throw new Error("image_too_large");
    }
    const base = {
      fileName: path.basename(file.originalname).slice(0, 255),
      mimeType: file.mimetype || "application/octet-stream",
      size: file.size,
      kind,
    };
    if (kind === "image") {
      attachments.push({
        ...base,
        imageDataUrl: `data:${base.mimeType};base64,${file.buffer.toString("base64")}`,
      });
      continue;
    }
    const text = await extractAttachmentText(file);
    if (!text) {
      throw new Error("empty_file_content");
    }
    attachments.push({ ...base, text });
  }
  return attachments;
}

const UPLOAD_RATE_WINDOW_MS = 60_000;
const MAX_UPLOADS_PER_WINDOW = 5;
const uploadAttempts = new Map<number, { count: number; windowStart: number }>();

export function allowAgentAttachmentUpload(userId: number): boolean {
  const now = Date.now();
  const current = uploadAttempts.get(userId);
  if (!current || now - current.windowStart > UPLOAD_RATE_WINDOW_MS) {
    uploadAttempts.set(userId, { count: 1, windowStart: now });
    return true;
  }
  if (current.count >= MAX_UPLOADS_PER_WINDOW) return false;
  current.count++;
  return true;
}

export function rateLimitAgentAttachmentUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.is("multipart/form-data")) {
    next();
    return;
  }
  const userId = Number((req as Request & { user?: { id?: number } }).user?.id);
  if (!Number.isFinite(userId) || allowAgentAttachmentUpload(userId)) {
    next();
    return;
  }
  res
    .status(429)
    .json({ error: "تم تجاوز الحد المؤقت لرفع المرفقات. حاول بعد دقيقة." });
}

setInterval(() => {
  const now = Date.now();
  for (const [userId, attempt] of uploadAttempts) {
    if (now - attempt.windowStart > UPLOAD_RATE_WINDOW_MS) {
      uploadAttempts.delete(userId);
    }
  }
}, UPLOAD_RATE_WINDOW_MS).unref?.();

export function attachmentMetadata(
  attachments: AgentAttachment[],
  savedToKnowledge: boolean,
) {
  return attachments.map((attachment) => ({
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    size: attachment.size,
    kind: attachment.kind,
    savedToKnowledge,
  }));
}

export function attachmentTextContext(attachments: AgentAttachment[]): string {
  const textAttachments = attachments.filter((attachment) => attachment.text);
  if (!textAttachments.length) return "";
  let remaining = MAX_ATTACHMENT_CONTEXT_CHARS;
  const sections: string[] = [];
  for (const attachment of textAttachments) {
    if (remaining <= 0) break;
    const header = `\n\n--- بدء محتوى المرفق: ${attachment.fileName} ---\n`;
    const footer = "\n--- نهاية محتوى المرفق ---";
    const available = remaining - header.length - footer.length;
    if (available <= 0) break;
    const body = (attachment.text || "").slice(0, available);
    sections.push(`${header}${body}${footer}`);
    remaining -= header.length + body.length + footer.length;
  }
  return sections.join("");
}