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
const flexible: ShiftSnapshot = {
  name_ar: "حرة", start_time: "00:00", end_time: "00:00",
  grace_minutes: 0, base_work_hours: 8, kind: "flexible",
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

  it("counts fixed day overtime only after 15:00", () => {
    const metrics = computeShiftMetrics({
      shift: "day",
      dateStr: "2026-09-01",
      checkIn: instant("2026-09-01T08:00:00"),
      checkOut: instant("2026-09-01T16:00:00"),
    });
    expect(metrics.workedHours).toBe(8);
    expect(metrics.overtimeHours).toBe(1);
    expect(metrics.earlyLeaveMinutes).toBe(0);
  });

  it("counts fixed night overtime from 03:00 until 07:00", () => {
    const metrics = computeShiftMetrics({
      shift: "night",
      dateStr: "2026-09-01",
      checkIn: instant("2026-09-01T19:00:00"),
      checkOut: instant("2026-09-02T06:00:00"),
    });
    expect(metrics.workedHours).toBe(11);
    expect(metrics.overtimeHours).toBe(3);
    expect(metrics.earlyLeaveMinutes).toBe(0);
  });

  it("deducts breaks that occur during the overtime window", () => {
    const metrics = computeShiftMetrics({
      shift: "day",
      dateStr: "2026-09-01",
      checkIn: instant("2026-09-01T07:00:00"),
      checkOut: instant("2026-09-01T19:00:00"),
      breakMinutes: 60,
      overtimeBreakMinutes: 60,
    });
    expect(metrics.workedHours).toBe(11);
    expect(metrics.overtimeHours).toBe(3);
  });

  it("deducts withdrawals from fixed-shift overtime before base hours", () => {
    const metrics = computeShiftMetrics({
      shift: "day",
      dateStr: "2026-09-01",
      checkIn: instant("2026-09-01T07:00:00"),
      checkOut: instant("2026-09-01T19:00:00"),
      withdrawnMinutes: 60,
      overtimeWithdrawnMinutes: 60,
    });
    expect(metrics.workedHours).toBe(11);
    expect(metrics.overtimeHours).toBe(3);
  });

  it("splits flexible work at the calendar-day boundary", () => {
    const firstDay = computeShiftMetrics({
      shift: "flexible",
      dateStr: "2026-09-01",
      snapshot: flexible,
      checkIn: instant("2026-09-01T23:00:00"),
      checkOut: instant("2026-09-02T02:00:00"),
    });
    const secondDay = computeShiftMetrics({
      shift: "flexible",
      dateStr: "2026-09-02",
      snapshot: flexible,
      checkIn: instant("2026-09-01T23:00:00"),
      checkOut: instant("2026-09-02T02:00:00"),
    });
    expect(firstDay.workedHours).toBe(1);
    expect(secondDay.workedHours).toBe(2);
    expect(firstDay.lateMinutes).toBe(0);
    expect(secondDay.earlyLeaveMinutes).toBe(0);
  });

  it("resolves a flexible assignment as one calendar day", () => {
    const result = resolveAssignmentSnapshot(
      { id: 3, shift_snapshot: flexible },
      null,
      instant("2026-09-01T23:59:59"),
    );
    expect(result?.attendanceDate).toBe("2026-09-01");
    expect(result?.window.start).toEqual(instant("2026-09-01T00:00:00"));
    expect(result?.window.end).toEqual(instant("2026-09-02T00:00:00"));
  });
});