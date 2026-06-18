import type {
  Figure,
  FigureDefinition,
  MemoryCard,
  MemoryQuote,
  Movement,
  QuizItem,
  StudyLine,
  StudySection,
  StudyText,
  TextStatus,
} from "../types";
import { sourceTexts } from "./sourceLines";

const glossary: FigureDefinition[] = [
  { name: "Antithèse", definition: "Opposition forte entre deux idées ou deux images." },
  { name: "Anaphore", definition: "Répétition d'un même mot ou groupe de mots." },
  { name: "Champ lexical", definition: "Ensemble de mots liés à une même idée." },
  { name: "Comparaison", definition: "Rapprochement avec un outil comme comme, tel, pareil à." },
  { name: "Métaphore", definition: "Image qui rapproche deux réalités sans outil de comparaison." },
  { name: "Personnification", definition: "On donne une action ou une qualité humaine à une chose." },
  { name: "Énumération", definition: "Suite de mots ou groupes de mots qui produit un effet d'accumulation." },
  { name: "Question rhétorique", definition: "Question posée pour convaincre plutôt que pour obtenir une réponse." },
];

type TextInput = {
  slug: string;
  title: string;
  author: string;
  sourceLabel: string;
  status?: TextStatus;
  lines: StudyLine[];
  context: string;
  problematique: string;
  introduction?: StudySection[];
  movements: Movement[];
  conclusion?: StudySection[];
  recap: string;
  opening: string;
  quizFocus: string;
};

function figure(id: string, name: string, quote: string, explanation: string, start: number, end = start): Figure {
  return { id, name, quote, explanation, range: { start, end } };
}

function section(
  id: string,
  title: string,
  simple: string,
  memory: string | undefined,
  figures: Figure[],
  bullets?: string[],
): StudySection {
  return { id, title, simple, memory, figures, bullets };
}

function movement(
  id: string,
  title: string,
  start: number,
  end: number,
  keywords: string[],
  sections: StudySection[],
): Movement {
  return { id, title, range: { start, end }, keywords, sections };
}

function introSections(input: TextInput): StudySection[] {
  return [
    {
      id: "intro-contexte",
      title: "Contexte",
      simple: input.context,
    },
    {
      id: "intro-enjeu",
      title: "Enjeu du passage",
      simple: input.quizFocus,
    },
  ];
}

function conclusionSections(input: TextInput): StudySection[] {
  return [
    {
      id: "conclusion-bilan",
      title: "Bilan",
      simple: input.recap,
    },
    {
      id: "conclusion-ouverture",
      title: "Ouverture",
      simple: input.opening,
    },
  ];
}

function quiz(input: TextInput): QuizItem[] {
  const first = input.movements[0];
  const second = input.movements[1];
  const third = input.movements[2];
  const firstFigure = input.movements.flatMap((movementItem) =>
    movementItem.sections.flatMap((sectionItem) => sectionItem.figures ?? []),
  )[0];
  const secondFigure = input.movements.flatMap((movementItem) =>
    movementItem.sections.flatMap((sectionItem) => sectionItem.figures ?? []),
  )[1];
  const figureAnswer = firstFigure
    ? `${firstFigure.name} : ${firstFigure.quote} -> ${firstFigure.explanation}`
    : input.recap;
  return [
    {
      id: "q-enjeu",
      prompt: "Quel est l'enjeu principal de ce texte ?",
      answer: input.quizFocus,
      choices: [input.quizFocus, "Faire seulement un portrait décoratif.", "Raconter une anecdote sans portée."],
    },
    {
      id: "q-m1",
      prompt: `Que faut-il retenir du ${first.title.toLowerCase()} ?`,
      answer: first.keywords.join(" / "),
      choices: [first.keywords.join(" / "), second.keywords.join(" / "), third.keywords.join(" / ")],
    },
    {
      id: "q-procede",
      prompt: "Quel procédé précis peut servir d'appui dans ce texte ?",
      answer: figureAnswer,
      choices: [
        figureAnswer,
        secondFigure ? `${secondFigure.name} : ${secondFigure.quote}` : second.keywords.join(" / "),
        third.keywords.join(" / "),
      ],
    },
    {
      id: "q-recap",
      prompt: "Quel fil directeur faut-il mémoriser ?",
      answer: input.recap,
      choices: [input.recap, "Le texte n'a pas d'organisation.", "Il faut apprendre seulement les dates."],
    },
  ];
}

function normalizePlanTitle(title: string): string {
  return title.replace(/^[IVX]+\.\s*/, "").trim();
}

function keyQuotes(input: TextInput): MemoryQuote[] {
  const quotes = input.movements
    .map((item) => item.sections.flatMap((sectionItem) => sectionItem.figures ?? [])[0])
    .filter((item): item is Figure => Boolean(item))
    .map((item) => ({
      quote: item.quote,
      reason: `${item.name} : ${item.explanation}`,
      range: item.range,
    }));

  if (quotes.length >= 3) {
    return quotes.slice(0, 3);
  }

  const existingRanges = new Set(quotes.map((quoteItem) => quoteItem.range.start));
  const fallbackQuotes = input.movements
    .map((movementItem) => input.lines.find((line) => line.number === movementItem.range.start))
    .filter((line): line is StudyLine => {
      if (!line) return false;
      return !existingRanges.has(line.number);
    })
    .map((line) => ({
      quote: line.text,
      reason: "Point d'appui pour situer le mouvement dans le texte.",
      range: { start: line.number, end: line.number },
    }));

  return [...quotes, ...fallbackQuotes].slice(0, 3);
}

function memoryCard(input: TextInput): MemoryCard {
  return {
    hook: input.context,
    problem: input.problematique,
    plan: input.movements.map((item) => `${normalizePlanTitle(item.title)} : ${item.keywords.join(", ")}`),
    keyQuotes: keyQuotes(input),
    finalSentence: input.recap,
    traps: [
      `Enjeu : ${input.quizFocus}`,
      `Réponse : ${input.recap}`,
      `Ouverture : ${input.opening}`,
    ],
    oralChecklist: [
      `Contexte : ${input.context}`,
      ...input.movements.map((item, index) =>
        `${index + 1}. ${normalizePlanTitle(item.title)} : ${item.keywords.join(", ")}`,
      ),
      `Conclusion : ${input.recap}`,
    ],
  };
}

