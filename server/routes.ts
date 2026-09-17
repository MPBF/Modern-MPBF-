import type { Express } from "express";

import { createServer, type Server } from "http";

import { db } from "./db";
import { getLegacyPool, isLegacyDbConfigured } from "./legacy-db";
import { requirePermission } from "./middleware/auth";
import { registerLegacyRoutes } from "./routes/legacy";
import { registerMachinesRoutes } from "./routes/machines";
import { registerMixingRoutes } from "./routes/mixing";
import { registerOrdersRoutes } from "./routes/orders";
import { registerProductionRoutes } from "./routes/production";
import { registerSystemRoutes } from "./routes/system";
import { registerUsersRoutes } from "./routes/users";
import { registerWarehouseRoutes } from "./routes/warehouse";
import { company_profile } from "@shared/schema";
import { sql } from "drizzle-orm";
import multer from "multer";
import { z } from "zod";

export async function registerRoutes(
  app: Express,
  existingServer?: Server,
): Promise<Server> {
  const bagQuoteIpHits = new Map<string, number[]>();
  const bagQuoteGlobalHits: number[] = [];
  const IP_WINDOW_MS = 10 * 60 * 1000;
  const IP_MAX = 5;
  const GLOBAL_WINDOW_MS = 60 * 1000;
  const GLOBAL_MAX = 30;
  const normalizePhoneServer = (raw: string): string => {
    const trimmed = (raw || "").replace(/[\s\-()]/g, "");
    if (/^05\d{8}$/.test(trimmed)) return "+966" + trimmed.slice(1);
    if (/^5\d{8}$/.test(trimmed)) return "+966" + trimmed;
    if (/^00\d{8,15}$/.test(trimmed)) return "+" + trimmed.slice(2);
    if (/^\+\d{8,15}$/.test(trimmed)) return trimmed;
    if (/^\d{8,15}$/.test(trimmed)) return "+" + trimmed;
    return "";
  };

  const webLoginAttempts = new Map<string, { count: number; lastAttempt: number }>();
  const WEB_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
  const WEB_MAX_ATTEMPTS = 10;
  const changePasswordAttempts = new Map<number, { count: number; lastAttempt: number }>();
  const CHANGE_PW_WINDOW_MS = 15 * 60 * 1000;
  const CHANGE_PW_MAX_ATTEMPTS = 10;

  const resolveInlinePrintedFields = async (
    enabled: boolean,
    filmMachineId: string,
    productionOrderId: number,
    userId: number,
  ): Promise<Record<string, unknown>> => {
    if (!enabled) return {};

    const [info] = (
      await db.execute(sql`
        SELECT
          m.inline_printer_id AS inline_printer_id,
          COALESCE(cp.is_printed, false) AS is_printed
        FROM machines m
        LEFT JOIN production_orders po ON po.id = ${productionOrderId}
        LEFT JOIN customer_products cp ON cp.id = po.customer_product_id
        WHERE m.id = ${filmMachineId}
      `)
    ).rows as Array<{ inline_printer_id?: string; is_printed?: boolean }>;

    if (!info?.inline_printer_id) {
      throw Object.assign(new Error("INLINE_NOT_SUPPORTED"), {
        status: 400,
        userMessage: "هذه الماكينة غير مدمجة مع طابعة إنلاين",
      });
    }
    if (!info.is_printed) {
      throw Object.assign(new Error("INLINE_NOT_PRINTED_PRODUCT"), {
        status: 400,
        userMessage: "الطباعة الإنلاين متاحة فقط للمنتجات المطبوعة",
      });
    }

    const now = new Date();
    return {
      stage: "printing",
      printing_machine_id: info.inline_printer_id,
      printed_by: userId,
      created_at: now,
      printed_at: now,
    };
  };

  const sanitizeRollCreateInput = <T extends Record<string, unknown>>(data: T) => {
    const {
      stage: _stage,
      printing_machine_id: _printingMachineId,
      cutting_machine_id: _cuttingMachineId,
      printed_at: _printedAt,
      cut_completed_at: _cutCompletedAt,
      completed_at: _completedAt,
      ...rest
    } = data;
    return { ...rest, stage: "film" };
  };

  const cleanMachineDimensionFields = (body: Record<string, unknown>) => {
    const nullable = (value: unknown) =>
      value === "" || value === null || value === undefined ? null : value;
    const result: Record<string, unknown> = {};
    for (const field of [
      "min_width_cm", "max_width_cm", "min_thickness", "max_thickness",
      "min_cylinder_inch", "max_cylinder_inch", "min_length_cm", "max_length_cm",
      "width_cm", "length_cm", "height_cm", "weight_kg", "manufacture_date",
    ]) {
      if (field in body) result[field] = nullable(body[field]);
    }
    if ("max_print_colors" in body) {
      const value = body.max_print_colors;
      result.max_print_colors = value === "" || value === null || value === undefined
        ? null
        : Number.isNaN(Number.parseInt(String(value), 10))
          ? null
          : Number.parseInt(String(value), 10);
    }
    return result;
  };

  const validateMachineDimensionRanges = (data: Record<string, unknown>) => {
    for (const [min, max, label] of [
      ["min_width_cm", "max_width_cm", "العرض"],
      ["min_thickness", "max_thickness", "السماكة العالمية"],
      ["min_cylinder_inch", "max_cylinder_inch", "الأسطوانة"],
      ["min_length_cm", "max_length_cm", "الطول"],
    ]) {
      if (data[min] == null || data[max] == null || data[min] === "" || data[max] === "") continue;
      if (Number(data[min]) > Number(data[max])) return `الحد الأدنى لـ${label} لا يمكن أن يكون أكبر من الحد الأقصى`;
    }
    return null;
  };

  const VALID_QUEUE_STAGES = ["film", "printing", "cutting"];
  const setupAttempts = new Map<string, { count: number; resetAt: number }>();
  const COMPANY_LOGO_CACHE_TTL_MS = 60 * 60 * 1000;
  const ctx: Record<string, unknown> = {
    bagQuoteIpHits, bagQuoteGlobalHits, IP_WINDOW_MS, IP_MAX, GLOBAL_WINDOW_MS, GLOBAL_MAX,
    normalizePhoneServer, webLoginAttempts, WEB_RATE_LIMIT_WINDOW_MS, WEB_MAX_ATTEMPTS,
    changePasswordAttempts, CHANGE_PW_WINDOW_MS, CHANGE_PW_MAX_ATTEMPTS,
    resolveInlinePrintedFields, sanitizeRollCreateInput, cleanMachineDimensionFields,
    validateMachineDimensionRanges, VALID_QUEUE_STAGES, setupAttempts,
    COMPANY_LOGO_CACHE_TTL_MS, companyLogoCache: null, companyLogoVersion: 0,
    loadCompanyLogo: async () => {
      const [profile] = await db.select({ logo_url: company_profile.logo_url }).from(company_profile).limit(1);
      return profile?.logo_url || null;
    },
    excelUpload: multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 } }),
    getLegacyPool, isLegacyDbConfigured,
    legacyCountCache: new Map<string, { total: number; expiresAt: number }>(),
    deliveryManifestPayloadSchema: z.object({ reference: z.string().min(1).max(50), stops: z.array(z.object({ zone: z.number().int().min(1).max(20) }).passthrough()).max(50) }),
    parseManifestId: (raw: string, res: { status: (code: number) => { json: (body: unknown) => void } }) => {
      const id = Number(raw);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ message: "معرف الكشف غير صحيح" });
        return null;
      }
      return id;
    },
  };

  const server = existingServer || createServer(app);
  await registerSystemRoutes(app, ctx);
  await registerUsersRoutes(app, ctx);
  await registerOrdersRoutes(app, ctx);
  await registerProductionRoutes(app, ctx);
  await registerMachinesRoutes(app, ctx);
  await registerWarehouseRoutes(app, ctx);
  await registerMixingRoutes(app, ctx);
  await registerLegacyRoutes(app, ctx);
  return server;
}
