"use client";

import Link from "next/link";
import { useState } from "react";

const verses = [
  { ref: "Bhagavad Gita 2.47", verse: "Focus on the work in front of you, not on controlling its reward.", meaning: "Give your best to what you can do today. Your effort and intention are yours.", reflection: "What result am I trying too hard to control?" },
  { ref: "Bhagavad Gita 2.70", verse: "Peace comes when every passing desire does not pull us away.", meaning: "We become steadier when every wish, fear, or outcome does not decide our mood.", reflection: "What would one steady step look like today?" },
  { ref: "Bhagavad Gita 2.22", verse: "As we change old clothes for new, the soul moves through change.", meaning: "Life keeps changing. Our deepest self is larger than any one season.", reflection: "What am I being invited to release gently?" },
  { ref: "Bhagavad Gita 12.13", verse: "One who is friendly, compassionate, and free from hatred is dear to me.", meaning: "Spiritual growth is visible in how gently we treat people.", reflection: "Where can I choose softness without losing honesty?" },
  { ref: "Bhagavad Gita 2.62–63", verse: "When the mind clings too tightly, anger and confusion can grow.", meaning: "The teaching asks us to notice the first spark before it becomes a fire.", reflection: "What usually lights the spark of anger in me?" },
  { ref: "Bhagavad Gita 9.26", verse: "Even a simple offering given with devotion is received with love.", meaning: "A small action becomes meaningful when it carries sincerity.", reflection: "What small act can I offer with a full heart?" },
  { ref: "Bhagavad Gita 18.48", verse: "Every path has difficulty; do not abandon your honest work because it is imperfect.", meaning: "Courage is beginning sincerely without waiting for perfect conditions.", reflection: "What imperfect beginning am I avoiding?" },
  { ref: "Bhagavad Gita 2.48", verse: "Act with steadiness, meeting success and failure with balance.", meaning: "Balance helps us work with care without becoming ruled by praise or blame.", reflection: "How would I act if praise and criticism did not control me?" },
  { ref: "Bhagavad Gita 6.32", verse: "A wise heart sees the joys and sorrows of others with care.", meaning: "Real friendship grows when we treat another person's inner life as real.", reflection: "Who needs my patient attention this week?" },
];

export default function VerseOfTheDayPage() {
  const [index] = useState(() => Math.floor(Date.now() / 86400000) % verses.length);
  const daily = verses[index];

  function listen() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(`Verse of the day. ${daily.ref}. ${daily.verse}. ${daily.meaning}`);
    voice.rate = 0.88;
    window.speechSynthesis.speak(voice);
  }

  return <main className="verse-day-page">
    <Link href="/">← Back to Leela</Link>
    <article>
      <p className="eyebrow">Gita Verse of the Day</p>
      <span>{daily.ref} · SIMPLE PARAPHRASE</span>
      <blockquote>{daily.verse}</blockquote>
      <section><b>Meaning for today</b><p>{daily.meaning}</p></section>
      <section><b>A question to carry</b><p>{daily.reflection}</p></section>
      <button type="button" onClick={listen}>Listen to today&apos;s verse</button>
      <small>Leela uses educational paraphrases with references, not literal Sanskrit translations.</small>
    </article>
  </main>;
}
