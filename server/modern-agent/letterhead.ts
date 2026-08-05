import { db } from "../db";
import { company_profile } from "@shared/schema";
import { ObjectStorageService } from "../replit_integrations/object_storage/objectStorage";

export interface LetterheadImage {
  buffer: Buffer;
  width: number;
  height: number;
  type: "png" | "jpg";
}

export interface LetterheadData {
  headerImage?: LetterheadImage;
  footerImage?: LetterheadImage;
  logoImage?: LetterheadImage;
  footerText?: string;
  signatures?: string[];
}

// Parse PNG / JPEG dimensions without external deps.
export function getImageInfo(
  buf: Buffer,
): { width: number; height: number; type: "png" | "jpg" } | null {
  if (
    buf.length > 24 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
      type: "png",
    };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buf[offset + 1];
      // SOF0..SOF15 (excluding DHT/JPG/DAC markers 0xC4, 0xC8, 0xCC)
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return {
          height: buf.readUInt16BE(offset + 5),
          width: buf.readUInt16BE(offset + 7),
          type: "jpg",
        };
      }
      const len = buf.readUInt16BE(offset + 2);
      offset += 2 + len;
    }
  }
  return null;
}

async function downloadObjectToBuffer(
  objectPath: string,
): Promise<Buffer | null> {
  try {
    const svc = new ObjectStorageService();
    const file = await svc.getObjectEntityFile(objectPath);
    const [contents] = await file.download();
    return contents as Buffer;
  } catch (err) {
    console.warn(
      `[Letterhead] Failed to download image ${objectPath}:`,
      (err as Error)?.message,
    );
    return null;
  }
}

async function loadImage(
  objectPath: string | null | undefined,
): Promise<LetterheadImage | undefined> {
  if (!objectPath || !objectPath.startsWith("/objects/")) return undefined;
  const buffer = await downloadObjectToBuffer(objectPath);
  if (!buffer) return undefined;
  const info = getImageInfo(buffer);
  if (!info) {
    console.warn(
      `[Letterhead] Unsupported image format for ${objectPath} (only PNG/JPEG)`,
    );
    return undefined;
  }
  return { buffer, width: info.width, height: info.height, type: info.type };
}

let cache: { data: LetterheadData; expiresAt: number } | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000;

export function invalidateLetterheadCache(): void {
  cache = null;
}

/**
 * Load the company letterhead (header/footer images, footer text, logo,
 * default signatures) configured in Settings → ترويسة الخطابات والمستندات.
 * Never throws — returns an empty object when nothing is configured or
 * downloads fail, so document generation always proceeds.
 */
export async function loadLetterhead(): Promise<LetterheadData> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;
  const data: LetterheadData = {};
  try {
    const [profile] = await db.select().from(company_profile).limit(1);
    if (profile) {
      const [headerImage, footerImage, logoImage] = await Promise.all([
        loadImage((profile as any).letter_header_image_url),
        loadImage((profile as any).letter_footer_image_url),
        loadImage((profile as any).logo_url),
      ]);
      data.headerImage = headerImage;
      data.footerImage = footerImage;
      data.logoImage = logoImage;
      const footerText = (profile as any).letter_footer_text;
      if (typeof footerText === "string" && footerText.trim()) {
        data.footerText = footerText.trim();
      }
      const signatures = (profile as any).letter_default_signatures;
      if (Array.isArray(signatures) && signatures.length) {
        data.signatures = signatures
          .map((s: unknown) => String(s))
          .filter(Boolean);
      }
    }
  } catch (err) {
    console.warn(
      "[Letterhead] Failed to load company letterhead:",
      (err as Error)?.message,
    );
  }
  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  return data;
}
