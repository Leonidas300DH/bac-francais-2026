import { describe, expect, it } from "vitest";
import { studyTexts } from "../data/studyTexts";
import { buildFigureIndex, filterFigureIndex, getFigureNameCounts } from "./figures";

describe("figure index helpers", () => {
  it("aggregates figures with their text and movement context", () => {
    const index = buildFigureIndex(studyTexts);

    expect(index.length).toBeGreaterThan(300);
    expect(new Set(index.map((entry) => entry.textSlug)).size).toBe(16);
    expect(index.find((entry) => entry.textSlug === "les-effares" && entry.name === "Champ lexical du froid")).toMatchObject({
      textTitle: "Les Effarés",
      author: "Arthur Rimbaud",
    });
  });

  it("counts and filters figure examples", () => {
    const index = buildFigureIndex(studyTexts);
    const counts = getFigureNameCounts(index);
    const metaphorCount = counts.find((item) => item.name === "Métaphore")?.count ?? 0;
    const filtered = filterFigureIndex(index, "pain", "all");

    expect(metaphorCount).toBeGreaterThan(0);
    expect(filtered.some((entry) => entry.textSlug === "les-effares")).toBe(true);
  });
});
