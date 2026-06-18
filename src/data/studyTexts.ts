import type { StudyText } from "../types";

const placeholderLines = [
  { number: 1, text: "Texte à transcrire depuis le dossier source." },
  { number: 2, text: "Ajoutez ici les lignes numérotées après OCR et relecture." },
  { number: 3, text: "Cette fiche reste en brouillon tant que le contenu n'est pas validé." },
];

function makePlaceholder(slot: number, title: string, author = "Auteur à compléter"): StudyText {
  return {
    slug: `texte-${slot.toString().padStart(2, "0")}`,
    title,
    author,
    sourceLabel: "Dossier source à importer",
    status: "draft",
    lines: placeholderLines,
    introduction: [
      {
        id: "intro-contexte",
        title: "Contexte à compléter",
        simple: "Importer les photos et notes, puis rédiger une introduction courte.",
      },
    ],
    problematique: "Problématique à formuler après analyse du texte.",
    movements: [
      {
        id: "mouvement-1",
        title: "Mouvement à compléter",
        range: { start: 1, end: 3 },
        keywords: ["à compléter"],
        sections: [
          {
            id: "analyse-1",
            title: "Analyse à compléter",
            simple: "Rédiger l'explication linéaire après transcription et relecture.",
            memory: "Identifier l'idée directrice de ce passage.",
          },
        ],
      },
    ],
    conclusion: [
      {
        id: "conclusion",
        title: "Conclusion à compléter",
        simple: "Préparer le bilan et l'ouverture.",
      },
    ],
    glossary: [
      { name: "Figure à compléter", definition: "Définition et exemple à ajouter." },
    ],
    recap: "Fil directeur à compléter après validation de la fiche.",
    quiz: [
      {
        id: "q-fil-directeur",
        prompt: "Quel est le fil directeur de ce texte ?",
        answer: "À compléter",
        choices: ["À compléter", "Hors sujet", "Non relu"],
      },
    ],
  };
}

