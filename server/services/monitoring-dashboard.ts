/**
 * 🎛️ Monitoring Dashboard & Metrics Endpoint
 * Comprehensive view of system health, performance, and analytics
 */

import type { Express, Request, Response } from "express";
import { queryTracker, responseCache, indexAnalyzer, bundleAnalyzer, getResourceMetrics } from "./performance-monitor";
import { winstonLogger } from "./logger";
import { checkSentryHealth } from "./sentry-monitoring";

/**
 * Register monitoring dashboard routes
 */
export function registerMonitoringRoutes(app: Express) {
  /**
   * GET /api/admin/monitoring/dashboard
   * Comprehensive monitoring dashboard data
   */
  app.get("/api/admin/monitoring/dashboard", async (req: Request, res: Response) => {
    try {
      const [queryStats, resources, indexReport, cacheStats, sentryHealth] =
        await Promise.all([
          Promise.resolve(queryTracker.getStats()),
          Promise.resolve(getResourceMetrics()),
          Promise.resolve(indexAnalyzer.getIndexUsageReport()),
          Promise.resolve(responseCache.stats()),
          checkSentryHealth(),
        ]);

      res.json({
        timestamp: new Date().toISOString(),
        database: {
          queryStats,
          slowQueries: queryTracker.getSlowQueries().length,
          topIndexes: indexReport,
          missingIndexes: indexAnalyzer.suggestMissingIndexes(),
        },
        performance: {
          memory: resources,
          cache: {
            size: cacheStats.size,
            entries: cacheStats.keys.length,
          },
          bundle: bundleAnalyzer.getReport(),
        },
        monitoring: {
          sentry: sentryHealth,
          logging: {
            level: process.env.LOG_LEVEL || "info",
            storage: "file",
          },
        },
      });
    } catch (error) {
      winstonLogger.error("Dashboard error", { error: String(error) });
      res.status(500).json({ error: "Dashboard error" });
    }
  });

  /**
   * GET /api/admin/monitoring/queries
   * Detailed query performance analysis
   */
  app.get("/api/admin/monitoring/queries", (req: Request, res: Response) => {
    const stats = queryTracker.getStats();
    const slowQueries = queryTracker.getSlowQueries();

    res.json({
      summary: stats,
      slowQueries: slowQueries.slice(0, 20), // Top 20 slow queries
      recommendations: [
        ...indexAnalyzer.suggestMissingIndexes().slice(0, 5),
      ].map((item: any) => ({
        ...item,
        priority:
          stats.slowQueries > 10 ? "high" : "medium",
      })),
    });
  });

  /**
   * GET /api/admin/monitoring/cache
   * Cache performance and usage
   */
  app.get("/api/admin/monitoring/cache", (req: Request, res: Response) => {
    const stats = responseCache.stats();

    res.json({
      size: stats.size,
      usage: `${Math.round((stats.size / 1000) * 100)}%`,
      entries: stats.keys,
      recommendations: [
        stats.size > 800
          ? "Consider increasing cache limit or adjusting TTL"
          : null,
      ].filter(Boolean),
    });
  });

  /**
   * POST /api/admin/monitoring/cache/clear
   * Clear cache for specific pattern or all
   */
  app.post("/api/admin/monitoring/cache/clear", (req: Request, res: Response) => {
    const { pattern } = req.body;
    responseCache.clear(pattern);

    res.json({
      message: pattern ? `Cache cleared for pattern: ${pattern}` : "All cache cleared",
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/admin/monitoring/health
   * Quick health check
   */
  app.get("/api/admin/monitoring/health", async (req: Request, res: Response) => {
    const resources = getResourceMetrics();
    const queries = queryTracker.getStats();

    const health = {
      status:
        resources.heapUsed > resources.heapTotal * 0.9 ||
        queries.avgDuration > 500
          ? "degraded"
          : "healthy",
      timestamp: new Date().toISOString(),
      checks: {
        memory: {
          used: `${resources.heapUsed}MB`,
          total: `${resources.heapTotal}MB`,
          percentage: Math.round((resources.heapUsed / resources.heapTotal) * 100),
          status:
            resources.heapUsed > resources.heapTotal * 0.9
              ? "warning"
              : "ok",
        },
        database: {
          avgQueryTime: `${queries.avgDuration}ms`,
          slowQueries: queries.slowQueries,
          status: queries.avgDuration > 500 ? "warning" : "ok",
        },
        cache: {
          size: responseCache.stats().size,
          status: "ok",
        },
      },
    };

    res.json(health);
  });

  /**
   * GET /api/admin/monitoring/logs
   * Recent logs (limited for performance)
   */
  app.get("/api/admin/monitoring/logs", (req: Request, res: Response) => {
    res.json({
      message: "Logs can be viewed in logs/ directory or via log aggregation service",
      locations: [
        "logs/error.log - Error logs",
        "logs/combined.log - All logs",
      ],
      recommendation: "Set up ELK stack or similar for production log management",
    });
  });
}

/**
 * Health check helper for deployment monitoring
 */
export async function performHealthCheck() {
  const resources = getResourceMetrics();
  const queries = queryTracker.getStats();

  return {
    isHealthy:
      resources.heapUsed < resources.heapTotal * 0.9 &&
      queries.avgDuration < 500,
    memory: {
      used: resources.heapUsed,
      total: resources.heapTotal,
      percentage: Math.round((resources.heapUsed / resources.heapTotal) * 100),
    },
    database: {
      avgQueryTime: queries.avgDuration,
      queryCount: queries.queryCount,
    },
    timestamp: new Date().toISOString(),
  };
}
