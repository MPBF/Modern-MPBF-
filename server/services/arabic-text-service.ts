// @ts-ignore
import ArabicReshaper from "arabic-reshaper";
// @ts-ignore
import bidiFactory from "bidi-js";

const bidi = bidiFactory();

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

export function isArabicText(text: string): boolean {
  return ARABIC_REGEX.test(text || "");
}

export function processArabicText(text: string): string {
  if (!text) return "";
  if (!ARABIC_REGEX.test(text)) return text;

  try {
    const reshaped = ArabicReshaper.convertArabic(text);
    const embeddingLevels = bidi.getEmbeddingLevels(reshaped, "rtl");
    return bidi.getReorderedString(reshaped, embeddingLevels);
  } catch (e) {
    console.error("Arabic text processing error:", e);
    return text;
  }
}

// لاستخدامها مع pdfkit عند تمرير features: ["rtla"]: يترك النص العربي كما هو
// (fontkit يتولى التشكيل و rtla يتولى الاتجاه) لكن يعكس مقاطع الأرقام/اللاتينية
// مسبقاً حتى يعيدها rtla إلى اتجاهها الصحيح (وإلا تظهر 120 كـ 021).
export function prepareArabicForPdf(text: string): string {
  if (!text) return "";
  if (!ARABIC_REGEX.test(text)) return text;
  const MIRROR: Record<string, string> = {
    "(": ")",
    ")": "(",
    "[": "]",
    "]": "[",
    "{": "}",
    "}": "{",
    "<": ">",
    ">": "<",
  };
  return text
    .replace(
      /[0-9A-Za-z][0-9A-Za-z.,:%\/\-]*|[%][0-9][0-9.,]*/g,
      (run) => run.split("").reverse().join(""),
    )
    .replace(/[()\[\]{}<>]/g, (ch) => MIRROR[ch]);
}

// لاستخدامها مع pdfkit + fontkit: يعيد ترتيب الكلمات (Bidi) فقط دون إعادة تشكيل،
// لأن fontkit يتولى تشكيل الحروف تلقائياً من حروف Unicode الأصلية.
export function bidiReorderArabic(text: string): string {
  if (!text) return "";
  if (!ARABIC_REGEX.test(text)) return text;
  try {
    const embeddingLevels = bidi.getEmbeddingLevels(text, "rtl");
    return bidi.getReorderedString(text, embeddingLevels);
  } catch (e) {
    console.error("Arabic bidi reorder error:", e);
    return text;
  }
}
