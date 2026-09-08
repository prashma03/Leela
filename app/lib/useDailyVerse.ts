"use client";

import { useSyncExternalStore } from "react";
import { getLocalDayNumber, getVerseForDay, millisecondsUntilNextDay } from "./getDailyVerse";

function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const refresh = () => {
    clearTimeout(timer);
    onChange();
    // Recover from clock/time-zone changes while the page remains open, too.
    timer = setTimeout(refresh, Math.min(millisecondsUntilNextDay(new Date()) + 25, 60_000));
  };
  refresh();
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
  return () => {
    clearTimeout(timer);
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", refresh);
  };
}

const getSnapshot = () => getLocalDayNumber(new Date());
const getServerSnapshot = () => null;

export function useDailyVerse() {
  // Server and initial hydration share a neutral placeholder. Only the
  // hydrated browser selects a verse using its own local calendar date.
  const day = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return day === null ? null : getVerseForDay(day);
}
