---
name: Dominant color extraction (image-utils.extractColors)
description: How/why the "extract colors from image" tool clusters colors, and the ignore-white default.
---

# Dominant color extraction

`extractColors(imageUrl, maxColors, options)` in `client/src/lib/image-utils.ts` returns
`ExtractedColor[] { hex, percentage }` sorted by the AREA each color covers, largest first.

The rule: group perceptually-similar shades/gradients into ONE color and report true
area share — do NOT rank raw quantized pixel buckets (that splits one gradient hue into
many near-duplicate entries and lets a smaller solid color outrank the real dominant one).

**How:** downscale (max 200px, aspect preserved) → accumulate 5-bit/channel buckets with
true average RGB + count → convert to CIELAB → weighted k-means++ (K = maxColors+4, ≤20
Lloyd iters, deterministic seeded PRNG so the same image always yields the same palette)
→ merge clusters whose LAB ΔE < mergeDistance (default 14) → sort by weight → percentage =
clusterWeight/totalWeight.

**Why ignoreWhite defaults true:** this is a plastic-bag printing tool (Color Mixtures /
PrintingStep). White is the bag substrate, not an ink, so near-white (≥244 all channels) is
skipped. ignoreBlack defaults FALSE — black is a legitimate print ink.

**How to apply:** percentages are ABSOLUTE area share and intentionally may not sum to 100
(background dropped + minPercentage=1 filter). Don't "normalize to 100". Callers:
`tools_page.tsx` ColorMix uploader (shows %) and `bag-wizard/PrintingStep.tsx`. Keep the
`ExtractedColor` return shape stable for both.
