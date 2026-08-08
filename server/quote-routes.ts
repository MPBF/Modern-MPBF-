import type { Express, Request, Response } from "express";

import { requireAuth, requirePermission } from "./middleware/auth";

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import {
  quotes,
  quote_items,
  quote_templates,
  company_profile,
} from "@shared/schema";

import { eq, desc } from "drizzle-orm";
import PDFDocument from "pdfkit";

import {
  generateQuotePdfWithAdobe,
  isAdobePdfAvailable,
} from "./services/adobe-pdf/quote-pdf";
import { db } from "./db";
import { objectStorageClient } from "./replit_integrations/object_storage";
import { processArabicText } from "./services/arabic-text-service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_VAT_RATE = 0.15;

function safeStorageFilename(input: string, fallback = "document"): string {
  const base = (input || "")
    .toString()
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 120);
  if (
    !base ||
    base.includes("..") ||
    base.includes("/") ||
    base.includes("\\")
  ) {
    return fallback;
  }
  return base;
}

async function getCompanyLogoForPdf(
  fallbackPath: string,
): Promise<{ buffer: Buffer | null; path: string | null }> {
  try {
    const [profile] = await db
      .select({ logo_url: company_profile.logo_url })
      .from(company_profile)
      .limit(1);
    if (profile?.logo_url && profile.logo_url.startsWith("/objects/")) {
      const parts = profile.logo_url.slice(1).split("/");
      const entityId = parts.slice(1).join("/");
      const privateDir = process.env.PRIVATE_OBJECT_DIR || "";
      if (privateDir) {
        const fullPath = privateDir.endsWith("/")
          ? `${privateDir}${entityId}`
          : `${privateDir}/${entityId}`;
        const pathParts = fullPath.startsWith("/")
          ? fullPath.slice(1).split("/")
          : fullPath.split("/");
        const bucketName = pathParts[0];
        const objectName = pathParts.slice(1).join("/");
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectName);
        const [exists] = await file.exists();
        if (exists) {
          const [contents] = await file.download();
          return { buffer: contents, path: null };
        }
      }
    }
  } catch (e) {
    console.error("Error fetching company logo from storage:", e);
  }
  if (fs.existsSync(fallbackPath)) {
    return { buffer: null, path: fallbackPath };
  }
  return { buffer: null, path: null };
}

