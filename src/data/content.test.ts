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

  it("keeps exact uploaded punctuation for Les Effarés key lines", () => {
    const text = studyTexts.find((item) => item.slug === "les-effares");

    expect(text?.lines.find((line) => line.number === 18)?.text).toBe("On sort le pain,");
    expect(text?.lines.find((line) => line.number === 21)?.text).toBe("Et les grillons,");
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

  it("integrates the handwritten T2 oral plan", () => {
    const text = studyTexts.find((item) => item.slug === "le-mal");

    expect(text?.problematique).toBe(
      "Comment Rimbaud réussit-il à faire passer ce sonnet de la description de la guerre à une dénonciation de la religion ?",
    );
    expect(text?.introduction).toHaveLength(4);
    expect(text?.conclusion).toHaveLength(3);
    expect(text?.movements.map((movement) => movement.title)).toEqual([
      "I. Un massacre",
      "II. Une Nature aimante",
      "III. Indifférence et cupidité de Dieu",
    ]);
  });

  it("integrates the handwritten T3 oral notes", () => {
    const text = studyTexts.find((item) => item.slug === "reve-pour-l-hiver");

    expect(text?.problematique).toBe("Comment Rimbaud exprime-t-il dans ce poème son désir d'amour et de liberté ?");
    expect(text?.introduction).toHaveLength(4);
    expect(text?.conclusion).toHaveLength(3);
    expect(text?.movements.map((movement) => movement.title)).toEqual([
      "I. Naissance rêvée du confort et de l'intimité",
      "II. Un dehors inquiétant rejeté par l'imaginaire",
      "III. Les jeux amoureux",
    ]);
    expect(text?.conclusion.some((section) => section.simple.includes("Sensation"))).toBe(true);
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

  it("integrates the handwritten T4 oral plan", () => {
    const text = studyTexts.find((item) => item.slug === "familiale");

    expect(text?.problematique).toBe(
      "Comment Prévert met-il en avant l'absurdité de cette société passive et complice, incarnée par la famille ?",
    );
    expect(text?.introduction).toHaveLength(4);
    expect(text?.conclusion).toHaveLength(3);
    expect(text?.movements.map((movement) => movement.title)).toEqual([
      "I. Un poème déconcertant",
      "II. Une famille enfermée dans sa routine",
      "III. Une routine qui devient dénonciation",
    ]);
    expect(text?.conclusion.some((section) => section.simple.includes("Dormeur du val"))).toBe(true);
  });

  it("integrates the handwritten T5 and T6 oral plans", () => {
    const portrait = studyTexts.find((item) => item.slug === "portrait-de-raphael");
    const antiquaire = studyTexts.find((item) => item.slug === "chez-l-antiquaire");

    expect(portrait?.problematique).toBe(
      "En quoi ce portrait dépeint-il le drame intérieur qui déchire le personnage au long de l'oeuvre et préfigure son dénouement funeste ?",
    );
    expect(portrait?.introduction).toHaveLength(4);
    expect(portrait?.conclusion).toHaveLength(3);
    expect(portrait?.movements.map((movement) => movement.title)).toEqual([
      "I. Le portrait d'un personnage énigmatique",
      "II. Esquisse d'un portrait moral",
      "III. Un personnage condamné, victime d'une passion destructrice",
    ]);

    expect(antiquaire?.problematique).toBe(
      "Comment, à partir de cette rencontre étrange, Balzac parvient-il à exposer sa philosophie de la vie ?",
    );
    expect(antiquaire?.introduction).toHaveLength(4);
    expect(antiquaire?.conclusion).toHaveLength(3);
    expect(antiquaire?.movements.map((movement) => movement.title)).toEqual([
      "I. Une rencontre fantastique",
      "II. La prise de parole de l'antiquaire sur l'idée de sagesse",
      "III. La philosophie de la vie",
    ]);
    expect(antiquaire?.conclusion.some((section) => section.simple.includes("Raphaël ne fera pas le choix sage"))).toBe(true);
  });

  it("keeps uploaded sentence links for Balzac and argumentative prose", () => {
    const expectedFragments = [
      ["portrait-de-raphael", "mystère, ses jeunes traits"],
      ["portrait-de-raphael", "jeune tête, contractaient ces muscles"],
      ["pauvres-peuples-insenses", "n’a qu’un corps, et n’a pas d’autre avantage"],
      ["pauvres-peuples-insenses", "ne le soutenez plus, et vous le verrez"],
      ["les-ruses-du-tyran", "Cyrus fit aux Lydiens : après qu’il"],
      ["les-ruses-du-tyran", "ne se prenne mieux au piège, ni aucun poisson"],
      ["satire-des-favoris", "partie véreuse : pareillement"],
      ["discours-du-vieux-tahitien", "notre rive : nous sommes innocents"],
      ["discours-du-vieux-tahitien", "privilège avec nous ; et tu es venu"],
    ] as const;

    for (const [slug, fragment] of expectedFragments) {
      const text = studyTexts.find((item) => item.slug === slug);
      expect(text?.lines.map((line) => line.text).join(" ")).toContain(fragment);
    }
  });

  it("integrates the handwritten T10 oral notes into the Ruses du tyran fiche", () => {
    const text = studyTexts.find((item) => item.slug === "les-ruses-du-tyran");

    expect(text?.problematique).toBe(
      "Comment La Boétie montre-t-il que les tyrans utilisent le divertissement pour établir et maintenir leur domination ?",
    );
    expect(text?.introduction).toHaveLength(4);
    expect(text?.conclusion).toHaveLength(3);
    expect(text?.movements.map((movement) => movement.title)).toEqual([
      "I. L'exemple historique de Cyrus et des Lydiens",
      "II. La généralisation du procédé des tyrans",
      "III. L'abrutissement des peuples par le divertissement",
    ]);
  });

  it("integrates the handwritten T9 oral plan without forcing it into three movements", () => {
    const text = studyTexts.find((item) => item.slug === "pauvres-peuples-insenses");

    expect(text?.problematique).toBe(
      "De quelle façon La Boétie s'y prend-il pour tenter de faire prendre conscience aux peuples de ce caractère volontaire de leur servitude ?",
    );
    expect(text?.introduction).toHaveLength(4);
    expect(text?.movements.map((movement) => movement.title)).toEqual([
      "I. Dénonciation de la soumission du peuple",
      "II. La critique du pouvoir tyrannique",
      "III. L'accusation de complicité du peuple",
      "IV. L'appel à la prise de conscience et à l'action",
    ]);
    expect(text?.conclusion.some((section) => section.simple.includes("1984"))).toBe(true);
  });

  it("integrates the handwritten T11 and T12 oral plans", () => {
    const favoris = studyTexts.find((item) => item.slug === "satire-des-favoris");
    const tahitien = studyTexts.find((item) => item.slug === "discours-du-vieux-tahitien");

    expect(favoris?.problematique).toBe(
      "De quelle manière La Boétie multiplie-t-il les images pour dénoncer la part de responsabilité des sujets dans leur servitude ?",
    );
    expect(favoris?.introduction).toHaveLength(4);
    expect(favoris?.conclusion).toHaveLength(3);
    expect(favoris?.movements.map((movement) => movement.title)).toEqual([
      "I. La tyrannie contagieuse",
      "II. Le monde des pirates",
      "III. Les sujets s'asservissent eux-mêmes",
    ]);

    expect(tahitien?.problematique).toBe(
      "En quoi le discours du vieux Tahitien vise-t-il à persuader le lecteur que l'homme naturel est plus heureux et meilleur que l'homme civilisé ?",
    );
    expect(tahitien?.introduction).toHaveLength(4);
    expect(tahitien?.conclusion).toHaveLength(3);
    expect(tahitien?.movements.map((movement) => movement.title)).toEqual([
      "I. Le combat indigné du vieillard",
      "II. Le réquisitoire contre les valeurs européennes",
      "III. La revendication de l'égalité entre Tahitiens et Européens",
    ]);
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

  it("keeps exact uploaded wording for T7 and T8", () => {
    const expectedFragments = [
      ["mort-de-raphael", "fragile et petit comme la feuille d’une pervenche"],
      ["mort-de-raphael", "« Si je meurs, il vivra ! »"],
      ["mort-de-raphael", "nœud"],
      ["l-oeuvre-zola", "ses œuvres"],
      ["l-oeuvre-zola", "chef-d’œuvre"],
      ["l-oeuvre-zola", "l’œuvre rebelle"],
      ["l-oeuvre-zola", "damnés de l’art"],
    ] as const;

    for (const [slug, fragment] of expectedFragments) {
      const text = studyTexts.find((item) => item.slug === slug);
      expect(text?.lines.map((line) => line.text).join(" ")).toContain(fragment);
    }
  });

  it("provides dense analysis for the final Balzac and Zola sequence", () => {
    const expectedMinimums = new Map([
      ["mort-de-raphael", { sections: 9, figures: 30 }],
      ["l-oeuvre-zola", { sections: 9, figures: 30 }],
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
      expect(text.movements.length).toBeGreaterThanOrEqual(3);
      expect(text.movements.length).toBeLessThanOrEqual(4);
      expect(text.quiz.length).toBeGreaterThanOrEqual(4);
      expect(text.recap).not.toMatch(/à compléter/i);
    }
  });

  it("keeps three concrete subparts for every major movement", () => {
    for (const text of studyTexts) {
      for (const movement of text.movements) {
        expect(`${text.slug} - ${movement.title}`).toBeTruthy();
        expect(movement.sections).toHaveLength(3);
      }
    }
  });

  it("provides a short oral memory card for every text", () => {
    for (const text of studyTexts) {
      expect(text.memoryCard.problem).toBe(text.problematique);
      expect(text.memoryCard.plan).toHaveLength(text.movements.length);
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
    expect(allContent).not.toMatch(/En mots simples/i);
    expect(allContent).not.toMatch(/Toujours repérer/i);
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

  it("keeps restored theater source details for T13 to T16", () => {
    const expectedFragments = [
      ["blazius-arrive", "pareil à une amphore antique"],
      ["tirade-de-perdican", "lâches, méprisables et sensuels"],
      ["tirade-de-perdican", "C'est moi qui ai vécu, et non pas un être factice"],
      ["perdican-rosette", "de manière que Camille l'entende"],
      ["perdican-rosette", "le vent se tait ; la pluie du matin roule en perles"],
      ["dom-juan-charlotte-mathurine", "il faut faire et non pas dire"],
      ["dom-juan-charlotte-mathurine", "ne vous amusez point à tous les contes qu'on vous fait"],
    ] as const;

    for (const [slug, fragment] of expectedFragments) {
      const text = studyTexts.find((item) => item.slug === slug);
      expect(text?.lines.map((line) => line.text).join(" ")).toContain(fragment);
    }
  });

  it("provides dense analysis for the theater sequence", () => {
    const expectedMinimums = new Map([
      ["blazius-arrive", { sections: 8, figures: 24 }],
      ["tirade-de-perdican", { sections: 9, figures: 30 }],
      ["perdican-rosette", { sections: 9, figures: 30 }],
      ["dom-juan-charlotte-mathurine", { sections: 9, figures: 28 }],
    ]);

    for (const [slug, minimums] of expectedMinimums) {
      const text = studyTexts.find((item) => item.slug === slug);
      const movementSections = text?.movements.flatMap((movement) => movement.sections) ?? [];
      const figures = movementSections.flatMap((section) => section.figures ?? []);

      expect(movementSections.length).toBeGreaterThanOrEqual(minimums.sections);
      expect(figures.length).toBeGreaterThanOrEqual(minimums.figures);
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

  it("keeps exact argumentation source wording for T9 to T12", () => {
    const expectedFragments = [
      ["pauvres-peuples-insenses", "piller vos champs, voler et dépouiller vos maisons"],
      ["pauvres-peuples-insenses", "qu’il les conduise à la boucherie"],
      ["les-ruses-du-tyran", "les appâts de la servitude, le prix de leur liberté, les outils de la tyrannie"],
      ["les-ruses-du-tyran", "les images brillantes des livres enluminés"],
      ["satire-des-favoris", "les pirates ciliens s’assemblèrent en si grand nombre"],
      ["satire-des-favoris", "il faut les coins du bois même"],
      ["discours-du-vieux-tahitien", "le vol de toute une contrée"],
      ["discours-du-vieux-tahitien", "Nous avons respecté notre image en toi"],
    ] as const;

    for (const [slug, fragment] of expectedFragments) {
      const text = studyTexts.find((item) => item.slug === slug);
      expect(text?.lines.map((line) => line.text).join(" ")).toContain(fragment);
    }
  });

  it("provides dense analysis for the argumentation sequence", () => {
    const expectedMinimums = new Map([
      ["pauvres-peuples-insenses", { sections: 12, figures: 30 }],
      ["les-ruses-du-tyran", { sections: 8, figures: 25 }],
      ["satire-des-favoris", { sections: 8, figures: 25 }],
      ["discours-du-vieux-tahitien", { sections: 9, figures: 30 }],
    ]);

    for (const [slug, minimums] of expectedMinimums) {
      const text = studyTexts.find((item) => item.slug === slug);
      const movementSections = text?.movements.flatMap((movement) => movement.sections) ?? [];
      const figures = movementSections.flatMap((section) => section.figures ?? []);

      expect(movementSections.length).toBeGreaterThanOrEqual(minimums.sections);
      expect(figures.length).toBeGreaterThanOrEqual(minimums.figures);
    }
  });
});
