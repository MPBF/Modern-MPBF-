/**
 * 🔍 Structured Logging Setup
 * Winston + Pino for comprehensive logging across the application
 */

import winston from "winston";
import pino from "pino";

// ==================== Winston Logger ====================
// Primary logger for application events and errors
export const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: {
    service: "mpbf-erp",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr =
            Object.keys(meta).length > 0
              ? ` ${JSON.stringify(meta, null, 2)}`
              : "";
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        }),
      ),
    }),
    // File transports for persistence
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// ==================== Pino Logger ====================
// High-performance logger for HTTP request/response logging
export const pinoLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// ==================== Request Logger Middleware ====================
/**
 * Logs HTTP requests with performance metrics
 */
export function loggerMiddleware(req: any, res: any, next: any) {
  const start = Date.now();

  // Log request
  winstonLogger.info("Incoming request", {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Log response when it finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? "warn" : "info";

    winstonLogger.log(level, "Request completed", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    });

    // Alert on slow requests
    if (duration > 5000) {
      winstonLogger.warn("Slow request detected", {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
      });
    }
  });

  next();
}

// ==================== Error Logger ====================
/**
 * Logs errors with full context
 */
export function logError(error: any, context: Record<string, any> = {}) {
  winstonLogger.error("Application error", {
    message: error.message,
    stack: error.stack,
    code: error.code,
    ...context,
  });
}

// ==================== Performance Logger ====================
/**
 * Logs performance metrics for database operations
 */
export function logDatabasePerformance(
  query: string,
  duration: number,
  rowsAffected?: number,
) {
  const level = duration > 1000 ? "warn" : "debug";
  winstonLogger.log(level, "Database operation", {
    query: query.substring(0, 100), // First 100 chars
    duration: `${duration}ms`,
    rowsAffected,
    slow: duration > 1000,
  });
}

// ==================== Audit Logger ====================
/**
 * Logs sensitive operations for compliance and security
 */
export function logAudit(
  action: string,
  userId: number,
  details: Record<string, any>,
) {
  winstonLogger.info("Audit log", {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
}
