"use client";

import { useEffect, useMemo, useState } from "react";
import { localDay, streakStats } from "../lib/daily-streak";
import styles from "./JourneyGarden.module.css";

type Props = { scope: string; storiesRead: number; reflections: number; kindDeeds: number; treasures: number };

const readVisitDays = (scope: string) => {
  if (typeof window === "undefined") return [];
  try { const raw: unknown = JSON.parse(localStorage.getItem(`leelaDailyVisits:${scope}`) || "[]"); return Array.isArray(raw) ? raw.filter((day): day is string => typeof day === "string") : []; }
  catch { return []; }
};

function Tree({ mature }: { mature: boolean }) {
  return <svg viewBox="0 0 100 145" aria-hidden="true" className={`${styles.tree} ${mature ? styles.mature : ""}`}><path d="M49 140V74"/><path d="M50 95 28 73m22 17 24-28m-24 47-26-20"/><path className={styles.canopy} d="M20 69c-18-23 12-44 28-28 5-28 42-21 38 6 23 8 12 37-10 34-12 16-44 8-37-10-20 4-27-16-19-27Z"/><circle className={styles.fruit} cx="37" cy="57" r="4"/><circle className={styles.fruit} cx="63" cy="48" r="4"/><circle className={styles.fruit} cx="70" cy="68" r="4"/></svg>;
}
function Flower({ blooming }: { blooming: boolean }) { return <span className={`${styles.flower} ${blooming ? styles.blooming : ""}`} aria-hidden="true"><i/><b/><em/><strong/></span>; }

export default function JourneyGarden({ scope, storiesRead, reflections, kindDeeds, treasures }: Props) {
  const [days, setDays] = useState<string[]>(() => readVisitDays(scope));
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDays(readVisitDays(scope)));
    return () => cancelAnimationFrame(frame);
  }, [scope]);
  const streak = useMemo(() => streakStats(days, localDay()), [days]);
  const totalCare = storiesRead + reflections + kindDeeds + treasures;
  const stage = totalCare >= 22 || streak.best >= 14 ? "A flourishing sacred grove" : totalCare >= 10 || streak.best >= 7 ? "A growing garden" : totalCare >= 3 ? "A new garden" : "A seedling garden";
  const treeCount = Math.min(4, Math.floor((storiesRead + reflections) / 4));
  const flowerCount = Math.min(10, kindDeeds + treasures);
  return <section className={styles.garden} aria-labelledby="journey-garden-title">
    <header><div><p>YOUR LIVING GARDEN</p><h2 id="journey-garden-title">{stage}</h2><small>Every return, reflection, story, and kind action leaves something living behind.</small></div><aside><b>{totalCare}</b><span>seeds of care</span></aside></header>
    <div className={styles.scene}>
      <span className={styles.sun}/><span className={styles.hillOne}/><span className={styles.hillTwo}/><span className={styles.path}/>
      <div className={styles.trees}>{Array.from({ length: 4 }, (_, index) => <Tree key={index} mature={index < treeCount}/>)}</div>
      <div className={styles.flowers}>{Array.from({ length: 10 }, (_, index) => <Flower key={index} blooming={index < flowerCount}/>)}</div>
      <span className={styles.pond}/><span className={styles.ripple}/>
    </div>
    <div className={styles.legend}><span><i className={styles.storyMark}/>Stories & reflections grow trees</span><span><i className={styles.kindMark}/>Kindness & treasures grow flowers</span><span><i className={styles.streakMark}/>Daily visits nourish the grove</span></div>
    <div className={styles.stats}><span><b>{streak.current}</b>day streak</span><span><b>{storiesRead}</b>stories read</span><span><b>{reflections}</b>practices completed</span><span><b>{kindDeeds}</b>kind deeds</span></div>
  </section>;
}
