import type { StudyText } from "../types";

export function validateStudyText(text: StudyText): string[] {
  const errors: string[] = [];
  const prefix = `${text.slug}:`;

  if (!text.slug) errors.push(`${prefix} missing slug`);
  if (!text.title) errors.push(`${prefix} missing title`);
  if (!text.author) errors.push(`${prefix} missing author`);
  if (!text.sourceLabel) errors.push(`${prefix} missing sourceLabel`);
  if (!["draft", "review", "ready"].includes(text.status)) errors.push(`${prefix} invalid status`);
  if (!text.problematique) errors.push(`${prefix} missing problematique`);
  if (!text.recap) errors.push(`${prefix} missing recap`);
  if (text.lines.length === 0) errors.push(`${prefix} missing lines`);
  if (text.movements.length === 0) errors.push(`${prefix} missing movements`);
  if (text.quiz.length === 0) errors.push(`${prefix} missing quiz`);

  const lineNumbers = new Set(text.lines.map((line) => line.number));
  text.movements.forEach((movement) => {
    if (!lineNumbers.has(movement.range.start) || !lineNumbers.has(movement.range.end)) {
      errors.push(`${prefix} movement ${movement.id} points to missing lines`);
    }
    movement.sections.forEach((section) => {
      section.figures?.forEach((figure) => {
        if (!lineNumbers.has(figure.range.start) || !lineNumbers.has(figure.range.end)) {
          errors.push(`${prefix} figure ${figure.id} points to missing lines`);
        }
      });
    });
  });

  text.quiz.forEach((item) => {
    if (item.choices && !item.choices.includes(item.answer)) {
      errors.push(`${prefix} quiz ${item.id} answer is not in choices`);
    }
  });

  return errors;
}
