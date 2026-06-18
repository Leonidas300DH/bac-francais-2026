export type TextStatus = "draft" | "review" | "ready";

export type LineRange = {
  start: number;
  end: number;
};

export type StudyLine = {
  number: number;
  text: string;
};

export type Figure = {
  id: string;
  name: string;
  quote: string;
  explanation: string;
  range: LineRange;
};

export type StudySection = {
  id: string;
  title: string;
  simple: string;
  memory?: string;
  bullets?: string[];
  figures?: Figure[];
};

export type Movement = {
  id: string;
  title: string;
  range: LineRange;
  keywords: string[];
  sections: StudySection[];
};

export type FigureDefinition = {
  name: string;
  definition: string;
};

export type QuizItem = {
  id: string;
  prompt: string;
  answer: string;
  choices?: string[];
  explanation?: string;
};

export type MemoryQuote = {
  quote: string;
  reason: string;
  range: LineRange;
};

export type MemoryCard = {
  hook: string;
  problem: string;
  plan: string[];
  keyQuotes: MemoryQuote[];
  finalSentence: string;
  traps: string[];
  oralChecklist: string[];
};

export type StudyText = {
  slug: string;
  title: string;
  author: string;
  sourceLabel: string;
  status: TextStatus;
  lines: StudyLine[];
  introduction: StudySection[];
  problematique: string;
  movements: Movement[];
  conclusion: StudySection[];
  glossary: FigureDefinition[];
  recap: string;
  memoryCard: MemoryCard;
  quiz: QuizItem[];
};

export type TextProgress = {
  completedSections: Record<string, boolean>;
  quizAnswers: Record<string, string>;
  quizHistory: { correct: number; total: number; percent: number; takenAt: string }[];
  flashcards: Record<string, boolean>;
};
