/**
 * 🛍️ الطلبات والعملاء (Orders & Customers)
 * جداول تتعلق بالعملاء والطلبات والاقتباسات والموردين
 * 
 * الجداول المضمنة:
 * - customers: بيانات العملاء
 * - customer_products: منتجات العملاء المخصصة
 * - orders: طلبات البيع
 * - quotes: الاقتباسات السعرية
 * - quote_items: بنود الاقتباسات
 * - quote_templates: قوالب الاقتباسات
 * - suppliers: بيانات الموردين
 */

export {
  customers,
  customerProducts,
  orders,
  quotes,
  quoteItems,
  quoteTemplates,
  suppliers,
} from "../../migrations/schema";
