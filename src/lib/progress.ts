import type { TextProgress } from "../types";

const emptyProgress: TextProgress = {
  completedSections: {},
  quizAnswers: {},
  quizHistory: [],
  flashcards: {},
};

export function getProgressKey(slug: string): string {
  return `bac-francais-2026:${slug}`;
}

export function readProgress(slug: string): TextProgress {
  if (typeof window === "undefined") return emptyProgress;

  try {
    const stored = window.localStorage.getItem(getProgressKey(slug));
    return stored ? { ...emptyProgress, ...JSON.parse(stored) } : emptyProgress;
  } catch {
    return emptyProgress;
  }
}

export function writeProgress(slug: string, progress: TextProgress): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getProgressKey(slug), JSON.stringify(progress));
}

export function computeCompletionPercent(progress: TextProgress, sectionIds: string[]): number {
  if (sectionIds.length === 0) return 0;
  const done = sectionIds.filter((id) => progress.completedSections[id]).length;
  return Math.round((done / sectionIds.length) * 100);
}