function makeText(input: TextInput): StudyText {
  return {
    slug: input.slug,
    title: input.title,
    author: input.author,
    sourceLabel: input.sourceLabel,
    status: input.status ?? "review",
    lines: input.lines,
    introduction: input.introduction ?? introSections(input),
    problematique: input.problematique,
    movements: input.movements,
    conclusion: input.conclusion ?? conclusionSections(input),
    glossary,
    recap: input.recap,
    memoryCard: memoryCard(input),
    quiz: quiz(input),
  };
}

const lesEffares = makeText({
  slug: "les-effares",
  title: "Les Effarés",
  author: "Arthur Rimbaud",
  sourceLabel: "Cahiers de Douai, 1870",
  status: "ready",
  lines: sourceTexts.lesEffares,
  context: "Au XIXe siècle, l'industrialisation et les inégalités sociales rendent particulièrement visible la misère urbaine. Rimbaud, encore adolescent, transforme ici une scène de rue en accusation poétique.",
  quizFocus: "Le poème montre cinq enfants affamés fascinés par une boulangerie, puis révèle que la chaleur, la lumière et le pain restent hors d'atteinte.",
  problematique: "Comment Rimbaud transforme-t-il la scène de cinq enfants regardant du pain en une dénonciation de leur misère ?",
  recap: "Rimbaud part d'un tableau hivernal pathétique, fait du pain un spectacle presque merveilleux, puis ramène brutalement les enfants à l'exclusion sociale.",
  opening: "On peut rapprocher ce texte de Victor Hugo, qui dénonce aussi la misère enfantine, notamment à travers les figures d'enfants pauvres dans Les Misérables.",
  introduction: [
    {
      id: "intro-contexte",
      title: "Le contexte",
      simple: "Au XIXe siècle, l'industrie progresse mais les inégalités sociales restent très fortes. Le poème s'inscrit dans cette sensibilité sociale : il place au premier plan des enfants pauvres, affamés, devant une boulangerie.",
    },
    {
      id: "intro-auteur-scene",
      title: "L'auteur et la scène présentée",
      simple: "Arthur Rimbaud écrit Les Effarés en 1870, alors qu'il est adolescent. Il ne raconte pas une action complexe : il observe cinq enfants qui regardent cuire et sortir le pain, sans pouvoir le manger.",
    },
    {
      id: "intro-forme-but",
      title: "La forme et l'enjeu du poème",
      simple: "Le poème est composé de douze tercets. Sa progression donne d'abord à voir la misère, puis la fascination sensorielle, avant une fin qui transforme la pitié en dénonciation.",
    },
    {
      id: "intro-plan",
      title: "Annonce du plan",
      simple: "L'analyse suit les trois mouvements du poème : la mise en place d'un décor froid et pathétique, le spectacle fascinant du pain, puis le retour dramatique à la réalité des enfants.",
      bullets: [
        "Vers 1 à 6 : le contexte et le portrait humilié des enfants.",
        "Vers 7 à 21 : la préparation du pain, spectacle chaud et sensoriel.",
        "Vers 22 à 36 : l'extase brève, puis la misère et l'abandon.",
      ],
    },
  ],
  movements: [
    movement("m1", "I. La mise en place du contexte et le portrait des enfants", 1, 6, ["froid", "contraste", "misère"], [
      section("m1a", "Un décor hivernal inquiétant", "Le poème s'ouvre sur un contraste violent : les enfants apparaissent noirs, dans la neige et la brume. Le lecteur entre immédiatement dans une scène de froid, de pauvreté et d'exclusion.", undefined, [
        figure("f1", "Antithèse", "Noirs dans la neige", "L'opposition entre le noir et le blanc rend visible la séparation des enfants avec le monde qui les entoure.", 1),
        figure("f2", "Champ lexical du froid", "neige / brume", "Le décor hivernal crée une atmosphère hostile et accentue la fragilité des enfants.", 1),
        figure("f3", "Mise en relief", "Noirs", "Le premier mot du poème isole les enfants et concentre le regard sur leur silhouette pauvre.", 1),
      ]),
      section("m1b", "L'opposition entre la rue et la boulangerie", "Le soupirail allumé introduit une lumière chaude, mais cette chaleur reste séparée des enfants. La boulangerie devient un espace de vie inaccessible.", undefined, [
        figure("f4", "Antithèse", "neige / soupirail qui s'allume", "Le froid extérieur s'oppose à la chaleur lumineuse de l'intérieur.", 1, 2),
        figure("f5", "Symbole", "le soupirail", "Cette ouverture basse laisse voir le pain mais marque aussi la frontière entre les enfants et la nourriture.", 2),
      ]),
      section("m1c", "Un portrait humiliant et pathétique des enfants", "Les enfants sont montrés à genoux, collés au sol, dans une posture de supplication. Rimbaud mêle le trivial et le pathétique pour rendre leur misère concrète.", undefined, [
        figure("f6", "Langage trivial", "Leurs culs en rond", "L'expression rabaisse les corps et refuse toute idéalisation de la pauvreté.", 3),
        figure("f7", "Incise exclamative", "- misère ! -", "Le commentaire interrompt le vers et impose au lecteur une réaction de pitié.", 4),
        figure("f8", "Enjambement", "A genoux, cinq petits / Regardent", "La syntaxe suspend le regard et insiste sur l'attente des enfants.", 4, 5),
        figure("f9", "Adjectifs valorisants", "lourd pain blond", "Le pain apparaît comme un objet riche, nourrissant et presque lumineux.", 6),
      ]),
    ]),
    movement("m2", "II. La préparation du pain, un spectacle fascinant", 7, 21, ["boulanger", "sensations", "désir"], [
      section("m2a", "Le boulanger observé par les enfants", "Les enfants ne voient d'abord qu'un geste : le bras du boulanger travaille la pâte. Le pain naît sous leurs yeux, mais celui qui le fabrique reste du côté de la force et de l'abondance.", undefined, [
        figure("f10", "Métonymie", "le fort bras blanc", "Le bras suffit à désigner le boulanger et met en valeur sa puissance physique.", 7),
        figure("f11", "Contraste", "fort / blanc", "La force et la blancheur du boulanger s'opposent implicitement aux enfants noirs, faibles et dehors.", 1, 7),
        figure("f12", "Connotation", "gras sourire", "L'adjectif suggère l'abondance du boulanger face à la faim des enfants.", 11),
      ]),
      section("m2b", "Tous les sens des enfants sont éveillés", "La scène mobilise la vue, l'ouïe, l'odorat et la sensation de chaleur. Comme les enfants ne peuvent pas manger, leur désir passe par la perception.", undefined, [
        figure("f13", "Anaphore", "Ils voient / Ils écoutent / Ils sont", "La répétition organise la fascination progressive des enfants.", 7, 13),
        figure("f14", "Accumulation sensorielle", "voient / écoutent / souffle", "Les verbes et sensations donnent au pain une présence presque totale.", 7, 14),
        figure("f15", "Comparaison", "Chaud comme un sein", "La chaleur du four évoque une protection maternelle et transforme le pain en promesse de réconfort.", 15),
        figure("f16", "Image maternelle", "souffle du soupirail rouge", "Le rouge et la chaleur associent la boulangerie à un lieu de vie.", 14, 15),
      ]),
      section("m2c", "Une fascination de plus en plus forte", "Le pain devient un spectacle vivant : il est façonné, il pétille, il chante et il parfume l'espace. Rimbaud donne au pain une force d'attraction presque magique.", undefined, [
        figure("f17", "Anaphore temporelle", "Et quand / Quand / Quand", "La répétition retarde l'instant attendu et amplifie le désir.", 16, 22),
        figure("f18", "Accumulation", "Façonné, pétillant et jaune", "Les adjectifs rendent le pain visible, chaud et appétissant.", 17),
        figure("f19", "Personnification", "Chantent les croûtes", "Les croûtes semblent vivantes, comme si le pain avait sa propre voix.", 20),
        figure("f20", "Synesthésie", "Chantent les croûtes parfumées", "L'ouïe et l'odorat se mêlent pour traduire l'intensité de la fascination.", 20),
      ]),
    ]),
    movement("m3", "III. L'impact dramatique du spectacle sur les enfants", 22, 36, ["bonheur bref", "réalité", "abandon"], [
      section("m3a", "Une extase très courte", "Au contact imaginaire de la chaleur, les enfants semblent reprendre vie. Mais cette extase ne dure pas : les haillons rappellent aussitôt leur pauvreté.", undefined, [
        figure("f21", "Métaphore", "ce trou chaud souffle la vie", "Le soupirail donne l'impression de transmettre une énergie vitale.", 22),
        figure("f22", "Personnification", "ce trou chaud souffle", "L'ouverture devient presque un être vivant qui respire.", 22),
        figure("f23", "Contraste", "âme si ravie / haillons", "L'élan intérieur des enfants s'oppose à la réalité matérielle de leurs vêtements pauvres.", 23, 24),
      ]),
      section("m3b", "Le retour brutal à la misère", "Le poème revient aux corps gelés et au grillage. Les enfants sont proches du pain, mais la séparation demeure infranchissable.", undefined, [
        figure("f24", "Exclamation pathétique", "Les pauvres petits pleins de givre !", "L'exclamation insiste sur la pitié et sur la souffrance physique.", 26),
        figure("f25", "Animalisation", "leurs petits museaux roses", "Les enfants sont comparés à de petits animaux collés à une grille.", 28),
        figure("f26", "Termes affectifs", "pauvres petits / petits museaux roses", "Le vocabulaire attendrit le lecteur tout en soulignant leur vulnérabilité.", 26, 28),
        figure("f27", "Symbole", "le grillage", "La grille matérialise l'exclusion sociale : le pain est visible, mais inaccessible.", 29, 30),
      ]),
      section("m3c", "Une prière sans réponse et une fin tragique", "Le chant des enfants devient une prière, mais personne ne répond. La fin au vent d'hiver laisse les enfants dans la même misère qu'au début.", undefined, [
        figure("f28", "Comparaison", "comme une prière", "Le chant est assimilé à une supplication religieuse.", 31),
        figure("f29", "Métaphore religieuse", "cette lumière / Du ciel rouvert", "La boulangerie prend une dimension céleste, comme un paradis brièvement entrevu.", 32, 33),
        figure("f30", "Hyperbole", "qu'ils crèvent leur culotte", "L'intensité du geste montre le désir désespéré des enfants.", 34),
        figure("f31", "Points de suspension", "Au vent d'hiver...", "La suspension finale prolonge l'abandon et laisse la misère sans résolution.", 36),
      ]),
    ]),
  ],
  conclusion: [
    {
      id: "conclusion-bilan",
      title: "Bilan",
      simple: "Rimbaud montre cinq enfants affamés devant une boulangerie. Le décor froid crée la pitié, le pain devient un spectacle vivant et presque maternel, puis la fin rappelle que les enfants restent dehors, séparés de la nourriture par le grillage.",
      bullets: [
        "Le contraste entre froid extérieur et chaleur intérieure organise tout le poème.",
        "Les sensations donnent au pain une présence fascinante, sans jamais satisfaire la faim.",
        "La fin transforme la scène en dénonciation sociale : les enfants espèrent, mais restent abandonnés.",
      ],
    },
    {
      id: "conclusion-ouverture",
      title: "Ouverture",
      simple: "Cette dénonciation de la misère enfantine peut être rapprochée de Victor Hugo dans Les Misérables, où les enfants pauvres deviennent eux aussi des figures pathétiques et accusatrices.",
    },
  ],
});

