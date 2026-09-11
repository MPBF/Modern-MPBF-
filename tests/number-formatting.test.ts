import { describe, expect, it } from "@jest/globals";

import {
  formatNumber,
  formatNumberWithCommas,
} from "../client/src/lib/formatNumber";
import { formatNumberAr } from "../shared/number-utils";

const formattingCases: Array<[string, number, string]> = [
  ["whole numbers do not show decimal zeroes", 12, "12"],
  ["trailing decimal zeroes are removed", 12.5, "12.5"],
  ["significant decimal places are preserved", 12.25, "12.25"],
  ["thousands separators are preserved", 1000, "1,000"],
];

describe("central number formatters", () => {
  describe.each([
    ["formatNumber", (value: number) => formatNumber(value, 2)],
    [
      "formatNumberWithCommas",
      (value: number) => formatNumberWithCommas(value, 2),
    ],
    ["formatNumberAr", (value: number) => formatNumberAr(value, 2)],
  ])("%s", (_name, formatter) => {
    it.each(formattingCases)("%s", (_caseName, value, expected) => {
      expect(formatter(value)).toBe(expected);
    });
  });
});