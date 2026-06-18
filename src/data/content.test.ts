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

  it("keeps the rich original analysis structure for Les Effarés", () => {
    const text = studyTexts.find((item) => item.slug === "les-effares");
    const movementSections = text?.movements.flatMap((movement) => movement.sections) ?? [];
    const figures = movementSections.flatMap((section) => section.figures ?? []);

    expect(text?.introduction.length).toBeGreaterThanOrEqual(4);
    expect(movementSections).toHaveLength(9);
    expect(figures.length).toBeGreaterThanOrEqual(25);
    expect(text?.conclusion.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps exact uploaded Rimbaud source wording for T1 to T3", () => {
    const expected = new Map([
      ["les-effares", { label: "Les Cahiers de Douai, 1893", fragment: "Au grand soupirail qui s’allume" }],
      ["le-mal", { label: "Les Cahiers de Douai, 1893", fragment: "Nature ! ô toi qui fis ces hommes saintement ! …" }],
      ["reve-pour-l-hiver", { label: "Les Cahiers de Douai, 1893", fragment: "Et tu me diras : « Cherche ! » en inclinant la tête" }],
    ]);

    for (const [slug, { label, fragment }] of expected) {
      const text = studyTexts.find((item) => item.slug === slug);
      expect(text?.sourceLabel).toBe(label);
      expect(text?.lines.map((line) => line.text).join(" ")).toContain(fragment);
    }
  });

  it("provides dense analysis for the first Rimbaud sequence", () => {
    const expectedMinimums = new Map([
      ["les-effares", { sections: 9, figures: 25 }],
      ["le-mal", { sections: 9, figures: 18 }],
      ["reve-pour-l-hiver", { sections: 9, figures: 18 }],
    ]);

    for (const [slug, minimums] of expectedMinimums) {
      const text = studyTexts.find((item) => item.slug === slug);
      const movementSections = text?.movements.flatMap((movement) => movement.sections) ?? [];
      const figures = movementSections.flatMap((section) => section.figures ?? []);

      expect(movementSections.length).toBeGreaterThanOrEqual(minimums.sections);
      expect(figures.length).toBeGreaterThanOrEqual(minimums.figures);
    }
  });

  it("keeps exact uploaded wording for T4 to T6", () => {
    const expectedFragments = new Map([
      ["familiale", "Et le père qu’est-ce qu’il fait le père ?"],
      ["portrait-de-raphael", "Au premier coup d’œil"],
      ["chez-l-antiquaire", "Vouloir nous brûle et Pouvoir nous détruit"],
    ]);

    for (const [slug, fragment] of expectedFragments) {
      const text = studyTexts.find((item) => item.slug === slug);
      expect(text?.lines.map((line) => line.text).join(" ")).toContain(fragment);
    }
  });

  it("provides dense analysis for the Prévert and Balzac sequence", () => {
    const expectedMinimums = new Map([
      ["familiale", { sections: 9, figures: 18 }],
      ["portrait-de-raphael", { sections: 9, figures: 20 }],
      ["chez-l-antiquaire", { sections: 9, figures: 20 }],
    ]);

    for (const [slug, minimums] of expectedMinimums) {
      const text = studyTexts.find((item) => item.slug === slug);
      const movementSections = text?.movements.flatMap((movement) => movement.sections) ?? [];
      const figures = movementSections.flatMap((section) => section.figures ?? []);

      expect(movementSections.length).toBeGreaterThanOrEqual(minimums.sections);
      expect(figures.length).toBeGreaterThanOrEqual(minimums.figures);
    }
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

  it("does not publish generic coaching comments as analysis content", () => {
    const allContent = JSON.stringify(studyTexts);

    expect(allContent).not.toMatch(/formule l'enjeu avec des mots simples/i);
    expect(allContent).not.toMatch(/pas avec une phrase trop savante/i);
    expect(allContent).not.toMatch(/Dire en une phrase/i);
    expect(allContent).not.toMatch(/Nommer le procédé, citer quelques mots/i);
    expect(allContent).not.toMatch(/À apprendre/i);
    expect(allContent).not.toMatch(/Phrase à retenir/i);
    expect(allContent).not.toMatch(/Il faut apprendre seulement/i);
  });

  it("keeps exact theater source wording for T13 to T16", () => {
    const expectedFragments = new Map([
      ["blazius-arrive", "l'écritoire au côté"],
      ["tirade-de-perdican", "le masque de plâtre que les nonnes t'ont plaqué sur les joues"],
      ["perdican-rosette", "l'eau qui s'était troublée reprend son équilibre"],
      ["dom-juan-charlotte-mathurine", "Vous voyez qu'al le soutient"],
    ]);

    for (const [slug, fragment] of expectedFragments) {
      const text = studyTexts.find((item) => item.slug === slug);
      expect(text?.lines.map((line) => line.text).join(" ")).toContain(fragment);
    }
  });

  it("keeps exact Balzac and Zola source wording for T5 to T8", () => {
    const expectedFragments = new Map([
      ["portrait-de-raphael", "une blessure profonde que sondait leur regard"],
      ["chez-l-antiquaire", "Entre ces deux termes de l'action humaine, il est une autre formule"],
      ["mort-de-raphael", "Les souvenirs des scènes caressantes et des joies délirantes de sa passion"],
      ["l-oeuvre-zola", "mensonge de tendresse et de pitié sans lequel la production serait impossible"],
    ]);

    for (const [slug, fragment] of expectedFragments) {
      const text = studyTexts.find((item) => item.slug === slug);
      expect(text?.lines.map((line) => line.text).join(" ")).toContain(fragment);
    }
  });
});
