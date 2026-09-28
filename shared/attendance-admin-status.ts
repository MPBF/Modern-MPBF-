/** Infer the status of a manager-adjusted attendance day from its stamps.
 * Leave and holidays remain authoritative when no work stamps exist. */
export function statusFromAttendanceTimes(
  checkIn: Date | null,
  breakStart: Date | null,
  breakEnd: Date | null,
  checkOut: Date | null,
  previousStatus: string | null,
): string {
  if (checkOut) return "مغادر";
  if (breakStart && (!breakEnd || breakEnd < breakStart)) return "في الاستراحة";
  if (checkIn) return breakEnd ? "يعمل" : "حاضر";
  if (!breakStart && !breakEnd && (previousStatus === "إجازة" || previousStatus === "عطلة"))
    return previousStatus;
  return "غائب";
}

/** An overnight shift's post-midnight stamp belongs to the next calendar date. */
export function shiftWallTimeToInstant(
  date: string,
  hhmm: string,
  shiftKind: string | null,
  shiftStart = "19:00",
): Date {
  const day = new Date(`${date}T00:00:00Z`);
  if (shiftKind === "night" && hhmm < shiftStart)
    day.setUTCDate(day.getUTCDate() + 1);
  return new Date(`${day.toISOString().slice(0, 10)}T${hhmm}:00+03:00`);
}