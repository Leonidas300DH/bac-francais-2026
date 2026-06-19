import {
  CheckCircle2,
  ChevronLeft,
  Circle,
  GraduationCap,
  Languages,
  Layers3,
  NotebookTabs,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { grammarCards } from "./data/grammarCards";
import { findStudyText, studyTexts } from "./data/studyTexts";
import { buildFigureIndex, filterFigureIndex, getFigureNameCounts } from "./lib/figures";
import { filterGrammarCards, getGrammarNotions, getGrammarText } from "./lib/grammar";
import { formatRange, isLineInRange } from "./lib/ranges";
import type { Figure, FigureIndexEntry, GrammarCard, LineRange, Movement, StudySection, StudyText } from "./types";

function getFigureGroups(text: StudyText) {
  return text.movements.map((movement) => ({
    movement,
    figures: movement.sections.flatMap((section) =>
      (section.figures ?? []).map((figure) => ({
        ...figure,
        sectionTitle: section.title,
      })),
    ),
  }));
}

function formatRangeParam(range: LineRange) {
  return range.start === range.end ? String(range.start) : `${range.start}-${range.end}`;
}

function parseRangeParam(value: string | null): LineRange | null {
  if (!value) return null;

  const match = value.match(/^(\d+)(?:-(\d+))?$/);
  if (!match) return null;

  const start = Number(match[1]);
  const end = Number(match[2] ?? match[1]);

  if (!Number.isInteger(start) || !Number.isInteger(end) || start <= 0 || end < start) {
    return null;
  }

  return { start, end };
}

function Dashboard() {
  const [query, setQuery] = useState("");
  const [lastOpenedSlug] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem("bac-francais-2026:last-opened"),
  );

  const lastOpenedText = studyTexts.find((text) => text.slug === lastOpenedSlug);
  const nextText = lastOpenedText ?? studyTexts[0];

  const filteredTexts = studyTexts.filter((text) => {
    const haystack = `${text.title} ${text.author} ${text.sourceLabel}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className="dashboard-shell">
      <LibrarySidebar activeSlug={lastOpenedSlug ?? ""} />

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <div className="brand-line">
              <GraduationCap aria-hidden="true" />
              <span>Bac Français 2026</span>
            </div>
            <h1>16 textes</h1>
          </div>
          <nav className="dashboard-actions" aria-label="Accès rapides">
            <Link className="primary-action" to={`/textes/${nextText.slug}`}>
              {lastOpenedText ? `Continuer : ${lastOpenedText.title}` : "Ouvrir Les Effarés"}
            </Link>
            <Link className="secondary-action" to="/memo">
              <NotebookTabs aria-hidden="true" />
              Mémos
            </Link>
            <Link className="secondary-action" to="/figures">
              <Layers3 aria-hidden="true" />
              Figures
            </Link>
            <Link className="secondary-action" to="/grammaire">
              <Languages aria-hidden="true" />
              Grammaire
            </Link>
          </nav>
        </header>

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

        <section className="text-list" aria-label="Liste des textes">
          {filteredTexts.map((text, index) => (
            <Link className="text-row" to={`/textes/${text.slug}`} key={text.slug}>
              <span className="text-row-number">{String(index + 1).padStart(2, "0")}</span>
              <span className={`status-dot ${text.status}`}>{statusLabel(text.status)}</span>
              <span className="text-row-title">
                <strong>{text.title}</strong>
                <small>{text.author}</small>
              </span>
              <span className="text-row-source">{text.sourceLabel}</span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}

function GrammarHub() {
  const [query, setQuery] = useState("");
  const [selectedNotion, setSelectedNotion] = useState("all");
  const notions = useMemo(() => getGrammarNotions(grammarCards), []);
  const filteredCards = useMemo(
    () => filterGrammarCards(grammarCards, query, selectedNotion),
    [query, selectedNotion],
  );
  const coveredTextCount = new Set(grammarCards.map((card) => card.textSlug)).size;
  const textCount = studyTexts.length;

  return (
    <main className="grammar-hub">
      <header className="grammar-hub-header">
        <Link className="back-link" to="/">
          <ChevronLeft aria-hidden="true" />
          Accueil
        </Link>
        <div>
          <div className="brand-line">
            <Languages aria-hidden="true" />
            <span>Question de grammaire</span>
          </div>
          <h1>Grammaire en 2 minutes</h1>
          <p>Chaque carte part d'une phrase du texte et donne une réponse courte, syntaxique, directement réutilisable.</p>
        </div>
      </header>

      <section className="grammar-hub-stats" aria-label="Synthèse de grammaire">
        <article>
          <span>Questions</span>
          <strong>{grammarCards.length}</strong>
        </article>
        <article>
          <span>Textes couverts</span>
          <strong>{coveredTextCount}/{textCount}</strong>
        </article>
        <article>
          <span>Notions</span>
          <strong>{notions.length}</strong>
        </article>
      </section>

      <section className="grammar-hub-tools" aria-label="Filtres de grammaire">
        <label className="search-field">
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Chercher une notion, une citation, un texte..."
          />
        </label>
        <label className="select-field">
          <span>Notion</span>
          <select value={selectedNotion} onChange={(event) => setSelectedNotion(event.target.value)}>
            <option value="all">Toutes les notions</option>
            {notions.map((notion) => (
              <option key={notion} value={notion}>{notion}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="grammar-card-list" aria-label="Questions de grammaire">
        {filteredCards.map((card) => (
          <GrammarHubCard key={card.id} card={card} />
        ))}
      </section>
    </main>
  );
}

function GrammarHubCard({
  card,
}: {
  card: GrammarCard;
}) {
  const text = getGrammarText(card);

  return (
    <article className="grammar-card">
      <div className="grammar-card-head">
        <div>
          <span>{card.notion}</span>
          <h2>{text?.title ?? card.textSlug}</h2>
          <p>{text?.author}</p>
        </div>
      </div>

      <div className="grammar-question">
        <strong>Question</strong>
        <p>{card.question}</p>
      </div>

      <blockquote>{card.excerpt}</blockquote>

      <div className="grammar-answer">
        <strong>Réponse attendue</strong>
        <p>{card.answer}</p>
      </div>

      <div className="grammar-reflex">
        <strong>Repère d'analyse</strong>
        <p>{card.reflex}</p>
      </div>

      <div className="grammar-card-actions">
        <Link className="secondary-action" to={`/textes/${card.textSlug}?ligne=${formatRangeParam(card.range)}#texte-source`}>
          Voir {formatRange(card.range)}
        </Link>
      </div>
    </article>
  );
}

function MemoHub() {
  const [query, setQuery] = useState("");

  const textCount = studyTexts.length;
  const filteredEntries = studyTexts.filter((text) => {
    const haystack = `${text.title} ${text.author} ${text.sourceLabel} ${text.memoryCard.problem}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    return matchesQuery;
  });

  return (
    <main className="memo-hub">
      <header className="memo-hub-header">
        <Link className="back-link" to="/">
          <ChevronLeft aria-hidden="true" />
          Accueil
        </Link>
        <div>
          <div className="brand-line">
            <NotebookTabs aria-hidden="true" />
            <span>Révision express</span>
          </div>
          <h1>Mémos d'oral</h1>
          <p>Une page pour revoir les 16 problématiques, plans et citations sans ouvrir chaque analyse.</p>
        </div>
      </header>

      <section className="memo-hub-stats" aria-label="Synthèse des mémos">
        <article>
          <span>Textes</span>
          <strong>{textCount}</strong>
        </article>
        <article>
          <span>Citations par fiche</span>
          <strong>3</strong>
        </article>
        <article>
          <span>Format</span>
          <strong>2 min</strong>
        </article>
      </section>

      <section className="memo-hub-tools" aria-label="Filtres des mémos">
        <label className="search-field">
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Chercher un texte, un auteur, une problématique..."
          />
        </label>
      </section>

      <section className="memo-hub-list" aria-label="Liste des mémos oraux">
        {filteredEntries.map((text) => (
          <MemoHubCard key={text.slug} text={text} />
        ))}
      </section>
    </main>
  );
}

function MemoHubCard({
  text,
}: {
  text: StudyText;
}) {
  return (
    <article className="memo-hub-card">
      <div className="memo-hub-card-header">
        <div>
          <span>{text.author}</span>
          <h2>{text.title}</h2>
        </div>
      </div>

      <div className="memo-hub-problem">
        <strong>Problématique</strong>
        <p>{text.memoryCard.problem}</p>
      </div>

      <div className="memo-hub-columns">
        <div>
          <h3>Plan</h3>
          <ol>
            {text.memoryCard.plan.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </div>
        <div>
          <h3>Citations</h3>
          <div className="memo-hub-quotes">
            {text.memoryCard.keyQuotes.slice(0, 3).map((quote) => (
              <Link
                key={`${quote.range.start}-${quote.quote}`}
                to={`/textes/${text.slug}?ligne=${formatRangeParam(quote.range)}#texte-source`}
              >
                <q>{quote.quote}</q>
                <span>{formatRange(quote.range)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="memo-hub-answer">
        <strong>Réponse finale</strong>
        <p>{text.memoryCard.finalSentence}</p>
      </div>

      <div className="memo-hub-actions">
        <Link className="secondary-action" to={`/textes/${text.slug}#memo`}>
          Ouvrir la fiche
        </Link>
      </div>
    </article>
  );
}

function FigureHub() {
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState("all");
  const entries = useMemo(() => buildFigureIndex(studyTexts), []);
  const nameCounts = useMemo(() => getFigureNameCounts(entries), [entries]);
  const filteredEntries = useMemo(
    () => filterFigureIndex(entries, query, selectedName),
    [entries, query, selectedName],
  );
  const coveredTextCount = new Set(entries.map((entry) => entry.textSlug)).size;
  const topNames = nameCounts.slice(0, 12);

  return (
    <main className="figure-hub">
      <header className="figure-hub-header">
        <Link className="back-link" to="/">
          <ChevronLeft aria-hidden="true" />
          Accueil
        </Link>
        <div>
          <div className="brand-line">
            <Layers3 aria-hidden="true" />
            <span>Atelier figures</span>
          </div>
          <h1>Réviser les figures de style</h1>
          <p>Tous les procédés repérés dans les fiches, avec citation, effet produit et retour vers le texte.</p>
        </div>
      </header>

      <section className="figure-hub-stats" aria-label="Synthèse des figures">
        <article>
          <span>Exemples</span>
          <strong>{entries.length}</strong>
        </article>
        <article>
          <span>Procédés</span>
          <strong>{nameCounts.length}</strong>
        </article>
        <article>
          <span>Textes couverts</span>
          <strong>{coveredTextCount}/16</strong>
        </article>
      </section>

      <section className="figure-hub-tools" aria-label="Filtres des figures">
        <label className="search-field">
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Chercher un procédé, une citation, un texte..."
          />
        </label>
        <label className="select-field">
          <span>Procédé</span>
          <select value={selectedName} onChange={(event) => setSelectedName(event.target.value)}>
            <option value="all">Tous les procédés</option>
            {nameCounts.map(({ name, count }) => (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="figure-hub-layout">
        <aside className="figure-name-panel" aria-label="Procédés fréquents">
          <h2>Procédés fréquents</h2>
          <div className="figure-chip-list">
            <button
              type="button"
              className={selectedName === "all" ? "figure-chip active" : "figure-chip"}
              onClick={() => setSelectedName("all")}
            >
              Tous
              <span>{entries.length}</span>
            </button>
            {topNames.map(({ name, count }) => (
              <button
                type="button"
                key={name}
                className={selectedName === name ? "figure-chip active" : "figure-chip"}
                onClick={() => setSelectedName(name)}
              >
                {name}
                <span>{count}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="figure-result-panel" aria-label="Résultats des figures">
          <div className="figure-result-heading">
            <h2>{filteredEntries.length} exemples</h2>
            <p>{selectedName === "all" ? "Tous procédés confondus" : selectedName}</p>
          </div>

          {filteredEntries.length ? (
            <div className="figure-result-list">
              {filteredEntries.map((entry) => (
                <FigureResultCard key={`${entry.textSlug}-${entry.id}-${entry.range.start}`} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Aucun exemple trouvé</strong>
              <p>Essaie un autre mot du texte, un titre ou un procédé.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function FigureResultCard({ entry }: { entry: FigureIndexEntry }) {
  return (
    <article className="figure-result-card">
      <div className="figure-result-topline">
        <span>{entry.name}</span>
        <small>{formatRange(entry.range)}</small>
      </div>
      <q>{entry.quote}</q>
      <p>{entry.explanation}</p>
      <div className="figure-result-footer">
        <div>
          <strong>{entry.textTitle}</strong>
          <span>{entry.author} - {entry.movementTitle}</span>
        </div>
        <Link
          className="secondary-action"
          to={`/textes/${entry.textSlug}?ligne=${formatRangeParam(entry.range)}#texte-source`}
        >
          Ouvrir
        </Link>
      </div>
    </article>
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
  const location = useLocation();
  const requestedRange = useMemo(() => parseRangeParam(new URLSearchParams(location.search).get("ligne")), [location.search]);
  const [selectedRange, setSelectedRange] = useState<LineRange | null>(
    requestedRange ?? text.movements[0]?.range ?? null,
  );
  const [detailsKey, setDetailsKey] = useState(0);
  const [defaultOpen, setDefaultOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("bac-francais-2026:last-opened", text.slug);
  }, [text.slug]);

  useEffect(() => {
    setSelectedRange(requestedRange ?? text.movements[0]?.range ?? null);
  }, [requestedRange, text.slug, text.movements]);

  useEffect(() => {
    function scrollToCurrentHash() {
      const rawHash = window.location.hash || location.hash;
      if (!rawHash) return;

      const target = document.getElementById(decodeURIComponent(rawHash.slice(1)));
      if (!target) return;

      const scrollToTarget = () => {
        if (window.navigator.userAgent.toLowerCase().includes("jsdom")) return;

        const top = target.getBoundingClientRect().top + window.scrollY - 8;
        window.scrollTo({ top, behavior: "auto" });
      };

      window.requestAnimationFrame(scrollToTarget);
      window.setTimeout(scrollToTarget, 80);
      window.setTimeout(scrollToTarget, 240);
    }

    scrollToCurrentHash();
    window.addEventListener("hashchange", scrollToCurrentHash);

    return () => window.removeEventListener("hashchange", scrollToCurrentHash);
  }, [location.hash, text.slug]);

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
          <a href="#quiz">Questions</a>
          <Link to="/figures">Atelier figures</Link>
          <Link to="/memo">Mémos</Link>
          <Link to="/grammaire">Grammaire</Link>
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
                  defaultOpen={defaultOpen}
                  onSelectRange={setSelectedRange}
                />
              ))}
              <div className="problematic">
                <strong>Problématique</strong>
                <span>{text.problematique}</span>
              </div>
              <div className="problem-answer">
                <strong>Réponse directrice</strong>
                <span>{text.recap}</span>
              </div>
            </Chapter>

            {text.movements.map((movement) => (
              <MovementChapter
                key={movement.id}
                movement={movement}
                defaultOpen={defaultOpen}
                onSelectRange={setSelectedRange}
              />
            ))}

            <Chapter id="conclusion" title="Conclusion" defaultOpen={defaultOpen}>
              {text.conclusion.map((section) => (
                <SectionDrawer
                  key={section.id}
                  section={section}
                  defaultOpen={defaultOpen}
                  onSelectRange={setSelectedRange}
                />
              ))}
            </Chapter>

            <FigureReviewChapter text={text} defaultOpen={defaultOpen} onSelectRange={setSelectedRange} />

            <MemoryPanel text={text} onSelectRange={setSelectedRange} />

            <div className="recap">
              <strong>Fil directeur à mémoriser :</strong> {text.recap}
            </div>

            <QuizPanel text={text} />
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
          return (
            <Link
              key={text.slug}
              to={`/textes/${text.slug}`}
              className={text.slug === activeSlug ? "library-link active" : "library-link"}
            >
              <span>{index + 1}</span>
              <strong>{text.title}</strong>
              <small>{text.author} - {statusLabel(text.status)}</small>
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
          <h3>Réponse à la problématique</h3>
          <ul>
            {text.memoryCard.traps.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className="memo-card">
          <h3>Enchaînement de l'analyse</h3>
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

function FigureReviewChapter({
  text,
  defaultOpen,
  onSelectRange,
}: {
  text: StudyText;
  defaultOpen: boolean;
  onSelectRange: (range: LineRange) => void;
}) {
  const figureGroups = getFigureGroups(text);
  const allFigures = figureGroups.flatMap((group) => group.figures);

  return (
    <Chapter id="glossaire" title="Réviser les figures de style" defaultOpen={defaultOpen}>
      <div className="figure-review">
        <div className="figure-review-intro">
          <strong>{allFigures.length} procédés repérés dans cette fiche</strong>
          <p>Chaque entrée associe le procédé, la citation, les lignes et l'effet produit dans l'analyse.</p>
        </div>

        <div className="figure-review-groups">
          {figureGroups.map(({ movement, figures }) => (
            <section className="figure-review-group" key={movement.id}>
              <h3>{movement.title}</h3>
              <div className="figure-review-list">
                {figures.map((figure) => (
                  <button
                    type="button"
                    className="figure-review-item"
                    key={figure.id}
                    onClick={() => onSelectRange(figure.range)}
                  >
                    <span className="figure-review-meta">
                      {figure.name} · {figure.sectionTitle} · {formatRange(figure.range)}
                    </span>
                    <q>{figure.quote}</q>
                    <span>{figure.explanation}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="glossary-strip" aria-label="Définitions utiles">
          {text.glossary.map((item) => (
            <article className="glossary-card" key={item.name}>
              <strong>{item.name}</strong>
              {item.definition}
            </article>
          ))}
        </div>
      </div>
    </Chapter>
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
  onSelectRange,
}: {
  movement: Movement;
  defaultOpen: boolean;
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
          defaultOpen={defaultOpen}
          onSelectRange={onSelectRange}
        />
      ))}
    </Chapter>
  );
}

function SectionDrawer({
  section,
  defaultOpen,
  onSelectRange,
}: {
  section: StudySection;
  defaultOpen: boolean;
  onSelectRange: (range: LineRange) => void;
}) {
  return (
    <details className="subpart" open={defaultOpen}>
      <summary>
        <span>{section.title}</span>
      </summary>
      <div className="detail">
        <div className="simple-box">
          <h4>Analyse</h4>
          <p>{section.simple}</p>
          {section.memory ? (
            <p className="analysis-note">{section.memory}</p>
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
  const activeLineRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedRange?.start, selectedRange?.end]);

  return (
    <aside className="poem-card" id="texte-source" aria-label="Texte source">
      <div className="poem-heading">
        <h2>{text.title}</h2>
        <p>{text.author} - {text.sourceLabel}</p>
      </div>
      <div className="poem-scroll">
        {text.lines.map((line) => {
          const active = isLineInRange(line.number, selectedRange);
          return (
            <button
              key={line.number}
              ref={active && line.number === selectedRange?.start ? activeLineRef : null}
              className={active ? "verse active" : "verse"}
              type="button"
              onClick={() => onSelectRange({ start: line.number, end: line.number })}
            >
              <span className="line-number">{line.number}</span>
              <span>{line.text}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function QuizPanel({ text }: { text: StudyText }) {
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  return (
    <section className="quiz-panel" id="quiz" aria-label="Questions de révision">
      <div className="quiz-heading">
        <div>
          <h2>Questions de révision</h2>
          <p>Questions ouvertes avec réponse masquée, pour vérifier le contenu sans propositions imposées.</p>
        </div>
      </div>

      <div className="quiz-grid">
        {text.quiz.map((item) => (
          <article className="quiz-card" key={item.id}>
            <h3>{item.prompt}</h3>
            <button
              className="answer-reveal"
              type="button"
              onClick={() =>
                setRevealedAnswers((current) => ({
                  ...current,
                  [item.id]: !current[item.id],
                }))
              }
            >
              {revealedAnswers[item.id] ? "Masquer la réponse" : "Voir la réponse"}
            </button>
            {revealedAnswers[item.id] ? (
              <p className="answer-feedback">
                <strong>Réponse :</strong> {item.answer}
                {item.explanation ? <span> {item.explanation}</span> : null}
              </p>
            ) : null}
          </article>
        ))}
      </div>
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
      <Route path="/memo" element={<MemoHub />} />
      <Route path="/figures" element={<FigureHub />} />
      <Route path="/grammaire" element={<GrammarHub />} />
      <Route path="/textes/:slug" element={<StudyRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
