/** Checkout must be possible after leaving the premises; other actions stay onsite. */
export function requiresFactoryGeofence(status: string): boolean {
  return status !== "مغادر";
}