const texts: StudyText[] = [
  lesEffares,
  makeText({
    slug: "le-mal",
    title: "Le Mal",
    author: "Arthur Rimbaud",
    sourceLabel: "Cahiers de Douai, 1870",
    lines: sourceTexts.leMal,
    context: "Rimbaud dénonce la guerre et l'hypocrisie religieuse dans un sonnet très violent.",
    quizFocus: "Le poème oppose la beauté du monde à l'horreur de la guerre et à l'indifférence de Dieu.",
    problematique: "Comment Rimbaud fait-il du sonnet une dénonciation de la guerre et de l'hypocrisie ?",
    recap: "Le texte part du massacre, oppose la nature innocente, puis accuse un Dieu indifférent aux mères pauvres.",
    opening: "On peut le rapprocher de Prévert, qui montre aussi la guerre comme une absurdité sociale.",
    movements: [
      movement("m1", "I. La guerre comme massacre", 1, 6, ["violence", "couleurs", "mort"], [
        section("m1a", "Une scène de bataille brutale", "Les couleurs vives ne rendent pas la guerre belle : elles montrent le sang, le feu et la destruction.", "Ne pas oublier : le bleu du ciel rend le massacre encore plus choquant.", [
          figure("f1", "Métaphore", "crachats rouges de la mitraille", "La guerre devient sale, agressive et presque corporelle.", 1),
          figure("f2", "Hyperbole", "cent milliers d'hommes", "L'ampleur du massacre est rendue énorme.", 6),
        ]),
      ]),
      movement("m2", "II. La nature innocente", 7, 8, ["pitié", "nature", "innocence"], [
        section("m2a", "Un contraste pathétique", "La nature est joyeuse et sacrée, alors que les hommes meurent en masse.", "La nature souligne que ces morts auraient dû vivre.", [
          figure("f3", "Apostrophe", "Nature !", "Le poète s'adresse directement à la nature.", 8),
        ]),
      ]),
      movement("m3", "III. La critique de la religion", 9, 14, ["Dieu", "argent", "mères"], [
        section("m3a", "Un Dieu indifférent", "Dieu dort dans le luxe mais se réveille quand les mères pauvres donnent leur argent.", "La religion est accusée de profiter de la douleur.", [
          figure("f4", "Antithèse", "calices d'or / gros sou", "Le luxe de l'Église contraste avec la pauvreté des mères.", 10, 14),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "reve-pour-l-hiver",
    title: "Rêvé pour l'hiver",
    author: "Arthur Rimbaud",
    sourceLabel: "Cahiers de Douai, 1870",
    lines: sourceTexts.revePourLHiver,
    context: "Ce poème imagine une scène amoureuse simple et fantaisiste dans un wagon en hiver.",
    quizFocus: "Le poème transforme un trajet en train en rêve amoureux léger et intime.",
    problematique: "Comment Rimbaud crée-t-il une rêverie amoureuse à la fois tendre et ludique ?",
    recap: "Le poème installe un cocon, écarte le monde inquiétant, puis finit sur un jeu amoureux.",
    opening: "On peut le comparer à d'autres poèmes de jeunesse de Rimbaud où l'amour est rêve et liberté.",
    movements: [
      movement("m1", "I. Un cocon amoureux", 1, 5, ["intimité", "couleurs", "douceur"], [
        section("m1a", "Le wagon devient refuge", "Les couleurs et les coussins créent un petit espace protégé pour les amoureux.", "Le décor est simple : il sert surtout à créer de la tendresse.", [
          figure("f1", "Champ lexical", "wagon rose / coussins bleus", "Les couleurs rendent la scène douce et presque enfantine.", 2, 3),
        ]),
      ]),
      movement("m2", "II. Le dehors devient inquiétant", 6, 9, ["ombres", "démons", "protection"], [
        section("m2a", "Le rêve protège du monde", "Les ombres extérieures sont décrites comme monstrueuses. Le wagon protège de ces images.", "L'amour est un abri contre l'hiver et la peur.", [
          figure("f2", "Métaphore", "démons noirs et loups noirs", "Les ombres deviennent des créatures menaçantes.", 9),
        ]),
      ]),
      movement("m3", "III. Le baiser devient jeu", 10, 15, ["fantaisie", "baiser", "jeu"], [
        section("m3a", "Une fin malicieuse", "Le baiser est imaginé comme une petite bête qui court sur le cou.", "La sensualité reste légère et ludique.", [
          figure("f3", "Comparaison", "comme une folle araignée", "Le baiser devient une créature vive et amusante.", 11),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "familiale",
    title: "Familiale",
    author: "Jacques Prévert",
    sourceLabel: "Paroles, 1946",
    lines: sourceTexts.familiale,
    context: "Prévert écrit après les guerres mondiales et utilise une langue simple pour dénoncer l'absurdité sociale.",
    quizFocus: "Le poème montre que la guerre et les affaires deviennent des habitudes acceptées comme normales.",
    problematique: "Comment Prévert dénonce-t-il la banalisation de la guerre ?",
    recap: "La famille répète des gestes ordinaires, la guerre tue le fils, mais la société continue comme si tout était normal.",
    opening: "On peut le rapprocher de Rimbaud, Le Mal, qui dénonce aussi la violence guerrière.",
    movements: [
      movement("m1", "I. Une famille mécanique", 1, 9, ["répétition", "quotidien", "normalité"], [
        section("m1a", "Des rôles figés", "La mère tricote, le père fait des affaires, le fils fait la guerre. Chacun est enfermé dans un rôle.", "La répétition rend l'absurde visible.", [
          figure("f1", "Anaphore", "fait", "Le même verbe met sur le même plan tricot, affaires et guerre.", 1, 8),
        ]),
      ]),
      movement("m2", "II. Le fils n'a pas de pensée possible", 10, 18, ["vide", "mort", "destin"], [
        section("m2a", "Le fils disparaît", "Le fils ne trouve rien : il est pris dans la guerre avant même d'exister comme individu.", "La mort est racontée sans pathos, ce qui la rend plus choquante.", [
          figure("f2", "Négation", "rien absolument rien", "Le vide intérieur du fils est martelé.", 12),
        ]),
      ]),
      movement("m3", "III. La vie continue absurdement", 19, 24, ["cimetière", "cycle", "critique"], [
        section("m3a", "La société ne change pas", "Même après la mort, les parents trouvent cela naturel et le cycle reprend.", "Le poème accuse l'habitude qui empêche de s'indigner.", [
          figure("f3", "Énumération", "le tricot la guerre les affaires", "Les mots tournent en boucle comme un mécanisme.", 21, 23),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "portrait-de-raphael",
    title: "Portrait de Raphaël",
    author: "Honoré de Balzac",
    sourceLabel: "La Peau de chagrin, 1831",
    lines: sourceTexts.portraitRaphael,
    context: "Balzac présente Raphaël de Valentin au début du roman : un jeune homme déjà usé par le désir, l'étude et le désespoir.",
    quizFocus: "Le portrait fait de Raphaël un héros marqué par l'énergie dépensée et proche de la destruction.",
    problematique: "Comment ce portrait annonce-t-il la destruction de Raphaël ?",
    recap: "Le regard des joueurs révèle un corps malade, une âme blessée et une grandeur inquiétante.",
    opening: "On peut ouvrir sur le thème balzacien de l'énergie vitale qui se consume.",
    movements: [
      movement("m1", "I. Un visage mystérieux", 1, 5, ["portrait", "mystère", "souffrance"], [
        section("m1a", "Le corps parle avant le personnage", "Les joueurs lisent son visage comme un secret. Le portrait est presque médical.", "Le visage est une fiche d'identité morale.", [
          figure("f1", "Champ lexical", "pâleur / maladive / amer", "Les mots installent l'idée de maladie et de malheur.", 2, 4),
        ]),
      ]),
      movement("m2", "II. Les causes de la dégradation", 6, 10, ["débauche", "étude", "passion"], [
        section("m2a", "Plusieurs explications possibles", "Balzac hésite entre plaisir, science et maladie : Raphaël semble détruit par toutes les formes d'excès.", "Ce qui l'a abîmé, c'est l'énergie dépensée.", [
          figure("f2", "Question rhétorique", "Était-ce la débauche", "La question dramatise l'origine du mal.", 7),
        ]),
      ]),
      movement("m3", "III. Une grandeur sombre", 11, 13, ["démons", "respect", "misère"], [
        section("m3a", "Un prince du malheur", "Les joueurs reconnaissent en lui quelqu'un qui souffre plus qu'eux.", "Raphaël est pauvre, mais il garde une forme de majesté.", [
          figure("f3", "Comparaison", "comme lorsqu'un célèbre criminel", "La comparaison rend le personnage inquiétant et exceptionnel.", 11),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "chez-l-antiquaire",
    title: "Chez l'antiquaire",
    author: "Honoré de Balzac",
    sourceLabel: "La Peau de chagrin, 1831",
    lines: sourceTexts.antiquaire,
    context: "Raphaël découvre le talisman. L'antiquaire lui explique la loi dangereuse du désir.",
    quizFocus: "La scène oppose le désir de vivre intensément à la sagesse qui consiste à économiser son énergie.",
    problematique: "Comment l'antiquaire transforme-t-il le talisman en leçon de vie ?",
    recap: "La curiosité détourne Raphaël du suicide, puis le vieillard formule l'opposition VOULOIR / POUVOIR / SAVOIR.",
    opening: "On peut ouvrir sur le mythe de Faust : obtenir un pouvoir en échange de sa vie.",
    movements: [
      movement("m1", "I. Un objet dangereux attire Raphaël", 1, 6, ["mystère", "ironie", "fatalité"], [
        section("m1a", "La curiosité remplace le suicide", "Le regard ironique de l'antiquaire montre que Raphaël est déjà repris par le désir.", "Le talisman réveille l'envie de vivre.", [
          figure("f1", "Discours direct", "Est-ce une plaisanterie", "La question montre le trouble de Raphaël.", 3),
        ]),
      ]),
      movement("m2", "II. Le vieillard refuse l'expérience", 7, 12, ["prudence", "mort", "limite"], [
        section("m2a", "Essayer serait se détruire", "L'antiquaire compare l'essai à un saut mortel. Il présente le désir comme une force impossible à arrêter.", "Le savoir naît du refus de tout vouloir.", [
          figure("f2", "Question rhétorique", "Peut-on arrêter le cours de la vie ?", "La question impose l'évidence de la limite humaine.", 10),
        ]),
      ]),
      movement("m3", "III. La formule du roman", 13, 21, ["vouloir", "pouvoir", "savoir"], [
        section("m3a", "Une morale en trois verbes", "VOULOIR brûle, POUVOIR détruit, SAVOIR apaise. Toute l'oeuvre est résumée.", "À apprendre : Vouloir / Pouvoir / Savoir.", [
          figure("f3", "Antithèse", "brûle / détruit / calme", "Les verbes opposent dépense et maîtrise de l'énergie.", 21),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "mort-de-raphael",
    title: "La mort de Raphaël",
    author: "Honoré de Balzac",
    sourceLabel: "La Peau de chagrin, 1831",
    lines: sourceTexts.mortRaphael,
    context: "À la fin du roman, la Peau est presque réduite à rien : le désir amoureux précipite la mort de Raphaël.",
    quizFocus: "La scène montre que le désir, même amoureux, consume littéralement la vie du héros.",
    problematique: "Comment Balzac fait-il de cette scène amoureuse une scène de mort ?",
    recap: "La Peau minuscule annonce la fin, le désir explose, puis l'amour devient violence et mort.",
    opening: "On peut comparer cette fin à une tragédie : le héros est détruit par sa propre passion.",
    movements: [
      movement("m1", "I. La Peau annonce la mort", 1, 7, ["talisman", "adieu", "fragilité"], [
        section("m1a", "Un objet presque disparu", "La Peau est minuscule : elle matérialise ce qu'il reste de vie à Raphaël.", "Objet petit = vie presque finie.", [
          figure("f1", "Comparaison", "comme la feuille d'une pervenche", "La petitesse rend la mort visible.", 1),
        ]),
      ]),
      movement("m2", "II. Le désir renaît violemment", 8, 18, ["désir", "terreur", "fuite"], [
        section("m2a", "L'amour devient menace", "La beauté de Pauline réveille le désir de Raphaël et provoque la contraction de la Peau.", "Chez Balzac, désirer = perdre de la vie.", [
          figure("f2", "Exclamation", "Pauline, viens !", "Le cri montre l'urgence du désir.", 10),
        ]),
      ]),
      movement("m3", "III. Une fin tragique", 19, 29, ["râle", "violence", "cadavre"], [
        section("m3a", "Le désir se change en mort", "Raphaël ne parle plus : il râle, mord, puis devient cadavre. Pauline est brisée.", "La passion détruit les deux personnages.", [
          figure("f3", "Métaphore animale", "oiseau de proie", "Raphaël devient prédateur.", 24),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "l-oeuvre-zola",
    title: "L'Oeuvre",
    author: "Émile Zola",
    sourceLabel: "L'Oeuvre, 1886",
    lines: sourceTexts.zolaOeuvre,
    context: "Zola montre un artiste qui rêve du chef-d'oeuvre mais se heurte à son impuissance créatrice.",
    quizFocus: "L'extrait présente la création artistique comme une lutte douloureuse et jamais satisfaite.",
    problematique: "Comment Zola montre-t-il la souffrance de l'artiste face à l'oeuvre impossible ?",
    recap: "L'artiste doute, constate l'échec de ses toiles, puis survit grâce au mirage de l'oeuvre future.",
    opening: "On peut ouvrir sur Balzac : l'énergie créatrice peut autant élever que détruire.",
    movements: [
      movement("m1", "I. Le retour du doute", 1, 5, ["doute", "lutte", "impuissance"], [
        section("m1a", "Créer devient souffrir", "L'artiste veut être courageux, mais chaque toile le renvoie à son insuffisance.", "Le vrai sujet est l'écart entre rêve et résultat.", [
          figure("f1", "Champ lexical", "doutes / lutte / impuissance", "Les mots donnent une image douloureuse de la création.", 1, 4),
        ]),
      ]),
      movement("m2", "II. L'oeuvre résiste", 6, 12, ["obstacle", "correction", "paralysie"], [
        section("m2a", "L'artiste ne peut pas réparer", "Même quand certains morceaux sont beaux, l'ensemble échappe au peintre.", "Le détail réussi ne suffit pas à faire un chef-d'oeuvre.", [
          figure("f2", "Question rhétorique", "Alors pourquoi", "Les questions font entendre l'obsession de l'échec.", 7),
        ]),
      ]),
      movement("m3", "III. Le mirage de l'oeuvre future", 13, 19, ["rêve", "hâte", "illusion"], [
        section("m3a", "L'espoir permet de continuer", "L'artiste supporte l'échec présent parce qu'il imagine une oeuvre future parfaite.", "Le rêve sauve et torture en même temps.", [
          figure("f3", "Métaphore", "mirage", "L'oeuvre future attire mais reste inaccessible.", 19),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "pauvres-peuples-insenses",
    title: "Pauvres et misérables peuples insensés",
    author: "Étienne de La Boétie",
    sourceLabel: "Discours de la servitude volontaire, 1548",
    lines: sourceTexts.laboetiePeuples,
    context: "La Boétie s'adresse directement aux peuples pour leur montrer qu'ils participent eux-mêmes au pouvoir du tyran.",
    quizFocus: "Le discours veut réveiller le peuple : le tyran n'est fort que parce qu'on le soutient.",
    problematique: "Comment La Boétie pousse-t-il le peuple à refuser la servitude ?",
    recap: "Le peuple est accusé, le tyran est démystifié, puis la liberté apparaît comme un simple refus de servir.",
    opening: "On peut ouvrir sur Diderot, qui défend aussi la liberté contre la domination.",
    movements: [
      movement("m1", "I. Un réveil brutal du peuple", 1, 7, ["apostrophe", "accusation", "perte"], [
        section("m1a", "Le peuple est secoué", "Les insultes et exclamations cherchent à provoquer une prise de conscience.", "La Boétie ne console pas : il réveille.", [
          figure("f1", "Apostrophe", "Pauvres et misérables peuples", "L'adresse directe rend le discours vivant et agressif.", 1),
        ]),
      ]),
      movement("m2", "II. Le tyran est faible sans le peuple", 8, 15, ["questions", "complicité", "pouvoir"], [
        section("m2a", "Le pouvoir vient des dominés", "Les questions montrent que les yeux, mains et pieds du tyran viennent du peuple lui-même.", "Idée clé : le peuple fabrique la force du tyran.", [
          figure("f2", "Question rhétorique", "D'où a-t-il pris", "Les questions guident le raisonnement.", 8, 10),
        ]),
      ]),
      movement("m3", "III. La liberté tient à un refus", 16, 18, ["volonté", "liberté", "colosse"], [
        section("m3a", "Ne plus soutenir le tyran", "Il ne faut pas vaincre par la force : il suffit de ne plus servir.", "Phrase à retenir : Soyez résolus de ne plus servir.", [
          figure("f3", "Comparaison", "grand colosse", "Le tyran paraît immense mais s'effondre si sa base disparaît.", 18),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "les-ruses-du-tyran",
    title: "Les ruses du tyran",
    author: "Étienne de La Boétie",
    sourceLabel: "Discours de la servitude volontaire, 1548",
    lines: sourceTexts.laboetieRuses,
    context: "La Boétie explique comment le tyran détourne le peuple de la liberté par les distractions.",
    quizFocus: "Le tyran maintient l'obéissance en endormant le peuple par les plaisirs.",
    problematique: "Comment La Boétie dénonce-t-il les divertissements comme instruments de domination ?",
    recap: "L'exemple de Cyrus montre la ruse, puis les jeux deviennent des appâts qui habituent à servir.",
    opening: "On peut penser aux débats modernes sur les médias et les distractions politiques.",
    movements: [
      movement("m1", "I. L'exemple de Cyrus", 1, 7, ["exemple", "stratagème", "obéissance"], [
        section("m1a", "Une domination sans épée", "Cyrus calme la révolte non par la violence, mais par les loisirs obligatoires.", "La ruse est plus efficace que la force.", [
          figure("f1", "Exemple historique", "Cyrus fit aux Lydiens", "L'histoire donne une preuve concrète.", 1),
        ]),
      ]),
      movement("m2", "II. Une méthode générale", 8, 11, ["peuple", "naïveté", "servitude"], [
        section("m2a", "Le peuple se laisse tromper", "La Boétie généralise : les tyrans savent rendre les peuples naïfs.", "La servitude peut devenir agréable.", [
          figure("f2", "Comparaison", "oiseau / poisson", "Le peuple est assimilé à une proie facile.", 11),
        ]),
      ]),
      movement("m3", "III. Les loisirs comme pièges", 12, 15, ["spectacles", "appâts", "habitude"], [
        section("m3a", "Les divertissements endorment", "Les jeux et spectacles sont appelés appâts : ils font oublier la liberté.", "Le danger vient de ce qui semble agréable.", [
          figure("f3", "Métaphore", "appâts de la servitude", "Le plaisir devient un piège politique.", 12),
        ]),
      ]),
    ],
  }),
];

texts.push(
  makeText({
    slug: "satire-des-favoris",
    title: "La satire des favoris",
    author: "Étienne de La Boétie",
    sourceLabel: "Discours de la servitude volontaire, 1548",
    lines: sourceTexts.laboetieFavoris,
    context: "La Boétie explique que le tyran est soutenu par des favoris intéressés.",
    quizFocus: "La tyrannie fonctionne grâce à une chaîne de complices qui profitent du pouvoir.",
    problematique: "Comment La Boétie montre-t-il que la tyrannie repose sur des complicités ?",
    recap: "Les ambitieux se regroupent autour du tyran, partagent le butin et deviennent de petits tyrans.",
    opening: "On peut ouvrir sur les critiques modernes de la corruption et du clientélisme.",
    movements: [
      movement("m1", "I. Les profiteurs de la tyrannie", 1, 5, ["profit", "ambition", "avarice"], [
        section("m1a", "Le pouvoir attire les mauvais intérêts", "Ceux qui espèrent gagner quelque chose soutiennent le tyran.", "La tyrannie tient aussi parce qu'elle enrichit certains.", [
          figure("f1", "Métaphore médicale", "partie véreuse", "Le royaume malade attire ce qui est corrompu.", 2, 3),
        ]),
      ]),
      movement("m2", "II. Une bande organisée", 6, 10, ["voleurs", "hiérarchie", "butin"], [
        section("m2a", "Les favoris ressemblent à des brigands", "La comparaison avec les voleurs rend les courtisans moralement condamnables.", "La satire rabaisse les puissants.", [
          figure("f2", "Comparaison", "grands voleurs", "Les proches du tyran sont assimilés à des criminels.", 6),
        ]),
      ]),
      movement("m3", "III. Les sujets asservissent les sujets", 11, 13, ["système", "bois", "complicité"], [
        section("m3a", "La tyrannie vient de l'intérieur", "Le tyran utilise les sujets contre les sujets, comme un coin de bois fend le bois.", "Image clé : le pouvoir se nourrit du peuple lui-même.", [
          figure("f3", "Proverbe imagé", "les coins du bois même", "L'image résume le mécanisme de domination.", 13),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "discours-du-vieux-tahitien",
    title: "Le discours du vieux Tahitien",
    author: "Denis Diderot",
    sourceLabel: "Supplément au voyage de Bougainville, 1772",
    lines: sourceTexts.diderotTahitien,
    context: "Diderot donne la parole à un Tahitien qui accuse les Européens de voler, corrompre et asservir.",
    quizFocus: "Le discours inverse le regard colonial : le prétendu civilisé devient l'agresseur.",
    problematique: "Comment Diderot critique-t-il la colonisation à travers la voix du vieux Tahitien ?",
    recap: "Le Tahitien chasse Bougainville, oppose nature et propriété, puis affirme l'égalité des peuples.",
    opening: "On peut ouvrir sur Montaigne, qui remet aussi en question l'ethnocentrisme européen.",
    movements: [
      movement("m1", "I. Un rejet violent des Européens", 1, 7, ["accusation", "bonheur", "corruption"], [
        section("m1a", "Bougainville est traité en brigand", "Le vieux Tahitien inverse les rôles : les Européens ne sont pas héros mais voleurs.", "La force du texte vient de l'adresse directe.", [
          figure("f1", "Apostrophe", "chef des brigands", "L'expression attaque directement Bougainville.", 1),
        ]),
      ]),
      movement("m2", "II. La critique de la propriété", 8, 12, ["liberté", "terre", "possession"], [
        section("m2a", "La possession européenne est absurde", "Diderot montre l'absurdité de dire qu'un pays appartient à quelqu'un parce qu'il y a posé le pied.", "Le texte fait réfléchir au droit et à la force.", [
          figure("f2", "Question rhétorique", "et pourquoi ?", "La question démonte la logique coloniale.", 10),
        ]),
      ]),
      movement("m3", "III. L'égalité naturelle", 13, 16, ["fraternité", "nature", "droit"], [
        section("m3a", "Le colonisé est un frère", "Le Tahitien rappelle que tous sont enfants de la nature : aucun peuple n'a naturellement le droit d'asservir l'autre.", "Idée clé : la force ne crée pas le droit.", [
          figure("f3", "Antithèse", "Tu n'es pas esclave / tu veux nous asservir", "La contradiction européenne est dénoncée.", 13),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "blazius-arrive",
    title: "L'arrivée de maître Blazius",
    author: "Alfred de Musset",
    sourceLabel: "On ne badine pas avec l'amour, 1834",
    lines: sourceTexts.mussetBlazius,
    context: "La scène d'ouverture présente l'univers de la pièce sur un ton comique et villageois.",
    quizFocus: "L'ouverture mélange théâtre, récit et comique pour annoncer l'arrivée de Perdican.",
    problematique: "Comment Musset ouvre-t-il sa pièce de manière originale et comique ?",
    recap: "Le choeur présente Blazius, le rend ridicule, puis l'information sérieuse arrive par un personnage comique.",
    opening: "On peut ouvrir sur le rôle du choeur antique, réinventé ici de façon fantaisiste.",
    movements: [
      movement("m1", "I. Une entrée très théâtrale", 1, 4, ["choeur", "portrait", "comique"], [
        section("m1a", "Blazius est un personnage caricatural", "Le choeur décrit son corps, sa mule et son attitude avec humour.", "Le spectateur rit avant de connaître l'intrigue.", [
          figure("f1", "Comparaison", "Comme un poupon", "La comparaison ridiculise Blazius.", 3),
        ]),
      ]),
      movement("m2", "II. Une parole liée au vin", 5, 6, ["boire", "attente", "comique"], [
        section("m2a", "L'annonce est retardée", "Blazius veut boire avant de parler : cela crée une attente comique.", "Le messager n'est pas noble, il est gourmand.", [
          figure("f2", "Comique de caractère", "verre de vin frais", "Le personnage est défini par son appétit.", 5),
        ]),
      ]),
      movement("m3", "III. Perdican est annoncé", 7, 16, ["Perdican", "savoir", "ironie"], [
        section("m3a", "Un héros déjà moqué", "Perdican est brillant, mais le portrait insiste aussi sur son langage savant et excessif.", "La pièce se méfie des beaux discours.", [
          figure("f3", "Hyperbole", "un livre d'or", "L'image valorise et ironise sur Perdican.", 9),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "tirade-de-perdican",
    title: "La tirade de Perdican",
    author: "Alfred de Musset",
    sourceLabel: "On ne badine pas avec l'amour, 1834",
    lines: sourceTexts.mussetTiradeAmour,
    context: "Perdican répond à Camille et oppose les leçons du couvent à l'expérience réelle de l'amour.",
    quizFocus: "La tirade défend un amour imparfait mais vivant contre une existence protégée et factice.",
    problematique: "Comment Perdican transforme-t-il une dispute amoureuse en éloge de la vie ?",
    recap: "Il accuse les nonnes, généralise violemment sur les hommes et les femmes, puis sauve l'amour comme seule vérité.",
    opening: "On peut ouvrir sur le romantisme, qui valorise l'expérience intense même douloureuse.",
    movements: [
      movement("m1", "I. L'accusation du couvent", 1, 13, ["religion", "enfance", "coeur"], [
        section("m1a", "Perdican attaque l'éducation de Camille", "Il reproche aux nonnes d'avoir fabriqué sa peur de l'amour.", "Le coeur est opposé aux leçons apprises.", [
          figure("f1", "Personnification", "ton cœur a battu", "Le cœur devient plus vrai que le discours.", 9),
        ]),
      ]),
      movement("m2", "II. Une vision noire du monde", 14, 16, ["généralisation", "violence", "dégoût"], [
        section("m2a", "Un réquisitoire excessif", "Perdican accumule les défauts des hommes et des femmes : le monde paraît corrompu.", "L'excès prépare le retournement final.", [
          figure("f2", "Énumération", "menteurs, inconstants, faux", "L'accumulation donne une force oratoire.", 14),
        ]),
      ]),
      movement("m3", "III. L'amour sauve la vie", 17, 22, ["amour", "souffrance", "vérité"], [
        section("m3a", "Aimer vaut mieux que se protéger", "Même trompé et blessé, celui qui aime peut dire qu'il a vraiment vécu.", "Phrase clé : j'ai souffert, mais j'ai aimé.", [
          figure("f3", "Antithèse", "vécu / être factice", "L'amour oppose la vraie vie à l'existence artificielle.", 21),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "perdican-rosette",
    title: "Perdican et Rosette",
    author: "Alfred de Musset",
    sourceLabel: "On ne badine pas avec l'amour, 1834",
    lines: sourceTexts.mussetRosette,
    context: "Perdican parle à Rosette pour être entendu par Camille : le langage amoureux devient stratégie.",
    quizFocus: "La scène montre un jeu cruel : Perdican utilise Rosette pour atteindre Camille.",
    problematique: "Comment cette déclaration amoureuse devient-elle une manipulation ?",
    recap: "Perdican déclare son amour, transforme les objets en symboles, puis laisse Rosette répondre naïvement.",
    opening: "On peut ouvrir sur le titre de la pièce : on ne joue pas sans danger avec l'amour.",
    movements: [
      movement("m1", "I. Une déclaration destinée à Camille", 1, 5, ["double adresse", "Rosette", "Camille"], [
        section("m1a", "La parole est piégée", "Perdican semble parler à Rosette, mais l'indication précise qu'il veut être entendu par Camille.", "Toujours repérer à qui la parole est vraiment destinée.", [
          figure("f1", "Double énonciation", "de manière que Camille l'entende", "Le théâtre montre deux destinataires.", 1),
        ]),
      ]),
      movement("m2", "II. Les objets symbolisent la rupture", 6, 17, ["source", "bague", "image"], [
        section("m2a", "La bague effacée", "Perdican jette la bague de Camille dans l'eau : il met en scène une rupture.", "L'amour devient spectacle.", [
          figure("f2", "Symbole", "la bague dans l'eau", "La bague représente le lien avec Camille.", 9),
        ]),
      ]),
      movement("m3", "III. Rosette reste naïve", 18, 25, ["innocence", "décalage", "cruauté"], [
        section("m3a", "Une réponse simple face à un jeu complexe", "Rosette ne comprend pas totalement la stratégie et répond avec humilité.", "Le comique devient cruel.", [
          figure("f3", "Antithèse", "Monsieur le docteur / comme je pourrai", "La simplicité de Rosette contraste avec les grands discours.", 25),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "dom-juan-charlotte-mathurine",
    title: "Dom Juan, Charlotte et Mathurine",
    author: "Molière",
    sourceLabel: "Dom Juan, 1665",
    lines: sourceTexts.domJuanDeuxPaysannes,
    context: "Dom Juan a promis le mariage à deux paysannes et tente de les tromper toutes les deux en même temps.",
    quizFocus: "La scène révèle l'art de manipuler par la parole et le comique du double jeu.",
    problematique: "Comment Molière fait-il rire tout en dénonçant le mensonge de Dom Juan ?",
    recap: "Les deux femmes demandent la vérité, Dom Juan esquive, puis Sganarelle avertit de la menace.",
    opening: "On peut ouvrir sur les autres scènes de séduction de Dom Juan, toujours fondées sur la parole.",
    movements: [
      movement("m1", "I. Deux demandes de vérité", 1, 18, ["mariage", "rivalité", "vérité"], [
        section("m1a", "Les paysannes confrontent Dom Juan", "Charlotte et Mathurine veulent savoir laquelle dit vrai.", "Le comique naît de la situation impossible.", [
          figure("f1", "Répétition", "promis / donné parole", "Les deux questions se répondent et enferment Dom Juan.", 1, 3),
        ]),
      ]),
      movement("m2", "II. L'esquive brillante de Dom Juan", 19, 31, ["mensonge", "double jeu", "parole"], [
        section("m2a", "Dom Juan parle sans répondre", "Il produit un discours général et glisse des apartés contradictoires à chacune.", "Il maîtrise la parole pour éviter la vérité.", [
          figure("f2", "Aparté", "Bas, à Mathurine / Bas, à Charlotte", "Le public entend la duplicité du personnage.", 25, 30),
        ]),
      ]),
      movement("m3", "III. L'avertissement de Sganarelle", 32, 35, ["innocence", "danger", "morale"], [
        section("m3a", "Le rire devient critique", "Sganarelle rappelle que les deux femmes risquent leur malheur.", "Molière fait rire, mais il dénonce aussi.", [
          figure("f3", "Apostrophe", "pauvres filles", "Sganarelle prend pitié et moralise la scène.", 34),
        ]),
      ]),
    ],
  }),
);

export const studyTexts = texts;

export function findStudyText(slug: string | undefined): StudyText | undefined {
  return studyTexts.find((text) => text.slug === slug);
}
