/**
 * 📊 Performance Monitoring & Optimization
 * Database query performance, caching, and bottleneck detection
 */

import { winstonLogger, logDatabasePerformance } from "./logger";

/**
 * Query performance tracker
 */
export class QueryPerformanceTracker {
  private slowQueryThreshold = 1000; // milliseconds
  private queries: Array<{
    sql: string;
    duration: number;
    timestamp: Date;
    slow: boolean;
  }> = [];
  private maxRecords = 1000;

  /**
   * Record a query execution
   */
  recordQuery(sql: string, duration: number) {
    const slow = duration > this.slowQueryThreshold;

    this.queries.push({
      sql: sql.substring(0, 200), // Store first 200 chars
      duration,
      timestamp: new Date(),
      slow,
    });

    // Remove old records if we exceed limit
    if (this.queries.length > this.maxRecords) {
      this.queries = this.queries.slice(-this.maxRecords);
    }

    // Log performance metric
    logDatabasePerformance(sql, duration);

    // Alert on slow queries
    if (slow) {
      winstonLogger.warn("Slow query detected", {
        sql: sql.substring(0, 100),
        duration,
      });
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
    if (this.queries.length === 0) {
      return { queryCount: 0, avgDuration: 0, slowQueries: 0 };
    }

    const total = this.queries.reduce((sum, q) => sum + q.duration, 0);
    const slowCount = this.queries.filter((q) => q.slow).length;

    return {
      queryCount: this.queries.length,
      avgDuration: Math.round(total / this.queries.length),
      slowQueries: slowCount,
      maxDuration: Math.max(...this.queries.map((q) => q.duration)),
      minDuration: Math.min(...this.queries.map((q) => q.duration)),
    };
  }

  /**
   * Get slow queries for analysis
   */
  getSlowQueries() {
    return this.queries.filter((q) => q.slow).sort((a, b) => b.duration - a.duration);
  }
}

/**
 * Smart response caching layer
 */
export class ResponseCache {
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached response
   */
  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache with TTL
   */
  set(key: string, data: any, ttl: number = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Clear cache
   */
  clear(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Database index analyzer and recommendations
 */
export class IndexAnalyzer {
  private missingIndexes: Array<{
    table: string;
    column: string;
    reason: string;
  }> = [];
  private indexUsageStats = new Map<string, number>();

  /**
   * Record index usage
   */
  recordIndexUsage(indexName: string) {
    const current = this.indexUsageStats.get(indexName) || 0;
    this.indexUsageStats.set(indexName, current + 1);
  }

  /**
   * Suggest missing indexes based on common query patterns
   */
  suggestMissingIndexes() {
    return [
      {
        table: "production_orders",
        column: "status",
        reason: "Frequent filtering by status",
      },
      {
        table: "rolls",
        column: "production_order_id, status",
        reason: "Composite query pattern detected",
      },
      {
        table: "inventory",
        column: "item_id, location_id",
        reason: "Frequent join pattern",
      },
      {
        table: "orders",
        column: "created_at",
        reason: "Frequent time-based filtering",
      },
    ];
  }

  /**
   * Get index usage report
   */
  getIndexUsageReport() {
    return Array.from(this.indexUsageStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }
}

/**
 * Memory and resource usage monitoring
 */
export function getResourceMetrics() {
  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024),
    rss: Math.round(usage.rss / 1024 / 1024),
    uptime: Math.round(process.uptime()),
  };
}

/**
 * Bundle size analyzer
 */
export class BundleAnalyzer {
  private moduleSizes = new Map<string, number>();

  /**
   * Record module size
   */
  recordModule(name: string, size: number) {
    this.moduleSizes.set(name, size);
  }

  /**
   * Get bundle composition report
   */
  getReport() {
    const totalSize = Array.from(this.moduleSizes.values()).reduce(
      (sum, size) => sum + size,
      0,
    );

    const modules = Array.from(this.moduleSizes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, size]) => ({
        name,
        size: Math.round(size / 1024),
        percentage: Math.round((size / totalSize) * 100),
      }));

    return {
      totalSize: Math.round(totalSize / 1024),
      moduleCount: this.moduleSizes.size,
      topModules: modules,
    };
  }

  /**
   * Identify optimization opportunities
   */
  findOptimizationOpportunities() {
    const largeModules = Array.from(this.moduleSizes.entries())
      .filter(([_, size]) => size > 100000) // > 100KB
      .map(([name]) => name);

    return {
      largeModules,
      candidates: largeModules.map((name) => ({
        module: name,
        suggestion: "Consider code splitting or lazy loading",
      })),
    };
  }
}

// ==================== Global Performance Instances ====================
export const queryTracker = new QueryPerformanceTracker();
export const responseCache = new ResponseCache();
export const indexAnalyzer = new IndexAnalyzer();
export const bundleAnalyzer = new BundleAnalyzer();
