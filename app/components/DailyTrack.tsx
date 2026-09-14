"use client";

import { useEffect, useState } from "react";
import { localDay, previousDay, streakStats } from "../lib/daily-streak";
import JourneyGarden from "./JourneyGarden";

type DailyTrackProps = { scope: string; visible: boolean; storiesRead: number; reflections: number; kindDeeds: number; treasures: number };

export default function DailyTrack({ scope, visible, storiesRead, reflections, kindDeeds, treasures }: DailyTrackProps) {
  const [record, setRecord] = useState<{ days: string[]; today: string; stored: boolean }>({ days: [], today: "", stored: true });
  useEffect(() => {
    const key = `leelaDailyVisits:${scope}`;
    const checkIn = () => {
      if (document.visibilityState !== "visible") return;
      const today = localDay();
      let days: string[] = [], stored = true;
      try {
        const value: unknown = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(value)) days = value.filter((day): day is string => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day));
        days = [...new Set([...days, today])].sort();
        const encoded = JSON.stringify(days);
        if (localStorage.getItem(key) !== encoded) localStorage.setItem(key, encoded);
      } catch { days = [today]; stored = false; }
      setRecord({ days, today, stored });
    };
    checkIn();
    const timer = window.setInterval(checkIn, 60000);
    document.addEventListener("visibilitychange", checkIn);
    window.addEventListener("storage", checkIn);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", checkIn); window.removeEventListener("storage", checkIn); };
  }, [scope]);
  if (!visible || !record.today) return null;
  const stats = streakStats(record.days, record.today);
  const week = [record.today];
  while (week.length < 7) week.unshift(previousDay(week[0]));
  return <div className="content journey-daily-stack">
    <JourneyGarden days={record.days} today={record.today} storiesRead={storiesRead} reflections={reflections} kindDeeds={kindDeeds} treasures={treasures}/>
    <section className="daily-track" aria-labelledby="daily-track-title">
      <p className="eyebrow">Your daily rhythm</p><h2 id="daily-track-title">{stats.current} day{stats.current === 1 ? "" : "s"} of showing up</h2>
      <p>Today is checked in. A visit each day keeps your streak growing.</p>
      <div className="streak-stats"><span><b>{stats.current}</b>Current streak</span><span><b>{stats.best}</b>Longest streak</span><span><b>{stats.total}</b>Days visited</span></div>
      <ol className="streak-week" aria-label="Last seven days">{week.map(day => <li key={day} className={record.days.includes(day) ? "visited" : ""} aria-label={`${day}: ${record.days.includes(day) ? "visited" : "no visit"}`}><span>{new Date(day + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" })}</span><b aria-hidden="true">{record.days.includes(day) ? "✓" : "·"}</b>{day === record.today && <small>Today</small>}</li>)}</ol>
      <small>{record.stored ? "Saved on this device. Missing a day starts a fresh streak; your longest streak stays." : "Storage is unavailable. This visit counts for now, but cannot be saved on this device."}</small>
    </section>
  </div>;
}