async function generateQuotePdfBuffer(quoteId: number): Promise<Buffer> {
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId));
  if (!quote) throw new Error("Quote not found");

  const items = await db
    .select()
    .from(quote_items)
    .where(eq(quote_items.quote_id, quoteId))
    .orderBy(quote_items.line_number);

  const fmt = (n: string | number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n || 0));
  const fmtD = (d: string | Date) => {
    try {
      return new Date(d).toLocaleDateString("en-GB");
    } catch {
      return "";
    }
  };
  const subtotal = Number(quote.total_before_tax || 0);
  const tax = Number(quote.tax_amount || subtotal * DEFAULT_VAT_RATE);
  const total = Number(quote.total_with_tax || subtotal + tax);

  const lp = path.join(__dirname, "fonts", "factory-logo.png");
  const logoData = await getCompanyLogoForPdf(lp);

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: "A4", margin: 30 });
    const fp = path.join(__dirname, "fonts", "Amiri-Regular.ttf");
    const hasAr = fs.existsSync(fp);
    if (hasAr) doc.registerFont("Arabic", fp);

    const hasLogo = logoData.buffer !== null || logoData.path !== null;

    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (e) => reject(e));

    const M = 30;
    const PW = 595;
    const PH = 842;
    const L = M,
      R = PW - M,
      CW = R - L;
    let Y = M;

    const arText = (
      t: string,
      x: number,
      y: number,
      w: number,
      opts: any = {},
    ) => {
      if (!hasAr) return;
      doc
        .font("Arabic")
        .text(processArabicText(t), x, y, { width: w, ...opts });
      doc.font("Helvetica");
    };

    const drawLine = (
      x1: number,
      y: number,
      x2: number,
      color = "#e2e8f0",
      width = 0.5,
    ) => {
      doc
        .strokeColor(color)
        .lineWidth(width)
        .moveTo(x1, y)
        .lineTo(x2, y)
        .stroke();
    };

    const headerH = 55;

    if (hasLogo) {
      try {
        const logoSource = logoData.buffer || logoData.path!;
        doc.image(logoSource, L, Y, { width: 50, height: 50 });
      } catch (e) {
        console.error("Logo:", e);
      }
    }

    doc.font("Helvetica-Bold").fontSize(13).fillColor("#1e3a5f");
    doc.text("Modern Plastic Bags Factory", L + 60, Y + 4, { width: 260 });
    if (hasAr) {
      doc.font("Arabic").fontSize(11).fillColor("#1e3a5f");
      doc.text(
        processArabicText("مصنع الأكياس البلاستيكية الحديثة"),
        L + 60,
        Y + 22,
        { width: 260 },
      );
      doc.font("Helvetica");
    }
    doc.fontSize(7).fillColor("#666");
    doc.text("Industrial Area, Riyadh | Saudi Arabia", L + 60, Y + 38, {
      width: 260,
    });

    doc.font("Helvetica").fontSize(8).fillColor("#333");
    const rCol = R - 140;
    doc.font("Helvetica-Bold").text("Quote #:", rCol, Y + 4, { width: 55 });
    doc
      .font("Helvetica")
      .text(quote.document_number, rCol + 55, Y + 4, { width: 85 });
    doc.font("Helvetica-Bold").text("Date:", rCol, Y + 18, { width: 55 });
    doc
      .font("Helvetica")
      .text(fmtD(quote.quote_date), rCol + 55, Y + 18, { width: 85 });
    doc.font("Helvetica-Bold").text("Status:", rCol, Y + 32, { width: 55 });
    doc
      .font("Helvetica")
      .text((quote.status || "Draft").toUpperCase(), rCol + 55, Y + 32, {
        width: 85,
      });

    Y += headerH;
    drawLine(L, Y, R, "#1e3a5f", 2);
    Y += 3;
    drawLine(L, Y, R, "#1e3a5f", 0.5);
    Y += 8;

    doc.rect(L, Y, CW, 22).fillColor("#1e3a5f").fill();
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#fff");
    doc.text("PRICE QUOTATION", L, Y + 5, { width: CW / 2, align: "center" });
    if (hasAr) {
      doc.font("Arabic").fontSize(11).fillColor("#fff");
      doc.text(processArabicText("عرض سعر"), L + CW / 2, Y + 5, {
        width: CW / 2,
        align: "center",
      });
      doc.font("Helvetica");
    }
    Y += 28;

    doc.rect(L, Y, CW, 36).fillColor("#f0f4f8").fill();
    doc.strokeColor("#d0d8e0").lineWidth(0.5).rect(L, Y, CW, 36).stroke();

    const custName = quote.customer_name || "";
    const isArCust = /[\u0600-\u06FF]/.test(custName);

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#1e3a5f");
    doc.text("Customer:", L + 10, Y + 6, { width: 60 });
    if (hasAr && isArCust) {
      doc.font("Arabic").fontSize(9).fillColor("#333");
      doc.text(processArabicText(custName), L + 70, Y + 4, {
        width: CW / 2 - 80,
      });
      doc.font("Helvetica");
    } else {
      doc.font("Helvetica").fontSize(9).fillColor("#333");
      doc.text(custName, L + 70, Y + 6, { width: CW / 2 - 80 });
    }

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#1e3a5f");
    doc.text("Tax Number:", L + 10, Y + 22, { width: 70 });
    doc.font("Helvetica").fontSize(8).fillColor("#333");
    doc.text(quote.tax_number || "N/A", L + 80, Y + 22, { width: 150 });

    if (hasAr) {
      doc.font("Arabic").fontSize(7).fillColor("#888");
      doc.text(processArabicText("العميل"), R - 120, Y + 6, {
        width: 110,
        align: "right",
      });
      doc.text(processArabicText("الرقم الضريبي"), R - 120, Y + 22, {
        width: 110,
        align: "right",
      });
      doc.font("Helvetica");
    }

    Y += 42;

    const colDefs = [
      { w: 30, hdr: "#", hdrAr: "م", align: "center" as const },
      {
        w: CW - 30 - 55 - 60 - 80 - 80,
        hdr: "Description",
        hdrAr: "الوصف",
        align: "left" as const,
      },
      { w: 55, hdr: "Unit", hdrAr: "الوحدة", align: "center" as const },
      { w: 60, hdr: "Qty", hdrAr: "الكمية", align: "center" as const },
      {
        w: 80,
        hdr: "Unit Price",
        hdrAr: "سعر الوحدة",
        align: "center" as const,
      },
      { w: 80, hdr: "Total", hdrAr: "الإجمالي", align: "center" as const },
    ];
    const thH = 20,
      trH = 18;

    doc.rect(L, Y, CW, thH).fillColor("#1e3a5f").fill();
    doc.fillColor("#fff").font("Helvetica-Bold").fontSize(7.5);
    let cx = L;
    colDefs.forEach((c) => {
      doc.text(c.hdr, cx + 3, Y + 3, { width: c.w - 6, align: c.align });
      if (hasAr) {
        doc.font("Arabic").fontSize(6.5);
        doc.text(processArabicText(c.hdrAr), cx + 3, Y + 12, {
          width: c.w - 6,
          align: c.align,
        });
        doc.font("Helvetica-Bold").fontSize(7.5);
      }
      cx += c.w;
    });
    Y += thH;

    const footerNeed = 160 + (quote.notes ? 35 : 0);
    const maxY = PH - M - footerNeed;
    let maxRows = Math.max(0, Math.floor((maxY - Y) / trH));
    if (items.length > maxRows && maxRows > 0)
      maxRows = Math.max(0, maxRows - 1);
    const shown = items.slice(0, maxRows);
    const extra = items.length - shown.length;

    shown.forEach((item, i) => {
      if (i % 2 === 0) {
        doc.rect(L, Y, CW, trH).fillColor("#f8fafc").fill();
      }

      doc.strokeColor("#e8ecf0").lineWidth(0.3);
      doc
        .moveTo(L, Y + trH)
        .lineTo(R, Y + trH)
        .stroke();

      doc.fillColor("#333").fontSize(8);
      cx = L;

      doc.font("Helvetica").text(String(item.line_number), cx + 3, Y + 5, {
        width: colDefs[0].w - 6,
        align: "center",
      });
      cx += colDefs[0].w;

      const nm = (item.item_name || "").substring(0, 55);
      if (hasAr && /[\u0600-\u06FF]/.test(nm)) {
        doc
          .font("Arabic")
          .fontSize(8)
          .text(processArabicText(nm), cx + 3, Y + 3, {
            width: colDefs[1].w - 6,
            align: "right",
          });
        doc.font("Helvetica");
      } else {
        doc.text(nm, cx + 3, Y + 5, { width: colDefs[1].w - 6, align: "left" });
      }
      cx += colDefs[1].w;

      const ut = item.unit || "";
      if (hasAr && /[\u0600-\u06FF]/.test(ut)) {
        doc
          .font("Arabic")
          .fontSize(8)
          .text(processArabicText(ut), cx + 3, Y + 3, {
            width: colDefs[2].w - 6,
            align: "center",
          });
        doc.font("Helvetica");
      } else {
        doc.text(ut, cx + 3, Y + 5, {
          width: colDefs[2].w - 6,
          align: "center",
        });
      }
      cx += colDefs[2].w;

      doc.font("Helvetica").fontSize(8);
      doc.text(fmt(item.quantity), cx + 3, Y + 5, {
        width: colDefs[3].w - 6,
        align: "center",
      });
      cx += colDefs[3].w;
      doc.text(fmt(item.unit_price), cx + 3, Y + 5, {
        width: colDefs[4].w - 6,
        align: "center",
      });
      cx += colDefs[4].w;
      doc.font("Helvetica-Bold").text(fmt(item.line_total), cx + 3, Y + 5, {
        width: colDefs[5].w - 6,
        align: "center",
      });

      Y += trH;
    });

    if (extra > 0) {
      doc.font("Helvetica").fontSize(7).fillColor("#888");
      doc.text(`... +${extra} more items`, L + 5, Y + 3);
      Y += 14;
    }

    drawLine(L, Y, R, "#1e3a5f", 1);
    Y += 8;

    const tW = 220,
      tX = R - tW;

    doc.rect(tX, Y, tW, 54).fillColor("#f0f4f8").fill();
    doc.strokeColor("#1e3a5f").lineWidth(0.5).rect(tX, Y, tW, 54).stroke();

    const lbl = tX + 12,
      val = tX + 100,
      vw = tW - 112;

    doc.font("Helvetica").fontSize(8.5).fillColor("#333");
    doc.text("Subtotal", lbl, Y + 7);
    doc.text(fmt(subtotal) + " SAR", val, Y + 7, { width: vw, align: "right" });
    if (hasAr) arText("المجموع", lbl, Y + 7, 80, { align: "right" });

    doc.text("VAT (15%)", lbl, Y + 21);
    doc.text(fmt(tax) + " SAR", val, Y + 21, { width: vw, align: "right" });
    if (hasAr)
      arText("ضريبة القيمة المضافة", lbl, Y + 21, 80, { align: "right" });

    drawLine(tX + 8, Y + 34, tX + tW - 8, "#1e3a5f", 0.8);

    doc.font("Helvetica-Bold").fontSize(10).fillColor("#1e3a5f");
    doc.text("TOTAL", lbl, Y + 38);
    doc.text(fmt(total) + " SAR", val, Y + 38, { width: vw, align: "right" });
    if (hasAr) {
      doc.font("Arabic").fontSize(9).fillColor("#1e3a5f");
      doc.text(processArabicText("الإجمالي"), lbl, Y + 38, {
        width: 80,
        align: "right",
      });
      doc.font("Helvetica");
    }

    Y += 62;

    if (quote.notes) {
      const nt = (quote.notes || "").substring(0, 300);
      doc.rect(L, Y, CW, 30).fillColor("#fffde7").fill();
      doc.strokeColor("#f9a825").lineWidth(0.5).rect(L, Y, CW, 30).stroke();

      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#e65100");
      doc.text("Notes:", L + 8, Y + 4, { width: 40 });
      if (hasAr) arText("ملاحظات:", L + 50, Y + 4, 60, { align: "left" });

      if (hasAr && /[\u0600-\u06FF]/.test(nt)) {
        doc.font("Arabic").fontSize(8).fillColor("#555");
        doc.text(processArabicText(nt), L + 8, Y + 16, {
          width: CW - 16,
          align: "right",
        });
        doc.font("Helvetica");
      } else {
        doc.font("Helvetica").fontSize(7.5).fillColor("#555");
        doc.text(nt, L + 8, Y + 16, { width: CW - 16 });
      }
      Y += 35;
    }

    const bW = (CW - 15) / 2;

    doc.rect(L, Y, bW, 45).fillColor("#f5f7fa").fill();
    doc.strokeColor("#d0d8e0").lineWidth(0.5).rect(L, Y, bW, 45).stroke();

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#1e3a5f");
    doc.text("Terms & Validity", L + 8, Y + 5, { width: bW - 16 });
    if (hasAr)
      arText("الشروط والصلاحية", L + 8, Y + 5, bW - 16, { align: "right" });

    doc.font("Helvetica").fontSize(7).fillColor("#555");
    doc.text("- Valid for 15 days from issue date", L + 8, Y + 20, {
      width: bW - 16,
    });
    doc.text("- Prices in Saudi Riyals (SAR)", L + 8, Y + 30, {
      width: bW - 16,
    });

    const sX = L + bW + 15;
    doc.rect(sX, Y, bW, 45).fillColor("#f5f7fa").fill();
    doc.strokeColor("#d0d8e0").lineWidth(0.5).rect(sX, Y, bW, 45).stroke();

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#1e3a5f");
    doc.text("Authorized Signature", sX + 8, Y + 5, { width: bW - 16 });
    if (hasAr)
      arText("التوقيع المعتمد", sX + 8, Y + 5, bW - 16, { align: "right" });

    drawLine(sX + 15, Y + 35, sX + bW - 15, "#999", 0.5);

    Y += 50;

    drawLine(L, Y, R, "#d0d8e0", 0.3);
    Y += 5;

    doc.font("Helvetica").fontSize(7).fillColor("#999");
    if (quote.created_by_name) {
      const pn = quote.created_by_name || "";
      const ph = quote.created_by_phone ? ` | ${quote.created_by_phone}` : "";
      if (hasAr && /[\u0600-\u06FF]/.test(pn)) {
        doc.text("Prepared by: ", L, Y, { width: 55 });
        doc
          .font("Arabic")
          .fontSize(7)
          .text(processArabicText(pn) + ph, L + 55, Y, { width: 200 });
        doc.font("Helvetica");
      } else {
        doc.text(`Prepared by: ${pn}${ph}`, L, Y, { width: 300 });
      }
    }
    doc.text("Thank you for your business", L, Y, {
      width: CW,
      align: "right",
    });

    doc.end();
  });
}

