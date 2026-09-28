import { describe, expect, it } from "@jest/globals";
import { isActivePrintingMachine } from "../shared/printing-machine";

describe("printing machine eligibility", () => {
  it.each(["Printer", "printing", "printer", "PRINTING"])(
    "accepts active SEC04 machines with type %s",
    (type) => {
      expect(isActivePrintingMachine({
        section_id: "SEC04",
        status: "active",
        type,
      })).toBe(true);
    },
  );

  it.each([
    { section_id: "SEC04", status: "down", type: "printing" },
    { section_id: "SEC05", status: "active", type: "printing" },
    { section_id: "SEC04", status: "active", type: "cutting" },
    { section_id: "SEC04", status: "active", type: null },
  ])("rejects non-printers, inactive or wrong-section machines: %p", (machine) => {
    expect(isActivePrintingMachine(machine)).toBe(false);
  });
});