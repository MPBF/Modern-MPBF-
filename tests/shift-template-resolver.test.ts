import { describe, expect, it } from "@jest/globals";
import {
  getShiftWindowForSnapshot,
  resolveAssignmentSnapshot,
  type ShiftSnapshot,
  computeShiftMetrics,
} from "../shared/shifts";

const instant = (riyadh: string) => new Date(`${riyadh}+03:00`);

const day: ShiftSnapshot = {
  name_ar: "مخصص", start_time: "08:30", end_time: "16:30",
  grace_minutes: 10, base_work_hours: 7.5,
};
const night: ShiftSnapshot = {
  name_ar: "ليل", start_time: "20:15", end_time: "05:45",
  grace_minutes: 0, base_work_hours: 8,
};

describe("snapshot shift resolver", () => {
  it("uses arbitrary-minute template windows and exclusive end", () => {
    const window = getShiftWindowForSnapshot(day, "2026-09-01");
    expect(window.start).toEqual(instant("2026-09-01T08:30:00"));
    expect(window.end).toEqual(instant("2026-09-01T16:30:00"));
    const result = resolveAssignmentSnapshot({ id: 1, shift_snapshot: day }, null, instant("2026-09-01T16:30:00"));
    expect(result?.window.end).toEqual(window.end);
  });

  it("prefers yesterday's still-active cross-midnight snapshot", () => {
    const result = resolveAssignmentSnapshot(
      { id: 2, shift_snapshot: day },
      { id: 1, shift_snapshot: night },
      instant("2027-01-01T02:00:00"),
    );
    expect(result?.attendanceDate).toBe("2026-12-31");
    expect(result?.snapshot.name_ar).toBe("ليل");
  });

  it("keeps legacy assignments readable", () => {
    expect(resolveAssignmentSnapshot({ shift: "day" }, null, instant("2026-09-01T10:00:00"))?.snapshot.start_time).toBe("07:00");
  });

  it("uses snapshot grace and base work hours without admitting early check-in", () => {
    const metrics = computeShiftMetrics({
      shift: "day", dateStr: "2026-09-01", snapshot: day,
      checkIn: instant("2026-09-01T08:38:00"),
      checkOut: instant("2026-09-01T16:38:00"),
    });
    expect(metrics.lateMinutes).toBe(0);
    // 8 hours exceeds this template's 7.5 base hours.
    expect(metrics.overtimeHours).toBe(0.5);
  });
});