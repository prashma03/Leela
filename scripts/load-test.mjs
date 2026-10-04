#!/usr/bin/env node

const target = process.env.LEELA_LOAD_TEST_URL || process.argv[2];
const durationMs = Number(process.env.LEELA_LOAD_TEST_DURATION_MS || 30_000);
const concurrency = Number(process.env.LEELA_LOAD_TEST_CONCURRENCY || 8);
const askEnabled = process.env.LEELA_LOAD_TEST_ASK === "1";

if (!target) {
  console.error("Usage: node scripts/load-test.mjs https://your-staging-url");
  console.error("Optional env: LEELA_LOAD_TEST_DURATION_MS, LEELA_LOAD_TEST_CONCURRENCY, LEELA_LOAD_TEST_ASK=1");
  process.exit(1);
}

const base = new URL(target);
const routes = [
  { name: "home", method: "GET", path: "/" },
  { name: "privacy", method: "GET", path: "/privacy" },
  { name: "terms", method: "GET", path: "/terms" },
  { name: "delete-account", method: "GET", path: "/delete-account" },
  { name: "auth-restore", method: "GET", path: "/api/auth" },
];

if (askEnabled) {
  routes.push({
    name: "ask-short",
    method: "POST",
    path: "/api/krishna",
    body: { message: "hello" },
  });
}

const results = [];
const endAt = Date.now() + durationMs;

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

async function hit(route) {
  const url = new URL(route.path, base);
  const started = performance.now();
  let status = 0;
  let ok = false;
  try {
    const response = await fetch(url, {
      method: route.method,
      headers: route.body ? { "Content-Type": "application/json" } : undefined,
      body: route.body ? JSON.stringify(route.body) : undefined,
      redirect: "manual",
    });
    status = response.status;
    ok = status >= 200 && status < 400;
    await response.arrayBuffer();
  } catch {
    ok = false;
  }
  results.push({ route: route.name, status, ok, ms: performance.now() - started });
}

async function worker(index) {
  let cursor = index;
  while (Date.now() < endAt) {
    const route = routes[cursor % routes.length];
    cursor += concurrency;
    await hit(route);
  }
}

await Promise.all(Array.from({ length: concurrency }, (_, index) => worker(index)));

const okCount = results.filter(result => result.ok).length;
const failCount = results.length - okCount;
const durations = results.map(result => result.ms);
const byRoute = new Map();
for (const result of results) {
  const item = byRoute.get(result.route) || [];
  item.push(result);
  byRoute.set(result.route, item);
}

console.log(`Target: ${base.origin}`);
console.log(`Requests: ${results.length}, ok: ${okCount}, failed: ${failCount}, concurrency: ${concurrency}, durationMs: ${durationMs}`);
console.log(`Overall p50=${percentile(durations, 50).toFixed(0)}ms p95=${percentile(durations, 95).toFixed(0)}ms p99=${percentile(durations, 99).toFixed(0)}ms`);

for (const [name, items] of byRoute) {
  const routeDurations = items.map(item => item.ms);
  const failures = items.filter(item => !item.ok).length;
  console.log(`${name}: count=${items.length} fail=${failures} p95=${percentile(routeDurations, 95).toFixed(0)}ms statuses=${[...new Set(items.map(item => item.status))].join(",")}`);
}

const failureRate = results.length ? failCount / results.length : 1;
const p95 = percentile(durations, 95);
if (failureRate > 0.01 || p95 > 2_000) {
  console.error(`Load test failed thresholds: failureRate=${(failureRate * 100).toFixed(2)}%, p95=${p95.toFixed(0)}ms`);
  process.exit(1);
}
