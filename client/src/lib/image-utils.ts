export interface ExtractedColor {
  hex: string;
  percentage: number;
  label?: string;
}

export function removeBackground(
  imageUrl: string,
  threshold: number = 30,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const corners = [
          getPixel(data, 0, 0, canvas.width),
          getPixel(data, canvas.width - 1, 0, canvas.width),
          getPixel(data, 0, canvas.height - 1, canvas.width),
          getPixel(data, canvas.width - 1, canvas.height - 1, canvas.width),
        ];

        const bgColor = averageColor(corners);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          const dist = Math.sqrt(
            (r - bgColor.r) ** 2 + (g - bgColor.g) ** 2 + (b - bgColor.b) ** 2,
          );
          if (dist < threshold) {
            data[i + 3] = 0;
          } else if (dist < threshold * 1.5) {
            data[i + 3] = Math.round(
              ((dist - threshold) / (threshold * 0.5)) * 255,
            );
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(
          err instanceof Error ? err : new Error("Failed to process image"),
        );
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}

/**
 * Options that control how dominant colors are extracted from an image.
 * - `mergeDistance`: perceptual (CIELAB ΔE) threshold below which two colors are
 *   treated as shades of the same color and merged. Higher = fewer, more
 *   distinct colors. Default 14.
 * - `ignoreWhite` / `ignoreBlack`: drop near-white (background/paper) and
 *   near-black pixels so the palette reflects actual ink colors.
 * - `minPercentage`: discard clusters that cover less than this share of the
 *   image so tiny specks/anti-aliasing gradients don't appear as "colors".
 */
export interface ExtractColorsOptions {
  mergeDistance?: number;
  ignoreWhite?: boolean;
  ignoreBlack?: boolean;
  minPercentage?: number;
}

interface ColorPoint {
  r: number;
  g: number;
  b: number;
  L: number;
  A: number;
  B: number;
  w: number;
}

/**
 * Extract the dominant colors from an image, ranked by the area they occupy.
 *
 * Instead of counting raw pixel buckets (which splits a single gradient into
 * many near-identical entries), this groups perceptually-similar shades
 * together using weighted k-means clustering in CIELAB space, then merges
 * clusters that are still close. The result is a small set of genuinely
 * distinct colors, each with the real percentage of the image it covers,
 * sorted from largest to smallest share.
 */
export function extractColors(
  imageUrl: string,
  maxColors: number = 6,
  options: ExtractColorsOptions = {},
): Promise<ExtractedColor[]> {
  const {
    mergeDistance = 14,
    ignoreWhite = true,
    ignoreBlack = false,
    minPercentage = 1,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        // Downscale while preserving aspect ratio so color proportions stay
        // accurate. A ~200px longest side is fast yet representative.
        const maxDim = 200;
        const scale = Math.min(
          1,
          maxDim / Math.max(img.width || 1, img.height || 1),
        );
        const w = Math.max(1, Math.round((img.width || 1) * scale));
        const h = Math.max(1, Math.round((img.height || 1) * scale));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));

        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        // Accumulate pixels into coarse 5-bit-per-channel buckets to keep the
        // clustering fast, while tracking the true average RGB + total weight.
        const buckets = new Map<
          number,
          { r: number; g: number; b: number; n: number }
        >();
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue; // skip transparent
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          if (ignoreWhite && r >= 244 && g >= 244 && b >= 244) continue;
          if (ignoreBlack && r <= 12 && g <= 12 && b <= 12) continue;
          const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
          const e = buckets.get(key);
          if (e) {
            e.r += r;
            e.g += g;
            e.b += b;
            e.n++;
          } else {
            buckets.set(key, { r, g, b, n: 1 });
          }
        }

        if (buckets.size === 0) {
          resolve([]);
          return;
        }

        const points: ColorPoint[] = [];
        let totalWeight = 0;
        for (const e of buckets.values()) {
          const r = e.r / e.n,
            g = e.g / e.n,
            b = e.b / e.n;
          const [L, A, B] = rgbToLab(r, g, b);
          points.push({ r, g, b, L, A, B, w: e.n });
          totalWeight += e.n;
        }

        // Over-segment a little more than requested, then merge shades back
        // together — this recovers dominant colors that a fixed-K run would
        // otherwise split across two clusters.
        const K = Math.min(points.length, Math.max(maxColors + 4, maxColors));
        let clusters = kMeans(points, K);

        // Merge perceptually-close clusters (shades of the same color).
        let didMerge = true;
        while (didMerge && clusters.length > 1) {
          didMerge = false;
          outer: for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
              if (labDistance(clusters[i], clusters[j]) < mergeDistance) {
                clusters[i] = mergePoints(clusters[i], clusters[j]);
                clusters.splice(j, 1);
                didMerge = true;
                break outer;
              }
            }
          }
        }

        clusters.sort((a, b) => b.w - a.w);

        const results: ExtractedColor[] = clusters
          .map((c) => ({
            hex: rgbToHex(Math.round(c.r), Math.round(c.g), Math.round(c.b)),
            percentage: Math.round((c.w / totalWeight) * 100),
            weight: c.w,
          }))
          .filter((c) => (c.weight / totalWeight) * 100 >= minPercentage)
          .slice(0, maxColors)
          .map(({ hex, percentage }) => ({ hex, percentage }));

        // Fallback: if the min-percentage filter removed everything (e.g. a
        // very noisy image), return the single largest cluster.
        if (results.length === 0 && clusters.length > 0) {
          const top = clusters[0];
          resolve([
            {
              hex: rgbToHex(
                Math.round(top.r),
                Math.round(top.g),
                Math.round(top.b),
              ),
              percentage: Math.round((top.w / totalWeight) * 100),
            },
          ]);
          return;
        }

        resolve(results);
      } catch (err) {
        reject(
          err instanceof Error ? err : new Error("Failed to extract colors"),
        );
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}

