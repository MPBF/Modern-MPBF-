import { describe, expect, it } from "@jest/globals";
import { hasInvalidOrdinaryFilmOverride } from "../server/lib/film-roll-policy";

describe("ordinary film roll creation policy", () => {
  it.each([{}, { stage: "film" }, { is_last_roll: false, stage: "film" }])(
    "accepts normal film input: %p",
    (body) => {
      expect(hasInvalidOrdinaryFilmOverride(body)).toBe(false);
    },
  );

  it.each([
    { is_last_roll: true },
    { is_last_roll: "true" },
    { stage: "printing" },
    { stage: "cutting" },
    { stage: "done" },
  ])("rejects final-roll or stage overrides on the ordinary path: %p", (body) => {
    expect(hasInvalidOrdinaryFilmOverride(body)).toBe(true);
  });
});