import { studyTexts } from "../data/studyTexts";
import type { GrammarCard } from "../types";

export function getGrammarText(card: GrammarCard) {
  return studyTexts.find((text) => text.slug === card.textSlug);
}

export function filterGrammarCards(cards: GrammarCard[], query: string, notion: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return cards.filter((card) => {
    const text = getGrammarText(card);
    const matchesNotion = notion === "all" || card.notion === notion;
    const haystack = [
      card.notion,
      card.question,
      card.excerpt,
      card.answer,
      card.reflex,
      text?.title ?? "",
      text?.author ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return matchesNotion && (!normalizedQuery || haystack.includes(normalizedQuery));
  });
}

export function getGrammarNotions(cards: GrammarCard[]) {
  return [...new Set(cards.map((card) => card.notion))].sort((a, b) => a.localeCompare(b, "fr"));
}

export function validateGrammarCards(cards: GrammarCard[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const card of cards) {
    if (seen.has(card.id)) errors.push(`${card.id}: duplicate grammar id`);
    seen.add(card.id);

    const text = getGrammarText(card);
    if (!text) {
      errors.push(`${card.id}: unknown text slug ${card.textSlug}`);
      continue;
    }

    const lineNumbers = new Set(text.lines.map((line) => line.number));
    if (!lineNumbers.has(card.range.start) || !lineNumbers.has(card.range.end)) {
      errors.push(`${card.id}: range points to missing lines`);
    }

    if (!card.notion || !card.question || !card.excerpt || !card.answer || !card.reflex) {
      errors.push(`${card.id}: incomplete grammar card`);
    }
  }

  return errors;
}
