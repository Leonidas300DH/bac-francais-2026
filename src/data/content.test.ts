import { describe, expect, it } from "vitest";
import { studyTexts } from "./studyTexts";
import { validateStudyText } from "./validateStudyText";

describe("study content", () => {
  it("ships the 16 planned text slots", () => {
    expect(studyTexts).toHaveLength(16);
  });

  it("contains a complete ready page for Les Effarés", () => {
    const text = studyTexts.find((item) => item.slug === "les-effares");

    expect(text?.status).toBe("ready");
    expect(text?.lines).toHaveLength(36);
    expect(text?.movements).toHaveLength(3);
    expect(text?.quiz.length).toBeGreaterThanOrEqual(4);
  });

  it("validates every publishable text shape", () => {
    const errors = studyTexts.flatMap(validateStudyText);
    expect(errors).toEqual([]);
  });

  it("replaces every placeholder with a usable revision fiche", () => {
    for (const text of studyTexts) {
      expect(text.status).not.toBe("draft");
      expect(text.lines.length).toBeGreaterThanOrEqual(10);
      expect(text.movements).toHaveLength(3);
      expect(text.quiz.length).toBeGreaterThanOrEqual(4);
      expect(text.recap).not.toMatch(/à compléter/i);
    }
  });

  it("provides a short oral memory card for every text", () => {
    for (const text of studyTexts) {
      expect(text.memoryCard.problem).toBe(text.problematique);
      expect(text.memoryCard.plan).toHaveLength(3);
      expect(text.memoryCard.keyQuotes.length).toBeGreaterThanOrEqual(3);
      expect(text.memoryCard.finalSentence).toBe(text.recap);
      expect(text.memoryCard.traps.length).toBeGreaterThanOrEqual(2);
      expect(text.memoryCard.oralChecklist.length).toBeGreaterThanOrEqual(4);
    }
  });
});
