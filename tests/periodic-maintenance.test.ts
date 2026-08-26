import { describe, expect, it } from "@jest/globals";

import {
  createMaintenanceScheduleSchema,
  updateMaintenanceScheduleRunSchema,
} from "../shared/schema";

const validSchedule = {
  name: "Printer 01 periodic plan",
  section_id: "printing",
  start_date: "2026-08-26",
  next_due_date: "2027-08-26",
  frequency_months: 12,
  is_active: true,
  description: "Annual inspection",
  machine_ids: ["PRN-01"],
  items: [{ component_id: 4, action_type: "inspection" }],
};

describe("periodic maintenance validation", () => {
  it("accepts a per-machine schedule with a configurable interval", () => {
    const parsed = createMaintenanceScheduleSchema.parse(validSchedule);
    expect(parsed.machine_ids).toEqual(["PRN-01"]);
    expect(parsed.frequency_months).toBe(12);
  });

  it("rejects department templates that target multiple machines", () => {
    const parsed = createMaintenanceScheduleSchema.safeParse({
      ...validSchedule,
      machine_ids: ["PRN-01", "PRN-02"],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects empty periodic checklists", () => {
    const parsed = createMaintenanceScheduleSchema.safeParse({
      ...validSchedule,
      items: [],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid recurrence intervals", () => {
    expect(
      createMaintenanceScheduleSchema.safeParse({
        ...validSchedule,
        frequency_months: 0,
      }).success,
    ).toBe(false);
    expect(
      createMaintenanceScheduleSchema.safeParse({
        ...validSchedule,
        frequency_months: 61,
      }).success,
    ).toBe(false);
  });

  it("accepts an electronic checklist draft with historical item ids", () => {
    const parsed = updateMaintenanceScheduleRunSchema.parse({
      status: "in_progress",
      report_notes: "Bearing needs follow-up",
      items: [
        {
          id: 21,
          checked: true,
          condition: "attention",
          result: "pass",
          notes: "Recheck next week",
        },
      ],
    });
    expect(parsed.items[0].id).toBe(21);
    expect(parsed.status).toBe("in_progress");
  });

  it("rejects unsupported checklist status and result values", () => {
    expect(
      updateMaintenanceScheduleRunSchema.safeParse({
        status: "failed",
        items: [{ id: 1, checked: true, result: "maybe" }],
      }).success,
    ).toBe(false);
  });
});