export function registerQuoteRoutes(app: Express): void {
  app.get(
    "/api/quotes",
    requireAuth,
    requirePermission("manage_orders", "manage_customers"),
    async (_req: Request, res: Response) => {
      try {
        const allQuotes = await db
          .select()
          .from(quotes)
          .orderBy(desc(quotes.created_at));
        res.json(allQuotes);
      } catch (error) {
        console.error("Error fetching quotes:", error);
        res.status(500).json({ error: "فشل في جلب عروض الأسعار" });
      }
    },
  );

  app.get(
    "/api/quotes/:id",
    requireAuth,
    requirePermission("manage_orders", "manage_customers"),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          return res.status(400).json({ error: "معرف عرض السعر غير صالح" });
        }
        const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
        if (!quote) {
          return res.status(404).json({ error: "عرض السعر غير موجود" });
        }
        const items = await db
          .select()
          .from(quote_items)
          .where(eq(quote_items.quote_id, id))
          .orderBy(quote_items.line_number);
        res.json({ ...quote, items });
      } catch (error) {
        console.error("Error fetching quote:", error);
        res.status(500).json({ error: "فشل في جلب عرض السعر" });
      }
    },
  );

  // نقطة نهاية لتقديم ملفات PDF من التخزين السحابي على الدومين الخاص
  app.get(
    "/api/pdf/quotes/:documentNumber",
    requireAuth,
    requirePermission("manage_orders", "manage_customers"),
    async (req: Request, res: Response) => {
      try {
        const rawDocNumber = req.params.documentNumber;
        const documentNumber = safeStorageFilename(rawDocNumber, "");
        if (!documentNumber) {
          return res.status(400).json({ error: "رقم مستند غير صالح" });
        }

        const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;

        if (bucketId) {
          try {
            const bucket = objectStorageClient.bucket(bucketId);
            const fileName = `quotes/quote_${documentNumber}.pdf`;
            const file = bucket.file(fileName);

            const [exists] = await file.exists();
            if (exists) {
              res.setHeader("Content-Type", "application/pdf");
              res.setHeader(
                "Content-Disposition",
                `inline; filename="quote_${documentNumber}.pdf"`,
              );
              res.setHeader("Cache-Control", "private, no-store");

              const downloadStream = file.createReadStream();
              return await new Promise<void>((resolve) => {
                let settled = false;
                const done = () => {
                  if (settled) return;
                  settled = true;
                  resolve();
                };
                downloadStream.on("error", (err) => {
                  console.error("Storage stream error:", err);
                  if (!res.headersSent) {
                    try {
                      res.status(500).json({ error: "فشل في تحميل ملف PDF" });
                    } catch {}
                  } else {
                    try {
                      res.end();
                    } catch {}
                  }
                  done();
                });
                downloadStream.on("end", done);
                res.on("close", () => {
                  try {
                    downloadStream.destroy();
                  } catch {}
                  done();
                });
                res.on("finish", done);
                downloadStream.pipe(res);
              });
            }
          } catch (storageError) {
            console.warn(
              "Object storage fetch failed, falling back to dynamic generation:",
              storageError,
            );
          }
        }

        const [quote] = await db
          .select()
          .from(quotes)
          .where(eq(quotes.document_number, documentNumber));
        if (!quote) {
          return res.status(404).json({ error: "عرض السعر غير موجود" });
        }

        return res.redirect(`/api/quotes/${quote.id}/pdf`);
      } catch (error) {
        console.error("Error serving PDF:", error);
        res.status(500).json({ error: "فشل في تحميل ملف PDF" });
      }
    },
  );

  app.get(
    "/api/quotes/:id/pdf",
    requireAuth,
    requirePermission("manage_orders", "manage_customers"),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ error: "معرف عرض السعر غير صالح" });
        }

        const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
        if (!quote) {
          return res.status(404).json({ error: "عرض السعر غير موجود" });
        }

        let pdfBuffer: Buffer;
        if (isAdobePdfAvailable()) {
          try {
            pdfBuffer = await generateQuotePdfWithAdobe(id);
          } catch (adobeErr) {
            console.error(
              "Adobe template PDF failed for download, falling back to PDFKit:",
              adobeErr,
            );
            pdfBuffer = await generateQuotePdfBuffer(id);
          }
        } else {
          pdfBuffer = await generateQuotePdfBuffer(id);
        }

        const safeDocNumber = safeStorageFilename(
          quote.document_number,
          String(quote.id),
        );
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Length", pdfBuffer.length);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="quote_${safeDocNumber}.pdf"`,
        );
        res.send(pdfBuffer);
      } catch (error) {
        console.error("Error generating quote PDF:", error);
        if (!res.headersSent) {
          res.status(500).json({ error: "فشل في إنشاء ملف PDF" });
        }
      }
    },
  );

  // ===== نماذج عروض الأسعار =====
  app.get(
    "/api/quote-templates",
    requireAuth,
    requirePermission("manage_orders", "manage_definitions"),
    async (_req: Request, res: Response) => {
      try {
        const templates = await db
          .select()
          .from(quote_templates)
          .orderBy(desc(quote_templates.created_at));
        res.json(templates);
      } catch (error) {
        console.error("Error fetching quote templates:", error);
        res.status(500).json({ error: "فشل في جلب النماذج" });
      }
    },
  );

  app.get(
    "/api/quote-templates/active",
    requireAuth,
    requirePermission("manage_orders", "manage_definitions"),
    async (_req: Request, res: Response) => {
      try {
        const templates = await db
          .select()
          .from(quote_templates)
          .where(eq(quote_templates.is_active, true))
          .orderBy(quote_templates.name);
        res.json(templates);
      } catch (error) {
        console.error("Error fetching active quote templates:", error);
        res.status(500).json({ error: "فشل في جلب النماذج النشطة" });
      }
    },
  );

  app.post(
    "/api/quote-templates",
    requireAuth,
    requirePermission("manage_definitions"),
    async (req: Request, res: Response) => {
      try {
        const {
          name,
          description,
          product_name,
          product_description,
          unit_price,
          unit,
          min_quantity,
          specifications,
          category,
        } = req.body;
        const [newTemplate] = await db
          .insert(quote_templates)
          .values({
            name,
            description,
            product_name,
            product_description,
            unit_price: String(unit_price),
            unit: unit || "كجم",
            min_quantity: min_quantity ? String(min_quantity) : null,
            specifications,
            category,
            is_active: true,
          })
          .returning();
        res.json(newTemplate);
      } catch (error) {
        console.error("Error creating quote template:", error);
        res.status(500).json({ error: "فشل في إنشاء النموذج" });
      }
    },
  );

  app.put(
    "/api/quote-templates/:id",
    requireAuth,
    requirePermission("manage_definitions"),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          return res.status(400).json({ error: "معرف النموذج غير صالح" });
        }
        const {
          name,
          description,
          product_name,
          product_description,
          unit_price,
          unit,
          min_quantity,
          specifications,
          category,
          is_active,
        } = req.body;

        const [updated] = await db
          .update(quote_templates)
          .set({
            name,
            description,
            product_name,
            product_description,
            unit_price: String(unit_price),
            unit,
            min_quantity: min_quantity ? String(min_quantity) : null,
            specifications,
            category,
            is_active,
            updated_at: new Date(),
          })
          .where(eq(quote_templates.id, id))
          .returning();

        res.json(updated);
      } catch (error) {
        console.error("Error updating quote template:", error);
        res.status(500).json({ error: "فشل في تحديث النموذج" });
      }
    },
  );

  app.delete(
    "/api/quote-templates/:id",
    requireAuth,
    requirePermission("manage_definitions"),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          return res.status(400).json({ error: "معرف النموذج غير صالح" });
        }
        await db.delete(quote_templates).where(eq(quote_templates.id, id));
        res.json({ success: true, message: "تم حذف النموذج بنجاح" });
      } catch (error) {
        console.error("Error deleting quote template:", error);
        res.status(500).json({ error: "فشل في حذف النموذج" });
      }
    },
  );
}
