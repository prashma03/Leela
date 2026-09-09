"use client";

import { useMemo, useState } from "react";
import { bhagavadGita, gitaSourceNote, type BhagavadGitaEntry, type GitaTheme } from "../data/bhagavadGita";
import MantraLibrary from "./MantraLibrary";
import styles from "./GitaLearningLibrary.module.css";

type ViewMode = "themes" | "chapters" | "saved" | "mantras";

const themeOrder: readonly GitaTheme[] = ["karma", "discipline", "peace", "devotion", "courage", "anxiety", "purpose", "self-control"];
const themeLabels: Record<GitaTheme, string> = {
  karma: "Karma & action", discipline: "Discipline", peace: "Peace", devotion: "Devotion",
  courage: "Courage", anxiety: "Anxiety", purpose: "Purpose", "self-control": "Self-control",
};
const themePatterns: Record<GitaTheme, RegExp> = {
  karma: /\b(action|work|effort|duty|service|result|reward|offering)\b/i,
  discipline: /\b(discipline|practice|train|steady|consisten|habit|persever|patience)\b/i,
  peace: /\b(peace|calm|still|quiet|equanim|balance|serene|gentle)\b/i,
  devotion: /\b(devotion|faith|love|surrender|divine|sacred|worship|heart)\b/i,
  courage: /\b(courage|brave|strength|fearless|difficult|stand|resilien)\b/i,
  anxiety: /\b(anxiety|fear|worr|uncertain|outcome|attachment|desire|grief)\b/i,
  purpose: /\b(purpose|meaning|path|choose|choice|right|dharma|life)\b/i,
  "self-control": /\b(self-control|restraint|mind|sense|impulse|attention|anger|temper)\b/i,
};
const practices: Record<GitaTheme, string> = {
  karma: "Choose one useful action and give it your full care without measuring the reward.",
  discipline: "Keep one small promise to yourself today, especially when motivation changes.",
  peace: "Pause for three slow breaths before responding to the next difficult moment.",
  devotion: "Turn one ordinary act of kindness into a quiet offering.",
  courage: "Name the next brave step—not the whole journey—and take only that step.",
  anxiety: "Separate what you can influence today from what you cannot control.",
  purpose: "Ask which choice is honest, useful, and aligned with the person you want to become.",
  "self-control": "Notice one impulse without immediately obeying it; give yourself a moment to choose.",
};
const questions: Record<GitaTheme, string> = {
  karma: "Can I value the sincerity of my effort even when the outcome is uncertain?",
  discipline: "What practice becomes possible when I make it small enough to repeat?",
  peace: "What am I ready to hold more lightly today?",
  devotion: "Where can love become an action rather than only a feeling?",
  courage: "What would quiet courage look like in this moment?",
  anxiety: "What is one steady thing I can do now?",
  purpose: "Which responsibility deserves my attention today?",
  "self-control": "What response would I choose if I gave myself one more breath?",
};

function themesFor(entry: BhagavadGitaEntry): readonly GitaTheme[] {
  if (entry.themes?.length) return entry.themes;
  return themeOrder.filter(theme => themePatterns[theme].test(entry.reflection));
}

function primaryTheme(entry: BhagavadGitaEntry): GitaTheme {
  return themesFor(entry)[0] ?? "purpose";
}

interface Props {
  savedIds: readonly string[];
  onSave: (id: string) => void;
  initialTheme?: string;
}

