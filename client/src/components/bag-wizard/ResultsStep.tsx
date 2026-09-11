import {
  Download,
  FileJson,
  Image,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useRef, useCallback, useState } from "react";

import { formatNumberAr } from "../../../../shared/number-utils";
import {
  MATERIALS,
  BAG_COLORS,
  HANDLES,
  PRINT_COLORS_PALETTE,
} from "../../lib/bag-rules";
import {
  type BagConfiguration,
  type ValidationResult,
  getBagTypeRules,
  getHangerHeight,
  getBagsPerKg,
  getBagWeightGrams,
} from "../../lib/bag-rules-engine";
import { Button } from "../ui/button";

import { BagPreview } from "./BagPreview";

interface ResultsStepProps {
  config: BagConfiguration;
  validation: ValidationResult;
  onRestart: () => void;
}

async function inlineBlobImages(svgClone: SVGSVGElement): Promise<void> {
  const images = svgClone.querySelectorAll("image");
  const promises = Array.from(images).map(async (imgEl) => {
    const href =
      imgEl.getAttribute("href") ||
      imgEl.getAttributeNS("http://www.w3.org/1999/xlink", "href");
    if (!href || !href.startsWith("blob:")) return;
    try {
      const resp = await fetch(href);
      const blob = await resp.blob();
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((res, rej) => {
        reader.onload = () => res(reader.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      });
      imgEl.setAttribute("href", dataUrl);
      imgEl.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
    } catch {
      imgEl.removeAttribute("href");
      imgEl.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
    }
  });
  await Promise.all(promises);
}

function svgToDataUrl(svgEl: SVGSVGElement): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const clone = svgEl.cloneNode(true) as SVGSVGElement;
      await inlineBlobImages(clone);

      const svgData = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height,
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        resolve(canvas.toDataURL("image/png"));
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        reject(new Error("Image load failed"));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

export function ResultsStep({
  config,
  validation,
  onRestart,
}: ResultsStepProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const exportPreviewRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const rules = getBagTypeRules(config.bagType);
  const material = MATERIALS[config.material];
  const bagColor = BAG_COLORS[config.bagColor];
  const handle = HANDLES[config.handle];

  const printColorNames = config.isPrinted
    ? config.printColors
        .map((id) => {
          const c = PRINT_COLORS_PALETTE.find((p) => p.id === id);
          return c?.label_ar || id;
        })
        .join("، ")
    : "";

  const bagsPerKg = getBagsPerKg(config);
  const bagWeight = getBagWeightGrams(config);

  const specs = [
    { label: "نوع الكيس", value: rules?.label_ar || "-" },
    {
      label: "المادة",
      value: material ? `${material.label_ar} (${material.label_en})` : "-",
    },
    { label: "العرض", value: `${config.width} سم` },
    { label: "الطول", value: `${config.length} سم` },
    { label: "السماكة", value: `${config.thickness} ميكرون` },
    {
      label: "الدخلة الجانبية",
      value: config.sideGusset > 0 ? `${config.sideGusset} سم` : "لا يوجد",
    },
    {
      label: "المقبض",
      value:
        config.handle === "hanger"
          ? `${handle?.label_ar} (ارتفاع ${getHangerHeight(config)} سم)`
          : handle?.label_ar || "بدون",
    },
    { label: "لون الكيس", value: bagColor?.label_ar || "-" },
    { label: "الطباعة", value: config.isPrinted ? "مطبوع" : "سادة" },
    ...(bagWeight
      ? [
          {
            label: "وزن الكيس التقديري",
            value: `${formatNumberAr(bagWeight, 2)} غم`,
          },
        ]
      : []),
    ...(bagsPerKg
      ? [
          {
            label: "عدد الأكياس / كجم",
            value: `≈ ${bagsPerKg.toLocaleString("ar-EG")} كيس`,
          },
        ]
      : []),
    ...(config.isPrinted
      ? [
          {
            label: "جهة الطباعة",
            value: config.printSide === "both" ? "وجهين" : "وجه واحد",
          },
          { label: "عدد ألوان الطباعة", value: `${config.printColors.length}` },
          { label: "ألوان الطباعة", value: printColorNames },
        ]
      : []),
    ...(config.isPrinted && config.printDesign?.texts?.length
      ? [
          {
            label: "نصوص الطباعة",
            value: config.printDesign.texts.map((t) => t.value).join("، "),
          },
        ]
      : []),
  ];

  const exportJSON = useCallback(() => {
    const data = {
      configuration: {
        bagType: config.bagType,
        bagTypeLabel: rules?.label_ar,
        material: config.material,
        materialLabel: material?.label_ar,
        width: config.width,
        length: config.length,
        thickness: config.thickness,
        sideGusset: config.sideGusset,
        handle: config.handle,
        handleLabel: handle?.label_ar,
        handleHeight:
          config.handle === "hanger" ? getHangerHeight(config) : undefined,
        bagColor: config.bagColor,
        bagColorLabel: bagColor?.label_ar,
        isPrinted: config.isPrinted,
        printSide: config.printSide,
        printColors: config.printColors,
        printColorShades: config.printColorShades,
        hasDesignImage: !!config.printDesign?.logoUrl,
        designTexts:
          config.printDesign?.texts?.map((t) => ({
            text: t.value,
            color: t.color,
            size: t.size,
            x: t.x,
            y: t.y,
          })) || [],
      },
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bag-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config, validation, rules, material, handle, bagColor]);

  const exportImage = useCallback(async () => {
    const svgEl = previewRef.current?.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `bag-preview-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const exportPDF = useCallback(async () => {
    setIsExportingPdf(true);

    let imageDataUrl = "";
    try {
      const svgEl =
        exportPreviewRef.current?.querySelector("svg") ||
        previewRef.current?.querySelector("svg");
      if (svgEl) {
        imageDataUrl = await svgToDataUrl(svgEl as SVGSVGElement);
      }
    } catch {
      // continue without image
    }

    const specsHtml = specs
      .map(
        (s) =>
          `<tr><td class="spec-label">${s.label}</td><td class="spec-value">${s.value}</td></tr>`,
      )
      .join("");

    const errorsHtml = validation.errors
      .map((e) => `<li>${e.message}</li>`)
      .join("");
    const warningsHtml = validation.warnings
      .map((w) => `<li>${w.message}</li>`)
      .join("");

    const dateStr = new Date().toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = new Date().toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>بطاقة مواصفات - ${rules?.label_ar || "كيس"}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
    width: 210mm; min-height: 297mm;
    margin: 0 auto; padding: 0; color: #1f2937;
    position: relative;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .header {
    background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%);
    color: white; padding: 16px 28px; display: flex; align-items: center; justify-content: space-between;
  }
  .header-right h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .header-right p { font-size: 10px; opacity: 0.75; }
  .header-left { text-align: left; }
  .header-left .date { font-size: 9px; opacity: 0.7; }
  .header-left .doc-num { font-size: 10px; font-weight: 600; background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 4px; margin-top: 4px; display: inline-block; }
  .status-bar {
    padding: 10px 28px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700;
  }
  .status-valid { background: #dcfce7; color: #166534; }
  .status-invalid { background: #fee2e2; color: #991b1b; }
  .content { display: flex; gap: 18px; padding: 14px 22px 10px; align-items: flex-start; }
  .specs-col { flex: 1; min-width: 0; }
  /* Image area = 30% of page width = ~63mm */
  .preview-col { width: 63mm; flex-shrink: 0; text-align: center; }
  .preview-col .img-frame { width: 63mm; height: 80mm; border: 1.5px solid #1e40af; border-radius: 8px; background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); padding: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(30,64,175,0.08); }
  .preview-col img { max-width: 100%; max-height: 100%; }
  .preview-label { font-size: 10px; color: #1e40af; font-weight: 700; margin-top: 8px; }
  .preview-sub { font-size: 9px; color: #6b7280; margin-top: 2px; }
  .preview-bpk { font-size: 10px; color: #166534; background: #dcfce7; padding: 4px 8px; border-radius: 6px; margin-top: 6px; font-weight: 700; display: inline-block; }
  .section-title { font-size: 11px; font-weight: 700; color: #1e40af; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 2px solid #dbeafe; text-transform: uppercase; letter-spacing: 0.5px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .spec-label { padding: 5px 8px; font-weight: 600; color: #374151; border-bottom: 1px solid #f3f4f6; width: 38%; text-align: right; }
  .spec-value { padding: 5px 8px; color: #6b7280; border-bottom: 1px solid #f3f4f6; text-align: right; }
  tr:nth-child(even) { background: #f9fafb; }
  .issues-section { padding: 4px 28px; }
  .issues-section h3 { font-size: 10px; font-weight: 700; margin-bottom: 3px; }
  .issues-section ul { padding-right: 16px; font-size: 10px; line-height: 1.6; }
  .errors-box { color: #dc2626; }
  .warnings-box { color: #b45309; }
  .footer {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 8px 28px;
    display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #9ca3af;
  }
  .footer-brand { font-weight: 600; color: #6b7280; }
  @media print {
    body { width: 210mm; height: 297mm; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-right">
      <h1>بطاقة مواصفات المنتج</h1>
      <p>Product Specification Sheet — MPBF</p>
    </div>
    <div class="header-left">
      <div class="date">${dateStr} — ${timeStr}</div>
      <div class="doc-num">DOC-${Date.now().toString(36).toUpperCase().slice(-6)}</div>
    </div>
  </div>

  <div class="status-bar ${validation.isValid ? "status-valid" : "status-invalid"}">
    <span>${validation.isValid ? "✅" : "❌"}</span>
    <span>${validation.isValid ? "صالح للتصنيع — يمكن المباشرة بالإنتاج" : "غير صالح للتصنيع — يرجى مراجعة الأخطاء"}</span>
  </div>

  <div class="content">
    <div class="specs-col">
      <div class="section-title">المواصفات الفنية</div>
      <table>${specsHtml}</table>
    </div>
    ${
      imageDataUrl
        ? `
    <div class="preview-col">
      <div class="section-title">المعاينة (مع الأبعاد)</div>
      <div class="img-frame"><img src="${imageDataUrl}" alt="معاينة الكيس" /></div>
      <div class="preview-label">${rules?.label_ar || ""}</div>
      <div class="preview-sub">${config.width} × ${config.length} سم · ${config.thickness} ميكرون</div>
      ${bagsPerKg ? `<div class="preview-bpk">≈ ${bagsPerKg.toLocaleString("ar-EG")} كيس / كجم</div>` : ""}
    </div>`
        : ""
    }
  </div>

  ${errorsHtml ? `<div class="issues-section"><h3 class="errors-box">⛔ الأخطاء</h3><ul class="errors-box">${errorsHtml}</ul></div>` : ""}
  ${warningsHtml ? `<div class="issues-section" style="margin-top:4px"><h3 class="warnings-box">⚠️ التحذيرات</h3><ul class="warnings-box">${warningsHtml}</ul></div>` : ""}

  <div class="footer">
    <span class="footer-brand">MPBF — معالج تصميم الأكياس البلاستيكية</span>
    <span>هذا المستند تم إنشاؤه آلياً — صفحة 1 من 1</span>
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        setIsExportingPdf(false);
      }, 800);
    } else {
      setIsExportingPdf(false);
    }
  }, [specs, validation, rules]);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">النتيجة النهائية</h2>
      <p className="text-gray-500 text-sm mb-6">ملخص المواصفات وحالة التصنيع</p>

      <div
        className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
          validation.isValid
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        {validation.isValid ? (
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
        ) : (
          <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
        )}
        <div>
          <div
            className={`font-bold ${validation.isValid ? "text-green-700" : "text-red-700"}`}
          >
            {validation.isValid ? "صالح للتصنيع ✓" : "غير صالح للتصنيع ✗"}
          </div>
          {!validation.isValid && (
            <div className="text-sm text-red-600 mt-1">
              {validation.errors.length} خطأ يجب معالجته
            </div>
          )}
        </div>
      </div>

      {validation.errors.length > 0 && (
        <div className="mb-4 space-y-2">
          {validation.errors.map((e, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700"
            >
              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{e.message}</span>
            </div>
          ))}
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {validation.warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-sm text-amber-700"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 bg-gray-50 rounded-xl mb-6">
        {specs.map((spec, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-1.5 border-b border-gray-200 last:border-0"
          >
            <span className="text-sm font-medium text-gray-600">
              {spec.label}
            </span>
            <span className="text-sm text-gray-900">{spec.value}</span>
          </div>
        ))}
      </div>

      <div ref={previewRef} className="flex justify-center mb-6">
        <BagPreview config={config} size="lg" showDimensions />
      </div>

      {/* Hidden, dimension-annotated preview used as the source for PDF/PNG export */}
      <div
        ref={exportPreviewRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10000px",
          top: "-10000px",
          width: "560px",
          pointerEvents: "none",
        }}
      >
        <BagPreview config={config} size="xl" showDimensions />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Button
          onClick={exportPDF}
          variant="outline"
          className="gap-2 h-12"
          disabled={isExportingPdf}
        >
          {isExportingPdf ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="text-xs">تنزيل PDF</span>
        </Button>
        <Button onClick={exportImage} variant="outline" className="gap-2 h-12">
          <Image className="h-4 w-4" />
          <span className="text-xs">تنزيل صورة</span>
        </Button>
        <Button onClick={exportJSON} variant="outline" className="gap-2 h-12">
          <FileJson className="h-4 w-4" />
          <span className="text-xs">تصدير JSON</span>
        </Button>
        <Button
          onClick={onRestart}
          variant="outline"
          className="gap-2 h-12 text-blue-600 border-blue-200"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-xs">تصميم جديد</span>
        </Button>
      </div>
    </div>
  );
}
