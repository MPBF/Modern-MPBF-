import { format } from "date-fns";

import { formatNumberAr } from "../../../../shared/number-utils";

export interface BatchLabelData {
  batch_number: string;
  production_order_number?: string;
  order_number?: string;
  customer_name?: string;
  customer_name_ar?: string;
  item_name?: string;
  item_name_ar?: string;
  size_caption?: string;
  net_quantity_kg?: string | number;
  final_quantity_kg?: string | number;
  production_date?: string | null;
  qr_png_base64?: string;
  operators?: {
    film?: string[];
    printing?: string[];
    cutting?: string[];
  };
}

export interface BatchPackagingUnit {
  id: number;
  name: string;
  unit_weight_kg: string | number;
}

interface PrintBatchLabelsArgs {
  data: BatchLabelData;
  packagingUnit: BatchPackagingUnit;
  unitCount: number;
}

const esc = (val: unknown) =>
  String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function computeUnitCount(
  netQuantityKg: string | number | undefined,
  unitWeightKg: string | number | undefined,
): number {
  const net = parseFloat(String(netQuantityKg ?? "0"));
  const unit = parseFloat(String(unitWeightKg ?? "0"));
  if (!Number.isFinite(net) || net <= 0) return 0;
  if (!Number.isFinite(unit) || unit <= 0) return 0;
  return Math.ceil(net / unit);
}

