import fs from "fs";
import os from "os";
import path from "path";
import PDFDocument from "pdfkit";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  convertMillimetersToTwip,
  Header,
  Footer,
  ImageRun,
} from "docx";
import {
  isArabicText,
  processArabicText,
} from "../services/arabic-text-service";
import type { LetterheadData, LetterheadImage } from "./letterhead";

export const MODERN_DOCS_DIR = path.join(os.tmpdir(), "modern-agent-docs");

if (!fs.existsSync(MODERN_DOCS_DIR)) {
  fs.mkdirSync(MODERN_DOCS_DIR, { recursive: true });
}

const ARABIC_FONT_PATH = (() => {
  const candidates = [
    path.join(process.cwd(), "server", "fonts", "Amiri-Regular.ttf"),
    path.join(process.cwd(), "public", "fonts", "Amiri-Regular.ttf"),
    path.join(process.cwd(), "server", "fonts", "NotoSansArabic-Regular.ttf"),
  ];
  return candidates.find((p) => fs.existsSync(p)) || "";
})();

export interface AgentDocSection {
  heading?: string;
  body?: string;
}

export interface AgentDocSpec {
  title: string;
  language?: "ar" | "en";
  intro?: string;
  sections?: AgentDocSection[];
  table?: { headers: string[]; rows: string[][] };
  footer?: string;
  ownerId?: number;
  /** Company letterhead (header/footer images, footer text, signatures). */
  letterhead?: LetterheadData;
}

// Scale an image to fit a max width/height box, preserving aspect ratio.
function fitImage(
  img: LetterheadImage,
  maxW: number,
  maxH: number,
): { width: number; height: number } {
  const scale = Math.min(maxW / img.width, maxH / img.height, 1);
  return {
    width: Math.round(img.width * scale),
    height: Math.round(img.height * scale),
  };
}

