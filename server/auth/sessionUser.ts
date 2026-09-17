import { Request } from "express";

import { logger } from "../lib/logger";
import { storage } from "../storage";

import type { SafeUser } from "@shared/schema";

/**
 * Resolves the current user from the local username/password session.
 * Returns a normalized SafeUser object for consistency across the application
 *
 * Priority order:
 * 1. Check req.session.userId (username/password auth)
 *
 * @param req - Express request object
 * @returns SafeUser object or null if no authenticated session found
 */
export async function resolveSessionUser(
  req: Request,
): Promise<SafeUser | null> {
  try {
    // First, check for traditional username/password session
    if (req.session?.userId && typeof req.session.userId === "number") {
      const user = await storage.getUserById(req.session.userId);
      if (user && user.status === "active") {
        logger.debug("User resolved from session.userId", req.session.userId);
        const { password, ...safeUser } = user;
        return safeUser;
      } else {
        logger.debug("Session userId found but user not active or not found");
      }
    }

    logger.debug("No authenticated session found");
    return null;
  } catch (error) {
    logger.error("Error resolving session user", error);
    return null;
  }
}

/**
 * Middleware to require authentication from either auth type
 * Alternative to the existing requireAuth middleware that works with both systems
 */
export async function requireUnifiedAuth(req: Request, res: any, next: any) {
  const user = await resolveSessionUser(req);

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }

  // Attach user to request for downstream handlers
  (req as any).currentUser = user;
  next();
}
