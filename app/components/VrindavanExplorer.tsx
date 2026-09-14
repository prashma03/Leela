"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "./VrindavanExplorer.module.css";

type Discovery = { id: string; title: string; story: string; cue: string };

const discoveries: Discovery[] = [
  { id: "tree", title: "You found the Wish Tree", story: "Its flowers opened softly, as if every kind wish had found a place to rest.", cue: "A leaf turns in the breeze." },
  { id: "cow", title: "You found a Gentle Cow", story: "She blinked slowly and reminded Vrindavan that kindness can be quiet and strong.", cue: "A bell gives a tiny chime." },
  { id: "flute", title: "You found Krishna’s flute", story: "Its sweet music filled Vrindavan, and for one peaceful moment everyone stopped to listen.", cue: "A warm golden shimmer is hiding here." },
  { id: "peacock", title: "You found the Peacock Path", story: "The feathers opened like a little sunrise, inviting you to carry joy wherever you go.", cue: "Something blue-green glimmers nearby." },
  { id: "temple", title: "You found the Little Temple", story: "A small diya glowed at its doorway, brightening the garden with one thankful thought.", cue: "A quiet light waits in the distance." },
];

export default function VrindavanExplorer() {
  const [found, setFound] = useState<string[]>([]);
  const [active, setActive] = useState<Discovery | null>(null);
  const complete = found.length === discoveries.length;
  const remainingHint = useMemo(() => discoveries.find(item => !found.includes(item.id))?.cue, [found]);

  function discover(item: Discovery) {
    if (!found.includes(item.id)) setFound(current => [...current, item.id]);
    setActive(item);
  }

  return <section className={`${styles.explorer} magical-card kid-mobile-explore`} aria-label="Explore Vrindavan">
    <header className={styles.header}>
      <p>Today in Vrindavan <span aria-hidden="true">✦</span></p>
      <h2>Where should we explore?</h2>
      <small>Tap something magical in the garden to discover a little surprise.</small>
    </header>
    <div className={styles.scene} aria-label={remainingHint || "Every little discovery has been found."}>
      <Image src="/images/kids/vrindavan-storybook-garden.png" alt="Original hand-painted Vrindavan garden with child Krishna, a calf, peacock, flute, lotus pond, and temple" fill sizes="(max-width: 700px) calc(100vw - 40px), 1080px" priority />
      <span className={styles.wash}/><span className={styles.path}/><span className={styles.lotus}/><span className={styles.butterfly}/>
      {discoveries.map(item => <button type="button" key={item.id} className={`${styles.discovery} ${styles[item.id]} ${found.includes(item.id) ? styles.found : ""}`} onClick={() => discover(item)} aria-label={`Discover ${item.title.replace("You found ", "")}`}>
        <i aria-hidden="true"/><b aria-hidden="true"/>
      </button>)}
      {complete && <div className={styles.fireflies} aria-hidden="true"><i/><i/><i/><i/><i/></div>}
    </div>
    <div className={styles.progress} aria-live="polite"><div><small>Little discoveries</small><span>{discoveries.map(item => <i className={found.includes(item.id) ? styles.done : ""} key={item.id}/>)}</span></div><b>{found.length} of {discoveries.length} found</b></div>
    {active && <aside className={styles.reveal} aria-live="polite"><div><p>{active.title}</p><span>{active.story}</span></div><button type="button" onClick={() => setActive(null)}>Keep exploring <span aria-hidden="true">→</span></button></aside>}
    {complete && <p className={styles.complete}>You explored all of Vrindavan today. Come back tomorrow for another little adventure.</p>}
  </section>;
}