function sanitizeFileName(name: string): string {
  return (
    (name || "document")
      .replace(/[^\p{L}\p{N}\-_ ]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "document"
  );
}

function uniqueBase(title: string, ownerId?: number): string {
  const prefix = ownerId != null ? `u${ownerId}-` : "";
  return `${prefix}${sanitizeFileName(title)}-${Date.now()}-${Math.floor(
    Math.random() * 1e6,
  )}`;
}

// Parse the owner user id encoded into a generated document file name.
export function getDocOwnerId(fileName: string): number | null {
  const m = path.basename(fileName || "").match(/^u(\d+)-/);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isFinite(id) ? id : null;
}

// ----------------------- PDF -----------------------
export async function generateAgentPdf(spec: AgentDocSpec): Promise<{
  fileName: string;
  filePath: string;
}> {
  const base = uniqueBase(spec.title, spec.ownerId);
  const fileName = `${base}.pdf`;
  const filePath = path.join(MODERN_DOCS_DIR, fileName);
  const isAr = spec.language === "ar";
  const hasArabicFont = !!ARABIC_FONT_PATH;
  const align: "right" | "left" = isAr ? "right" : "left";

  // Always apply full Arabic processing (reshape contextual forms + bidi reorder)
  // regardless of font availability — pdfkit does not do Arabic shaping natively.
  const safe = (text: string): string => {
    if (!text) return "";
    if (!isArabicText(text)) return text;
    return processArabicText(text);
  };

  // A4 = 595 x 842 pt. Reserve space for the company letterhead.
  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const SIDE = 50;
  const CONTENT_W = PAGE_W - SIDE * 2;
  const lh = spec.letterhead;
  const headerFit = lh?.headerImage
    ? fitImage(lh.headerImage, CONTENT_W, 120)
    : null;
  const footerImgFit = lh?.footerImage
    ? fitImage(lh.footerImage, CONTENT_W, 70)
    : null;
  const footerTextH = lh?.footerText ? 26 : 0;
  const footerBlockH = (footerImgFit?.height || 0) + footerTextH;
  const topMargin = headerFit ? headerFit.height + 65 : 50;
  const bottomMargin = footerBlockH > 0 ? footerBlockH + 60 : 50;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: {
          top: topMargin,
          bottom: bottomMargin,
          left: SIDE,
          right: SIDE,
        },
        bufferPages: true,
      });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      if (hasArabicFont) doc.font(ARABIC_FONT_PATH);

      doc
        .fontSize(20)
        .fillColor("#1a365d")
        .text(safe(spec.title), { align: "center" });
      doc.moveDown(1);

      if (spec.intro) {
        doc
          .fontSize(12)
          .fillColor("#2d3748")
          .text(safe(spec.intro), { align });
        doc.moveDown(0.8);
      }

      for (const section of spec.sections || []) {
        if (section.heading) {
          doc
            .fontSize(14)
            .fillColor("#2b6cb0")
            .text(safe(section.heading), { align });
          doc.moveDown(0.3);
        }
        if (section.body) {
          doc
            .fontSize(12)
            .fillColor("#1a202c")
            .text(safe(section.body), { align });
          doc.moveDown(0.6);
        }
      }

      if (spec.table && spec.table.headers?.length) {
        doc.moveDown(0.4);
        const headerLine = spec.table.headers.join("   |   ");
        doc
          .fontSize(12)
          .fillColor("#2b6cb0")
          .text(safe(headerLine), { align });
        doc.moveDown(0.2);
        for (const row of spec.table.rows || []) {
          doc
            .fontSize(11)
            .fillColor("#1a202c")
            .text(safe(row.join("   |   ")), { align });
        }
        doc.moveDown(0.6);
      }

      if (spec.footer) {
        doc.moveDown(1);
        doc
          .fontSize(10)
          .fillColor("#718096")
          .text(safe(spec.footer), { align });
      }

      // Default company signatures (from letterhead settings)
      if (lh?.signatures?.length) {
        doc.moveDown(2);
        doc
          .fontSize(12)
          .fillColor("#2b6cb0")
          .text(safe(isAr ? "التواقيع" : "Signatures"), { align });
        doc.moveDown(0.5);
        for (const sig of lh.signatures) {
          doc
            .fontSize(11)
            .fillColor("#1a202c")
            .text(safe(sig), { align });
          doc.moveDown(1.2);
        }
      }

      // Stamp the company letterhead (header/footer) on every page.
      if (headerFit || footerBlockH > 0) {
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);
          // prevent stamping from triggering a new page
          const prevBottom = doc.page.margins.bottom;
          doc.page.margins.bottom = 0;
          if (headerFit && lh?.headerImage) {
            doc.image(lh.headerImage.buffer, (PAGE_W - headerFit.width) / 2, 25, {
              width: headerFit.width,
              height: headerFit.height,
            });
          }
          let fy = PAGE_H - 30 - footerBlockH;
          if (lh?.footerText) {
            doc
              .fontSize(9)
              .fillColor("#718096")
              .text(safe(lh.footerText), SIDE, fy, {
                width: CONTENT_W,
                align: "center",
                height: footerTextH,
                ellipsis: true,
              });
            fy += footerTextH;
          }
          if (footerImgFit && lh?.footerImage) {
            doc.image(
              lh.footerImage.buffer,
              (PAGE_W - footerImgFit.width) / 2,
              fy,
              { width: footerImgFit.width, height: footerImgFit.height },
            );
          }
          doc.page.margins.bottom = prevBottom;
        }
      }

      doc.end();
      stream.on("finish", () => resolve({ fileName, filePath }));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

