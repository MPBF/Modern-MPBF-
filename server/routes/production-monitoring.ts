import type { Express } from "express";


import { storage } from "../storage";

import { parseIntSafe } from "@shared/validation-utils";

import { requireAuth, requirePermission, type AuthRequest } from "../middleware/auth";

// Extracted from server/routes/production.ts (registration order preserved;
// called from registerProductionRoutes). See server/routes/README.md.
export async function registerProductionMonitoringRoutes(app: Express, ctx: any) {

  // ============ Production Monitoring Analytics API Routes ============

  // Get user performance statistics
  app.get("/api/production/user-performance", requireAuth, async (req, res) => {
    try {
      const userId = req.query.user_id
        ? parseIntSafe(req.query.user_id as string, "User ID", { min: 1 })
        : undefined;
      const dateFrom = (req.query.date_from as string) || undefined;
      const dateTo = (req.query.date_to as string) || undefined;

      // Validate date format if provided
      if (dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
        return res
          .status(400)
          .json({ message: "تنسيق تاريخ البداية غير صحيح (YYYY-MM-DD)" });
      }
      if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
        return res
          .status(400)
          .json({ message: "تنسيق تاريخ النهاية غير صحيح (YYYY-MM-DD)" });
      }

      const performance = await storage.getUserPerformanceStats(
        userId,
        dateFrom,
        dateTo,
      );

      res.json({
        data: performance,
        period: {
          from: dateFrom || "آخر 7 أيام",
          to: dateTo || "اليوم",
          user_filter: userId ? `المستخدم ${userId}` : "جميع المستخدمين",
        },
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching user performance stats:", error);
      res.status(500).json({
        message: "خطأ في جلب إحصائيات أداء المستخدمين",
      });
    }
  });

  // Get role performance statistics
  app.get("/api/production/role-performance", requireAuth, async (req, res) => {
    try {
      const dateFrom = (req.query.date_from as string) || undefined;
      const dateTo = (req.query.date_to as string) || undefined;

      // Validate date format if provided
      if (dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
        return res
          .status(400)
          .json({ message: "تنسيق تاريخ البداية غير صحيح (YYYY-MM-DD)" });
      }
      if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
        return res
          .status(400)
          .json({ message: "تنسيق تاريخ النهاية غير صحيح (YYYY-MM-DD)" });
      }

      const performance = await storage.getRolePerformanceStats(
        dateFrom,
        dateTo,
      );

      res.json({
        data: performance,
        period: {
          from: dateFrom || "آخر 7 أيام",
          to: dateTo || "اليوم",
        },
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching role performance stats:", error);
      res.status(500).json({
        message: "خطأ في جلب إحصائيات أداء الأقسام",
      });
    }
  });

  app.get(
    "/api/production/monitoring-dashboard",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;
        const data = await storage.getMonitoringDashboard(dateFrom, dateTo);
        res.json({ success: true, data });
      } catch (error: any) {
        console.error("Error fetching monitoring dashboard:", error);
        res.status(500).json({ message: "خطأ في جلب بيانات لوحة المراقبة" });
      }
    },
  );

  // Live floor-rolls feed: all rolls still on the factory floor (not 'done'),
  // sorted by most-recent activity. Used by the Production Monitoring "live
  // tracking" tab. Behind the same permission set as the rolls/monitoring views.
  app.get(
    "/api/production/floor-rolls",
    requireAuth,
    requirePermission(
      "view_production",
      "manage_production",
      "manage_production_hall",
      "view_production_monitoring",
      "view_production_reports",
      "admin",
    ),
    async (req, res) => {
      try {
        const parsedLimit = parseInt(String(req.query.limit ?? ""), 10);
        const parsedOffset = parseInt(String(req.query.offset ?? ""), 10);
        const floorRolls = await storage.getFloorRolls({
          limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
          offset: Number.isFinite(parsedOffset) ? parsedOffset : undefined,
        });
        res.json(floorRolls);
      } catch (error) {
        console.error("[GET /api/production/floor-rolls] Error:", error);
        res.status(500).json({ message: "خطأ في جلب رولات أرض المصنع" });
      }
    },
  );

  // Get real-time production statistics
  app.get("/api/production/real-time-stats", requireAuth, async (req, res) => {
    try {
      const realTimeStats = await storage.getRealTimeProductionStats();

      res.json({
        ...realTimeStats,
        updateInterval: 30000, // 30 seconds
      });
    } catch (error: any) {
      console.error("Error fetching real-time production stats:", error);
      res.status(500).json({
        message: "خطأ في جلب الإحصائيات الفورية",
      });
    }
  });

  // Get production efficiency metrics
  app.get(
    "/api/production/efficiency-metrics",
    requireAuth,
    async (req, res) => {
      try {
        const dateFrom = (req.query.date_from as string) || undefined;
        const dateTo = (req.query.date_to as string) || undefined;

        // Validate date format if provided
        if (dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
          return res
            .status(400)
            .json({ message: "تنسيق تاريخ البداية غير صحيح (YYYY-MM-DD)" });
        }
        if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
          return res
            .status(400)
            .json({ message: "تنسيق تاريخ النهاية غير صحيح (YYYY-MM-DD)" });
        }

        const metrics = await storage.getProductionEfficiencyMetrics(
          dateFrom,
          dateTo,
        );

        res.json({
          ...metrics,
          period: {
            from: dateFrom || "آخر 30 يوم",
            to: dateTo || "اليوم",
          },
          lastUpdated: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error("Error fetching production efficiency metrics:", error);
        res.status(500).json({
          message: "خطأ في جلب مؤشرات الكفاءة",
        });
      }
    },
  );

  // Get production alerts
  app.get("/api/production/alerts", requireAuth, async (req, res) => {
    try {
      const alerts = await storage.getProductionAlerts();

      res.json({
        alerts,
        alertCount: alerts.length,
        criticalCount: alerts.filter((a: any) => a.priority === "critical")
          .length,
        warningCount: alerts.filter(
          (a: any) => a.priority === "high" || a.priority === "medium",
        ).length,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching production alerts:", error);
      res.status(500).json({
        message: "خطأ في جلب تنبيهات الإنتاج",
      });
    }
  });

  // Get machine utilization statistics
  app.get(
    "/api/production/machine-utilization",
    requireAuth,
    async (req, res) => {
      try {
        const dateFrom = (req.query.date_from as string) || undefined;
        const dateTo = (req.query.date_to as string) || undefined;

        // Validate date format if provided
        if (dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
          return res
            .status(400)
            .json({ message: "تنسيق تاريخ البداية غير صحيح (YYYY-MM-DD)" });
        }
        if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
          return res
            .status(400)
            .json({ message: "تنسيق تاريخ النهاية غير صحيح (YYYY-MM-DD)" });
        }

        const utilizationStats = await storage.getMachineUtilizationStats(
          dateFrom,
          dateTo,
        );

        res.json({
          data: utilizationStats,
          period: {
            from: dateFrom || "آخر 7 أيام",
            to: dateTo || "اليوم",
          },
          totalMachines: utilizationStats.length,
          activeMachines: utilizationStats.filter(
            (m: any) => m.status === "active",
          ).length,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error("Error fetching machine utilization stats:", error);
        res.status(500).json({
          message: "خطأ في جلب إحصائيات استخدام المكائن",
        });
      }
    },
  );

  // ============ لوحة مراقبة الإنتاج - APIs جديدة ============

  // Get production statistics by section
  app.get(
    "/api/production/stats-by-section/:section",
    requireAuth,
    async (req, res) => {
      try {
        const { section } = req.params;
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;

        // Validate section
        if (!["film", "printing", "cutting"].includes(section)) {
          return res.status(400).json({ message: "قسم غير صحيح" });
        }

        // Get production statistics for the section
        const stats = await storage.getProductionStatsBySection(
          section,
          dateFrom,
          dateTo,
        );

        res.json(stats);
      } catch (error: any) {
        console.error("Error fetching section stats:", error);
        res.status(500).json({ message: "خطأ في جلب إحصائيات القسم" });
      }
    },
  );

  // Get users performance by section (production users only)
  app.get(
    "/api/production/users-performance/:section",
    requireAuth,
    async (req, res) => {
      try {
        const { section } = req.params;
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;

        // Validate section
        if (!["film", "printing", "cutting"].includes(section)) {
          return res.status(400).json({ message: "قسم غير صحيح" });
        }

        // Get users performance for the section
        const users = await storage.getUsersPerformanceBySection(
          section,
          dateFrom,
          dateTo,
        );

        res.json({ data: users });
      } catch (error: any) {
        console.error("Error fetching users performance:", error);
        res.status(500).json({ message: "خطأ في جلب أداء المستخدمين" });
      }
    },
  );

  // Get machines production by section
  app.get(
    "/api/production/machines-production/:section",
    requireAuth,
    async (req, res) => {
      try {
        const { section } = req.params;
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;

        // Validate section
        if (!["film", "printing", "cutting"].includes(section)) {
          return res.status(400).json({ message: "قسم غير صحيح" });
        }

        // Get machines production for the section
        const machines = await storage.getMachinesProductionBySection(
          section,
          dateFrom,
          dateTo,
        );

        res.json({ data: machines });
      } catch (error: any) {
        console.error("Error fetching machines production:", error);
        res.status(500).json({ message: "خطأ في جلب إنتاج المكائن" });
      }
    },
  );

  // Get machine detail across all stages
  app.get(
    "/api/production/machine-detail/:machineId",
    requireAuth,
    async (req, res) => {
      try {
        const machineId = parseInt(req.params.machineId);
        if (isNaN(machineId)) {
          return res.status(400).json({ message: "معرف الماكينة غير صحيح" });
        }
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;
        const detail = await storage.getMachineDetailAllStages(
          machineId,
          dateFrom,
          dateTo,
        );
        if (!detail) {
          return res.status(404).json({ message: "الماكينة غير موجودة" });
        }
        res.json({ data: detail });
      } catch (error: any) {
        console.error("Error fetching machine detail:", error);
        res.status(500).json({ message: "خطأ في جلب تفاصيل الماكينة" });
      }
    },
  );

  // Get rolls tracking by section
  app.get(
    "/api/production/rolls-tracking/:section",
    requireAuth,
    async (req, res) => {
      try {
        const { section } = req.params;
        const search = req.query.search as string;

        // Validate section
        if (!["film", "printing", "cutting"].includes(section)) {
          return res.status(400).json({ message: "قسم غير صحيح" });
        }

        // Get rolls for the section
        const rolls = await storage.getRollsBySection(section, search);

        res.json({ data: rolls });
      } catch (error: any) {
        console.error("Error fetching rolls:", error);
        res.status(500).json({ message: "خطأ في جلب الرولات" });
      }
    },
  );

  // Get production orders tracking by section
  app.get(
    "/api/production/orders-tracking/:section",
    requireAuth,
    async (req, res) => {
      try {
        const { section } = req.params;
        const search = req.query.search as string;

        // Validate section
        if (!["film", "printing", "cutting"].includes(section)) {
          return res.status(400).json({ message: "قسم غير صحيح" });
        }

        // Get production orders for the section
        const orders = await storage.getProductionOrdersBySection(
          section,
          search,
        );

        res.json({ data: orders });
      } catch (error: any) {
        console.error("Error fetching production orders:", error);
        res.status(500).json({ message: "خطأ في جلب أوامر الإنتاج" });
      }
    },
  );
}
