import { Capacitor, registerPlugin } from "@capacitor/core";
import { getLocalDayNumber, getVerseForDay } from "./getDailyVerse";

type VerseEntry = { date: string; reference: string; reflection: string };

type LeelaVersePlugin = {
  saveVerseSchedule(options: { entries: VerseEntry[] }): Promise<void>;
  openWallpaperChooser(): Promise<void>;
};

const LeelaVerse = registerPlugin<LeelaVersePlugin>("LeelaVerse");

function localDate(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function syncVerseScheduleToAndroid() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;
  const entries = Array.from({ length: 35 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const verse = getVerseForDay(getLocalDayNumber(date));
    return { date: localDate(offset), reference: verse.reference, reflection: verse.reflection };
  });
  await LeelaVerse.saveVerseSchedule({ entries });
}

export async function openVerseWallpaperChooser() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return false;
  await LeelaVerse.openWallpaperChooser();
  return true;
}
