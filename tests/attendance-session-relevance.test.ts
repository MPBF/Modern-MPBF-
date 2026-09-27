import { describe, expect, it } from "@jest/globals";
import { isOpenSessionRelevant, summarizeActionSession } from "../server/storage/attendance-session";
import { requiresFactoryGeofence } from "../shared/attendance-policy";
import {
  getShiftWindowForSnapshot,
  getSnapshotShiftType,
  type ShiftSnapshot,
} from "../shared/shifts";

const at = (riyadh: string) => new Date(`${riyadh}+03:00`);
const night = {
  kind: "night" as const,
  name_ar: "ليلية",
  start_time: "19:00",
  end_time: "07:00",
  grace_minutes: 0,
  base_work_hours: 8,
};
const session = (date: string, time: string, snapshot: ShiftSnapshot = night) => ({
  date,
  check_in_time: at(time),
  shift_snapshot: snapshot,
});

describe("open attendance session boundaries", () => {
  it("ignores orphaned day check-ins from yesterday and older days", () => {
    const day = { ...night, kind: "day" as const, start_time: "07:00", end_time: "19:00" };
    expect(isOpenSessionRelevant(session("2026-09-01", "2026-09-01T07:00:00", day), at("2026-09-02T07:00:00"))).toBe(false);
    expect(isOpenSessionRelevant(session("2026-08-31", "2026-08-31T19:00:00"), at("2026-09-02T07:00:00"))).toBe(false);
  });

  it("allows a late night checkout after 07:00 but not into the next 19:00 shift", () => {
    const open = session("2026-09-01", "2026-09-01T19:00:00");
    expect(isOpenSessionRelevant(open, at("2026-09-02T06:59:00"))).toBe(true);
    expect(isOpenSessionRelevant(open, at("2026-09-02T08:59:00"))).toBe(true);
    expect(isOpenSessionRelevant(open, at("2026-09-02T09:00:00"))).toBe(false);
    expect(isOpenSessionRelevant(open, at("2026-09-02T19:00:00"))).toBe(false);
  });

  it("limits flexible cross-midnight sessions to 24 hours from check-in", () => {
    const flexible: ShiftSnapshot = { ...night, kind: "flexible", start_time: "00:00", end_time: "00:00" };
    const open = session("2026-09-01", "2026-09-01T23:00:00", flexible);
    expect(isOpenSessionRelevant(open, at("2026-09-01T23:59:00"))).toBe(true);
    expect(isOpenSessionRelevant(open, at("2026-09-02T00:00:00"))).toBe(false);
    expect(isOpenSessionRelevant(open, at("2026-09-02T23:00:00"))).toBe(false);
  });

  it("recognizes flexible snapshots saved without a kind", () => {
    const legacy = { ...night, kind: undefined, start_time: "00:00", end_time: "00:00" };
    expect(getSnapshotShiftType(legacy)).toBe("flexible");
    const window = getShiftWindowForSnapshot(legacy, "2026-09-01");
    expect(window.end.getTime() - window.start.getTime()).toBe(24 * 3600000);
  });

  it("requires onsite location for check-in and breaks, not checkout", () => {
    expect(requiresFactoryGeofence("حاضر")).toBe(true);
    expect(requiresFactoryGeofence("في الاستراحة")).toBe(true);
    expect(requiresFactoryGeofence("مغادر")).toBe(false);
  });

  it("uses only the latest check-in's actions for button state", () => {
    const rows = [
      { status: "حاضر", check_in_time: at("2026-09-01T12:00:00") },
      { status: "مغادر", check_out_time: at("2026-09-01T11:00:00") },
      { status: "في الاستراحة" },
      { status: "حاضر", check_in_time: at("2026-09-01T07:00:00") },
    ];
    expect(summarizeActionSession(rows)).toMatchObject({
      hasCheckedIn: true, hasCheckedOut: false, hasStartedLunch: false,
    });
  });

  it("does not mistake a withdrawal restore for a new check-in", () => {
    const rows = [
      { status: "حاضر", notes: "auto_restore_after_withdrawal" },
      { status: "منسحب" },
    ];
    expect(summarizeActionSession(rows).hasCheckedIn).toBe(false);
  });
});