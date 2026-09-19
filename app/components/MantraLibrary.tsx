"use client";

import { useEffect, useState } from "react";
import { mantras, type MantraEntry } from "../data/mantras";
import { speakWithAndroidTts } from "../lib/native-verse";
import { createGentleUtterance, gentleSpeechPitch, mantraSpeechRate, softenSpeechText } from "../lib/gentleSpeech";
import styles from "./MantraLibrary.module.css";

export default function MantraLibrary({ compact = false }: { compact?: boolean }) {
  const [activeId, setActiveId] = useState(mantras[0].id);
  const [status, setStatus] = useState("");
  const active = mantras.find(item => item.id === activeId) ?? mantras[0];

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  async function listen(item: MantraEntry) {
    if (!("speechSynthesis" in window)) {
      try { if (await speakWithAndroidTts(softenSpeechText(item.roman.replaceAll("\n", ". ")), mantraSpeechRate, gentleSpeechPitch)) { setStatus(`Playing a soft, slow pronunciation guide for ${item.title}.`); return; } } catch { /* Show the same clear fallback below. */ }
      setStatus("Slow audio guidance is not available in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = createGentleUtterance(item.roman.replaceAll("\n", ". "), { lang: "en-IN", rate: mantraSpeechRate });
    utterance.onend = () => setStatus("");
    utterance.onerror = () => setStatus("The audio guide stopped. You can try again.");
    setStatus(`Playing a soft, slow pronunciation guide for ${item.title}.`);
    window.speechSynthesis.speak(utterance);
  }

  return <section className={`${styles.library} ${compact ? styles.compact : ""}`} aria-labelledby={compact ? "kids-mantra-title" : "mantra-title"}>
    <header><p>MANTRAS &amp; RECITATIONS</p><h2 id={compact ? "kids-mantra-title" : "mantra-title"}>{compact ? "Listen, breathe, and repeat." : "Sacred words, approached gently."}</h2><span>{compact ? "Choose one and listen slowly." : "Sanskrit in approachable English letters, with context and meaning."}</span></header>
    {!compact && <div className={styles.choices} role="list" aria-label="Choose a mantra or recitation">
      {mantras.map(item => <button type="button" className={active.id === item.id ? styles.active : ""} aria-pressed={active.id === item.id} onClick={() => { setActiveId(item.id); setStatus(""); }} key={item.id}><small>{item.context}</small><b>{item.title}</b></button>)}
    </div>}
    <article className={styles.card}>
      {compact && <label>Choose one<select value={activeId} onChange={event => { setActiveId(event.target.value); setStatus(""); }}>{mantras.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>}
      <p className={styles.context}>{active.context}</p>
      <h3>{active.title}</h3>
      <p className={styles.roman}>{active.roman.split("\n").map(line => <span key={line}>{line}</span>)}</p>
      {!compact && <p className={styles.devanagari} lang="sa">{active.devanagari}</p>}
      <div className={styles.meaning}><b>Simple meaning</b><p>{active.meaning}</p></div>
      <footer><button type="button" onClick={() => listen(active)} aria-label={`Listen to a slow pronunciation guide for ${active.title}`}>▶ Listen slowly</button><a href={active.sourceUrl} target="_blank" rel="noreferrer">{active.source} ↗</a></footer>
      <p className={styles.status} role="status">{status}</p>
    </article>
    <aside>Pronunciation varies across traditions. Audio is an automated slow guide, not a substitute for learning from a qualified teacher. Meanings are concise explanations, not literal translations.</aside>
  </section>;
}
