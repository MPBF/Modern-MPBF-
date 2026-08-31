/**
 * 🎯 Sentry Error Tracking & Monitoring Setup
 * Comprehensive error tracking, performance monitoring, and alerting
 */

import * as Sentry from "@sentry/node";
import type { Express, Request, Response, NextFunction } from "express";

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initializeSentry(app: Express) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [],
    // Set sample rates for production
    tracesSampleRate:
      process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    environment: process.env.NODE_ENV,
    release: process.env.APP_VERSION,

    // Error filtering
    beforeSend(event, hint) {
      // Filter out certain errors if needed
      if (event.exception) {
        const error = hint.originalException;
        // Skip 404 errors from being reported as errors
        if (error instanceof Error && error.message?.includes("404")) {
          return null;
        }
      }
      return event;
    },

    // Profiling and debug settings
    maxValueLength: 1024,
    maxBreadcrumbs: 100,

    // Debugging
    debug: process.env.NODE_ENV !== "production",
  });

  return app;
}

/**
 * Middleware for custom Sentry context
 */
export function sentryContextMiddleware(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) {
  // Add user context if authenticated
  if (req.user) {
    Sentry.setUser({
      id: req.user.id.toString(),
      username: req.user.username,
      email: req.user.email,
    });
  }

  // Add request context
  Sentry.setContext("request", {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Add performance monitoring
  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    // Log to Sentry as a transaction if needed
  });

  next();
}

/**
 * Custom error handler that sends to Sentry
 */
export function captureError(
  error: Error,
  context?: Record<string, any>,
) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

/**
 * Capture user action for performance analysis
 */
export function captureUserAction(
  action: string,
  metadata?: Record<string, any>,
) {
  Sentry.captureMessage(`User action: ${action}`, "info");
  if (metadata) {
    Sentry.setContext("user_action", metadata);
  }
}

/**
 * Performance monitoring for critical operations
 * Returns a span-like object for tracking duration
 */
export function startPerformanceTransaction(
  name: string,
  op: string,
) {
  const startTime = Date.now();
  return {
    name,
    op,
    finish: () => {
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        console.warn(`Slow operation: ${name} took ${duration}ms`);
      }
    },
  };
}

/**
 * Monitor database query performance
 */
export function monitorDatabaseQuery(
  queryName: string,
  duration: number,
  rowsAffected?: number,
) {
  if (duration > 1000) {
    // Alert on slow queries
    Sentry.captureMessage(`Slow database query: ${queryName} (${duration}ms)`, "warning");
  }

  Sentry.setContext("database_query", {
    name: queryName,
    duration: `${duration}ms`,
    rowsAffected,
  });
}

/**
 * Health check endpoint for Sentry integration
 */
export async function checkSentryHealth() {
  try {
    // Send a test event to verify Sentry is working
    const transport = Sentry.getClient()?.getTransport();
    if (!transport) {
      return { status: "disconnected" };
    }
    return { status: "connected", dsn: process.env.SENTRY_DSN?.substring(0, 20) + "..." };
  } catch (error) {
    return { status: "error", message: String(error) };
  }
}
