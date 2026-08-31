# 📚 API Documentation, Monitoring & Performance Optimization - Setup Guide

## 🎯 Overview

This guide covers the complete setup of three features implemented:

1. **API Documentation** (Swagger/OpenAPI + JSDoc)
2. **Monitoring & Observability** (Sentry + Winston Logging)
3. **Performance Optimization** (Database, Bundle, Caching)

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express
npm install @sentry/node @sentry/tracing
npm install winston pino pino-pretty
```

### Step 2: Configure Environment Variables

Create or update `.env`:

```env
# Swagger/OpenAPI
SWAGGER_ENABLED=true
API_URL=http://localhost:5000

# Sentry (Error Tracking)
SENTRY_DSN=https://your-sentry-key@sentry.io/project-id
SENTRY_ENABLED=true
SENTRY_ENVIRONMENT=development

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# Performance
CACHE_ENABLED=true
QUERY_TIMEOUT=30000
SLOW_QUERY_THRESHOLD=1000
```

### Step 3: Integrate into Server

Update `server/index.ts`:

```typescript
import { swaggerSpec } from "./swagger-config";
import swaggerUi from "swagger-ui-express";
import { initializeSentry, sentryContextMiddleware } from "./services/sentry-monitoring";
import { loggerMiddleware, winstonLogger } from "./services/logger";
import { registerMonitoringRoutes } from "./services/monitoring-dashboard";

export async function setupServer(app: Express) {
  // Initialize Sentry (must be early)
  if (process.env.SENTRY_ENABLED === 'true') {
    initializeSentry(app);
  }

  // Add request logging
  app.use(loggerMiddleware);
  app.use(sentryContextMiddleware);

  // Swagger UI
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "list",
        filter: true,
      },
    })
  );

  // Monitoring endpoints
  registerMonitoringRoutes(app);

  // ... rest of your routes
}
```

---

## 📚 API Documentation Setup

### Adding JSDoc Comments to Routes

Copy the pattern from `server/services/jsdoc-patterns.ts` to your route files:

```typescript
/**
 * @swagger
 * /api/production/orders:
 *   get:
 *     tags:
 *       - Production
 *     summary: Get all production orders
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 *     security:
 *       - bearerAuth: []
 */
app.get("/api/production/orders", async (req, res) => {
  // Implementation
});
```

### Access Documentation

- **Swagger UI**: `http://localhost:5000/api/docs`
- **OpenAPI JSON**: `http://localhost:5000/api/docs/swagger.json`

### Documentation Standards

- ✅ All endpoints must have JSDoc comments
- ✅ Include parameters, request body, and responses
- ✅ Add Arabic descriptions where applicable
- ✅ Document all error codes (400, 401, 403, 404, 500)
- ✅ Mark required fields

---

## 🔍 Monitoring & Observability Setup

### 1. Sentry Error Tracking

**Features**:
- Automatic error capture
- Performance monitoring
- Release tracking
- Source map support

**Configuration**:

```typescript
// Automatically configured in server/services/sentry-monitoring.ts
// Just add SENTRY_DSN to environment

// Manual error capturing:
import { captureError } from "./services/sentry-monitoring";

try {
  // Do something
} catch (error) {
  captureError(error, { context: "specific operation" });
}
```

**Sentry Console**: https://sentry.io

### 2. Winston Logging

**Features**:
- Structured JSON logging
- File and console output
- Log levels (error, warn, info, debug)
- Automatic log rotation

**Usage**:

```typescript
import { winstonLogger, logError, logAudit } from "./services/logger";

// Info log
winstonLogger.info("Operation successful", {
  userId: 123,
  action: "order_created",
});

// Error log
logError(error, { context: "database operation" });

// Audit log
logAudit("user_login", userId, { ip: req.ip });
```

**Log Files**:
- `logs/error.log` - Errors only
- `logs/combined.log` - All logs

### 3. Performance Logging

```typescript
import { logDatabasePerformance } from "./services/logger";

const start = Date.now();
// Execute query
const duration = Date.now() - start;
logDatabasePerformance(query, duration, rowsAffected);
```

---

## ⚡ Performance Optimization

### 1. Database Query Monitoring

```typescript
import { queryTracker } from "./services/performance-monitor";

// Record query performance
queryTracker.recordQuery(sql, durationMs);

// Get statistics
const stats = queryTracker.getStats();
// { queryCount, avgDuration, slowQueries, maxDuration, minDuration }

// Get slow queries
const slowQueries = queryTracker.getSlowQueries();
```

### 2. Response Caching

```typescript
import { responseCache } from "./services/performance-monitor";

// Set cache
responseCache.set("orders:all", data, 5 * 60 * 1000); // 5 min TTL

// Get from cache
const cached = responseCache.get("orders:all");

// Clear cache
responseCache.clear();
responseCache.clear("orders"); // Clear pattern
```