export function printBatchLabels({
  data,
  packagingUnit,
  unitCount,
}: PrintBatchLabelsArgs) {
  const currentLang = localStorage.getItem("i18nextLng") || "ar";
  const resolvedName = (nameAr?: string, nameEn?: string) =>
    currentLang === "en" && nameEn ? nameEn : nameAr || nameEn || "";

  const qrPng =
    data.qr_png_base64 && /^[A-Za-z0-9+/=]+$/.test(data.qr_png_base64)
      ? data.qr_png_base64
      : "";

  const customer = resolvedName(data.customer_name_ar, data.customer_name);
  const product = resolvedName(data.item_name_ar, data.item_name);
  const unitWeight = parseFloat(String(packagingUnit.unit_weight_kg ?? "0"));
  const total = Math.max(1, unitCount);
  const netQuantity = parseFloat(
    String(data.net_quantity_kg ?? data.final_quantity_kg ?? "0"),
  );

  // Each unit carries the full packaging weight, except the final unit which
  // carries the remainder (net quantity − full units). e.g. 190kg / 20kg →
  // nine units of 20kg and a last unit of 10kg.
  const weightForIndex = (index: number): number => {
    if (!Number.isFinite(unitWeight) || unitWeight <= 0) return 0;
    if (!Number.isFinite(netQuantity) || netQuantity <= 0) return unitWeight;
    if (index < total) return unitWeight;
    const remainder = netQuantity - (total - 1) * unitWeight;
    return remainder > 0 && remainder <= unitWeight ? remainder : unitWeight;
  };

  const productionDate = data.production_date
    ? format(new Date(data.production_date), "dd/MM/yyyy")
    : format(new Date(), "dd/MM/yyyy");

  const operatorsBlock = (() => {
    const ops = data.operators || {};
    const line = (
      labelAr: string,
      labelEn: string,
      names?: string[],
    ) =>
      names && names.length
        ? `<div>▪ ${esc(labelAr)} / ${esc(labelEn)}: <strong>${esc(
            names.join("، "),
          )}</strong></div>`
        : "";
    const inner =
      line("فيلم", "Film", ops.film) +
      line("طباعة", "Print", ops.printing) +
      line("قص", "Cut", ops.cutting);
    if (!inner) return "";
    return `
      <div class="info-box full operators">
        <div class="info-label"><span class="lbl-ar">العاملون</span><span class="lbl-en">Operators</span></div>
        <div class="info-value">${inner}</div>
      </div>`;
  })();

  const row = (
    labelAr: string,
    labelEn: string,
    value?: unknown,
    opts: { full?: boolean; highlight?: boolean } = {},
  ) => {
    const v = value == null || value === "" ? "" : String(value);
    if (!v) return "";
    const cls = `info-box${opts.full ? " full" : ""}${
      opts.highlight ? " highlight" : ""
    }`;
    return `
      <div class="${cls}">
        <div class="info-label"><span class="lbl-ar">${esc(
          labelAr,
        )}</span><span class="lbl-en">${esc(labelEn)}</span></div>
        <div class="info-value">${esc(v)}</div>
      </div>`;
  };

  const labelHtml = (index: number) => `
    <div class="label-container">
      <div class="header">
        <div class="company-name">نظام إدارة إنتاج الأكياس البلاستيكية<br>Plastic Bag Production System</div>
        <div class="batch-number">${esc(data.batch_number)}</div>
        ${
          data.order_number
            ? `<div class="order-line">الطلب<span class="sep">/</span>Order: ${esc(
                data.order_number,
              )}</div>`
            : ""
        }
      </div>

      ${
        qrPng
          ? `<div class="qr-section"><img src="data:image/png;base64,${qrPng}" class="qr-image" alt="QR"></div>`
          : ""
      }

      <div class="main-info">
        ${customer ? row("العميل", "Customer", customer, { full: true }) : ""}
        ${product ? row("المنتج", "Product", product, { full: true }) : ""}
        ${data.size_caption ? row("المقاس", "Size", data.size_caption, { full: true }) : ""}
        ${row("وحدة التعبئة", "Packaging", packagingUnit.name, { full: true })}
        <div class="info-box highlight">
          <div class="info-label"><span class="lbl-ar">رقم الوحدة</span><span class="lbl-en">Unit #</span></div>
          <div class="info-value">${index} / ${total}</div>
        </div>
        <div class="info-box highlight">
          <div class="info-label"><span class="lbl-ar">الوزن الصافي</span><span class="lbl-en">Net Weight</span></div>
          <div class="info-value">${formatNumberAr(weightForIndex(index), 2)} كجم / kg</div>
        </div>
        ${operatorsBlock}
        ${row("تاريخ الإنتاج", "Production Date", productionDate, { full: true })}
      </div>

      <div class="footer">
        طُبع في / Printed: ${format(new Date(), "dd/MM/yyyy - HH:mm")}
      </div>
    </div>`;

  const labels: string[] = [];
  for (let i = 1; i <= total; i++) labels.push(labelHtml(i));

  const printContent = `
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>${esc(`ملصقات الباتش - ${data.batch_number}`)}</title>
        <style>
          @page { size: 4in 6in; margin: 0; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Tahoma', 'Arial', 'Segoe UI', sans-serif;
            direction: rtl; margin: 0; padding: 0;
            font-size: 10pt; color: #000; background: #fff;
          }
          .label-container {
            width: 4in; height: 6in; padding: 3mm;
            border: 2px solid #000; display: flex; flex-direction: column;
            page-break-after: always;
          }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 1.5mm; margin-bottom: 1.5mm; }
          .company-name { font-size: 8pt; font-weight: bold; color: #000; line-height: 1.2; }
          .batch-number {
            font-size: 16pt; font-weight: 800; background: #000; color: #fff;
            padding: 1.5mm 3mm; margin-top: 1.5mm; border-radius: 1.5mm;
            display: inline-block; letter-spacing: 0.5px;
          }
          .order-line { margin-top: 1.5mm; font-size: 10pt; font-weight: bold; }
          .order-line .sep { color: #888; font-weight: normal; margin: 0 4px; }
          .qr-section { text-align: center; margin-bottom: 1.5mm; }
          .qr-image { width: 26mm; height: 26mm; }
          .main-info { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5mm; align-content: start; }
          .info-box { border: 1px solid #333; border-radius: 1mm; padding: 1.2mm 2mm; background: #fff; }
          .info-box.full { grid-column: 1 / -1; }
          .info-box.highlight { background: #fff2cc; border: 2px solid #000; }
          .info-label { font-size: 7pt; color: #555; font-weight: 700; margin-bottom: 0.5mm; display: flex; justify-content: space-between; gap: 4px; }
          .info-label .lbl-en { color: #999; text-transform: uppercase; font-weight: 600; direction: ltr; }
          .info-value { font-size: 11pt; font-weight: bold; color: #000; line-height: 1.15; word-wrap: break-word; }
          .info-box.highlight .info-value { font-size: 13pt; }
          .operators .info-value { font-size: 8.5pt; font-weight: normal; line-height: 1.4; }
          .operators strong { font-weight: bold; }
          .footer { margin-top: auto; padding-top: 1.5mm; border-top: 1px solid #333; text-align: center; font-size: 6.5pt; color: #666; }
          @media print { body { margin: 0; padding: 0; } }
        </style>
      </head>
      <body>
        ${labels.join("\n")}
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=384,height=576");
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
    };
    if (printWindow.document.readyState === "complete") {
      printWindow.print();
    } else {
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.print();
        }
      }, 500);
    }
  }
}
