import type { LineRange } from "../types";

export function getHighlightedLineNumbers(start: number, end: number): number[] {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
    return [];
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function isLineInRange(line: number, range: LineRange | null): boolean {
  if (!range) return false;
  return line >= range.start && line <= range.end;
}

export function formatRange(range: LineRange): string {
  return range.start === range.end ? `Vers ${range.start}` : `Vers ${range.start}-${range.end}`;
}
