# Shipping to the App Store and Google Play

The apps are a [Capacitor 8](https://capacitorjs.com) native shell around the same `geo.html` that runs
the website. `npm run build:web` writes `www/` — geo.html plus its data, with Three.js / lil-gui vendored
locally so the app works offline — and `cap sync` copies it into `android/` and `ios/`.

What's different inside the apps (all keyed off `NATIVE` in geo.html; the website is unchanged):
no service worker or "Install" prompts, no Ko-fi tip jar (external payment links are rejected by both
stores), anonymous usage counts instead of the website's page-view analytics (see "Analytics in the apps"), Share uses the native share sheet and links to https://poleshift.app/geo.html,
the Android back button closes panels before leaving, and a **Privacy** button links to `privacy.html`.

## Analytics in the apps

The apps count anonymous product interaction with the same GoatCounter site as the website (code `loopship`):
cookieless, no IDs, no IDFA, no tracking SDK, nothing personal, not linked to identity, not used for tracking.
Events: `app/launch`, `story/step-N`, `story/driver-step-N`, `share`, `card/<id>` (hapgood, ecdo, zacharias,
davidson), `controls/advanced`. Do Not Track is honoured; offline or blocked requests are silent no-ops.
Screenshot builds (`STORE_SHOTS=1`) blank the site code so they never count. The App Store privacy label
and the Play Data safety form must match (see `store/STORE_LISTING.md`) and the privacy page says the same.
The tip link stays on the website only.

## 0. Prerequisites (one-time, accounts)

- **Apple Developer Program** — $99/yr, https://developer.apple.com/programs/. Individual or organisation;
  an organisation needs a D-U-N-S number and shows the company name as the seller.
- **Google Play Console** — $25 one-time, https://play.google.com/console. New *personal* accounts must run
  a **closed test with at least 12 testers for 14 consecutive days** before production access is granted;
  organisation accounts are exempt. Plan for this — it is the longest step.
- Deploy `privacy.html` to the website (it ships with this commit) and check
  https://poleshift.app/privacy.html loads. Both stores check the URL.

## 1. Local development

```bash
npm ci
npm run sync            # build www/ and copy it into both native projects
npx cap open android    # Android Studio → Run
npx cap open ios        # Xcode (macOS only) → pick a simulator → Run
```
After any change to geo.html or its assets, run `npm run sync` again. To regenerate icons/splash screens:
`python3 scripts/make-store-art.py && npm run assets`.

## 2. Google Play

1. **Create the upload keystore** (once; back it up somewhere safe — e.g. a password manager):
   ```bash
   keytool -genkeypair -v -keystore release.jks -alias poleshift -keyalg RSA -keysize 2048 -validity 10000
   base64 -w0 release.jks   # macOS: base64 -i release.jks
   ```
2. Add GitHub repository secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
   `ANDROID_KEY_ALIAS` (= `poleshift-upload`), `ANDROID_KEY_PASSWORD`.
3. **Actions → Android → Run workflow.** Download the `poleshift-release-aab` artifact.
   (Or locally: fill `android/keystore.properties` from the `.example`, then `cd android && ./gradlew bundleRelease`.)
4. Play Console → **Create app** (name, Default language English, App, Free). Accept **Play App Signing**.
5. Fill **App content** using `store/STORE_LISTING.md`, then **Main store listing** (descriptions, icon,
   feature graphic, screenshots).
6. **Testing → Closed testing** → create a release, upload the `.aab`, add ≥12 testers' Google accounts
   (an email list or Google Group), roll out. Keep it running 14 days.
7. **Production → Apply for production access**, then create a production release with the same (or a newer) `.aab`.

Target API level: the project targets **Android 16 (API 36)**, above Play's current requirement.

## 3. Apple App Store

1. https://developer.apple.com/account → **Identifiers** → register App ID `com.loopship.poleshift`.
2. https://appstoreconnect.apple.com → **Apps → +** → New App: iOS, name "Pole-Shift Simulator",
   bundle ID above, SKU `poleshift-ios`.
3. **Users and Access → Integrations → App Store Connect API → Generate key** with **Admin** access
   (needed so CI can create the distribution certificate). Download the `.p8` (only downloadable once).
4. Add GitHub secrets: `APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_PRIVATE_KEY` (paste the whole `.p8`).
5. **Actions → iOS → Run workflow.** The build appears in App Store Connect → TestFlight after ~10–30 min
   of processing. (Or on a Mac: `npx cap open ios`, set your Team under Signing & Capabilities,
   Product → Archive → Distribute App.)
6. Install it via TestFlight on a real iPhone and iPad and do a full pass (section 4).
7. Fill the App Store page from `store/STORE_LISTING.md` (description, keywords, privacy label,
   age rating, review notes, screenshots), select the build, **Submit for Review**.

## 4. Before every submission — device test pass

- [ ] Cold start with **airplane mode on**: globe, terrain, textures and controls all load.
- [ ] Guided story plays to the end; scenario presets work; Simple/Advanced toggle.
- [ ] Share opens the native sheet; the shared link opens the same view on poleshift.app.
- [ ] Privacy button opens the policy in the browser.
- [ ] App Privacy label = Usage Data > Product Interaction (Not Linked, Analytics, no tracking); Play Data safety = App interactions.
- [ ] Rotate to landscape and back; notch / Dynamic Island / Android gesture bar never cover controls.
- [ ] Android: back button closes the settings drawer, then the explainer, then exits.
- [ ] Oldest device you can find (e.g. iPhone XR / a 3 GB-RAM Android): no crash on load. The 5400×2700
      terrain texture is the biggest memory spike; if a low-end device crashes, this is where to look.
- [ ] No tip jar, no "Install" button, no mention of "Add to Home Screen" anywhere.

## 5. Screenshots

Use the iOS Simulator (iPhone 16/17 Pro Max for 6.9", iPad Pro 13") and an Android emulator:
`xcrun simctl io booted screenshot shot.png`, or ⌘S in Simulator. Good frames: the flooded globe after the
guided story, an earthquake/volcano layer close-up, the Model Caveats panel, and Plain-language mode.

## 6. Releasing updates

Bump `version` in `package.json`, `versionName` in `android/app/build.gradle` and `MARKETING_VERSION` in
the Xcode project, then run both workflows (or push a `v1.0.1`-style tag, which runs both). Build numbers
come from the workflow run number automatically.

Website changes do **not** reach app users until a new app version ships — the app carries its own copy.

## Common rejection reasons this setup already handles

| Risk | How it's handled |
|---|---|
| Apple 4.2 "minimum functionality" / repackaged website | All code and data bundled; works offline; native share sheet, back-button handling, no browser UI |
| Apple 3.1.1 / Play Payments — external tip link | Tip jar removed in the apps |
| Apple 5.1.1 / Play User Data — privacy policy | `privacy.html`, linked in-app and from both listings |
| Privacy label mismatch | The apps send anonymous GoatCounter event counts, so the labels must say so: App Store "Usage Data > Product Interaction, Not Linked to You, Analytics, no tracking"; Play Data safety "App activity > App interactions, collected, not shared". Privacy page says the same |
| Icon with transparency (iOS) | Icons rendered without alpha |
| Export compliance prompt | `ITSAppUsesNonExemptEncryption = NO` |
| Play target API level | targetSdk 36 |
| Misleading-content concerns (pole-shift topic) | Listing and app both frame it as a labelled "what-if" explorer, not a forecast |
