import { describe, expect, it } from "@jest/globals";
import {
  getAttendanceCutoffInstant,
  isAttendanceCutoffReached,
  isCheckoutAllowedForSnapshot,
} from "../server/storage/attendance-session";
import {
  computeShiftMetrics,
  getShiftWindowForSnapshot,
  resolveAssignmentSnapshot,
} from "../shared/shifts";

const at = (riyadh: string) => new Date(`${riyadh}+03:00`);
const day = {
  kind: "day" as const,
  name_ar: "نهارية",
  start_time: "07:00",
  end_time: "15:00",
  overtime_end_time: "19:00",
  attendance_cutoff_time: "00:00",
  grace_minutes: 30,
  base_work_hours: 8,
};
const night = {
  ...day,
  kind: "night" as const,
  name_ar: "ليلية",
  start_time: "19:00",
  end_time: "03:00",
  overtime_end_time: "07:00",
  attendance_cutoff_time: "09:00",
};

describe("attendance day cutoff", () => {
  it("uses the following Riyadh calendar day's configured cutoff", () => {
    expect(getAttendanceCutoffInstant({
      date: "2026-09-01",
      shift_snapshot: day,
    })?.toISOString()).toBe("2026-09-01T21:00:00.000Z");
    expect(getAttendanceCutoffInstant({
      date: "2026-09-01",
      shift_snapshot: night,
    })?.toISOString()).toBe("2026-09-02T06:00:00.000Z");
  });

  it("closes at the exact cutoff instant, but not before it", () => {
    const session = { date: "2026-09-01", shift_snapshot: night };
    expect(isAttendanceCutoffReached(session, at("2026-09-02T08:59:59"))).toBeNull();
    expect(
      isAttendanceCutoffReached(session, at("2026-09-02T09:00:00"))?.toISOString(),
    ).toBe("2026-09-02T06:00:00.000Z");
  });

  it("accepts checkout from before base end through overtime end plus grace", () => {
    const session = { date: "2026-09-01", shift_snapshot: night };
    expect(isCheckoutAllowedForSnapshot(session, at("2026-09-02T02:29:59"))).toBe(false);
    expect(isCheckoutAllowedForSnapshot(session, at("2026-09-02T02:30:00"))).toBe(true);
    expect(isCheckoutAllowedForSnapshot(session, at("2026-09-02T03:00:00"))).toBe(true);
    expect(isCheckoutAllowedForSnapshot(session, at("2026-09-02T05:00:00"))).toBe(true);
    expect(isCheckoutAllowedForSnapshot(session, at("2026-09-02T06:30:00"))).toBe(true);
    expect(isCheckoutAllowedForSnapshot(session, at("2026-09-02T07:29:59"))).toBe(true);
    expect(isCheckoutAllowedForSnapshot(session, at("2026-09-02T07:30:00"))).toBe(true);
    expect(isCheckoutAllowedForSnapshot(session, at("2026-09-02T07:30:01"))).toBe(false);
    expect(isCheckoutAllowedForSnapshot(
      { date: "2026-09-01", shift_snapshot: { ...night, grace_minutes: 0 } },
      at("2026-09-02T03:00:00"),
    )).toBe(true);
    expect(isCheckoutAllowedForSnapshot(
      { date: "2026-09-01", shift_snapshot: { ...night, grace_minutes: 0 } },
      at("2026-09-02T07:00:00"),
    )).toBe(true);
    expect(isCheckoutAllowedForSnapshot(session, at("2026-09-02T08:59:59"))).toBe(false);
    expect(isCheckoutAllowedForSnapshot(
      { date: "2026-09-01", shift_snapshot: day },
      at("2026-09-01T15:00:00"),
    )).toBe(true);
    expect(isCheckoutAllowedForSnapshot(
      { date: "2026-09-01", shift_snapshot: day },
      at("2026-09-01T19:30:00"),
    )).toBe(true);
  });

  it("counts only actual overtime, not the entire optional block", () => {
    const window = getShiftWindowForSnapshot(night, "2026-09-01");
    expect(window.end.toISOString()).toBe(at("2026-09-02T07:00:00").toISOString());
    const base = computeShiftMetrics({
      shift: "night", snapshot: night, dateStr: "2026-09-01",
      checkIn: at("2026-09-01T19:00:00"),
      checkOut: at("2026-09-02T03:00:00"),
    });
    const extra = computeShiftMetrics({
      shift: "night", snapshot: night, dateStr: "2026-09-01",
      checkIn: at("2026-09-01T19:00:00"),
      checkOut: at("2026-09-02T07:00:00"),
    });
    expect([base.workedHours, base.overtimeHours]).toEqual([8, 0]);
    expect([extra.workedHours, extra.overtimeHours]).toEqual([12, 4]);
  });

  it("keeps yesterday's night date through 08:59 and changes at 09:00", () => {
    const assigned = { id: 1, shift_snapshot: night };
    expect(resolveAssignmentSnapshot(assigned, assigned, at("2026-09-02T08:59:59"))?.attendanceDate)
      .toBe("2026-09-01");
    expect(resolveAssignmentSnapshot(assigned, assigned, at("2026-09-02T09:00:00"))?.attendanceDate)
      .toBe("2026-09-02");
  });

  it("reads existing attendance snapshots with their old overtime end", () => {
    const oldNight = { ...night, end_time: "07:00", overtime_end_time: undefined };
    expect(getShiftWindowForSnapshot(oldNight, "2026-09-01").end.toISOString())
      .toBe(at("2026-09-02T07:00:00").toISOString());
    expect(isCheckoutAllowedForSnapshot(
      { date: "2026-09-01", shift_snapshot: oldNight },
      at("2026-09-02T03:00:00"),
    )).toBe(true);
  });

  it("keeps flexible checkout unrestricted by the official shift end", () => {
    const flexible = {
      ...day,
      kind: "flexible" as const,
      start_time: "00:00",
      end_time: "00:00",
      overtime_end_time: null,
    };
    expect(isCheckoutAllowedForSnapshot(
      { date: "2026-09-01", shift_snapshot: flexible },
      at("2026-09-01T23:59:00"),
    )).toBe(true);
  });
});