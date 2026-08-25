import { roles, users } from "@shared/schema";
import { eq } from "drizzle-orm";

import { db } from "./db";

function normalizePermissions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((permission): permission is string => typeof permission === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (permission): permission is string => typeof permission === "string",
        );
      }
    } catch {
      return value.trim() ? [value.trim()] : [];
    }
  }

  return [];
}

export async function getMcpUserPermissions(userId: number): Promise<string[]> {
  const [result] = await db
    .select({ permissions: roles.permissions })
    .from(users)
    .leftJoin(roles, eq(users.role_id, roles.id))
    .where(eq(users.id, userId))
    .limit(1);

  return normalizePermissions(result?.permissions);
}