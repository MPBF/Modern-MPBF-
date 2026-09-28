import { describe, expect, it } from "@jest/globals";
import { shiftWallTimeToInstant, statusFromAttendanceTimes } from "../shared/attendance-admin-status";

const at = (hour: number) => new Date(`2026-09-28T${String(hour).padStart(2, "0")}:00:00+03:00`);

describe("admin time edits determine current attendance state", () => {
  it("marks a check-in as present, an open break as on break, and a returned break as working", () => {
    expect(statusFromAttendanceTimes(at(7), null, null, null, "غائب")).toBe("حاضر");
    expect(statusFromAttendanceTimes(at(7), at(11), null, null, "حاضر")).toBe("في الاستراحة");
    expect(statusFromAttendanceTimes(at(7), at(11), at(12), null, "في الاستراحة")).toBe("يعمل");
  });

  it("marks checkout as left and clearing stamps as absent", () => {
    expect(statusFromAttendanceTimes(at(7), null, null, at(15), "حاضر")).toBe("مغادر");
    expect(statusFromAttendanceTimes(null, null, null, null, "مغادر")).toBe("غائب");
  });

  it("does not erase approved leave or holidays without attendance stamps", () => {
    expect(statusFromAttendanceTimes(null, null, null, null, "إجازة")).toBe("إجازة");
    expect(statusFromAttendanceTimes(null, null, null, null, "عطلة")).toBe("عطلة");
  });

  it("assigns early-morning night times to the next day, including month boundaries", () => {
    expect(shiftWallTimeToInstant("2026-09-30", "03:00", "night").toISOString())
      .toBe("2026-10-01T00:00:00.000Z");
    expect(shiftWallTimeToInstant("2026-09-30", "19:00", "night").toISOString())
      .toBe("2026-09-30T16:00:00.000Z");
    expect(shiftWallTimeToInstant("2026-09-30", "03:00", "day").toISOString())
      .toBe("2026-09-30T00:00:00.000Z");
  });
});