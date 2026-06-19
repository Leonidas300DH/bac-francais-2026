import type { FigureIndexEntry, StudyText } from "../types";

export function buildFigureIndex(texts: StudyText[]): FigureIndexEntry[] {
  return texts.flatMap((text) =>
    text.movements.flatMap((movement) =>
      movement.sections.flatMap((section) =>
        (section.figures ?? []).map((figure) => ({
          ...figure,
          textSlug: text.slug,
          textTitle: text.title,
          author: text.author,
          sourceLabel: text.sourceLabel,
          movementTitle: movement.title,
          sectionTitle: section.title,
        })),
      ),
    ),
  );
}

export function getFigureNameCounts(entries: FigureIndexEntry[]) {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    counts.set(entry.name, (counts.get(entry.name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));
}

export function filterFigureIndex(entries: FigureIndexEntry[], query: string, figureName: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return entries.filter((entry) => {
    const matchesName = figureName === "all" || entry.name === figureName;
    const haystack = [
      entry.name,
      entry.quote,
      entry.explanation,
      entry.textTitle,
      entry.author,
      entry.movementTitle,
      entry.sectionTitle,
    ]
      .join(" ")
      .toLowerCase();

    return matchesName && (!normalizedQuery || haystack.includes(normalizedQuery));
  });
}