### 3. Database Index Optimization

```typescript
import { indexAnalyzer } from "./services/performance-monitor";

// Get missing index suggestions
const suggestions = indexAnalyzer.suggestMissingIndexes();
// Returns: [
//   { table: "production_orders", column: "status", reason: "..." },
//   ...
// ]

// Record index usage
indexAnalyzer.recordIndexUsage("idx_orders_status");

// Get usage report
const usage = indexAnalyzer.getIndexUsageReport();
```

### 4. Memory & Bundle Optimization

```typescript
import { getResourceMetrics, bundleAnalyzer } from "./services/performance-monitor";

// Get memory metrics
const metrics = getResourceMetrics();
// { heapUsed, heapTotal, external, rss, uptime }

// Record module size
bundleAnalyzer.recordModule("routes/production", 150000);

// Get bundle report
const report = bundleAnalyzer.getReport();

// Find optimization opportunities
const opportunities = bundleAnalyzer.findOptimizationOpportunities();
```

---

## 📊 Monitoring Endpoints

### Dashboard

```
GET /api/admin/monitoring/dashboard
```

Returns:
- Database query statistics
- Memory usage metrics
- Cache performance
- Index usage report
- Sentry health status

### Query Performance

```
GET /api/admin/monitoring/queries
```

Returns:
- Query statistics
- Top 20 slow queries
- Index recommendations

### Cache Status

```
GET /api/admin/monitoring/cache
GET /api/admin/monitoring/cache/clear (POST)
```

### Health Check

```
GET /api/admin/monitoring/health
```

Returns quick health status with:
- Memory usage
- Database performance
- Cache status

---

## 🎛️ Best Practices

### Documentation
- ✅ Keep JSDoc comments up-to-date
- ✅ Add examples to complex endpoints
- ✅ Document error responses clearly
- ✅ Include rate limits in docs

### Monitoring
- ✅ Set up Sentry alerts for critical errors
- ✅ Review slow queries weekly
- ✅ Monitor memory usage trends
- ✅ Keep logs for at least 30 days

### Performance
- ✅ Cache frequently accessed data
- ✅ Add missing database indexes
- ✅ Profile bundle size regularly
- ✅ Set appropriate slow-query thresholds

### Security
- ✅ Don't log sensitive data (passwords, tokens)
- ✅ Sanitize error messages for clients
- ✅ Use Sentry's "beforeSend" for data filtering
- ✅ Restrict monitoring endpoints to admins only

---

## 🐛 Troubleshooting

### Swagger UI not showing endpoints
- ✅ Ensure JSDoc comments are in correct format
- ✅ Check that routes.ts is included in `apis` array
- ✅ Restart server after adding new comments

### Sentry not capturing errors
- ✅ Verify `SENTRY_DSN` is set correctly
- ✅ Check network connectivity to Sentry
- ✅ Ensure error handler middleware is registered

### Performance data not updating
- ✅ Verify logging is enabled (`LOG_LEVEL`)
- ✅ Check that `queryTracker.recordQuery()` is called
- ✅ Ensure logs directory has write permissions

---

## 🔗 Integration with Existing Code

### Update your routes:

1. **Add JSDoc comments** above each endpoint
2. **Import monitoring** functions where needed
3. **Call performance trackers** for database operations
4. **Use logger** for important operations
5. **Wrap critical code** with Sentry transaction tracking

### Example route update:

```typescript
/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get all orders
 *     responses:
 *       200:
 *         description: List of orders
 */
app.get("/api/orders", requireAuth, async (req, res) => {
  const transaction = startPerformanceTransaction("fetch_orders", "http.server");

  try {
    const cacheKey = `orders:${req.user?.id}`;
    let orders = responseCache.get(cacheKey);

    if (!orders) {
      const start = Date.now();
      orders = await db.query("SELECT * FROM orders...");
      queryTracker.recordQuery("SELECT * FROM orders", Date.now() - start);

      responseCache.set(cacheKey, orders, 5 * 60 * 1000);
    }

    res.json(orders);
  } catch (error) {
    captureError(error, { context: "orders endpoint" });
    res.status(500).json({ error: "خطأ في جلب الطلبات" });
  } finally {
    transaction?.finish();
  }
});
```

---

## 📈 Next Steps

1. **Document all endpoints** with JSDoc comments
2. **Set up Sentry project** and add DSN to environment
3. **Enable monitoring** in production
4. **Add cache invalidation** logic for data updates
5. **Schedule regular** performance reviews
6. **Train team** on monitoring dashboards

---

**Documentation Last Updated**: 2026-08-31  
**Implementation Status**: ✅ Complete and Ready for Integration
