# Leela launch readiness

This is the production checklist before widening access beyond a private beta.

## Go / no-go gates

- `npm run lint`, `npm run typecheck`, `npm run test:story-images`, `npm run test:daily`, `npm run test:accounts`, and `npm run build` pass on a clean checkout.
- Supabase production migration is applied once and `supabase/tests/leela_profiles.sql` passes in a test project.
- Production environment variables are configured: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `LEELA_APP_URL`, and optional `OPENAI_API_KEY`.
- Account signup, email confirmation, login, signout, saved journey sync, account deletion, and Android reopen have been tested against the production domain.
- Ask Leela has a confirmed provider budget limit and OpenAI usage alerting.
- A physical Android install from the release or internal test build passes navigation, back button, offline, restart, Kids, Journey, Listen, and notification checks.
- Privacy, Terms, Artwork credits, Sources, and Delete account URLs are reachable from production.

## Traffic stages

1. Private beta: 50-500 users.
2. Wider beta: 1,000-10,000 users after at least 7 days with stable errors and costs.
3. Public launch: only after load test results and monitoring show headroom.

Do not jump from private beta to a large public release without a fresh build, rollback plan, and provider spend limits.

## Monitoring

The app has lightweight server timing logs for `/api/auth`, `/api/memory`, and `/api/krishna`.

- Set `LEELA_SERVER_TIMING=1` temporarily to log all route timings.
- Even when unset, routes slower than 2 seconds log a line such as `[leela:api/krishna POST] 2450ms`.
- Watch hosting logs for repeated 429s, 5xx responses, and route timings over 2 seconds.
- Add external uptime checks for `/`, `/privacy`, `/terms`, `/delete-account`, and `/api/auth`.

Recommended production dashboards:

- Request rate, p95 latency, 4xx/5xx rate, and cold starts by route.
- Supabase auth errors, database errors, and backup health.
- OpenAI request volume, latency, error rate, and daily spend.
- Android crash-free sessions once Play/internal testing is active.

## Rate limiting

Current in-app limits are process-local guardrails:

- Ask Leela: 24 requests per minute per IP/user-agent bucket.
- Auth writes: 12 requests per minute.
- Account deletion/signout: 8 requests per minute.
- Memory writes: 60 requests per minute.

For multi-instance or serverless scale, replace or supplement this with a shared edge limiter such as hosting-provider WAF/rate limits, Redis/Upstash, Cloudflare, or Vercel Firewall. Process-local limits reduce accidental abuse but do not coordinate across regions or instances.

## Load testing plan

Run against a staging deployment with production-like Supabase and AI limits:

- Anonymous app load: home, stories, kids, gita.
- Auth path: signup/login attempts with safe test accounts.
- Memory save path: bursts of profile/journey updates.
- Ask path: mix of short local replies, fact replies, and OpenAI-backed questions.

Minimum targets before public launch:

- Static pages p95 under 1 second from target regions.
- API p95 under 800ms for auth/memory without upstream outages.
- Ask Leela local fallback p95 under 800ms and OpenAI-backed p95 within the provider budget.
- Error rate under 1% during a 30-minute staged test.

Never load test production OpenAI/Supabase without explicit spend limits and test-user isolation.

## Android release QA

Use a Play Internal testing build, not only `localhost` or a browser:

- Fresh install opens production app and recovers from offline startup.
- Android system back navigates within app pages and only exits after intended exit behavior.
- Login, signup confirmation, signout, account deletion, and reopen all work in WebView.
- Kids page navigation, Create, cow game, Ask, Journey, Gita, and story search are smooth on a mid-range device.
- Notification permission is requested only after the user enables reminders.
- Voice input remains unclaimed unless tested on the Play-installed build.

## Rollback

- Keep the previous known-good commit SHA and hosting deployment URL before each release.
- If auth, memory, or Ask failures exceed threshold, roll back the web deployment first.
- If the Android wrapper is affected, pause staged rollout in Play Console.
- If Supabase migration problems appear, stop signups and writes before attempting manual data changes.

## Remaining scale work

- Add shared/distributed rate limiting before large traffic.
- Add real crash/error reporting with privacy review.
- Split `app/page.tsx` further into route-sized client modules.
- Add automated Play release build verification in CI.
- Add staging load-test scripts once the target host is finalized.
