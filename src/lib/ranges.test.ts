import { describe, expect, it } from "vitest";
import { getHighlightedLineNumbers, isLineInRange } from "./ranges";

describe("line range highlighting", () => {
  it("returns every line number included in a valid range", () => {
    expect(getHighlightedLineNumbers(7, 10)).toEqual([7, 8, 9, 10]);
  });

  it("treats reversed ranges as empty instead of guessing", () => {
    expect(getHighlightedLineNumbers(10, 7)).toEqual([]);
  });

  it("checks whether a line belongs to a selected range", () => {
    expect(isLineInRange(12, { start: 11, end: 13 })).toBe(true);
    expect(isLineInRange(14, { start: 11, end: 13 })).toBe(false);
  });
});
