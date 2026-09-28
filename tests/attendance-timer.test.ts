import { describe, expect, it } from "@jest/globals";

import { calculateWorkedSeconds } from "../client/src/lib/attendance-timer";

const at = (value: string) => new Date(`${value}+03:00`);

describe("attendance live timer", () => {
  it("keeps counting after check-in when rows have created_at", () => {
    const checkIn = at("2026-09-01T07:00:00").toISOString();
    const records = [{
      id: 1,
      status: "حاضر",
      check_in_time: checkIn,
      created_at: checkIn,
    }];

    expect(calculateWorkedSeconds(records, at("2026-09-01T07:01:00"))).toBe(60);
    expect(calculateWorkedSeconds(records, at("2026-09-01T07:10:00"))).toBe(600);
  });

  it("pauses only during a real break and freezes after checkout with created_at rows", () => {
    const records = [
      {
        id: 1,
        status: "حاضر",
        check_in_time: at("2026-09-01T07:00:00").toISOString(),
        created_at: at("2026-09-01T07:00:00").toISOString(),
      },
      {
        id: 2,
        status: "في الاستراحة",
        lunch_start_time: at("2026-09-01T08:00:00").toISOString(),
        created_at: at("2026-09-01T08:00:00").toISOString(),
      },
      {
        id: 3,
        status: "يعمل",
        lunch_end_time: at("2026-09-01T08:15:00").toISOString(),
        created_at: at("2026-09-01T08:15:00").toISOString(),
      },
      {
        id: 4,
        status: "مغادر",
        check_out_time: at("2026-09-01T09:00:00").toISOString(),
        created_at: at("2026-09-01T09:00:00").toISOString(),
      },
    ];

    expect(calculateWorkedSeconds(records.slice(0, 2), at("2026-09-01T08:10:00"))).toBe(3600);
    expect(calculateWorkedSeconds(records.slice(0, 3), at("2026-09-01T08:30:00"))).toBe(75 * 60);
    expect(calculateWorkedSeconds(records, at("2026-09-01T10:00:00"))).toBe(105 * 60);
  });

  it("subtracts completed and active breaks", () => {
    const records = [
      { id: 1, status: "حاضر", check_in_time: at("2026-08-31T19:00:00").toISOString() },
      {
        id: 2,
        status: "في الاستراحة",
        lunch_start_time: at("2026-09-01T00:00:00").toISOString(),
      },
      {
        id: 3,
        status: "يعمل",
        lunch_end_time: at("2026-09-01T01:00:00").toISOString(),
      },
      {
        id: 4,
        status: "في الاستراحة",
        lunch_start_time: at("2026-09-01T02:00:00").toISOString(),
      },
    ];
    expect(calculateWorkedSeconds(records, at("2026-09-01T03:00:00"))).toBe(6 * 3600);
  });

  it("freezes at server checkout time", () => {
    const records = [
      { id: 1, status: "حاضر", check_in_time: at("2026-09-01T07:00:00").toISOString() },
      { id: 2, status: "مغادر", check_out_time: at("2026-09-01T15:00:00").toISOString() },
    ];
    expect(calculateWorkedSeconds(records, at("2026-09-01T18:00:00"))).toBe(8 * 3600);
  });

  it("subtracts withdrawals and clamps open withdrawals at checkout", () => {
    const records = [
      { id: 1, status: "حاضر", check_in_time: at("2026-09-01T07:00:00").toISOString() },
      { id: 2, status: "مغادر", check_out_time: at("2026-09-01T15:00:00").toISOString() },
    ];
    const withdrawals = [
      {
        started_at: at("2026-09-01T10:00:00").toISOString(),
        ended_at: at("2026-09-01T10:30:00").toISOString(),
      },
      {
        started_at: at("2026-09-01T14:30:00").toISOString(),
        ended_at: null,
      },
    ];
    expect(
      calculateWorkedSeconds(
        records,
        at("2026-09-01T18:00:00"),
        withdrawals,
      ),
    ).toBe(7 * 3600);
  });

  it("does not subtract overlapping break and withdrawal time twice", () => {
    const records = [
      { id: 1, status: "حاضر", check_in_time: at("2026-09-01T07:00:00").toISOString() },
      { id: 2, status: "في الاستراحة", lunch_start_time: at("2026-09-01T10:00:00").toISOString() },
      { id: 3, status: "يعمل", lunch_end_time: at("2026-09-01T11:00:00").toISOString() },
    ];
    const withdrawals = [{
      started_at: at("2026-09-01T10:30:00").toISOString(),
      ended_at: at("2026-09-01T11:30:00").toISOString(),
    }];
    expect(
      calculateWorkedSeconds(records, at("2026-09-01T12:00:00"), withdrawals),
    ).toBe(3.5 * 3600);
  });
});