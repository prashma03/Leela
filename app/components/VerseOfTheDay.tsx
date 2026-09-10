"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { gitaSourceNote, type BhagavadGitaEntry } from "../data/bhagavadGita";
import { useDailyVerse } from "../lib/useDailyVerse";
import styles from "./VerseOfTheDay.module.css";

interface VerseOfTheDayProps {
  headingLevel?: 1 | 2;
  savedIds?: readonly string[];
  onSave?: (id: string) => void;
  onReadAnother?: () => void;
  showDailyLink?: boolean;
  entry?: BhagavadGitaEntry;
}

export default function VerseOfTheDay({
  headingLevel = 2, savedIds = [], onSave, onReadAnother, showDailyLink = true, entry,
}: VerseOfTheDayProps) {
  const today = useDailyVerse();
  const daily = entry ?? today;
  const titleId = useId();
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const [audioStatus, setAudioStatus] = useState("");

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [daily?.id]);

  function listen() {
    if (!daily) return;
    if (!("speechSynthesis" in window)) {
      setAudioStatus("Read-aloud is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      daily.reference + ". " + daily.contentType + ". " + daily.reflection,
    );
    utterance.lang = "en";
    utterance.rate = 0.88;
    utterance.onend = () => setAudioStatus("");
    utterance.onerror = () => setAudioStatus("Read-aloud stopped. You can try again.");
    setAudioStatus("Reading the reflection.");
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <figure className={styles.artwork} aria-hidden="true">
        <Image src="/images/welcome/gita-manuscript-illustrated.jpg" alt="" fill sizes="190px" />
      </figure>
      <Heading id={titleId} className={styles.heading}>{entry ? "Saved reflection" : "Verse of the Day"}</Heading>
      <Link
        className={styles.content}
        aria-busy={!daily}
        aria-label={daily ? `Open detailed reflection for ${daily.reference}` : undefined}
        href={daily ? `/verse-of-the-day?saved=${encodeURIComponent(daily.id)}` : "/verse-of-the-day"}
      >
        {daily ? <>
          <p className={styles.reference}>{daily.reference}</p>
          <p className={styles.reflection}>{daily.reflection}</p>
          <p className={styles.label}>{daily.contentType} · Tap for deeper meaning</p>
        </> : <p className={styles.placeholder} role="status">Preparing today’s reflection…</p>}
      </Link>
      <div className={styles.actions}>
        <button type="button" onClick={listen} disabled={!daily}>Listen</button>
        {onSave && <button type="button" disabled={!daily}
          aria-pressed={daily ? savedIds.includes(daily.id) : false}
          onClick={() => daily && onSave(daily.id)}
        >{daily && savedIds.includes(daily.id) ? "Saved" : "Save"}</button>}
        {onReadAnother && <button type="button" onClick={onReadAnother}>Read another teaching <span aria-hidden="true">→</span></button>}
        {showDailyLink && <Link href="/verse-of-the-day">Daily reminders <span aria-hidden="true">→</span></Link>}
      </div>
      <p className={styles.audioStatus} role="status">{audioStatus}</p>
      <details className={styles.source}>
        <summary>About this reflection</summary>
        <p>{gitaSourceNote}</p>
        <p>The reference identifies an entry in Leela’s editorial library; the reflection explores Gita themes, not the literal wording of that individual verse.</p>
      </details>
    </section>
  );
}
