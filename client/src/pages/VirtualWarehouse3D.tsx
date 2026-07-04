import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Html,
  ContactShadows,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Boxes,
  Factory,
  Package,
  Recycle,
  Warehouse as WarehouseIcon,
  Loader2,
} from "lucide-react";
import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as THREE from "three";
import { useLocation } from "wouter";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useLanguage } from "../contexts/LanguageContext";
import { formatNumber } from "../lib/formatNumber";

// ============================================================
// Types
// ============================================================

type SceneId = "overview" | "production" | "finished" | "raw" | "waste";

interface ProductionHallRow {
  production_order_id: number;
  production_order_number: string;
  order_id: number;
  order_number: string;
  customer_name: string | null;
  customer_name_ar: string | null;
  product_name: string | null;
  product_name_ar: string | null;
  quantity_required: string | number;
  total_ready_weight: string | number;
  total_received_weight: string | number;
}

interface DeliveryHallRow {
  production_order_id: number;
  production_order_number: string;
  order_id: number;
  order_number: string;
  customer_name: string | null;
  customer_name_ar: string | null;
  product_name: string | null;
  product_name_ar: string | null;
  quantity_required: string | number;
  warehouse_received_kg: string | number;
  warehouse_delivered_kg: string | number;
}

interface InventoryRow {
  id: number;
  item_id: string;
  current_stock: string | number;
  unit: string | null;
}

interface ItemRow {
  id: string;
  name: string | null;
  name_ar: string | null;
}

interface WasteVoucherRow {
  waste_type: string;
  quantity: string | number;
  status: string | null;
}

interface HoverInfo {
  title: string;
  lines: { label: string; value: string }[];
  badge?: { text: string; variant: "green" | "gray" | "blue" };
}

interface SelectedPallet {
  target: "production-hall" | "finished-goods";
  productionOrderId: number;
  info: HoverInfo;
}

// ============================================================
// Helpers
// ============================================================

const num = (v: string | number | null | undefined): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "0"));
  return Number.isFinite(n) ? n : 0;
};

