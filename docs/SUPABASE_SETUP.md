# Connect Leela to Supabase

The integration is implemented, but **not live until these steps are completed**.
Do not deploy this change over an existing account service until data migration
and the checks below are complete. Never send secret keys in chat or commit them.

## 1. Prepare the project

Use your existing Supabase project, or create a dedicated Leela project in the
Supabase dashboard. Choose the region appropriate for your users. Creating a paid
plan or enabling paid backups requires the project owner's approval.

In the project's SQL Editor, run
`supabase/migrations/202609030001_leela_accounts.sql` **once**. It creates:

- `leela_profiles`: profile name and bounded journey JSON, linked to Auth users.
- A signup trigger and backfill for existing Supabase users.
- Row-level policies restricting every user to their own profile.
- An atomic update function using the authenticated user's ID.
- Cascading removal of profile data when an Auth account is deleted.

The migration is transactional and intentionally fails if its objects already
exist instead of overwriting unknown tables or policies.

## 2. Configure server environment variables

Use `.env.local` for local development (preserve existing AI settings). Set the
same variables in the hosting provider's environment settings for production.
Use Node.js 22 or newer.

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY=YOUR_SERVER_SECRET_KEY
LEELA_APP_URL=https://YOUR_LEELA_DOMAIN
```

Get these from the Supabase project's Connect/API Keys settings. A legacy
`anon` key can be used as the publishable key; a legacy `service_role` key can
be used as the secret key. None of these variables need a `NEXT_PUBLIC_` prefix:
all Supabase requests go through Leela's server. **Never put the secret/service
role key in browser code, Android assets, source control, or screenshots.**

Normal reads and writes use the user's session and obey RLS. The secret key is
used only to delete the already-authenticated user's account. Configure it before
launch so the existing account-deletion feature works.

For local development, use `LEELA_APP_URL=http://localhost:3000`.
For the current Android wrapper, production must match the HTTPS origin configured
in `capacitor.config.ts`. Reopening that same origin retains its cookies.
Changing domains, reinstalling, clearing app data, or session revocation may
require signing in again.

The old `LEELA_DATA_DIR` setting is no longer used. There is no file-store fallback.

## 3. Set up email confirmation

In Supabase Authentication settings:

1. Enable Email/password authentication and leave email confirmation enabled.
2. Set Site URL to the production Leela origin.
3. Add the exact redirect URL `https://YOUR_LEELA_DOMAIN/auth/confirm` and the
   localhost equivalent used for development. Avoid broad production wildcards.
4. Edit the **Confirm signup** email template to use:

   ```html
   <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=email">Confirm your Leela account</a>
   ```

The signup handler sets RedirectTo to `LEELA_APP_URL/auth/confirm`. The route
verifies the token hash with Supabase, sets the browser's session cookie, and
redirects only to Leela. Do not use the default implicit-flow URL containing a
session in a URL fragment: this application intentionally has no browser Supabase
client to consume it.

If the email opens in an external browser instead of the Android app, the email
is still verified; return to the app and sign in once. Sessions are not shared
between an external browser and the app's WebView.

Configure production SMTP, sender verification, Auth rate limits, password policy,
and abuse protection in Supabase before inviting real users. Password-reset UI
is not added by this storage change; the existing support link remains.

## 4. What keeps a user signed in

Supabase Auth manages access/refresh tokens. Leela stores them in chunk-safe,
HTTP-only, SameSite=Lax cookies, marked Secure in production, with a 90-day cookie
lifetime. The server refreshes expired access tokens while handling `/api/auth`
or `/api/memory`, and writes the renewed cookies back. Supabase session limits,
revocation, or deleted accounts still take precedence over cookie lifetime.

No auth tokens or passwords enter localStorage or API response JSON. Profile and
journey data still have the existing device copy. On real-account login, complete
remote data replaces device state, including empty values, so another visitor's
local items are not silently uploaded. Demo and Kids Corner sessions do not save
through the adult memory API. Cloud-save errors retry while the app remains open;
an unsynced device copy is not automatically merged after a subsequent login.

All account responses, including refresh and confirmation redirects, use private,
no-store cache headers. Public pages are static and restore sessions via the
account API; no server component reads auth cookies. If authenticated server
components are added later, also add Supabase's session-refresh proxy.

## 5. Existing JSON accounts: migration is separate

No old files have been deleted. Before switching a live app, securely export any
surviving `leela-users.json` from the old environment. A Vercel temporary file may
already be gone or differ between instances; do not assume it is a complete backup.

The old scrypt password hashes and session IDs are **not** automatically imported
into Supabase Auth. Existing users must establish verified Supabase credentials.
Do not import an email as verified solely because it appeared in the old file.
After verifying account ownership, an administrator can map old IDs to Supabase
user IDs and migrate only the name/journey data. Keep exports private; never
commit them. Do not launch over real accounts until this migration plan is resolved.

## 6. Verify before launch

- Run `npm run check`, `npm run test:daily`, and `npm run test:accounts`.
- Run `supabase/tests/leela_profiles.sql` in a **test project's** SQL Editor after
  the migration. Its transaction rolls back the two fixture users and tests RLS,
  atomic merging, and cascading deletion.
- Test actual signup, confirmation email, login, saved reflections, profile edits,
  reload, server restart, token refresh, signout, and account deletion.
- Verify account B cannot read or update account A's data using the publishable
  key with B's access token. Verify unauthenticated table access is denied.
- Test cold-close/reopen on the Android device against the deployed HTTPS app.
- Test missing configuration and a database outage; neither may write a JSON file.
- Review Supabase database/Auth backup retention for the chosen plan and practice
  a restore. Managed persistence is not a substitute for backups.

Dependency audit on September 3, 2026 also reported high-severity advisories in
the existing Next.js 16.2.2 dependency tree (Next.js, PostCSS, Sharp, and nanoid).
No Supabase package was flagged by the production audit. Resolve the framework
advisories in a separately tested upgrade before public launch; this integration
does not silently run `npm audit fix --force`.

## References

- [Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [User data and deletion](https://supabase.com/docs/guides/auth/managing-user-data)
- [Row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
