import { describe, expect, it } from "@jest/globals";

import {
  getActivePreviousNightShift,
  getAttendanceDateForShift,
  getShiftWindow,
  resolveShiftAcrossMonthBoundary,
} from "../shared/shifts";
import { filterAttendanceRecordsByWindow } from "../server/storage/attendance-session";

const instant = (riyadh: string) => new Date(`${riyadh}+03:00`);

describe("night-shift attendance date boundaries", () => {
  it("starts a new attendance date at exactly 19:00 Riyadh", () => {
    expect(
      getAttendanceDateForShift("night", instant("2026-08-31T19:00:00")),
    ).toBe("2026-08-31");
  });

  it("keeps the shift start date through midnight", () => {
    expect(
      getAttendanceDateForShift("night", instant("2026-09-01T00:00:00")),
    ).toBe("2026-08-31");
  });

  it("keeps the shift start date at and after 07:00 until the next shift", () => {
    expect(
      getAttendanceDateForShift("night", instant("2026-09-01T07:00:00")),
    ).toBe("2026-08-31");
    expect(
      getAttendanceDateForShift("night", instant("2026-09-01T12:00:00")),
    ).toBe("2026-08-31");
  });

  it("stops carrying active night status at exactly 07:00", () => {
    expect(
      getActivePreviousNightShift(instant("2026-09-01T06:59:59")),
    ).not.toBeNull();
    expect(
      getActivePreviousNightShift(instant("2026-09-01T07:00:00")),
    ).toBeNull();
  });

  it("does not alter day-shift attendance dates", () => {
    expect(
      getAttendanceDateForShift("day", instant("2026-09-01T07:00:00")),
    ).toBe("2026-09-01");
    expect(
      getAttendanceDateForShift("day", instant("2026-09-01T19:00:00")),
    ).toBe("2026-09-01");
  });

  it("excludes a morning checkout from the new 19:00 night session", () => {
    const window = getShiftWindow("night", "2026-09-01");
    const records = [
      { status: "مغادر", check_out_time: instant("2026-09-01T07:00:00") },
      { status: "حاضر", check_in_time: instant("2026-09-01T19:00:00") },
    ];

    expect(filterAttendanceRecordsByWindow(records, window)).toEqual([
      records[1],
    ]);
  });

  it("keeps excluding the stale morning checkout after midnight", () => {
    const date = getAttendanceDateForShift(
      "night",
      instant("2026-09-01T00:30:00"),
    );
    const window = getShiftWindow("night", date);
    const records = [
      { status: "مغادر", check_out_time: instant("2026-08-31T07:00:00") },
      { status: "حاضر", check_in_time: instant("2026-08-31T19:00:00") },
    ];

    expect(date).toBe("2026-08-31");
    expect(filterAttendanceRecordsByWindow(records, window)).toEqual([
      records[1],
    ]);
  });

  it("uses only the prior month's assignment before 07:00", () => {
    expect(
      resolveShiftAcrossMonthBoundary("night", "day", true, true),
    ).toBe("day");
    expect(
      resolveShiftAcrossMonthBoundary("night", undefined, true, true),
    ).toBeNull();
    expect(
      resolveShiftAcrossMonthBoundary("night", "day", false, true),
    ).toBe("night");
  });

  it("includes an exact 07:00 checkout only in the finished night session", () => {
    const finishedWindow = getShiftWindow("night", "2026-08-31");
    const nextWindow = getShiftWindow("night", "2026-09-01");
    const records = [
      { status: "حاضر", check_in_time: instant("2026-08-31T19:00:00") },
      { status: "مغادر", check_out_time: instant("2026-09-01T07:00:00") },
    ];

    expect(filterAttendanceRecordsByWindow(records, finishedWindow)).toEqual(
      records,
    );
    expect(filterAttendanceRecordsByWindow(records, nextWindow)).toEqual([]);
  });

  it("includes a late checkout before 19:00 only in the finished session", () => {
    const finishedBase = getShiftWindow("night", "2026-08-31");
    const finishedWindow = {
      ...finishedBase,
      checkoutEnd: new Date(
        finishedBase.end.getTime() + 12 * 60 * 60 * 1000,
      ),
    };
    const nextWindow = getShiftWindow("night", "2026-09-01");
    const records = [
      { status: "حاضر", check_in_time: instant("2026-08-31T19:00:00") },
      { status: "مغادر", check_out_time: instant("2026-09-01T12:00:00") },
    ];

    expect(filterAttendanceRecordsByWindow(records, finishedWindow)).toEqual(
      records,
    );
    expect(filterAttendanceRecordsByWindow(records, nextWindow)).toEqual([]);
  });
});