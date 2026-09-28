import { describe, expect, it } from "@jest/globals";
import { isActiveCuttingMachine } from "../shared/cutting-machine";

describe("cutting machine eligibility", () => {
  it.each(["Cutter", "cutting", "cutter", "CUTTING"])(
    "accepts active SEC05 machines with type %s",
    (type) => {
      expect(isActiveCuttingMachine({
        section_id: "SEC05",
        status: "active",
        type,
      })).toBe(true);
    },
  );

  it.each([
    { section_id: "SEC05", status: "down", type: "cutting" },
    { section_id: "SEC04", status: "active", type: "cutting" },
    { section_id: "SEC05", status: "active", type: "printing" },
    { section_id: "SEC05", status: "active", type: null },
  ])("rejects an inactive or non-cutting machine: %p", (machine) => {
    expect(isActiveCuttingMachine(machine)).toBe(false);
  });
});