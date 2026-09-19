"use client";

import Image from "next/image";
import { Children, type ReactNode, useRef, useState } from "react";

type ChallengeDay = { title: string; anchor: string; action: string; reflection: string };
type ChallengePlan = {
  title: string;
  tag: string;
  days: string;
  description: string;
  verse: string;
  ritual: string;
  reward: string;
  daysList: ChallengeDay[];
};

const fallbackChallengeDays: ChallengeDay[] = [
  { title: "Set the intention", anchor: "Bhagavad Gita 2.47", action: "Name one honest action that is yours to do today.", reflection: "What can I do with care, without demanding the result?" },
  { title: "Act with steadiness", anchor: "Bhagavad Gita 2.48", action: "Take one small step, then pause for three slow breaths.", reflection: "What changed when I stopped rushing?" },
  { title: "Carry it forward", anchor: "Bhagavad Gita 6.26", action: "Choose one gentle practice to keep tomorrow.", reflection: "Where did my mind become a little clearer?" },
];

const challengeDetails: Record<string, Omit<ChallengePlan, "title" | "tag" | "days" | "description">> = {
  "3-day clarity challenge": {
    verse: "Bhagavad Gita 2.47",
    ritual: "Begin each day with one uncluttered breath, one honest action, and one evening question.",
    reward: "A quieter mind, not a perfect day.",
    daysList: [
      { title: "Clear the altar", anchor: "Bhagavad Gita 2.47", action: "Write one thing that is truly yours to do. Let every other worry wait outside the door.", reflection: "What result am I trying to control?" },
      { title: "One clean action", anchor: "Bhagavad Gita 2.48", action: "Do the smallest useful step for ten focused minutes, with your phone away.", reflection: "Did my mind soften when I acted steadily?" },
      { title: "Keep the flame", anchor: "Bhagavad Gita 6.26", action: "Choose one simple practice to repeat tomorrow: a breath, a tidy space, or a kind sentence.", reflection: "What became clearer when I stopped adding more?" },
    ],
  },
  "7-day calm path": {
    verse: "Bhagavad Gita 2.70",
    ritual: "A seven-day reset for moments when worry feels louder than wisdom.",
    reward: "A steadier nervous system and one small refuge you can return to.",
    daysList: [
      { title: "Breathe before acting", anchor: "Bhagavad Gita 2.47", action: "Take three slow breaths before one difficult task.", reflection: "What am I trying too hard to control?" },
      { title: "Speak gently", anchor: "Bhagavad Gita 12.13", action: "Answer one person with extra softness.", reflection: "Where can I be truthful without becoming sharp?" },
      { title: "Simplify one thing", anchor: "Bhagavad Gita 17.8", action: "Make one meal, desk, or plan simpler than usual.", reflection: "What made my mind feel lighter?" },
      { title: "Do your duty calmly", anchor: "Bhagavad Gita 18.48", action: "Finish one responsibility without rushing.", reflection: "What is mine to do today?" },
      { title: "Release comparison", anchor: "Bhagavad Gita 2.48", action: "Notice one comparison thought and return to your own path.", reflection: "What would I do if I trusted my journey?" },
      { title: "Serve quietly", anchor: "Bhagavad Gita 9.26", action: "Help someone in a quiet way and let the action be enough.", reflection: "How did kindness change the day?" },
      { title: "Offer the outcome", anchor: "Bhagavad Gita 2.70", action: "Write one worry down, do one useful step, and let the rest wait.", reflection: "What can I release for tonight?" },
    ],
  },
  "exam courage challenge": {
    verse: "Bhagavad Gita 2.48",
    ritual: "Study with sincerity, rest without guilt, and let effort become your offering.",
    reward: "Courage that comes from preparation, not panic.",
    daysList: [
      { title: "Make the map", anchor: "Bhagavad Gita 2.47", action: "Choose the three topics that matter most and give each one a time block.", reflection: "What is the next honest step?" },
      { title: "Practice without fear", anchor: "Bhagavad Gita 2.48", action: "Do one practice set without checking your score until the end.", reflection: "Can I learn without judging myself?" },
      { title: "Ask for help", anchor: "Bhagavad Gita 4.34", action: "Ask one clear question to a teacher, friend, or parent.", reflection: "What became easier when I stopped pretending?" },
      { title: "Rest the mind", anchor: "Bhagavad Gita 6.17", action: "Stop studying at a kind time and sleep like it is part of the work.", reflection: "What does my body need to remember?" },
      { title: "Offer the result", anchor: "Bhagavad Gita 18.66", action: "Before the exam, breathe and say: I will give my honest effort.", reflection: "What can I release after doing my best?" },
    ],
  },
  "kind speech challenge": {
    verse: "Bhagavad Gita 17.15",
    ritual: "Let speech become a small daily offering: truthful, useful, gentle, and timely.",
    reward: "Conversations that feel cleaner, softer, and more courageous.",
    daysList: [
      { title: "Pause before speaking", anchor: "Bhagavad Gita 17.15", action: "Before one reply, pause long enough to soften your tone.", reflection: "What changed when I waited?" },
      { title: "Tell the truth kindly", anchor: "Bhagavad Gita 12.13", action: "Say one honest thing without blame or performance.", reflection: "Where can truth and kindness sit together?" },
      { title: "Repair one thread", anchor: "Bhagavad Gita 6.32", action: "Send one patient message, apology, or appreciation.", reflection: "Which relationship felt a little more open?" },
    ],
  },
};