/** Deterministic PRNG so the same image always yields the same palette. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function labDistance(a: ColorPoint, b: ColorPoint): number {
  const dl = a.L - b.L,
    da = a.A - b.A,
    db = a.B - b.B;
  return Math.sqrt(dl * dl + da * da + db * db);
}

function mergePoints(a: ColorPoint, b: ColorPoint): ColorPoint {
  const wt = a.w + b.w;
  return {
    L: (a.L * a.w + b.L * b.w) / wt,
    A: (a.A * a.w + b.A * b.w) / wt,
    B: (a.B * a.w + b.B * b.w) / wt,
    r: (a.r * a.w + b.r * b.w) / wt,
    g: (a.g * a.w + b.g * b.w) / wt,
    b: (a.b * a.w + b.b * b.w) / wt,
    w: wt,
  };
}

/** Weighted k-means (Lloyd's algorithm) in CIELAB with k-means++ seeding. */
function kMeans(points: ColorPoint[], k: number): ColorPoint[] {
  const rng = makeRng(0x9e3779b9);

  // k-means++ seeding (weighted by cluster size for better dominant coverage).
  const centers: ColorPoint[] = [];
  const firstIdx = weightedPick(points, points.map((p) => p.w), rng);
  centers.push({ ...points[firstIdx] });
  const dist2 = new Array(points.length).fill(Infinity);
  while (centers.length < k) {
    const last = centers[centers.length - 1];
    const probs = new Array(points.length);
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
      const d = labDistance(points[i], last) ** 2;
      if (d < dist2[i]) dist2[i] = d;
      const p = dist2[i] * points[i].w;
      probs[i] = p;
      sum += p;
    }
    if (sum <= 0) break;
    centers.push({ ...points[weightedPick(points, probs, rng)] });
  }

  const assign = new Array(points.length).fill(0);
  for (let iter = 0; iter < 20; iter++) {
    let moved = false;
    for (let p = 0; p < points.length; p++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const d = labDistance(points[p], centers[c]);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      if (assign[p] !== best) {
        assign[p] = best;
        moved = true;
      }
    }

    const acc = centers.map(() => ({
      L: 0,
      A: 0,
      B: 0,
      r: 0,
      g: 0,
      b: 0,
      w: 0,
    }));
    for (let p = 0; p < points.length; p++) {
      const a = acc[assign[p]];
      const pt = points[p];
      a.L += pt.L * pt.w;
      a.A += pt.A * pt.w;
      a.B += pt.B * pt.w;
      a.r += pt.r * pt.w;
      a.g += pt.g * pt.w;
      a.b += pt.b * pt.w;
      a.w += pt.w;
    }
    for (let c = 0; c < centers.length; c++) {
      if (acc[c].w > 0) {
        centers[c] = {
          L: acc[c].L / acc[c].w,
          A: acc[c].A / acc[c].w,
          B: acc[c].B / acc[c].w,
          r: acc[c].r / acc[c].w,
          g: acc[c].g / acc[c].w,
          b: acc[c].b / acc[c].w,
          w: acc[c].w,
        };
      }
    }
    if (!moved && iter > 0) break;
  }

  // Final weights from the last assignment; drop empty clusters.
  const weights = new Array(centers.length).fill(0);
  for (let p = 0; p < points.length; p++) weights[assign[p]] += points[p].w;
  return centers
    .map((c, i) => ({ ...c, w: weights[i] }))
    .filter((c) => c.w > 0);
}

function weightedPick(
  _points: ColorPoint[],
  weights: number[],
  rng: () => number,
): number {
  let sum = 0;
  for (const w of weights) sum += w;
  if (sum <= 0) return 0;
  let target = rng() * sum;
  for (let i = 0; i < weights.length; i++) {
    target -= weights[i];
    if (target <= 0) return i;
  }
  return weights.length - 1;
}

/** Convert sRGB (0-255) to CIELAB for perceptually-meaningful distances. */
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let sr = r / 255,
    sg = g / 255,
    sb = b / 255;
  sr = sr > 0.04045 ? ((sr + 0.055) / 1.055) ** 2.4 : sr / 12.92;
  sg = sg > 0.04045 ? ((sg + 0.055) / 1.055) ** 2.4 : sg / 12.92;
  sb = sb > 0.04045 ? ((sb + 0.055) / 1.055) ** 2.4 : sb / 12.92;

  // sRGB -> XYZ (D65)
  let x = (sr * 0.4124 + sg * 0.3576 + sb * 0.1805) / 0.95047;
  let y = sr * 0.2126 + sg * 0.7152 + sb * 0.0722;
  let z = (sr * 0.0193 + sg * 0.1192 + sb * 0.9505) / 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  x = f(x);
  y = f(y);
  z = f(z);

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

function getPixel(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
) {
  const i = (y * width + x) * 4;
  return { r: data[i], g: data[i + 1], b: data[i + 2] };
}

function averageColor(colors: Array<{ r: number; g: number; b: number }>) {
  const sum = colors.reduce(
    (acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b }),
    { r: 0, g: 0, b: 0 },
  );
  const n = colors.length;
  return {
    r: Math.round(sum.r / n),
    g: Math.round(sum.g / n),
    b: Math.round(sum.b / n),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
