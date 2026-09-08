import { bhagavadGita } from "../data/bhagavadGita";

const millisecondsPerDay = 86_400_000;

/** Local calendar date encoded as a day number; elapsed DST hours do not matter. */
export function getLocalDayNumber(date: Date): number {
  if (!Number.isFinite(date.getTime())) throw new RangeError("Invalid date");
  const calendarDate = new Date(0);
  calendarDate.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(calendarDate.getTime() / millisecondsPerDay);
}

export function getVerseForDay(dayNumber: number) {
  if (!Number.isSafeInteger(dayNumber)) throw new RangeError("Invalid day number");
  const index = ((dayNumber % bhagavadGita.length) + bhagavadGita.length) % bhagavadGita.length;
  return bhagavadGita[index];
}

export function getDailyVerse(date: Date = new Date()) {
  return getVerseForDay(getLocalDayNumber(date));
}

/** Local midnight rather than now + 24 hours, including daylight-saving days. */
export function millisecondsUntilNextDay(date: Date): number {
  const next = new Date(date);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - date.getTime();
}
