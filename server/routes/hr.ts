import type { Express } from "express";

import crypto from "crypto";

import { storage } from "../storage";
import { db } from "../db";

import { face_registrations } from "@shared/schema";
import { eq } from "drizzle-orm";

import { logger } from "../lib/logger";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { getAuthUserId } from "./shared";
import { registerHrTrainingRoutes } from "./hr-training";
import { registerHrAttendanceRoutes } from "./hr-attendance";
import { registerHrEmployeeRoutes } from "./hr-employees";
import { registerHrViolationRoutes } from "./hr-violations";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain, delegated to hr-* submodules). See server/routes/README.md.
export async function registerHrRoutes(app: Express, ctx: any) {

  await registerHrTrainingRoutes(app, ctx);
  await registerHrAttendanceRoutes(app, ctx);
  await registerHrEmployeeRoutes(app, ctx);
  await registerHrViolationRoutes(app, ctx);

  // ===============================
  // Face Verification API Endpoints
  // ===============================

  app.get(
    "/api/face-verification/status/:userId",
    requireAuth,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res
            .status(400)
            .json({ message: "معرف المستخدم غير صحيح", success: false });
        }
        const user = await storage.getUserById(userId);

        if (!user) {
          return res
            .status(404)
            .json({ message: "المستخدم غير موجود", success: false });
        }

        const [registration] = await db
          .select()
          .from(face_registrations)
          .where(eq(face_registrations.user_id, userId));

        res.json({
          hasRegisteredFace: !!registration,
          success: true,
        });
      } catch (error) {
        console.error("Error checking face status:", error);
        res
          .status(500)
          .json({ message: "خطأ في التحقق من حالة البصمة", success: false });
      }
    },
  );

  app.post(
    "/api/face-verification/register",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const { user_id, image } = req.body;

        if (!user_id || !image) {
          return res
            .status(400)
            .json({ message: "بيانات غير مكتملة", success: false });
        }

        const authUserId = getAuthUserId(req);
        const userPerms = req.user?.permissions || [];
        const isAdmin = userPerms.includes("admin");
        if (user_id !== authUserId && !isAdmin) {
          return res.status(403).json({
            message: "لا يمكنك تسجيل بصمة وجه لمستخدم آخر",
            success: false,
          });
        }

        const user = await storage.getUserById(user_id);
        if (!user) {
          return res
            .status(404)
            .json({ message: "المستخدم غير موجود", success: false });
        }

        const imageHash = crypto
          .createHash("sha256")
          .update(image)
          .digest("hex");

        const [existing] = await db
          .select()
          .from(face_registrations)
          .where(eq(face_registrations.user_id, user_id));

        if (existing) {
          await db
            .update(face_registrations)
            .set({ face_hash: imageHash, updated_at: new Date() })
            .where(eq(face_registrations.user_id, user_id));
        } else {
          await db.insert(face_registrations).values({
            user_id,
            face_hash: imageHash,
          });
        }

        logger.info(`Face registered for user ${user_id}`, {
          userId: user_id,
          action: "face_register",
          timestamp: new Date().toISOString(),
        });

        res.json({
          success: true,
          message: "تم تسجيل بصمة الوجه بنجاح",
          registered: true,
        });
      } catch (error) {
        console.error("Error registering face:", error);
        res
          .status(500)
          .json({ message: "خطأ في تسجيل بصمة الوجه", success: false });
      }
    },
  );

  app.post(
    "/api/face-verification/verify",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const { user_id, image, action_type, timestamp } = req.body;

        if (!user_id || !image) {
          return res.status(400).json({
            message: "بيانات غير مكتملة",
            success: false,
            verified: false,
          });
        }

        const authUserId = getAuthUserId(req);
        const userPerms = req.user?.permissions || [];
        const isAdmin = userPerms.includes("admin");
        if (user_id !== authUserId && !isAdmin) {
          return res.status(403).json({
            message: "لا يمكنك التحقق من بصمة وجه مستخدم آخر",
            success: false,
            verified: false,
          });
        }

        const user = await storage.getUserById(user_id);
        if (!user) {
          return res.status(404).json({
            message: "المستخدم غير موجود",
            success: false,
            verified: false,
          });
        }

        const [faceData] = await db
          .select()
          .from(face_registrations)
          .where(eq(face_registrations.user_id, user_id));
        if (!faceData) {
          return res.status(400).json({
            message: "لم يتم تسجيل بصمة الوجه مسبقاً",
            success: false,
            verified: false,
          });
        }

        const currentHash = crypto
          .createHash("sha256")
          .update(image)
          .digest("hex");
        const verified = crypto.timingSafeEqual(
          Buffer.from(faceData.face_hash),
          Buffer.from(currentHash),
        );

        logger.info(`Face verification attempt for user ${user_id}`, {
          userId: user_id,
          action: "face_verify",
          actionType: action_type,
          verified,
          timestamp,
        });

        if (verified) {
          res.json({
            success: true,
            verified: true,
            message: "تم التحقق من الهوية بنجاح",
          });
        } else {
          res.json({
            success: true,
            verified: false,
            message: "لم يتم التعرف على الوجه - يرجى المحاولة مرة أخرى",
          });
        }
      } catch (error) {
        console.error("Error verifying face:", error);
        res.status(500).json({
          message: "خطأ في التحقق من بصمة الوجه",
          success: false,
          verified: false,
        });
      }
    },
  );

  app.get(
    "/api/face-verification/logs/:userId",
    requireAuth,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res
            .status(400)
            .json({ message: "معرف المستخدم غير صحيح", success: false });
        }
        res.json({
          logs: [],
          success: true,
        });
      } catch (error) {
        console.error("Error fetching face logs:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب سجلات التحقق", success: false });
      }
    },
  );
}
