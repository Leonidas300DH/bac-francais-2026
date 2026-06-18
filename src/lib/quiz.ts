import type { QuizItem } from "../types";

export type QuizScore = {
  correct: number;
  total: number;
  percent: number;
};

export function computeQuizScore(
  quiz: Pick<QuizItem, "id" | "answer">[],
  answers: Record<string, string>,
): QuizScore {
  const total = quiz.length;
  const correct = quiz.filter((item) => answers[item.id] === item.answer).length;

  return {
    correct,
    total,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
  };
}

export function updateFlashcardKnowledge(
  flashcards: Record<string, boolean>,
  id: string,
  known: boolean,
): Record<string, boolean> {
  return {
    ...flashcards,
    [id]: known,
  };
}
