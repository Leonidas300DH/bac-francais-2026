import { describe, expect, it } from "vitest";
import { grammarCards } from "../data/grammarCards";
import { filterGrammarCards, getGrammarNotions, validateGrammarCards } from "./grammar";

describe("grammar cards", () => {
  it("covers every planned text with a valid grammar question", () => {
    expect(grammarCards).toHaveLength(16);
    expect(new Set(grammarCards.map((card) => card.textSlug)).size).toBe(16);
    expect(validateGrammarCards(grammarCards)).toEqual([]);
  });

  it("filters cards by text, excerpt, and notion", () => {
    expect(getGrammarNotions(grammarCards)).toContain("Subordonnée relative");
    expect(filterGrammarCards(grammarCards, "débauche", "all")).toHaveLength(1);
    expect(filterGrammarCards(grammarCards, "", "Négation")[0]).toMatchObject({
      textSlug: "dom-juan-charlotte-mathurine",
    });
  });
});
