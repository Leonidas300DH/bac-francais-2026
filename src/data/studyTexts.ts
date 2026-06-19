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
      prompt: `Quel est le noyau du ${first.title.toLowerCase()} ?`,
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
      choices: [input.recap, "Le texte n'a pas d'organisation.", "Le texte se limite à une description sans enjeu."],
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
  sourceLabel: "Les Cahiers de Douai, 1893",
  status: "ready",
  lines: sourceTexts.lesEffares,
  context: "Au XIXe siècle, l'industrialisation et les inégalités sociales rendent particulièrement visible la misère urbaine. Rimbaud écrit Les Effarés le 20 septembre 1870 ; le poème sera publié plus tard dans Les Cahiers de Douai.",
  quizFocus: "Le poème montre cinq enfants affamés devant une boulangerie : le pain, la chaleur et la lumière leur donnent un instant d'extase, mais restent hors d'atteinte.",
  problematique: "Comment Rimbaud, à travers la description de ces enfants et du spectacle du pain, parvient-il à dénoncer l'horreur de leur situation ?",
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
      simple: "Arthur Rimbaud écrit Les Effarés le 20 septembre 1870, alors qu'il est adolescent. Il ne raconte pas une action complexe : il observe cinq enfants qui regardent cuire et sortir le pain, sans pouvoir le manger.",
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
    sourceLabel: "Les Cahiers de Douai, 1893",
    lines: sourceTexts.leMal,
    context: "Rimbaud écrit Le Mal pendant la guerre franco-prussienne. Le sonnet attaque à la fois la violence militaire, le pouvoir politique et une religion indifférente à la souffrance des pauvres.",
    quizFocus: "Le poème oppose l'horreur concrète du massacre à la beauté de la nature, puis accuse Dieu et l'Église de rester du côté du luxe et de l'argent.",
    problematique: "Comment Rimbaud transforme-t-il le sonnet en réquisitoire contre la guerre et l'hypocrisie religieuse ?",
    recap: "Rimbaud fait d'abord sentir la violence industrielle du massacre, oppose ensuite cette horreur à la nature innocente, puis termine par une satire de Dieu et de l'Église.",
    opening: "On peut le rapprocher de Familiale de Prévert, où la guerre est également dénoncée comme une mécanique sociale acceptée.",
    movements: [
      movement("m1", "I. La guerre comme massacre", 1, 6, ["violence", "couleurs", "mort"], [
        section("m1a", "Une violence sale et mécanique", "La guerre n'est pas héroïque : elle est associée à des crachats, à la mitraille et au sifflement des balles. Rimbaud donne au combat une matérialité répugnante.", undefined, [
          figure("f1", "Métaphore dévalorisante", "crachats rouges de la mitraille", "La mitraille devient un rejet sale et sanguinolent, ce qui détruit toute grandeur guerrière.", 1),
          figure("f2", "Allitération", "Sifflent tout le jour", "Le son en [s] imite le passage menaçant des projectiles.", 2),
        ]),
        section("m1b", "Un contraste entre beauté et horreur", "Le ciel bleu et les couleurs éclatantes pourraient composer un tableau lumineux, mais ils encadrent en réalité la mort des soldats.", undefined, [
          figure("f3", "Antithèse", "ciel bleu / crachats rouges", "La beauté du décor rend le massacre plus scandaleux.", 1, 2),
          figure("f4", "Couleurs violentes", "écarlates ou verts", "Les couleurs des uniformes et du sang donnent au champ de bataille une violence visuelle.", 3),
        ]),
        section("m1c", "Une destruction de masse", "Les soldats ne sont plus des individus : ils s'effondrent en bataillons et deviennent un tas fumant. Le poème dénonce la guerre comme une machine à broyer les corps.", undefined, [
          figure("f5", "Hyperbole", "cent milliers d’hommes", "L'exagération fait sentir l'ampleur collective du massacre.", 6),
          figure("f6", "Métaphore", "une folie épouvantable broie", "La guerre devient une force folle qui écrase les hommes.", 5),
          figure("f7", "Image déshumanisante", "un tas fumant", "Les soldats sont réduits à une matière indistincte, presque à des déchets.", 6),
        ]),
      ]),
      movement("m2", "II. La nature innocente", 7, 8, ["pitié", "nature", "innocence"], [
        section("m2a", "Une plainte pour les morts", "Le tiret ouvre une parenthèse pathétique : Rimbaud interrompt la description du massacre pour plaindre les soldats morts.", undefined, [
          figure("f8", "Exclamation pathétique", "Pauvres morts !", "L'exclamation fait entendre la compassion du poète.", 7),
          figure("f9", "Rupture syntaxique", "- Pauvres morts !", "Le tiret coupe l'élan de la phrase et fait surgir l'émotion.", 7),
        ]),
        section("m2b", "Une nature opposée à la guerre", "L'été, l'herbe et la joie composent un monde vivant, incompatible avec la destruction militaire.", undefined, [
          figure("f10", "Champ lexical de la vie", "été / herbe / joie", "Ces mots rappellent ce que la guerre détruit : la vie, la jeunesse et la beauté du monde.", 7),
          figure("f11", "Antithèse", "morts / joie", "La présence de la joie rend la mort des soldats plus injuste.", 7),
        ]),
        section("m2c", "Une nature presque sacrée", "Rimbaud s'adresse à la nature comme à une puissance créatrice. Elle apparaît plus respectable que les autorités humaines et religieuses dénoncées ensuite.", undefined, [
          figure("f12", "Apostrophe", "Nature !", "Le poète interpelle directement la nature et lui donne une place centrale.", 8),
          figure("f13", "Adverbe religieux", "saintement", "La nature est associée au sacré, contrairement à l'Église critiquée dans le dernier mouvement.", 8),
        ]),
      ]),
      movement("m3", "III. La critique de la religion", 9, 14, ["Dieu", "argent", "mères"], [
        section("m3a", "Un Dieu scandaleusement humain", "Dieu rit, dort et se réveille : Rimbaud le rabaisse en lui prêtant des comportements humains, mais ces gestes révèlent surtout son indifférence.", undefined, [
          figure("f14", "Personnification satirique", "un Dieu, qui rit", "Dieu est présenté comme un spectateur moqueur au lieu d'être compatissant.", 9),
          figure("f15", "Personnification", "s’endort / se réveille", "Le sommeil de Dieu symbolise son indifférence au massacre.", 11, 12),
        ]),
        section("m3b", "Le luxe religieux dénoncé", "Les objets du culte sont précieux et abondants. Rimbaud associe la religion institutionnelle au confort matériel.", undefined, [
          figure("f16", "Accumulation", "nappes damassées / encens / calices d’or", "La liste insiste sur le luxe des autels.", 9, 10),
          figure("f17", "Champ lexical religieux", "autels / encens / calices / hosannah", "Le vocabulaire sacré est utilisé pour dénoncer une religion devenue décor et richesse.", 10, 11),
        ]),
        section("m3c", "Les mères pauvres exploitées", "La fin du sonnet oppose les mères endeuillées et pauvres au luxe des autels. Dieu ne se réveille que lorsqu'elles donnent leur argent.", undefined, [
          figure("f18", "Antithèse sociale", "calices d’or / gros sou", "L'or de l'Église contraste avec la maigre offrande des mères.", 10, 14),
          figure("f19", "Groupe pathétique", "des mères, ramassées / Dans l’angoisse", "Les mères sont montrées comme brisées par la douleur.", 12, 13),
          figure("f20", "Chute accusatrice", "Lui donnent un gros sou", "Le dernier vers révèle la cible de la satire : une religion qui reçoit l'argent des pauvres.", 14),
        ]),
      ]),
    ],
  }),
  makeText({
    slug: "reve-pour-l-hiver",
    title: "Rêvé pour l'hiver",
    author: "Arthur Rimbaud",
    sourceLabel: "Les Cahiers de Douai, 1893",
    lines: sourceTexts.revePourLHiver,
    context: "Rimbaud écrit ce poème de jeunesse sous la forme d'une adresse amoureuse. Le train devient un espace imaginaire où l'hiver, la peur et le dehors sont tenus à distance.",
    quizFocus: "Le poème transforme un voyage en train en scène amoureuse intime : le wagon protège, le dehors devient inquiétant, puis le baiser apporte une fantaisie sensuelle.",
    problematique: "Comment Rimbaud construit-il une rêverie amoureuse à la fois protectrice, inquiétante et ludique ?",
    recap: "Rimbaud installe d'abord un cocon tendre, oppose ensuite ce refuge aux monstres du dehors, puis termine sur une scène de baiser à la fois sensuelle et joueuse.",
    opening: "On peut le comparer à d'autres poèmes de jeunesse de Rimbaud où l'amour est rêve et liberté.",
    movements: [
      movement("m1", "I. Un cocon amoureux", 1, 5, ["intimité", "couleurs", "douceur"], [
        section("m1a", "Une dédicace intime", "Le poème commence comme une confidence adressée à une femme. Le titre et la formule initiale installent une rêverie personnelle plus qu'un récit réaliste.", undefined, [
          figure("f1", "Dédicace", "À… Elle.", "L'adresse crée un destinataire mystérieux et intime.", 1),
          figure("f2", "Futur de projection", "nous irons", "Le futur ouvre un scénario imaginé, pas encore vécu.", 2),
        ]),
        section("m1b", "Un décor doux et coloré", "Le wagon n'est pas seulement un moyen de transport : il devient une petite chambre mobile, protégée par des couleurs tendres.", undefined, [
          figure("f3", "Champ lexical du confort", "wagon rose / coussins bleus / moelleux", "Les détails transforment le train en abri sensuel.", 2, 5),
          figure("f4", "Couleurs tendres", "rose / bleus", "Les couleurs adoucissent l'hiver annoncé par le premier mot du vers 2.", 2, 3),
        ]),
        section("m1c", "Un espace amoureux fermé", "Le pronom nous domine le début du poème. Le couple existe dans un intérieur réduit, comme séparé du reste du monde.", undefined, [
          figure("f5", "Pronom personnel", "nous", "Le pronom construit l'intimité du couple.", 2, 4),
          figure("f6", "Métaphore", "Un nid de baisers fous", "Le wagon devient un nid, donc un lieu de chaleur, de protection et de désir.", 4),
        ]),
      ]),
      movement("m2", "II. Le dehors devient inquiétant", 6, 9, ["ombres", "démons", "protection"], [
        section("m2a", "Fermer les yeux au monde extérieur", "Le poète demande à la destinataire de fermer l'œil : l'amour repose sur une mise à distance du réel.", undefined, [
          figure("f7", "Impératif futurisé", "Tu fermeras l’œil", "Le geste protège la rêverie amoureuse.", 6),
          figure("f8", "Négation", "pour ne point voir", "La négation rejette explicitement le spectacle extérieur.", 6),
        ]),
        section("m2b", "Un paysage de cauchemar", "Le dehors n'est pas décrit objectivement : il est transformé en théâtre d'ombres et de monstres.", undefined, [
          figure("f9", "Personnification", "Grimacer les ombres", "Les ombres prennent un visage hostile.", 7),
          figure("f10", "Lexique péjoratif", "monstruosités hargneuses", "Les mots donnent au paysage une agressivité presque fantastique.", 8),
        ]),
        section("m2c", "La menace du noir", "La répétition de noir concentre l'angoisse. Face au wagon rose et bleu, le dehors devient un monde hostile.", undefined, [
          figure("f11", "Répétition", "noirs / noirs", "La répétition insiste sur l'obscurité menaçante.", 9),
          figure("f12", "Métaphores animales et diaboliques", "démons noirs et loups noirs", "Les ombres sont assimilées à des créatures de peur.", 9),
        ]),
      ]),
      movement("m3", "III. Le baiser devient jeu", 10, 15, ["fantaisie", "baiser", "jeu"], [
        section("m3a", "Une sensualité surprise", "Le baiser surgit comme une sensation physique inattendue. L'égratignure légère rend la scène plus vive que sentimentale.", undefined, [
          figure("f13", "Passif sensoriel", "tu te sentiras la joue égratignée", "La destinataire ressent le baiser avant de le comprendre.", 10),
          figure("f14", "Diminutif affectif", "Un petit baiser", "Le désir reste léger, tendre et joueur.", 11),
        ]),
        section("m3b", "Le baiser transformé en créature", "Rimbaud donne au baiser une vie propre : il court, se cache et devient une petite bête à chercher.", undefined, [
          figure("f15", "Comparaison", "comme une folle araignée", "Le baiser devient une créature rapide, étrange et amusante.", 11),
          figure("f16", "Personnification", "Te courra par le cou", "Le baiser agit comme un être vivant.", 12),
        ]),
        section("m3c", "Un jeu amoureux final", "La fin transforme la sensualité en jeu de poursuite. Les tirets ralentissent le rythme et prolongent le plaisir de chercher.", undefined, [
          figure("f17", "Discours direct", "Cherche !", "La parole de la destinataire introduit le jeu amoureux.", 13),
          figure("f18", "Suspension temporelle", "nous prendrons du temps", "Le couple savoure la durée du jeu.", 14),
          figure("f19", "Métaphore filée", "cette bête / Qui voyage beaucoup", "Le baiser-créature prolonge la fantaisie jusqu'au dernier vers.", 14, 15),
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
    context: "Dans Paroles, Prévert adopte une écriture volontairement orale et répétitive pour attaquer les évidences sociales. Familiale montre une famille ordinaire qui accepte la guerre et les affaires comme un ordre naturel.",
    quizFocus: "Le poème montre que la guerre, le travail domestique et les affaires sont traités comme des gestes équivalents, jusqu'à rendre la mort du fils presque banale.",
    problematique: "Comment Prévert utilise-t-il la répétition du quotidien pour dénoncer la banalisation de la guerre ?",
    recap: "Prévert enferme d'abord chaque membre de la famille dans un rôle mécanique, efface ensuite la pensée du fils, puis montre que la mort elle-même ne brise pas le cycle social.",
    opening: "On peut le rapprocher de Rimbaud, Le Mal, qui dénonce aussi la violence guerrière.",
    movements: [
      movement("m1", "I. Une famille mécanique", 1, 9, ["répétition", "quotidien", "normalité"], [
        section("m1a", "Des rôles distribués comme une évidence", "Le début associe immédiatement la mère, le fils et le père à une activité fixe. Aucun personnage n'est présenté par ses sentiments : chacun est réduit à une fonction.", undefined, [
          figure("f1", "Parallélisme", "La mère fait / Le fils fait", "La même structure grammaticale place tricot et guerre sur le même plan.", 1, 2),
          figure("f2", "Verbe banal", "fait", "Le verbe ordinaire banalise des réalités très différentes, de l'activité domestique à la guerre.", 1, 5),
        ]),
        section("m1b", "Une normalité inquiétante", "La mère puis le père trouvent la situation naturelle. L'horreur vient du fait que personne ne s'étonne de voir le fils faire la guerre.", undefined, [
          figure("f3", "Reprise insistante", "tout naturel", "La répétition signale une acceptation sociale absurde.", 3, 9),
          figure("f4", "Registre familier", "ça", "Le langage courant donne à la guerre une place banale dans la conversation.", 3),
        ]),
        section("m1c", "La guerre mise au même niveau que les affaires", "Le poème enchaîne le tricot, la guerre et les affaires sans hiérarchie. Cette égalité grammaticale dénonce une société qui traite la guerre comme une activité ordinaire.", undefined, [
          figure("f5", "Ellipse verbale", "Son fils la guerre / Lui des affaires", "La suppression du verbe accélère la mécanique des rôles.", 7, 8),
          figure("f6", "Question rhétorique", "qu’est-ce qu’il fait le père ?", "La fausse question relance le système sans vraiment l'interroger.", 4),
        ]),
      ]),
      movement("m2", "II. Le fils n'a pas de pensée possible", 10, 18, ["vide", "mort", "destin"], [
        section("m2a", "Le fils devient le centre vide du poème", "La répétition de son nom attire l'attention sur lui, mais quand la question porte sur ce qu'il pense ou trouve, la réponse est le vide.", undefined, [
          figure("f7", "Répétition", "Et le fils et le fils", "La répétition crée une attente autour du fils.", 10),
          figure("f8", "Question directe", "Qu’est-ce qu’il trouve le fils ?", "La question semble ouvrir un espace de pensée individuelle.", 11),
        ]),
        section("m2b", "Une intériorité niée", "Le fils ne trouve rien : le poème lui refuse une parole personnelle, comme si la guerre empêchait toute pensée propre.", undefined, [
          figure("f9", "Négation absolue", "rien absolument rien", "L'accumulation de la négation vide le personnage de toute perspective.", 12),
          figure("f10", "Répétition du nom", "le fils", "Le nom revient, mais sans construire une identité autonome.", 10, 13),
        ]),
        section("m2c", "Un destin social déjà tracé", "Le vers 13 rassemble toute la famille dans une seule phrase sans ponctuation forte. La suite annonce que le fils passera de la guerre aux affaires, comme son père.", undefined, [
          figure("f11", "Accumulation", "sa mère fait du tricot son père des affaires lui la guerre", "La phrase compacte enferme chacun dans son rôle.", 13),
          figure("f12", "Futur programmatique", "Il fera des affaires avec son père", "Le futur présente l'avenir du fils comme une reproduction du modèle paternel.", 15),
        ]),
      ]),
      movement("m3", "III. La vie continue absurdement", 19, 24, ["cimetière", "cycle", "critique"], [
        section("m3a", "La mort intégrée au mécanisme", "La mort du fils est énoncée brutalement, sans lyrisme. Le choc vient de la simplicité de la phrase et du contraste avec la continuation des autres activités.", undefined, [
          figure("f13", "Antithèse", "La guerre continue / Le fils est tué", "La guerre continue alors que le fils, lui, ne continue plus.", 16, 18),
          figure("f14", "Phrase brève", "Le fils est tué", "La sécheresse de la phrase rend la mort plus violente.", 18),
        ]),
        section("m3b", "Le cimetière accepté comme une étape ordinaire", "Les parents vont au cimetière et trouvent encore cela naturel. Prévert dénonce une société où même la mort du fils est absorbée par l'habitude.", undefined, [
          figure("f15", "Euphémisme narratif", "vont au cimetière", "Le déplacement remplace l'expression directe du deuil.", 19),
          figure("f16", "Reprise accusatrice", "Ils trouvent ça naturel", "La formule réapparaît après la mort et devient insupportable.", 20),
        ]),
        section("m3c", "Une boucle sociale sans issue", "Les derniers vers mélangent le tricot, la guerre et les affaires dans un ordre circulaire. La vie continue, mais cette vie contient désormais le cimetière.", undefined, [
          figure("f17", "Anaphore", "La vie continue la vie", "La répétition donne une impression de cycle automatique.", 21),
          figure("f18", "Énumération circulaire", "le tricot la guerre les affaires", "Les trois mots tournent comme les pièces d'un mécanisme social.", 21, 23),
          figure("f19", "Chute", "La vie avec le cimetière.", "Le dernier vers associe définitivement la vie sociale à la mort.", 24),
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
    context: "Au début de La Peau de chagrin, Raphaël de Valentin entre dans un lieu de jeu après avoir envisagé le suicide. Balzac le présente d'abord à travers le regard des joueurs, qui lisent sur son visage une histoire de souffrance.",
    quizFocus: "Le portrait transforme le visage de Raphaël en signe visible d'une énergie déjà consumée par la débauche, l'étude, la maladie et surtout la passion.",
    problematique: "Comment Balzac fait-il du portrait de Raphaël l'annonce d'une destruction intérieure ?",
    recap: "Balzac donne d'abord au visage de Raphaël une aura mystérieuse, multiplie ensuite les signes physiques de dégradation, puis fait reconnaître en lui une grandeur sombre par les joueurs.",
    opening: "On peut ouvrir sur le thème balzacien de l'énergie vitale qui se consume.",
    movements: [
      movement("m1", "I. Un visage mystérieux", 1, 5, ["portrait", "mystère", "souffrance"], [
        section("m1a", "Un portrait vu par les joueurs", "Raphaël n'est pas présenté directement par un narrateur neutre : ce sont les joueurs qui lisent son visage. Le personnage apparaît donc comme une énigme offerte au regard.", undefined, [
          figure("f1", "Focalisation collective", "les joueurs lurent", "Le regard du groupe transforme le visage en texte à déchiffrer.", 1),
          figure("f2", "Métaphore de la lecture", "lurent sur le visage", "Le visage devient un document où s'inscrit le passé du personnage.", 1),
        ]),
        section("m1b", "Un mystère inquiétant", "Dès la première phrase, le portrait associe jeunesse et horreur. Raphaël attire parce qu'il semble porter un secret grave.", undefined, [
          figure("f3", "Expression hyperbolique", "quelque horrible mystère", "L'adjectif horrible dramatise immédiatement le portrait.", 1),
          figure("f4", "Contraste", "jeunes traits / horrible mystère", "La jeunesse du personnage s'oppose à la gravité de ce qu'il porte.", 1, 2),
        ]),
        section("m1c", "Une beauté déjà abîmée", "La grâce de Raphaël reste présente, mais elle est brouillée par l'échec et le désespoir. Balzac construit un héros séduisant et détruit à la fois.", undefined, [
          figure("f5", "Oxymore discret", "grâce nébuleuse", "La beauté est associée au flou et à l'obscurcissement.", 2),
          figure("f6", "Accumulation", "efforts trahis, mille espérances trompées", "Les échecs répétés donnent une profondeur biographique au visage.", 2),
        ]),
      ]),
      movement("m2", "II. Les causes de la dégradation", 6, 10, ["débauche", "étude", "passion"], [
        section("m2a", "Une dégradation physique précise", "Le portrait devient presque médical : pâleur, cercle jaune, rougeur des joues. Le corps porte les marques d'une usure avancée.", undefined, [
          figure("f7", "Champ lexical médical", "pâleur / maladive / lésions", "Les termes donnent au portrait une dimension clinique.", 3, 7),
          figure("f8", "Détails corporels", "paupières / joues", "Balzac localise les signes du mal dans le visage.", 7),
        ]),
        section("m2b", "Plusieurs causes possibles", "Balzac fait hésiter l'interprétation : débauche, maladie, étude, génie. Raphaël semble avoir été abîmé par toutes les formes d'excès.", undefined, [
          figure("f9", "Question rhétorique", "Était-ce la débauche", "La question dramatise l'origine du mal sans la résoudre immédiatement.", 6),
          figure("f10", "Antithèse temporelle", "jadis pure et brûlante, maintenant dégradée", "Le portrait oppose la noblesse passée à la ruine présente.", 6),
          figure("f11", "Parallélisme", "Les médecins / Les poètes", "Deux types d'interprétation se répondent : le corps malade et l'esprit consumé.", 7, 8),
        ]),
        section("m2c", "La passion plus destructrice que tout", "La cause profonde dépasse la maladie et l'étude : Balzac désigne une passion mortelle qui tord le cœur et les muscles.", undefined, [
          figure("f12", "Comparatif d'intensité", "plus mortelle que la maladie", "La passion est présentée comme une force plus dangereuse que le mal physique.", 9),
          figure("f13", "Personnification violente", "tordait ce cœur", "La passion agit comme une force qui déforme le corps de l'intérieur.", 10),
          figure("f14", "Accumulation", "orgies, l’étude et la maladie", "Les différentes dépenses d'énergie convergent vers la destruction.", 10),
        ]),
      ]),
      movement("m3", "III. Une grandeur sombre", 11, 13, ["démons", "respect", "misère"], [
        section("m3a", "Une comparaison inquiétante", "Balzac compare l'arrivée de Raphaël à celle d'un grand criminel accueilli par des condamnés. Le personnage est donc valorisé et inquiétant à la fois.", undefined, [
          figure("f15", "Comparaison", "Comme, lorsqu’un célèbre criminel arrive au bagne", "La comparaison donne à Raphaël une aura de danger et d'exception.", 11),
          figure("f16", "Champ lexical du crime", "criminel / bagne / condamnés", "Le jeu est rapproché d'un univers moralement sombre.", 11),
        ]),
        section("m3b", "Les joueurs comme experts de la souffrance", "Les joueurs reconnaissent chez Raphaël une douleur supérieure à la leur. Leur regard fonctionne comme un jugement d'initiés.", undefined, [
          figure("f17", "Métaphore diabolique", "démons humains", "Les joueurs sont présentés comme des êtres corrompus et lucides.", 12),
          figure("f18", "Hyperbole", "une douleur inouïe", "La souffrance de Raphaël dépasse l'expérience ordinaire.", 12),
          figure("f19", "Métaphore médicale", "une blessure profonde que sondait leur regard", "Le regard des joueurs pénètre la douleur comme une sonde.", 12),
        ]),
        section("m3c", "Une majesté dans la misère", "La fin du portrait donne à Raphaël une noblesse paradoxale : ses vêtements sont misérables, mais son ironie et son allure le font reconnaître comme un prince.", undefined, [
          figure("f20", "Métaphore sociale", "un de leurs princes", "Raphaël devient le souverain d'un monde de perdants et de joueurs.", 13),
          figure("f21", "Oxymore", "élégante misère", "La pauvreté se mêle à une forme de distinction aristocratique.", 13),
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
    context: "Dans la boutique de l'antiquaire, Raphaël découvre la Peau de chagrin, un talisman qui promet d'accomplir ses désirs. Le vieillard transforme cette tentation romanesque en leçon philosophique sur l'énergie humaine.",
    quizFocus: "La scène oppose la curiosité de Raphaël au savoir de l'antiquaire : vouloir et pouvoir consument l'existence, tandis que savoir permet de conserver sa vie.",
    problematique: "Comment l'antiquaire fait-il du talisman une leçon sur le désir, le pouvoir et la maîtrise de soi ?",
    recap: "L'antiquaire constate d'abord que Raphaël est repris par le désir, refuse ensuite l'expérience du talisman, puis formule la loi du roman : VOULOIR brûle, POUVOIR détruit, SAVOIR apaise.",
    opening: "On peut ouvrir sur le mythe de Faust : obtenir un pouvoir en échange de sa vie.",
    movements: [
      movement("m1", "I. Un objet dangereux attire Raphaël", 1, 6, ["mystère", "ironie", "fatalité"], [
        section("m1a", "Le regard lucide de l'antiquaire", "Le vieux marchand comprend immédiatement que Raphaël, venu pour mourir, est déjà distrait par le mystère du talisman.", undefined, [
          figure("f1", "Regard interprétatif", "un regard empreint d’une froide ironie", "L'antiquaire voit plus clair que Raphaël sur son désir naissant.", 1),
          figure("f2", "Discours indirect libre", "Il ne pense déjà plus à mourir", "La pensée attribuée au regard révèle que la curiosité a remplacé le suicide.", 1),
        ]),
        section("m1b", "Raphaël entre dans le mystère", "La question du jeune homme oscille entre plaisanterie et mystère. Il ne sait pas encore si le talisman relève du jeu, du surnaturel ou du danger.", undefined, [
          figure("f3", "Alternative interrogative", "plaisanterie / mystère", "La question met en balance rationalité et fantastique.", 2),
          figure("f4", "Discours direct", "demanda le jeune inconnu", "La parole immédiate montre le trouble de Raphaël.", 2),
        ]),
        section("m1c", "Un contrat fatal refusé par les autres", "L'antiquaire explique que des hommes plus énergiques que Raphaël ont refusé le talisman. L'objet est présenté comme une puissance dangereuse.", undefined, [
          figure("f5", "Lexique de la fatalité", "terrible pouvoir / contrat fatalement proposé", "Le vocabulaire associe le talisman à une menace pour la destinée.", 4, 5),
          figure("f6", "Opposition implicite", "plus d’énergie que vous", "Raphaël est placé en position de faiblesse face à d'autres hommes plus forts.", 4),
          figure("f7", "Accumulation de refus", "j’ai douté, je me suis abstenu", "La sagesse du vieillard se manifeste par le retrait plutôt que par l'action.", 6),
        ]),
      ]),
      movement("m2", "II. Le vieillard refuse l'expérience", 7, 12, ["prudence", "mort", "limite"], [
        section("m2a", "Une interruption qui révèle l'impatience de Raphaël", "Raphaël coupe le vieillard pour demander s'il a essayé. Cette impatience montre déjà sa tentation de l'expérience.", undefined, [
          figure("f8", "Interruption", "en l’interrompant", "Raphaël rompt le discours sage par une réaction de curiosité.", 7),
          figure("f9", "Exclamation", "Essayer !", "La reprise exclamative du vieillard transforme la question en absurdité.", 8),
        ]),
        section("m2b", "Essayer serait choisir la mort", "L'antiquaire compare l'expérience du talisman à un saut depuis la colonne Vendôme. Le pouvoir est donc immédiatement associé à une chute mortelle.", undefined, [
          figure("f10", "Comparaison hypothétique", "sur la colonne de la place Vendôme", "L'image rend concrète la folie de l'essai.", 9),
          figure("f11", "Question rhétorique", "essaieriez-vous de vous jeter dans les airs ?", "La question impose la réponse : essayer serait se détruire.", 9),
        ]),
        section("m2c", "La limite humaine rappelée", "Le vieillard passe du cas particulier au principe général : on ne maîtrise ni le cours de la vie ni la mort.", undefined, [
          figure("f12", "Questions rhétoriques", "Peut-on arrêter le cours de la vie ? L’homme a-t-il jamais pu scinder la mort ?", "Les questions rappellent les limites infranchissables de l'existence humaine.", 10),
          figure("f13", "Apostrophe", "Enfant !", "Le vieillard rabaisse Raphaël et affirme son autorité d'expérience.", 12),
          figure("f14", "Antithèse", "mourir / énigme plus intéressante", "Le mystère de la vie remplace l'idée de suicide.", 11, 12),
        ]),
      ]),
      movement("m3", "III. La formule du roman", 13, 21, ["vouloir", "pouvoir", "savoir"], [
        section("m3a", "L'autorité d'une longue expérience", "L'antiquaire fonde sa leçon sur sa propre vie : pauvreté, vieillesse, fortune. Son discours tire sa force de l'expérience accumulée.", undefined, [
          figure("f15", "Récit autobiographique", "j’ai mendié mon pain", "Le vieillard transforme sa vie en preuve.", 15),
          figure("f16", "Antithèse paradoxale", "le malheur m’a donné la fortune, l’ignorance m’a instruit", "Les contraires montrent que la sagesse vient de l'épreuve.", 16),
        ]),
        section("m3b", "Le grand mystère de la vie humaine", "Le vieillard formule une loi générale : l'homme s'épuise par vouloir et pouvoir. Le talisman devient le symbole de cette dépense d'énergie.", undefined, [
          figure("f17", "Annonce solennelle", "un grand mystère de la vie humaine", "La phrase donne au discours une portée philosophique.", 17),
          figure("f18", "Métaphore vitale", "tarissent les sources de son existence", "La vie est représentée comme une source que le désir épuise.", 18),
          figure("f19", "Majuscules symboliques", "VOULOIR et POUVOIR", "Les verbes deviennent des forces abstraites et centrales.", 19),
        ]),
        section("m3c", "La sagesse contre la dépense d'énergie", "La formule finale oppose trois verbes. Vouloir et pouvoir consument la vie ; savoir maintient le calme et la durée.", undefined, [
          figure("f20", "Triade philosophique", "VOULOIR / POUVOIR / SAVOIR", "Les trois verbes résument l'opposition entre dépense et maîtrise de soi.", 19, 21),
          figure("f21", "Antithèse", "brûle / détruit / calme", "Les verbes opposent la violence du désir à l'apaisement du savoir.", 21),
          figure("f22", "Présent de vérité générale", "Vouloir nous brûle et Pouvoir nous détruit", "La phrase énonce une loi valable pour tous les hommes.", 21),
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
    quizFocus: "La scène fait coïncider déclaration amoureuse, contraction du talisman et agonie : l'amour n'apaise pas la malédiction, il en devient l'accomplissement.",
    problematique: "Comment Balzac fait-il de cette scène amoureuse une scène de mort ?",
    recap: "Balzac transforme l'amour en scène de mort en faisant du talisman un compte à rebours visible, puis en montrant le désir comme une force incontrôlable qui détruit la parole, le corps et Pauline elle-même.",
    opening: "On peut comparer cette fin à une tragédie : le héros est détruit par sa propre passion.",
    movements: [
      movement("m1", "I. Le talisman réduit à un signe de mort", 1, 7, ["talisman", "adieu", "fragilité"], [
        section("m1a", "La Peau matérialise la vie restante", "Le passage s'ouvre sur un objet presque disparu : le talisman n'est plus une promesse de puissance, mais la mesure concrète de la vie qui reste à Raphaël.", "La mort devient lisible dans la taille de la Peau avant même que le corps ne s'effondre.", [
          figure("f1", "Comparaison", "comme la feuille d’une pervenche", "L'image végétale insiste sur la petitesse, la fragilité et la disparition prochaine du talisman.", 1),
          figure("f2", "Champ lexical de la petitesse", "lambeau / fragile et petit", "La Peau est réduite à un reste : elle annonce une existence elle aussi presque entièrement consommée.", 1),
          figure("f3", "Objet symbolique", "la Peau de chagrin", "Le talisman condense toute la logique du roman : chaque désir satisfait retire de la vie.", 1),
        ]),
        section("m1b", "L'amour placé sous le signe de l'adieu", "Raphaël s'adresse à Pauline comme à la plus belle part de sa vie, mais la déclaration amoureuse est immédiatement encadrée par l'adieu.", "L'amour apparaît comme ce qui rend la mort plus douloureuse, non comme ce qui l'empêche.", [
          figure("f4", "Apostrophe affective", "Pauline, belle image de ma vie", "Pauline est associée à la vie de Raphaël, ce qui rend l'adieu plus tragique.", 1),
          figure("f5", "Motif de l'adieu", "disons-nous adieu", "Le verbe à la première personne du pluriel lie les deux personnages dans une séparation imminente.", 1),
          figure("f6", "Question brève", "Adieu ?", "La reprise interrogative de Pauline marque l'incompréhension devant une scène d'amour devenue scène de rupture.", 2),
        ]),
        section("m1c", "Le regard de Pauline devient mortel", "Raphaël explique lui-même la règle tragique : le talisman accomplit les désirs et représente sa vie. Le simple regard de Pauline suffit désormais à menacer son existence.", "Le danger ne vient pas d'un ennemi extérieur : il vient du désir suscité par celle qu'il aime.", [
          figure("f7", "Définition du talisman", "accomplit mes désirs, et représente ma vie", "La phrase résume le mécanisme fatal qui lie désir et mort.", 3),
          figure("f8", "Impératif", "Vois ce qu’il m’en reste", "Raphaël force Pauline à regarder la preuve matérielle de sa condamnation.", 4),
          figure("f9", "Menace conditionnelle", "Si tu me regardes encore, je vais mourir…", "La condition transforme un geste amoureux ordinaire, le regard, en déclencheur de mort.", 5),
          figure("f10", "Points de suspension", "mourir…", "La phrase reste suspendue comme la vie de Raphaël.", 5),
        ]),
      ]),
      movement("m2", "II. Le désir renaît et se retourne contre Pauline", 8, 18, ["désir", "terreur", "fuite"], [
        section("m2a", "Pauline révèle la dernière parcelle de vie", "La lampe éclaire à la fois Raphaël et le talisman : la scène fait voir ensemble le corps du mourant et l'objet qui mesure sa fin.", "La lumière ne rassure pas ; elle révèle l'état exact du danger.", [
          figure("f11", "Lumière symbolique", "lueur vacillante", "La lumière fragile correspond à la vie presque éteinte de Raphaël.", 7),
          figure("f12", "Parallélisme visuel", "sur Raphaël et sur le talisman", "Le corps et la Peau sont placés dans le même éclairage, comme deux versions d'une même agonie.", 7),
          figure("f13", "Expression décisive", "la dernière parcelle de la Peau magique", "Le mot parcelle réduit la vie à un fragment minuscule.", 7),
        ]),
        section("m2b", "Le désir se réveille comme une force incontrôlable", "La beauté de Pauline mêle terreur et amour. Raphaël perd la maîtrise de sa pensée : le désir renaît malgré l'avertissement qu'il vient de formuler.", "La passion n'est plus un sentiment choisi ; elle est une puissance qui reprend possession du personnage.", [
          figure("f14", "Antithèse", "terreur et d’amour", "Les deux sentiments incompatibles montrent que l'amour est devenu effrayant.", 8),
          figure("f15", "Métaphore", "comme un foyer mal éteint", "Le désir ressemble à un feu qui couvait et qui reprend violemment.", 9),
          figure("f16", "Exclamation", "« Pauline, viens ! Pauline ! »", "Le cri répété remplace le raisonnement par l'appel immédiat du désir.", 10),
        ]),
        section("m2c", "La passion fait basculer la scène dans la terreur", "Pauline lit le désir dans les yeux de Raphaël et comprend que sa présence le tue. La Peau se contracte au rythme de ce désir, puis Pauline fuit pour tenter de sauver l'homme qu'elle aime.", "La scène amoureuse devient une scène de poursuite : plus Raphaël désire Pauline, plus il la met en danger.", [
          figure("f17", "Champ lexical de l'horreur", "cri terrible / douleur inouïe / horreur", "La réaction de Pauline donne au désir de Raphaël une dimension terrifiante.", 11, 12),
          figure("f18", "Hyperbole", "désirs furieux", "L'adjectif rend le désir violent, presque animal.", 13),
          figure("f19", "Symbole dynamique", "la Peau, en se contractant", "La contraction rend matériel le lien entre désir et diminution de la vie.", 14),
          figure("f20", "Verbe de fuite", "elle s’enfuit", "Pauline tente d'échapper au désir pour préserver Raphaël.", 15),
          figure("f21", "Accumulation verbale", "je t’aime, je t’adore, je te veux", "La progression va de l'amour à la possession : Raphaël ne demande plus seulement Pauline, il la veut.", 16),
        ]),
      ]),
      movement("m3", "III. Une scène d'amour transformée en agonie", 19, 29, ["râle", "violence", "cadavre"], [
        section("m3a", "Le dernier éclat de vie devient violence", "Raphaël trouve encore assez de force pour détruire la porte. Cette énergie n'est pas un retour à la vie : c'est une flambée terminale.", "Le corps agit encore, mais cette action confirme la proximité de la mort.", [
          figure("f22", "Formule tragique", "dernier éclat de vie", "L'expression annonce que la force de Raphaël est l'ultime sursaut avant l'agonie.", 19),
          figure("f23", "Hyperbole gestuelle", "il jeta la porte à terre", "La violence du geste matérialise l'irruption brutale du désir.", 19),
          figure("f24", "Contraste scénique", "à demi nue se roulant sur un canapé", "La sensualité de la posture est traversée par la panique et par la tentative de suicide.", 19),
        ]),
        section("m3b", "Pauline cherche à sauver Raphaël par sa propre mort", "Pauline inverse la logique du talisman : elle pense que sa disparition peut empêcher le désir de Raphaël et donc le sauver. Son corps devient le lieu d'un sacrifice impossible.", "La scène pousse l'amour jusqu'au paradoxe : Pauline veut mourir pour que Raphaël vive.", [
          figure("f25", "Discours direct", "« Si je meurs, il vivra ! »", "La phrase donne accès à la logique sacrificielle de Pauline.", 21),
          figure("f26", "Champ lexical du désordre", "cheveux épars / vêtements en désordre", "Le désordre physique rend visible l'affolement intérieur.", 22),
          figure("f27", "Antithèse", "meurs / vivra", "La survie de Raphaël semble dépendre de la mort de Pauline.", 21),
          figure("f28", "Comparaison animale", "légèreté d’un oiseau de proie", "Raphaël est assimilé à un prédateur : le désir amoureux est devenu attaque.", 24),
        ]),
        section("m3c", "Le désir finit dans le râle et le cadavre", "La parole de Raphaël se défait : il ne peut plus formuler son désir, seulement produire les sons du râle. Le dernier contact avec Pauline est une morsure, puis le texte bascule dans le cadavre.", "La scène répond à la problématique : l'amour devient mort parce que le désir détruit jusqu'au langage et au corps.", [
          figure("f29", "Champ lexical de l'agonie", "moribond / râle / entrailles", "Les mots enferment la scène dans le corps souffrant et la respiration de la mort.", 25, 26),
          figure("f30", "Négation de la parole", "ne trouva que les sons étranglés", "Le héros perd la parole humaine au moment où son désir est le plus intense.", 26),
          figure("f31", "Violence finale", "il mordit Pauline au sein", "La morsure remplace l'étreinte amoureuse et transforme le désir en blessure.", 27),
          figure("f32", "Mot final du corps", "cadavre", "Raphaël n'est plus nommé comme sujet vivant, mais comme corps mort.", 28),
          figure("f33", "Paradoxe tragique", "Il est à moi, je l’ai tué", "Pauline affirme la possession amoureuse au moment même où elle reconnaît la mort.", 29),
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
    quizFocus: "L'extrait présente la création comme une lutte physique et mentale : l'artiste voit l'oeuvre idéale, mais son corps, ses yeux et ses mains ne parviennent pas à la produire.",
    problematique: "Comment Zola montre-t-il la souffrance de l'artiste face à l'oeuvre impossible ?",
    recap: "Zola montre la souffrance de l'artiste par le retour du doute, par l'image d'une oeuvre qui résiste comme un obstacle matériel, puis par le mirage d'une oeuvre future qui console tout en relançant l'échec.",
    opening: "On peut ouvrir sur Balzac : l'énergie créatrice peut autant élever que détruire.",
    movements: [
      movement("m1", "I. La création comme doute et impuissance", 1, 5, ["doute", "lutte", "impuissance"], [
        section("m1a", "Une obstination minée par le doute", "La première phrase oppose l'obstination du peintre à la reprise des doutes. L'artiste ne manque pas de volonté : il est ravagé par l'écart entre son ambition et ce qu'il obtient.", "Zola ne décrit pas une simple hésitation, mais une lutte intérieure durable.", [
          figure("f1", "Antithèse", "bravoure de son obstination / doutes d’autrefois", "La force morale est contredite par le retour du doute.", 1),
          figure("f2", "Champ lexical du combat", "lutte / ravagé", "La création est présentée comme une guerre qui abîme l'artiste.", 1),
          figure("f3", "Adverbe d'opposition", "pourtant", "Le mot renverse l'élan positif de l'obstination vers l'échec intérieur.", 1),
        ]),
        section("m1b", "Chaque toile revient comme un échec", "Le peintre juge ses toiles non seulement mauvaises, mais surtout incomplètes : le problème n'est pas l'absence de talent, c'est l'impossibilité d'atteindre la forme rêvée.", "L'échec porte sur la réalisation : l'oeuvre produite reste en dessous de l'effort tenté.", [
          figure("f4", "Gradation négative", "mauvaise, incomplète surtout", "Le jugement s'aggrave : la toile est ratée parce qu'elle ne va pas au bout de l'intention.", 2),
          figure("f5", "Négation de l'accomplissement", "ne réalisant pas l’effort tenté", "Le verbe réaliser souligne la distance entre l'élan créateur et le résultat visible.", 2),
          figure("f6", "Répétition implicite", "Toute toile qui revenait", "La formule donne à l'échec un caractère répétitif, presque mécanique.", 2),
        ]),
        section("m1c", "L'impuissance artistique devient souffrance", "La souffrance de l'artiste tient à une impuissance précise : il possède un génie qu'il ne parvient pas à faire naître entièrement dans une oeuvre.", "Zola fait de la création un accouchement impossible, donc une douleur sans délivrance.", [
          figure("f7", "Substantivation", "cette impuissance", "Le défaut devient une force autonome qui domine le personnage.", 3),
          figure("f8", "Hyperbole polémique", "valaient cent fois les médiocrités reçues", "L'artiste se sent supérieur aux oeuvres admises, ce qui rend son échec plus amer.", 4),
          figure("f9", "Métaphore de l'accouchement impossible", "ne pouvait accoucher son génie", "Le génie existe en lui, mais il ne parvient pas à prendre forme dans le chef-d'oeuvre.", 5),
          figure("f10", "Mot idéal", "chef-d’œuvre", "Le terme concentre l'exigence absolue qui rend toute toile insuffisante.", 5),
        ]),
      ]),
      movement("m2", "II. L'oeuvre résiste et paralyse l'artiste", 6, 12, ["obstacle", "correction", "paralysie"], [
        section("m2a", "Des fragments réussis mais un ensemble raté", "Le peintre reconnaît la beauté de certains morceaux, mais cette réussite partielle rend l'échec global plus incompréhensible. Le tableau peut contenir du superbe sans devenir une oeuvre réussie.", "La souffrance vient du désaccord entre le détail réussi et l'ensemble impossible.", [
          figure("f11", "Accumulation démonstrative", "celui-ci, de celui-là, de cet autre", "La liste prouve que les réussites existent, mais restent fragmentaires.", 6),
          figure("f12", "Questions rhétoriques", "Alors pourquoi... Pourquoi...", "Les questions font entendre l'obsession de l'échec et l'incapacité à l'expliquer.", 7, 8),
          figure("f13", "Image destructrice", "tuant le tableau", "Une partie ratée détruit l'ensemble, comme si l'oeuvre était un organisme vivant.", 8),
        ]),
        section("m2b", "L'obstacle devient infranchissable", "La difficulté n'est plus seulement technique : Zola la rend matérielle avec l'image d'un mur. La correction se heurte à une limite que l'artiste ne peut pas franchir.", "L'oeuvre impossible devient un espace fermé où la volonté se brise.", [
          figure("f14", "Métaphore", "un mur se dressait", "La difficulté prend la forme concrète d'un obstacle vertical.", 9),
          figure("f15", "Adjectif absolu", "obstacle infranchissable", "Le mot exclut toute solution et radicalise l'impuissance.", 9),
          figure("f16", "Interdit passif", "il lui était défendu d’aller", "La formule donne l'impression qu'une puissance extérieure interdit l'accès à la réussite.", 9),
        ]),
        section("m2c", "La volonté se défait", "Plus l'artiste reprend le morceau, plus il l'abîme. Le travail, au lieu de corriger, produit le gâchis, puis la paralysie de la volonté.", "Le passage répond à la problématique en montrant une souffrance qui atteint les yeux, les mains et la décision même d'agir.", [
          figure("f17", "Répétition", "vingt fois... vingt fois", "La reprise insistante montre l'acharnement et l'échec répété.", 10),
          figure("f18", "Champ lexical du gâchis", "brouillait / glissait au gâchis", "Le travail de correction devient une dégradation de l'oeuvre.", 10),
          figure("f19", "Gradation négative", "ne voyait plus, n’exécutait plus", "La perte touche d'abord la perception, puis le geste.", 11),
          figure("f20", "Question rhétorique", "Étaient-ce donc ses yeux, étaient-ce ses mains", "L'artiste ne reconnaît plus ses propres facultés.", 12),
          figure("f21", "Formule médicale", "paralysie de la volonté", "La crise artistique devient une atteinte physique et nerveuse.", 11),
        ]),
      ]),
      movement("m3", "III. Le mirage de l'oeuvre future permet de continuer", 13, 19, ["rêve", "hâte", "illusion"], [
        section("m3a", "Une alternance d'angoisse et d'espoir", "Les crises se répètent et font osciller l'artiste entre incertitude et espérance. La création est donc à la fois torture et moteur.", "Zola montre une instabilité permanente : l'artiste ne sort jamais vraiment de la crise.", [
          figure("f22", "Hyperbole temporelle", "semaines abominables", "La crise s'étend dans la durée et envahit la vie de l'artiste.", 13),
          figure("f23", "Antithèse", "l’incertitude à l’espérance", "Le peintre passe sans cesse de l'effondrement à l'espoir.", 13),
          figure("f24", "Personnification", "l’œuvre rebelle", "L'oeuvre semble résister activement à celui qui veut la créer.", 14),
        ]),
        section("m3b", "L'oeuvre future devient consolation", "Ce qui soutient l'artiste n'est pas l'oeuvre présente, mais celle qu'il imagine ensuite. L'avenir promet la délivrance que le présent refuse.", "La consolation repose sur une projection : l'oeuvre parfaite existe d'abord comme promesse.", [
          figure("f25", "Expression affective", "rêve consolateur", "Le rêve compense les échecs présents et donne la force de continuer.", 14),
          figure("f26", "Projection vers l'accomplissement", "celle où il se satisferait enfin", "Le conditionnel situe la réussite dans un avenir désiré, encore incertain.", 14),
          figure("f27", "Métaphore corporelle", "ses mains se délieraient", "Le geste créateur est imaginé comme une libération physique.", 14),
        ]),
        section("m3c", "Le mirage final rend la création possible", "L'artiste supporte le travail en cours parce qu'il imagine déjà l'oeuvre suivante, plus forte et définitive. Le mirage est faux, mais il rend la production possible.", "Le passage s'achève sur un paradoxe : l'illusion trompe l'artiste, mais sans elle il ne créerait plus.", [
          figure("f28", "Antithèse temporelle", "travail en train / ce qu’il ferait ensuite", "Le présent est dévalorisé au profit d'une oeuvre future idéalisée.", 16, 18),
          figure("f29", "Accumulation méliorative", "superbe et héroïque, inattaquable, indestructible", "Les adjectifs construisent l'image d'une oeuvre parfaite et invincible.", 18),
          figure("f30", "Métaphore centrale", "Perpétuel mirage", "L'idéal artistique attire l'artiste tout en restant inaccessible.", 19),
          figure("f31", "Métaphore tragique", "damnés de l’art", "Les artistes sont représentés comme condamnés par leur propre vocation.", 19),
          figure("f32", "Paradoxe", "mensonge de tendresse et de pitié", "L'illusion est fausse, mais elle protège l'artiste de l'arrêt complet.", 19),
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
    context: "La Boétie, écrivain humaniste du XVIe siècle et ami de Montaigne, est marqué par la brutalité de la répression d'une révolte en Guyenne en 1548. Dans le Discours de la servitude volontaire, il traduit son désir de liberté face à l'absolutisme.",
    quizFocus: "Le discours interpelle directement les peuples pour expliquer qu'ils sont aussi responsables de leur asservissement : le tyran ne tient que parce qu'ils l'aident, le nourrissent et le soutiennent.",
    problematique: "De quelle façon La Boétie s'y prend-il pour tenter de faire prendre conscience aux peuples de ce caractère volontaire de leur servitude ?",
    recap: "Dans ce réquisitoire, La Boétie multiplie les accusations et les images contre le système tyrannique : il peint une nature humaine qui s'attaque à elle-même et invite les peuples à reconnaître leur propre pouvoir d'action.",
    opening: "On peut ouvrir sur 1984 de George Orwell, autre réflexion sur les mécanismes de l'oppression et la complicité produite par les régimes totalitaires.",
    introduction: [
      {
        id: "intro-auteur",
        title: "L'auteur et l'oeuvre",
        simple: "Étienne de La Boétie est un écrivain humaniste français du XVIe siècle. Ami intime de Montaigne, il a étudié le droit et s'interroge très tôt sur la liberté politique.",
      },
      {
        id: "intro-contexte",
        title: "Le contexte",
        simple: "Le Discours de la servitude volontaire, rédigé vers 1548, traduit un désir de liberté cultivé devant la réalité de l'absolutisme. La Boétie cherche à comprendre pourquoi des peuples entiers acceptent d'obéir à un seul tyran.",
      },
      {
        id: "intro-passage",
        title: "La situation du passage",
        simple: "Dans cet extrait, l'auteur interpelle directement les peuples. Il veut leur faire comprendre qu'ils ne sont pas seulement victimes : ils donnent eux-mêmes au tyran une grande partie de sa force.",
      },
      {
        id: "intro-plan",
        title: "Annonce du plan",
        simple: "Le texte avance en quatre temps : dénoncer la soumission du peuple, critiquer le pouvoir tyrannique, accuser la complicité des peuples, puis appeler à une prise de conscience et à l'action.",
      },
    ],
    movements: [
      movement("m1", "I. Dénonciation de la soumission du peuple", 1, 6, ["apostrophe", "accusation", "perte"], [
        section("m1a", "Une apostrophe qui secoue les dominés", "La Boétie commence par parler directement aux peuples. Il ne les présente pas comme de simples victimes : il les accuse d'être obstinés dans leur propre malheur.", "L'entrée du texte a une fonction de choc : rendre insupportable une servitude devenue habituelle.", [
          figure("f1", "Apostrophe", "Pauvres et misérables peuples insensés", "L'adresse directe transforme le passage en discours d'alerte.", 1),
          figure("f2", "Accumulation dépréciative", "pauvres / misérables / insensés / opiniâtres / aveugles", "La série d'adjectifs construit un portrait sévère du peuple soumis.", 1),
          figure("f3", "Antithèse", "votre mal / votre bien", "L'opposition montre que le peuple persiste contre son propre intérêt.", 1),
        ]),
        section("m1b", "La domination est d'abord un pillage", "La tyrannie est présentée comme une confiscation concrète : revenus, champs, maisons, meubles des ancêtres. La liberté n'est donc pas une idée abstraite, elle touche les biens et les vies.", "La Boétie fait sentir matériellement le coût de la servitude.", [
          figure("f4", "Énumération", "piller vos champs, voler et dépouiller vos maisons", "La liste donne au pouvoir tyrannique la forme d'un vol organisé.", 2),
          figure("f5", "Formule visuelle", "sous vos yeux", "Le peuple assiste à sa propre dépossession sans réagir.", 2),
          figure("f6", "Hyperbole de dépossession", "rien ne soit à vous", "La formule radicalise la perte : même la propriété devient illusion.", 3),
          figure("f7", "Image sociale", "simples locataires de vos biens, vos familles et vos vies", "La phrase étend la dépossession aux familles et à l'existence même.", 3),
        ]),
        section("m1c", "L'ennemi est fabriqué par ceux qu'il domine", "La Boétie renverse l'explication habituelle : le malheur ne vient pas d'ennemis extérieurs mais de l'ennemi que les peuples agrandissent eux-mêmes.", "Le coeur de l'argument apparaît déjà : le tyran dépend de la participation des dominés.", [
          figure("f8", "Correction polémique", "non pas des ennemis, mais... de l’ennemi", "Le singulier concentre la responsabilité sur le tyran, mais aussi sur ceux qui le rendent puissant.", 4),
          figure("f9", "Subordonnée accusatrice", "celui que vous faites si grand", "Le peuple est présenté comme l'artisan de la grandeur du tyran.", 5),
          figure("f10", "Restriction démystifiante", "n’a que deux yeux, n’a que deux mains, n’a qu’un corps", "Le tyran est ramené à un homme ordinaire.", 6),
        ]),
      ]),
      movement("m2", "II. La critique du pouvoir tyrannique", 7, 11, ["questions", "démystification", "pouvoir"], [
        section("m2a", "Le tyran est ramené à un dominateur ordinaire", "La Boétie insiste sur la faiblesse réelle du tyran : il n'a rien de plus qu'un homme ordinaire. Sa puissance est donc une construction, non une supériorité naturelle.", "La critique commence par désacraliser le tyran.", [
          figure("f11", "Opposition", "moindre des hommes / nombre infini de vos villes", "La faiblesse physique du tyran contraste avec la masse des peuples.", 7),
          figure("f12", "Restriction", "n’a pas d’autre avantage", "La formule réduit le pouvoir du tyran à ce que les peuples lui accordent.", 7),
          figure("f13", "Finale accusatrice", "sinon celui que vous lui faites pour vous détruire", "Le peuple fabrique l'avantage qui se retourne contre lui.", 7),
        ]),
        section("m2b", "Les questions démontent les organes du pouvoir", "La série de questions rhétoriques oblige à reconnaître que le tyran n'a ni yeux, ni mains, ni pieds qui ne viennent des peuples eux-mêmes.", "Le raisonnement est implacable : le pouvoir du tyran est emprunté aux dominés.", [
          figure("f14", "Questions rhétoriques", "D’où a-t-il pris / Comment a-t-il / d’où les a-t-il", "Les questions guident le lecteur vers une seule réponse : le peuple fournit tout.", 8, 10),
          figure("f15", "Métonymies du pouvoir", "yeux / mains / pieds", "Les parties du corps représentent l'espionnage, la violence et l'occupation du territoire.", 8, 10),
          figure("f16", "Répétition conditionnelle", "si vous ne les lui donnez / s’il ne les prend de vous", "La syntaxe fait dépendre la puissance du tyran de la participation du peuple.", 8, 10),
        ]),
        section("m2c", "La formule centrale résume la dépendance du tyran", "Quand La Boétie demande comment le tyran peut avoir du pouvoir « que par vous », il donne la clé du passage : la force tyrannique vient des dominés eux-mêmes.", "La thèse tient en quelques mots : sans le peuple, le tyran ne peut rien.", [
          figure("f17", "Formule synthétique", "que par vous", "La brièveté de l'expression concentre toute la thèse de La Boétie.", 11),
          figure("f18", "Question rhétorique", "Comment a-t-il aucun pouvoir sur vous", "La question pousse le lecteur à reconnaître sa propre responsabilité.", 11),
          figure("f19", "Pronom accusateur", "vous", "La répétition du pronom met directement les peuples en cause.", 11),
        ]),
      ]),
      movement("m3", "III. L'accusation de complicité du peuple", 12, 18, ["complicité", "auto-destruction", "responsabilité"], [
        section("m3a", "La victime devient complice", "La Boétie va plus loin que la plainte : il accuse les peuples d'être receleurs, complices, traîtres à eux-mêmes. Le vocabulaire judiciaire transforme la servitude en faute collective.", "La dénonciation est violente parce qu'elle vise à provoquer une réaction.", [
          figure("f20", "Champ lexical judiciaire", "receleurs / complices / traîtres", "Les peuples ne sont plus seulement victimes : ils sont associés au crime tyrannique.", 13),
          figure("f21", "Parallélisme", "qui vous pille / qui vous tue", "Les deux relatives donnent au tyran les figures du voleur et du meurtrier.", 13),
          figure("f22", "Apostrophe implicite", "vous-mêmes", "La formule referme l'accusation sur les peuples : ils agissent contre eux-mêmes.", 13),
        ]),
        section("m3b", "Le peuple nourrit la machine qui le détruit", "Les phrases répétées montrent que tout ce que les peuples produisent est retourné contre eux : récoltes, maisons, filles, enfants, travail, force physique.", "La servitude est décrite comme un système d'auto-destruction.", [
          figure("f23", "Anaphore", "Vous semez / Vous nourrissez / Vous vous rompez / Vous vous affaiblissez", "La répétition place le peuple au début de chaque action : il alimente lui-même le pouvoir.", 14, 18),
          figure("f24", "Champ lexical économique et domestique", "fruits / maisons / filles / enfants", "La domination envahit toute la vie matérielle et familiale.", 14, 16),
          figure("f25", "Métaphore sanglante", "la boucherie", "La guerre est réduite à un massacre d'enfants envoyés par le tyran.", 16),
          figure("f26", "Antithèse de force", "vous vous affaiblissez / le rendre plus fort", "La puissance du tyran augmente à mesure que le peuple se diminue.", 18),
        ]),
        section("m3c", "La violence du tyran est fabriquée par les ressources du peuple", "La Boétie montre que les fruits, les maisons, les enfants et le travail servent tous le même système : ce que le peuple produit devient l'instrument de sa propre oppression.", "L'accusation est dure, mais elle prépare la solution : si le peuple fournit tout, il peut aussi cesser de fournir.", [
          figure("f27", "Accumulation", "fruits / maisons / filles / enfants", "La liste donne une vision totale de ce que le peuple livre au tyran.", 14, 16),
          figure("f28", "Finales répétées", "afin qu’il", "La répétition montre que chaque action du peuple nourrit le pouvoir tyrannique.", 14, 18),
          figure("f29", "Métaphore équestre", "tenir plus courte la bride", "Le peuple fabrique une contrainte qui se resserre contre lui.", 18),
        ]),
      ]),
      movement("m4", "IV. L'appel à la prise de conscience et à l'action", 19, 22, ["volonté", "liberté", "colosse"], [
        section("m4a", "La libération commence par une volonté", "La Boétie affirme que la sortie de la servitude ne demande pas d'abord une bataille, mais une décision : vouloir ne plus soutenir le tyran.", "La liberté est rendue accessible parce qu'elle dépend d'un refus collectif.", [
          figure("f30", "Correction argumentative", "non pas de vous en délivrer, mais seulement de vouloir le faire", "La phrase réduit l'obstacle : la première victoire est dans la volonté.", 19),
          figure("f31", "Impératif", "Soyez résolus de ne plus servir", "L'ordre transforme l'analyse en appel à l'action.", 20),
          figure("f32", "Présent immédiat", "vous voilà libres", "La liberté est présentée comme la conséquence directe du refus.", 20),
        ]),
        section("m4b", "Le tyran s'effondre quand on cesse de le porter", "La fin refuse l'image d'une révolution violente : il suffit de ne plus soutenir le tyran. Sa chute vient alors de son propre poids.", "L'image finale rend visible une idée politique : le pouvoir ne tient que par sa base.", [
          figure("f33", "Négation de la violence", "Je ne veux pas que vous le poussiez ou l’ébranliez", "La Boétie distingue la libération de l'affrontement direct.", 21),
          figure("f34", "Restriction décisive", "mais seulement ne le soutenez plus", "Toute la stratégie tient dans le retrait du soutien.", 21),
          figure("f35", "Comparaison", "comme un grand colosse", "Le tyran paraît monumental mais dépend d'une base fragile.", 22),
          figure("f36", "Métaphore architecturale", "dérobé la base", "Sans appui populaire, la puissance tyrannique s'effondre mécaniquement.", 22),
        ]),
        section("m4c", "L'image finale rend la liberté mémorable", "Le colosse semble immense, mais il tombe dès que sa base disparaît. La Boétie donne ainsi une forme concrète à son idée : le tyran n'est fort que parce qu'on le porte.", "La conclusion transforme le raisonnement politique en image simple : retirer le soutien, c'est déjà faire tomber le pouvoir.", [
          figure("f37", "Verbe de chute", "tombera de son propre poids", "La chute vient du tyran lui-même dès que le peuple cesse de le soutenir.", 22),
          figure("f38", "Effondrement mécanique", "se rompra", "Le pouvoir tyrannique est figuré comme une construction qui casse faute d'appui.", 22),
          figure("f39", "Opposition architecturale", "base / poids", "La relation entre soutien et masse résume la dépendance du tyran envers les dominés.", 22),
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
    context: "La Boétie écrit un discours humaniste et politique contre la tyrannie : un peuple n'est pas seulement dominé par la force, mais aussi par des méthodes plus subtiles.",
    quizFocus: "Le tyran maintient l'obéissance en transformant les divertissements en instruments politiques : le plaisir détourne la pensée du peuple et rend la domination plus difficile à contredire.",
    problematique: "Comment La Boétie montre-t-il que les tyrans utilisent le divertissement pour établir et maintenir leur domination ?",
    recap: "La Boétie part d'une anecdote historique sur Cyrus, généralise ensuite cette stratégie à tous les tyrans, puis montre que les spectacles deviennent des appâts capables d'abrutir durablement les peuples.",
    opening: "On peut penser aux débats modernes sur les médias et les distractions politiques.",
    introduction: [
      {
        id: "intro-auteur",
        title: "L'auteur et l'oeuvre",
        simple: "Étienne de La Boétie est un écrivain humaniste du XVIe siècle, proche de Montaigne. Dans le Discours de la servitude volontaire, il interroge une question politique centrale : pourquoi les peuples acceptent-ils d'obéir à un seul homme ?",
      },
      {
        id: "intro-passage",
        title: "Le passage",
        simple: "L'extrait explique que le tyran ne domine pas uniquement par la violence. Il peut aussi maintenir son pouvoir par les plaisirs, les jeux et les spectacles, qui détournent le peuple de sa liberté.",
      },
      {
        id: "intro-enjeu",
        title: "L'enjeu",
        simple: "À travers l'anecdote de Cyrus et des Lydiens, La Boétie expose un mécanisme de servitude volontaire : le peuple se laisse séduire par le divertissement et participe ainsi, sans toujours s'en rendre compte, à sa propre domination.",
      },
      {
        id: "intro-plan",
        title: "Annonce du plan",
        simple: "Le texte progresse en trois temps : l'exemple historique de Cyrus, la généralisation du procédé à tous les tyrans, puis la dénonciation de l'abrutissement des peuples par les divertissements.",
      },
    ],
    movements: [
      movement("m1", "I. L'exemple historique de Cyrus et des Lydiens", 1, 7, ["exemple", "stratagème", "obéissance"], [
        section("m1a", "Une ruse présentée comme un cas exemplaire", "La Boétie annonce que l'histoire de Cyrus rend la ruse tyrannique parfaitement visible. L'exemple sert de preuve concrète à une théorie politique.", "Le récit historique rend l'argument plus facile à retenir : dominer peut consister à distraire.", [
          figure("f1", "Exemple historique", "ce que Cyrus fit aux Lydiens", "La référence donne une autorité concrète à l'analyse.", 1),
          figure("f2", "Infinitif dégradant", "abêtir leurs sujets", "Le verbe montre que le but du tyran est de diminuer l'intelligence politique du peuple.", 1),
          figure("f3", "Superlatif d'évidence", "plus clairement", "La Boétie présente son exemple comme une démonstration limpide.", 1),
        ]),
        section("m1b", "La force militaire est remplacée par le divertissement", "Cyrus pourrait écraser les révoltés, mais il choisit une solution plus durable : installer des plaisirs publics et obligatoires. Le loisir devient un outil de maintien de l'ordre.", "Le texte oppose la domination visible de l'armée à la domination plus discrète des plaisirs.", [
          figure("f4", "Champ lexical militaire", "soumis / poigne / armée / garder", "Le début rappelle la solution brutale que Cyrus aurait pu employer.", 2, 3),
          figure("f5", "Mot stratégique", "stratagème", "La domination est pensée comme une manœuvre calculée.", 3),
          figure("f6", "Énumération", "bordels, tavernes et jeux publics", "La liste associe plaisirs du corps, boisson et jeux dans un même système de contrôle.", 4),
          figure("f7", "Obligation paradoxale", "obligés de s’en servir", "Même le plaisir devient une contrainte politique.", 4),
        ]),
        section("m1c", "Le plaisir devient une garnison", "La Boétie souligne l'efficacité de la méthode : plus besoin d'épée contre les Lydiens. Le divertissement tient lieu de présence militaire.", "La ruse est redoutable parce qu'elle transforme les dominés en gardiens de leur propre servitude.", [
          figure("f8", "Métaphore politique", "cette garnison", "Les loisirs remplacent les soldats dans la fonction de contrôle.", 5),
          figure("f9", "Négation de la violence", "jamais il ne fallut tirer un coup d’épée", "La domination réussit sans combat visible.", 5),
          figure("f10", "Expression péjorative", "Ces pauvres et misérables gens", "La pitié se mêle au mépris devant la facilité avec laquelle le peuple se laisse distraire.", 6),
          figure("f11", "Étymologie argumentative", "passe-temps / lude / de Lydie", "La référence au mot latin donne au récit une portée culturelle et mémorable.", 7),
        ]),
      ]),
      movement("m2", "II. La généralisation du procédé des tyrans", 8, 14, ["peuple", "naïveté", "servitude"], [
        section("m2a", "Cyrus révèle une pratique commune des tyrans", "La Boétie généralise l'exemple : tous les tyrans n'avouent pas aussi clairement leur intention, mais beaucoup recherchent discrètement le même résultat.", "L'exemple n'est pas une exception ; il révèle une règle de domination.", [
          figure("f12", "Opposition", "déclaré expressément / recherché discrètement", "La ruse change de forme mais conserve le même objectif.", 8, 9),
          figure("f13", "Adverbes de manière", "formellement / discrètement", "Les adverbes opposent l'ordre visible et la manipulation cachée.", 9),
          figure("f14", "Verbe affaiblissant", "effeminer leurs gens", "Dans la langue de l'époque, le terme signifie affaiblir moralement et politiquement.", 8),
        ]),
        section("m2b", "Le peuple est vulnérable à celui qui le trompe", "La Boétie décrit une contradiction : le peuple se méfie de celui qui l'aime et croit celui qui le trompe. La servitude repose donc sur une erreur de jugement.", "La critique vise autant le tyran manipulateur que la crédulité collective.", [
          figure("f15", "Antithèse", "soupçonneux... celui qui l’aime / naïf... celui qui le trompe", "L'opposition résume le renversement politique dénoncé.", 11),
          figure("f16", "Généralisation", "le naturel du menu peuple", "La Boétie transforme l'exemple historique en observation sur les comportements collectifs.", 10),
          figure("f17", "Lexique de la tromperie", "trompe / naïf", "Le vocabulaire met l'accent sur une domination par illusion.", 11),
        ]),
        section("m2c", "La servitude fonctionne comme un piège appétissant", "Les comparaisons animales montrent que le peuple est attiré vers sa propre capture. L'image de l'appât explique comment le plaisir rend l'obéissance désirable.", "Le piège politique marche parce qu'il se présente comme un plaisir immédiat.", [
          figure("f18", "Comparaison animale", "oiseau... au piège / poisson... à l’hameçon", "Le peuple est assimilé à une proie facile à capturer.", 12),
          figure("f19", "Métaphore de l'appât", "friandise du ver", "Ce qui attire le poisson correspond aux plaisirs qui attirent le peuple.", 12),
          figure("f20", "Verbe sensoriel", "s’allèchent", "La servitude passe par le désir et non par la contrainte frontale.", 13),
          figure("f21", "Image légère", "la moindre plume... sous la bouche", "Il suffit d'un plaisir minime pour attirer les peuples vers l'obéissance.", 13),
          figure("f22", "Métaphore tactile", "dès lors qu’on les chatouille", "La manipulation paraît douce, mais elle produit l'asservissement.", 14),
        ]),
      ]),
      movement("m3", "III. L'abrutissement des peuples par le divertissement", 15, 17, ["spectacles", "appâts", "habitude"], [
        section("m3a", "Les spectacles forment un système complet de domination", "La longue liste des divertissements montre que la tyrannie multiplie les plaisirs pour occuper le regard et l'esprit du peuple.", "La distraction devient une politique organisée.", [
          figure("f23", "Accumulation", "théâtres, jeux, farces, spectacles, gladiateurs", "La profusion donne l'image d'un peuple saturé de divertissements.", 15),
          figure("f24", "Métaphore", "appâts de la servitude", "Les plaisirs sont des pièges qui conduisent à l'obéissance.", 15),
          figure("f25", "Antithèse", "prix de leur liberté / outils de la tyrannie", "Ce que les peuples prennent pour un gain est en réalité la perte de leur liberté.", 15),
        ]),
        section("m3b", "Le peuple est endormi sous le joug", "La Boétie insiste sur l'habitude : les sujets s'accoutument à servir parce que leur attention est captée par des images et des plaisirs.", "La servitude devient durable quand elle se transforme en habitude agréable.", [
          figure("f26", "Verbe d'assoupissement", "endormir leurs sujets", "La domination agit en diminuant la vigilance politique.", 16),
          figure("f27", "Métaphore de l'asservissement", "sous leur joug", "Le joug rappelle la soumission animale et la perte de liberté.", 16),
          figure("f28", "Comparaison finale", "comme les petits enfants", "Les peuples sont infantilisés par leur attrait pour les images brillantes.", 17),
          figure("f29", "Antithèse implicite", "beaux ces passe-temps / s’accoutumaient à servir", "La beauté du spectacle masque la réalité de l'obéissance.", 17),
        ]),
        section("m3c", "Les images brillantes remplacent le jugement politique", "La dernière comparaison insiste sur la fascination visuelle. Les peuples ressemblent à des enfants captivés par les enluminures : ils regardent ce qui brille et oublient la domination qui les encadre.", "La critique porte sur l'effet des spectacles : ils occupent l'imagination et rendent l'obéissance presque naturelle.", [
          figure("f30", "Champ lexical visuel", "images brillantes", "Le pouvoir agit par attraction du regard.", 17),
          figure("f31", "Objet culturel", "livres enluminés", "L'image donne aux divertissements une apparence séduisante et colorée.", 17),
          figure("f32", "Verbe d'habitude", "s’accoutumaient à servir", "La domination réussit quand elle devient une habitude quotidienne.", 17),
        ]),
      ]),
    ],
    conclusion: [
      {
        id: "conclusion-bilan",
        title: "Bilan",
        simple: "La Boétie montre que le divertissement peut devenir une arme politique : au lieu de contraindre sans cesse par la force, le tyran occupe les esprits, flatte les désirs et habitue les peuples à servir.",
      },
      {
        id: "conclusion-reponse",
        title: "Réponse à la problématique",
        simple: "Le texte répond donc que la domination passe par une ruse : détourner la pensée du peuple par des plaisirs apparemment innocents. La servitude devient alors plus stable, parce qu'elle semble agréable et volontaire.",
      },
      {
        id: "conclusion-ouverture",
        title: "Ouverture",
        simple: "Ce passage peut être rapproché des réflexions modernes sur la propagande et les divertissements de masse, lorsqu'ils servent à détourner l'attention des citoyens.",
      },
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
    context: "La Boétie, écrivain humaniste du XVIe siècle et ami de Montaigne, réfléchit dans le Discours de la servitude volontaire aux raisons qui permettent au tyran d'accéder au pouvoir, puis surtout de s'y maintenir.",
    quizFocus: "La tyrannie fonctionne parce qu'elle s'appuie sur une structure hiérarchique : des courtisans et des favoris, attirés par le profit, deviennent des rouages essentiels de la domination.",
    problematique: "De quelle manière La Boétie multiplie-t-il les images pour dénoncer la part de responsabilité des sujets dans leur servitude ?",
    recap: "La Boétie multiplie les images de maladie, de piraterie et de bois fendu pour montrer que la tyrannie n'est pas seulement imposée d'en haut : elle est entretenue par tout un réseau de complices.",
    opening: "On peut ouvrir sur les critiques modernes de la corruption et du clientélisme.",
    introduction: [
      {
        id: "intro-auteur",
        title: "L'auteur et l'oeuvre",
        simple: "Étienne de La Boétie est un écrivain humaniste du XVIe siècle. Dans le Discours de la servitude volontaire, il ne s'intéresse pas seulement à la violence du tyran : il cherche à comprendre pourquoi un peuple accepte de rester soumis.",
      },
      {
        id: "intro-situation",
        title: "La situation du passage",
        simple: "Après avoir dénoncé les malheurs du peuple et les pièges qui le détournent de la liberté, La Boétie explique ici une autre raison de la servitude : l'existence d'une hiérarchie d'intérêts autour du tyran.",
      },
      {
        id: "intro-enjeu",
        title: "L'enjeu",
        simple: "Le passage réfléchit à la figure du courtisan, rouage essentiel de la tyrannie. Les favoris ne sont pas de simples spectateurs : ils profitent du système et contribuent à le faire durer.",
      },
      {
        id: "intro-plan",
        title: "Annonce du plan",
        simple: "Le texte progresse en trois images : la tyrannie comme maladie contagieuse, le monde des pirates, puis l'idée que les sujets s'asservissent eux-mêmes.",
      },
    ],
    movements: [
      movement("m1", "I. La tyrannie contagieuse", 1, 4, ["profit", "ambition", "avarice"], [
        section("m1a", "La tyrannie devient profitable", "La Boétie commence par une idée scandaleuse : autant de gens trouvent la tyrannie avantageuse que d'autres trouveraient la liberté désirable. La domination tient donc aussi par intérêt.", "Le texte déplace l'analyse : le tyran n'est pas seul, il a des bénéficiaires.", [
          figure("f1", "Antithèse politique", "tyrannie semble profitable / liberté serait agréable", "L'opposition montre que l'intérêt matériel peut l'emporter sur le goût de la liberté.", 1),
          figure("f2", "Polyptote économique", "faveurs / sous-faveurs / gains / regains", "La répétition des mots de profit donne l'image d'un système de redistribution corrupteur.", 1),
          figure("f3", "Généralisation", "autant de gens", "La formule élargit le phénomène : la complicité n'est pas marginale.", 1),
        ]),
        section("m1b", "Le royaume malade attire la corruption", "La comparaison médicale explique le regroupement des mauvais intérêts autour du pouvoir tyrannique. Le tyran agit comme une zone malade vers laquelle se dirigent les éléments corrompus.", "La satire présente la tyrannie comme une infection du corps politique.", [
          figure("f4", "Comparaison médicale", "De même que les médecins disent", "Le raisonnement prend l'apparence d'une observation scientifique.", 2),
          figure("f5", "Métaphore corporelle", "quelque chose de gâté dans notre corps", "La corruption politique est pensée comme une maladie organique.", 2),
          figure("f6", "Expression dépréciative", "cette partie véreuse", "L'image du ver rend la corruption répugnante.", 2),
          figure("f7", "Métaphore sociale", "toute la lie du royaume", "Les favoris sont assimilés au dépôt le plus bas et le plus impur.", 3),
        ]),
        section("m1c", "Les ambitieux se regroupent pour le butin", "La Boétie précise le profil des complices : ambition et avarice. Ils soutiennent le tyran pour obtenir une part du butin et devenir eux-mêmes de petits tyrans.", "La tyrannie se reproduit parce qu'elle offre à certains un pouvoir subalterne.", [
          figure("f8", "Champ lexical moral", "ardente ambition / notable avarice", "Les deux défauts expliquent l'adhésion au tyran.", 4),
          figure("f9", "Verbe de regroupement", "s’amassent autour de lui", "L'image montre l'attraction exercée par le pouvoir corrompu.", 4),
          figure("f10", "Lexique du pillage", "part au butin", "La politique est ramenée à un partage de vol.", 4),
          figure("f11", "Diminutif ironique", "tyranneaux", "Les favoris imitent le tyran à leur échelle.", 4),
        ]),
      ]),
      movement("m2", "II. Le monde des pirates", 5, 10, ["voleurs", "hiérarchie", "butin"], [
        section("m2a", "Les favoris sont assimilés à des criminels", "La comparaison avec les voleurs et les corsaires rabaisse les puissants. Les proches du tyran ne sont pas des serviteurs de l'État, mais une organisation de prédation.", "La satire enlève toute noblesse aux courtisans.", [
          figure("f12", "Comparaison criminelle", "grands voleurs et les fameux corsaires", "Les favoris sont assimilés à des pillards.", 5),
          figure("f13", "Parallélisme", "les uns... les autres", "La répétition organise la description comme une bande où chacun a son rôle.", 6),
          figure("f14", "Champ lexical du crime", "persécutent / embuscade / massacrent / dépouillent", "Les actions attribuées aux favoris relèvent de la violence et du vol.", 6),
        ]),
        section("m2b", "La hiérarchie ne change pas la complicité", "La Boétie reconnaît qu'il existe des rangs dans cette bande, mais tous participent au pillage. Même les subalternes appartiennent au système.", "La tyrannie repose sur une chaîne complète, pas seulement sur quelques chefs.", [
          figure("f15", "Concession", "bien qu’il y ait entre eux des prééminences", "La phrase admet les différences de rang pour mieux montrer la complicité commune.", 7),
          figure("f16", "Antithèse hiérarchique", "valets / chefs de l’assemblée", "Les deux extrêmes de la hiérarchie sont inclus dans le même système.", 7),
          figure("f17", "Négation généralisante", "il n’y en a pas un", "Personne n'est innocent dans la chaîne de profit.", 7),
          figure("f18", "Répétition du butin", "principal butin / recherche", "Même ceux qui ne reçoivent pas le plus gros profit participent à sa quête.", 7),
        ]),
        section("m2c", "L'exemple des pirates élargit la critique", "La référence aux pirates ciliens montre que les systèmes de pillage peuvent attirer des villes entières. La complicité devient politique et territoriale.", "La Boétie donne à la corruption une ampleur collective.", [
          figure("f19", "Exemple historique", "pirates ciliens", "L'exemple renforce l'idée d'une organisation criminelle étendue.", 8),
          figure("f20", "Hyperbole de nombre", "en si grand nombre", "La masse des pirates donne l'image d'un système puissant.", 8),
          figure("f21", "Alliance corruptrice", "attirèrent dans leur alliance plusieurs belles villes", "Même des cités peuvent entrer dans le réseau du butin.", 9),
          figure("f22", "Échange intéressé", "pour récompense... une part du butin", "La protection et le profit fondent l'alliance avec les criminels.", 10),
        ]),
      ]),
      movement("m3", "III. Les sujets s'asservissent eux-mêmes", 11, 12, ["système", "bois", "complicité"], [
        section("m3a", "Le tyran gouverne par intermédiaires", "La conclusion formule clairement le mécanisme : les sujets sont asservis par d'autres sujets. Le tyran est gardé par ceux dont il devrait se méfier.", "La force du tyran vient d'un réseau intérieur de relais et de bénéficiaires.", [
          figure("f23", "Formule synthétique", "les sujets les uns par le moyen des autres", "La phrase résume toute la mécanique de domination indirecte.", 11),
          figure("f24", "Paradoxe politique", "gardé par ceux dont il devrait se méfier", "Ceux qui pourraient renverser le tyran deviennent ses protecteurs.", 11),
          figure("f25", "Condition méprisante", "s’ils valaient quelque chose", "La Boétie condamne moralement les complices du pouvoir.", 11),
        ]),
        section("m3b", "L'image du bois résume la servitude volontaire", "Le proverbe final donne une image simple et forte : on fend le bois avec des coins du même bois. Le tyran divise donc le peuple avec des membres du peuple.", "L'image finale rend mémorisable l'idée centrale du passage : la tyrannie utilise le peuple contre lui-même.", [
          figure("f26", "Proverbe imagé", "pour fendre le bois", "La sagesse proverbiale donne à la conclusion une force évidente.", 12),
          figure("f27", "Métaphore", "les coins du bois même", "Le pouvoir tyrannique utilise la matière même qu'il détruit.", 12),
          figure("f28", "Dernier mot implicite", "même", "Le mot insiste sur l'origine interne de la domination.", 12),
        ]),
        section("m3c", "La conclusion déplace la responsabilité vers le système", "Le proverbe ne désigne pas seulement quelques favoris : il montre une logique générale. La tyrannie prospère lorsqu'elle transforme une partie du peuple en instrument contre le reste du peuple.", "La satire des favoris aboutit donc à une thèse politique : le pouvoir tyrannique tient par relais, intérêts et divisions internes.", [
          figure("f29", "Formule généralisante", "ainsi le tyran", "La conclusion tire de l'image du bois une loi politique.", 12),
          figure("f30", "Métaphore de l'instrument", "coins", "Les complices deviennent des outils utilisés pour briser le corps social.", 12),
          figure("f31", "Répétition de la matière", "bois même", "La domination est interne : elle exploite les ressources du groupe dominé.", 12),
        ]),
      ]),
    ],
    conclusion: [
      {
        id: "conclusion-bilan",
        title: "Bilan",
        simple: "La Boétie convoque plusieurs images frappantes pour dénoncer un système politique fondé sur la tyrannie, la corruption, la violence et l'oppression.",
      },
      {
        id: "conclusion-reponse",
        title: "Réponse à la problématique",
        simple: "La responsabilité des sujets apparaît dans le réseau hiérarchisé qu'ils acceptent de construire : chacun obéit à plus puissant que soi en espérant obtenir une part de profit ou un petit pouvoir.",
      },
      {
        id: "conclusion-ouverture",
        title: "Ouverture",
        simple: "Cette analyse annonce les critiques modernes des systèmes de cour, du clientélisme et de toutes les formes de pouvoir qui récompensent la soumission.",
      },
    ],
  }),
  makeText({
    slug: "discours-du-vieux-tahitien",
    title: "Le discours du vieux Tahitien",
    author: "Denis Diderot",
    sourceLabel: "Supplément au voyage de Bougainville, 1772",
    lines: sourceTexts.diderotTahitien,
    context: "Diderot, philosophe des Lumières et directeur de l'Encyclopédie avec d'Alembert, utilise la fiction du voyage pour questionner la prise de possession de nouveaux territoires par les Européens.",
    quizFocus: "Le discours inverse le regard colonial : le vieux Tahitien juge Bougainville et défend l'idée que l'homme naturel, libre et proche de la nature, vaut moralement mieux que l'homme civilisé corrompu par la propriété et la domination.",
    problematique: "En quoi le discours du vieux Tahitien vise-t-il à persuader le lecteur que l'homme naturel est plus heureux et meilleur que l'homme civilisé ?",
    recap: "Diderot donne au vieux Tahitien une parole d'accusation, oppose la liberté naturelle aux valeurs européennes de propriété et de conquête, puis affirme une égalité humaine qui rend l'esclavage illégitime.",
    opening: "On peut ouvrir sur Montaigne, qui remet aussi en question l'ethnocentrisme européen.",
    introduction: [
      {
        id: "intro-lumieres",
        title: "Le contexte des Lumières",
        simple: "Au XVIIIe siècle, les philosophes des Lumières héritent de l'humanisme et utilisent la raison pour interroger les préjugés, les pouvoirs établis et la domination européenne.",
      },
      {
        id: "intro-auteur",
        title: "Diderot et l'oeuvre",
        simple: "Diderot est un philosophe majeur des Lumières, directeur de l'Encyclopédie avec d'Alembert. En 1772, il rédige le Supplément au voyage de Bougainville, un dialogue fictif qui réfléchit à la liberté, au bonheur et à la morale.",
      },
      {
        id: "intro-passage",
        title: "La situation du passage",
        simple: "Dans cet extrait, Diderot donne la parole à un vieux Tahitien qui s'adresse directement à Bougainville. Cette voix oppose l'homme naturel, libre et proche de la nature, à l'homme européen, présenté comme artificiel et corrompu.",
      },
      {
        id: "intro-plan",
        title: "Annonce du plan",
        simple: "Le discours progresse en trois temps : le combat indigné du vieillard, le réquisitoire contre les valeurs européennes, puis la revendication de l'égalité entre Tahitiens et Européens.",
      },
    ],
    movements: [
      movement("m1", "I. Le combat indigné du vieillard", 1, 10, ["accusation", "bonheur", "corruption"], [
        section("m1a", "Bougainville est traité en brigand", "Le discours s'ouvre par une apostrophe violente. Diderot inverse le récit héroïque de l'exploration : le navigateur européen devient le chef d'une bande de voleurs.", "Le point de vue colonisé juge le colonisateur.", [
          figure("f1", "Apostrophe", "Et toi", "L'adresse directe donne au discours une force de confrontation.", 1),
          figure("f2", "Périphrase accusatrice", "chef des brigands", "Bougainville n'est plus explorateur, mais responsable d'une violence collective.", 1),
          figure("f3", "Impératif", "écarte promptement ton vaisseau", "Le Tahitien chasse l'Européen de son territoire.", 1),
        ]),
        section("m1b", "Le bonheur tahitien est opposé à la nuisance européenne", "Le Tahitien présente son peuple comme innocent, heureux et proche de la nature. La présence européenne ne peut qu'abîmer cet équilibre.", "La critique de la colonisation passe par un contraste entre harmonie naturelle et corruption importée.", [
          figure("f4", "Parallélisme", "Nous sommes innocents, nous sommes heureux", "La répétition donne une image simple et stable de la société tahitienne.", 2),
          figure("f5", "Restriction accusatrice", "tu ne peux que nuire", "L'Européen est réduit à une puissance de destruction.", 2),
          figure("f6", "Lexique de la nature", "pur instinct de la nature", "La nature sert de référence morale contre la civilisation européenne.", 3),
          figure("f7", "Verbe destructeur", "effacer de nos âmes", "La colonisation menace l'identité profonde du peuple tahitien.", 3),
        ]),
        section("m1c", "L'Europe introduit propriété, jalousie et violence", "Le discours accuse Bougainville d'avoir importé la propriété, la jalousie sexuelle, la haine et le sang. La colonisation est donc décrite comme une corruption morale et sociale.", "Diderot ne critique pas seulement la prise de territoire : il critique les effets humains de la domination.", [
          figure("f8", "Antithèse sociale", "tout est à tous / tien et du mien", "La propriété européenne s'oppose à la communauté tahitienne.", 4),
          figure("f9", "Champ lexical de la passion destructrice", "fureurs / folles / féroce / haïr / égorgés / sang", "La rencontre avec les Européens transforme les relations en violence.", 6, 8),
          figure("f10", "Parallélisme accusateur", "Elles sont devenues... tu es devenu...", "La construction met en miroir la corruption des femmes et la férocité de l'Européen.", 7),
          figure("f11", "Métaphore juridique", "le titre de notre futur esclavage", "L'écrit européen devient l'instrument légal d'une domination à venir.", 9),
          figure("f12", "Question rhétorique", "qui es-tu donc, pour faire des esclaves ?", "La question refuse toute légitimité à Bougainville.", 10),
        ]),
      ]),
      movement("m2", "II. Le réquisitoire contre les valeurs européennes", 11, 17, ["liberté", "terre", "possession"], [
        section("m2a", "Le titre de propriété est rendu absurde", "Orou traduit l'inscription européenne : le pays serait à Bougainville. La réponse du Tahitien ridiculise immédiatement ce droit fondé sur un simple passage.", "Diderot attaque la fiction juridique qui transforme la présence en possession.", [
          figure("f13", "Mise en scène de traduction", "Orou ! toi qui entends la langue", "L'interprète rend visible la rencontre entre deux systèmes de pensée.", 11),
          figure("f14", "Objet symbolique", "cette lame de métal", "Le métal représente l'inscription coloniale, froide et artificielle.", 11),
          figure("f15", "Phrase de possession", "Ce pays est à nous", "La formule résume brutalement la prétention coloniale.", 11),
          figure("f16", "Question rhétorique", "et pourquoi ? parce que tu y as mis le pied ?", "La question dénonce l'absurdité d'un droit fondé sur la simple arrivée.", 12),
        ]),
        section("m2b", "Le renversement imaginaire démonte l'injustice", "Le Tahitien imagine la situation inverse : si un Tahitien déclarait posséder une côte européenne, les Européens jugeraient cette prétention scandaleuse.", "Le raisonnement par inversion oblige le lecteur européen à appliquer à lui-même ce qu'il impose aux autres.", [
          figure("f17", "Hypothèse argumentative", "Si un Tahitien débarquait un jour sur vos côtes", "Le scénario inverse la relation coloniale pour révéler son injustice.", 13),
          figure("f18", "Question directe", "qu’en penserais-tu ?", "Le Tahitien place Bougainville devant sa contradiction.", 13),
          figure("f19", "Symétrie", "vos côtes / habitants de Tahiti", "La symétrie met les peuples sur un pied d'égalité.", 13),
        ]),
        section("m2c", "La force ne crée pas le droit", "Le Tahitien admet la supériorité matérielle de l'Européen, mais refuse qu'elle donne un droit moral. Il accuse ensuite Bougainville de punir un petit vol tout en préparant un vol immense.", "La critique oppose la puissance de fait à la justice.", [
          figure("f20", "Exclamation", "Tu es le plus fort !", "La force est reconnue mais immédiatement contestée.", 14),
          figure("f21", "Question brève", "Et qu’est-ce que cela fait ?", "La question annule la prétention morale de la force.", 14),
          figure("f22", "Antithèse de proportion", "méprisables bagatelles / le vol de toute une contrée", "Le petit vol reproché aux Tahitiens contraste avec le vol colonial d'un pays entier.", 15, 17),
          figure("f23", "Métaphore intérieure", "au fond de ton cœur", "La conquête est présentée comme une intention secrète et coupable.", 17),
        ]),
      ]),
      movement("m3", "III. La revendication de l'égalité entre Tahitiens et Européens", 18, 23, ["fraternité", "nature", "droit"], [
        section("m3a", "L'Européen est pris dans sa contradiction", "Bougainville refuse pour lui-même l'esclavage, mais veut l'imposer aux Tahitiens. Le discours révèle l'incohérence morale du colonisateur.", "Le Tahitien transforme la liberté européenne en argument contre la colonisation.", [
          figure("f24", "Antithèse", "Tu n’es pas esclave / tu veux nous asservir", "La contradiction européenne est formulée de façon nette.", 18),
          figure("f25", "Hyperbole morale", "tu souffrirais la mort plutôt que de l’être", "La phrase rappelle que la liberté vaut plus que la vie pour Bougainville lui-même.", 18),
          figure("f26", "Question rhétorique", "ne sait pas défendre sa liberté et mourir ?", "Le Tahitien revendique la même dignité guerrière et morale.", 19),
        ]),
        section("m3b", "La fraternité naturelle fonde l'égalité", "Le Tahitien refuse d'être traité comme une bête et affirme une fraternité naturelle entre les peuples. Aucun droit de domination ne peut naître d'une différence de force.", "La nature sert ici à fonder l'égalité, pas l'infériorité.", [
          figure("f27", "Comparaison dégradante", "comme de la brute", "La formule dénonce la déshumanisation coloniale.", 20),
          figure("f28", "Déclaration fraternelle", "le Tahitien est ton frère", "La phrase affirme une égalité humaine directe.", 20),
          figure("f29", "Métaphore familiale", "deux enfants de la nature", "Les deux peuples sont rattachés à une même origine.", 21),
          figure("f30", "Question de droit", "quel droit as-tu sur lui qu’il n’ait pas sur toi ?", "La question formule le principe d'égalité réciproque.", 21),
        ]),
        section("m3c", "Les questions finales prouvent la supériorité morale tahitienne", "Le vieux Tahitien rappelle que son peuple n'a ni attaqué Bougainville, ni pillé son vaisseau, ni réduit les Européens à l'état d'animaux. La conclusion oppose le respect tahitien à la violence coloniale.", "Diderot achève la critique en donnant la leçon morale au peuple prétendument civilisé.", [
          figure("f31", "Anaphore interrogative", "avons-nous / T’avons-nous / T’avons-nous", "La répétition énumère tout ce que les Tahitiens n'ont pas fait.", 22, 23),
          figure("f32", "Champ lexical de la violence refusée", "jetés / pillé / saisi / exposé", "Les verbes décrivent les violences que les Tahitiens auraient pu commettre mais n'ont pas commises.", 22, 23),
          figure("f33", "Antithèse implicite", "travail de nos animaux / notre image en toi", "Le texte oppose la réduction en bête et la reconnaissance de l'humanité.", 23),
          figure("f34", "Formule finale humaniste", "Nous avons respecté notre image en toi", "Le Tahitien reconnaît dans l'Européen un semblable, là où l'Européen veut dominer.", 23),
        ]),
      ]),
    ],
    conclusion: [
      {
        id: "conclusion-bilan",
        title: "Bilan",
        simple: "À travers le vieux Tahitien, Diderot touche le lecteur en mettant face à face un discours de révolte et une portée philosophique : la liberté naturelle vaut mieux que la domination civilisée.",
      },
      {
        id: "conclusion-reponse",
        title: "Réponse à la problématique",
        simple: "Le discours persuade parce qu'il montre un peuple heureux avant l'arrivée des Européens, puis révèle que la civilisation apporte surtout propriété, violence, jalousie et esclavage.",
      },
      {
        id: "conclusion-ouverture",
        title: "Ouverture",
        simple: "Le lien avec La Boétie est net : les deux textes défendent la liberté et refusent la soumission, en cherchant à faire réagir le lecteur.",
      },
    ],
  }),
  makeText({
    slug: "blazius-arrive",
    title: "L'arrivée de maître Blazius",
    author: "Alfred de Musset",
    sourceLabel: "On ne badine pas avec l'amour, 1834",
    lines: sourceTexts.mussetBlazius,
    context: "La scène d'ouverture présente l'univers de la pièce sur un ton comique et villageois.",
    quizFocus: "L'ouverture confie l'exposition à un choeur fantaisiste et à un messager grotesque : l'information sérieuse arrive par le détour du comique.",
    problematique: "Comment Musset ouvre-t-il sa pièce de manière originale et comique ?",
    recap: "Musset ouvre sa pièce de manière originale en mêlant choeur, récit et dialogue, puis il rend Blazius burlesque avant de faire annoncer Perdican par une parole savante mais déjà ironisée.",
    opening: "On peut ouvrir sur le rôle du choeur antique, réinventé ici de façon fantaisiste.",
    movements: [
      movement("m1", "I. Une entrée très théâtrale", 1, 4, ["choeur", "portrait", "comique"], [
        section("m1a", "Un choeur pour ouvrir la scène", "Musset commence par un dispositif théâtral inhabituel : le choeur décrit l'arrivée de Blazius avant que celui-ci ne parle. L'ouverture tient donc du récit autant que du dialogue.", "L'originalité vient de cette voix collective qui installe le décor et guide le regard du spectateur.", [
          figure("f1", "Didascalie spatiale", "Une place devant le château", "Le lieu ouvre immédiatement un espace scénique visible.", 1),
          figure("f2", "Référence au choeur", "LE CHOEUR", "Musset reprend un héritage antique mais l'utilise dans une scène villageoise et comique.", 2),
          figure("f3", "Participe descriptif", "Doucement bercé", "L'entrée de Blazius est présentée comme un petit spectacle en mouvement.", 2),
        ]),
        section("m1b", "Blazius est un personnage burlesque", "Le portrait insiste sur le corps, la mollesse et le ridicule. Blazius est associé à un enfant, à un ventre rebondi, puis à un triple menton.", "Le comique naît du décalage entre le statut de maître et l'image très corporelle du personnage.", [
          figure("f4", "Comparaison dégradante", "Comme un poupon sur l'oreiller", "Blazius est infantilisée par l'image du bébé bercé.", 3),
          figure("f5", "Champ lexical du corps", "ventre rebondi / triple menton", "La description rabaisse le personnage à son apparence physique.", 3),
          figure("f6", "Détail religieux comique", "il marmotte un Pater noster", "La prière devient un murmure ridicule, perdu dans le portrait corporel.", 3),
        ]),
        section("m1c", "Une grandeur aussitôt parodiée", "Le choeur salue Blazius comme un personnage important, mais le compare à une amphore. L'image valorise et ridiculise en même temps.", "La scène annonce un théâtre où les beaux signes sont toujours traversés par l'ironie.", [
          figure("f7", "Apostrophe", "Salut, maître Blazius", "Le salut donne une solennité parodique à l'entrée du personnage.", 4),
          figure("f8", "Repère saisonnier", "au temps de la vendange", "Le décor rural rattache la scène au village et au vin.", 4),
          figure("f9", "Comparaison burlesque", "pareil à une amphore antique", "L'image antique est noble, mais l'amphore évoque aussi le vin et le ventre de Blazius.", 4),
        ]),
      ]),
      movement("m2", "II. Une parole liée au vin", 5, 6, ["boire", "attente", "comique"], [
        section("m2a", "La nouvelle est retardée par la gourmandise", "Blazius annonce qu'il possède une information importante, mais il exige d'abord du vin. L'exposition dramatique est donc suspendue par un besoin trivial.", "Le messager est comique parce que son appétit passe avant sa mission.", [
          figure("f10", "Périphrase d'attente", "une nouvelle d'importance", "L'expression crée une attente d'exposition.", 5),
          figure("f11", "Condition comique", "m'apportent ici premièrement un verre de vin frais", "L'information est conditionnée par une récompense à boire.", 5),
          figure("f12", "Adverbe d'ordre", "premièrement", "Le mot place le vin avant la nouvelle et produit le comique.", 5),
        ]),
        section("m2b", "Le choeur entre dans le jeu comique", "Le choeur ne condamne pas Blazius : il lui donne à boire et accepte qu'il parle après. La scène devient une petite cérémonie comique autour du vin.", "L'exposition est collective, vivante et détournée par le plaisir.", [
          figure("f13", "Objet comique", "notre plus grande écuelle", "Le récipient accentue le caractère gourmand et rustique de la scène.", 6),
          figure("f14", "Impératif", "buvez, maître Blazius", "Le choeur encourage le défaut du personnage.", 6),
          figure("f15", "Chute temporelle", "vous parlerez après", "La parole sérieuse est repoussée au second plan.", 6),
        ]),
        section("m2c", "Le vin règle le rythme de l'exposition", "La scène ne livre pas l'information d'un seul coup : elle organise une attente comique. Le vin devient le passage obligé entre l'arrivée spectaculaire de Blazius et l'annonce de Perdican.", "Musset transforme une fonction classique d'exposition en jeu de scène : le public apprend, mais après un détour burlesque.", [
          figure("f15a", "Répétition du titre", "maître Blazius", "L'adresse maintient une solennité comique autour d'un personnage dominé par sa gourmandise.", 6),
          figure("f15b", "Suspension de la parole", "après", "Le mot retarde l'information et crée le rythme de la scène.", 6),
          figure("f15c", "Contraste de registres", "écuelle / parlerez", "L'objet rustique précède la parole savante : l'exposition passe par le corps et le comique.", 6),
        ]),
      ]),
      movement("m3", "III. Perdican est annoncé", 7, 16, ["Perdican", "savoir", "ironie"], [
        section("m3a", "L'information sérieuse arrive enfin", "Blazius annonce le retour de Perdican, devenu majeur et docteur. La scène remplit donc sa fonction d'exposition, mais par une voix comique.", "Le spectateur apprend l'entrée prochaine du héros tout en gardant une distance ironique.", [
          figure("f16", "Formule d'annonce", "Vous saurez, mes enfants", "Blazius prend une posture de maître qui s'adresse au village.", 7),
          figure("f17", "Statut social", "fils de notre seigneur", "Perdican est présenté comme un personnage central et noble.", 7),
          figure("f18", "Double événement", "majorité / docteur à Paris", "Le retour de Perdican est associé à l'âge adulte et au savoir.", 7),
        ]),
        section("m3b", "Le savoir de Perdican est admiré et moqué", "Blazius admire les discours de Perdican, mais l'abondance des images donne aussi une impression d'excès. Le savoir devient brillant, fleuri, presque théâtral.", "Le texte prépare l'importance des paroles dans la pièce : séduire, convaincre, se protéger.", [
          figure("f19", "Métaphore florale", "façons de parler si belles et si fleuries", "Le langage de Perdican est présenté comme séduisant mais peut-être décoratif.", 8),
          figure("f20", "Hyperbole", "un livre d'or", "L'image valorise Perdican comme incarnation du savoir.", 9),
          figure("f21", "Détail savant", "comment cela s'appelle en latin", "La culture de Perdican est montrée dans des gestes quotidiens.", 10),
          figure("f22", "Comparaison hyperbolique", "des yeux grands comme la porte", "La réaction attendue du public villageois rend le savoir spectaculaire.", 12),
        ]),
        section("m3c", "Le messager redevient comique", "Après l'annonce de Perdican, Blazius ramène la scène à son confort : chaise, mule, cou, gorgée. L'ouverture se referme sur le corps comique du messager.", "Musset installe un mélange durable de sérieux et de fantaisie.", [
          figure("f23", "Métaphore précieuse", "un diamant fin des pieds à la tête", "La formule idéalise Perdican tout en conservant une emphase comique.", 13),
          figure("f24", "Retour au corps", "sans me casser le cou", "La préoccupation physique de Blazius casse la noblesse de l'annonce.", 15),
          figure("f25", "Personnification animale légère", "La bête est tant soit peu rétive", "La mule prolonge le comique de scène.", 16),
          figure("f26", "Boucle comique", "boire encore une gorgée", "La fin revient au trait dominant de Blazius : la gourmandise.", 16),
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
    quizFocus: "La tirade part d'une attaque contre l'éducation religieuse de Camille, traverse une vision noire du monde, puis sauve l'amour comme expérience douloureuse mais authentique.",
    problematique: "Comment Perdican transforme-t-il une dispute amoureuse en éloge de la vie ?",
    recap: "Perdican transforme la dispute en éloge de la vie en accusant les nonnes d'avoir fabriqué un être factice, en assumant la corruption du monde, puis en affirmant que l'amour, même blessant, prouve qu'on a vraiment vécu.",
    opening: "On peut ouvrir sur le romantisme, qui valorise l'expérience intense même douloureuse.",
    movements: [
      movement("m1", "I. L'accusation du couvent", 1, 13, ["religion", "enfance", "coeur"], [
        section("m1a", "Une attaque frontale contre les nonnes", "Perdican commence par interroger Camille, mais ses questions visent surtout les nonnes. Il accuse leur discours de transformer l'amour en mensonge et de détourner Camille de la vie.", "Le conflit amoureux devient un procès de l'éducation reçue.", [
          figure("f1", "Question directe", "Sais-tu ce que c'est que des nonnes", "La tirade s'ouvre comme une mise en accusation.", 1),
          figure("f2", "Apostrophe accusatrice", "malheureuse fille", "Perdican place Camille en victime d'une éducation qu'il dénonce.", 1),
          figure("f3", "Antithèse religieuse", "l'amour des hommes / l'amour divin", "Il oppose l'amour humain et l'amour religieux pour critiquer le couvent.", 2),
          figure("f4", "Champ lexical moral", "mensonge / crime", "Le vocabulaire transforme la leçon des nonnes en faute grave.", 2, 3),
        ]),
        section("m1b", "La leçon du couvent a effacé l'enfance", "Perdican rappelle les signes du passé commun : la main refusée, le bois, la fontaine, les jours d'enfance. Le reproche devient affectif.", "La dispute oppose la mémoire vivante de l'enfance à la rigidité apprise au couvent.", [
          figure("f5", "Exclamation", "Ah ! comme elles t'ont fait la leçon !", "L'exclamation condense colère et regret.", 4),
          figure("f6", "Anaphore", "Tu voulais / tu ne voulais / Tu reniais", "La répétition accumule les refus de Camille.", 6, 7),
          figure("f7", "Personnification pathétique", "cette pauvre petite fontaine qui nous regarde tout en larmes", "Le lieu d'enfance semble pleurer la séparation.", 6),
          figure("f8", "Métaphore", "le masque de plâtre", "Le visage de Camille paraît figé par l'éducation religieuse.", 8),
        ]),
        section("m1c", "Le coeur résiste à la leçon", "Perdican oppose au masque et aux discours le battement du coeur. Le coeur ne sait pas lire : il échappe donc à la leçon apprise.", "La vie intérieure de Camille contredit l'être artificiel fabriqué par le couvent.", [
          figure("f9", "Personnification", "ton cœur a battu", "Le coeur devient un personnage qui répond à la place de Camille.", 9),
          figure("f10", "Antithèse", "il a oublié sa leçon / lui qui ne sait pas lire", "L'ignorance du coeur devient une vérité supérieure aux discours appris.", 9),
          figure("f11", "Retour au lieu naturel", "t'asseoir sur l'herbe", "L'herbe oppose le monde vivant au couvent.", 9),
          figure("f12", "Ironie amère", "ces femmes ont bien parlé", "Perdican feint d'approuver les nonnes avant de les condamner.", 10),
          figure("f13", "Sentence d'exclusion", "le ciel n'est pas pour elles", "La formule retourne le vocabulaire religieux contre les nonnes.", 11),
        ]),
      ]),
      movement("m2", "II. Une vision noire du monde", 14, 16, ["généralisation", "violence", "dégoût"], [
        section("m2a", "La parole devient réquisitoire", "Après le départ symbolique de Camille vers le couvent, Perdican formule ce qu'elle devra répondre aux récits qui l'ont empoisonnée. Il reprend la noirceur du discours qu'il combat.", "Le mouvement est volontairement excessif : il prépare le retournement vers l'amour.", [
          figure("f14", "Impératifs de rupture", "Adieu / retourne", "Perdican pousse Camille vers le couvent tout en continuant à argumenter.", 13),
          figure("f15", "Métaphore toxique", "récits hideux qui t'ont empoisonnée", "Les discours religieux sont présentés comme un poison moral.", 13),
          figure("f16", "Verbe d'énonciation", "réponds ce que je vais te dire", "Perdican construit sa tirade comme une réponse à transmettre.", 13),
        ]),
        section("m2b", "Les hommes et les femmes sont condamnés en bloc", "Perdican accumule les défauts des hommes puis des femmes. Cette généralisation donne au monde une apparence totalement corrompue.", "La violence de la liste rend crédible l'idée que l'amour expose à la souffrance.", [
          figure("f17", "Énumération", "menteurs, inconstants, faux, bavards", "L'accumulation produit un effet d'accablement.", 14),
          figure("f18", "Gradation péjorative", "lâches, méprisables et sensuels", "La liste se termine sur une condamnation morale et physique.", 14),
          figure("f19", "Parallélisme", "Tous les hommes / Toutes les femmes", "La structure condamne symétriquement les deux sexes.", 14, 15),
          figure("f20", "Énumération au féminin", "perfides, artificieuses, vaniteuses", "Le second inventaire prolonge la vision noire du monde.", 15),
        ]),
        section("m2c", "Le monde est représenté comme un espace répugnant", "La métaphore de l'égout donne à la corruption morale une image concrète et violente. Perdican ne nie pas la laideur du monde : il va faire surgir l'amour malgré elle.", "L'éloge final sera plus fort parce qu'il naît d'un monde décrit comme affreux.", [
          figure("f21", "Métaphore dégradante", "un égout sans fond", "Le monde est assimilé à un lieu de saleté infinie.", 16),
          figure("f22", "Animalisation", "phoques les plus informes", "Les êtres humains sont rabaissés à des corps grotesques.", 16),
          figure("f23", "Hyperbole visuelle", "des montagnes de fange", "La boue devient immense, presque impossible à dépasser.", 16),
        ]),
      ]),
      movement("m3", "III. L'amour sauve la vie", 17, 22, ["amour", "souffrance", "vérité"], [
        section("m3a", "L'amour surgit malgré l'imperfection", "Le connecteur mais introduit le retournement : au sein d'un monde laid, il existe une chose sainte et sublime. L'amour vaut précisément parce qu'il unit des êtres imparfaits.", "Perdican ne défend pas un amour pur, mais un amour humain.", [
          figure("f24", "Connecteur d'opposition", "Mais", "Le mot renverse la vision noire du mouvement précédent.", 17),
          figure("f25", "Antithèse valorisante", "sainte et sublime / imparfaits et affreux", "La grandeur de l'amour naît de la faiblesse humaine.", 17),
          figure("f26", "Formule absolue", "une chose sainte et sublime", "L'amour reçoit une valeur quasi sacrée.", 17),
        ]),
        section("m3b", "La souffrance n'annule pas l'amour", "Perdican enchaîne les participes trompé, blessé, malheureux, puis les dépasse par la formule mais on aime. La douleur devient une composante de l'expérience, non une raison de la fuir.", "L'amour est défendu comme vérité vécue, pas comme bonheur garanti.", [
          figure("f27", "Anaphore", "souvent trompé / souvent blessé / souvent malheureux", "La répétition reconnaît la fréquence de la souffrance amoureuse.", 18),
          figure("f28", "Opposition brève", "mais on aime", "La brièveté donne à l'amour la force d'une évidence.", 18),
          figure("f29", "Image de bilan", "sur le bord de sa tombe", "La valeur de l'amour se mesure au moment de regarder toute une vie.", 19),
        ]),
        section("m3c", "Aimer prouve qu'on a vécu", "La conclusion de Perdican transforme la souffrance en preuve d'existence. L'être qui refuse l'amour devient factice, fabriqué par l'orgueil et l'ennui.", "La tirade répond à la problématique : Perdican passe de la dispute à une définition de la vraie vie.", [
          figure("f30", "Discours direct", "J'ai souffert souvent... mais j'ai aimé", "La phrase sonne comme un bilan de vie assumé.", 20),
          figure("f31", "Antithèse", "vécu / être factice", "L'amour oppose la vie authentique à l'existence artificielle.", 21),
          figure("f32", "Champ lexical du faux", "être factice / créé", "Ce vocabulaire condamne l'identité fabriquée par le refus d'aimer.", 21),
          figure("f33", "Sortie scénique", "Il sort", "La tirade se clôt sur un geste net qui laisse Camille face aux paroles entendues.", 22),
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
    quizFocus: "La scène détourne les codes de la déclaration amoureuse : Perdican parle à Rosette, mais il vise Camille et transforme les objets amoureux en instruments de revanche.",
    problematique: "Comment cette déclaration amoureuse devient-elle une manipulation ?",
    recap: "La déclaration devient manipulation parce que Perdican organise une double adresse, met en scène la chaîne et la bague pour blesser Camille, puis oppose la nature et la jeunesse de Rosette à l'éducation religieuse de Camille.",
    opening: "On peut ouvrir sur le titre de la pièce : on ne joue pas sans danger avec l'amour.",
    movements: [
      movement("m1", "I. Une déclaration destinée à Camille", 1, 5, ["double adresse", "Rosette", "Camille"], [
        section("m1a", "La parole est organisée pour être entendue", "La didascalie précise que Perdican parle à haute voix pour Camille. Le spectateur sait donc que Rosette n'est pas la seule destinataire.", "La manipulation commence avant même le contenu de la déclaration : elle est dans la situation d'énonciation.", [
          figure("f1", "Didascalie de double adresse", "à haute voix, de manière que Camille l'entende", "Le théâtre révèle la stratégie de Perdican.", 1),
          figure("f2", "Déclaration directe", "Je t'aime, Rosette", "La formule amoureuse paraît simple, mais elle est immédiatement piégée par la double adresse.", 1),
          figure("f3", "Nom propre", "Rosette", "Le prénom donne l'impression d'une parole intime, alors qu'elle est destinée à être entendue par une autre.", 1),
        ]),
        section("m1b", "Rosette est valorisée contre Camille", "Perdican affirme que Rosette seule n'a rien oublié. Il oppose implicitement sa fidélité à l'oubli ou au reniement de Camille.", "Rosette devient un instrument de comparaison.", [
          figure("f4", "Anaphore", "toi seule / Toi seule", "La répétition isole Rosette comme figure de fidélité.", 1, 2),
          figure("f5", "Champ lexical du souvenir", "oublié / souviens / beaux jours passés", "Le souvenir sert à opposer Rosette à Camille.", 1, 2),
          figure("f6", "Antithèse temporelle", "vie qui n'est plus / vie nouvelle", "Perdican transforme le passé partagé en promesse d'avenir.", 2, 3),
        ]),
        section("m1c", "Le don de la chaîne matérialise le jeu amoureux", "La chaîne posée sur le cou de Rosette donne un signe visible à la déclaration. Mais ce signe est théâtral : il doit être vu et compris par Camille.", "L'objet amoureux devient accessoire de scène.", [
          figure("f7", "Impératif de don", "donne-moi ton cœur", "Perdican demande un engagement affectif à Rosette.", 3),
          figure("f8", "Objet symbolique", "le gage de notre amour", "La chaîne devient la preuve visible d'une relation affichée.", 3),
          figure("f9", "Didascalie gestuelle", "Il lui pose sa chaîne sur le cou", "Le geste rend la déclaration spectaculaire.", 4),
          figure("f10", "Réplique naïve", "Vous me donnez votre chaîne en or ?", "Rosette comprend d'abord l'objet concret, ce qui révèle son innocence.", 5),
        ]),
      ]),
      movement("m2", "II. Les objets symbolisent la rupture", 6, 17, ["source", "bague", "image"], [
        section("m2a", "La fontaine devient un miroir de théâtre", "Perdican amène Rosette près de la fontaine et l'invite à regarder leur reflet. L'amour est mis en scène comme une image à produire sous les yeux de Camille.", "La manipulation passe par le regard : il faut que Camille voie ce qu'on lui retire.", [
          figure("f11", "Impératifs", "Regarde / Lève-toi / approchons-nous", "Perdican dirige les gestes et le regard de Rosette.", 6, 7),
          figure("f12", "Question visuelle", "Nous vois-tu tous les deux", "La scène force Rosette à regarder le couple formé dans l'eau.", 8),
          figure("f13", "Image de l'union", "ta main dans la mienne", "Le reflet fabrique une image intime du couple.", 9),
        ]),
        section("m2b", "La bague de Camille est effacée symboliquement", "Perdican jette la bague dans l'eau, puis demande à Rosette de regarder l'image disparaître. L'objet de Camille est sacrifié dans un geste visible.", "Le geste ne rompt pas seulement avec Camille : il cherche à la blesser.", [
          figure("f14", "Impératif", "Regarde tout cela s'effacer", "Perdican transforme l'effacement en spectacle.", 10),
          figure("f15", "Didascalie symbolique", "Il jette la bague dans l'eau", "La bague représente le lien avec Camille, rejeté dans la source.", 11),
          figure("f16", "Constat de disparition", "notre image a disparu", "L'eau matérialise la disparition momentanée du couple.", 12),
          figure("f17", "Aparté de Camille", "Il a jeté ma bague dans l'eau", "Le spectateur vérifie que la stratégie atteint bien Camille.", 17),
        ]),
        section("m2c", "L'eau troublée rend visible le trouble amoureux", "La source reprend peu à peu son équilibre, mais de grands cercles noirs restent à la surface. Le paysage reflète la violence émotionnelle de la scène.", "L'objet et le décor portent la signification : l'amour devient image, trouble et retour trompeur à l'ordre.", [
          figure("f18", "Personnification", "l'eau qui s'était troublée reprend son équilibre", "L'eau semble ressentir puis apaiser le trouble causé par le geste.", 13),
          figure("f19", "Image inquiétante", "de grands cercles noirs", "La noirceur visuelle suggère une blessure dans la scène amoureuse.", 13),
          figure("f20", "Temporalité de l'attente", "Patience / Encore une minute", "Perdican dirige le temps de la scène comme un metteur en scène.", 14, 15),
          figure("f21", "Révélation finale", "une bague que m'avait donnée Camille", "Le sens réel du geste apparaît : Rosette sert à atteindre Camille.", 16),
        ]),
      ]),
      movement("m3", "III. Rosette reste naïve", 18, 25, ["innocence", "décalage", "cruauté"], [
        section("m3a", "Perdican rejoue le grand discours amoureux", "Perdican demande à Rosette si elle sait ce qu'est l'amour, puis convoque le vent, la pluie, le soleil. Sa parole prend une ampleur lyrique.", "La beauté du discours rend la manipulation plus dangereuse : elle paraît sincère.", [
          figure("f22", "Question reprise", "Sais-tu ce que c'est que l'amour", "La question transforme Rosette en élève d'une leçon sentimentale.", 18),
          figure("f23", "Impératif d'écoute", "Écoute !", "Perdican dirige encore la réception de sa parole.", 19),
          figure("f24", "Personnification de la nature", "le vent se tait", "La nature semble suspendue pour accueillir la déclaration.", 19),
          figure("f25", "Image précieuse", "la pluie du matin roule en perles", "Le décor naturel embellit la scène amoureuse.", 19),
        ]),
        section("m3b", "Rosette est opposée à Camille", "Perdican valorise la jeunesse, le sang vermeil, le refus du couvent. Rosette devient l'image d'une nature non corrompue, opposée à Camille et aux nonnes.", "La déclaration est aussi une vengeance idéologique contre l'éducation religieuse.", [
          figure("f26", "Serment lyrique", "Par la lumière du ciel, par le soleil", "Perdican donne à sa déclaration une solennité presque sacrée.", 20),
          figure("f27", "Question de consentement", "Tu veux bien de moi, n'est-ce pas ?", "La question cherche l'adhésion de Rosette tout en gardant une pression affective.", 21),
          figure("f28", "Métaphore de la corruption", "flétri ta jeunesse", "Rosette est présentée comme une jeunesse non fanée.", 22),
          figure("f29", "Antithèse physique", "sang vermeil / sang affadi", "Le sang vivant de Rosette s'oppose au sang affaibli associé au couvent.", 22),
          figure("f30", "Opposition au religieux", "Tu ne veux as te faire religieuse", "Perdican oppose Rosette à la vocation religieuse de Camille.", 23),
        ]),
        section("m3c", "La réponse de Rosette révèle le décalage", "Rosette répond avec humilité et maladresse. Elle ne possède ni le langage brillant de Perdican ni la stratégie de Camille : sa sincérité rend la manipulation cruelle.", "La scène devient tragique parce que la victime ne maîtrise pas le jeu dans lequel elle est prise.", [
          figure("f31", "Exclamation pathétique", "Hélas !", "Le mot laisse entendre la fragilité de Rosette.", 25),
          figure("f32", "Adresse sociale", "Monsieur le docteur", "Rosette marque la distance sociale et intellectuelle avec Perdican.", 25),
          figure("f33", "Formule humble", "je vous aimerai comme je pourrai", "La simplicité de la réponse contraste avec la rhétorique de Perdican.", 25),
          figure("f34", "Antithèse implicite", "grand discours / comme je pourrai", "Le décalage entre les deux paroles fait apparaître la cruauté du jeu.", 20, 25),
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
    quizFocus: "La scène fait rire par la situation impossible de Dom Juan entre deux femmes, mais elle dénonce aussi une parole de séduction qui promet, esquive et abandonne.",
    problematique: "Comment Molière fait-il rire tout en dénonçant le mensonge de Dom Juan ?",
    recap: "Molière fait rire par la symétrie des deux paysannes et les apartés contradictoires de Dom Juan, puis il dénonce le mensonge lorsque Sganarelle rappelle que les victimes courent à leur malheur.",
    opening: "On peut ouvrir sur les autres scènes de séduction de Dom Juan, toujours fondées sur la parole.",
    movements: [
      movement("m1", "I. Deux demandes de vérité", 1, 18, ["mariage", "rivalité", "vérité"], [
        section("m1a", "Deux promesses se répondent", "Charlotte et Mathurine posent presque la même question : Dom Juan a-t-il promis le mariage ? La répétition enferme immédiatement le séducteur dans ses contradictions.", "Le comique naît d'une situation impossible : deux femmes réclament la même vérité en même temps.", [
          figure("f1", "Questions parallèles", "promis de l'épouser / donné parole d'être son mari", "Les deux formulations se répondent et révèlent la double promesse.", 1, 3),
          figure("f2", "Champ lexical de l'engagement", "promis / donné parole / mari", "La parole de Dom Juan est associée à une obligation sérieuse.", 1, 3),
          figure("f3", "Apartés immédiats", "bas, à Charlotte / bas, à Mathurine", "Dom Juan répond séparément pour éviter une vérité commune.", 2, 4),
        ]),
        section("m1b", "Les paysannes cherchent un jugement", "Charlotte et Mathurine veulent forcer Dom Juan à trancher. Le vocabulaire de la vérité et du jugement transforme la scène en petit procès.", "Molière rend les victimes actives : elles demandent des comptes.", [
          figure("f4", "Expression de vérité", "il faut savoir la vérité", "Charlotte exige une clarification publique.", 9),
          figure("f5", "Lexique judiciaire", "juger ça / videz la querelle / Mettez-nous d'accord", "Les paysannes placent Dom Juan en arbitre de son propre mensonge.", 10, 14),
          figure("f6", "Impératifs brefs", "Dites / Parlez", "Les deux femmes pressent Dom Juan de répondre.", 17, 18),
        ]),
        section("m1c", "La rivalité produit le comique populaire", "Les deux femmes s'attaquent avec des expressions familières. Le comique vient du langage populaire et de la symétrie des répliques.", "La scène reste drôle, mais ce rire repose sur une rivalité créée par Dom Juan.", [
          figure("f7", "Expression populaire", "votre bec jaune", "Charlotte ridiculise Mathurine dans un registre familier.", 11),
          figure("f8", "Réplique symétrique", "vous rendre un peu camuse", "Mathurine répond sur le même ton moqueur.", 12),
          figure("f9", "Répétition", "Vous allez voir / Vous allez voir vous-même", "La symétrie renforce le duel comique.", 15, 16),
        ]),
      ]),
      movement("m2", "II. L'esquive brillante de Dom Juan", 19, 31, ["mensonge", "double jeu", "parole"], [
        section("m2a", "Dom Juan répond par une fausse impartialité", "Dom Juan feint l'embarras et parle aux deux femmes ensemble. Il reformule le problème sans répondre clairement, ce qui lui permet de gagner du temps.", "Sa maîtrise de la parole consiste à repousser la vérité.", [
          figure("f10", "Didascalie", "embarrassé", "Le mot montre la difficulté de la situation, même pour Dom Juan.", 19),
          figure("f11", "Question d'évitement", "Que voulez-vous que je dise ?", "Dom Juan transforme son obligation de répondre en impossibilité apparente.", 19),
          figure("f12", "Formule d'équilibre", "également toutes deux", "Il met les deux femmes au même niveau pour éviter de choisir.", 19),
        ]),
        section("m2b", "Le discours moral masque le mensonge", "Dom Juan oppose les paroles et les effets. Il prétend que l'action du mariage décidera mieux que les discours, alors qu'il se sert précisément des discours pour tromper.", "La scène dénonce une rhétorique séduisante mais vide.", [
          figure("f13", "Questions rhétoriques", "Est-ce que chacune... Pourquoi m'obliger...", "Les questions empêchent les paysannes d'obtenir une réponse directe.", 20, 21),
          figure("f14", "Antithèse", "faire et non pas dire", "Dom Juan se donne une apparence de sincérité pratique.", 23),
          figure("f15", "Maxime trompeuse", "les effets décident mieux que les paroles", "La formule paraît raisonnable mais sert à différer la vérité.", 23),
          figure("f16", "Futur d'évitement", "l'on verra, quand je me marierai", "La décision est renvoyée à plus tard.", 24),
        ]),
        section("m2c", "Les apartés montrent la duplicité en direct", "Dom Juan alterne les apartés à Mathurine et à Charlotte. Le public entend les deux discours contradictoires, alors que chaque femme croit recevoir une confidence unique.", "Le comique vient de ce que le spectateur voit le mensonge fonctionner.", [
          figure("f17", "Apartés alternés", "Bas, à Mathurine / Bas, à Charlotte", "La structure scénique expose le double jeu.", 25, 30),
          figure("f18", "Impératifs manipulateurs", "Laissez-lui croire / Laissez-la se flatter", "Dom Juan encourage chacune à rester dans son illusion.", 25, 26),
          figure("f19", "Déclarations contradictoires", "Je vous adore / Je suis tout à vous", "Il promet l'exclusivité aux deux femmes.", 27, 28),
          figure("f20", "Hyperbole galante", "Tous les visages sont laids auprès du vôtre", "Le compliment excessif est un instrument de séduction.", 29),
          figure("f21", "Fuite temporelle", "dans un quart d'heure", "Dom Juan sort de la difficulté en reportant la suite.", 31),
        ]),
      ]),
      movement("m3", "III. L'avertissement de Sganarelle", 32, 35, ["innocence", "danger", "morale"], [
        section("m3a", "Les deux femmes restent dans l'illusion", "Après le départ de Dom Juan, Charlotte et Mathurine continuent chacune à croire qu'elle est choisie. Le mensonge a donc produit son effet.", "La persistance de l'illusion rend le comique plus cruel.", [
          figure("f22", "Affirmations rivales", "Je suis celle qu'il aime / C'est moi qu'il épousera", "Les deux phrases montrent que chacune croit avoir gagné.", 32, 33),
          figure("f23", "Pronoms opposés", "Je / moi", "Les pronoms soulignent la rivalité entretenue par Dom Juan.", 32, 33),
          figure("f24", "Futur de croyance", "épousera", "Mathurine croit encore à la promesse de mariage.", 33),
        ]),
        section("m3b", "Sganarelle introduit la pitié", "Sganarelle interrompt le jeu comique par une parole de compassion. Il voit l'innocence des deux femmes et le danger auquel elles s'exposent.", "La scène passe du rire à la critique morale.", [
          figure("f25", "Exclamation pathétique", "Ah ! pauvres filles", "Sganarelle exprime une pitié directe.", 34),
          figure("f26", "Champ lexical moral", "pitié / innocence / malheur", "Le vocabulaire révèle les conséquences humaines du mensonge.", 34),
          figure("f27", "Expression de refus", "je ne puis souffrir", "Sganarelle se distingue moralement de Dom Juan.", 34),
        ]),
        section("m3c", "Le valet formule l'avertissement final", "Sganarelle conseille aux deux femmes de ne plus écouter les contes de séduction. La parole de Dom Juan est ramenée à un récit trompeur.", "Molière dénonce le libertinage verbal : les mots séduisent mais exposent les victimes au malheur.", [
          figure("f28", "Impératif de conseil", "Croyez-moi", "Sganarelle tente de protéger les deux paysannes.", 35),
          figure("f29", "Négation préventive", "ne vous amusez point", "Le verbe amusez rappelle que le jeu amoureux est dangereux.", 35),
          figure("f30", "Métaphore du mensonge", "tous les contes qu'on vous fait", "Les promesses de Dom Juan sont réduites à des fictions.", 35),
          figure("f31", "Retour au village", "demeurez dans votre village", "Sganarelle propose de sortir du monde séducteur de Dom Juan.", 35),
        ]),
      ]),
    ],
  }),
);

export const studyTexts = texts;

export function findStudyText(slug: string | undefined): StudyText | undefined {
  return studyTexts.find((text) => text.slug === slug);
}
