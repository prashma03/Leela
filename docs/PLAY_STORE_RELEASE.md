# Leela Google Play release

## Current Android release configuration

- Application ID: `com.pronita.leela`
- App name: `Leela`
- Version code: `2`
- Version name: `1.1`
- Minimum Android API: `24`
- Target Android API: `36`
- Production origin: `https://leela-ruddy.vercel.app`
- Release output: `android/app/build/outputs/bundle/release/app-release.aab`

The Android app is a Capacitor shell that loads the production HTTPS origin. The release build disables cleartext traffic, mixed content, WebView debugging, application backup, and Capacitor logging.

## Build a Play upload bundle

Keep `android/keystore.properties` and the upload `.jks` private and backed up outside the repository. Both are ignored by Git. A release build now fails immediately if signing configuration is absent or incomplete.

From the repository root on Windows:

```powershell
npm install
npm run typecheck
npm run build
npx cap sync android
Set-Location android
.\gradlew.bat lintRelease bundleRelease
```

On macOS or Linux, use `./gradlew lintRelease bundleRelease` for the final command.

Before every later upload, increase `versionCode` in `android/app/build.gradle`. Keep the package name unchanged after the first Play upload.

## Play Console values

- Privacy policy: `https://leela-ruddy.vercel.app/privacy`
- Account deletion: `https://leela-ruddy.vercel.app/delete-account`
- App category: Education
- Contains ads: No
- App access: explain that reviewers can use the visible demo experience without creating a personal account

Suggested short description:

> Krishna stories and Gita wisdom for calm, thoughtful everyday reflection.

Suggested full description:

> Leela brings stories of Krishna and the heart of the Bhagavad Gita into a calm, welcoming space. Explore an illustrated story library, discover teachings for everyday situations, save meaningful readings, and ask Leela for gentle guidance grounded in the app's curated material. A dedicated Kids Corner offers age-appropriate stories and reflective activities for families. Leela is educational and devotional in tone and is not medical, legal, crisis, or professional advice.

## Data safety draft — verify in Play Console

Complete the Data safety form from the actual production behavior, not from marketing language. The current implementation should be reviewed for these declarations:

- Account data: name, email address, authenticated user identifier, and password credential handled by Supabase Auth.
- User activity: saved stories, readings, preferences, and adult journey information stored for signed-in users; some journey and Kids Corner information also remains on the device.
- User-generated content: Ask Leela messages are sent to Leela's server and may be sent to the configured AI provider to generate a response.
- Notifications: the app requests notification permission only after the user enables the daily verse reminder.
- Transport security: the production app uses HTTPS and cleartext Android traffic is disabled.
- Deletion: signed-in adults have an in-app deletion action and the public deletion URL above.
- Advertising, purchases, analytics, location, contacts, photos, and financial data: no corresponding SDK or feature was found in this audit.

Confirm the production AI provider, Supabase configuration, retention practices, and whether each provider qualifies as a service provider before submitting the form.

## Store assets still required

- 512 × 512 Play Store icon, 32-bit PNG, at most 1 MB. The existing `public/icons/leela-512.png` is the intended source; confirm it in the listing preview.
- 1024 × 500 feature graphic, JPEG or 24-bit PNG without alpha.
- At least two phone screenshots. Four portrait screenshots at 1080 × 1920 are recommended.
- Screenshot alt text, app title, short description, full description, support email, and the privacy-policy URL.

Use screenshots captured from the release app, with no debug UI, personal information, or misleading functionality.

## Required pre-production decisions and tests

1. Confirm that the Play Console app was registered with package name `com.pronita.leela` before uploading.
2. Upload the signed bundle to Internal testing first and confirm Play App Signing enrollment.
3. Install the Play-generated build on a physical phone and test startup, offline/error handling, navigation, login/signup, account deletion, Ask, Listen, notifications, saved items, Journey, Kids Corner, and process restart.
4. Decide the truthful target-age selection. Because Leela includes Kids Corner and family-directed content, review the Families policy before selecting any child age groups.
5. Complete App access, Ads, Content rating, Target audience and content, Data safety, Health apps, and Account deletion declarations.
6. If this personal developer account was created after November 13, 2023, complete a closed test with at least 12 continuously opted-in testers for 14 days before applying for production access.
7. Verify that the production Supabase and AI environment variables are configured and that the four public URLs—home, privacy, terms, and account deletion—remain available.

## Known verification gap

Voice input uses the browser Speech Recognition API. Android WebView support was not established by the build audit, and the bundle does not request microphone permission. Treat voice input as unverified until it is tested from the Play-installed build on a physical Android device. Do not claim native voice-input support in the store listing until that test passes.
