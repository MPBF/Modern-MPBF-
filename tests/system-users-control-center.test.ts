/**
 * اختبارات مركز تحكم مستخدمي النظام
 *
 * تغطي:
 * - التحقق من مخطط الإعدادات الجديد (reply_delay_min > max يُرفض)
 * - السجل الثابت للمصادر والجداول (رفض غير المصرح بها)
 * - التحقق من عدم قبول مصادر/جداول غير موجودة في السجل
 * - منطق المعاينة التاريخية (لا يتجاوز 366 يوماً)
 * - صلاحيات admin لتوليد التاريخ ومنح الجداول المتقدمة
 * - التحقق من مخطط قاعدة المعرفة
 */
import { describe, it, expect } from "@jest/globals";
import { readFileSync } from "node:fs";
import { updateSystemUserSettingsSchema, systemUserKnowledgeSchema } from "../shared/schema";
import {
  DATA_SOURCES,
  ADVANCED_TABLES,
} from "../server/routes/system-users";
import { computeScheduledAt } from "../server/services/system-user-simulator";
import { pool } from "../server/db";
import {
  runLegacySystemUserDataAccessBackfill,
} from "../server/services/system-user-data-access";
import {
  pickEditableSystemUserSettings,
} from "../client/src/pages/settings/system-users/api";

// ── اختبارات updateSystemUserSettingsSchema ──

