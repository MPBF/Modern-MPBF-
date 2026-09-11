const esc = (val: unknown) =>
  String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const ACTION_TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  inspection: { ar: "فحص", en: "Inspection" },
  cleaning: { ar: "تنظيف", en: "Cleaning" },
  lubrication: { ar: "تشحيم", en: "Lubrication" },
  adjustment: { ar: "ضبط", en: "Adjustment" },
  repair: { ar: "إصلاح", en: "Repair" },
  replacement: { ar: "استبدال", en: "Replacement" },
};

const CONDITION_LABELS: Record<string, { ar: string; en: string }> = {
  good: { ar: "جيدة", en: "Good" },
  fair: { ar: "مقبولة", en: "Fair" },
  poor: { ar: "ضعيفة", en: "Poor" },
};

const actionTypeLabel = (type: string, isAr: boolean) => {
  const l = ACTION_TYPE_LABELS[type];
  if (!l) return type;
  return isAr ? l.ar : l.en;
};

const conditionLabel = (cond: string | null | undefined, isAr: boolean) => {
  if (!cond) return "-";
  const l = CONDITION_LABELS[cond];
  if (!l) return cond;
  return isAr ? l.ar : l.en;
};

const fmtDate = (dateStr?: string | null, isAr = true) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(isAr ? "ar" : "en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const fmtNum = (val: unknown, decimals = 2) => {
  const n = Number(val ?? 0);
  if (isNaN(n)) return "0";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

const elapsedDays = (dateStr?: string | null, isAr = true) => {
  if (!dateStr) return "-";
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "-";
  const days = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
  if (days <= 0) return isAr ? "اليوم" : "Today";
  return isAr ? `منذ ${days} يوم` : `${days} days ago`;
};

const baseStyles = `
  * { box-sizing: border-box; }
  body {
    font-family: 'Tahoma', 'Arial', 'Segoe UI', sans-serif;
    direction: rtl;
    margin: 0;
    padding: 12mm;
    color: #111;
    background: #fff;
    font-size: 11pt;
  }
  .doc-header {
    text-align: center;
    border-bottom: 3px solid #2563eb;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
  .company-name { font-size: 13pt; font-weight: bold; line-height: 1.4; }
  .company-name .en { display: block; font-size: 9pt; color: #555; }
  .doc-title {
    font-size: 15pt;
    font-weight: 800;
    color: #2563eb;
    margin-top: 8px;
  }
  .doc-title .en { font-size: 10pt; color: #555; font-weight: 600; }
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
    margin-bottom: 16px;
  }
  .meta-box {
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 6px 10px;
    background: #f9fafb;
  }
  .meta-label {
    font-size: 8pt;
    color: #6b7280;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    gap: 6px;
  }
  .meta-label .en { color: #9ca3af; direction: ltr; text-transform: uppercase; }
  .meta-value { font-size: 11pt; font-weight: bold; margin-top: 2px; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 10pt;
  }
  thead th {
    background: #2563eb;
    color: #fff;
    padding: 8px 6px;
    text-align: center;
    border: 1px solid #1d4ed8;
    font-weight: 700;
  }
  thead th .en { display: block; font-size: 7.5pt; font-weight: 500; opacity: 0.85; }
  tbody td {
    padding: 7px 6px;
    text-align: center;
    border: 1px solid #e5e7eb;
  }
  tbody tr:nth-child(even) { background: #f9fafb; }
  .total-row td {
    font-weight: 800;
    background: #eff6ff;
    border-top: 2px solid #2563eb;
  }
  .notes-block {
    margin-top: 14px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 8px 10px;
    background: #f9fafb;
  }
  .notes-block .label { font-size: 8pt; color: #6b7280; font-weight: 700; }
  .footer {
    margin-top: 20px;
    padding-top: 8px;
    border-top: 1px solid #d1d5db;
    text-align: center;
    font-size: 8pt;
    color: #6b7280;
  }
  @media print { body { padding: 8mm; } }
`;

const COMPANY_HEADER = `
  <div class="doc-header">
    <div class="company-name">
      نظام إدارة إنتاج الأكياس البلاستيكية
      <span class="en">Plastic Bag Production Management System</span>
    </div>
  </div>`;

function openAndPrint(html: string, title: string) {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  printWindow.document.write(`
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>${esc(title)}</title>
        <style>${baseStyles}</style>
      </head>
      <body>${html}</body>
    </html>`);
  printWindow.document.close();
  printWindow.focus();

  const triggerPrint = () => {
    if (printWindow && !printWindow.closed) printWindow.print();
  };
  printWindow.onload = triggerPrint;
  if (printWindow.document.readyState === "complete") {
    triggerPrint();
  } else {
    setTimeout(triggerPrint, 500);
  }
}

interface PreventiveActionItem {
  component_name_ar?: string;
  component_name_en?: string;
  action_type: string;
  quantity?: number;
  cost?: number | string;
  condition?: string | null;
  notes?: string | null;
}

interface PreventiveActionDoc {
  action_number?: string;
  action_date?: string | null;
  total_cost?: number | string;
  notes?: string | null;
  items?: PreventiveActionItem[];
}

export function printPreventiveAction(
  action: PreventiveActionDoc,
  machineName: string,
  sectionName: string,
  isAr: boolean,
) {
  const metaBox = (
    labelAr: string,
    labelEn: string,
    value: string,
  ) => `
    <div class="meta-box">
      <div class="meta-label"><span>${esc(labelAr)}</span><span class="en">${esc(labelEn)}</span></div>
      <div class="meta-value">${esc(value)}</div>
    </div>`;

  const items = action.items || [];
  const rows = items
    .map(
      (it) => `
      <tr>
        <td>${esc(isAr ? it.component_name_ar || it.component_name_en : it.component_name_en || it.component_name_ar)}</td>
        <td>${esc(actionTypeLabel(it.action_type, isAr))}</td>
        <td>${esc(fmtNum(it.quantity ?? 1, 0))}</td>
        <td>${esc(conditionLabel(it.condition, isAr))}</td>
        <td>${esc(fmtNum(it.cost))}</td>
        <td>${esc(it.notes || "-")}</td>
      </tr>`,
    )
    .join("");

  const title = isAr
    ? `إجراء وقائي ${action.action_number || ""}`
    : `Preventive Action ${action.action_number || ""}`;

  const html = `
    ${COMPANY_HEADER}
    <div class="doc-title">
      ${isAr ? "تقرير إجراء صيانة وقائية" : "Preventive Maintenance Action Report"}
      <span class="en">${isAr ? "Preventive Maintenance Action" : "تقرير إجراء صيانة وقائية"}</span>
    </div>
    <div class="meta-grid" style="margin-top:16px">
      ${metaBox("رقم الإجراء", "Action No.", action.action_number || "-")}
      ${metaBox("تاريخ الإجراء", "Action Date", fmtDate(action.action_date, isAr))}
      ${metaBox("الماكينة", "Machine", machineName || "-")}
      ${metaBox("القسم", "Section", sectionName || "-")}
    </div>
    <table>
      <thead>
        <tr>
          <th>${isAr ? "المكوّن" : "Component"}<span class="en">${isAr ? "Component" : "المكوّن"}</span></th>
          <th>${isAr ? "نوع الإجراء" : "Action Type"}<span class="en">${isAr ? "Action Type" : "نوع الإجراء"}</span></th>
          <th>${isAr ? "الكمية" : "Qty"}<span class="en">${isAr ? "Qty" : "الكمية"}</span></th>
          <th>${isAr ? "الحالة" : "Condition"}<span class="en">${isAr ? "Condition" : "الحالة"}</span></th>
          <th>${isAr ? "التكلفة" : "Cost"}<span class="en">${isAr ? "Cost" : "التكلفة"}</span></th>
          <th>${isAr ? "ملاحظات" : "Notes"}<span class="en">${isAr ? "Notes" : "ملاحظات"}</span></th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="6">${isAr ? "لا توجد بنود" : "No items"}</td></tr>`}
        <tr class="total-row">
          <td colspan="4">${isAr ? "إجمالي التكلفة" : "Total Cost"}</td>
          <td>${esc(fmtNum(action.total_cost))}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    ${
      action.notes
        ? `<div class="notes-block">
            <div class="label">${isAr ? "ملاحظات / Notes" : "Notes / ملاحظات"}</div>
            <div>${esc(action.notes)}</div>
          </div>`
        : ""
    }
    <div class="footer">
      ${isAr ? "طُبع في" : "Printed"}: ${new Date().toLocaleString(isAr ? "ar" : "en")}
    </div>`;

  openAndPrint(html, title);
}

interface ReferenceRow {
  component_name_ar?: string;
  component_name_en?: string;
  action_type: string;
  action_date?: string | null;
}

export function printPreventiveReference(
  machineName: string,
  rows: ReferenceRow[],
  isAr: boolean,
) {
  const body = rows
    .map(
      (r) => `
      <tr>
        <td>${esc(isAr ? r.component_name_ar || r.component_name_en : r.component_name_en || r.component_name_ar)}</td>
        <td>${esc(actionTypeLabel(r.action_type, isAr))}</td>
        <td>${esc(fmtDate(r.action_date, isAr))}</td>
        <td>${esc(elapsedDays(r.action_date, isAr))}</td>
      </tr>`,
    )
    .join("");

  const title = isAr
    ? `آخر إجراء لكل مكوّن - ${machineName}`
    : `Last Action per Component - ${machineName}`;

  const html = `
    ${COMPANY_HEADER}
    <div class="doc-title">
      ${isAr ? "آخر إجراء صيانة وقائية لكل مكوّن" : "Last Preventive Action per Component"}
      <span class="en">${isAr ? "Last Action per Component" : "آخر إجراء لكل مكوّن"}</span>
    </div>
    <div class="meta-grid" style="grid-template-columns:1fr;margin-top:16px">
      <div class="meta-box">
        <div class="meta-label"><span>الماكينة</span><span class="en">Machine</span></div>
        <div class="meta-value">${esc(machineName || "-")}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>${isAr ? "المكوّن" : "Component"}<span class="en">${isAr ? "Component" : "المكوّن"}</span></th>
          <th>${isAr ? "آخر إجراء" : "Last Action"}<span class="en">${isAr ? "Last Action" : "آخر إجراء"}</span></th>
          <th>${isAr ? "آخر تاريخ" : "Last Date"}<span class="en">${isAr ? "Last Date" : "آخر تاريخ"}</span></th>
          <th>${isAr ? "المدة المنقضية" : "Elapsed"}<span class="en">${isAr ? "Elapsed" : "المدة المنقضية"}</span></th>
        </tr>
      </thead>
      <tbody>
        ${body || `<tr><td colspan="4">${isAr ? "لا يوجد سجل" : "No history"}</td></tr>`}
      </tbody>
    </table>
    <div class="footer">
      ${isAr ? "طُبع في" : "Printed"}: ${new Date().toLocaleString(isAr ? "ar" : "en")}
    </div>`;

  openAndPrint(html, title);
}
