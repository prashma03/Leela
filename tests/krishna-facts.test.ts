import assert from "node:assert/strict";
import { test } from "node:test";
import { getKrishnaFactReply, isFactualQuestion } from "../app/lib/krishna-facts";

test("answers Pandavas questions directly", () => {
  const reply = getKrishnaFactReply("who were pandavs?");
  assert.ok(reply);
  assert.equal(reply.mode, "local-factual");
  assert.match(reply.text, /Yudhishthira/);
  assert.match(reply.text, /Bhima/);
  assert.match(reply.text, /Arjuna/);
  assert.doesNotMatch(reply.text, /I hear you/i);
  assert.doesNotMatch(reply.text, /next step/i);
});

test("answers common factual questions without advice framing", () => {
  const cases = [
    ["what is the bhagavad gita?", /conversation between Krishna and Arjuna/i],
    ["who is draupadi", /wife of the five Pandavas/i],
    ["where is kurukshetra?", /battlefield/i],
    ["define dharma", /right way to live and act/i],
  ] as const;

  for (const [question, expected] of cases) {
    const reply = getKrishnaFactReply(question);
    assert.ok(reply, question);
    assert.match(reply.text, expected, question);
    assert.doesNotMatch(reply.text, /one gentle next step/i, question);
  }
});

test("detects factual questions separately from emotional support prompts", () => {
  assert.equal(isFactualQuestion("who was arjuna?"), true);
  assert.equal(isFactualQuestion("explain karma"), true);
  assert.equal(isFactualQuestion("I feel anxious"), false);
  assert.equal(isFactualQuestion("which story can calm me?"), false);
});
