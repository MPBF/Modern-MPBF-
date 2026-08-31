/**
 * 📚 API Documentation JSDoc Examples
 * Demonstrates how to document all endpoints with Swagger/OpenAPI
 * Copy these patterns to your routes for auto-generated API documentation
 */

// ==================== Authentication Routes ====================
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user with username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     displayName:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */

// ==================== Production Routes ====================
/**
 * @swagger
 * /api/production/orders:
 *   get:
 *     tags:
 *       - Production
 *     summary: Get all production orders
 *     description: Retrieve list of production orders with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of production orders
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 */

/**
 * @swagger
 * /api/production/orders:
 *   post:
 *     tags:
 *       - Production
 *     summary: Create new production order
 *     description: Create a new production order for manufacturing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - machineId
 *               - quantity
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: Reference to sales order
 *               machineId:
 *                 type: integer
 *                 description: ID of machine to use
 *               quantity:
 *                 type: number
 *                 description: Quantity to produce in kilograms
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               notes:
 *                 type: string
 *                 description: Production notes
 *     responses:
 *       201:
 *         description: Production order created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /api/production/orders/{id}:
 *   get:
 *     tags:
 *       - Production
 *     summary: Get production order details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Production order details
 *       404:
 *         description: Order not found
 *   put:
 *     tags:
 *       - Production
 *     summary: Update production order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */

// ==================== Inventory Routes ====================
/**
 * @swagger
 * /api/inventory/items:
 *   get:
 *     tags:
 *       - Inventory
 *     summary: Get inventory items
 *     description: Retrieve list of inventory items with current stock levels
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: low_stock
 *         schema:
 *           type: boolean
 *         description: Show only low-stock items
 *     responses:
 *       200:
 *         description: List of inventory items
 *   post:
 *     tags:
 *       - Inventory
 *     summary: Create inventory item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - unit
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *                 description: Stock keeping unit
 *               unit:
 *                 type: string
 *               minQuantity:
 *                 type: number
 *               maxQuantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Item created
 */

// ==================== HR Routes ====================
/**
 * @swagger
 * /api/hr/attendance:
 *   get:
 *     tags:
 *       - HR
 *     summary: Get attendance records
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Attendance records
 *   post:
 *     tags:
 *       - HR
 *     summary: Record attendance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               checkInTime:
 *                 type: string
 *                 format: date-time
 *               checkOutTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Attendance recorded
 */

// ==================== Quality Routes ====================
/**
 * @swagger
 * /api/quality/checks:
 *   post:
 *     tags:
 *       - Quality
 *     summary: Perform quality check
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - result
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [roll, cut, product]
 *               targetId:
 *                 type: integer
 *               result:
 *                 type: string
 *                 enum: [pass, fail]
 *               score:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quality check recorded
 */

// ==================== System Routes ====================
/**
 * @swagger
 * /api/system/health:
 *   get:
 *     tags:
 *       - System
 *     summary: Health check
 *     description: Check system health and status
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                 cache:
 *                   type: string
 */

/**
 * @swagger
 * /api/system/performance:
 *   get:
 *     tags:
 *       - System
 *     summary: Performance metrics
 *     description: Get system performance metrics and statistics
 *     responses:
 *       200:
 *         description: Performance metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: integer
 *                 memory:
 *                   type: object
 *                 queries:
 *                   type: object
 *                 cache:
 *                   type: object
 */

export const jsdocPatterns = {
  description:
    "Above are JSDoc patterns for API documentation. Copy these patterns to your actual route handlers and customize for your endpoints.",
  usage: "Add JSDoc comments above each route handler function",
  location: "Document all routes in server/routes.ts and server/routes/*.ts files",
};