export default function GitaLearningLibrary({ savedIds, onSave, initialTheme = "all" }: Props) {
  const normalizedInitial = initialTheme.toLowerCase() as GitaTheme;
  const [mode, setMode] = useState<ViewMode>("themes");
  const [theme, setTheme] = useState<GitaTheme | "all">(themeOrder.includes(normalizedInitial) ? normalizedInitial : "all");
  const [chapter, setChapter] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const chapters = useMemo(() => Array.from(new Map(bhagavadGita.map(entry => [entry.chapter, entry.chapterTitle])).entries()), []);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bhagavadGita.filter(entry => {
      if (mode === "saved" && !savedIds.includes(entry.id)) return false;
      if (mode === "chapters" && chapter !== "all" && entry.chapter !== chapter) return false;
      if (mode === "themes" && theme !== "all" && !themesFor(entry).includes(theme)) return false;
      return !needle || `${entry.reference} ${entry.chapterTitle} ${entry.reflection}`.toLowerCase().includes(needle);
    });
  }, [chapter, mode, query, savedIds, theme]);

  function chooseMode(next: ViewMode) {
    setMode(next);
    if (next !== "chapters") setChapter("all");
    setVisibleCount(12);
    setExpandedId(null);
  }

  function chooseTheme(next: GitaTheme | "all") {
    setTheme(next);
    setVisibleCount(12);
    setExpandedId(null);
  }

  function chooseChapter(next: number) {
    setChapter(chapter === next ? "all" : next);
    setVisibleCount(12);
    setExpandedId(null);
  }

  return <section className={styles.library} aria-labelledby="gita-library-title">
    <header className={styles.header}>
      <div><p>VERSE LIBRARY</p><h2 id="gita-library-title">Learn the Gita, one reflection at a time.</h2></div>
      <span>{bhagavadGita.length} reflections · 18 chapters</span>
    </header>
    <p className={styles.intro}>Explore by theme or chapter, then open a reflection for a simple practice and question.</p>
    <nav className={styles.tabs} aria-label="Browse verse reflections">
      <button type="button" className={mode === "themes" ? styles.active : ""} aria-pressed={mode === "themes"} onClick={() => chooseMode("themes")}>Themes</button>
      <button type="button" className={mode === "chapters" ? styles.active : ""} aria-pressed={mode === "chapters"} onClick={() => chooseMode("chapters")}>Chapters</button>
      <button type="button" className={mode === "saved" ? styles.active : ""} aria-pressed={mode === "saved"} onClick={() => chooseMode("saved")}>Saved</button>
      <button type="button" className={mode === "mantras" ? styles.active : ""} aria-pressed={mode === "mantras"} onClick={() => chooseMode("mantras")}>Mantras</button>
    </nav>

    {mode === "mantras" ? <MantraLibrary /> : <>
    {mode === "themes" && <div className={styles.chips} aria-label="Reflection themes">
      <button type="button" className={theme === "all" ? styles.selected : ""} aria-pressed={theme === "all"} onClick={() => chooseTheme("all")}>All themes</button>
      {themeOrder.map(item => <button type="button" className={theme === item ? styles.selected : ""} aria-pressed={theme === item} onClick={() => chooseTheme(item)} key={item}>{themeLabels[item]}</button>)}
    </div>}

    {mode === "chapters" && <div className={styles.chapters} aria-label="Bhagavad Gita chapters">
      {chapters.map(([number, title]) => <button type="button" className={chapter === number ? styles.selectedChapter : ""} aria-pressed={chapter === number} onClick={() => chooseChapter(number)} key={number}><span>{number}</span><b>Chapter {number}</b><small>{title.split("—").at(-1)?.trim()}</small></button>)}
    </div>}

    <label className={styles.search}>
      <span aria-hidden="true">⌕</span>
      <input value={query} onChange={event => { setQuery(event.target.value); setVisibleCount(12); setExpandedId(null); }} placeholder="Search references or reflections" />
    </label>
    <div className={styles.status} aria-live="polite">{results.length} reflection{results.length === 1 ? "" : "s"}{mode === "saved" ? " saved" : " found"}</div>

    {results.length === 0 ? <div className={styles.empty}>
      <b>{mode === "saved" ? "No saved reflections yet." : "No reflections match this search."}</b>
      <p>{mode === "saved" ? "Use Save on any reflection and it will appear here." : "Try a chapter number, theme, or a simpler word."}</p>
    </div> : <div className={styles.list}>
      {results.slice(0, visibleCount).map(entry => {
        const itemTheme = primaryTheme(entry);
        const expanded = expandedId === entry.id;
        const saved = savedIds.includes(entry.id);
        return <article className={expanded ? styles.open : ""} key={entry.id}>
          <div className={styles.cardTop}><span>{entry.reference}</span><small>{themeLabels[itemTheme]}</small></div>
          <h3>{entry.chapterTitle}</h3>
          <p className={styles.reflection}>{entry.reflection}</p>
          {expanded && <div className={styles.learning}>
            <section><b>Simple meaning</b><p>{entry.reflection}</p></section>
            <section><b>Try this today</b><p>{practices[itemTheme]}</p></section>
            <section><b>Reflect</b><p>{questions[itemTheme]}</p></section>
            <small>{gitaSourceNote}</small>
          </div>}
          <footer>
            <button type="button" onClick={() => setExpandedId(expanded ? null : entry.id)} aria-expanded={expanded}>{expanded ? "Close" : "Learn more"}</button>
            <button type="button" className={saved ? styles.saved : ""} aria-pressed={saved} onClick={() => onSave(entry.id)}>{saved ? "Saved" : "Save"}</button>
            <span>{entry.contentType}</span>
          </footer>
        </article>;
      })}
    </div>}
    {visibleCount < results.length && <button className={styles.more} type="button" onClick={() => setVisibleCount(count => count + 12)}>Show more <span>{Math.min(visibleCount, results.length)} of {results.length}</span></button>}
    <aside className={styles.source}>{gitaSourceNote}</aside>
    </>}
  </section>;
}