describe("updateSystemUserSettingsSchema", () => {
  it("يحذف حقول قاعدة البيانات عند حفظ صف إعدادات محمّل", () => {
    const payload = pickEditableSystemUserSettings({
      id: 17,
      user_id: 8,
      created_at: new Date(),
      updated_at: new Date(),
      enabled: true,
      allowed_days: [0, 1, 2, 3, 4],
      shift: "day",
      reply_style: "professional",
      allowed_message_categories: ["عامة"],
    });
    expect(payload).not.toHaveProperty("id");
    expect(payload).not.toHaveProperty("user_id");
    expect(payload).not.toHaveProperty("created_at");
    expect(payload).not.toHaveProperty("updated_at");
    expect(updateSystemUserSettingsSchema.safeParse(payload).success).toBe(true);
  });

  it("يقبل الإعدادات الصحيحة", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      reply_delay_min_minutes: 5,
      reply_delay_max_minutes: 30,
      reply_style: "professional",
    });
    expect(result.success).toBe(true);
  });

  it("يرفض إذا كان reply_delay_min > reply_delay_max", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      reply_delay_min_minutes: 60,
      reply_delay_max_minutes: 10,
    });
    expect(result.success).toBe(false);
    const errors = result.success ? [] : result.error.flatten().fieldErrors;
    expect(JSON.stringify(errors)).toContain("reply_delay_min_minutes");
  });

  it("يقبل reply_delay_min === reply_delay_max", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      reply_delay_min_minutes: 15,
      reply_delay_max_minutes: 15,
    });
    expect(result.success).toBe(true);
  });

  it("يرفض reply_style غير صالح", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      reply_style: "invalid_style",
    });
    expect(result.success).toBe(false);
  });

  it("يرفض reply_window_start بصيغة خاطئة", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      reply_window_start: "8:00",
    });
    expect(result.success).toBe(false);
  });

  it("يقبل reply_window_start بصيغة صحيحة HH:mm", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      reply_window_start: "08:00",
      reply_window_end: "17:00",
    });
    expect(result.success).toBe(true);
  });

  it("يرفض ساعة أو دقيقة خارج النطاق الحقيقي", () => {
    expect(
      updateSystemUserSettingsSchema.safeParse({
        reply_window_start: "25:00",
      }).success,
    ).toBe(false);
    expect(
      updateSystemUserSettingsSchema.safeParse({
        reply_window_end: "12:75",
      }).success,
    ).toBe(false);
  });

  it("يقبل attendance_start_date بصيغة YYYY-MM-DD", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      attendance_start_date: "2024-01-15",
    });
    expect(result.success).toBe(true);
  });

  it("يرفض attendance_start_date بصيغة خاطئة", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      attendance_start_date: "15/01/2024",
    });
    expect(result.success).toBe(false);
  });

  it("يحافظ على سلوك daily_message_target الحالي", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      daily_message_target: 15,
      daily_message_cap: 10,
    });
    expect(result.success).toBe(false);
  });

  it("يقبل allowed_message_categories كمصفوفة", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      allowed_message_categories: ["عامة", "تكليف عمل"],
    });
    expect(result.success).toBe(true);
  });

  it("يرفض فئة مراسلات غير معرّفة", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      allowed_message_categories: ["فئة غير معروفة"],
    });
    expect(result.success).toBe(false);
  });

  it("يرفض قائمة أيام رد صريحة فارغة", () => {
    const result = updateSystemUserSettingsSchema.safeParse({
      reply_allowed_days: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("reply-day scheduling", () => {
  const bot = (replyDays: string | null, allowedDays = "[1]") =>
    ({
      settings: {
        reply_delay_min_minutes: 0,
        reply_delay_max_minutes: 0,
        reply_window_start: null,
        reply_window_end: null,
        reply_allowed_days: replyDays,
        allowed_days: allowedDays,
        shift: "day",
      },
    }) as any;

  it("يرث أيام التشغيل عندما تكون أيام الرد null", () => {
    const scheduled = computeScheduledAt(
      bot(null),
      new Date("2026-08-24T00:00:00.000Z"),
    );
    expect(scheduled?.toISOString()).toBe("2026-08-24T04:00:00.000Z");
  });

  it("يحترم قائمة أيام رد مخصصة", () => {
    const scheduled = computeScheduledAt(
      bot("[2]"),
      new Date("2026-08-24T00:00:00.000Z"),
    );
    expect(scheduled?.toISOString()).toBe("2026-08-25T04:00:00.000Z");
  });

  it("لا ينتج وقت تنفيذ عندما تكون أيام التشغيل الموروثة فارغة", () => {
    expect(
      computeScheduledAt(
        bot(null, "[]"),
        new Date("2026-08-24T00:00:00.000Z"),
      ),
    ).toBeNull();
  });
});

// ── اختبارات systemUserKnowledgeSchema ──

describe("systemUserKnowledgeSchema", () => {
  it("يقبل مقالة معرفة عامة (system_user_id = null)", () => {
    const result = systemUserKnowledgeSchema.safeParse({
      title: "دليل العمل",
      content: "محتوى تفصيلي",
      system_user_id: null,
      item_type: "knowledge",
    });
    expect(result.success).toBe(true);
  });

  it("يرفض item_type غير صالح", () => {
    const result = systemUserKnowledgeSchema.safeParse({
      title: "اختبار",
      content: "محتوى",
      item_type: "invalid_type",
    });
    expect(result.success).toBe(false);
  });

  it("يقبل item_type: instruction", () => {
    const result = systemUserKnowledgeSchema.safeParse({
      title: "تعليمات الرد",
      content: "يجب الرد خلال 24 ساعة",
      item_type: "instruction",
    });
    expect(result.success).toBe(true);
  });

  it("يرفض أولوية سالبة", () => {
    const result = systemUserKnowledgeSchema.safeParse({
      title: "اختبار",
      content: "محتوى",
      priority: -1,
    });
    expect(result.success).toBe(false);
  });
});

// ── اختبارات السجل الثابت (DATA_SOURCES و ADVANCED_TABLES) ──

describe("DATA_SOURCES registry", () => {
  it("يحتوي على المصادر السبعة المحددة في المواصفات", () => {
    const expectedSources = [
      "customers",
      "products",
      "orders",
      "production",
      "attendance",
      "messages",
      "reports",
    ];
    for (const src of expectedSources) {
      expect(DATA_SOURCES).toHaveProperty(src);
    }
  });

  it("لا يكشف حقولاً حساسة في مصدر customers", () => {
    const fields = DATA_SOURCES.customers.fields;
    const forbidden = ["phone", "tax_number", "address", "unified_number", "commercial_name"];
    for (const f of forbidden) {
      expect(fields).not.toContain(f);
    }
  });

  it("لا يكشف حقولاً حساسة في مصدر attendance", () => {
    const fields = DATA_SOURCES.attendance.fields;
    const forbidden = ["device_id", "location", "notes", "ip_address"];
    for (const f of forbidden) {
      expect(fields).not.toContain(f);
    }
  });

  it("مصدر reports لا يملك جدولاً مستقلاً", () => {
    expect(DATA_SOURCES.reports.table).toBeNull();
  });
});

describe("ADVANCED_TABLES registry", () => {
  it("يحتوي على الجداول المحددة في المواصفات فقط", () => {
    const expected = [
      "customers",
      "customer_products",
      "orders",
      "production_orders",
      "machines",
      "attendance",
      "internal_messages",
    ];
    for (const t of expected) {
      expect(ADVANCED_TABLES).toContain(t as any);
    }
    // لا يحتوي على جداول خارج القائمة
    expect(ADVANCED_TABLES.length).toBe(expected.length);
  });

  it("لا يشمل جداول حساسة", () => {
    const sensitive = ["users", "system_settings", "sessions", "roles", "permissions"];
    for (const t of sensitive) {
      expect(ADVANCED_TABLES).not.toContain(t as any);
    }
  });
});

// ── اختبارات منطق التاريخ (بدون DB) ──

describe("historical attendance date validation", () => {
  function validateDateRange(startStr: string, endStr: string, maxDays = 366): string | null {
    const start = new Date(`${startStr}T00:00:00Z`);
    const end = new Date(`${endStr}T00:00:00Z`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "تواريخ غير صالحة";
    if (end < start) return "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
    const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    if (diffDays > maxDays) return `النطاق يتجاوز ${maxDays} يوماً`;
    return null;
  }

  it("يقبل نطاقاً صالحاً", () => {
    expect(validateDateRange("2024-01-01", "2024-03-01")).toBeNull();
  });

  it("يرفض نطاقاً يتجاوز 366 يوماً", () => {
    const error = validateDateRange("2023-01-01", "2024-12-31");
    expect(error).toContain("366");
  });

  it("يرفض تاريخ نهاية قبل البداية", () => {
    const error = validateDateRange("2024-06-01", "2024-01-01");
    expect(error).toContain("بعد");
  });

  it("يقبل يوماً واحداً بالضبط", () => {
    expect(validateDateRange("2024-06-15", "2024-06-15")).toBeNull();
  });

  it("يقبل بالضبط 366 يوماً", () => {
    expect(validateDateRange("2024-01-01", "2024-12-31")).toBeNull();
  });
});

describe("legacy knowledge isolation", () => {
  const legacyRoutesSource = readFileSync(
    "server/routes/customer-service.ts",
    "utf8",
  );

  it("يقيد قائمة المعرفة القديمة بالعناصر العامة", () => {
    const listRoute = legacyRoutesSource.slice(
      legacyRoutesSource.indexOf('"/api/customer-service/knowledge"'),
      legacyRoutesSource.indexOf("// GET single"),
    );
    expect(listRoute).toContain(
      "isNull(customer_service_knowledge.system_user_id)",
    );
  });

  it("يقيد جلب المقال القديم المنفرد بالعناصر العامة", () => {
    const singleRoute = legacyRoutesSource.slice(
      legacyRoutesSource.indexOf('"/api/customer-service/knowledge/:id"'),
      legacyRoutesSource.indexOf("// POST create"),
    );
    expect(singleRoute).toContain(
      "isNull(customer_service_knowledge.system_user_id)",
    );
  });
});

describe("one-time data-access backfill", () => {
  it("لا يعيد المنح المسحوبة ولا يمنح مستخدماً أُنشئ بعد علامة الترحيل", async () => {
    const client = await pool.connect();
    const suffix = `${process.pid}_${Date.now()}`;
    try {
      await client.query("BEGIN");
      const first = await client.query<{ id: number }>(
        `INSERT INTO users (username, status, is_system_user)
         VALUES ($1, 'active', true)
         RETURNING id`,
        [`backfill_existing_${suffix}`],
      );
      const later = await client.query<{ id: number }>(
        `INSERT INTO users (username, status, is_system_user)
         VALUES ($1, 'active', false)
         RETURNING id`,
        [`backfill_later_${suffix}`],
      );
      const existingId = first.rows[0].id;
      const laterId = later.rows[0].id;
      const marker = `test_system_user_access_backfill_${suffix}`.slice(0, 100);

      await runLegacySystemUserDataAccessBackfill(client, marker);
      const initial = await client.query<{ count: number }>(
        `SELECT count(*)::int AS count
         FROM system_user_data_access
         WHERE user_id = $1 AND access_kind = 'source'`,
        [existingId],
      );
      expect(initial.rows[0].count).toBe(3);

      await client.query(
        "DELETE FROM system_user_data_access WHERE user_id = $1",
        [existingId],
      );
      await client.query(
        "UPDATE users SET is_system_user = true WHERE id = $1",
        [laterId],
      );
      await runLegacySystemUserDataAccessBackfill(client, marker);

      const afterRestart = await client.query<{ count: number }>(
        `SELECT count(*)::int AS count
         FROM system_user_data_access
         WHERE user_id IN ($1, $2)`,
        [existingId, laterId],
      );
      expect(afterRestart.rows[0].count).toBe(0);
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
  });
});
