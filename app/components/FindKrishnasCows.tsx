"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "./FindKrishnasCows.module.css";

type Cow = { id: string; name: string; clue: string; x: number; y: number; coat: string };
type Level = { title: string; place: string; time: number; cows: Cow[] };

const levels: Level[] = [
  { title: "Morning Meadow", place: "Follow the bells through the grass.", time: 55, cows: [
    { id: "gauri", name: "Gauri", clue: "Look low in the left meadow grass.", x: 18, y: 78, coat: "white" },
    { id: "shyama", name: "Shyama", clue: "A gentle friend stands near the shaded trees.", x: 68, y: 64, coat: "brown" },
    { id: "padma", name: "Padma", clue: "Listen for a soft bell near the right grass.", x: 77, y: 80, coat: "spotted" },
    { id: "champa", name: "Champa", clue: "Someone playful is close to the golden path.", x: 42, y: 83, coat: "cream" },
    { id: "malli", name: "Malli", clue: "A small bell waits near the middle meadow.", x: 53, y: 69, coat: "white" },
  ] },
  { title: "River Path", place: "The Yamuna is bright, but the herd is sneaky.", time: 48, cows: [
    { id: "nila", name: "Nila", clue: "Try the cool shade near the left grass.", x: 12, y: 70, coat: "brown" },
    { id: "kesar", name: "Kesar", clue: "A golden friend is low in the meadow.", x: 29, y: 85, coat: "cream" },
    { id: "tara", name: "Tara", clue: "Search beside the quiet right-side path.", x: 83, y: 73, coat: "spotted" },
    { id: "bindu", name: "Bindu", clue: "Someone tiny is near the center flowers.", x: 58, y: 67, coat: "white" },
    { id: "mira", name: "Mira", clue: "Look under the warm sunlight, not in the sky.", x: 76, y: 56, coat: "cream" },
    { id: "sona", name: "Sona", clue: "The grass near the middle-left is not as quiet as it looks.", x: 36, y: 76, coat: "brown" },
  ] },
  { title: "Moonlit Vrindavan", place: "Last round. Careful eyes win the flute song.", time: 42, cows: [
    { id: "radha", name: "Radha", clue: "A friend waits at the very edge of the meadow.", x: 9, y: 76, coat: "white" },
    { id: "mani", name: "Mani", clue: "Check the soft shadow near the center grass.", x: 49, y: 72, coat: "spotted" },
    { id: "rupa", name: "Rupa", clue: "The far-right meadow is hiding a bell.", x: 73, y: 84, coat: "cream" },
    { id: "dhara", name: "Dhara", clue: "Look below the trees where the grass begins.", x: 63, y: 59, coat: "brown" },
    { id: "lila", name: "Lila", clue: "Someone is tucked into the lower flower field.", x: 33, y: 81, coat: "spotted" },
    { id: "jyoti", name: "Jyoti", clue: "Search the glowing meadow path.", x: 88, y: 65, coat: "white" },
    { id: "megha", name: "Megha", clue: "A final friend is almost in the grass.", x: 22, y: 87, coat: "brown" },
  ] },
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

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function MeadowAmbience() {
  return <>
    <span className={styles.sunFace} aria-hidden="true"/>
    <span className={styles.bird} aria-hidden="true"/>
    <span className={styles.butterfly} aria-hidden="true"/>
    <span className={styles.butterflyTwo} aria-hidden="true"/>
    <span className={styles.windLine} aria-hidden="true"/>
  </>;
}

export default function FindKrishnasCows({ onBackHome }: { onBackHome?: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [hinted, setHinted] = useState<string | null>(null);
  const [message, setMessage] = useState("Three rounds, eighteen hidden cows, one shining meadow.");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(levels[0].time);
  const [finished, setFinished] = useState(false);
  const [spark, setSpark] = useState<{ x: number; y: number; text: string } | null>(null);
  const level = levels[levelIndex];
  const totalCows = levels.reduce((total, item) => total + item.cows.length, 0);
  const foundTotal = levels.slice(0, levelIndex).reduce((total, item) => total + item.cows.length, 0) + found.length;
  const nextCow = useMemo(() => level.cows.find(cow => !found.includes(cow.id)), [found, level.cows]);
  const levelComplete = found.length === level.cows.length;
  const gameOver = playing && timeLeft <= 0 && !levelComplete && !finished;
  const rank = score >= 4200 ? "Vrindavan Champion" : score >= 3000 ? "Golden Bell Finder" : score >= 1800 ? "Kind Herd Helper" : "Meadow Explorer";
  const badges = [
    { id: "all", label: "Herd Hero", earned: finished },
    { id: "streak", label: "Flute Streak", earned: bestStreak >= 5 },
    { id: "hints", label: "Sharp Eyes", earned: hintsUsed <= 2 && foundTotal > 0 },
    { id: "score", label: "Golden Bells", earned: score >= 3000 },
  ];

  useEffect(() => {
    if (!playing || finished || levelComplete || timeLeft <= 0) return;
    const timer = window.setInterval(() => setTimeLeft(time => Math.max(0, time - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [finished, levelComplete, playing, timeLeft]);

  const start = () => {
    setPlaying(true); setFinished(false); setLevelIndex(0); setFound([]); setHinted(null);
    setMessage(levels[0].place); setScore(0); setStreak(0); setBestStreak(0); setHintsUsed(0);
    setTimeLeft(levels[0].time); setSpark(null);
  };
  const nextLevel = () => {
    const next = levelIndex + 1;
    if (next >= levels.length) { setFinished(true); setMessage("Every cow is home. Krishna's flute is playing for the herd."); return; }
    setLevelIndex(next); setFound([]); setHinted(null); setTimeLeft(levels[next].time); setMessage(levels[next].place);
  };
  const findCow = (cow: Cow) => {
    if (found.includes(cow.id) || gameOver || finished) return;
    const combo = streak + 1;
    const points = 120 + combo * 35 + Math.max(timeLeft, 0) * 3 - (hinted === cow.id ? 45 : 0);
    setFound(previous => [...previous, cow.id]);
    setHinted(null);
    setStreak(combo);
    setBestStreak(best => Math.max(best, combo));
    setScore(previous => previous + points);
    setMessage(`You found ${cow.name}. Combo x${combo}.`);
    setSpark({ x: cow.x, y: cow.y, text: `+${points}` });
    window.setTimeout(() => setSpark(null), 800);
  };
  const miss = () => {
    if (!playing || levelComplete || gameOver || finished) return;
    setStreak(0);
    setScore(previous => Math.max(0, previous - 20));
    setMessage("Softly, try another patch of grass.");
  };
  const clue = () => {
    if (!nextCow || gameOver || finished) return;
    setHintsUsed(count => count + 1);
    setHinted(nextCow.id);
    setStreak(0);
    setScore(previous => Math.max(0, previous - 30));
    setMessage(nextCow.clue);
  };

  return <section className={`${styles.game} magical-card ${levelIndex === 2 ? styles.night : ""}`} aria-label="Find Krishna's cows game">
    <div className={styles.heading}>
      <div><p>{playing ? `ROUND ${levelIndex + 1} OF ${levels.length}` : "MORE TO PLAY"}</p><h2>Find Krishna&apos;s cows</h2><small>{playing ? `${level.title} - ${level.place}` : "A gentle meadow game with a tiny guide, grounded cows, clues, combos, and badges."}</small></div>
      {playing && !finished && <div className={styles.topActions}><button className={styles.hintButton} type="button" disabled={!nextCow || levelComplete || gameOver} onClick={clue}>Clue -30</button><button className={styles.hintButton} type="button" onClick={start}>Restart</button></div>}
    </div>
    {!playing ? <div className={styles.intro}>
      <div className={styles.introScene}>
        <Image src="/images/kids/cow-game-meadow.png" alt="A calm Vrindavan meadow with grass, trees, and sunlight" fill sizes="(max-width: 700px) 100vw, 680px"/>
        <MeadowAmbience/>
        <div className={styles.tutorialCard} aria-hidden="true">
          <span>Watch the grass</span>
          <span>Tap a cow</span>
          <span>Use clues softly</span>
        </div>
      </div>
      <div><h3>Can you bring the whole herd home?</h3><p>First, watch the meadow. When the round begins, the cows stand in the grass with little shadows, while birds, butterflies, sun, and wind keep the scene alive.</p><button type="button" className="primary" onClick={start}>Begin the forest game</button></div>
    </div> : <>
      <div className={styles.levels} aria-label="Cow game levels">{levels.map((item, index) => <span key={item.title} className={`${index === levelIndex ? styles.currentLevel : ""} ${index < levelIndex || finished ? styles.doneLevel : ""}`}>{index < levelIndex || finished ? "✓" : index + 1}<small>{item.title}</small></span>)}</div>
      <div className={styles.dashboard} aria-live="polite"><span><b>{score}</b> score</span><span><b>{formatTime(timeLeft)}</b> time</span><span><b>{streak}x</b> combo</span><span><b>{foundTotal}/{totalCows}</b> herd</span></div>
      <div className={styles.status}><b>{found.length} of {level.cows.length}</b><span>found in this round</span><p>{gameOver ? "Time is up. Try the round again." : message}</p></div>
      <button type="button" className={styles.scene} onClick={miss} disabled={levelComplete || gameOver || finished} aria-label="Vrindavan meadow. Search for hidden cows.">
        <Image src="/images/kids/cow-game-meadow.png" alt="Vrindavan meadow where Krishna's cows are hiding" fill sizes="(max-width: 700px) 100vw, 880px" priority/>
        <div className={styles.skyGlow}/>
        <MeadowAmbience/>
        {level.cows.map(cow => {
          const isFound = found.includes(cow.id);
          return <span key={cow.id} className={`${styles.cow} ${isFound ? styles.found : ""} ${hinted === cow.id ? styles.hinted : ""}`} style={{ left: `${cow.x}%`, top: `${cow.y}%` }} onClick={event => { event.stopPropagation(); findCow(cow); }} role="button" tabIndex={0} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); findCow(cow); } }} aria-label={isFound ? `${cow.name} found` : "Hidden cow"}>
            <CowIllustration coat={cow.coat}/><span>{isFound ? cow.name : ""}</span>
          </span>;
        })}
        {spark && <strong className={styles.spark} style={{ left: `${spark.x}%`, top: `${spark.y}%` }}>{spark.text}</strong>}
        <div className={styles.grass}/>
      </button>
      <div className={styles.herdList}>{level.cows.map(cow => <span key={cow.id} className={found.includes(cow.id) ? styles.done : ""}>{found.includes(cow.id) ? cow.name : "?"}</span>)}</div>
      <div className={styles.badges}>{badges.map(badge => <span key={badge.id} className={badge.earned ? styles.earned : ""}>{badge.label}</span>)}</div>
      {gameOver && <div className={styles.complete} aria-live="polite"><div><p>TRY AGAIN</p><h3>The herd is still hiding.</h3><p>Use one clue early, protect your combo, and tap only when you are sure.</p><div className={styles.completeActions}><button type="button" className="primary" onClick={() => { setFound([]); setHinted(null); setStreak(0); setTimeLeft(level.time); setMessage(level.place); }}>Replay level {levelIndex + 1}</button>{onBackHome && <button type="button" className={styles.secondaryAction} onClick={onBackHome}>Back to Kids Home</button>}</div></div><Image src="/images/stories/hero-krishna.png" alt="Traditional painting of Krishna" fill sizes="(max-width: 700px) 100vw, 480px"/></div>}
      {levelComplete && !finished && !gameOver && <div className={styles.complete} aria-live="polite"><div><p>{levelIndex === levels.length - 1 ? "ALL COWS FOUND" : `LEVEL ${levelIndex + 1} COMPLETE`}</p><h3>{levelIndex === levels.length - 1 ? "Congratulations — you found every cow!" : "Wonderful! All cows in this meadow are home."}</h3><p>{levelIndex === levels.length - 1 ? `Final rank: ${rank}. Score: ${score}. Tap Finish to see your final celebration.` : `Level ${levelIndex + 2} is ready: ${levels[levelIndex + 1].title}.`}</p><div className={styles.completeActions}><button type="button" className="primary" onClick={nextLevel}>{levelIndex === levels.length - 1 ? "Finish game" : `Start level ${levelIndex + 2}`}</button>{onBackHome && <button type="button" className={styles.secondaryAction} onClick={onBackHome}>Back to Kids Home</button>}</div></div><Image src="/images/stories/hero-krishna.png" alt="Traditional painting of Krishna" fill sizes="(max-width: 700px) 100vw, 480px"/></div>}
      {finished && <div className={styles.complete} aria-live="polite"><div><p>CONGRATULATIONS</p><h3>You found all {totalCows} cows.</h3><p>{rank}. Final score: {score}. Best combo: {bestStreak}x. Hints used: {hintsUsed}. Krishna&apos;s herd is safe at home.</p><div className={styles.completeActions}><button type="button" className="primary" onClick={start}>Play again</button>{onBackHome && <button type="button" className={styles.secondaryAction} onClick={onBackHome}>Back to Kids Home</button>}</div></div><Image src="/images/stories/hero-krishna.png" alt="Traditional painting of Krishna" fill sizes="(max-width: 700px) 100vw, 480px"/></div>}
    </>}
  </section>;
}
