import { describe, expect, it } from "@jest/globals";

import {
  computeEmployeeAttendance,
  type MonthlyShiftMap,
} from "../server/services/attendance-engine";
import type { ShiftSnapshot } from "../shared/shifts";

const instant = (riyadh: string) => new Date(`${riyadh}+03:00`);

const flexible: ShiftSnapshot = {
  name_ar: "حرة",
  name_en: "Flexible",
  kind: "flexible",
  start_time: "00:00",
  end_time: "00:00",
  grace_minutes: 0,
  base_work_hours: 8,
};

const actionRow = (
  id: number,
  values: Partial<{
    check_in_time: Date | null;
    check_out_time: Date | null;
    date: string;
    shift_snapshot: ShiftSnapshot | null;
  }>,
) => ({
  id,
  user_id: 1,
  date: values.date ?? "2026-09-01",
  status: values.check_in_time ? "حاضر" : "مغادر",
  check_in_time: values.check_in_time ?? null,
  check_out_time: values.check_out_time ?? null,
  lunch_start_time: null,
  lunch_end_time: null,
  break_start_time: null,
  break_end_time: null,
  total_withdrawn_minutes: 0,
  shift_snapshot: values.shift_snapshot ?? flexible,
});

describe("flexible attendance aggregation", () => {
  it("splits separate check-in and checkout action rows across calendar days", () => {
    const result = computeEmployeeAttendance(
      [
        actionRow(1, {
          check_in_time: instant("2026-09-01T23:00:00"),
        }),
        actionRow(2, {
          check_out_time: instant("2026-09-02T02:00:00"),
        }),
      ],
      new Map([["2026-9", flexible]]),
      "2026-09-01",
      "2026-09-02",
    );

    expect(result.days[0]).toMatchObject({
      date: "2026-09-01",
      workedHours: 1,
      overtimeHours: 0,
    });
    expect(result.days[1]).toMatchObject({
      date: "2026-09-02",
      workedHours: 2,
      overtimeHours: 0,
    });
  });

  it("does not merge separate sessions or count the gap between them", () => {
    const result = computeEmployeeAttendance(
      [
        actionRow(1, {
          check_in_time: instant("2026-09-01T23:00:00"),
        }),
        actionRow(2, {
          check_out_time: instant("2026-09-01T23:30:00"),
        }),
        actionRow(3, {
          date: "2026-09-02",
          check_in_time: instant("2026-09-02T01:00:00"),
        }),
        actionRow(4, {
          date: "2026-09-02",
          check_out_time: instant("2026-09-02T02:00:00"),
        }),
      ],
      new Map([["2026-9", flexible]]),
      "2026-09-01",
      "2026-09-02",
    );

    expect(result.days[0].workedHours).toBe(0.5);
    expect(result.days[1].workedHours).toBe(1);
    expect(result.totals.totalWorkedHours).toBe(1.5);
  });

  it("uses the captured flexible snapshot across a month assignment change", () => {
    const result = computeEmployeeAttendance(
      [
        actionRow(1, {
          date: "2026-08-31",
          check_in_time: instant("2026-08-31T23:00:00"),
        }),
        actionRow(2, {
          date: "2026-08-31",
          check_out_time: instant("2026-09-01T02:00:00"),
        }),
      ],
      new Map<string, MonthlyShiftMap extends Map<string, infer V> ? V : never>([
        ["2026-8", flexible],
        ["2026-9", "day"],
      ]),
      "2026-08-31",
      "2026-09-01",
    );

    expect(result.days[0].shift).toBe("flexible");
    expect(result.days[0].workedHours).toBe(1);
    expect(result.days[1].shift).toBe("flexible");
    expect(result.days[1].workedHours).toBe(2);
  });

  it("does not count a captured night session again as flexible work", () => {
    const night: ShiftSnapshot = {
      name_ar: "ليلية",
      kind: "night",
      start_time: "19:00",
      end_time: "07:00",
      grace_minutes: 0,
      base_work_hours: 8,
    };
    const result = computeEmployeeAttendance(
      [
        actionRow(1, {
          date: "2026-08-31",
          shift_snapshot: night,
          check_in_time: instant("2026-08-31T19:00:00"),
        }),
        actionRow(2, {
          date: "2026-08-31",
          shift_snapshot: night,
          check_out_time: instant("2026-09-01T07:00:00"),
        }),
      ],
      new Map<string, MonthlyShiftMap extends Map<string, infer V> ? V : never>([
        ["2026-8", night],
        ["2026-9", flexible],
      ]),
      "2026-08-31",
      "2026-09-01",
    );

    expect(result.days[0].workedHours).toBe(12);
    expect(result.days[1].workedHours).toBe(0);
  });

  it("does not project an unmatched flexible check-in into future days", () => {
    const result = computeEmployeeAttendance(
      [
        actionRow(1, {
          check_in_time: instant("2026-09-01T10:00:00"),
        }),
      ],
      new Map([["2026-9", flexible]]),
      "2026-09-01",
      "2026-09-03",
    );

    expect(result.days[0].status).toBe("غير مكتمل");
    expect(result.days[1].present).toBe(false);
    expect(result.days[2].present).toBe(false);
  });

  it("caps an orphaned check-in at its day even when the next check-in is later", () => {
    const result = computeEmployeeAttendance(
      [
        actionRow(1, {
          check_in_time: instant("2026-09-01T10:00:00"),
        }),
        actionRow(2, {
          date: "2026-09-05",
          check_in_time: instant("2026-09-05T08:00:00"),
        }),
        actionRow(3, {
          date: "2026-09-05",
          check_out_time: instant("2026-09-05T10:00:00"),
        }),
      ],
      new Map([["2026-9", flexible]]),
      "2026-09-01",
      "2026-09-05",
    );

    expect(result.days[0].status).toBe("غير مكتمل");
    expect(result.days[1].present).toBe(false);
    expect(result.days[2].present).toBe(false);
    expect(result.days[3].present).toBe(false);
    expect(result.days[4].workedHours).toBe(2);
  });

  it("does not deduct a night-session break from later flexible work", () => {
    const night: ShiftSnapshot = {
      name_ar: "ليلية",
      kind: "night",
      start_time: "19:00",
      end_time: "07:00",
      grace_minutes: 0,
      base_work_hours: 8,
    };
    const rows = [
      actionRow(1, {
        date: "2026-08-31",
        shift_snapshot: night,
        check_in_time: instant("2026-08-31T19:00:00"),
      }),
      {
        ...actionRow(2, {
          date: "2026-08-31",
          shift_snapshot: night,
        }),
        lunch_start_time: instant("2026-09-01T00:00:00"),
      },
      {
        ...actionRow(3, {
          date: "2026-08-31",
          shift_snapshot: night,
        }),
        lunch_end_time: instant("2026-09-01T01:00:00"),
      },
      actionRow(4, {
        date: "2026-08-31",
        shift_snapshot: night,
        check_out_time: instant("2026-09-01T07:00:00"),
      }),
      actionRow(5, {
        date: "2026-09-01",
        check_in_time: instant("2026-09-01T10:00:00"),
      }),
      actionRow(6, {
        date: "2026-09-01",
        check_out_time: instant("2026-09-01T12:00:00"),
      }),
    ];
    const result = computeEmployeeAttendance(
      rows,
      new Map<string, MonthlyShiftMap extends Map<string, infer V> ? V : never>([
        ["2026-8", night],
        ["2026-9", flexible],
      ]),
      "2026-09-01",
      "2026-09-01",
    );

    expect(result.days[0].workedHours).toBe(2);
  });

  it("splits withdrawal intervals across flexible calendar days", () => {
    const rows = [
      actionRow(1, {
        check_in_time: instant("2026-09-01T23:00:00"),
      }),
      actionRow(2, {
        check_out_time: instant("2026-09-02T02:00:00"),
      }),
    ];
    const result = computeEmployeeAttendance(
      rows,
      new Map([["2026-9", flexible]]),
      "2026-09-01",
      "2026-09-02",
      0,
      {
        withdrawalIntervals: [
          {
            start: instant("2026-09-01T23:30:00"),
            end: instant("2026-09-02T00:30:00"),
          },
        ],
      },
    );

    expect(result.days[0].workedHours).toBe(0.5);
    expect(result.days[0].withdrawnMinutes).toBe(30);
    expect(result.days[1].workedHours).toBe(1.5);
    expect(result.days[1].withdrawnMinutes).toBe(30);
  });
});