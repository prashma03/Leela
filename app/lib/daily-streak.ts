export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function previousDay(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return localDay(new Date(year, month - 1, date - 1, 12));
}

export function streakStats(days: string[], today: string) {
  const sorted = [...new Set(days)].filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day) && day <= today).sort();
  const visited = new Set(sorted);
  let cursor = visited.has(today) ? today : previousDay(today);
  let current = 0;
  while (visited.has(cursor)) { current++; cursor = previousDay(cursor); }
  let best = 0, run = 0, last = "";
  for (const day of sorted) { run = previousDay(day) === last ? run + 1 : 1; best = Math.max(best, run); last = day; }
  return { current, best, total: sorted.length };
}
