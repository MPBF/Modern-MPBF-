import type { Express } from "express";


import { storage } from "../storage";
import { db } from "../db";

import {
  attendance,
  attendance_withdrawals,
  violations,
  roles,
} from "@shared/schema";
import { hasPermission } from "@shared/permissions";
import { requiresFactoryGeofence } from "@shared/attendance-policy";
import { z } from "zod";
import { and, asc, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { parseIntSafe } from "@shared/validation-utils";
import {
  factoryNowParts,
  getAttendanceDateForShift,
  getActivePreviousNightShift,
  getShiftWindow,
  getSnapshotShiftType,
  isCheckInAllowedForShift,
  isShiftType,
  resolveShiftAcrossMonthBoundary,
  resolveAssignmentSnapshot,
} from "@shared/shifts";

import { requireAuth, requirePermission } from "../middleware/auth";
import { getNotificationManager } from "../services/notification-manager";
import {
  isCheckoutAllowedForSnapshot,
  getAttendanceCutoffInstant,
  isOpenSessionRelevant,
} from "../storage/attendance-session";
import {
  closeExpiredAttendanceSessionsInTransaction,
} from "../services/attendance-cutoff";
import { notificationService, notificationManagerHolder, getAuthUserId, parseRouteParam } from "./shared";

let attendanceCutoffTimer: ReturnType<typeof setInterval> | null = null;

async function getAssignedShiftForInstant(
  userId: number,
  now: Date,
): Promise<import("@shared/shifts").ShiftType | null> {
  const today = factoryNowParts(now);
  const currentAssignment = await storage.getShiftAssignmentForUserMonth(
    userId,
    today.year,
    today.month,
  );
  const dayStart = getShiftWindow("day", today.dateStr).start;
  let previousShift: unknown = currentAssignment?.shift;
  let shiftStartCrossesMonth = false;
  if (now.getTime() < dayStart.getTime()) {
    const previous = factoryNowParts(
      new Date(now.getTime() - 24 * 60 * 60 * 1000),
    );
    shiftStartCrossesMonth =
      previous.year !== today.year || previous.month !== today.month;
    if (shiftStartCrossesMonth) {
      previousShift = (
        await storage.getShiftAssignmentForUserMonth(
          userId,
          previous.year,
          previous.month,
        )
      )?.shift;
    }
  }
  return resolveShiftAcrossMonthBoundary(
    currentAssignment?.shift,
    previousShift,
    now.getTime() < dayStart.getTime(),
    shiftStartCrossesMonth,
  );
}

async function getResolvedAssignmentForInstant(userId: number, now: Date) {
  const today = factoryNowParts(now);
  const yesterday = factoryNowParts(new Date(now.getTime() - 86400000));
  const [current, previous] = await Promise.all([
    storage.getShiftAssignmentForUserMonth(userId, today.year, today.month),
    storage.getShiftAssignmentForUserMonth(userId, yesterday.year, yesterday.month),
  ]);
  return resolveAssignmentSnapshot(current as any, previous as any, now);
}

// Extracted from server/routes/hr.ts (registration order preserved; called
// from registerHrRoutes). See server/routes/README.md.
export async function registerHrAttendanceRoutes(app: Express, ctx: any) {
  if (!attendanceCutoffTimer) {
    attendanceCutoffTimer = setInterval(() => {
      void storage.closeExpiredAttendanceSessions().catch((error) => {
        console.error("Failed to close expired attendance sessions:", error);
      });
    }, 60_000);
    void storage.closeExpiredAttendanceSessions().catch((error) => {
      console.error("Initial attendance cutoff sweep failed:", error);
    });
  }

  // ============ HR Attendance Management API ============

  /**
   * @swagger
   * /api/attendance:
   *   get:
   *     tags:
   *       - HR
   *     summary: Get attendance records
   *     description: Retrieve all attendance records with pagination support
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *     responses:
   *       200:
   *         description: List of attendance records
   *       401:
   *         description: Unauthorized
   *     security:
   *       - sessionAuth: []
   */
  app.get("/api/attendance", requireAuth, async (req, res) => {
    try {
      const limit = Math.max(
        1,
        Math.min(parseInt(String(req.query.limit ?? "")) || 50, 500),
      );
      const offset = Math.max(0, parseInt(String(req.query.offset ?? "")) || 0);
      const authUserId = getAuthUserId(req);
      const permissions = (req as any).user?.permissions || [];
      const canViewOthers = hasPermission(permissions, [
        "view_attendance",
        "view_attendance_reports",
        "manage_attendance",
        "view_hr",
        "manage_hr",
      ]);
      if (!canViewOthers && authUserId == null) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      const attendance = await storage.getAttendance({
        limit,
        offset,
        userId: canViewOthers ? undefined : authUserId!,
      });
      res.set("X-Pagination-Limit", String(limit));
      res.set("X-Pagination-Offset", String(offset));
      res.set("X-Pagination-Count", String(attendance.length));
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات الحضور" });
    }
  });

  /**
   * @swagger
   * /api/attendance/daily-status/{userId}:
   *   get:
   *     tags:
   *       - HR
   *     summary: Get daily attendance status
   *     description: Get the attendance status for a specific user on a given date
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *         description: Date in YYYY-MM-DD format (defaults to today)
   *     responses:
   *       200:
   *         description: Daily attendance status
   *       400:
   *         description: Invalid user ID
   *       401:
   *         description: Unauthorized
   *     security:
   *       - sessionAuth: []
   */
  // Get daily attendance status for a user
  app.get(
    "/api/attendance/daily-status/:userId",
    requireAuth,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }
        const authUserId = getAuthUserId(req);
        const permissions = (req as any).user?.permissions || [];
        const canViewOthers = hasPermission(permissions, [
          "view_attendance",
          "view_attendance_reports",
          "manage_attendance",
          "view_hr",
          "manage_hr",
        ]);
        if (authUserId !== userId && !canViewOthers) {
          return res.status(403).json({ message: "غير مصرح بعرض حضور مستخدم آخر" });
        }
        const now = new Date();
        await storage.closeExpiredAttendanceSessions(userId);
        const factoryToday = factoryNowParts(now);
        const requestedDate = (req.query.date as string) || factoryToday.dateStr;
        const resolvedAssignment = await getResolvedAssignmentForInstant(userId, now);
        const candidateOpenSession =
          requestedDate === factoryToday.dateStr
            ? await storage.findOpenCheckIn(userId)
            : null;
        const openSession = candidateOpenSession &&
          (String(candidateOpenSession.date).slice(0, 10) ===
            resolvedAssignment?.attendanceDate ||
            !resolvedAssignment)
          ? candidateOpenSession : null;
        const openSnapshot = openSession?.shift_snapshot as any;
        const date = openSession
          ? String(openSession.date).slice(0, 10)
          : requestedDate === factoryToday.dateStr && resolvedAssignment
            ? resolvedAssignment.attendanceDate
            : requestedDate;
        const baseNightWindow =
          resolvedAssignment &&
          resolvedAssignment.snapshot.end_time < resolvedAssignment.snapshot.start_time
            ? resolvedAssignment.window
            : undefined;
        const currentNightWindow = baseNightWindow
          ? {
              ...baseNightWindow,
              checkoutEnd: new Date(
                baseNightWindow.end.getTime() + 12 * 60 * 60 * 1000,
              ),
            }
          : undefined;

        const status = await storage.getDailyAttendanceStatus(
          userId,
          date,
          openSession ? undefined : currentNightWindow,
        );
        const displayedSnapshot = openSnapshot ?? resolvedAssignment?.snapshot;
        res.json({
          ...status,
          shift_assigned: !!resolvedAssignment,
          assigned_shift: displayedSnapshot
            ? {
                assignment_id:
                  openSession?.shift_assignment_id ??
                  resolvedAssignment?.assignmentId ??
                  null,
                template_id:
                  openSession?.shift_template_id ??
                  displayedSnapshot.template_id ??
                  null,
                ...displayedSnapshot,
                attendance_date: date,
              }
            : null,
        });
      } catch (error) {
        console.error("Error fetching daily attendance status:", error);
        res.status(500).json({ message: "خطأ في جلب حالة الحضور اليومية" });
      }
    },
  );

  /**
   * @swagger
   * /api/attendance:
   *   post:
   *     tags:
   *       - HR
   *     summary: Record attendance check-in/check-out
   *     description: Record user attendance with location verification
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               user_id:
   *                 type: integer
   *               latitude:
   *                 type: number
   *               longitude:
   *                 type: number
   *               accuracy:
   *                 type: number
   *     responses:
   *       200:
   *         description: Attendance recorded successfully
   *       400:
   *         description: Invalid location or parameters
   *       401:
   *         description: Unauthorized
   *     security:
   *       - sessionAuth: []
   */
  // تسجيل الحضور مع تحقق الموقع الجغرافي المحسّن
  app.post(
    [
      "/api/attendance",
      "/api/attendance/check-in",
      "/api/attendance/check-out",
    ],
    requireAuth,
    async (req, res) => {
      try {
        const isDevMode = process.env.NODE_ENV === "development";

        // =============== ربط الهوية: منع تسجيل حضور باسم مستخدم آخر ===============
        // التسجيل الذاتي مربوط بالمستخدم المسجّل دخوله. يُسمح فقط لمن يملك
        // صلاحية إدارة الحضور بتسجيل الحضور نيابة عن موظف آخر.
        const authUserId = getAuthUserId(req);
        const canManageAttendance = hasPermission(
          (req as any).user?.permissions || [],
          "manage_attendance",
        );
        if (!canManageAttendance) {
          if (authUserId == null) {
            return res
              .status(401)
              .json({ message: "غير مصرح: يلزم تسجيل الدخول" });
          }
          req.body.user_id = authUserId;
        } else if (req.body.user_id == null) {
          req.body.user_id = authUserId;
        }

        // =============== إعدادات الحماية ===============
        const MAX_ACCURACY_METERS = 500; // الحد الأقصى للدقة المسموحة بالأمتار (مرن للمباني الداخلية)
        const MIN_ACCURACY_METERS = 3; // الحد الأدنى للدقة (أقل من ذلك يعني تزوير محتمل)

        // =============== جمع معلومات الجهاز للتدقيق ===============
        const deviceInfo = {
          ip: req.ip || req.connection?.remoteAddress || "unknown",
          userAgent: req.headers["user-agent"] || "unknown",
          timestamp: new Date().toISOString(),
          timezone:
            req.headers["timezone"] ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        // =============== التحقق من وجود بيانات الموقع ===============
        if (!req.body.location || typeof req.body.location !== "object") {
          return res.status(400).json({
            message: "يجب توفير الموقع الجغرافي لتسجيل الحضور",
            code: "LOCATION_REQUIRED",
          });
        }

        const lat = Number(req.body.location.lat);
        const lng = Number(req.body.location.lng);
        const accuracy =
          req.body.location.accuracy == null
            ? undefined
            : Number(req.body.location.accuracy);
        const isMocked = req.body.location.isMocked;

        if (
          !Number.isFinite(lat) ||
          lat < -90 ||
          lat > 90 ||
          !Number.isFinite(lng) ||
          lng < -180 ||
          lng > 180
        ) {
          return res.status(400).json({
            message: "إحداثيات الموقع غير صالحة",
            code: "INVALID_COORDINATES",
          });
        }

        // =============== التحقق من دقة الموقع ===============
        // نتعامل مع accuracy كرقم صالح أو نتجاهل التحقق إذا لم تتوفر
        const hasValidAccuracy =
          accuracy !== undefined && Number.isFinite(accuracy);

        if (hasValidAccuracy) {
          // دقة عالية جداً (أقل من 5 متر) قد تشير لتزوير
          if (accuracy < MIN_ACCURACY_METERS) {
            // نسجل التحذير لكن لا نرفض (قد يكون GPS حقيقي ممتاز)
          }

          // دقة منخفضة جداً
          if (accuracy > MAX_ACCURACY_METERS) {
            return res.status(400).json({
              message: `دقة الموقع منخفضة جداً (${Math.round(accuracy)} متر). يرجى الانتظار حتى تتحسن دقة GPS أو الخروج لمكان مفتوح.`,
              code: "LOW_ACCURACY",
              accuracy: Math.round(accuracy),
              maxAllowed: MAX_ACCURACY_METERS,
            });
          }
        } else {
          // تحذير في السجل إذا لم تتوفر معلومات الدقة
        }

        // =============== كشف تزوير الموقع (Mock Location) ===============
        if (isMocked === true) {
          // تسجيل محاولة التلاعب
          try {
            await storage.createViolation({
              user_id: req.body.user_id,
              type: "location_spoofing",
              description: `محاولة تسجيل حضور بموقع مزور`,
              details: JSON.stringify({
                location: { lat, lng },
                accuracy,
                deviceInfo,
                timestamp: new Date().toISOString(),
              }),
              severity: "high",
            });
          } catch (violationError) {
            console.error("خطأ في تسجيل المخالفة:", violationError);
          }

          return res.status(403).json({
            message:
              "تم اكتشاف محاولة تزوير الموقع! هذه المحاولة تم تسجيلها وسيتم إبلاغ الإدارة.",
            code: "MOCK_LOCATION_DETECTED",
          });
        }

        // =============== التحقق من دور المستخدم (مندوب مبيعات) ===============
        const SALES_REP_ROLE_ID = 7; // دور مندوب المبيعات
        const user = await storage.getUserById(req.body.user_id);
        const isSalesRep = user?.role_id === SALES_REP_ROLE_ID;

        if (isSalesRep) {
        }

        // =============== جلب مواقع المصانع النشطة ===============
        const activeLocations = await storage.getActiveFactoryLocations();

        // مندوب المبيعات لا يحتاج لمواقع مصانع نشطة
        if (activeLocations.length === 0 && !isSalesRep &&
            requiresFactoryGeofence(String(req.body.status || ""))) {
          return res.status(400).json({
            message: "لا توجد مواقع مصانع نشطة. يرجى التواصل مع الإدارة.",
            code: "NO_ACTIVE_LOCATIONS",
          });
        }

        // =============== دالة حساب المسافة (Haversine) ===============
        const calculateDistance = (
          lat1: number,
          lon1: number,
          lat2: number,
          lon2: number,
        ): number => {
          const R = 6371e3; // نصف قطر الأرض بالأمتار
          const φ1 = (lat1 * Math.PI) / 180;
          const φ2 = (lat2 * Math.PI) / 180;
          const Δφ = ((lat2 - lat1) * Math.PI) / 180;
          const Δλ = ((lon2 - lon1) * Math.PI) / 180;

          const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

          return R * c;
        };

        // =============== التحقق من الموقع ===============
        let isWithinRange = false;
        let closestDistance = Infinity;
        let closestLocation: any = null;
        let matchedLocation: any = null;

        if (isDevMode) {
        }

        const validLocations = activeLocations
          .map((factoryLocation) => ({
            original: factoryLocation,
            latitude: Number(factoryLocation.latitude),
            longitude: Number(factoryLocation.longitude),
            allowedRadius: Number(factoryLocation.allowed_radius),
          }))
          .filter(
            (factoryLocation) =>
              Number.isFinite(factoryLocation.latitude) &&
              factoryLocation.latitude >= -90 &&
              factoryLocation.latitude <= 90 &&
              Number.isFinite(factoryLocation.longitude) &&
              factoryLocation.longitude >= -180 &&
              factoryLocation.longitude <= 180 &&
              Number.isFinite(factoryLocation.allowedRadius) &&
              factoryLocation.allowedRadius > 0,
          );

        if (activeLocations.length > 0 && validLocations.length === 0 &&
            requiresFactoryGeofence(String(req.body.status || ""))) {
          return res.status(400).json({
            message:
              "بيانات مواقع المصنع غير صالحة. يرجى التواصل مع الإدارة.",
            code: "INVALID_FACTORY_LOCATIONS",
          });
        }

        for (const factoryLocation of validLocations) {
          const distance = calculateDistance(
            lat,
            lng,
            factoryLocation.latitude,
            factoryLocation.longitude,
          );

          if (isDevMode) {
          }

          if (distance < closestDistance) {
            closestDistance = distance;
            closestLocation = factoryLocation.original;
          }

          if (distance <= factoryLocation.allowedRadius) {
            isWithinRange = true;
            matchedLocation = factoryLocation.original;
            break;
          }
        }

        // A valid location is still recorded for checkout, but requiring the
        // employee to remain inside the factory prevents them closing a shift.
        if (!isWithinRange && requiresFactoryGeofence(String(req.body.status || ""))) {
          const errorMsg = `أنت خارج نطاق المصنع. المسافة: ${Math.round(closestDistance)} متر. النطاق المسموح: ${closestLocation?.allowed_radius} متر.`;

          return res.status(403).json({
            message: errorMsg,
            code: "OUT_OF_RANGE",
            distance: Math.round(closestDistance),
            allowedRadius: closestLocation?.allowed_radius,
            locationName: closestLocation?.name_ar,
            ...(isDevMode && {
              debug: {
                userLocation: { lat, lng, accuracy },
                closestLocation: {
                  name: closestLocation?.name_ar,
                  lat: closestLocation?.latitude,
                  lng: closestLocation?.longitude,
                },
              },
            }),
          });
        }

        // =============== إعداد بيانات الحضور مع معلومات التدقيق ===============
        // Derive the per-action timestamp from the status so the dashboard
        // can show real check-in / break / check-out times instead of
        // relying on `created_at` for everything.
        const nowTs = new Date();
        const status = String(req.body.status || "");
        const action = String(req.body.action || "");
        const allowedStatuses = new Set([
          "حاضر",
          "في الاستراحة",
          "يعمل",
          "مغادر",
          ...(canManageAttendance ? ["غائب", "إجازة"] : []),
        ]);
        if (!allowedStatuses.has(status)) {
          return res.status(400).json({
            message: "حالة الحضور غير صحيحة",
            code: "INVALID_ATTENDANCE_STATUS",
          });
        }
        if (action && !new Set(["end_lunch"]).has(action)) {
          return res.status(400).json({
            message: "إجراء الحضور غير صحيح",
            code: "INVALID_ATTENDANCE_ACTION",
          });
        }
        if (status === "يعمل" && action !== "end_lunch") {
          return res.status(400).json({
            message: "يجب تحديد إنهاء الاستراحة",
            code: "INVALID_ATTENDANCE_ACTION",
          });
        }
        if (status !== "يعمل" && action === "end_lunch") {
          return res.status(400).json({
            message: "إنهاء الاستراحة يتطلب حالة يعمل",
            code: "INVALID_ATTENDANCE_ACTION",
          });
        }
        // Self-service attendance is a strict state machine. Admin edits use
        // the dedicated management routes and retain their existing behavior.
        const factoryToday = factoryNowParts(nowTs);
        const resolvedAssignment = await getResolvedAssignmentForInstant(
          req.body.user_id,
          nowTs,
        );
        const assignedShift = resolvedAssignment
          ? getSnapshotShiftType(resolvedAssignment.snapshot)
          : null;
        const attendanceDate = assignedShift
          ? resolvedAssignment!.attendanceDate
          : factoryToday.dateStr;
        const assignedWindow = assignedShift
          ? resolvedAssignment!.window
          : null;
        const candidateOpenSession = await storage.findOpenCheckIn(req.body.user_id);
        const openSession = candidateOpenSession &&
          (status !== "حاضر" ||
            String(candidateOpenSession.date).slice(0, 10) === attendanceDate)
          ? candidateOpenSession : null;
        if (
          status === "مغادر" &&
          openSession?.shift_snapshot &&
          !isCheckoutAllowedForSnapshot(openSession, nowTs)
        ) {
          return res.status(400).json({
            message: "يمكن تسجيل الانصراف فقط ضمن فترة السماح حول نهاية الوردية",
            code: "OUTSIDE_ASSIGNED_CHECKOUT_WINDOW",
          });
        }
        if (!canManageAttendance) {
          const current = openSession
            ? await storage.getDailyAttendanceStatus(
                req.body.user_id,
                String(openSession.date).slice(0, 10),
              )
            : null;
          if (status === "حاضر" && openSession) {
            return res.status(409).json({
              message: "تم تسجيل الحضور مسبقاً",
              code: "ATTENDANCE_ALREADY_CHECKED_IN",
            });
          }
          if (status !== "حاضر" && !openSession) {
            return res.status(409).json({
              message: "لا توجد جلسة حضور مفتوحة",
              code: "ATTENDANCE_SESSION_NOT_OPEN",
            });
          }
          if (status === "في الاستراحة" &&
              (current?.currentStatus !== "حاضر" &&
                current?.currentStatus !== "يعمل")) {
            return res.status(409).json({
              message: "لا يمكن بدء الاستراحة في الحالة الحالية",
              code: "INVALID_ATTENDANCE_TRANSITION",
            });
          }
          if (status === "يعمل" && current?.currentStatus !== "في الاستراحة") {
            return res.status(409).json({
              message: "لا توجد استراحة مفتوحة",
              code: "INVALID_ATTENDANCE_TRANSITION",
            });
          }
          if (status === "مغادر" &&
              (current?.hasCheckedOut || current?.currentStatus === "مغادر")) {
            return res.status(409).json({
              message: "تم تسجيل الانصراف مسبقاً",
              code: "ATTENDANCE_ALREADY_CHECKED_OUT",
            });
          }
        }
        if (status === "حاضر" && !resolvedAssignment) {
          return res.status(400).json({
            message: "لا توجد وردية مجدولة لك لهذا الشهر. يرجى مراجعة مسؤول الموارد البشرية.",
            code: "NO_SHIFT_ASSIGNED",
          });
        }
        if (
          status === "حاضر" &&
          assignedWindow &&
          !isCheckInAllowedForShift(
            assignedWindow,
            resolvedAssignment!.snapshot,
            nowTs,
          )
        ) {
          const snapshot = resolvedAssignment!.snapshot;
          const isFlexible = getSnapshotShiftType(snapshot) === "flexible";
          const graceMs = Math.max(0, Number(snapshot.grace_minutes) || 0) * 60_000;
          const factoryTime = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Riyadh",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          });
          const checkInStart = factoryTime.format(
            new Date(assignedWindow.start.getTime() - graceMs),
          );
          const checkInEnd = factoryTime.format(
            new Date(assignedWindow.start.getTime() + graceMs),
          );
          return res.status(400).json({
            message: isFlexible
              ? "لا يمكن تسجيل الحضور خارج نافذة الوردية الحرة"
              : `يمكن تسجيل حضور وردية ${snapshot.name_ar} فقط من ${checkInStart} إلى ${checkInEnd} (فترة السماح حول بداية الوردية ${snapshot.start_time})`,
            code: "OUTSIDE_ASSIGNED_SHIFT",
          });
        }
        const stampOverrides: Record<string, Date | undefined> = {
          check_in_time: undefined,
          check_out_time: undefined,
          lunch_start_time: undefined,
          lunch_end_time: undefined,
        };
        if (status === "حاضر") stampOverrides.check_in_time = nowTs;
        if (status === "في الاستراحة") stampOverrides.lunch_start_time = nowTs;
        if (status === "يعمل") stampOverrides.lunch_end_time = nowTs;
        if (status === "مغادر") stampOverrides.check_out_time = nowTs;
        // Actions after check-in belong to the already-open session, not to
        // today's potentially changed roster. This also covers a night shift
        // crossing a month/year boundary.
        const openSnapshot = openSession?.shift_snapshot as any;

        const attendanceData = {
          user_id: req.body.user_id,
          status,
          notes: typeof req.body.notes === "string" ? req.body.notes : undefined,
          ...stampOverrides,
          // Attendance action dates are server-authoritative and use the
          // factory's Riyadh calendar, not the browser/UTC calendar.
          date: openSession?.date ?? attendanceDate,
          ...(assignedShift && {
            shift_type:
              assignedShift === "night"
                ? "ليلي"
                : assignedShift === "flexible"
                  ? "حر"
                  : "صباحي",
          }),
          ...(status === "حاضر" && resolvedAssignment && {
            shift_assignment_id: resolvedAssignment.assignmentId ?? null,
            shift_template_id: resolvedAssignment.snapshot.template_id ?? null,
            shift_snapshot: resolvedAssignment.snapshot,
          }),
          ...(openSession && {
            shift_assignment_id: openSession.shift_assignment_id ?? null,
            shift_template_id: openSession.shift_template_id ?? null,
            shift_snapshot: openSnapshot ?? null,
          }),
          location_accuracy: accuracy,
          location_lat: lat,
          location_lng: lng,
          factory_location_id: matchedLocation?.id,
          device_info: JSON.stringify(deviceInfo),
          distance_from_factory: Number.isFinite(closestDistance)
            ? Math.round(closestDistance) : null,
        };

        // =============== دعم الوردية الليلية ===============
        // عند تسجيل الخروج: إذا لم يكن هناك دخول مفتوح لتاريخ اليوم،
        // نبحث عن آخر دخول مفتوح خلال الـ 24 ساعة الماضية.
        // إذا وُجد في يوم سابق، نستخدم تاريخه لربط الخروج بنفس وردية الدخول.
        if (status === "مغادر") {
          const openCheckInWindow = assignedShift
            ? {
                dateStr: attendanceDate,
                ...assignedWindow!,
              }
            : null;
          const openRecord = await storage.findOpenCheckIn(
            req.body.user_id,
            openCheckInWindow || undefined,
          );
          const previousNightWindow = getActivePreviousNightShift(nowTs);
          const openCheckInMs = openRecord?.check_in_time
            ? new Date(openRecord.check_in_time).getTime()
            : Number.NaN;
          const isActivePreviousNightShift =
            previousNightWindow != null &&
            openRecord != null &&
            String(openRecord.date).slice(0, 10) ===
              previousNightWindow.dateStr &&
            Number.isFinite(openCheckInMs) &&
            openCheckInMs >= previousNightWindow.start.getTime() &&
            openCheckInMs < previousNightWindow.end.getTime();
          if (
            openRecord &&
            ((openCheckInWindow &&
              String(openRecord.date).slice(0, 10) ===
                openCheckInWindow.dateStr) ||
              isActivePreviousNightShift) &&
            String(openRecord.date).slice(0, 10) !== attendanceData.date
          ) {
            attendanceData.date = openRecord.date;
          }
        }

        const createdAttendance = await db.transaction(async (tx) => {
          const userId = Number(req.body.user_id);
          await tx.execute(sql`SELECT pg_advisory_xact_lock(4107, ${userId})`);
          await closeExpiredAttendanceSessionsInTransaction(
            tx,
            userId,
            new Date(),
          );

          const rows = await tx
            .select()
            .from(attendance)
            .where(
              and(
                eq(attendance.user_id, userId),
                eq(attendance.date, attendanceData.date),
              ),
            )
            .orderBy(asc(attendance.created_at), asc(attendance.id));
          const currentRows = rows as any[];
          const lastCheckInIndex = currentRows.findLastIndex(
            (row) => row.check_in_time != null,
          );
          const activeRows = lastCheckInIndex >= 0
            ? currentRows.slice(lastCheckInIndex)
            : [];
          const checkedIn = lastCheckInIndex >= 0;
          const checkedOut = activeRows.some(
            (row) => row.check_out_time != null,
          );
          const latest = currentRows.at(-1)?.status;
          const conflict = (message: string, code: string) =>
            Object.assign(new Error(message), {
              code: "ATTENDANCE_TRANSITION_CONFLICT",
              attendanceCode: code,
            });

          if (status === "مغادر") {
            if (!checkedIn || checkedOut) {
              throw conflict(
                "لا توجد جلسة حضور مفتوحة للانصراف",
                "ATTENDANCE_SESSION_NOT_OPEN",
              );
            }
            const [recentAutoClose] = await tx
              .select()
              .from(attendance)
              .where(and(
                eq(attendance.user_id, userId),
                eq(attendance.notes, "auto_withdrawn_at_cutoff"),
                gte(
                  attendance.check_out_time,
                  new Date(nowTs.getTime() - 36 * 60 * 60 * 1000),
                ),
              ))
              .orderBy(desc(attendance.check_out_time));
            if (recentAutoClose?.check_out_time) {
              const [laterCheckIn] = await tx
                .select({ id: attendance.id })
                .from(attendance)
                .where(and(
                  eq(attendance.user_id, userId),
                  gte(attendance.check_in_time, recentAutoClose.check_out_time),
                ))
                .limit(1);
              if (!laterCheckIn) {
                throw conflict(
                  "أُغلقت الجلسة تلقائياً عند وقت فصل اليوم ولا يمكن تسجيل انصراف يدوي بعدها",
                  "ATTENDANCE_CLOSED_AT_CUTOFF",
                );
              }
            }
            const latestCheckIn = [...currentRows]
              .reverse()
              .find((row) => row.check_in_time);
            const wasAutoClosed = latestCheckIn
              ? currentRows.some(
                  (row) =>
                    row.notes === "auto_withdrawn_at_cutoff" &&
                    row.check_out_time &&
                    new Date(row.check_out_time).getTime() >=
                      new Date(latestCheckIn.check_in_time).getTime(),
                )
              : false;
            if (wasAutoClosed) {
              throw conflict(
                "أُغلقت الجلسة تلقائياً عند وقت فصل اليوم ولا يمكن تسجيل انصراف يدوي بعدها",
                "ATTENDANCE_CLOSED_AT_CUTOFF",
              );
            }
            if (latestCheckIn?.shift_snapshot && !checkedOut &&
                !isCheckoutAllowedForSnapshot(
                  {
                    date: latestCheckIn.date,
                    shift_snapshot: latestCheckIn.shift_snapshot,
                  },
                  nowTs,
                )) {
              throw conflict(
                "يمكن تسجيل الانصراف فقط ضمن فترة السماح حول نهاية الوردية",
                "OUTSIDE_ASSIGNED_CHECKOUT_WINDOW",
              );
            }
          }

          if (!canManageAttendance) {
            if (status === "حاضر" && checkedIn) {
              throw conflict(
                "تم تسجيل الحضور مسبقاً",
                "ATTENDANCE_ALREADY_CHECKED_IN",
              );
            }
            if (status !== "حاضر" && (!checkedIn || checkedOut)) {
              throw conflict(
                "لا توجد جلسة حضور مفتوحة",
                "ATTENDANCE_SESSION_NOT_OPEN",
              );
            }
            if (
              status === "في الاستراحة" &&
              latest !== "حاضر" &&
              latest !== "يعمل"
            ) {
              throw conflict(
                "لا يمكن بدء الاستراحة في الحالة الحالية",
                "INVALID_ATTENDANCE_TRANSITION",
              );
            }
            if (status === "يعمل" && latest !== "في الاستراحة") {
              throw conflict(
                "لا توجد استراحة مفتوحة",
                "INVALID_ATTENDANCE_TRANSITION",
              );
            }
          }

          const [created] = await tx
            .insert(attendance)
            .values(attendanceData as any)
            .returning();
          if (status === "مغادر") {
            // Checkout closes an active offsite interval too. Otherwise the
            // stopped watchdog leaves a withdrawal open indefinitely.
            const [openWithdrawal] = await tx
              .select()
              .from(attendance_withdrawals)
              .where(and(
                eq(attendance_withdrawals.user_id, userId),
                eq(attendance_withdrawals.date, attendanceData.date),
                isNull(attendance_withdrawals.ended_at),
              ))
              .limit(1);
            if (openWithdrawal) {
              const duration = Math.min(1440, Math.max(0,
                Math.round((nowTs.getTime() -
                  new Date(openWithdrawal.started_at).getTime()) / 60_000)));
              const [closed] = await tx
                .update(attendance_withdrawals)
                .set({ ended_at: nowTs, duration_minutes: duration })
                .where(and(
                  eq(attendance_withdrawals.id, openWithdrawal.id),
                  isNull(attendance_withdrawals.ended_at),
                ))
                .returning();
              if (closed && duration > 0) {
                await tx.update(attendance)
                  .set({ total_withdrawn_minutes: sql`COALESCE(${attendance.total_withdrawn_minutes}, 0) + ${duration}` })
                  .where(eq(attendance.id, openWithdrawal.attendance_id));
              }
            }
          }
          return created;
        });

        // Send attendance notification asynchronously (fire-and-forget)
        const attendanceId = createdAttendance.id;
        const attendanceUserId = req.body.user_id;
        const attendanceStatus = req.body.status;
        (async () => {
          try {
            const notifUser = await storage.getUserById(attendanceUserId);
            if (notifUser && notifUser.phone) {
              const displayName =
                notifUser.display_name_ar || notifUser.username || "";
              const timeStr = new Date().toLocaleTimeString("en-US");
              let statusPhrase = "";
              let priority = "normal";

              switch (attendanceStatus) {
                case "حاضر":
                  statusPhrase =
                    "تم تسجيل حضورك اليوم بنجاح. نتمنى لك يوم عمل مثمر!";
                  priority = "normal";
                  break;
                case "في الاستراحة":
                  statusPhrase =
                    "تم تسجيل بدء استراحة الغداء. استمتع بوقت راحتك!";
                  priority = "low";
                  break;
                case "يعمل":
                  statusPhrase =
                    "تم تسجيل انتهاء استراحة الغداء. مرحباً بعودتك للعمل!";
                  priority = "normal";
                  break;
                case "مغادر":
                  statusPhrase =
                    "تم تسجيل انصرافك. شكراً لجهودك اليوم، نراك غداً!";
                  priority = "normal";
                  break;
              }

              if (statusPhrase) {
                const fullMessage = `مرحباً ${displayName}، ${statusPhrase} (${timeStr})`;
                await notificationService.sendWhatsAppMessage(
                  notifUser.phone,
                  fullMessage,
                  {
                    title: "تنبيه الحضور",
                    priority,
                    context_type: "attendance",
                    context_id: attendanceId?.toString(),
                    useTemplate: true,
                    templateName: "attendance_update",
                    templateVariables: [displayName, statusPhrase, timeStr],
                  },
                );
              }
            }
          } catch (notificationError) {
            console.error(
              "Failed to send attendance notification:",
              notificationError,
            );
          }
        })();

        res.status(201).json(createdAttendance);
      } catch (error) {
        console.error("Error creating attendance:", error);

        if (
          error instanceof Error &&
          (error as any).code === "ATTENDANCE_TRANSITION_CONFLICT"
        ) {
          return res.status(409).json({
            message: error.message,
            code: (error as any).attendanceCode,
          });
        }

        // Return the specific error message for validation errors
        if (error instanceof Error && error.message.includes("تم تسجيل")) {
          return res.status(400).json({ message: error.message });
        }

        if (error instanceof Error && error.message.includes("يجب")) {
          return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "خطأ في إنشاء سجل الحضور" });
      }
    },
  );

  app.put(
    "/api/attendance/:id",
    requireAuth,
    requirePermission("manage_attendance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const current = await storage.getAttendanceById(id);
        if (!current) {
          return res.status(404).json({ message: "سجل الحضور غير موجود" });
        }
        const result = await db.transaction(async (tx) => {
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(4107, ${current.user_id})`,
          );
          const [lockedCurrent] = await tx
            .select()
            .from(attendance)
            .where(eq(attendance.id, id));
          if (!lockedCurrent) return { kind: "not_found" as const };
          if (lockedCurrent.user_id !== current.user_id) {
            return { kind: "conflict" as const };
          }

          // Use the same transaction and advisory lock as the cutoff sweep.
          // If the deadline has passed, persist its auto-close before deciding
          // whether this edit is allowed.
          await closeExpiredAttendanceSessionsInTransaction(
            tx,
            lockedCurrent.user_id,
            new Date(),
          );
          const records = await tx
            .select()
            .from(attendance)
            .where(and(
              eq(attendance.user_id, lockedCurrent.user_id),
              eq(attendance.date, lockedCurrent.date),
            ))
            .orderBy(asc(attendance.created_at), asc(attendance.id));
          const sessionCheckIn = [...records]
            .reverse()
            .find((record) => record.check_in_time);
          const changesCheckout = Object.prototype.hasOwnProperty.call(
            req.body,
            "check_out_time",
          );

          if (changesCheckout && sessionCheckIn?.check_in_time) {
            const checkInTime = new Date(sessionCheckIn.check_in_time).getTime();
            const autoClose = records.some((record) =>
              record.notes === "auto_withdrawn_at_cutoff" &&
              record.check_out_time &&
              new Date(record.check_out_time).getTime() >= checkInTime,
            );
            if (autoClose) {
              return { kind: "closed" as const };
            }

            const session = {
              date: sessionCheckIn.date,
              shift_snapshot: sessionCheckIn.shift_snapshot,
            };
            const cutoff = getAttendanceCutoffInstant(session);
            const now = new Date();
            const proposedCheckOut = req.body.check_out_time == null
              ? null
              : new Date(req.body.check_out_time);
            if (
              (cutoff && now.getTime() >= cutoff.getTime()) ||
              (proposedCheckOut &&
                (!Number.isFinite(proposedCheckOut.getTime()) ||
                  (cutoff &&
                    proposedCheckOut.getTime() >= cutoff.getTime()) ||
                  !isCheckoutAllowedForSnapshot(session, proposedCheckOut)))
            ) {
              return { kind: "outside_window" as const };
            }
          }

          const updates = { ...req.body, updated_at: new Date() };
          // Keep the system marker authoritative while still allowing HR to
          // edit unrelated fields on an auto-closed action row.
          if (
            lockedCurrent.notes === "auto_withdrawn_at_cutoff" &&
            Object.prototype.hasOwnProperty.call(updates, "status")
          ) {
            delete updates.status;
          }
          const [updated] = await tx
            .update(attendance)
            .set(updates)
            .where(eq(attendance.id, id))
            .returning();
          return updated
            ? { kind: "updated" as const, attendance: updated }
            : { kind: "not_found" as const };
        });

        if (result.kind === "not_found") {
          return res.status(404).json({ message: "سجل الحضور غير موجود" });
        }
        if (result.kind === "closed") {
          return res.status(409).json({
            message: "أُغلقت الجلسة تلقائياً عند وقت فصل اليوم ولا يمكن تعديل وقت الانصراف",
            code: "ATTENDANCE_CLOSED_AT_CUTOFF",
          });
        }
        if (result.kind === "outside_window") {
          return res.status(400).json({
            message: "وقت الانصراف يجب أن يكون ضمن فترة السماح وقبل وقت فصل اليوم",
            code: "OUTSIDE_ASSIGNED_CHECKOUT_WINDOW",
          });
        }
        if (result.kind === "conflict") {
          return res.status(409).json({
            message: "تغيّر مالك سجل الحضور أثناء التعديل، أعد المحاولة",
            code: "ATTENDANCE_RECORD_CHANGED",
          });
        }
        res.json(result.attendance);
      } catch (error) {
        console.error("Error updating attendance:", error);
        res.status(500).json({ message: "خطأ في تحديث سجل الحضور" });
      }
    },
  );

  app.delete(
    "/api/attendance/:id",
    requireAuth,
    requirePermission("manage_attendance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteAttendance(id);
        res.json({ message: "تم حذف سجل الحضور بنجاح" });
      } catch (error) {
        console.error("Error deleting attendance:", error);
        res.status(500).json({ message: "خطأ في حذف سجل الحضور" });
      }
    },
  );

  // Calculate and update work hours for an attendance record
  app.put(
    "/api/attendance/:id/calculate-hours",
    requireAuth,
    requirePermission("manage_attendance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const attendance = await storage.getAttendanceById(id);

        if (!attendance) {
          return res.status(404).json({ message: "سجل الحضور غير موجود" });
        }

        let workHours = 0;
        let overtimeHours = 0;
        const standardWorkHours = 8; // ساعات العمل الرسمية

        if (attendance.check_in_time && attendance.check_out_time) {
          const checkIn = new Date(attendance.check_in_time);
          const checkOut = new Date(attendance.check_out_time);
          let totalMinutes =
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);

          // Subtract lunch break if exists
          if (attendance.lunch_start_time && attendance.lunch_end_time) {
            const lunchStart = new Date(attendance.lunch_start_time);
            const lunchEnd = new Date(attendance.lunch_end_time);
            totalMinutes -=
              (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60);
          }

          // Subtract other break if exists
          if (attendance.break_start_time && attendance.break_end_time) {
            const breakStart = new Date(attendance.break_start_time);
            const breakEnd = new Date(attendance.break_end_time);
            totalMinutes -=
              (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
          }

          // Subtract any anti-fraud page-abandonment withdrawals
          const withdrawnMinutes = (attendance as any).total_withdrawn_minutes
            ? Number((attendance as any).total_withdrawn_minutes)
            : 0;
          if (withdrawnMinutes > 0) {
            totalMinutes -= withdrawnMinutes;
          }

          workHours = Math.max(0, totalMinutes / 60);

          // Calculate overtime
          if (workHours > standardWorkHours) {
            overtimeHours = workHours - standardWorkHours;
            workHours = standardWorkHours;
          }
        }

        const updated = await storage.updateAttendance(id, {
          work_hours: parseFloat(workHours.toFixed(2)),
          overtime_hours: parseFloat(overtimeHours.toFixed(2)),
        });

        res.json(updated);
      } catch (error) {
        console.error("Error calculating work hours:", error);
        res.status(500).json({ message: "خطأ في حساب ساعات العمل" });
      }
    },
  );

  // Get daily attendance statistics
  app.get(
    "/api/attendance/daily-stats",
    requireAuth,
    requirePermission("view_attendance"),
    async (req, res) => {
      try {
        const date =
          (req.query.date as string) || new Date().toISOString().split("T")[0];
        const stats = await storage.getDailyAttendanceStats(date);
        res.json({ data: stats, date });
      } catch (error) {
        console.error("Error fetching daily attendance stats:", error);
        res.status(500).json({ message: "خطأ في جلب إحصائيات الحضور اليومية" });
      }
    },
  );

  // Anti-fraud: open/close a page-abandonment withdrawal interval.
  //
  // Body: { action: 'start' | 'end', reason?: string }
  //   - 'start': opens a withdrawal row (ended_at=NULL), saves current
  //              attendance.status as previous_status, then switches the
  //              attendance row to "منسحب".
  //   - 'end':   finalizes the open withdrawal, computes duration on the
  //              server from started_at..now, adds it to the daily total,
  //              and restores attendance.status to previous_status (unless
  //              the user has since checked out or gone on break).
  // Timestamps are always server-authoritative — clients cannot forge them.
  app.post(
    "/api/attendance/:id/withdraw",
    requireAuth,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const att = await storage.getAttendanceById(id);
        if (!att) {
          return res.status(404).json({ message: "سجل الحضور غير موجود" });
        }
        const reqUserId = (req.user as any)?.id;
        if (!reqUserId || reqUserId !== att.user_id) {
          return res.status(403).json({ message: "غير مصرح" });
        }

        const parsed = z
          .object({
            action: z.enum(["start", "end"]),
            reason: z.string().max(50).optional().nullable(),
            lat: z.number().min(-90).max(90).optional(),
            lng: z.number().min(-180).max(180).optional(),
            accuracy: z.number().min(0).optional(),
          })
          .safeParse(req.body);
        if (!parsed.success) {
          return res
            .status(400)
            .json({
              message: "بيانات الانسحاب غير صحيحة",
              errors: parsed.error.issues,
            });
        }

        const now = new Date();
        const today = factoryNowParts(now).dateStr;
        const openSession = await storage.findOpenCheckIn(att.user_id);
        const sessionDate = openSession?.date
          ? String(openSession.date).slice(0, 10)
          : String(att.date).slice(0, 10);
        if (sessionDate !== today) {
          if (!openSession || !isOpenSessionRelevant(openSession, now) ||
              String(openSession.date).slice(0, 10) !== sessionDate) {
            return res
              .status(400)
              .json({ message: "لا يمكن تسجيل انسحاب على سجل قديم" });
          }
        }

        // Resolve the user's CURRENT daily state from the canonical
        // "latest attendance row" instead of trusting the `:id` row.
        // The action-per-row data model means newer rows reflect newer
        // state (lunch/check-out/etc.); the :id is only used for the
        // ownership check above.
        const dailyStatus = await storage.getDailyAttendanceStatus(
          att.user_id,
          sessionDate,
        );
        const currentStatus: string = dailyStatus?.currentStatus ?? "غائب";
        const hasCheckedIn: boolean = !!dailyStatus?.hasCheckedIn;
        const hasCheckedOut: boolean = !!dailyStatus?.hasCheckedOut;

        if (parsed.data.action === "start") {
          // Idempotent: if an open withdrawal already exists for this
          // user today, return it. We look up by user (not by attendance
          // id) because the row attached to the open withdrawal may
          // differ from the param `:id` after status transitions.
          const existing = await storage.getOpenAttendanceWithdrawalForUser(
            att.user_id,
            sessionDate,
          );
          if (existing) {
            return res.json({
              withdrawal: existing,
              status: "منسحب",
              alreadyOpen: true,
            });
          }
          // Hard rule: a withdrawal period can only be opened while the
          // user is actively working. Breaks, check-out, and absence are
          // not eligible for time deduction. We validate against the
          // user's CURRENT state, not the (possibly stale) :id row.
          if (!hasCheckedIn || hasCheckedOut) {
            return res.status(409).json({
              message: "لا يوجد جلسة عمل نشطة",
              currentStatus,
            });
          }
          if (currentStatus !== "حاضر" && currentStatus !== "يعمل") {
            return res.status(409).json({
              message: "لا يمكن فتح فترة انسحاب في الحالة الحالية",
              currentStatus,
            });
          }
          // Geofence enforcement: the only legitimate trigger for an
          // automatic withdrawal is the device physically leaving the
          // factory's allowed radius. Tab hide / network drop / window
          // blur must NOT flip status. We require client-supplied
          // coordinates and re-validate them server-side so a stale or
          // spoofed "I'm outside" claim still has to clear the same
          // Haversine check the check-in flow uses.
          const { lat, lng, accuracy } = parsed.data;
          if (
            typeof lat !== "number" ||
            typeof lng !== "number" ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
          ) {
            return res.status(400).json({
              message: "إحداثيات الموقع مطلوبة لتسجيل الانسحاب",
              code: "LOCATION_REQUIRED",
            });
          }
          const activeFactoryLocations =
            await storage.getActiveFactoryLocations();
          if (!activeFactoryLocations || activeFactoryLocations.length === 0) {
            return res.status(409).json({
              message: "لا توجد مواقع مصانع نشطة للتحقق من النطاق",
              code: "NO_ACTIVE_LOCATIONS",
            });
          }
          const haversine = (
            lat1: number,
            lon1: number,
            lat2: number,
            lon2: number,
          ): number => {
            const R = 6371e3;
            const toRad = (d: number) => (d * Math.PI) / 180;
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
            return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          };
          let stillInside = false;
          let nearestDistance = Infinity;
          for (const loc of activeFactoryLocations) {
            const d = haversine(
              lat,
              lng,
              parseFloat(loc.latitude as any),
              parseFloat(loc.longitude as any),
            );
            if (d < nearestDistance) nearestDistance = d;
            const slack = accuracy && accuracy < 200 ? accuracy : 0;
            if (d <= (loc.allowed_radius || 500) + slack) {
              stillInside = true;
              break;
            }
          }
          if (stillInside) {
            return res.status(409).json({
              message: "لا يزال المستخدم داخل نطاق المصنع",
              code: "STILL_INSIDE_GEOFENCE",
              distance: Math.round(nearestDistance),
            });
          }
          // Serialize attendance transitions and withdrawal creation for this
          // user. This prevents two tabs/devices from opening overlapping
          // withdrawal intervals against different action rows.
          const startResult = await db.transaction(async (tx) => {
            await tx.execute(sql`
              SELECT pg_advisory_xact_lock(4107, ${att.user_id})
            `);

            const [existingLocked] = await tx
              .select()
              .from(attendance_withdrawals)
              .where(
                and(
                  eq(attendance_withdrawals.user_id, att.user_id),
                  eq(attendance_withdrawals.date, sessionDate),
                  isNull(attendance_withdrawals.ended_at),
                ),
              )
              .limit(1);
            if (existingLocked) {
              return { kind: "existing" as const, withdrawal: existingLocked };
            }

            const lockedRows = await tx
              .select({ status: attendance.status })
              .from(attendance)
              .where(
                and(
                  eq(attendance.user_id, att.user_id),
                  eq(attendance.date, sessionDate),
                ),
              )
              .orderBy(asc(attendance.created_at), asc(attendance.id));
            const statuses = lockedRows.map((row) => row.status);
            const latestStatus = statuses.at(-1) ?? "غائب";
            if (
              !statuses.includes("حاضر") ||
              statuses.includes("مغادر") ||
              (latestStatus !== "حاضر" && latestStatus !== "يعمل")
            ) {
              return {
                kind: "conflict" as const,
                currentStatus: latestStatus,
              };
            }

            const [withdrawnRow] = await tx
              .insert(attendance)
              .values({
                user_id: att.user_id,
                date: sessionDate,
                status: "منسحب",
                notes: parsed.data.reason || "page_abandonment",
              } as any)
              .returning();
            const [created] = await tx
              .insert(attendance_withdrawals)
              .values({
                attendance_id: withdrawnRow.id,
                user_id: att.user_id,
                date: sessionDate as any,
                started_at: now,
                ended_at: null,
                duration_minutes: 0,
                reason: parsed.data.reason || "page_abandonment",
                previous_status: latestStatus,
              })
              .returning();
            return {
              kind: "created" as const,
              withdrawal: created,
              attendanceId: withdrawnRow.id,
            };
          });

          if (startResult.kind === "existing") {
            return res.json({
              withdrawal: startResult.withdrawal,
              status: "منسحب",
              alreadyOpen: true,
            });
          }
          if (startResult.kind === "conflict") {
            return res.status(409).json({
              message: "لا يمكن فتح فترة انسحاب في الحالة الحالية",
              currentStatus: startResult.currentStatus,
            });
          }
          return res.json({
            withdrawal: startResult.withdrawal,
            status: "منسحب",
            attendanceId: startResult.attendanceId,
          });
        }

        // action === 'end'
        const open = await storage.getOpenAttendanceWithdrawalForUser(
          att.user_id,
          sessionDate,
        );
        if (!open) {
          // No open period — nothing to finalize.
          return res.json({ withdrawal: null, totalMinutes: 0 });
        }
        const restoreStatus = async () => {
          // Only restore if the user is still flagged as withdrawn. If
          // they manually went on break or checked out while the
          // watchdog was firing, respect that choice.
          if (!open.previous_status) return null;
          const after = await storage.getDailyAttendanceStatus(
            att.user_id,
            sessionDate,
          );
          if (after?.currentStatus !== "منسحب") return null;
          await storage.createAttendance({
            user_id: att.user_id,
            date: sessionDate,
            status: open.previous_status,
            notes: "auto_restore_after_withdrawal",
          } as any);
          return open.previous_status;
        };

        const startedMs = new Date(open.started_at as any).getTime();
        const rawDuration = Math.round((now.getTime() - startedMs) / 60_000);
        // Server-enforced threshold: brief flicker (< 1 min) shouldn't
        // count against the user.
        const MIN_DEDUCTIBLE_MINUTES = 1;
        if (rawDuration < MIN_DEDUCTIBLE_MINUTES) {
          const finalized = await storage.finalizeAttendanceWithdrawal(
            open.id,
            now,
            0,
          );
          const restoredStatus = await restoreStatus();
          const totals = await storage.getAttendanceWithdrawalsForDay(
            att.user_id,
            sessionDate,
          );
          return res.json({
            withdrawal: finalized,
            durationMinutes: 0,
            totalMinutes: totals.totalMinutes,
            restoredStatus,
            belowThreshold: true,
          });
        }
        const durationMinutes = Math.min(24 * 60, rawDuration);
        const finalized = await storage.finalizeAttendanceWithdrawal(
          open.id,
          now,
          durationMinutes,
        );
        if (!finalized) {
          // Concurrent end already won — restore status if needed and
          // return current totals so the client converges.
          const restoredStatus = await restoreStatus();
          const { totalMinutes } =
            await storage.getAttendanceWithdrawalsForDay(att.user_id, sessionDate);
          return res.json({
            withdrawal: null,
            durationMinutes: 0,
            totalMinutes,
            restoredStatus,
            alreadyClosed: true,
          });
        }
        await restoreStatus();

        const { totalMinutes } = await storage.getAttendanceWithdrawalsForDay(
          att.user_id,
          sessionDate,
        );
        let violationCreated = false;
        let createdViolationId: number | null = null;
        if (totalMinutes > 60) {
          try {
            const inserted = await db
              .insert(violations)
              .values({
                employee_id: att.user_id,
                violation_type: "page_abandonment",
                description: `انسحاب متكرر من صفحة الحضور (${totalMinutes} دقيقة)`,
                date: today as any,
                reported_by: null,
              })
              .onConflictDoNothing({
                target: [
                  violations.employee_id,
                  violations.violation_type,
                  violations.date,
                ],
              })
              .returning({ id: violations.id });
            violationCreated = inserted.length > 0;
            createdViolationId = inserted[0]?.id ?? null;
          } catch (vErr) {
            console.error("Failed to create page_abandonment violation", vErr);
          }
        }

        if (violationCreated && createdViolationId != null) {
          const violationId = createdViolationId;
          const offenderId = att.user_id;
          const minutesTotal = totalMinutes;
          // Fire-and-forget: alert managers without blocking the response.
          (async () => {
            try {
              const offender = await storage.getSafeUser(offenderId);
              const employeeName =
                offender?.display_name_ar ||
                offender?.display_name ||
                offender?.full_name ||
                offender?.username ||
                `موظف #${offenderId}`;

              const allRoles = await db.select().from(roles);
              const eligibleRoleIds = allRoles
                .filter((r) => {
                  const perms = Array.isArray(r.permissions)
                    ? r.permissions
                    : [];
                  return perms.some(
                    (p) => p === "manage_hr" || p === "view_attendance",
                  );
                })
                .map((r) => r.id);

              if (eligibleRoleIds.length === 0) return;

              const lists = await Promise.all(
                eligibleRoleIds.map((id) => storage.getSafeUsersByRole(id)),
              );
              const recipients = new Map<number, (typeof lists)[number][number]>();
              for (const list of lists) {
                for (const u of list) {
                  if (u.id === offenderId) continue;
                  if (u.status && u.status !== "active") continue;
                  recipients.set(u.id, u);
                }
              }
              if (recipients.size === 0) return;

              const titleAr = "تجاوز حد الانسحاب اليومي";
              const titleEn = "Page-abandonment threshold exceeded";
              const messageAr = `${employeeName} تجاوز حد الانسحاب اليومي بإجمالي ${minutesTotal} دقيقة اليوم`;
              const messageEn = `${employeeName} exceeded the daily page-abandonment limit with ${minutesTotal} minutes withdrawn today`;

              const nm =
                notificationManagerHolder.value || getNotificationManager(storage);

              for (const recipient of Array.from(recipients.values())) {
                try {
                  await nm.sendToUser(recipient.id, {
                    title: titleEn,
                    title_ar: titleAr,
                    message: messageEn,
                    message_ar: messageAr,
                    type: "hr",
                    priority: "high",
                    context_type: "violation",
                    context_id: String(violationId),
                  });
                } catch (e) {
                  console.error(
                    `Failed to send in-app page_abandonment alert to user ${recipient.id}`,
                    e,
                  );
                }
                // External-channel selection is centralized in
                // notificationService.deliverExternalAlert: it
                // resolves the recipient's available channels
                // (WhatsApp / SMS), tries WhatsApp first and
                // falls back to SMS if WhatsApp is unavailable
                // or fails. Each recipient is pinged on at most
                // one external channel.
                if (recipient.phone) {
                  notificationService
                    .deliverExternalAlert(recipient.phone, messageAr, {
                      title: titleAr,
                      priority: "high",
                      context_type: "violation",
                      context_id: String(violationId),
                    })
                    .catch((e) =>
                      console.error(
                        `Failed to send external page_abandonment alert to user ${recipient.id}`,
                        e,
                      ),
                    );
                }
              }
            } catch (notifyErr) {
              console.error(
                "Failed to dispatch page_abandonment manager alerts",
                notifyErr,
              );
            }
          })();
        }

        res.json({
          withdrawal: finalized,
          durationMinutes,
          totalMinutes,
          violationCreated,
          restoredStatus: open.previous_status ?? null,
        });
      } catch (error) {
        console.error("Error recording withdrawal:", error);
        res.status(500).json({ message: "خطأ في تسجيل الانسحاب" });
      }
    },
  );

  // Manager view: list page-abandonment withdrawals across employees in a date range
  app.get(
    "/api/attendance/withdrawals",
    requireAuth,
    requirePermission("view_attendance"),
    async (req, res) => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const dateRe = /^\d{4}-\d{2}-\d{2}$/;
        const rawStart = (req.query.startDate as string) || today;
        const rawEnd = (req.query.endDate as string) || today;
        if (!dateRe.test(rawStart) || !dateRe.test(rawEnd)) {
          return res
            .status(400)
            .json({ message: "صيغة التاريخ غير صحيحة (YYYY-MM-DD)" });
        }
        let startDate = rawStart;
        let endDate = rawEnd;
        if (startDate > endDate) {
          [startDate, endDate] = [endDate, startDate];
        }
        let userId: number | undefined;
        if (req.query.userId) {
          try {
            userId = parseIntSafe(req.query.userId as string, "userId", {
              min: 1,
            });
          } catch {
            return res
              .status(400)
              .json({ message: "معرف المستخدم غير صحيح" });
          }
        }

        const result = await storage.getAttendanceWithdrawalsInRange(
          startDate,
          endDate,
          userId,
        );
        res.json({ ...result, startDate, endDate });
      } catch (error) {
        console.error("Error fetching withdrawals range:", error);
        res.status(500).json({ message: "خطأ في جلب فترات الانسحاب" });
      }
    },
  );

  // Get today's withdrawal summary for a user
  app.get(
    "/api/attendance/withdrawals/today/:userId",
    requireAuth,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }
        const reqUserId = (req.user as any)?.id;
        if (reqUserId !== userId) {
          // Allow only self-access (others must use reports)
          return res.status(403).json({ message: "غير مصرح" });
        }
        const date =
          (req.query.date as string) || new Date().toISOString().split("T")[0];
        const result = await storage.getAttendanceWithdrawalsForDay(
          userId,
          date,
        );
        res.json({ ...result, date });
      } catch (error) {
        console.error("Error fetching withdrawals:", error);
        res.status(500).json({ message: "خطأ في جلب فترات الانسحاب" });
      }
    },
  );

  // Record break time
  app.post(
    "/api/attendance/:id/break",
    requireAuth,
    requirePermission("manage_attendance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const { action } = req.body; // 'start' or 'end'

        const attendance = await storage.getAttendanceById(id);
        if (!attendance) {
          return res.status(404).json({ message: "سجل الحضور غير موجود" });
        }

        const now = new Date();
        const updateData: any = {};

        if (action === "start") {
          updateData.break_start_time = now;
          updateData.status = "استراحة";
        } else if (action === "end") {
          updateData.break_end_time = now;
          updateData.status = "حاضر";
        }

        const updated = await storage.updateAttendance(id, updateData);
        res.json(updated);
      } catch (error) {
        console.error("Error recording break:", error);
        res.status(500).json({ message: "خطأ في تسجيل الاستراحة" });
      }
    },
  );

}
