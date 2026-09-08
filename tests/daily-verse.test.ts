import assert from "node:assert/strict";
import { test } from "node:test";
import { bhagavadGita } from "../app/data/bhagavadGita";
import { getDailyVerse, getLocalDayNumber, getVerseForDay, millisecondsUntilNextDay } from "../app/lib/getDailyVerse";

test("700 unique, ordered references preserve the supplied document's chapter numbering", () => {
  const chapterLengths = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 34, 27, 20, 24, 28, 78];
  assert.equal(bhagavadGita.length, 700);
  assert.equal(new Set(bhagavadGita.map(entry => entry.id)).size, 700);
  let index = 0;
  chapterLengths.forEach((length, chapter) => {
    for (let verse = 1; verse <= length; verse++) {
      const entry = bhagavadGita[index++];
      assert.equal(entry.chapter, chapter + 1);
      assert.equal(entry.verse, verse);
      assert.equal(entry.reference, `Bhagavad Gita ${chapter + 1}.${verse}`);
      assert.ok(entry.reflection.trim());
      assert.ok(entry.chapterTitle);
      assert.equal(entry.contentType, "Gita-inspired reflection");
      assert.equal(entry.literalTranslation, undefined);
    }
  });
});

test("same local calendar day is stable across refresh times in multiple time zones", () => {
  const original = process.env.TZ;
  try {
    for (const zone of ["UTC", "America/Chicago", "Asia/Kolkata", "Pacific/Auckland"]) {
      process.env.TZ = zone;
      const start = new Date(2026, 8, 3);
      const end = new Date(2026, 8, 3, 23, 59, 59, 999);
      assert.equal(getDailyVerse(start), getDailyVerse(end), zone);
      const next = new Date(2026, 8, 4);
      assert.equal(getLocalDayNumber(next) - getLocalDayNumber(start), 1, zone);
      assert.notEqual(getDailyVerse(next).id, getDailyVerse(start).id, zone);
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("leap day, month/year transitions, and DST advance by one calendar day", () => {
  const original = process.env.TZ;
  try {
    process.env.TZ = "America/Chicago";
    for (const [year, month, day] of [[2028, 1, 28], [2028, 1, 29], [2026, 11, 31], [2026, 2, 8], [2026, 10, 1]]) {
      const start = new Date(year, month, day);
      const next = new Date(year, month, day + 1);
      assert.equal(getLocalDayNumber(next) - getLocalDayNumber(start), 1);
      assert.equal(millisecondsUntilNextDay(start), next.getTime() - start.getTime());
    }
    assert.equal(millisecondsUntilNextDay(new Date(2026, 2, 8)), 23 * 3_600_000);
    assert.equal(millisecondsUntilNextDay(new Date(2026, 10, 1)), 25 * 3_600_000);
    assert.equal(millisecondsUntilNextDay(new Date(2026, 8, 3, 23, 59, 59, 999)), 1);
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("full 700-day cycle, wraparound, pre-epoch dates, and invalid inputs", () => {
  assert.equal(new Set(Array.from({ length: 700 }, (_, day) => getVerseForDay(day).id)).size, 700);
  assert.equal(getVerseForDay(0), getVerseForDay(700));
  assert.equal(getVerseForDay(-1), bhagavadGita[699]);
  assert.equal(getLocalDayNumber(new Date(1970, 0, 1)), 0);
  assert.throws(() => getDailyVerse(new Date("invalid")), RangeError);
  assert.throws(() => getVerseForDay(NaN), RangeError);
  assert.throws(() => getVerseForDay(1.5), RangeError);
});
