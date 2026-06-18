import { describe, expect, it } from "vitest";
import { computeQuizScore, updateFlashcardKnowledge } from "./quiz";

describe("quiz helpers", () => {
  it("computes the score from selected answers", () => {
    expect(
      computeQuizScore(
        [
          { id: "q1", answer: "a" },
          { id: "q2", answer: "b" },
          { id: "q3", answer: "c" },
        ],
        { q1: "a", q2: "x", q3: "c" },
      ),
    ).toEqual({ correct: 2, total: 3, percent: 67 });
  });

  it("updates one flashcard while keeping the other cards", () => {
    expect(updateFlashcardKnowledge({ intro: true }, "figures", false)).toEqual({
      intro: true,
      figures: false,
    });
  });
});
