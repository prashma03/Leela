import { strict as assert } from "node:assert";
import { test } from "node:test";
import { previousDay, streakStats } from "../app/lib/daily-streak";

test("repeat visits count once and preserve the best streak", () => {
  assert.deepEqual(streakStats(["2026-09-07", "2026-09-08", "2026-09-09", "2026-09-09"], "2026-09-09"), { current: 3, best: 3, total: 3 });
});
test("yesterday keeps a streak alive; a missed full day resets it", () => {
  const days = ["2026-09-06", "2026-09-07"];
  assert.equal(streakStats(days, "2026-09-08").current, 2);
  assert.deepEqual(streakStats([...days, "2026-09-09"], "2026-09-09"), { current: 1, best: 2, total: 3 });
});
test("calendar boundaries include leap days and new years", () => {
  assert.equal(previousDay("2024-03-01"), "2024-02-29");
  assert.equal(previousDay("2026-01-01"), "2025-12-31");
});
