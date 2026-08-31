/**
 * 🏭 الإنتاج والآلات (Production & Machines)
 * جداول تتعلق بعملية التصنيع والآلات والرولات
 * 
 * المرحلة الرابعية للإنتاج:
 * 1. Film Production (Extruder) → إنتاج الأفلام
 * 2. Printing (Optional) → الطباعة 
 * 3. Cutting → التقطيع
 * 4. Warehouse Receipt → استقبال المستودع
 * 
 * الجداول المضمنة:
 * - machines: معلومات الآلات وسعتها
 * - production_orders: طلبات الإنتاج
 * - rolls: الرولات (الأفلام) مع تتبع رمز QR
 * - cuts: المنتج النهائي (الأكياس)
 * - waste: الفاقد والهدر
 * - machine_queues: قوائم انتظار الآلات
 * - mixing_batches: دفعات المزج
 * - batch_ingredients: مكونات الدفعات
 * - production_settings: إعدادات الإنتاج
 */

export {
  machines,
  productionOrders,
  rolls,
  cuts,
  waste,
  machineQueues,
  mixingBatches,
  batchIngredients,
  productionSettings,
} from "../../migrations/schema";
