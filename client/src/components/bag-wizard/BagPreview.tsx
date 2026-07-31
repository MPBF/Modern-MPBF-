import { useId } from "react";

import {
  BAG_COLORS,
  MATERIALS,
  PRINT_COLORS_PALETTE,
} from "../../lib/bag-rules";
import {
  type BagConfiguration,
  getBagTypeRules,
  getHangerHeight,
  getBagsPerKg,
  getBagWeightGrams,
} from "../../lib/bag-rules-engine";

interface BagPreviewProps {
  config: BagConfiguration;
  size?: "sm" | "md" | "lg" | "xl";
  showDimensions?: boolean;
}

export function BagPreview({
  config,
  size = "lg",
  showDimensions = false,
}: BagPreviewProps) {
  const uid = useId().replace(/:/g, "_");

  if (!config.bagType) {
    return (
      <div className="flex items-center justify-center h-72 bg-gray-50 rounded-xl">
        <p className="text-gray-400 text-sm">اختر نوع الكيس لعرض المعاينة</p>
      </div>
    );
  }

  const rules = getBagTypeRules(config.bagType);
  if (!rules) return null;

  const bagColor = BAG_COLORS[config.bagColor] || BAG_COLORS.white;
  const material = MATERIALS[config.material];

  const isHDPE = config.material === "HDPE";
  const isLDPE = config.material === "LDPE";

  const svgWidth =
    size === "xl" ? 560 : size === "lg" ? 480 : size === "md" ? 340 : 220;
  const svgHeight =
    size === "xl" ? 700 : size === "lg" ? 600 : size === "md" ? 440 : 300;

  const widthMax =
    config.isPrinted && rules.width_printed
      ? rules.width_printed.max
      : rules.width.max;
  const lengthMax = config.isPrinted
    ? rules.length_printed.max
    : rules.length_plain.max;

  const widthRatio =
    config.width > 0
      ? Math.max(0.4, Math.min(1, config.width / widthMax))
      : 0.7;
  const lengthRatio =
    config.length > 0
      ? Math.max(0.4, Math.min(1, config.length / lengthMax))
      : 0.7;

  const bagW = svgWidth * 0.6 * widthRatio;
  const bagH = svgHeight * 0.6 * lengthRatio;
  const bagX = (svgWidth - bagW) / 2;
  const bagY = svgHeight * 0.25;

  const isTransparent = bagColor.is_transparent;
  const fillColor = bagColor.hex;
  const fillOpacity = isTransparent ? 0.18 : bagColor.opacity;

  const perspectiveOffset = bagW * 0.09;
  const sideWidth =
    config.sideGusset > 0 ? Math.min(bagW * 0.16, config.sideGusset * 2) : 0;

  const seamH = Math.max(7, bagH * 0.045);
  const rx = 4;

  // IDs
  const mainGradId   = `mg_${uid}`;
  const specGradId   = `sp_${uid}`;
  const bdGradId     = `bd_${uid}`;
  const glossGradId  = `gl_${uid}`;
  const sideGradId   = `sg_${uid}`;
  const seamGradId   = `sm_${uid}`;
  const shadowId     = `sh_${uid}`;
  const grainFiltId  = `gr_${uid}`;
  const patternId    = `tp_${uid}`;
  const clipId       = `cl_${uid}`;

  return (
    <div className="flex flex-col items-center">
      <svg
        width="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="drop-shadow-xl"
        style={{ maxHeight: size === "xl" ? 600 : size === "lg" ? 540 : 420 }}
      >
        <defs>
          {/* ── Drop shadow — soft, deep ── */}
          <filter id={shadowId} x="-25%" y="-15%" width="160%" height="160%">
            <feDropShadow
              dx="5" dy="10" stdDeviation="10"
              floodOpacity="0.30" floodColor="#0a1628"
            />
          </filter>

          {/* ── HDPE grain filter (fractal noise overlay) ── */}
          {isHDPE && (
            <filter id={grainFiltId} x="0%" y="0%" width="100%" height="100%"
              colorInterpolationFilters="sRGB">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.72 0.72"
                numOctaves="3"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.5
                        0 0 0 0 0.5
                        0 0 0 0 0.5
                        0 0 0 0.18 0"
                in="noise" result="alphaGrain"
              />
              <feBlend in="SourceGraphic" in2="alphaGrain" mode="overlay" />
            </filter>
          )}

          {/* ── Main body gradient — diagonal, light top-left → dark bottom-right ── */}
          <linearGradient id={mainGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"
              stopColor={lightenColor(fillColor, 50)}
              stopOpacity={fillOpacity} />
            <stop offset="30%"
              stopColor={lightenColor(fillColor, 18)}
              stopOpacity={fillOpacity} />
            <stop offset="60%"
              stopColor={fillColor}
              stopOpacity={fillOpacity} />
            <stop offset="100%"
              stopColor={darkenColor(fillColor, 45)}
              stopOpacity={fillOpacity} />
          </linearGradient>

          {/* ── Specular highlight — radial at upper-center area ── */}
          <radialGradient id={specGradId} cx="38%" cy="22%" r="58%"
            gradientUnits="objectBoundingBox">
            <stop offset="0%"
              stopColor="white"
              stopOpacity={isLDPE ? 0.62 : isTransparent ? 0.50 : 0.30} />
            <stop offset="45%"
              stopColor="white"
              stopOpacity={isLDPE ? 0.12 : 0.04} />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* ── Bottom darkening ── */}
          <linearGradient id={bdGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="55%" stopColor="black" stopOpacity="0" />
            <stop offset="100%" stopColor="black"
              stopOpacity={isHDPE ? 0.30 : isLDPE ? 0.20 : 0.22} />
          </linearGradient>

          {/* ── LDPE gloss band — diagonal bright stripe ── */}
          {isLDPE && (
            <linearGradient id={glossGradId} x1="0%" y1="0%" x2="100%" y2="60%">
              <stop offset="0%"  stopColor="white" stopOpacity="0" />
              <stop offset="22%" stopColor="white" stopOpacity="0.42" />
              <stop offset="34%" stopColor="white" stopOpacity="0.10" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          )}

          {/* ── Side face gradient ── */}
          <linearGradient id={sideGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"
              stopColor={darkenColor(fillColor, 55)}
              stopOpacity={fillOpacity * 0.95} />
            <stop offset="100%"
              stopColor={darkenColor(fillColor, 35)}
              stopOpacity={fillOpacity * 0.75} />
          </linearGradient>

          {/* ── Weld seam gradient (top/bottom seals) ── */}
          <linearGradient id={seamGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"
              stopColor={darkenColor(fillColor, 30)}
              stopOpacity={fillOpacity * 0.95} />
            <stop offset="50%"
              stopColor={lightenColor(fillColor, 15)}
              stopOpacity={fillOpacity * 0.4} />
            <stop offset="100%"
              stopColor={darkenColor(fillColor, 30)}
              stopOpacity={fillOpacity * 0.95} />
          </linearGradient>

          {/* ── Checkerboard for transparent bags ── */}
          {isTransparent && (
            <pattern
              id={patternId}
              width="10" height="10"
              patternUnits="userSpaceOnUse"
            >
              <rect width="5" height="5" fill="#dde8ef" />
              <rect x="5" y="5" width="5" height="5" fill="#dde8ef" />
              <rect x="5" y="0" width="5" height="5" fill="#f0f7fa" />
              <rect x="0" y="5" width="5" height="5" fill="#f0f7fa" />
            </pattern>
          )}

          {/* ── Clip path for print design ── */}
          <clipPath id={clipId}>
            <rect x={bagX} y={bagY} width={bagW} height={bagH} rx={rx} />
          </clipPath>

          {/* ── Dimension arrow markers ── */}
          <marker id="arrL" viewBox="0 0 10 10" refX="2" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="#1e40af" />
          </marker>
          <marker id="arrR" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#1e40af" />
          </marker>
        </defs>

        {/* ══════════════════════════════════════════
            LAYER 1 — Checkerboard (transparent bags)
            ══════════════════════════════════════════ */}
        {isTransparent && (
          <rect
            x={bagX} y={bagY} width={bagW} height={bagH}
            rx={rx} fill={`url(#${patternId})`}
          />
        )}

        {/* ══════════════════════════════════════════
            LAYER 2 — 3-D side face (trapezoid)
            ══════════════════════════════════════════ */}
        {sideWidth > 0 &&
          config.handle !== "hanger" &&
          config.handle !== "hanger_hook" &&
          config.handle !== "external_strap" && (
          <>
            {/* Side face — right side trapezoid */}
            <polygon
              points={`
                ${bagX + bagW},${bagY}
                ${bagX + bagW + sideWidth},${bagY + perspectiveOffset}
                ${bagX + bagW + sideWidth},${bagY + bagH + perspectiveOffset}
                ${bagX + bagW},${bagY + bagH}
              `}
              fill={`url(#${sideGradId})`}
              stroke={darkenColor(fillColor, 55)}
              strokeWidth="0.8"
            />
            {/* Inner crease line on side face */}
            <line
              x1={bagX + bagW + sideWidth * 0.5}
              y1={bagY + perspectiveOffset * 0.5}
              x2={bagX + bagW + sideWidth * 0.5}
              y2={bagY + bagH + perspectiveOffset * 0.5}
              stroke="white" strokeOpacity="0.12" strokeWidth="1"
            />
          </>
        )}

        {/* ══════════════════════════════════════════
            LAYER 3 — Main bag body (fill + shadow)
            ══════════════════════════════════════════ */}
        <rect
          x={bagX} y={bagY} width={bagW} height={bagH}
          rx={rx}
          fill={`url(#${mainGradId})`}
          stroke={isTransparent ? "#a8c8d8" : darkenColor(fillColor, 45)}
          strokeWidth="1.5"
          filter={`url(#${shadowId})`}
        />

        {/* ══════════════════════════════════════════
            LAYER 4 — Specular highlight overlay
            ══════════════════════════════════════════ */}
        <rect
          x={bagX} y={bagY} width={bagW} height={bagH}
          rx={rx} fill={`url(#${specGradId})`}
          style={{ pointerEvents: "none" }}
        />

        {/* ══════════════════════════════════════════
            LAYER 5 — Bottom darkening
            ══════════════════════════════════════════ */}
        <rect
          x={bagX} y={bagY} width={bagW} height={bagH}
          rx={rx} fill={`url(#${bdGradId})`}
          style={{ pointerEvents: "none" }}
        />

        {/* ══════════════════════════════════════════
            LAYER 6a — LDPE gloss band overlay
            ══════════════════════════════════════════ */}
        {isLDPE && (
          <rect
            x={bagX} y={bagY} width={bagW} height={bagH}
            rx={rx} fill={`url(#${glossGradId})`}
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* ══════════════════════════════════════════
            LAYER 6b — LDPE secondary narrow gloss band
            ══════════════════════════════════════════ */}
        {isLDPE && (
          <ellipse
            cx={bagX + bagW * 0.28}
            cy={bagY + bagH * 0.18}
            rx={bagW * 0.08}
            ry={bagH * 0.22}
            fill="white"
            fillOpacity="0.18"
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* ══════════════════════════════════════════
            LAYER 6c — HDPE grain texture overlay
            ══════════════════════════════════════════ */}
        {isHDPE && (
          <rect
            x={bagX} y={bagY} width={bagW} height={bagH}
            rx={rx}
            fill={lightenColor(fillColor, 8)}
            fillOpacity={isTransparent ? 0.05 : 0.10}
            filter={`url(#${grainFiltId})`}
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* ══════════════════════════════════════════
            LAYER 7 — Left edge rim highlight
            ══════════════════════════════════════════ */}
        <line
          x1={bagX + 3} y1={bagY + rx + 4}
          x2={bagX + 3} y2={bagY + bagH - rx - 4}
          stroke="white"
          strokeOpacity={isLDPE ? 0.65 : isTransparent ? 0.55 : 0.38}
          strokeWidth={isLDPE ? 2.5 : 1.8}
          strokeLinecap="round"
        />

        {/* ══════════════════════════════════════════
            LAYER 8 — Top weld seam
            ══════════════════════════════════════════ */}
        <rect
          x={bagX + 4} y={bagY + 2}
          width={bagW - 8} height={seamH}
          fill={`url(#${seamGradId})`}
          rx="2"
          style={{ pointerEvents: "none" }}
        />
        {/* Seam inner shine */}
        <line
          x1={bagX + 8} y1={bagY + seamH * 0.45}
          x2={bagX + bagW - 8} y2={bagY + seamH * 0.45}
          stroke="white" strokeOpacity="0.28" strokeWidth="1"
        />

        {/* ══════════════════════════════════════════
            LAYER 9 — Handle (rendered on top)
            ══════════════════════════════════════════ */}
        {renderHandle(config, bagX, bagY, bagW, bagH, fillColor, fillOpacity)}

        {/* ══════════════════════════════════════════
            LAYER 10 — Bottom weld seam / heat seal
            ══════════════════════════════════════════ */}
        <rect
          x={bagX + 4} y={bagY + bagH - seamH - 2}
          width={bagW - 8} height={seamH}
          fill={darkenColor(fillColor, 35)}
          fillOpacity={fillOpacity * 0.88}
          rx="2"
          style={{ pointerEvents: "none" }}
        />
        {/* Seam highlight */}
        <line
          x1={bagX + 8} y1={bagY + bagH - seamH * 0.55}
          x2={bagX + bagW - 8} y2={bagY + bagH - seamH * 0.55}
          stroke="white" strokeOpacity="0.22" strokeWidth="1"
        />
        {/* Seam stitching dots for realism */}
        {Array.from({ length: Math.floor((bagW - 20) / 10) }).map((_, i) => (
          <circle
            key={i}
            cx={bagX + 10 + i * 10}
            cy={bagY + bagH - seamH * 0.5 + 2}
            r="0.9"
            fill="white"
            fillOpacity="0.20"
          />
        ))}

        {/* ══════════════════════════════════════════
            LAYER 11 — Print design
            ══════════════════════════════════════════ */}
        {config.isPrinted &&
          config.printDesign &&
          renderPrintDesign(config, bagX, bagY, bagW, bagH, clipId)}

        {/* ══════════════════════════════════════════
            LAYER 12 — Dimension annotations
            ══════════════════════════════════════════ */}
        {showDimensions &&
          config.width > 0 &&
          config.length > 0 &&
          renderDimensionLines(config, bagX, bagY, bagW, bagH)}

        {/* ══════════════════════════════════════════
            LAYER 13 — Material badge (corner tag)
            ══════════════════════════════════════════ */}
        {material && (
          <>
            {/* Material badge */}
            <rect
              x={bagX + bagW - 52} y={bagY + 8}
              width={46} height={17}
              rx="8"
              fill={isHDPE ? "#1e3a5f" : "#0f5132"}
              fillOpacity="0.85"
            />
            <text
              x={bagX + bagW - 29} y={bagY + 19}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill="white"
              fontFamily="Arial, sans-serif"
              opacity="0.92"
            >
              {isHDPE ? "HDPE" : isLDPE ? "LDPE" : material.label_en}
            </text>
          </>
        )}
      </svg>

      <div className="mt-3 text-center space-y-1">
        <div className="text-sm font-semibold text-gray-700">
          {rules.label_ar}
        </div>
        {config.width > 0 && config.length > 0 && (
          <div className="text-xs text-gray-500">
            {config.width} × {config.length} سم
            {config.sideGusset > 0 && ` | دخلة ${config.sideGusset} سم`}
            {config.thickness > 0 && ` | ${config.thickness} ميكرون`}
            {config.handle === "hanger" &&
              ` | يد ${getHangerHeight(config)} سم`}
          </div>
        )}
        {material && (
          <div className="text-xs font-medium"
            style={{ color: isHDPE ? "#1e40af" : "#166534" }}>
            {material.label_ar} · {material.surface}
          </div>
        )}
        {(() => {
          const bpk = getBagsPerKg(config);
          const wg = getBagWeightGrams(config);
          if (!bpk || !wg) return null;
          return (
            <div className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg inline-block mt-1">
              ≈ {bpk.toLocaleString("ar-EG")} كيس/كجم · وزن الكيس{" "}
              {wg.toFixed(2)} غم
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function renderDimensionLines(
  config: BagConfiguration,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const arrowColor = "#1e40af";
  const offset = 14;
  return (
    <g fontFamily="Arial, sans-serif" fontSize="11" fill={arrowColor}>
      {/* Width dimension (bottom) */}
      <line
        x1={x} y1={y + h + offset}
        x2={x + w} y2={y + h + offset}
        stroke={arrowColor} strokeWidth="0.8"
        markerStart="url(#arrL)" markerEnd="url(#arrR)"
      />
      <line x1={x} y1={y + h + offset - 4} x2={x} y2={y + h + offset + 4}
        stroke={arrowColor} strokeWidth="0.8" />
      <line x1={x + w} y1={y + h + offset - 4} x2={x + w} y2={y + h + offset + 4}
        stroke={arrowColor} strokeWidth="0.8" />
      <rect
        x={x + w / 2 - 22} y={y + h + offset + 4}
        width="44" height="14"
        fill="white" stroke={arrowColor} strokeWidth="0.5" rx="2"
      />
      <text x={x + w / 2} y={y + h + offset + 14} textAnchor="middle" fontWeight="700">
        {config.width} سم
      </text>

      {/* Length dimension (right) */}
      <line
        x1={x + w + offset} y1={y}
        x2={x + w + offset} y2={y + h}
        stroke={arrowColor} strokeWidth="0.8"
      />
      <line x1={x + w + offset - 4} y1={y} x2={x + w + offset + 4} y2={y}
        stroke={arrowColor} strokeWidth="0.8" />
      <line x1={x + w + offset - 4} y1={y + h} x2={x + w + offset + 4} y2={y + h}
        stroke={arrowColor} strokeWidth="0.8" />
      <rect
        x={x + w + offset + 4} y={y + h / 2 - 7}
        width="44" height="14"
        fill="white" stroke={arrowColor} strokeWidth="0.5" rx="2"
      />
      <text x={x + w + offset + 26} y={y + h / 2 + 3} textAnchor="middle" fontWeight="700">
        {config.length} سم
      </text>

      {/* Thickness label */}
      {config.thickness > 0 && (
        <>
          <rect
            x={x + 4} y={y + h - 18}
            width="78" height="14"
            fill="white" stroke={arrowColor} strokeWidth="0.5" rx="2" opacity="0.9"
          />
          <text x={x + 43} y={y + h - 8} textAnchor="middle" fontWeight="600" fontSize="10">
            {config.thickness} ميكرون
          </text>
        </>
      )}
    </g>
  );
}

function renderHandle(
  config: BagConfiguration,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  opacity: number,
) {
  const stroke = darkenColor(color, 35);

  switch (config.handle) {
    case "hanger": {
      const hangerCm = getHangerHeight(config);
      const totalLength = config.length > 0 ? config.length : 60;
      const hangerRatio = Math.max(0.12, Math.min(0.4, hangerCm / totalLength));
      const earH = h * hangerRatio;

      const cutoutW = w * 0.28;
      const cutoutDepth = earH * 0.75;
      const cutoutCX = x + w / 2;
      const cutoutTopY = y - earH;
      const cutoutBottomY = cutoutTopY + cutoutDepth;
      const cutoutR = cutoutW * 0.35;

      const sideGussetW =
        config.sideGusset > 0
          ? Math.max(
              w * 0.08,
              Math.min(w * 0.18, (config.sideGusset / (config.width || 50)) * w),
            )
          : 0;

      return (
        <g>
          <path
            d={`M${x},${y}
                L${x},${cutoutTopY + 2}
                Q${x},${cutoutTopY} ${x + 2},${cutoutTopY}
                L${cutoutCX - cutoutW / 2},${cutoutTopY}
                L${cutoutCX - cutoutW / 2},${cutoutBottomY - cutoutR}
                Q${cutoutCX - cutoutW / 2},${cutoutBottomY} ${cutoutCX - cutoutW / 2 + cutoutR},${cutoutBottomY}
                L${cutoutCX + cutoutW / 2 - cutoutR},${cutoutBottomY}
                Q${cutoutCX + cutoutW / 2},${cutoutBottomY} ${cutoutCX + cutoutW / 2},${cutoutBottomY - cutoutR}
                L${cutoutCX + cutoutW / 2},${cutoutTopY}
                L${x + w - 2},${cutoutTopY}
                Q${x + w},${cutoutTopY} ${x + w},${cutoutTopY + 2}
                L${x + w},${y}
                Z`}
            fill={color}
            fillOpacity={opacity * 0.95}
            stroke={stroke}
            strokeWidth="1.2"
          />
          {/* Ear highlight */}
          <line
            x1={x + 4} y1={cutoutTopY + 4}
            x2={x + 4} y2={y}
            stroke="white" strokeOpacity="0.35" strokeWidth="1.5"
          />
          {sideGussetW > 0 && (
            <>
              <rect
                x={x + 1} y={cutoutTopY + 1}
                width={sideGussetW} height={earH + h - 2}
                fill={color} fillOpacity={opacity * 0.35} rx="1"
              />
              <rect
                x={x + w - sideGussetW - 1} y={cutoutTopY + 1}
                width={sideGussetW} height={earH + h - 2}
                fill={color} fillOpacity={opacity * 0.35} rx="1"
              />
              <line
                x1={x + sideGussetW + 1} y1={cutoutTopY}
                x2={x + sideGussetW + 1} y2={y + h}
                stroke={stroke} strokeWidth="0.4"
                opacity="0.18" strokeDasharray="4,4"
              />
              <line
                x1={x + w - sideGussetW - 1} y1={cutoutTopY}
                x2={x + w - sideGussetW - 1} y2={y + h}
                stroke={stroke} strokeWidth="0.4"
                opacity="0.18" strokeDasharray="4,4"
              />
            </>
          )}
        </g>
      );
    }
    case "hanger_hook": {
      const earH = h * 0.18;
      const earCutW = w * 0.18;
      const cutoutCX = x + w / 2;
      const earTopY = y - earH;
      const earBottomY = earTopY + earH * 0.7;
      const r = earCutW * 0.35;
      const hookR = Math.min(w, h) * 0.04;
      const hookCY = earTopY + earH * 0.4;
      return (
        <g>
          <path
            d={`M${x},${y}
                L${x},${earTopY + 2}
                Q${x},${earTopY} ${x + 2},${earTopY}
                L${cutoutCX - earCutW / 2},${earTopY}
                L${cutoutCX - earCutW / 2},${earBottomY - r}
                Q${cutoutCX - earCutW / 2},${earBottomY} ${cutoutCX - earCutW / 2 + r},${earBottomY}
                L${cutoutCX + earCutW / 2 - r},${earBottomY}
                Q${cutoutCX + earCutW / 2},${earBottomY} ${cutoutCX + earCutW / 2},${earBottomY - r}
                L${cutoutCX + earCutW / 2},${earTopY}
                L${x + w - 2},${earTopY}
                Q${x + w},${earTopY} ${x + w},${earTopY + 2}
                L${x + w},${y} Z`}
            fill={color}
            fillOpacity={opacity * 0.95}
            stroke={stroke}
            strokeWidth="1.2"
          />
          <circle cx={cutoutCX} cy={hookCY} r={hookR}
            fill="white" stroke={stroke} strokeWidth="1.2" />
          <circle cx={cutoutCX} cy={hookCY} r={hookR * 0.55}
            fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.4" />
        </g>
      );
    }
    case "external_strap": {
      const strapH = h * 0.16;
      const strapW = w * 0.04;
      const loopGap = w * 0.34;
      const loopCX1 = x + w / 2 - loopGap / 2;
      const loopCX2 = x + w / 2 + loopGap / 2;
      const baseY = y;
      const topY = y - strapH;
      return (
        <g>
          <rect
            x={x + w * 0.1} y={y - 3}
            width={w * 0.8} height={5}
            fill={darkenColor(color, 30)} fillOpacity={opacity * 0.85} rx="2"
          />
          <path
            d={`M${loopCX1 - loopGap / 2 + strapW / 2},${baseY}
                C${loopCX1 - loopGap / 2 + strapW / 2},${topY - strapH * 0.3}
                ${loopCX1 + loopGap / 2 - strapW / 2},${topY - strapH * 0.3}
                ${loopCX1 + loopGap / 2 - strapW / 2},${baseY}`}
            fill="none" stroke={darkenColor(color, 40)}
            strokeWidth={strapW} strokeLinecap="round" opacity={opacity * 0.95}
          />
          <path
            d={`M${loopCX2 - loopGap / 2 + strapW / 2},${baseY}
                C${loopCX2 - loopGap / 2 + strapW / 2},${topY - strapH * 0.3}
                ${loopCX2 + loopGap / 2 - strapW / 2},${topY - strapH * 0.3}
                ${loopCX2 + loopGap / 2 - strapW / 2},${baseY}`}
            fill="none" stroke={darkenColor(color, 40)}
            strokeWidth={strapW} strokeLinecap="round" opacity={opacity * 0.95}
          />
        </g>
      );
    }
    case "die_cut": {
      const holeW = w * 0.3;
      const holeH = h * 0.06;
      return (
        <ellipse
          cx={x + w / 2} cy={y + h * 0.06}
          rx={holeW / 2} ry={holeH / 2}
          fill="white" stroke={stroke} strokeWidth="1.2"
        />
      );
    }
    case "banana_9cm":
    case "banana_6cm": {
      const cm = config.handle === "banana_9cm" ? 9 : 6;
      const actualWidthCm = config.width > 0 ? config.width : 30;
      const cutoutWidthRatio = Math.max(0.18, Math.min(0.7, cm / actualWidthCm));
      const holeW = w * cutoutWidthRatio;
      const holeH = h * 0.045;
      const cx = x + w / 2;
      const cy = y + h * 0.07;
      return (
        <g>
          <path
            d={`M${cx - holeW / 2},${cy}
                Q${cx},${cy + holeH * 1.8} ${cx + holeW / 2},${cy}
                Q${cx},${cy - holeH * 0.4} ${cx - holeW / 2},${cy} Z`}
            fill="white" stroke={stroke} strokeWidth="1.2"
          />
          <text x={cx} y={cy - holeH * 1.2}
            textAnchor="middle" fontSize="9"
            fill={stroke} fontWeight="600" opacity="0.6"
            fontFamily="Arial, sans-serif">
            {cm} سم
          </text>
        </g>
      );
    }
    case "reinforced": {
      const patchH = h * 0.08;
      return (
        <g>
          <rect
            x={x + w * 0.15} y={y}
            width={w * 0.7} height={patchH}
            fill={darkenColor(color, 18)} fillOpacity={opacity}
            stroke={stroke} strokeWidth="0.6" rx="2"
          />
          <ellipse
            cx={x + w / 2} cy={y + patchH * 0.5}
            rx={w * 0.12} ry={patchH * 0.35}
            fill="white" stroke={stroke} strokeWidth="0.8"
          />
        </g>
      );
    }
    default:
      return null;
  }
}

function renderPrintDesign(
  config: BagConfiguration,
  bagX: number,
  bagY: number,
  bagW: number,
  bagH: number,
  clipId: string,
) {
  const design = config.printDesign;
  if (!design) return null;

  const marginCm = 1;
  const actualW = config.width > 0 ? config.width : 50;
  const actualH = config.length > 0 ? config.length : 60;
  const marginXPct = Math.min(10, (marginCm / actualW) * 100);
  const marginYPct = Math.min(10, (marginCm / actualH) * 100);

  const printAreaX = bagX + bagW * (marginXPct / 100);
  const printAreaY = bagY + bagH * (marginYPct / 100);
  const printAreaW = bagW * (1 - (2 * marginXPct) / 100);
  const printAreaH = bagH * (1 - (2 * marginYPct) / 100);

  const globalOffsetX = (design.offsetX / 100) * printAreaW;
  const globalOffsetY = (design.offsetY / 100) * printAreaH;

  const centerX = printAreaX + printAreaW / 2 + globalOffsetX;
  const centerY = printAreaY + printAreaH / 2 + globalOffsetY;

  return (
    <g clipPath={`url(#${clipId})`}>
      <rect
        x={printAreaX} y={printAreaY}
        width={printAreaW} height={printAreaH}
        fill="none"
        stroke="rgba(100,100,255,0.2)"
        strokeWidth="0.5" strokeDasharray="3,3" rx="2"
      />

      {design.logoUrl && (
        <image
          href={design.logoUrl}
          x={centerX - (printAreaW * 0.4 * design.scale) / 2}
          y={centerY - (printAreaH * 0.4 * design.scale) / 2}
          width={printAreaW * 0.4 * design.scale}
          height={printAreaH * 0.4 * design.scale}
          preserveAspectRatio="xMidYMid meet"
          opacity={0.9}
          transform={`rotate(${design.rotation}, ${centerX}, ${centerY})`}
        />
      )}

      {design.texts.map((text, i) => {
        const colorInfo = PRINT_COLORS_PALETTE.find((c) => c.id === text.color);
        const shade = config.printColorShades?.[text.color];

        const textX = printAreaX + (text.x / 100) * printAreaW + globalOffsetX;
        const textY = printAreaY + (text.y / 100) * printAreaH + globalOffsetY;

        return (
          <text
            key={i}
            x={textX} y={textY}
            textAnchor="middle" dominantBaseline="central"
            fill={shade || colorInfo?.hex || "#000"}
            fontSize={Math.max(8, Math.min(28, text.size * design.scale * 0.55))}
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            opacity={0.9}
          >
            {text.value}
          </text>
        );
      })}
    </g>
  );
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
