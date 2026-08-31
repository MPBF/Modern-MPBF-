/**
 * 📦 المخزون والتخزين (Inventory & Warehouse)
 * جداول تتعلق بالمواد الخام والمخزون والمستودعات والتخزين
 * 
 * الجداول المضمنة:
 * - items: أنواع الأصناف والمواد
 * - locations: مواقع التخزين
 * - inventory: المخزون الحالي
 * - inventory_movements: حركات المخزون
 * - inventory_counts: فحص وجرد المخزون
 * - inventory_count_items: تفاصيل فحص المخزون
 * - warehouse_transactions: حركات المستودع
 * - raw_material_vouchers_in: مراسلات المواد الخام (دخول)
 * - raw_material_vouchers_out: مراسلات المواد الخام (خروج)
 * - finished_goods_vouchers_in: مراسلات المنتجات (دخول)
 * - finished_goods_vouchers_out: مراسلات المنتجات (خروج)
 * - warehouse_receipts: استقبالات المستودع
 * - consumable_parts: أجزاء قابلة للاستهلاك
 * - consumable_parts_transactions: حركات الأجزاء
 */

export {
  items,
  locations,
  inventory,
  inventoryMovements,
  inventoryCounts,
  inventoryCountItems,
  warehouseTransactions,
  rawMaterialVouchersIn,
  rawMaterialVouchersOut,
  finishedGoodsVouchersIn,
  finishedGoodsVouchersOut,
  warehouseReceipts,
  consumableParts,
  consumablePartsTransactions,
} from "../../migrations/schema";
