# Store listing — copy/paste metadata

Everything below is written to pass review as-is. Keep it consistent with `privacy.html`.

## Identity

| Field | Value |
|---|---|
| App name (both stores) | **Pole-Shift Simulator** (home-screen label: "Pole Shift") |
| Bundle ID / package name | `com.loopship.poleshift` — permanent once uploaded |
| Version | 1.0.0 |
| Category | Education (secondary: Reference on iOS) |
| Price | Free, no in-app purchases, no ads |
| Privacy policy URL | https://poleshift.app/privacy.html |
| Support / marketing URL | https://poleshift.app/ (support: https://github.com/loop-ship/Geo/issues) |
| Copyright | © 2026 Loop Ship |

## Apple App Store

**Subtitle** (30 max): `Move the pole, see the physics`

**Promotional text** (170 max):
Pick a new North Pole and watch the planet respond — floods, quakes, volcanoes and climate shifts — with every effect honestly graded by scientific standing.

**Keywords** (100 max, comma-separated, no spaces):
`earth,globe,geology,plate tectonics,earthquake,volcano,sea level,climate,science,simulation,3d`

**Description:**
```
Pole-Shift Simulator is an interactive 3D globe that answers a big "what if": what would happen if Earth's North Pole moved somewhere else?

Drag a new pole anywhere on the planet and watch a real-time physics model play out the consequences:
• Oceans redistribute and new coastlines appear, from real ETOPO terrain data
• Earthquake and volcano hotspots light up where crustal stress changes enough to matter
• Climate belts shift to match the new axis
• Tsunamis, glacial rebound and more, each as its own layer

HONEST BY DESIGN
Every effect carries a badge for its scientific standing — established, debated or speculative — and a "Model Caveats" panel explains exactly where each scenario departs from mainstream geophysics, with named sources. Run the well-known pole-shift scenarios (Hapgood, ECDO, Zacharias) faithfully and see precisely what the science does and doesn't support.

This is a "what-if" explorer for curiosity and learning, not a forecast.

FEATURES
• Guided narrated story for a first walkthrough
• Plain-language mode that swaps jargon for everyday words
• Simple and Advanced modes, from one-tap presets to every physics control
• Share any view as a link
• Works fully offline — everything is on your device
• No accounts, no ads.
```

**App Privacy (nutrition label):** choose **"Yes, we collect data"** and declare exactly two data types. (1) **Usage Data → Product Interaction** and (2) **Location → Coarse Location**. For both: **Data Not Linked to You**; purpose **Analytics** only; **Used to Track You: No**. All other types stay unchecked: no identifiers, no contact info, no precise location, no diagnostics. Coarse Location is the country GoatCounter infers from the request's IP address; the IP itself is not stored (https://www.goatcounter.com/privacy). The apps send anonymous event counts (app/launch, story/step-N, share, card/<id>, controls/advanced) to GoatCounter (cookieless, no IDs, no IDFA, no SDK; `analyticsEnabled()` in geo.html). Apple's App Privacy wording is mandatory, so update the answers in App Store Connect before submitting.

**Age rating questionnaire:** answer **None** to every content category; "Unrestricted web access" **No**; Gambling / contests **No** → rating **4+**.

**Export compliance:** already answered in Info.plist (`ITSAppUsesNonExemptEncryption = NO`) — no prompt per build.

**App Review notes** (App Review Information → Notes):
```
Pole-Shift Simulator is a self-contained, offline 3D scientific simulation. All rendering (WebGL), terrain data and the physics model are bundled in the app; it needs no login and works fully offline. The only network traffic is a few anonymous usage counts (feature use, no identifiers or personal data) sent to GoatCounter (plus the country GoatCounter infers from the IP address, which it does not store), declared in the App Privacy section as Usage Data > Product Interaction and Location > Coarse Location, not linked to identity, not used for tracking. 

To try it: tap "▶ Play guided story" for a 60-second narrated walkthrough, or open the ⚙ controls and choose a scenario preset. Tap "What am I looking at?" for an explanation, and "Honest limitations" for the scientific caveats.

The scenarios are presented explicitly as hypothetical "what-if" explorations, each labelled on screen with its scientific standing; the app does not claim any of them will happen.
```

## Google Play

**Short description** (80 max):
`Move Earth's pole and watch floods, quakes & climate shift — honestly graded.`

**Full description:** reuse the App Store description above (4000 max).

**App content forms (Play Console → Policy → App content):**

| Form | Answer |
|---|---|
| Privacy policy | https://poleshift.app/privacy.html |
| Ads | No, the app does not contain ads |
| App access | All functionality is available without special access |
| Content rating (IARC) | Category: Reference, News, or Educational. Answer No to violence, sexuality, language, controlled substances, gambling, user interaction, sharing location, purchases → **Everyone / PEGI 3** |
| Target audience | 13+ (avoids the Families-policy requirements; the content itself is suitable for all ages) |
| Data safety | "Does your app collect or share any of the required user data types?" → **Yes, collects; shares: No**. Two types: **App activity → App interactions** and **Location → Approximate location** (country inferred from the IP address, which is not stored). Both: collected, **not shared**, purpose **Analytics**. Collection is **required** (no in-app opt-out beyond Do Not Track, which is honoured when the device reports it). Not shared with third parties (GoatCounter acts as our service provider). Data is anonymous. **Encrypted in transit: Yes** (HTTPS). **Deletion request:** not applicable (nothing is tied to a user). Everything else: not collected |
| Government app | No |
| Financial features | None |
| Health | None |
| News app | No |

## Assets checklist

| Asset | Apple | Google | Source |
|---|---|---|---|
| App icon | 1024×1024 PNG, no alpha (already in Xcode) | 512×512 PNG | `assets/icon-only.png` (downscale for Play) |
| Feature graphic | — | 1024×500 | crop from `press-kit/screenshots/og-image.jpg` |
| Phone screenshots | 6.9" (1320×2868) **required**; 6.5" optional | 2–8, min 1080px short side | capture from the app (see SUBMISSION.md) |
| iPad screenshots | 13" (2064×2752) **required** — the app supports iPad | 7"/10" tablet optional | iPad simulator |
| Preview video | optional | optional YouTube URL | `press-kit/screenshots/*.mp4` |
