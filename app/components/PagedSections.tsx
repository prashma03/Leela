"use client";

import { Children, type ReactNode, useRef, useState } from "react";

export default function PagedSections({ children, labels, title = "Explore", initialPage = 0, pageIndex, onPageChange, scrollNavigation = false, onRefresh, showFooter = false }: { children: ReactNode; labels?: string[]; title?: string; initialPage?: number; pageIndex?: number; onPageChange?: (page: number) => void; scrollNavigation?: boolean; onRefresh?: () => void; showFooter?: boolean }) {
  const contentPages = Children.toArray(children);
  const usesScrollNavigation = scrollNavigation;
  const includesFooter = showFooter || title === "Home";
  const usesFooterGesture = includesFooter && title === "Home";
  const footer = <footer className="paged-footer"><b>Leela</b><p>Stories that bring ancient wisdom a little closer.</p><nav aria-label="Leela links"><a href="/about">About</a><a href="/sources">Sources</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:hello@leela.app">Contact</a></nav><small>MADE WITH CARE FOR CURIOUS HEARTS.</small></footer>;
  const pages = includesFooter ? [...contentPages, footer] : contentPages;
  const labelFor = (index: number) => labels?.[index] || (includesFooter && index === pages.length - 1 ? "About Leela" : `Page ${index + 1}`);
  const [page, setPage] = useState(initialPage);
  const [pullDistance, setPullDistance] = useState(0);
  const [challenge, setChallenge] = useState<{ title: string; tag: string; days: string; description: string } | null>(null);
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
    {challenge && <section className="challenge-detail" role="dialog" aria-modal="true" aria-label={challenge.title}><article><button type="button" className="challenge-back" onClick={() => setChallenge(null)}>← All challenges</button><p>{challenge.tag}</p><h2>{challenge.title}</h2><span>{challenge.days}</span><p>{challenge.description}</p><ol>{Array.from({ length: Number.parseInt(challenge.days, 10) || 3 }, (_, index) => <li key={index}><b>Day {index + 1}</b><small>{index === 0 ? "Set one small, honest intention for today." : index === (Number.parseInt(challenge.days, 10) || 3) - 1 ? "Notice what changed, then carry one gentle practice forward." : "Take one steady action and pause to reflect without judging yourself."}</small></li>)}</ol><button type="button" className="challenge-start" onClick={() => setChallenge(null)}>Begin Day 1 →</button></article></section>}
  </div>;
}
