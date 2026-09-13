"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "./FindKrishnasCows.module.css";

type Cow = { id: string; name: string; clue: string; x: string; y: string; coat: string };

const herd: Cow[] = [
  { id: "gauri", name: "Gauri", clue: "Look near the flowering grove.", x: "18%", y: "54%", coat: "white" },
  { id: "shyama", name: "Shyama", clue: "A gentle friend rests near the old tree.", x: "68%", y: "38%", coat: "brown" },
  { id: "padma", name: "Padma", clue: "Listen for a splash near the lotus water.", x: "75%", y: "70%", coat: "spotted" },
  { id: "champa", name: "Champa", clue: "Someone playful is hiding by the golden hay.", x: "41%", y: "71%", coat: "cream" },
  { id: "malli", name: "Malli", clue: "A small bell is waiting near the little bridge.", x: "53%", y: "43%", coat: "white" },
];

function CowIllustration({ coat }: { coat: string }) {
  return <svg viewBox="0 0 130 94" aria-hidden="true" className={styles.cowArt}>
    <path d="M18 55c0-17 15-29 39-29h29c16 0 27 11 27 27v13c0 7-5 12-12 12H30c-7 0-12-5-12-12V55Z" className={styles[`coat${coat[0].toUpperCase()+coat.slice(1)}`]}/>
    {coat === "spotted" && <><ellipse cx="58" cy="45" rx="10" ry="8" className={styles.spot}/><ellipse cx="87" cy="60" rx="8" ry="6" className={styles.spot}/></>}
    <path d="M97 36c12-11 23-8 25 4v19c0 9-8 14-16 10l-9-5Z" className={styles.face}/>
    <path d="M104 35l-4-13 12 8m4 5 10-9-3 14" className={styles.horns}/>
    <circle cx="115" cy="47" r="2.2" className={styles.eye}/><path d="M115 59c3 2 6 2 8 0" className={styles.mouth}/>
    <path d="M33 75v13m16-13v13m39-13v13m14-13v13" className={styles.legs}/>
    <path d="M20 51C4 40 3 27 13 22" className={styles.tail}/><circle cx="13" cy="20" r="4" className={styles.tailTip}/>
    <path d="M83 76v8c0 4 8 5 8 0v-8" className={styles.bellLine}/><circle cx="87" cy="84" r="5" className={styles.bell}/>
  </svg>;
}

export default function FindKrishnasCows() {
  const [playing, setPlaying] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [hinted, setHinted] = useState<string | null>(null);
  const [message, setMessage] = useState("Five gentle friends have wandered through Vrindavan.");
  const nextCow = useMemo(() => herd.find(cow => !found.includes(cow.id)), [found]);
  const complete = found.length === herd.length;
  const findCow = (cow: Cow) => {
    if (found.includes(cow.id)) return;
    setFound(previous => [...previous, cow.id]);
    setHinted(null);
    setMessage(`You found ${cow.name}. Krishna's herd is coming home.`);
  };
  const restart = () => { setFound([]); setHinted(null); setMessage("Five gentle friends have wandered through Vrindavan."); };

  return <section className={`${styles.game} magical-card kid-mobile-explore`} aria-label="Find Krishna's cows game">
    <div className={styles.heading}>
      <div><p>VRINDAVAN PLAY</p><h2>Find Krishna&apos;s cows</h2><small>A gentle hidden-object story for curious little eyes.</small></div>
      {playing && <button className={styles.hintButton} type="button" onClick={() => nextCow && (setHinted(nextCow.id), setMessage(nextCow.clue))}>Give a clue</button>}
    </div>
    {!playing ? <div className={styles.intro}>
      <div className={styles.introScene}><Image src="/images/stories/krishna-childhood.png" alt="A traditional painting of young Krishna in Vrindavan" fill sizes="(max-width: 700px) 100vw, 680px"/><span/><i/><b/></div>
      <div><h3>Can you bring the herd home?</h3><p>Explore a moving meadow, follow the clues, and find five of Krishna&apos;s beloved cows.</p><button type="button" className="primary" onClick={() => setPlaying(true)}>Begin the forest game</button></div>
    </div> : <>
      <div className={styles.status} aria-live="polite"><b>{found.length} of {herd.length}</b><span>friends found</span><p>{message}</p></div>
      <div className={styles.scene}>
        <Image src="/images/stories/krishna-childhood.png" alt="Vrindavan meadow where Krishna's cows are hiding" fill sizes="(max-width: 700px) 100vw, 880px" priority/>
        <div className={styles.skyGlow}/><i className={styles.cloudOne}/><i className={styles.cloudTwo}/><i className={styles.river}/>
        <span className={styles.tree}/><span className={styles.haystack}/><span className={styles.bridge}/><span className={styles.lotus}/>
        {herd.map(cow => { const isFound = found.includes(cow.id); return <button key={cow.id} type="button" className={`${styles.cow} ${isFound ? styles.found : ""} ${hinted === cow.id ? styles.hinted : ""}`} style={{ left: cow.x, top: cow.y }} onClick={() => findCow(cow)} aria-label={isFound ? `${cow.name} found` : `Look near this part of the meadow`}>
          <CowIllustration coat={cow.coat}/><span>{isFound ? cow.name : ""}</span>
        </button>; })}
        <div className={styles.grass}/>
      </div>
      <div className={styles.herdList}>{herd.map(cow => <span key={cow.id} className={found.includes(cow.id) ? styles.done : ""}>{found.includes(cow.id) ? cow.name : "?"}</span>)}</div>
      {complete && <div className={styles.complete} aria-live="polite"><div><p>THE HERD IS HOME</p><h3>You found every friend.</h3><p>Krishna&apos;s meadow is full again. Careful eyes and a kind heart always notice who needs help.</p><button type="button" className="primary" onClick={restart}>Play again</button></div><Image src="/images/stories/hero-krishna.png" alt="Traditional painting of Krishna" fill sizes="(max-width: 700px) 100vw, 480px"/></div>}
    </>}
  </section>;
}
