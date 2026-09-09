"use client";

import { Children, type ReactNode, useRef, useState } from "react";

export default function PagedSections({ children, labels, title = "Explore", initialPage = 0, pageIndex, onPageChange }: { children: ReactNode; labels?: string[]; title?: string; initialPage?: number; pageIndex?: number; onPageChange?: (page: number) => void }) {
  const pages = Children.toArray(children);
  const [page, setPage] = useState(initialPage);
  const current = Math.min(pageIndex ?? page, Math.max(0, pages.length - 1));
  const panel = useRef<HTMLDivElement>(null);
  const change = (index: number) => {
    setPage(index);
    onPageChange?.(index);
    requestAnimationFrame(() => {
      panel.current?.focus({ preventScroll: true });
      panel.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  };
  if (!pages.length) return null;
  return <div className="paged-sections">
    {labels && <nav className="section-tabs" aria-label={title}>{pages.map((_, index) => <button key={index} type="button" aria-current={index === current ? "page" : undefined} onClick={() => change(index)}>{labels[index] || `Page ${index + 1}`}</button>)}</nav>}
    <div ref={panel} tabIndex={-1} className="animated-panel" key={current} aria-label={`${title}: ${labels?.[current] || `page ${current + 1}`}`}>{pages[current]}</div>
    {pages.length > 1 && <nav className="page-controls" aria-label={`${title} pages`}><button type="button" disabled={current === 0} onClick={() => change(current - 1)}>← Back</button><span aria-live="polite">{current + 1} / {pages.length}</span><button type="button" disabled={current === pages.length - 1} onClick={() => change(current + 1)}>Next →</button></nav>}
  </div>;
}