function buildChallengePlan(challenge: { title: string; tag: string; days: string; description: string }): ChallengePlan {
  const detail = challengeDetails[challenge.title.toLowerCase()];
  const count = Number.parseInt(challenge.days, 10) || detail?.daysList.length || 3;
  const daysList = detail?.daysList ?? fallbackChallengeDays.slice(0, count);
  return {
    ...challenge,
    verse: detail?.verse ?? "Bhagavad Gita 2.47",
    ritual: detail?.ritual ?? "A small practice path for one clear action, one pause, and one honest reflection.",
    reward: detail?.reward ?? "A steadier way to return to what matters.",
    daysList,
  };
}

export default function PagedSections({ children, labels, title = "Explore", initialPage = 0, pageIndex, onPageChange, scrollNavigation = false, onRefresh, showFooter = false }: { children: ReactNode; labels?: string[]; title?: string; initialPage?: number; pageIndex?: number; onPageChange?: (page: number) => void; scrollNavigation?: boolean; onRefresh?: () => void; showFooter?: boolean }) {
  const contentPages = Children.toArray(children);
  const usesScrollNavigation = scrollNavigation;
  const includesFooter = showFooter || title === "Home";
  const usesFooterGesture = includesFooter && title === "Home";
  const footer = <footer className="paged-footer">
    <div className="paged-footer-brand">
      <Image src="/brand-mark.svg" alt="" width={30} height={30} aria-hidden="true" />
      <b>Leela</b>
    </div>
    <p>Stories that bring ancient wisdom a little closer.</p>
    <nav aria-label="Leela links">
      <a href="/about">About</a><a href="/sources">Sources</a><a href="/artwork">Artwork Credits</a><a href="/privacy">Privacy</a><a href="/delete-account">Delete Account</a><a href="/terms">Terms</a><a href="mailto:hello@leela.app">Contact</a>
    </nav>
    <a className="paged-footer-credit" href="https://commons.wikimedia.org/" target="_blank" rel="noreferrer">Historic artwork via Wikimedia Commons - Hero courtesy Wellcome Collection (CC BY 4.0), resized and cropped</a>
    <small>MADE WITH CARE FOR CURIOUS HEARTS.</small>
  </footer>;
  const pages = includesFooter ? [...contentPages, footer] : contentPages;
  const labelFor = (index: number) => labels?.[index] || (includesFooter && index === pages.length - 1 ? "About Leela" : `Page ${index + 1}`);
  const [page, setPage] = useState(initialPage);
  const [pullDistance, setPullDistance] = useState(0);
  const [challenge, setChallenge] = useState<{ title: string; tag: string; days: string; description: string } | null>(null);
  const challengePlan = challenge ? buildChallengePlan(challenge) : null;
  const current = Math.min(pageIndex ?? page, Math.max(0, pages.length - 1));
  const panel = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const gestureLocked = useRef(false);
  const change = (index: number) => {
    setPage(index);
    onPageChange?.(index);
    requestAnimationFrame(() => {
      panel.current?.focus({ preventScroll: true });
      panel.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  };
  const advance = (direction: 1 | -1) => {
    if (gestureLocked.current) return;
    if (direction === -1 && current === 0) return;
    if (direction === 1 && current === pages.length - 1) return;
    gestureLocked.current = true;
    window.setTimeout(() => { gestureLocked.current = false; }, 600);
    change(current + direction);
  };
  const atScrollBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
  const finishPull = () => {
    if (pullDistance > 88 && current === 0) { if (onRefresh) onRefresh(); else window.location.reload(); }
    setPullDistance(0);
  };
  if (!pages.length) return null;
  return <div className={`paged-sections${usesScrollNavigation ? " paged-sections--scroll" : ""}${includesFooter ? " paged-sections--with-footer" : ""}`} onClickCapture={event => { if (title !== "Wisdom Path") return; const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".challenge-selector button"); if (!button) return; event.preventDefault(); event.stopPropagation(); const parts = Array.from(button.children).map(child => child.textContent?.trim() || ""); setChallenge({ tag: parts[0] || "Guided practice", title: parts[1] || "A gentle challenge", days: parts[2] || "A few days", description: parts[3] || "A small path for your day." }); }} onWheel={event => { if (Math.abs(event.deltaY) < 28) return; const lastContentPage = pages.length - 2; const canMoveToFooter = usesFooterGesture && current === lastContentPage && event.deltaY > 0 && atScrollBottom(); const canReturnFromFooter = usesFooterGesture && current === pages.length - 1 && event.deltaY < 0; if (usesScrollNavigation || canMoveToFooter || canReturnFromFooter) { event.preventDefault(); advance(event.deltaY > 0 ? 1 : -1); } }} onTouchStart={event => { if (usesScrollNavigation || usesFooterGesture) touchStart.current = event.touches[0]?.clientY ?? null; }} onTouchMove={event => { if ((!usesScrollNavigation && !usesFooterGesture) || touchStart.current === null || current !== 0 || window.scrollY > 0) return; setPullDistance(Math.max(0, Math.min(110, event.touches[0].clientY - touchStart.current))); }} onTouchEnd={event => { if ((!usesScrollNavigation && !usesFooterGesture) || touchStart.current === null) return; const distance = event.changedTouches[0].clientY - touchStart.current; touchStart.current = null; const lastContentPage = pages.length - 2; if ((usesScrollNavigation || (current === lastContentPage && atScrollBottom())) && distance < -56) advance(1); else if ((usesScrollNavigation || current === pages.length - 1) && distance > 56 && current > 0) advance(-1); else if (current === 0) finishPull(); }}>
    {(usesScrollNavigation || usesFooterGesture) && current === 0 && <div className={`pull-refresh${pullDistance > 88 ? " ready" : ""}`} aria-live="polite">{pullDistance > 88 ? "Release to refresh Leela" : "Pull down to refresh"}</div>}
    {labels && <nav className="section-tabs" aria-label={title}>{pages.map((_, index) => <button key={index} type="button" aria-current={index === current ? "page" : undefined} onClick={() => change(index)}>{labelFor(index)}</button>)}</nav>}
    <div ref={panel} tabIndex={-1} className="animated-panel" key={current} aria-label={`${title}: ${labelFor(current)}`}>{pages[current]}</div>
    {pages.length > 1 && !usesFooterGesture && <nav className="page-controls" aria-label={`${title} pages`}><button type="button" disabled={current === 0} onClick={() => change(current - 1)}>← Back</button><span aria-live="polite">{current + 1} / {pages.length}</span><button type="button" disabled={current === pages.length - 1} onClick={() => change(current + 1)}>Next →</button></nav>}
    {challengePlan && <section className="challenge-detail" role="dialog" aria-modal="true" aria-label={challengePlan.title}><article><button type="button" className="challenge-back" onClick={() => setChallenge(null)}>← All challenges</button><div className="challenge-hero"><div><p>{challengePlan.tag}</p><h2>{challengePlan.title}</h2><span>{challengePlan.days} · {challengePlan.verse}</span><p>{challengePlan.description}</p></div><aside><b>Today&apos;s rhythm</b><small>{challengePlan.ritual}</small><em>{challengePlan.reward}</em></aside></div><ol>{challengePlan.daysList.map((day, index) => <li key={day.title}><strong>{String(index + 1).padStart(2, "0")}</strong><div><b>{day.title}</b><span>{day.anchor}</span><small>{day.action}</small><em>{day.reflection}</em></div></li>)}</ol><footer><p><b>Before you begin</b> Keep this light. The goal is not to complete a perfect spiritual checklist; it is to return, gently, one day at a time.</p><button type="button" className="challenge-start" onClick={() => setChallenge(null)}>Begin Day 1 →</button></footer></article></section>}
  </div>;
}
