import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Circle,
  FileText,
  GraduationCap,
  ListChecks,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { findStudyText, studyTexts } from "./data/studyTexts";
import { formatRange, isLineInRange } from "./lib/ranges";
import { computeCompletionPercent, readProgress, writeProgress } from "./lib/progress";
import { computeQuizScore, updateFlashcardKnowledge } from "./lib/quiz";
import type { Figure, LineRange, Movement, QuizItem, StudySection, StudyText, TextProgress } from "./types";

function getSectionIds(text: StudyText): string[] {
  return [
    ...text.introduction.map((section) => section.id),
    ...text.movements.flatMap((movement) => movement.sections.map((section) => section.id)),
    ...text.conclusion.map((section) => section.id),
    "glossaire",
    "quiz",
  ];
}

function useTextProgress(slug: string) {
  const [progress, setProgress] = useState<TextProgress>(() => readProgress(slug));

  useEffect(() => {
    setProgress(readProgress(slug));
  }, [slug]);

  function update(next: TextProgress) {
    setProgress(next);
    writeProgress(slug, next);
  }

  return { progress, update };
}

function Dashboard() {
  const [query, setQuery] = useState("");

  const filteredTexts = studyTexts.filter((text) => {
    const haystack = `${text.title} ${text.author} ${text.sourceLabel}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <main className="dashboard">
      <section className="dashboard-hero">
        <div>
          <div className="brand-line">
            <GraduationCap aria-hidden="true" />
            <span>Bac Français 2026</span>
          </div>
          <h1>Réviser les 16 textes sans se perdre dans ses notes</h1>
          <p>
            Fiches à tiroirs, texte source synchronisé, figures à retenir et quiz pour préparer
            l'explication linéaire à l'oral.
          </p>
        </div>
        <Link className="primary-action" to="/textes/les-effares">
          <BookOpen aria-hidden="true" />
          Commencer
        </Link>
      </section>

      <section className="dashboard-tools" aria-label="Recherche des textes">
        <label className="search-field">
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Chercher un titre, un auteur, une oeuvre..."
          />
        </label>
        <div className="status-legend">
          <span><CheckCircle2 aria-hidden="true" /> prêt</span>
          <span><Sparkles aria-hidden="true" /> à relire</span>
          <span><Circle aria-hidden="true" /> brouillon</span>
        </div>
      </section>

      <section className="text-grid" aria-label="Liste des textes">
        {filteredTexts.map((text) => {
          const progress = readProgress(text.slug);
          const percent = computeCompletionPercent(progress, getSectionIds(text));

          return (
            <Link className="text-card" to={`/textes/${text.slug}`} key={text.slug}>
              <span className={`status-dot ${text.status}`}>{statusLabel(text.status)}</span>
              <h2>{text.title}</h2>
              <p>{text.author}</p>
              <span>{text.sourceLabel}</span>
              <div className="progress-bar" aria-label={`${percent}% terminé`}>
                <i style={{ width: `${percent}%` }} />
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}

function StudyRoute() {
  const { slug } = useParams();
  const text = findStudyText(slug);

  if (!text) {
    return <Navigate to="/" replace />;
  }

  return <StudyPage text={text} />;
}

function StudyPage({ text }: { text: StudyText }) {
  const [selectedRange, setSelectedRange] = useState<LineRange | null>(text.movements[0]?.range ?? null);
  const [detailsKey, setDetailsKey] = useState(0);
  const [defaultOpen, setDefaultOpen] = useState(false);
  const { progress, update } = useTextProgress(text.slug);
  const sectionIds = useMemo(() => getSectionIds(text), [text]);
  const percent = computeCompletionPercent(progress, sectionIds);

  useEffect(() => {
    window.localStorage.setItem("bac-francais-2026:last-opened", text.slug);
  }, [text.slug]);

  function toggleSectionDone(sectionId: string) {
    update({
      ...progress,
      completedSections: {
        ...progress.completedSections,
        [sectionId]: !progress.completedSections[sectionId],
      },
    });
  }

  function openAll() {
    setDefaultOpen(true);
    setDetailsKey((value) => value + 1);
  }

  function closeAll() {
    setDefaultOpen(false);
    setSelectedRange(null);
    setDetailsKey((value) => value + 1);
  }

  return (
    <div className="study-shell">
      <LibrarySidebar activeSlug={text.slug} />

      <main className="study-main">
        <header className="study-header">
          <Link className="back-link" to="/">
            <ChevronLeft aria-hidden="true" />
            Tous les textes
          </Link>
          <div>
            <h1>{text.title}</h1>
            <p>{text.author} - {text.sourceLabel}</p>
          </div>
          <div className="study-progress" aria-label={`${percent}% de la fiche marqué comme su`}>
            <span>{percent}%</span>
            <div className="progress-bar"><i style={{ width: `${percent}%` }} /></div>
          </div>
        </header>

        <nav className="toolbar" aria-label="Navigation de la fiche">
          <a href="#texte-source">Texte</a>
          <a href="#introduction">Introduction</a>
          {text.movements.map((movement, index) => (
            <a key={movement.id} href={`#${movement.id}`}>Mouvement {index + 1}</a>
          ))}
          <a href="#conclusion">Conclusion</a>
          <a href="#glossaire">Figures</a>
          <a href="#memo">Mémo</a>
          <a href="#quiz">Quiz</a>
          <button type="button" onClick={openAll}>Tout afficher</button>
          <button type="button" onClick={closeAll}>Tout fermer</button>
        </nav>

        <div className="study-layout">
          <section className="analysis-column" key={detailsKey}>
            <Chapter id="introduction" title="Introduction" defaultOpen={defaultOpen}>
              {text.introduction.map((section) => (
                <SectionDrawer
                  key={section.id}
                  section={section}
                  done={Boolean(progress.completedSections[section.id])}
                  onToggleDone={() => toggleSectionDone(section.id)}
                  defaultOpen={defaultOpen}
                  onSelectRange={setSelectedRange}
                />
              ))}
              <div className="problematic">{text.problematique}</div>
            </Chapter>

            {text.movements.map((movement) => (
              <MovementChapter
                key={movement.id}
                movement={movement}
                defaultOpen={defaultOpen}
                progress={progress}
                onToggleDone={toggleSectionDone}
                onSelectRange={setSelectedRange}
              />
            ))}

            <Chapter id="conclusion" title="Conclusion" defaultOpen={defaultOpen}>
              {text.conclusion.map((section) => (
                <SectionDrawer
                  key={section.id}
                  section={section}
                  done={Boolean(progress.completedSections[section.id])}
                  onToggleDone={() => toggleSectionDone(section.id)}
                  defaultOpen={defaultOpen}
                  onSelectRange={setSelectedRange}
                />
              ))}
            </Chapter>

            <Chapter id="glossaire" title="Fiche express : les figures à retenir" defaultOpen={defaultOpen}>
              <div className="glossary-grid">
                {text.glossary.map((item) => (
                  <article className="glossary-card" key={item.name}>
                    <strong>{item.name}</strong>
                    {item.definition}
                  </article>
                ))}
              </div>
            </Chapter>

            <MemoryPanel text={text} onSelectRange={setSelectedRange} />

            <div className="recap">
              <strong>Fil directeur à mémoriser :</strong> {text.recap}
            </div>

            <QuizPanel text={text} progress={progress} updateProgress={update} />
          </section>

          <SourceText text={text} selectedRange={selectedRange} onSelectRange={setSelectedRange} />
        </div>
      </main>
    </div>
  );
}

