import { describe, expect, it } from "@jest/globals";
import { isActiveFilmMachine } from "../shared/film-machine";

describe("film machine eligibility", () => {
  it.each(["extruder", "Extruder", "film", "FILM"])(
    "accepts active SEC03 machines with type %s",
    (type) => {
      expect(isActiveFilmMachine({
        section_id: "SEC03",
        status: "active",
        type,
      })).toBe(true);
    },
  );

  it.each([
    { section_id: "SEC03", status: "down", type: "extruder" },
    { section_id: "SEC04", status: "active", type: "extruder" },
    { section_id: "SEC03", status: "active", type: "printer" },
    { section_id: "SEC03", status: "active", type: null },
  ])("rejects ineligible machines: %p", (machine) => {
    expect(isActiveFilmMachine(machine)).toBe(false);
  });
});