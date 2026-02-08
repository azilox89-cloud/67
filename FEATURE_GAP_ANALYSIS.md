# MatchFlow vs PractiScore Competitor - Feature Gap Analysis

## What I compared
I compared:
1. The reference PractiScore app decompiled package (`about.html`) feature list and change log.
2. The current MatchFlow implementation in `index.html` and `app.js`.

## Current MatchFlow coverage (implemented)
- Search UI with mode switching for match / competitor / email / member number plus source filtering chips.【F:index.html†L24-L47】
- Match + competitor search logic with partial normalized matching, plus source filtering and direct link handling in code.【F:app.js†L225-L278】
- Saved search history and offline cache history in localStorage.【F:app.js†L99-L140】
- Stage analysis, compare, classification/history, and what-if editor screens are present and wired.【F:index.html†L57-L118】
- Simulated Wi‑Fi sync and offline export actions are present and functional in app logic.【F:app.js†L341-L354】

## PractiScore feature baseline (from reference app)
From the reference app `about.html`:
- Search by match name and competitor name from PractiScore website results index.
- Load results from PractiScore and several other websites.
- Wi‑Fi sync from scoring devices.
- Offline viewing.
- Side-by-side comparison.
- Deep stage analytics (stage info, classifier analysis, timer analysis).
- Classification info/history.
- Combined division results.
- Advanced filtering/search.
- What-if edits for division/power factor/hits/misses/times.
- Stage-linked videos.
- Specialized viewing modes: High Available, Time Only, High Peak.
- Changelog indicates additional advanced capabilities (password-protected results support, scorelog import variants, split-time charts/options, documents attachments, stage image editing, etc.).【F:reference/practiscore_ref/resources/assets/flutter_assets/assets/about.html†L18-L71】【F:reference/practiscore_ref/resources/assets/flutter_assets/assets/about.html†L72-L260】

## Gaps still missing in MatchFlow (high priority)
1. **True PractiScore backend query parity**
   - Current app uses local data + IPSC scraping proxy and simulated provider checks.
   - Missing direct integration with PractiScore result index semantics and hidden-result behavior handling.

2. **Competitor identity depth**
   - Search modes exist, but dataset is small/local and not backed by full remote indexed fields per match posting.

3. **Real sync with scoring devices**
   - Current Wi‑Fi sync is simulated text update, not protocol/device sync.

4. **Robust remote import matrix**
   - Missing broad “other sites” import adapters (ESS/MOS/Shoot-N-Score/scorelogs variants) with parsing confidence and schema normalization.

5. **Advanced analytics parity**
   - No full chart suite (line/range/splits threshold controls/pinned comparisons/best HF/times overlays) indicated by reference changelog.

6. **Document/media management parity**
   - Stage-linked videos supported at simple level, but missing stage images/doc attachment workflows and richer media management.

7. **Operational features from changelog**
   - Password-protected result handling, chrono-specific filters/notes, award/clean/accuracy reports, and expanded long-press/action menus are still absent.

## Medium-priority gaps
- Better direct link ingestion for multiple URL formats (result pages, scorelogs, shared intents) beyond simple URL open card behavior.
- Match-book shortcuts and richer report exports.
- Granular division/category/class/team report variants.

## Recommended implementation plan
1. Build a **provider adapter layer** (`providers/practiscore`, `providers/ipsc`, `providers/uspsa`, `providers/scorelog`) returning a normalized match schema.
2. Replace current ad hoc remote scraping in `runSearch()` with adapter-driven search API and explicit search-type query mapping.
3. Add a **local database cache** (IndexedDB) for full offline browsing and past result updates.
4. Introduce a dedicated **analytics module** for stage charts/splits/time overlays with reusable chart components.
5. Add **import handlers** for direct links + shared intents (Capacitor deep links / Android intent filters).
6. Implement real sync capabilities only where protocols are documented; otherwise keep simulated mode clearly labeled.

## Bottom line
MatchFlow now covers much of the visible UI surface and core interaction model, but it is still missing key backend/data depth and specialized analytical/reporting behavior needed for true one-to-one PractiScore Competitor parity.【F:app.js†L225-L278】【F:reference/practiscore_ref/resources/assets/flutter_assets/assets/about.html†L18-L71】
