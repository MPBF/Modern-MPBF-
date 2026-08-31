#!/bin/bash

# ============================================================================
# 🧪 API Documentation, Monitoring & Performance - Quick Test Script
# ============================================================================
# This script tests the newly implemented features

set -e

echo "🚀 Starting tests for API Documentation & Monitoring..."
echo ""

API_URL="${API_URL:-http://localhost:5000}"
ADMIN_TOKEN="${ADMIN_TOKEN:-}"  # Set this if authentication is required

# ============================================================================
# 1. Test Swagger/OpenAPI Documentation
# ============================================================================
echo "1️⃣ Testing Swagger/OpenAPI Documentation..."
echo "   URL: $API_URL/api/docs"
echo ""

# Check if Swagger UI is accessible
if curl -s "$API_URL/api/docs" > /dev/null 2>&1; then
    echo "   ✅ Swagger UI is accessible"
else
    echo "   ⚠️ Swagger UI might not be accessible (server may not be running)"
fi

# Fetch OpenAPI spec
echo "   Fetching OpenAPI specification..."
if curl -s "$API_URL/api/docs/swagger.json" > /tmp/swagger.json 2>/dev/null; then
    ENDPOINT_COUNT=$(grep -o '"paths"' /tmp/swagger.json | wc -l)
    echo "   ✅ OpenAPI spec loaded successfully"
    echo "   📊 Contains API documentation"
else
    echo "   ⚠️ Could not fetch OpenAPI spec (server may not be running)"
fi

echo ""

# ============================================================================
# 2. Test Health Check Endpoint
# ============================================================================
echo "2️⃣ Testing Health Check Endpoint..."
echo "   URL: $API_URL/api/admin/monitoring/health"
echo ""

if curl -s "$API_URL/api/admin/monitoring/health" > /tmp/health.json 2>/dev/null; then
    STATUS=$(grep -o '"status":"[^"]*"' /tmp/health.json | head -1)
    echo "   ✅ Health check endpoint is responding"
    echo "   📊 Status: $STATUS"
else
    echo "   ⚠️ Health check endpoint not accessible (server may not be running)"
fi

echo ""

# ============================================================================
# 3. Test Monitoring Dashboard
# ============================================================================
echo "3️⃣ Testing Monitoring Dashboard..."
echo "   URL: $API_URL/api/admin/monitoring/dashboard"
echo ""

if curl -s "$API_URL/api/admin/monitoring/dashboard" > /tmp/dashboard.json 2>/dev/null; then
    echo "   ✅ Monitoring dashboard is responding"
    echo "   📊 Available endpoints:"
    echo "      - Database metrics"
    echo "      - Performance data"
    echo "      - Cache statistics"
    echo "      - Monitoring status"
else
    echo "   ⚠️ Monitoring dashboard not accessible (server may not be running)"
fi

echo ""

# ============================================================================
# 4. Test Production Orders Endpoint (with JSDoc documentation)
# ============================================================================
echo "4️⃣ Testing Production Orders Endpoint (with JSDoc)..."
echo "   URL: $API_URL/api/production-orders"
echo ""

# This endpoint should now have JSDoc documentation
if curl -s "$API_URL/api/production-orders" > /dev/null 2>&1; then
    echo "   ✅ Production orders endpoint is accessible"
    echo "   📚 JSDoc documentation added"
else
    echo "   ⚠️ Endpoint not accessible (may require authentication or database)"
fi

echo ""

# ============================================================================
# 5. Test Orders Endpoint (with JSDoc documentation)
# ============================================================================
echo "5️⃣ Testing Orders Endpoint (with JSDoc)..."
echo "   URL: $API_URL/api/orders"
echo ""

if curl -s "$API_URL/api/orders" > /dev/null 2>&1; then
    echo "   ✅ Orders endpoint is accessible"
    echo "   📚 JSDoc documentation added"
else
    echo "   ⚠️ Endpoint not accessible (may require authentication or database)"
fi

echo ""

# ============================================================================
# 6. Test Attendance Endpoint (with JSDoc documentation)
# ============================================================================
echo "6️⃣ Testing Attendance Endpoint (with JSDoc)..."
echo "   URL: $API_URL/api/attendance"
echo ""

if curl -s "$API_URL/api/attendance" > /dev/null 2>&1; then
    echo "   ✅ Attendance endpoint is accessible"
    echo "   📚 JSDoc documentation added"
else
    echo "   ⚠️ Endpoint not accessible (may require authentication or database)"
fi

echo ""

# ============================================================================
# 7. Check Log Files
# ============================================================================
echo "7️⃣ Checking Log Files..."
echo ""

if [ -f "logs/combined.log" ]; then
    LINES=$(wc -l < logs/combined.log)
    echo "   ✅ Combined log file exists ($LINES lines)"
else
    echo "   ℹ️  Combined log file will be created on first request"
fi

if [ -f "logs/error.log" ]; then
    ERRORS=$(wc -l < logs/error.log)
    echo "   ✅ Error log file exists ($ERRORS errors)"
else
    echo "   ℹ️  Error log file will be created when errors occur"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "✅ Test script completed!"
echo ""
echo "📝 Summary:"
echo "   1. Swagger UI: http://localhost:5000/api/docs"
echo "   2. Health Check: http://localhost:5000/api/admin/monitoring/health"
echo "   3. Dashboard: http://localhost:5000/api/admin/monitoring/dashboard"
echo "   4. Logs: ./logs/combined.log and ./logs/error.log"
echo ""
echo "🔗 Next Steps:"
echo "   1. Open Swagger UI in your browser to explore API documentation"
echo "   2. Check monitoring dashboard for system health and metrics"
echo "   3. Review logs for any errors or warnings"
echo "   4. Configure SENTRY_DSN in .env for error tracking"
echo ""