function LibrarySidebar({ activeSlug }: { activeSlug: string }) {
  return (
    <aside className="library-sidebar" aria-label="Bibliothèque des textes">
      <div className="library-title">
        <GraduationCap aria-hidden="true" />
        <span>Bac Français 2026</span>
      </div>
      <nav>
        {studyTexts.map((text, index) => {
          const progress = readProgress(text.slug);
          const percent = computeCompletionPercent(progress, getSectionIds(text));
          return (
            <Link
              key={text.slug}
              to={`/textes/${text.slug}`}
              className={text.slug === activeSlug ? "library-link active" : "library-link"}
            >
              <span>{index + 1}</span>
              <strong>{text.title}</strong>
              <small>{percent}% - {statusLabel(text.status)}</small>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function MemoryPanel({
  text,
  onSelectRange,
}: {
  text: StudyText;
  onSelectRange: (range: LineRange) => void;
}) {
  return (
    <section className="memo-panel" id="memo" aria-label="Mémo oral">
      <div className="memo-heading">
        <div>
          <h2>Mémo oral</h2>
          <p>Une fiche courte à savoir redire sans lire toute l'analyse.</p>
        </div>
        <span>2 min</span>
      </div>

      <div className="memo-grid">
        <article className="memo-card memo-wide">
          <h3>Accroche</h3>
          <p>{text.memoryCard.hook}</p>
        </article>
        <article className="memo-card memo-wide">
          <h3>Problématique</h3>
          <p>{text.memoryCard.problem}</p>
        </article>
        <article className="memo-card">
          <h3>Plan minute</h3>
          <ol>
            {text.memoryCard.plan.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </article>
        <article className="memo-card">
          <h3>3 citations à placer</h3>
          <div className="memo-quotes">
            {text.memoryCard.keyQuotes.map((item) => (
              <button
                key={`${item.range.start}-${item.quote}`}
                type="button"
                className="quote-button"
                onClick={() => onSelectRange(item.range)}
              >
                <q>{item.quote}</q>
                <span>{item.reason}</span>
              </button>
            ))}
          </div>
        </article>
        <article className="memo-card">
          <h3>Pièges à éviter</h3>
          <ul>
            {text.memoryCard.traps.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className="memo-card">
          <h3>Check oral</h3>
          <ul>
            {text.memoryCard.oralChecklist.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className="memo-card memo-wide final-line">
          <h3>Phrase de conclusion</h3>
          <p>{text.memoryCard.finalSentence}</p>
        </article>
      </div>
    </section>
  );
}

function Chapter({
  id,
  title,
  children,
  defaultOpen,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen: boolean;
}) {
  return (
    <details className="chapter" id={id} open={defaultOpen}>
      <summary>{title}</summary>
      <div className="chapter-body">{children}</div>
    </details>
  );
}

function MovementChapter({
  movement,
  defaultOpen,
  progress,
  onToggleDone,
  onSelectRange,
}: {
  movement: Movement;
  defaultOpen: boolean;
  progress: TextProgress;
  onToggleDone: (id: string) => void;
  onSelectRange: (range: LineRange) => void;
}) {
  return (
    <Chapter id={movement.id} title={movement.title} defaultOpen={defaultOpen}>
      <div className="labels">
        <span className="label">{formatRange(movement.range)}</span>
        <span className="label key">{movement.keywords.join(" - ")}</span>
      </div>
      <button className="verse-link" type="button" onClick={() => onSelectRange(movement.range)}>
        Voir et surligner {formatRange(movement.range).toLowerCase()}
      </button>

      {movement.sections.map((section) => (
        <SectionDrawer
          key={section.id}
          section={section}
          done={Boolean(progress.completedSections[section.id])}
          onToggleDone={() => onToggleDone(section.id)}
          defaultOpen={defaultOpen}
          onSelectRange={onSelectRange}
        />
      ))}
    </Chapter>
  );
}

function SectionDrawer({
  section,
  done,
  onToggleDone,
  defaultOpen,
  onSelectRange,
}: {
  section: StudySection;
  done: boolean;
  onToggleDone: () => void;
  defaultOpen: boolean;
  onSelectRange: (range: LineRange) => void;
}) {
  return (
    <details className="subpart" open={defaultOpen}>
      <summary>
        <span>{section.title}</span>
        <button
          className={done ? "done-toggle done" : "done-toggle"}
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleDone();
          }}
          aria-label={done ? "Marquer comme non su" : "Marquer comme su"}
        >
          {done ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
        </button>
      </summary>
      <div className="detail">
        <div className="simple-box">
          <h4>En mots simples</h4>
          <p>{section.simple}</p>
          {section.memory ? (
            <p className="memory"><strong>À retenir :</strong> {section.memory}</p>
          ) : null}
          {section.bullets ? (
            <ul>
              {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          ) : null}
        </div>

        {section.figures?.length ? (
          <Figures figures={section.figures} onSelectRange={onSelectRange} />
        ) : null}
      </div>
    </details>
  );
}

function Figures({
  figures,
  onSelectRange,
}: {
  figures: Figure[];
  onSelectRange: (range: LineRange) => void;
}) {
  return (
    <div className="figures">
      <h4>Figures de style et procédés</h4>
      <div className="figure-list">
        {figures.map((figure) => (
          <div className="figure-item" key={figure.id}>
            <div className="figure-name">{figure.name}</div>
            <div className="figure-text">
              <q>{figure.quote}</q>
              <p>{figure.explanation}</p>
            </div>
            <button className="locate" type="button" onClick={() => onSelectRange(figure.range)}>
              {formatRange(figure.range)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceText({
  text,
  selectedRange,
  onSelectRange,
}: {
  text: StudyText;
  selectedRange: LineRange | null;
  onSelectRange: (range: LineRange) => void;
}) {
  return (
    <aside className="poem-card" id="texte-source" aria-label="Texte source">
      <div className="poem-heading">
        <h2>{text.title}</h2>
        <p>{text.author} - cliquez une ligne ou un bouton de l'analyse.</p>
      </div>
      <div className="poem-scroll">
        {text.lines.map((line) => (
          <button
            key={line.number}
            className={isLineInRange(line.number, selectedRange) ? "verse active" : "verse"}
            type="button"
            onClick={() => onSelectRange({ start: line.number, end: line.number })}
          >
            <span className="line-number">{line.number}</span>
            <span>{line.text}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function QuizPanel({
  text,
  progress,
  updateProgress,
}: {
  text: StudyText;
  progress: TextProgress;
  updateProgress: (progress: TextProgress) => void;
}) {
  const score = computeQuizScore(text.quiz, progress.quizAnswers);

  function chooseAnswer(item: QuizItem, answer: string) {
    updateProgress({
      ...progress,
      quizAnswers: {
        ...progress.quizAnswers,
        [item.id]: answer,
      },
    });
  }

  function saveScore() {
    updateProgress({
      ...progress,
      completedSections: {
        ...progress.completedSections,
        quiz: true,
      },
      quizHistory: [
        ...progress.quizHistory,
        { ...score, takenAt: new Date().toISOString() },
      ],
    });
  }

  return (
    <section className="quiz-panel" id="quiz" aria-label="Quiz de révision">
      <div className="quiz-heading">
        <div>
          <h2>Révision active</h2>
          <p>Questions rapides pour préparer l'oral et fixer les procédés.</p>
        </div>
        <strong>{score.correct}/{score.total}</strong>
      </div>

      <div className="quiz-grid">
        {text.quiz.map((item) => (
          <article className="quiz-card" key={item.id}>
            <h3>{item.prompt}</h3>
            <div className="choices">
              {(item.choices ?? [item.answer]).map((choice) => {
                const selected = progress.quizAnswers[item.id] === choice;
                const correct = choice === item.answer;
                return (
                  <button
                    key={choice}
                    type="button"
                    className={selected ? (correct ? "choice correct" : "choice wrong") : "choice"}
                    onClick={() => chooseAnswer(item, choice)}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            {progress.quizAnswers[item.id] ? (
              <p className="answer-feedback">
                {progress.quizAnswers[item.id] === item.answer ? "Correct." : `Réponse : ${item.answer}`}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <div className="flashcards">
        <h3>Flashcards</h3>
        {text.movements.map((movement) => {
          const known = Boolean(progress.flashcards[movement.id]);
          return (
            <button
              key={movement.id}
              type="button"
              className={known ? "flashcard known" : "flashcard"}
              onClick={() =>
                updateProgress({
                  ...progress,
                  flashcards: updateFlashcardKnowledge(progress.flashcards, movement.id, !known),
                })
              }
            >
              <FileText aria-hidden="true" />
              <span>{movement.title}</span>
              <strong>{known ? "su" : "à revoir"}</strong>
            </button>
          );
        })}
      </div>

      <button className="primary-action quiz-save" type="button" onClick={saveScore}>
        <ListChecks aria-hidden="true" />
        Enregistrer le score
      </button>
    </section>
  );
}

function statusLabel(status: StudyText["status"]) {
  if (status === "ready") return "prêt";
  if (status === "review") return "à relire";
  return "brouillon";
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/textes/:slug" element={<StudyRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
