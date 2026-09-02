import { format } from "date-fns";
import { formatNumberAr } from "../../../../shared/number-utils";

interface RollLabelPrintProps {
  roll: {
    id: number;
    roll_number: string;
    roll_seq: number;
    weight_kg: number;
    machine_id?: string;
    film_machine_id?: string;
    printing_machine_id?: string;
    cutting_machine_id?: string;
    film_machine_name?: string;
    printing_machine_name?: string;
    cutting_machine_name?: string;
    qr_code_text?: string;
    qr_png_base64?: string;
    created_at?: string;
    created_by_name?: string;
    printed_by_name?: string;
    printed_at?: string;
    cut_by_name?: string;
    cut_at?: string;
    cut_weight_total_kg?: number;
    status?: string;
  };
  productionOrder?: {
    production_order_number: string;
    item_name?: string;
    item_name_ar?: string;
    category_name?: string;
    size_caption?: string;
    thickness?: number;
    color?: string;
    raw_material?: string;
    punching?: string;
  };
  order?: {
    order_number: string;
    customer_name?: string;
    customer_name_ar?: string;
  };
}

export function printRollLabel({
  roll,
  productionOrder,
  order,
}: RollLabelPrintProps) {
  const currentLang = localStorage.getItem("i18nextLng") || "ar";
  const resolvedName = (nameAr?: string, nameEn?: string) =>
    currentLang === "en" && nameEn ? nameEn : nameAr || nameEn || "";
  const esc = (val: unknown) =>
    String(val ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  // Only render the QR image when the payload is a plausible base64 string, so a
  // malformed value can never break out of the src="..." attribute.
  const qrPng =
    roll.qr_png_base64 && /^[A-Za-z0-9+/=]+$/.test(roll.qr_png_base64)
      ? roll.qr_png_base64
      : "";

  // A bilingual (Arabic / English) info row. Renders nothing when the value is
  // empty so the 4x6 label never shows blank boxes.
  const row = (
    labelAr: string,
    labelEn: string,
    value?: unknown,
    opts: { full?: boolean; highlight?: boolean } = {},
  ) => {
    const v = value == null || value === "" ? "" : String(value);
    if (!v) return "";
    const cls = `info-box${opts.full ? " full" : ""}${opts.highlight ? " highlight" : ""}`;
    return `
      <div class="${cls}">
        <div class="info-label"><span class="lbl-ar">${esc(labelAr)}</span><span class="lbl-en">${esc(labelEn)}</span></div>
        <div class="info-value">${esc(v)}</div>
      </div>`;
  };

  const printContent = `
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>${esc(`ليبل رول - ${roll.roll_number}`)}</title>
        <style>
          @page {
            size: 4in 6in;
            margin: 0;
          }

          * { box-sizing: border-box; }

          body {
            font-family: 'Tahoma', 'Arial', 'Segoe UI', sans-serif;
            direction: rtl;
            margin: 0;
            padding: 0;
            width: 4in;
            height: 6in;
            font-size: 10pt;
            color: #000;
            background: #fff;
          }

          .label-container {
            width: 4in;
            height: 6in;
            padding: 3mm;
            border: 2px solid #000;
            display: flex;
            flex-direction: column;
          }

          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 1.5mm;
            margin-bottom: 1.5mm;
          }

          .company-name {
            font-size: 8pt;
            font-weight: bold;
            color: #000;
            line-height: 1.2;
          }

          .roll-number {
            font-size: 18pt;
            font-weight: 800;
            background: #000;
            color: #fff;
            padding: 1.5mm 3mm;
            margin-top: 1.5mm;
            border-radius: 1.5mm;
            display: inline-block;
            letter-spacing: 0.5px;
          }

          .order-line {
            margin-top: 1.5mm;
            font-size: 10pt;
            font-weight: bold;
          }
          .order-line .sep { color: #888; font-weight: normal; margin: 0 4px; }

          .qr-section {
            text-align: center;
            margin-bottom: 1.5mm;
          }
          .qr-image { width: 26mm; height: 26mm; }

          .main-info {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5mm;
            align-content: start;
          }

          .info-box {
            border: 1px solid #333;
            border-radius: 1mm;
            padding: 1.2mm 2mm;
            background: #fff;
          }
          .info-box.full { grid-column: 1 / -1; }
          .info-box.highlight {
            background: #fff2cc;
            border: 2px solid #000;
          }

          .info-label {
            font-size: 7pt;
            color: #555;
            font-weight: 700;
            margin-bottom: 0.5mm;
            display: flex;
            justify-content: space-between;
            gap: 4px;
          }
          .info-label .lbl-en {
            color: #999;
            text-transform: uppercase;
            font-weight: 600;
            direction: ltr;
          }

          .info-value {
            font-size: 11pt;
            font-weight: bold;
            color: #000;
            line-height: 1.15;
            word-wrap: break-word;
          }
          .info-box.highlight .info-value { font-size: 14pt; }

          .operators .info-value {
            font-size: 8.5pt;
            font-weight: normal;
            line-height: 1.4;
          }
          .operators strong { font-weight: bold; }

          .footer {
            margin-top: auto;
            padding-top: 1.5mm;
            border-top: 1px solid #333;
            text-align: center;
            font-size: 6.5pt;
            color: #666;
          }

          @media print {
            body { margin: 0; padding: 0; }
            .label-container { page-break-after: always; }
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="header">
            <div class="company-name">نظام إدارة إنتاج الأكياس البلاستيكية<br>Plastic Bag Production System</div>
            <div class="roll-number">${esc(roll.roll_number)}</div>
            ${
              order && order.order_number
                ? `<div class="order-line">الطلب<span class="sep">/</span>Order: ${esc(order.order_number)}</div>`
                : ""
            }
          </div>

          ${
            qrPng
              ? `<div class="qr-section"><img src="data:image/png;base64,${qrPng}" class="qr-image" alt="QR"></div>`
              : ""
          }

          <div class="main-info">
            ${
              order && (order.customer_name_ar || order.customer_name)
                ? row("العميل", "Customer", resolvedName(order.customer_name_ar, order.customer_name), { full: true })
                : ""
            }
            ${
              productionOrder && (productionOrder.item_name_ar || productionOrder.item_name)
                ? row("المنتج", "Product", resolvedName(productionOrder.item_name_ar, productionOrder.item_name), { full: true })
                : ""
            }
            ${
              productionOrder && productionOrder.size_caption
                ? row("المقاس", "Size", productionOrder.size_caption, { full: true })
                : ""
            }
            ${productionOrder ? row("نوع الخام", "Material", productionOrder.raw_material) : ""}
            ${
              productionOrder && productionOrder.thickness != null
                ? row("السماكة", "Thickness", `${parseFloat(String(productionOrder.thickness))} µm`)
                : ""
            }
            ${productionOrder ? row("أمر الإنتاج", "PO", productionOrder.production_order_number) : ""}
            ${roll.roll_seq != null ? row("رقم الرول", "Roll #", `#${roll.roll_seq}`) : ""}
            <div class="info-box highlight full">
              <div class="info-label"><span class="lbl-ar">الوزن</span><span class="lbl-en">Weight</span></div>
              <div class="info-value">${formatNumberAr(roll.weight_kg != null ? parseFloat(String(roll.weight_kg)) : 0, 2)} كجم / kg</div>
            </div>
            ${
              roll.film_machine_name || roll.machine_id
                ? row("ماكينة الفيلم", "Film Machine", roll.film_machine_name || roll.machine_id, { full: true })
                : ""
            }
            ${
              roll.created_by_name || roll.printed_by_name || roll.cut_by_name
                ? `
              <div class="info-box full operators">
                <div class="info-label"><span class="lbl-ar">العاملون</span><span class="lbl-en">Operators</span></div>
                <div class="info-value">
                  ${roll.created_by_name ? `<div>▪ فيلم / Film: <strong>${esc(roll.created_by_name)}</strong></div>` : ""}
                  ${roll.printed_by_name ? `<div>▪ طباعة / Print: <strong>${esc(roll.printed_by_name)}</strong></div>` : ""}
                  ${roll.cut_by_name ? `<div>▪ قص / Cut: <strong>${esc(roll.cut_by_name)}</strong></div>` : ""}
                </div>
              </div>`
                : ""
            }
            ${
              roll.created_at
                ? row("تاريخ الإنتاج", "Date", format(new Date(roll.created_at), "dd/MM/yyyy - HH:mm"), { full: true })
                : ""
            }
          </div>

          <div class="footer">
            طُبع في / Printed: ${format(new Date(), "dd/MM/yyyy - HH:mm")}
          </div>
        </div>
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

export default function RollLabelButton({
  roll,
  productionOrder,
  order,
  children,
}: RollLabelPrintProps & { children?: React.ReactNode }) {
  return (
    <button
      onClick={() => printRollLabel({ roll, productionOrder, order })}
      className="inline-flex items-center"
    >
      {children}
    </button>
  );
}