// ----------------------- Word -----------------------
export async function generateAgentWord(spec: AgentDocSpec): Promise<{
  fileName: string;
  filePath: string;
}> {
  const base = uniqueBase(spec.title, spec.ownerId);
  const fileName = `${base}.docx`;
  const filePath = path.join(MODERN_DOCS_DIR, fileName);
  const isAr = spec.language === "ar";
  const alignment = isAr ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const bidi = isAr;

  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      bidirectional: bidi,
      children: [new TextRun({ text: spec.title, bold: true, rightToLeft: bidi })],
    }),
  );

  if (spec.intro) {
    children.push(
      new Paragraph({
        alignment,
        bidirectional: bidi,
        children: [new TextRun({ text: spec.intro, rightToLeft: bidi })],
      }),
    );
  }

  for (const section of spec.sections || []) {
    if (section.heading) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          alignment,
          bidirectional: bidi,
          children: [
            new TextRun({ text: section.heading, bold: true, rightToLeft: bidi }),
          ],
        }),
      );
    }
    if (section.body) {
      children.push(
        new Paragraph({
          alignment,
          bidirectional: bidi,
          children: [new TextRun({ text: section.body, rightToLeft: bidi })],
        }),
      );
    }
  }

  if (spec.table && spec.table.headers?.length) {
    const headerRow = new TableRow({
      children: spec.table.headers.map(
        (h) =>
          new TableCell({
            children: [
              new Paragraph({
                alignment,
                bidirectional: bidi,
                children: [new TextRun({ text: h, bold: true, rightToLeft: bidi })],
              }),
            ],
          }),
      ),
    });
    const bodyRows = (spec.table.rows || []).map(
      (row) =>
        new TableRow({
          children: row.map(
            (cell) =>
              new TableCell({
                children: [
                  new Paragraph({
                    alignment,
                    bidirectional: bidi,
                    children: [new TextRun({ text: cell, rightToLeft: bidi })],
                  }),
                ],
              }),
          ),
        }),
    );
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...bodyRows],
      }),
    );
  }

  if (spec.footer) {
    children.push(
      new Paragraph({
        alignment,
        bidirectional: bidi,
        children: [new TextRun({ text: spec.footer, italics: true, rightToLeft: bidi })],
      }),
    );
  }

  const lh = spec.letterhead;

  // Default company signatures (from letterhead settings)
  if (lh?.signatures?.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment,
        bidirectional: bidi,
        spacing: { before: 400 },
        children: [
          new TextRun({
            text: isAr ? "التواقيع" : "Signatures",
            bold: true,
            rightToLeft: bidi,
          }),
        ],
      }),
    );
    for (const sig of lh.signatures) {
      children.push(
        new Paragraph({
          alignment,
          bidirectional: bidi,
          spacing: { after: 300 },
          children: [new TextRun({ text: sig, rightToLeft: bidi })],
        }),
      );
    }
  }

  // Company letterhead header/footer (images sized in px, ~96dpi; usable width ≈ 640px)
  const headerFit = lh?.headerImage ? fitImage(lh.headerImage, 640, 160) : null;
  const footerImgFit = lh?.footerImage ? fitImage(lh.footerImage, 640, 90) : null;
  const docImage = (
    img: LetterheadImage,
    size: { width: number; height: number },
  ) =>
    new ImageRun({
      type: img.type === "png" ? "png" : "jpg",
      data: img.buffer,
      transformation: size,
    });

  const headers = lh?.headerImage && headerFit
    ? {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [docImage(lh.headerImage, headerFit)],
            }),
          ],
        }),
      }
    : undefined;

  const footerChildren: Paragraph[] = [];
  if (lh?.footerText) {
    footerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: bidi,
        children: [
          new TextRun({
            text: lh.footerText,
            size: 18,
            color: "718096",
            rightToLeft: bidi,
          }),
        ],
      }),
    );
  }
  if (lh?.footerImage && footerImgFit) {
    footerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [docImage(lh.footerImage, footerImgFit)],
      }),
    );
  }
  const footers = footerChildren.length
    ? { default: new Footer({ children: footerChildren }) }
    : undefined;

  const docx = new Document({
    sections: [
      {
        headers,
        footers,
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(210),  // A4 width
              height: convertMillimetersToTwip(297), // A4 height
            },
            margin: {
              // Reserve room for the letterhead so header/footer content
              // never overlaps the body (px at ~96dpi → mm: px / 96 * 25.4).
              top: convertMillimetersToTwip(
                headerFit
                  ? Math.ceil(13 + (headerFit.height / 96) * 25.4 + 4)
                  : 20,
              ),
              bottom: convertMillimetersToTwip(
                footerChildren.length
                  ? Math.ceil(
                      13 +
                        ((footerImgFit?.height || 0) / 96) * 25.4 +
                        (lh?.footerText ? 6 : 0) +
                        4,
                    )
                  : 20,
              ),
              left: convertMillimetersToTwip(20),
              right: convertMillimetersToTwip(20),
            },
          },
        },
        children,
      },
    ],
  });
  const buffer = await Packer.toBuffer(docx);
  fs.writeFileSync(filePath, buffer);
  return { fileName, filePath };
}

export function getDocPath(fileName: string): string | null {
  const resolved = path.join(MODERN_DOCS_DIR, path.basename(fileName));
  if (!resolved.startsWith(MODERN_DOCS_DIR)) return null;
  if (!fs.existsSync(resolved)) return null;
  return resolved;
}
