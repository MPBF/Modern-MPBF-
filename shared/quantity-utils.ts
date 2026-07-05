/**
 * Utility functions for automatic quantity calculations
 * This module contains the intelligent quantity system that automatically
 * calculates overrun percentages based on product punching types
 */

import { normalizeDecimal, numberToDecimalString } from "./decimal-utils";

/**
 * Determines the overrun percentage based on the product punching type
 * Supports both Arabic and English terms for punching types
 * @param punching The punching type from customer_products table
 * @returns The overrun percentage as a number
 */
export function calculateOverrunPercentage(punching?: string | null): number {
  if (!punching) {
    return 5.0; // Default percentage for products without punching info
  }

  const punchingLower = punching.toLowerCase();

  // Hook products get 20% overrun - Support Arabic "علاقي" / "علاقي هوك" and
  // English "hook" / "t-shirt" (T-Shirt bags are hook/hanger type).
  if (
    punchingLower.includes("hook") ||
    punchingLower.includes("علاقي") ||
    punchingLower.includes("t-shirt")
  ) {
    return 20.0;
  }

  // Banana products get 10% overrun - Support both Arabic "بنانة" and English "banana"
  if (punchingLower.includes("banana") || punchingLower.includes("بنانة")) {
    return 10.0;
  }

  // All other products get 5% overrun
  return 5.0;
}

/**
 * Calculates the final quantity with overrun applied
 * @param baseQuantity The base quantity in kg
 * @param overrunPercentage The overrun percentage (5, 10, or 20)
 * @returns The final quantity with overrun applied
 */
export function calculateFinalQuantity(
  baseQuantity: number,
  overrunPercentage: number,
): number {
  const multiplier = 1 + overrunPercentage / 100;
  return baseQuantity * multiplier;
}

/**
 * Calculates both overrun percentage and final quantity for a production order
 * @param baseQuantityKg Base quantity in kg
 * @param punching Product punching type
 * @returns Object with overrun percentage and final quantity
 */
export function calculateProductionQuantities(
  baseQuantityKg: number,
  punching?: string | null,
): {
  overrunPercentage: number;
  finalQuantityKg: number;
  overrunReason: string;
} {
  const overrunPercentage = calculateOverrunPercentage(punching);
  const finalQuantityKg = calculateFinalQuantity(
    baseQuantityKg,
    overrunPercentage,
  );

  let overrunReason = "منتج عادي";
  if (punching) {
    const punchingLower = punching.toLowerCase();
    if (
      punchingLower.includes("hook") ||
      punchingLower.includes("علاقي") ||
      punchingLower.includes("t-shirt")
    ) {
      overrunReason = "منتج علاقي (Hook)";
    } else if (
      punchingLower.includes("banana") ||
      punchingLower.includes("بنانة")
    ) {
      overrunReason = "منتج بنانة (Banana)";
    }
  }

  return {
    overrunPercentage,
    finalQuantityKg,
    overrunReason,
  };
}

/**
 * Formats the overrun percentage for display in Arabic
 * @param overrunPercentage The overrun percentage
 * @returns Formatted string in Arabic
 */
export function formatOverrunPercentageArabic(
  overrunPercentage: number,
): string {
  return `${overrunPercentage}%`;
}

/**
 * Gets the description of why a certain overrun percentage was applied
 * Supports both Arabic and English terms for punching types
 * @param punching The product punching type
 * @returns Arabic description of the overrun reason
 */
export function getOverrunReasonDescription(punching?: string | null): string {
  if (!punching) {
    return "نسبة الإضافة الافتراضية للمنتجات العادية";
  }

  const punchingLower = punching.toLowerCase();

  if (
    punchingLower.includes("hook") ||
    punchingLower.includes("علاقي") ||
    punchingLower.includes("t-shirt")
  ) {
    return "نسبة إضافة عالية للمنتجات العلاقية (Hook) - 20%";
  }

  if (punchingLower.includes("banana") || punchingLower.includes("بنانة")) {
    return "نسبة إضافة متوسطة لمنتجات البنانة (Banana) - 10%";
  }

  return "نسبة الإضافة الافتراضية للمنتجات العادية - 5%";
}
