"use client";

import { Children, type ReactNode, useRef, useState } from "react";

export default function PagedSections({ children, labels, title = "Explore", initialPage = 0, pageIndex, onPageChange, scrollNavigation = false, onRefresh, showFooter = false }: { children: ReactNode; labels?: string[]; title?: string; initialPage?: number; pageIndex?: number; onPageChange?: (page: number) => void; scrollNavigation?: boolean; onRefresh?: () => void; showFooter?: boolean }) {
  const contentPages = Children.toArray(children);
  const usesScrollNavigation = scrollNavigation || title === "Home";
  const includesFooter = showFooter || title === "Home";
  const footer = <footer className="paged-footer"><b>Leela</b><p>Stories that bring ancient wisdom a little closer.</p><nav aria-label="Leela links"><a href="/about">About</a><a href="/sources">Sources</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:hello@leela.app">Contact</a></nav><small>MADE WITH CARE FOR CURIOUS HEARTS.</small></footer>;
  const pages = includesFooter ? [...contentPages, footer] : contentPages;
  const labelFor = (index: number) => labels?.[index] || (includesFooter && index === pages.length - 1 ? "About Leela" : `Page ${index + 1}`);
  const [page, setPage] = useState(initialPage);
  const [pullDistance, setPullDistance] = useState(0);
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
  const finishPull = () => {
    if (pullDistance > 88 && current === 0) { if (onRefresh) onRefresh(); else window.location.reload(); }
    setPullDistance(0);
  };
  if (!pages.length) return null;
  return <div className={`paged-sections${usesScrollNavigation ? " paged-sections--scroll" : ""}${includesFooter ? " paged-sections--with-footer" : ""}`} onWheel={event => { if (!usesScrollNavigation || Math.abs(event.deltaY) < 28) return; event.preventDefault(); advance(event.deltaY > 0 ? 1 : -1); }} onTouchStart={event => { if (usesScrollNavigation) touchStart.current = event.touches[0]?.clientY ?? null; }} onTouchMove={event => { if (!usesScrollNavigation || touchStart.current === null || current !== 0) return; setPullDistance(Math.max(0, Math.min(110, event.touches[0].clientY - touchStart.current))); }} onTouchEnd={event => { if (!usesScrollNavigation || touchStart.current === null) return; const distance = event.changedTouches[0].clientY - touchStart.current; touchStart.current = null; if (distance < -56) advance(1); else if (distance > 56 && current > 0) advance(-1); else finishPull(); }}>
    {usesScrollNavigation && current === 0 && <div className={`pull-refresh${pullDistance > 88 ? " ready" : ""}`} aria-live="polite">{pullDistance > 88 ? "Release to refresh Leela" : "Pull down to refresh"}</div>}
    {labels && <nav className="section-tabs" aria-label={title}>{pages.map((_, index) => <button key={index} type="button" aria-current={index === current ? "page" : undefined} onClick={() => change(index)}>{labelFor(index)}</button>)}</nav>}
    <div ref={panel} tabIndex={-1} className="animated-panel" key={current} aria-label={`${title}: ${labelFor(current)}`}>{pages[current]}</div>
    {pages.length > 1 && <nav className="page-controls" aria-label={`${title} pages`}><button type="button" disabled={current === 0} onClick={() => change(current - 1)}>← Back</button><span aria-live="polite">{current + 1} / {pages.length}</span><button type="button" disabled={current === pages.length - 1} onClick={() => change(current + 1)}>Next →</button></nav>}
  </div>;
}
