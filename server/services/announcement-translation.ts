import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  // Explicitly clear the org header. The SDK otherwise auto-sends
  // OPENAI_ORG_ID from the environment, which does not match the
  // Replit AI integration key and causes a 401 mismatched_organization.
  organization: null,
});

export const SUPPORTED_ANNOUNCEMENT_LANGUAGES: Record<string, string> = {
  en: "English",
  ur: "Urdu (اردو)",
  hi: "Hindi (हिन्दी)",
  fil: "Filipino (Tagalog)",
  ne: "Nepali (नेपाली)",
};

export interface AnnouncementText {
  title?: string;
  message?: string;
  footer?: string;
}

export type AnnouncementTranslations = Record<string, AnnouncementText>;

function sanitizeLanguages(languages: unknown): string[] {
  if (!Array.isArray(languages)) return [];
  return languages
    .filter((l): l is string => typeof l === "string")
    .filter((l) => l in SUPPORTED_ANNOUNCEMENT_LANGUAGES);
}

export async function translateAnnouncement(
  source: AnnouncementText,
  languages: unknown,
): Promise<AnnouncementTranslations> {
  const targetLangs = sanitizeLanguages(languages);
  if (targetLangs.length === 0) {
    throw new Error("لم يتم تحديد لغات صالحة للترجمة");
  }

  const title = (source.title || "").trim();
  const message = (source.message || "").trim();
  const footer = (source.footer || "").trim();

  if (!title && !message && !footer) {
    throw new Error("لا يوجد نص للترجمة");
  }

  const langList = targetLangs
    .map((code) => `"${code}" (${SUPPORTED_ANNOUNCEMENT_LANGUAGES[code]})`)
    .join(", ");

  const systemPrompt =
    "You are a professional translator for factory-floor announcements. " +
    "Translate the given administrative announcement faithfully and naturally " +
    "into each requested target language. Keep the tone clear and respectful for " +
    "workers. Preserve line breaks. Do not add extra commentary, notes, or " +
    "explanations. If a field is empty, return an empty string for it. " +
    "Return ONLY valid JSON.";

  const userPrompt = `Translate this announcement into the following languages: ${langList}.

Source (may be Arabic or any language):
- title: ${JSON.stringify(title)}
- message: ${JSON.stringify(message)}
- footer: ${JSON.stringify(footer)}

Respond with a JSON object of this exact shape, where each key is the language code:
{
  "translations": {
    ${targetLangs
      .map(
        (code) =>
          `"${code}": { "title": "...", "message": "...", "footer": "..." }`,
      )
      .join(",\n    ")}
  }
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.1",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("تعذر تحليل نتيجة الترجمة");
  }

  const translations: AnnouncementTranslations = {};
  const result = parsed?.translations || parsed || {};
  for (const code of targetLangs) {
    const entry = result[code] || {};
    translations[code] = {
      title: typeof entry.title === "string" ? entry.title : "",
      message: typeof entry.message === "string" ? entry.message : "",
      footer: typeof entry.footer === "string" ? entry.footer : "",
    };
  }

  return translations;
}

export function announcementSourceSignature(content: any): string {
  // Note: separator must NOT be a null byte (\u0000) — PostgreSQL jsonb
  // rejects null bytes in text. Must stay in sync with the frontend.
  return `${content?.title || ""}|::SEP::|${content?.message || ""}|::SEP::|${
    content?.footer || ""
  }`;
}

// Ensures an announcement/notification slide's `content.translations` are present
// and in sync with the current source text whenever auto-translate is enabled.
// Runs on save so admins only need to enable it and pick languages.
export async function ensureAnnouncementTranslations(content: any): Promise<any> {
  if (!content || typeof content !== "object" || !content.autoTranslate) {
    return content;
  }

  const langs: string[] = Array.isArray(content.translateLangs)
    ? content.translateLangs.filter(
        (l: any): l is string =>
          typeof l === "string" && l in SUPPORTED_ANNOUNCEMENT_LANGUAGES,
      )
    : [];

  if (langs.length === 0) {
    return { ...content, translations: {}, translatedSource: "" };
  }

  const hasText = !!(
    (content.title && String(content.title).trim()) ||
    (content.message && String(content.message).trim()) ||
    (content.footer && String(content.footer).trim())
  );
  if (!hasText) {
    return { ...content, translations: {}, translatedSource: "" };
  }

  const sig = announcementSourceSignature(content);
  const existing = content.translations || {};
  const hasAllLangs = langs.every((l) => {
    const tr = existing[l];
    return tr && (tr.title || tr.message || tr.footer);
  });

  // Up to date: source unchanged and all requested languages present.
  if (content.translatedSource === sig && hasAllLangs) {
    return content;
  }

  try {
    const translations = await translateAnnouncement(
      {
        title: content.title,
        message: content.message,
        footer: content.footer,
      },
      langs,
    );
    return { ...content, translations, translatedSource: sig };
  } catch (err) {
    console.error("Auto-translate on save failed:", err);
    // Don't block saving the slide if translation fails.
    return content;
  }
}