const lesEffares: StudyText = {
  slug: "les-effares",
  title: "Les Effarés",
  author: "Arthur Rimbaud",
  sourceLabel: "Recueil de Douai, 1870",
  status: "ready",
  lines: [
    "Noirs dans la neige et dans la brume,",
    "Au grand soupirail qui s'allume,",
    "Leurs culs en rond,",
    "À genoux, cinq petits, - misère ! -",
    "Regardent le boulanger faire",
    "Le lourd pain blond...",
    "Ils voient le fort bras blanc qui tourne",
    "La pâte grise, et qui l'enfourne",
    "Dans un trou clair.",
    "Ils écoutent le bon pain cuire.",
    "Le boulanger au gras sourire",
    "Chante un vieil air.",
    "Ils sont blottis, pas un ne bouge,",
    "Au souffle du soupirail rouge,",
    "Chaud comme un sein.",
    "Et quand, pendant que minuit sonne,",
    "Façonné, pétillant et jaune,",
    "On sort le pain ;",
    "Quand, sous les poutres enfumées,",
    "Chantent les croûtes parfumées,",
    "Et les grillons ;",
    "Quand ce trou chaud souffle la vie ;",
    "Ils ont leur âme si ravie",
    "Sous leurs haillons,",
    "Ils se ressentent si bien vivre,",
    "Les pauvres petits pleins de givre !",
    "- Qu'ils sont là, tous,",
    "Collant leurs petits museaux roses",
    "Au grillage, chantant des choses,",
    "Entre les trous,",
    "Mais bien bas, - comme une prière...",
    "Repliés vers cette lumière",
    "Du ciel rouvert,",
    "- Si fort, qu'ils crèvent leur culotte,",
    "- Et que leur lange blanc tremblotte",
    "Au vent d'hiver...",
  ].map((text, index) => ({ number: index + 1, text })),
  introduction: [
    {
      id: "intro-contexte",
      title: "Le contexte",
      simple:
        "Au XIXe siècle, l'industrie progresse, mais les inégalités restent très fortes. Rimbaud utilise la poésie pour montrer la misère et faire réagir le lecteur.",
    },
    {
      id: "intro-auteur",
      title: "L'auteur et la scène présentée",
      simple:
        "Arthur Rimbaud est encore adolescent lorsqu'il écrit ce poème en 1870. Il montre cinq enfants pauvres, dehors en plein hiver, qui regardent un boulanger préparer du pain.",
    },
    {
      id: "intro-forme",
      title: "La forme et le but du poème",
      simple:
        "Le poème contient douze tercets. Chaque strophe se termine par un vers court, ce qui donne du rythme et met certains mots en valeur.",
      memory: "Le but est de faire ressentir la faim, le froid et l'exclusion.",
    },
  ],
  problematique:
    "Comment Rimbaud transforme-t-il la scène de cinq enfants regardant du pain en une dénonciation de leur misère ?",
  movements: [
    {
      id: "mouvement-1",
      title: "I. La mise en place du contexte et le portrait des enfants",
      range: { start: 1, end: 6 },
      keywords: ["Froid", "contraste", "misère"],
      sections: [
        {
          id: "decor-hivernal",
          title: "A. Un décor hivernal inquiétant",
          simple:
            "Rimbaud place les enfants dehors, dans la neige, la brume et l'obscurité. Dès le premier vers, ils paraissent seuls, fragiles et en danger.",
          memory: "Le décor fait immédiatement ressentir le froid et la souffrance.",
          figures: [
            {
              id: "antithese-noirs-neige",
              name: "Antithèse",
              quote: "Noirs dans la neige",
              explanation:
                "Le noir des enfants s'oppose au blanc de la neige. Ils ressortent dans le paysage et semblent encore plus isolés.",
              range: { start: 1, end: 1 },
            },
            {
              id: "champ-lexical-froid",
              name: "Champ lexical",
              quote: "neige, brume",
              explanation: "Ces mots construisent un décor d'hiver froid, humide et peu rassurant.",
              range: { start: 1, end: 1 },
            },
          ],
        },
        {
          id: "rue-boulangerie",
          title: "B. L'opposition entre la rue et la boulangerie",
          simple:
            "Dehors, les enfants ont froid et vivent dans l'obscurité. À l'intérieur, la boulangerie est éclairée, chaude et pleine de nourriture.",
          memory:
            "L'extérieur représente la misère ; l'intérieur représente le confort et l'abondance.",
          figures: [
            {
              id: "symbole-soupirail",
              name: "Symbole",
              quote: "le soupirail",
              explanation:
                "Cette ouverture montre le pain aux enfants, mais marque aussi la frontière entre les pauvres et ceux qui peuvent manger.",
              range: { start: 2, end: 2 },
            },
          ],
        },
        {
          id: "portrait-enfants",
          title: "C. Un portrait humiliant et pathétique des enfants",
          simple:
            "Les enfants sont à genoux, serrés les uns contre les autres. Leur position est humiliante : ils regardent seulement le pain qu'ils voudraient manger.",
          memory: "Rimbaud veut provoquer la pitié et l'indignation du lecteur.",
          figures: [
            {
              id: "langage-trivial",
              name: "Langage trivial",
              quote: "Leurs culs en rond",
              explanation:
                "Ce vocabulaire très direct montre leur corps sans l'embellir. La misère est présentée de façon crue.",
              range: { start: 3, end: 3 },
            },
            {
              id: "enjambement-regardent",
              name: "Enjambement",
              quote: "À genoux, cinq petits... / Regardent",
              explanation:
                "La phrase continue au vers suivant. Le verbe regarder est mis en valeur et rappelle leur passivité.",
              range: { start: 4, end: 5 },
            },
          ],
        },
      ],
    },
    {
      id: "mouvement-2",
      title: "II. La préparation du pain, un spectacle fascinant",
      range: { start: 7, end: 21 },
      keywords: ["Boulanger", "sensations", "désir"],
      sections: [
        {
          id: "boulanger-observe",
          title: "A. Le boulanger observé par les enfants",
          simple:
            "Les enfants regardent surtout le bras du boulanger. Il paraît fort, propre et bien nourri, sans sembler voir leur souffrance.",
          memory: "Sa force et son confort s'opposent à la faiblesse des enfants.",
          figures: [
            {
              id: "metonymie-bras",
              name: "Métonymie",
              quote: "le fort bras blanc",
              explanation: "Une partie du corps représente le boulanger entier et insiste sur sa force.",
              range: { start: 7, end: 7 },
            },
            {
              id: "connotation-gras",
              name: "Connotation",
              quote: "gras sourire",
              explanation:
                "Le mot gras suggère l'abondance et le confort. Le boulanger ne connaît pas la faim des enfants.",
              range: { start: 11, end: 12 },
            },
          ],
        },
        {
          id: "sens-eveilles",
          title: "B. Tous les sens des enfants sont éveillés",
          simple:
            "Les enfants voient le pain, l'entendent cuire, sentent sa chaleur et imaginent son goût. Ils ne mangent pas le pain, mais ils le vivent par les sens.",
          memory: "La frustration est d'autant plus forte qu'ils sont proches du pain.",
          figures: [
            {
              id: "synesthesie-pain",
              name: "Synesthésie",
              quote: "Ils écoutent le bon pain cuire",
              explanation:
                "La nourriture est associée à l'ouïe. Les sensations se mélangent pour rendre le pain presque vivant.",
              range: { start: 10, end: 10 },
            },
            {
              id: "comparaison-sein",
              name: "Comparaison",
              quote: "Chaud comme un sein",
              explanation:
                "La chaleur du soupirail évoque une chaleur maternelle, protectrice et rassurante.",
              range: { start: 15, end: 15 },
            },
          ],
        },
        {
          id: "fascination",
          title: "C. Une fascination de plus en plus forte",
          simple:
            "Le pain est décrit comme un objet vivant, lumineux et merveilleux. Pour les enfants, il devient presque une apparition.",
          memory: "Le pain devient un spectacle magique parce qu'il reste inaccessible.",
          figures: [
            {
              id: "personnification-crotes",
              name: "Personnification",
              quote: "Chantent les croûtes parfumées",
              explanation:
                "Les croûtes semblent chanter. Le pain prend vie sous le regard affamé des enfants.",
              range: { start: 20, end: 20 },
            },
          ],
        },
      ],
    },
    {
      id: "mouvement-3",
      title: "III. L'impact dramatique du spectacle sur les enfants",
      range: { start: 22, end: 36 },
      keywords: ["Extase", "grillage", "abandon"],
      sections: [
        {
          id: "extase-courte",
          title: "A. Une extase très courte",
          simple:
            "La chaleur du four donne aux enfants l'impression de revivre. Leur bonheur reste pourtant seulement une illusion passagère.",
          memory: "L'espoir naît du pain, mais il ne dure pas.",
          figures: [
            {
              id: "metaphore-vie",
              name: "Métaphore",
              quote: "ce trou chaud souffle la vie",
              explanation: "Le four est présenté comme une source de vie.",
              range: { start: 22, end: 22 },
            },
          ],
        },
        {
          id: "retour-misere",
          title: "B. Le retour brutal à la misère",
          simple:
            "Le grillage les sépare physiquement du pain et symboliquement du reste de la société. Leur pauvreté réapparaît avec les haillons et le givre.",
          memory: "La séparation rend la dénonciation sociale plus nette.",
          figures: [
            {
              id: "animalisation-museaux",
              name: "Animalisation",
              quote: "leurs petits museaux roses",
              explanation:
                "Les enfants sont décrits comme de petits animaux affamés collés au grillage.",
              range: { start: 28, end: 28 },
            },
          ],
        },
        {
          id: "priere-fin",
          title: "C. Une prière sans réponse et une fin tragique",
          simple:
            "Le chant des enfants devient une prière, mais personne ne répond. La dernière image les laisse au vent d'hiver.",
          memory: "La fin reste ouverte et sans solution : la souffrance continue.",
          figures: [
            {
              id: "comparaison-priere",
              name: "Comparaison",
              quote: "comme une prière",
              explanation: "Le chant ressemble à un appel au secours adressé au ciel.",
              range: { start: 31, end: 31 },
            },
            {
              id: "metaphore-ciel",
              name: "Métaphore religieuse",
              quote: "cette lumière / Du ciel rouvert",
              explanation:
                "La lumière de la boulangerie ressemble à l'ouverture du ciel et représente un espoir de secours.",
              range: { start: 32, end: 33 },
            },
            {
              id: "suspension-hiver",
              name: "Points de suspension",
              quote: "Au vent d'hiver...",
              explanation:
                "La fin reste ouverte et sans solution. Le lecteur comprend que la souffrance continue.",
              range: { start: 36, end: 36 },
            },
          ],
        },
      ],
    },
  ],
  conclusion: [
    {
      id: "conclusion-bilan",
      title: "Bilan",
      simple:
        "Rimbaud montre cinq enfants affamés qui peuvent voir et sentir le pain, mais pas le manger. Le poème dénonce une société qui laisse des enfants vivre dans le froid et la faim.",
      bullets: [
        "Le décor froid crée la pitié.",
        "Le pain devient vivant et merveilleux.",
        "La fin rappelle brutalement la pauvreté et l'abandon.",
      ],
    },
    {
      id: "conclusion-ouverture",
      title: "Ouverture",
      simple:
        "On peut rapprocher ce poème des Misérables de Victor Hugo, qui dénonce lui aussi la souffrance et l'abandon des enfants pauvres.",
    },
  ],
  glossary: [
    { name: "Antithèse", definition: "Opposition forte entre deux idées ou deux images." },
    { name: "Anaphore", definition: "Répétition d'un même mot au début de plusieurs phrases ou vers." },
    { name: "Métonymie", definition: "Un élément représente un ensemble : le bras représente le boulanger." },
    { name: "Comparaison", definition: "Rapprochement avec un outil comme comme." },
    { name: "Métaphore", definition: "Comparaison sans outil : une image remplace directement une autre idée." },
    { name: "Personnification", definition: "On donne à une chose une action ou une qualité d'être vivant." },
    { name: "Synesthésie", definition: "Mélange de plusieurs sens." },
    { name: "Enjambement", definition: "La phrase continue après la fin du vers." },
    { name: "Hyperbole", definition: "Exagération destinée à produire un effet fort." },
    { name: "Animalisation", definition: "Un être humain est décrit avec des mots associés aux animaux." },
  ],
  recap:
    "Les enfants sont d'abord montrés dans le froid, puis fascinés par le pain, avant d'être ramenés brutalement à leur misère et à leur abandon.",
  quiz: [
    {
      id: "q-problematique",
      prompt: "Quelle est l'idée principale de la problématique ?",
      answer: "Une scène de faim devient une dénonciation sociale.",
      choices: [
        "Une scène de faim devient une dénonciation sociale.",
        "Le poème célèbre le travail du boulanger.",
        "Le texte décrit uniquement un paysage d'hiver.",
      ],
      explanation: "Le poème part d'une scène simple pour faire sentir l'injustice.",
    },
    {
      id: "q-mouvement-1",
      prompt: "Que montrent surtout les vers 1 à 6 ?",
      answer: "Le froid, la misère et la fragilité des enfants.",
      choices: [
        "Le froid, la misère et la fragilité des enfants.",
        "La joie des enfants qui mangent du pain.",
        "Une description neutre de la boulangerie.",
      ],
    },
    {
      id: "q-figure-sein",
      prompt: "Quelle figure apparaît dans \"Chaud comme un sein\" ?",
      answer: "Une comparaison.",
      choices: ["Une comparaison.", "Une anaphore.", "Une litote."],
    },
    {
      id: "q-fin",
      prompt: "Quel effet produit la fin \"Au vent d'hiver...\" ?",
      answer: "Elle laisse la souffrance ouverte, sans résolution.",
      choices: [
        "Elle laisse la souffrance ouverte, sans résolution.",
        "Elle annonce que les enfants sont sauvés.",
        "Elle ferme le poème sur une morale comique.",
      ],
    },
  ],
};

export const studyTexts: StudyText[] = [
  lesEffares,
  makePlaceholder(2, "Texte 2"),
  makePlaceholder(3, "Texte 3"),
  makePlaceholder(4, "Texte 4"),
  makePlaceholder(5, "Texte 5"),
  makePlaceholder(6, "Texte 6"),
  makePlaceholder(7, "Texte 7"),
  makePlaceholder(8, "Texte 8"),
  makePlaceholder(9, "Texte 9"),
  makePlaceholder(10, "Texte 10"),
  makePlaceholder(11, "Texte 11"),
  makePlaceholder(12, "Texte 12"),
  makePlaceholder(13, "Texte 13"),
  makePlaceholder(14, "Texte 14"),
  makePlaceholder(15, "Texte 15"),
  makePlaceholder(16, "Texte 16"),
];

export function findStudyText(slug: string | undefined): StudyText | undefined {
  return studyTexts.find((text) => text.slug === slug);
}