// Deterministic pleasant color derived from the parent order number so all
// production orders of the same order share one color.
function orderColor(orderNumber: string): string {
  let hash = 0;
  for (let i = 0; i < orderNumber.length; i++) {
    hash = (hash * 31 + orderNumber.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 62%, 52%)`;
}

// Instanced rendering keeps draw calls constant, so these caps can be much
// higher than the old per-mesh limits without hurting frame rate.
const MAX_PALLETS = 200;
const MAX_BUNDLES_PER_PALLET = 12;
const MAX_RAW_ITEMS = 120;
const MAX_WASTE_TYPES = 60;

// ============================================================
// Performance profile — lighter rendering on phones / low-end devices
// ============================================================

interface PerfProfile {
  lowEnd: boolean;
  shadows: boolean;
  dpr: [number, number];
  shadowMapSize: number;
  contactShadows: boolean;
  antialias: boolean;
}

function detectPerfProfile(): PerfProfile {
  let lowEnd = false;
  try {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    const coarse =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    const cores = nav?.hardwareConcurrency ?? 8;
    const mem = (nav as unknown as { deviceMemory?: number } | undefined)
      ?.deviceMemory;
    lowEnd = Boolean(coarse) || cores <= 4 || (mem !== undefined && mem <= 4);
  } catch {
    lowEnd = false;
  }
  return lowEnd
    ? {
        lowEnd: true,
        shadows: false,
        dpr: [1, 1],
        shadowMapSize: 512,
        contactShadows: false,
        antialias: false,
      }
    : {
        lowEnd: false,
        shadows: true,
        dpr: [1, 1.5],
        shadowMapSize: 1024,
        contactShadows: true,
        antialias: true,
      };
}

// ============================================================
// Camera rig — smoothly moves camera + controls target per scene
// ============================================================

const SCENE_POSES: Record<
  SceneId,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  overview: { pos: [0, 26, 38], target: [0, 0, 0] },
  production: { pos: [0, 12, 20], target: [0, 1, 0] },
  finished: { pos: [0, 12, 20], target: [0, 1, 0] },
  raw: { pos: [0, 10, 17], target: [0, 1, 0] },
  waste: { pos: [0, 10, 17], target: [0, 1, 0] },
};

function CameraRig({
  scene,
  controlsRef,
}: {
  scene: SceneId;
  controlsRef: React.MutableRefObject<any>;
}) {
  const { camera } = useThree();
  const targetVec = useRef(new THREE.Vector3());
  const posVec = useRef(new THREE.Vector3());
  const prevScene = useRef<SceneId>(scene);
  const animating = useRef(false);

  if (prevScene.current !== scene) {
    prevScene.current = scene;
    animating.current = true;
  }

  useFrame(() => {
    if (!animating.current) return;
    const pose = SCENE_POSES[scene];
    posVec.current.set(...pose.pos);
    targetVec.current.set(...pose.target);
    camera.position.lerp(posVec.current, 0.06);
    const controls = controlsRef.current;
    if (controls) {
      controls.target.lerp(targetVec.current, 0.06);
      controls.update();
    }
    if (
      camera.position.distanceTo(posVec.current) < 0.15 &&
      (!controls || controls.target.distanceTo(targetVec.current) < 0.15)
    ) {
      animating.current = false;
    }
  });

  return null;
}

// ============================================================
// Shared scenery
// ============================================================

function Ground({ size = 90, color = "#1e293b" }: { size?: number; color?: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

function HallShell({
  width,
  depth,
  color = "#334155",
}: {
  width: number;
  depth: number;
  color?: string;
}) {
  const h = 6;
  const wall = (
    w: number,
    d: number,
    pos: [number, number, number],
  ) => (
    <mesh position={pos}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} transparent opacity={0.28} roughness={0.9} />
    </mesh>
  );
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {wall(width, 0.3, [0, h / 2, -depth / 2])}
      {wall(0.3, depth, [-width / 2, h / 2, 0])}
      {wall(0.3, depth, [width / 2, h / 2, 0])}
    </group>
  );
}

// ============================================================
// Generic instanced units — one draw call per geometry/material pair
// ============================================================

interface InstanceEntry {
  pos: [number, number, number];
  rotY?: number;
  scale?: [number, number, number];
  color: string;
  groupIdx: number;
}

const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _pos = new THREE.Vector3();
const _scl = new THREE.Vector3();
const _euler = new THREE.Euler();
const _color = new THREE.Color();

function InstancedUnits({
  entries,
  hoveredGroup,
  onOver,
  onOut,
  onClickGroup,
  castShadow,
  geometry,
  material,
}: {
  entries: InstanceEntry[];
  hoveredGroup: number;
  onOver: (groupIdx: number) => void;
  onOut: () => void;
  onClickGroup?: (groupIdx: number) => void;
  castShadow?: boolean;
  geometry: React.ReactNode;
  material: React.ReactNode;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  // Set matrices once per data change
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      _pos.set(e.pos[0], e.pos[1], e.pos[2]);
      _euler.set(0, e.rotY ?? 0, 0);
      _quat.setFromEuler(_euler);
      if (e.scale) {
        _scl.set(e.scale[0], e.scale[1], e.scale[2]);
      } else {
        _scl.set(1, 1, 1);
      }
      _mat4.compose(_pos, _quat, _scl);
      mesh.setMatrixAt(i, _mat4);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [entries]);

  // (Re)write per-instance colors, brightening the hovered group
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      _color.set(e.color);
      if (e.groupIdx === hoveredGroup) {
        _color.lerp(new THREE.Color("#ffffff"), 0.35);
      }
      mesh.setColorAt(i, _color);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [entries, hoveredGroup]);

  if (entries.length === 0) return null;

  return (
    <instancedMesh
      key={entries.length}
      ref={ref}
      args={[undefined as any, undefined as any, entries.length]}
      castShadow={castShadow}
      frustumCulled={false}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.instanceId == null) return;
        onOver(entries[e.instanceId].groupIdx);
      }}
      onPointerOut={() => onOut()}
      onClick={(e) => {
        if (!onClickGroup) return;
        e.stopPropagation();
        if (e.instanceId == null) return;
        onClickGroup(entries[e.instanceId].groupIdx);
      }}
    >
      {geometry}
      {material}
    </instancedMesh>
  );
}

// Shared hover-group state helper for the instanced scenes
function useGroupHover(
  infos: HoverInfo[],
  setHover: (info: HoverInfo | null) => void,
) {
  const [hoveredGroup, setHoveredGroup] = useState(-1);
  const hoveredRef = useRef(-1);
  const onOver = (groupIdx: number) => {
    if (hoveredRef.current === groupIdx) return;
    hoveredRef.current = groupIdx;
    setHoveredGroup(groupIdx);
    setHover(infos[groupIdx] ?? null);
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    if (hoveredRef.current === -1) return;
    hoveredRef.current = -1;
    setHoveredGroup(-1);
    setHover(null);
    document.body.style.cursor = "auto";
  };
  return { hoveredGroup, onOver, onOut };
}

// ============================================================
// Instanced pallet field (production hall + finished goods)
// ============================================================

const WOOD_COLOR = "#8b5a2b";
const WOOD_DARK = "#6b4423";

// Wooden pallet pieces expressed as unit-box instances (scaled via matrix)
function palletWoodEntries(
  center: [number, number, number],
  groupIdx: number,
): InstanceEntry[] {
  const [cx, cy, cz] = center;
  const out: InstanceEntry[] = [];
  // deck boards
  for (const z of [-0.55, 0, 0.55]) {
    out.push({
      pos: [cx, cy + 0.14, cz + z],
      scale: [1.7, 0.06, 0.4],
      color: WOOD_COLOR,
      groupIdx,
    });
  }
  // stringers
  for (const x of [-0.65, 0.65]) {
    out.push({
      pos: [cx + x, cy + 0.06, cz],
      scale: [0.14, 0.12, 1.5],
      color: WOOD_DARK,
      groupIdx,
    });
  }
  return out;
}

// Stacked bundle positions on a pallet (local offsets)
function bundleOffsets(count: number): [number, number, number][] {
  const n = Math.max(1, Math.min(count, MAX_BUNDLES_PER_PALLET));
  const perLayer = 4;
  const out: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const layer = Math.floor(i / perLayer);
    const idx = i % perLayer;
    const x = (idx % 2 === 0 ? -0.42 : 0.42) * (1 - layer * 0.04);
    const z = (idx < 2 ? -0.38 : 0.38) * (1 - layer * 0.04);
    out.push([x, 0.17 + 0.24 + layer * 0.48, z]);
  }
  return out;
}

interface PalletDatum {
  productionOrderId: number;
  position: [number, number, number];
  color: string;
  bundles: number;
  glow?: boolean;
  dull?: boolean;
  info: HoverInfo;
}

function InstancedPalletField({
  pallets,
  setHover,
  onSelect,
}: {
  pallets: PalletDatum[];
  setHover: (info: HoverInfo | null) => void;
  onSelect?: (pallet: PalletDatum) => void;
}) {
  const infos = useMemo(() => pallets.map((p) => p.info), [pallets]);
  const { hoveredGroup, onOver, onOut } = useGroupHover(infos, setHover);
  const onClickGroup = onSelect
    ? (groupIdx: number) => {
        const pallet = pallets[groupIdx];
        if (pallet) onSelect(pallet);
      }
    : undefined;

  const { wood, plain, glow, dull } = useMemo(() => {
    const wood: InstanceEntry[] = [];
    const plain: InstanceEntry[] = [];
    const glow: InstanceEntry[] = [];
    const dull: InstanceEntry[] = [];
    pallets.forEach((p, groupIdx) => {
      wood.push(...palletWoodEntries(p.position, groupIdx));
      const target = p.glow ? glow : p.dull ? dull : plain;
      for (const [ox, oy, oz] of bundleOffsets(p.bundles)) {
        target.push({
          pos: [p.position[0] + ox, p.position[1] + oy, p.position[2] + oz],
          color: p.color,
          groupIdx,
        });
      }
    });
    return { wood, plain, glow, dull };
  }, [pallets]);

  return (
    <group>
      <InstancedUnits
        entries={wood}
        hoveredGroup={hoveredGroup}
        onOver={onOver}
        onOut={onOut}
        onClickGroup={onClickGroup}
        castShadow
        geometry={<boxGeometry args={[1, 1, 1]} />}
        material={<meshStandardMaterial roughness={0.9} />}
      />
      <InstancedUnits
        entries={plain}
        hoveredGroup={hoveredGroup}
        onOver={onOver}
        onOut={onOut}
        onClickGroup={onClickGroup}
        castShadow
        geometry={<boxGeometry args={[0.78, 0.46, 0.72]} />}
        material={<meshStandardMaterial roughness={0.6} />}
      />
      <InstancedUnits
        entries={glow}
        hoveredGroup={hoveredGroup}
        onOver={onOver}
        onOut={onOut}
        onClickGroup={onClickGroup}
        castShadow
        geometry={<boxGeometry args={[0.78, 0.46, 0.72]} />}
        material={
          <meshStandardMaterial
            roughness={0.6}
            emissive="#22c55e"
            emissiveIntensity={0.55}
          />
        }
      />
      <InstancedUnits
        entries={dull}
        hoveredGroup={hoveredGroup}
        onOver={onOver}
        onOut={onOut}
        onClickGroup={onClickGroup}
        castShadow
        geometry={<boxGeometry args={[0.78, 0.46, 0.72]} />}
        material={<meshStandardMaterial roughness={0.95} />}
      />
    </group>
  );
}

// Arrange pallets on a grid inside the hall
function palletGridPosition(index: number, total: number): [number, number, number] {
  const cols = Math.max(4, Math.ceil(Math.sqrt(total * 1.4)));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const spacing = 2.4;
  const x = (col - (cols - 1) / 2) * spacing;
  const z = row * spacing - 4;
  return [x, 0, z];
}

// ============================================================
// Overview scene — 4 clickable buildings
// ============================================================

interface BuildingDef {
  id: Exclude<SceneId, "overview">;
  labelKey: string;
  position: [number, number, number];
  color: string;
  roofColor: string;
}

const BUILDINGS: BuildingDef[] = [
  {
    id: "production",
    labelKey: "virtualWarehouse.productionHall",
    position: [-13, 0, -9],
    color: "#3b82f6",
    roofColor: "#1d4ed8",
  },
  {
    id: "finished",
    labelKey: "virtualWarehouse.finishedGoods",
    position: [13, 0, -9],
    color: "#10b981",
    roofColor: "#047857",
  },
  {
    id: "raw",
    labelKey: "virtualWarehouse.rawMaterials",
    position: [-13, 0, 9],
    color: "#f59e0b",
    roofColor: "#b45309",
  },
  {
    id: "waste",
    labelKey: "virtualWarehouse.wasteWarehouse",
    position: [13, 0, 9],
    color: "#64748b",
    roofColor: "#334155",
  },
];

function Building({
  def,
  label,
  count,
  isRTL,
  onEnter,
}: {
  def: BuildingDef;
  label: string;
  count: number;
  isRTL: boolean;
  onEnter: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const W = 12;
  const D = 9;
  const H = 5;
  return (
    <group position={def.position}>
      {/* body */}
      <mesh
        position={[0, H / 2, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onEnter();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial
          color={def.color}
          emissive={hovered ? def.color : "#000000"}
          emissiveIntensity={hovered ? 0.35 : 0}
          roughness={0.7}
        />
      </mesh>
      {/* gabled roof */}
      <mesh position={[0, H + 1.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[Math.SQRT2 * (W / 2) * 0.82, 2.2, 4]} />
        <meshStandardMaterial color={def.roofColor} roughness={0.8} />
      </mesh>
      {/* door */}
      <mesh position={[0, 1.4, D / 2 + 0.02]}>
        <planeGeometry args={[3.4, 2.8]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>
      <Html
        position={[0, H + 3.2, 0]}
        center
        distanceFactor={40}
        style={{ pointerEvents: "none" }}
      >
        <div
          dir={isRTL ? "rtl" : "ltr"}
          style={{
            background: hovered ? "rgba(15,23,42,0.95)" : "rgba(15,23,42,0.8)",
            border: `1px solid ${def.color}`,
            color: "white",
            padding: "6px 14px",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {label}
          <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>
            {count}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ============================================================
// Production hall scene
// ============================================================

function ProductionHallScene({
  rows,
  labels,
  setHover,
  onSelect,
}: {
  rows: ProductionHallRow[];
  labels: {
    productionOrder: string;
    order: string;
    customer: string;
    product: string;
    readyWeight: string;
    kg: string;
  };
  setHover: (info: HoverInfo | null) => void;
  onSelect: (sel: SelectedPallet) => void;
}) {
  const { language } = useLanguage();
  const shown = rows.slice(0, MAX_PALLETS);
  const cols = Math.max(4, Math.ceil(Math.sqrt(shown.length * 1.4)));
  const hallW = Math.max(16, cols * 2.4 + 4);
  const hallD = Math.max(14, Math.ceil(shown.length / cols) * 2.4 + 10);

  const pallets = useMemo<PalletDatum[]>(
    () =>
      shown.map((row, i) => {
        const ready = num(row.total_ready_weight);
        const remaining = Math.max(0, ready - num(row.total_received_weight));
        const bundles = Math.max(1, Math.ceil(remaining / 200));
        const customer =
          (language === "ar" ? row.customer_name_ar : row.customer_name) ||
          row.customer_name ||
          "—";
        const product =
          (language === "ar" ? row.product_name_ar : row.product_name) ||
          row.product_name ||
          "—";
        return {
          productionOrderId: row.production_order_id,
          position: palletGridPosition(i, shown.length),
          color: orderColor(row.order_number),
          bundles,
          info: {
            title: row.production_order_number,
            lines: [
              { label: labels.order, value: row.order_number },
              { label: labels.customer, value: customer },
              { label: labels.product, value: product },
              {
                label: labels.readyWeight,
                value: `${formatNumber(remaining)} ${labels.kg}`,
              },
            ],
          },
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, language, labels.order, labels.customer, labels.product, labels.readyWeight, labels.kg],
  );

  return (
    <group>
      <HallShell width={hallW} depth={hallD} color="#1e40af" />
      <InstancedPalletField
        pallets={pallets}
        setHover={setHover}
        onSelect={(p) =>
          onSelect({
            target: "production-hall",
            productionOrderId: p.productionOrderId,
            info: p.info,
          })
        }
      />
    </group>
  );
}

// ============================================================
// Finished goods scene
// ============================================================

function FinishedGoodsScene({
  rows,
  labels,
  setHover,
  onSelect,
}: {
  rows: DeliveryHallRow[];
  labels: {
    order: string;
    customer: string;
    product: string;
    receivedWeight: string;
    requiredWeight: string;
    fullyReceived: string;
    partiallyReceived: string;
    kg: string;
  };
  setHover: (info: HoverInfo | null) => void;
  onSelect: (sel: SelectedPallet) => void;
}) {
  const { language } = useLanguage();
  const shown = rows.slice(0, MAX_PALLETS);
  const cols = Math.max(4, Math.ceil(Math.sqrt(shown.length * 1.4)));
  const hallW = Math.max(16, cols * 2.4 + 4);
  const hallD = Math.max(14, Math.ceil(shown.length / cols) * 2.4 + 10);

  const pallets = useMemo<PalletDatum[]>(
    () =>
      shown.map((row, i) => {
        const received = num(row.warehouse_received_kg);
        const required = num(row.quantity_required);
        const full = required > 0 && received >= required;
        const bundles = Math.max(1, Math.ceil(received / 200));
        const customer =
          (language === "ar" ? row.customer_name_ar : row.customer_name) ||
          row.customer_name ||
          "—";
        const product =
          (language === "ar" ? row.product_name_ar : row.product_name) ||
          row.product_name ||
          "—";
        return {
          productionOrderId: row.production_order_id,
          position: palletGridPosition(i, shown.length),
          color: full ? "#22c55e" : "#9ca3af",
          bundles,
          glow: full,
          dull: !full,
          info: {
            title: row.production_order_number,
            lines: [
              { label: labels.order, value: row.order_number },
              { label: labels.customer, value: customer },
              { label: labels.product, value: product },
              {
                label: labels.receivedWeight,
                value: `${formatNumber(received)} ${labels.kg}`,
              },
              {
                label: labels.requiredWeight,
                value: `${formatNumber(required)} ${labels.kg}`,
              },
            ],
            badge: full
              ? { text: labels.fullyReceived, variant: "green" as const }
              : { text: labels.partiallyReceived, variant: "gray" as const },
          },
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, language, labels.order, labels.customer, labels.product, labels.receivedWeight, labels.requiredWeight, labels.fullyReceived, labels.partiallyReceived, labels.kg],
  );

  return (
    <group>
      <HallShell width={hallW} depth={hallD} color="#047857" />
      <InstancedPalletField
        pallets={pallets}
        setHover={setHover}
        onSelect={(p) =>
          onSelect({
            target: "finished-goods",
            productionOrderId: p.productionOrderId,
            info: p.info,
          })
        }
      />
    </group>
  );
}

// ============================================================
// Raw materials scene — bags/sacks sized by stock level (instanced)
// ============================================================

function RawMaterialsScene({
  rows,
  itemNames,
  labels,
  setHover,
}: {
  rows: InventoryRow[];
  itemNames: Map<string, { name: string | null; name_ar: string | null }>;
  labels: { material: string; stock: string };
  setHover: (info: HoverInfo | null) => void;
}) {
  const { language } = useLanguage();
  const withStock = useMemo(
    () =>
      rows
        .filter((r) => num(r.current_stock) > 0)
        .sort((a, b) => num(b.current_stock) - num(a.current_stock))
        .slice(0, MAX_RAW_ITEMS),
    [rows],
  );
  const maxStock = Math.max(1, ...withStock.map((r) => num(r.current_stock)));
  const cols = Math.max(3, Math.ceil(Math.sqrt(withStock.length * 1.3)));
  const hallW = Math.max(14, cols * 2.6 + 4);
  const hallD = Math.max(12, Math.ceil(withStock.length / cols) * 2.6 + 8);

  const { wood, bags, infos } = useMemo(() => {
    const wood: InstanceEntry[] = [];
    const bags: InstanceEntry[] = [];
    const infos: HoverInfo[] = [];
    withStock.forEach((row, i) => {
      const stock = num(row.current_stock);
      const rel = Math.max(0.25, stock / maxStock);
      const item = itemNames.get(String(row.item_id));
      const name =
        (language === "ar" ? item?.name_ar : item?.name) ||
        item?.name ||
        String(row.item_id);
      const col = i % cols;
      const rowIdx = Math.floor(i / cols);
      const cx = (col - (cols - 1) / 2) * 2.6;
      const cz = rowIdx * 2.6 - 3;
      infos.push({
        title: name,
        lines: [
          {
            label: labels.stock,
            value: `${formatNumber(stock)} ${row.unit || ""}`.trim(),
          },
        ],
      });
      wood.push(...palletWoodEntries([cx, 0, cz], i));
      const color = orderColor(String(row.item_id));
      const layers = Math.max(1, Math.round(rel * 4));
      for (let l = 0; l < layers; l++) {
        const across = l % 2 === 0;
        for (let k = 0; k < 2; k++) {
          bags.push({
            pos: [
              cx + (across ? (k - 0.5) * 0.62 : 0),
              0.19 + l * 0.34,
              cz + (across ? 0 : (k - 0.5) * 0.62),
            ],
            rotY: across ? 0 : Math.PI / 2,
            color,
            groupIdx: i,
          });
        }
      }
    });
    return { wood, bags, infos };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withStock, itemNames, language, labels.stock, cols, maxStock]);

  const { hoveredGroup, onOver, onOut } = useGroupHover(infos, setHover);

  return (
    <group>
      <HallShell width={hallW} depth={hallD} color="#b45309" />
      <InstancedUnits
        entries={wood}
        hoveredGroup={hoveredGroup}
        onOver={onOver}
        onOut={onOut}
        castShadow
        geometry={<boxGeometry args={[1, 1, 1]} />}
        material={<meshStandardMaterial roughness={0.9} />}
      />
      <InstancedUnits
        entries={bags}
        hoveredGroup={hoveredGroup}
        onOver={onOver}
        onOut={onOut}
        castShadow
        geometry={<capsuleGeometry args={[0.26, 0.6, 4, 10]} />}
        material={<meshStandardMaterial roughness={0.85} />}
      />
    </group>
  );
}

// ============================================================
// Waste scene — shapes per waste type (instanced)
// ============================================================

type WasteKind = "ink_barrels" | "plastic_blocks" | "general";

function classifyWaste(type: string): WasteKind {
  const t = type.toLowerCase();
  if (t.includes("حبر") || t.includes("برميل") || t.includes("براميل") || /ink|barrel/.test(t)) {
    return "ink_barrels";
  }
  if (t.includes("بلاستيك") || t.includes("كتل") || /plastic|block/.test(t)) {
    return "plastic_blocks";
  }
  return "general";
}

function WasteScene({
  balances,
  labels,
  setHover,
}: {
  balances: { type: string; balance: number; totalIn: number; totalOut: number; unit: string }[];
  labels: { balance: string; totalIn: string; totalOut: string };
  setHover: (info: HoverInfo | null) => void;
}) {
  const shown = useMemo(
    () => balances.slice(0, MAX_WASTE_TYPES),
    [balances],
  );
  const maxBalance = Math.max(1, ...shown.map((b) => Math.abs(b.balance)));
  const cols = Math.max(3, Math.ceil(Math.sqrt(shown.length * 1.3)));
  const hallW = Math.max(14, cols * 3.2 + 4);
  const hallD = Math.max(12, Math.ceil(shown.length / cols) * 3.2 + 8);

  const { barrels, blocks, lumps, infos } = useMemo(() => {
    const barrels: InstanceEntry[] = [];
    const blocks: InstanceEntry[] = [];
    const lumps: InstanceEntry[] = [];
    const infos: HoverInfo[] = [];
    shown.forEach((b, i) => {
      const col = i % cols;
      const rowIdx = Math.floor(i / cols);
      const cx = (col - (cols - 1) / 2) * 3.2;
      const cz = rowIdx * 3.2 - 3;
      const kind = classifyWaste(b.type);
      const scale = Math.max(0.2, Math.abs(b.balance) / maxBalance);
      const count = Math.max(1, Math.min(6, Math.round(scale * 6)));
      infos.push({
        title: b.type,
        lines: [
          {
            label: labels.balance,
            value: `${formatNumber(b.balance)} ${b.unit}`.trim(),
          },
          {
            label: labels.totalIn,
            value: `${formatNumber(b.totalIn)} ${b.unit}`.trim(),
          },
          {
            label: labels.totalOut,
            value: `${formatNumber(b.totalOut)} ${b.unit}`.trim(),
          },
        ],
      });
      for (let k = 0; k < count; k++) {
        const angle = (k / count) * Math.PI * 2;
        const r = count > 1 ? 0.75 : 0;
        const x = cx + Math.cos(angle) * r;
        const z = cz + Math.sin(angle) * r;
        if (kind === "ink_barrels") {
          barrels.push({ pos: [x, 0.55, z], color: "#6d28d9", groupIdx: i });
        } else if (kind === "plastic_blocks") {
          blocks.push({
            pos: [x, 0.4, z],
            rotY: angle,
            color: "#0284c7",
            groupIdx: i,
          });
        } else {
          lumps.push({
            pos: [x, 0.45, z],
            rotY: angle,
            color: "#57534e",
            groupIdx: i,
          });
        }
      }
    });
    return { barrels, blocks, lumps, infos };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, cols, maxBalance, labels.balance, labels.totalIn, labels.totalOut]);

  const { hoveredGroup, onOver, onOut } = useGroupHover(infos, setHover);

  return (
    <group>
      <HallShell width={hallW} depth={hallD} color="#44403c" />
      <InstancedUnits
        entries={barrels}
        hoveredGroup={hoveredGroup}
        onOver={onOver}
        onOut={onOut}
        castShadow
        geometry={<cylinderGeometry args={[0.38, 0.38, 1.1, 14]} />}
        material={<meshStandardMaterial metalness={0.35} roughness={0.5} />}
      />
      <InstancedUnits
        entries={blocks}
        hoveredGroup={hoveredGroup}
        onOver={onOver}
        onOut={onOut}
        castShadow
        geometry={<boxGeometry args={[0.85, 0.8, 0.85]} />}
        material={<meshStandardMaterial roughness={0.4} />}
      />
      <InstancedUnits
        entries={lumps}
        hoveredGroup={hoveredGroup}
        onOver={onOver}
        onOut={onOut}
        castShadow
        geometry={<icosahedronGeometry args={[0.55, 0]} />}
        material={<meshStandardMaterial roughness={1} />}
      />
    </group>
  );
}

// ============================================================
// Main page
// ============================================================

export default function VirtualWarehouse3D() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [scene, setScene] = useState<SceneId>("overview");
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [selected, setSelected] = useState<SelectedPallet | null>(null);
  const [, navigate] = useLocation();
  const controlsRef = useRef<any>(null);
  const perf = useMemo(detectPerfProfile, []);

  // Live refresh: keep the 3D scene in sync with warehouse transactions
  // without a manual page reload. Background refetches never toggle
  // `isLoading`, so the Canvas is not remounted and the camera keeps its
  // position (no flicker/reset).
  const LIVE_REFRESH_MS = 30_000;

  const handleSelectPallet = (sel: SelectedPallet) => {
    setHover(null);
    setSelected(sel);
  };

  const openInWarehouse = () => {
    if (!selected) return;
    navigate(
      `/warehouse?tab=${selected.target}&po=${selected.productionOrderId}`,
    );
  };

  const { data: productionHall = [], isLoading: loadingProduction } = useQuery<
    ProductionHallRow[]
  >({
    queryKey: ["/api/warehouse/production-hall"],
    refetchInterval: LIVE_REFRESH_MS,
    staleTime: LIVE_REFRESH_MS,
  });

  const { data: deliveryHall = [], isLoading: loadingFinished } = useQuery<
    DeliveryHallRow[]
  >({
    queryKey: ["/api/warehouse/delivery-hall"],
    refetchInterval: LIVE_REFRESH_MS,
    staleTime: LIVE_REFRESH_MS,
  });

  const { data: inventoryRows = [], isLoading: loadingInventory } = useQuery<
    InventoryRow[]
  >({
    queryKey: ["/api/inventory"],
    refetchInterval: LIVE_REFRESH_MS,
    staleTime: LIVE_REFRESH_MS,
  });

  const { data: items = [] } = useQuery<ItemRow[]>({
    queryKey: ["/api/items"],
    refetchInterval: LIVE_REFRESH_MS,
    staleTime: LIVE_REFRESH_MS,
  });

  const { data: wasteIn = [], isLoading: loadingWasteIn } = useQuery<
    WasteVoucherRow[]
  >({
    queryKey: ["/api/warehouse/vouchers/industrial-waste-in"],
    refetchInterval: LIVE_REFRESH_MS,
    staleTime: LIVE_REFRESH_MS,
  });

  const { data: wasteOut = [], isLoading: loadingWasteOut } = useQuery<
    WasteVoucherRow[]
  >({
    queryKey: ["/api/warehouse/vouchers/industrial-waste-out"],
    refetchInterval: LIVE_REFRESH_MS,
    staleTime: LIVE_REFRESH_MS,
  });

  const itemNames = useMemo(() => {
    const map = new Map<string, { name: string | null; name_ar: string | null }>();
    for (const it of items) {
      map.set(String(it.id), { name: it.name, name_ar: it.name_ar });
    }
    return map;
  }, [items]);

  const wasteBalances = useMemo(() => {
    const byType = new Map<
      string,
      { totalIn: number; totalOut: number; unit: string }
    >();
    for (const v of wasteIn) {
      if (v.status === "cancelled") continue;
      const key = (v.waste_type || "").trim() || "—";
      const entry = byType.get(key) || { totalIn: 0, totalOut: 0, unit: t("common.kg") };
      entry.totalIn += num(v.quantity);
      byType.set(key, entry);
    }
    for (const v of wasteOut) {
      if (v.status === "cancelled") continue;
      const key = (v.waste_type || "").trim() || "—";
      const entry = byType.get(key) || { totalIn: 0, totalOut: 0, unit: t("common.kg") };
      entry.totalOut += num(v.quantity);
      byType.set(key, entry);
    }
    return Array.from(byType.entries())
      .map(([type, e]) => ({
        type,
        balance: e.totalIn - e.totalOut,
        totalIn: e.totalIn,
        totalOut: e.totalOut,
        unit: e.unit,
      }))
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  }, [wasteIn, wasteOut, t]);

  const isLoading =
    loadingProduction || loadingFinished || loadingInventory || loadingWasteIn || loadingWasteOut;

  const buildingCounts: Record<Exclude<SceneId, "overview">, number> = {
    production: productionHall.length,
    finished: deliveryHall.length,
    raw: inventoryRows.filter((r) => num(r.current_stock) > 0).length,
    waste: wasteBalances.length,
  };

  const sceneTitles: Record<SceneId, string> = {
    overview: t("virtualWarehouse.title"),
    production: t("virtualWarehouse.productionHall"),
    finished: t("virtualWarehouse.finishedGoods"),
    raw: t("virtualWarehouse.rawMaterials"),
    waste: t("virtualWarehouse.wasteWarehouse"),
  };

  const sceneEmpty =
    (scene === "production" && productionHall.length === 0) ||
    (scene === "finished" && deliveryHall.length === 0) ||
    (scene === "raw" && buildingCounts.raw === 0) ||
    (scene === "waste" && wasteBalances.length === 0);

  const shownCapped =
    (scene === "production" && productionHall.length > MAX_PALLETS) ||
    (scene === "finished" && deliveryHall.length > MAX_PALLETS) ||
    (scene === "raw" && buildingCounts.raw > MAX_RAW_ITEMS) ||
    (scene === "waste" && wasteBalances.length > MAX_WASTE_TYPES);

  const enterScene = (id: SceneId) => {
    setHover(null);
    setScene(id);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden font-sans">
      <Header />
      <div className="flex-1 flex relative">
        <Sidebar />
        <main
          className={`flex-1 relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 ${isRTL ? "lg:mr-64" : "lg:ml-64"}`}
        >
          {/* Top bar: title + back */}
          <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
            <Card className="bg-slate-900/90 backdrop-blur-xl border-slate-700/50 text-white shadow-2xl pointer-events-auto">
              <CardContent className="p-3 flex items-center gap-2">
                <WarehouseIcon size={18} className="text-emerald-400" />
                <div>
                  <div className="text-sm font-bold">{sceneTitles[scene]}</div>
                  {scene === "overview" && (
                    <div className="text-[11px] text-slate-400">
                      {t("virtualWarehouse.enterHint")}
                    </div>
                  )}
                  {(scene === "production" || scene === "finished") && (
                    <div className="text-[11px] text-slate-400">
                      {t("virtualWarehouse.palletClickHint")}
                    </div>
                  )}
                </div>
                {isLoading && (
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                )}
              </CardContent>
            </Card>
            {scene !== "overview" && (
              <Button
                variant="secondary"
                size="sm"
                className="pointer-events-auto bg-slate-800/90 text-white border border-slate-600 hover:bg-slate-700"
                onClick={() => enterScene("overview")}
                data-testid="button-back-overview"
              >
                <ArrowRight size={16} className={isRTL ? "" : "rotate-180"} />
                <span className="mx-1">{t("virtualWarehouse.back")}</span>
              </Button>
            )}
          </div>

          {/* Quick scene switcher */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center pointer-events-none">
            <div className="flex gap-1.5 bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 rounded-xl p-1.5 pointer-events-auto">
              {(
                [
                  { id: "production" as const, icon: Factory },
                  { id: "finished" as const, icon: Package },
                  { id: "raw" as const, icon: Boxes },
                  { id: "waste" as const, icon: Recycle },
                ]
              ).map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => enterScene(scene === id ? "overview" : id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    scene === id
                      ? "bg-emerald-600 text-white"
                      : "text-slate-300 hover:bg-slate-700/70"
                  }`}
                  data-testid={`button-scene-${id}`}
                >
                  <Icon size={14} />
                  {sceneTitles[id]}
                  <span className="text-[10px] opacity-75">
                    {buildingCounts[id]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Hover info panel */}
          {hover && (
            <div
              className={`absolute top-20 z-20 ${isRTL ? "left-3" : "right-3"}`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/60 text-white shadow-2xl w-64">
                <CardContent className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-bold" data-testid="text-hover-title">
                      {hover.title}
                    </div>
                    {hover.badge && (
                      <Badge
                        className={
                          hover.badge.variant === "green"
                            ? "bg-emerald-600 text-white"
                            : hover.badge.variant === "gray"
                              ? "bg-slate-600 text-white"
                              : "bg-blue-600 text-white"
                        }
                      >
                        {hover.badge.text}
                      </Badge>
                    )}
                  </div>
                  {hover.lines.map((l, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-400">{l.label}</span>
                      <span className="font-medium">{l.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pallet details dialog */}
          <Dialog
            open={!!selected}
            onOpenChange={(open) => {
              if (!open) setSelected(null);
            }}
          >
            <DialogContent
              dir={isRTL ? "rtl" : "ltr"}
              className="max-w-md"
              data-testid="dialog-pallet-details"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-2 pt-2">
                  <span data-testid="text-pallet-title">
                    {selected?.info.title}
                  </span>
                  {selected?.info.badge && (
                    <Badge
                      className={
                        selected.info.badge.variant === "green"
                          ? "bg-emerald-600 text-white"
                          : selected.info.badge.variant === "gray"
                            ? "bg-slate-600 text-white"
                            : "bg-blue-600 text-white"
                      }
                    >
                      {selected.info.badge.text}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {t("virtualWarehouse.palletDetails")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {selected?.info.lines.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm border-b border-border/50 pb-1.5 last:border-0"
                  >
                    <span className="text-muted-foreground">{l.label}</span>
                    <span className="font-medium">{l.value}</span>
                  </div>
                ))}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setSelected(null)}
                  data-testid="button-close-pallet-dialog"
                >
                  {t("virtualWarehouse.close")}
                </Button>
                <Button
                  onClick={openInWarehouse}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="button-open-in-warehouse"
                >
                  <WarehouseIcon size={16} className={isRTL ? "ml-2" : "mr-2"} />
                  {t("virtualWarehouse.openInWarehouse")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Empty / capped notices */}
          {scene !== "overview" && sceneEmpty && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900/85 text-slate-300 text-sm px-5 py-3 rounded-xl border border-slate-700/60">
                {t("virtualWarehouse.empty")}
              </div>
            </div>
          )}
          {shownCapped && (
            <div className="absolute top-16 inset-x-0 z-10 flex justify-center pointer-events-none">
              <div className="bg-amber-900/70 text-amber-200 text-[11px] px-3 py-1 rounded-lg border border-amber-700/50">
                {t("virtualWarehouse.cappedNote")}
              </div>
            </div>
          )}

          <Canvas
            shadows={perf.shadows}
            dpr={perf.dpr}
            gl={{ antialias: perf.antialias, powerPreference: "high-performance" }}
            className="!bg-transparent"
          >
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={SCENE_POSES.overview.pos} fov={45} />
              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                minDistance={6}
                maxDistance={60}
                maxPolarAngle={Math.PI / 2.1}
              />
              <CameraRig scene={scene} controlsRef={controlsRef} />

              <ambientLight intensity={perf.shadows ? 0.55 : 0.75} />
              <directionalLight
                position={[18, 24, 12]}
                intensity={1.1}
                castShadow={perf.shadows}
                shadow-mapSize-width={perf.shadowMapSize}
                shadow-mapSize-height={perf.shadowMapSize}
              />
              <Environment preset="warehouse" />

              <Ground />
              {perf.contactShadows && (
                <ContactShadows
                  position={[0, 0, 0]}
                  opacity={0.35}
                  scale={70}
                  blur={2.2}
                  far={12}
                  frames={1}
                />
              )}

              {scene === "overview" && (
                <group>
                  {BUILDINGS.map((def) => (
                    <Building
                      key={def.id}
                      def={def}
                      label={t(def.labelKey)}
                      count={buildingCounts[def.id]}
                      isRTL={isRTL}
                      onEnter={() => enterScene(def.id)}
                    />
                  ))}
                  {/* roads between buildings */}
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                    <planeGeometry args={[5, 60]} />
                    <meshStandardMaterial color="#0f172a" roughness={1} />
                  </mesh>
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                    <planeGeometry args={[60, 5]} />
                    <meshStandardMaterial color="#0f172a" roughness={1} />
                  </mesh>
                </group>
              )}

              {scene === "production" && (
                <ProductionHallScene
                  rows={productionHall}
                  labels={{
                    productionOrder: t("virtualWarehouse.productionOrder"),
                    order: t("virtualWarehouse.order"),
                    customer: t("virtualWarehouse.customer"),
                    product: t("virtualWarehouse.product"),
                    readyWeight: t("virtualWarehouse.readyWeight"),
                    kg: t("common.kg"),
                  }}
                  setHover={setHover}
                  onSelect={handleSelectPallet}
                />
              )}

              {scene === "finished" && (
                <FinishedGoodsScene
                  rows={deliveryHall}
                  labels={{
                    order: t("virtualWarehouse.order"),
                    customer: t("virtualWarehouse.customer"),
                    product: t("virtualWarehouse.product"),
                    receivedWeight: t("virtualWarehouse.receivedWeight"),
                    requiredWeight: t("virtualWarehouse.requiredWeight"),
                    fullyReceived: t("virtualWarehouse.fullyReceived"),
                    partiallyReceived: t("virtualWarehouse.partiallyReceived"),
                    kg: t("common.kg"),
                  }}
                  setHover={setHover}
                  onSelect={handleSelectPallet}
                />
              )}

              {scene === "raw" && (
                <RawMaterialsScene
                  rows={inventoryRows}
                  itemNames={itemNames}
                  labels={{
                    material: t("virtualWarehouse.material"),
                    stock: t("virtualWarehouse.stock"),
                  }}
                  setHover={setHover}
                />
              )}

              {scene === "waste" && (
                <WasteScene
                  balances={wasteBalances}
                  labels={{
                    balance: t("virtualWarehouse.balance"),
                    totalIn: t("virtualWarehouse.totalIn"),
                    totalOut: t("virtualWarehouse.totalOut"),
                  }}
                  setHover={setHover}
                />
              )}
            </Suspense>
          </Canvas>
        </main>
      </div>
    </div>
  );
}
