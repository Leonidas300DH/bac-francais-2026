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
        section("m3a", "Ne plus soutenir le tyran", "Il ne faut pas vaincre par la force : il suffit de ne plus servir.", "La formule « Soyez résolus de ne plus servir » donne à la liberté la forme d'un retrait collectif.", [
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
        section("m3a", "La tyrannie vient de l'intérieur", "Le tyran utilise les sujets contre les sujets, comme un coin de bois fend le bois.", "L'image du bois montre que le pouvoir tyrannique utilise la matière même du peuple pour le diviser.", [
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
