"use client";

import { useEffect, useMemo, useState } from "react";
import { streakStats } from "../lib/daily-streak";
import styles from "./JourneyGarden.module.css";

type Props = { days: string[]; today: string; storiesRead: number; reflections: number; kindDeeds: number; treasures: number; bloomSignal?: number };

function Tree({ mature }: { mature: boolean }) {
  return <svg viewBox="0 0 100 145" aria-hidden="true" className={`${styles.tree} ${mature ? styles.mature : ""}`}><path d="M49 140V73"/><path d="M50 96 25 73m25 16 27-30m-27 49-29-18"/><path className={styles.canopyBack} d="M21 68c-16-24 12-48 30-31 8-27 43-18 37 8 22 9 11 39-12 36-13 17-44 9-38-11-20 4-28-15-17-29Z"/><path className={styles.canopy} d="M18 71c-17-21 8-42 28-28 2-30 43-26 42 3 23 5 19 37-4 38-8 19-43 15-44-4-18 8-31-4-22-23Z"/><circle className={styles.fruit} cx="36" cy="58" r="4"/><circle className={styles.fruit} cx="61" cy="48" r="4"/><circle className={styles.fruit} cx="70" cy="69" r="4"/></svg>;
}
function Flower({ blooming, fresh, variant }: { blooming: boolean; fresh: boolean; variant: number }) {
  return <span className={`${styles.flower} ${styles[`variant${variant}`]} ${blooming ? styles.blooming : ""} ${fresh ? styles.fresh : ""}`} aria-hidden="true"><i/><b/><em/><strong/><u/><small/></span>;
}

export default function JourneyGarden({ days, today, storiesRead, reflections, kindDeeds, treasures, bloomSignal = 0 }: Props) {
  const streak = useMemo(() => streakStats(days, today), [days, today]);
  const totalCare = streak.total + storiesRead + reflections + kindDeeds + treasures;
  const stage = totalCare >= 22 || streak.best >= 14 ? "A flourishing sacred grove" : totalCare >= 10 || streak.best >= 7 ? "A growing garden" : totalCare >= 3 ? "A new garden" : "A seedling garden";
  const treeCount = Math.min(4, Math.floor((streak.total + storiesRead + reflections) / 4));
  const flowerCount = Math.min(10, Math.max(kindDeeds + treasures, streak.current));
  const [lastSeenFlowers] = useState(() => {
    if (typeof window === "undefined") return flowerCount;
    const stored = Number(window.localStorage.getItem("leelaJourneyGardenFlowers"));
    return Number.isFinite(stored) ? Math.min(10, Math.max(0, stored)) : flowerCount;
  });
  const entryBloomCount = bloomSignal > 0 ? Math.min(10, Math.max(1, streak.current || 1)) : 0;
  const newFlowers = Math.max(entryBloomCount, flowerCount - lastSeenFlowers);
  useEffect(() => {
    window.localStorage.setItem("leelaJourneyGardenFlowers", String(flowerCount));
  }, [flowerCount]);
  return <section className={styles.garden} aria-labelledby="journey-garden-title">
    <header><div><p>YOUR LIVING GARDEN</p><h2 id="journey-garden-title">{stage}</h2><small>Every return, reflection, story, and kind action leaves something living behind.</small></div><aside><b>{totalCare}</b><span>seeds of care</span></aside></header>
    <div className={styles.scene} key={bloomSignal}>
      <span className={styles.skyGlow}/><span className={styles.sun}/><span className={styles.cloudOne}/><span className={styles.cloudTwo}/><span className={styles.hillOne}/><span className={styles.hillTwo}/><span className={styles.hillThree}/><span className={styles.path}/>
      <div className={styles.trees}>{Array.from({ length: 4 }, (_, index) => <Tree key={index} mature={index < treeCount}/>)}</div>
      <div className={styles.flowers}>{Array.from({ length: 10 }, (_, index) => <Flower key={index} blooming={index < flowerCount} fresh={index >= flowerCount - newFlowers && index < flowerCount} variant={index % 4}/>)}</div>
      <span className={styles.pond}/><span className={styles.ripple}/>
      <span className={styles.fireflies} aria-hidden="true"><i/><i/><i/><i/><i/></span>
      {newFlowers > 0 && <span className={styles.bloomNotice}>{entryBloomCount ? "Streak bloom" : "New bloom"}</span>}
    </div>
    <div className={styles.legend}><span><i className={styles.storyMark}/>Stories & reflections grow trees</span><span><i className={styles.kindMark}/>Kindness & treasures grow flowers</span><span><i className={styles.streakMark}/>Daily visits nourish the grove</span></div>
    <div className={styles.stats}><span><b>{streak.current}</b>day streak</span><span><b>{storiesRead}</b>stories read</span><span><b>{reflections}</b>practices completed</span><span><b>{kindDeeds}</b>kind deeds</span></div>
  </section>;
}
