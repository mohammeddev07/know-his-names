# Learning modes: recall the Name itself

Date: 2026-10-04. Status: draft for review.

## Intent

Today the app trains one direction only: Arabic/transliteration → meaning
(`components/learning/recall-step.tsx`). Learners can't practise producing or
recognising the Name from its meaning, so they may know "The Most Merciful"
without being able to name it.

Goal: let learners practise **meaning → Name**, choosing the mode themselves,
with the answer shown in Arabic and/or transliteration per their existing
setting. Audience: adults and kids self-studying, mostly English-speaking.
Guardrails: calm, minimal visual design; free, no ads; local-first.

Out of scope: audio, analytics, SEO, kid-specific styling, listening mode,
a separate "Practice" area, a `showArabic` toggle (YAGNI, can follow).

## Decision

**A second, independently scheduled FSRS card per Name** (`ar-rahman:name`
beside today's `ar-rahman:meaning`). Rejected: sharing one card across modes
(a correct meaning rating would wrongly schedule the Name too) and an
unscheduled Practice area (builds no durable memory).

## Card model and data

- `CardType = "meaning" | "name"` (`lib/learning/types.ts`).
  `meaning` = Name → meaning (unchanged). `name` = meaning → Name (new).
- Card IDs stay `${nameId}:${cardType}` via `cardIdFor`.
- A Name's `name` card is created lazily, the first time the learner practises
  that Name in Name or Mixed mode. Existing progress is untouched; no data
  migration. Creating `name` cards for already-learned Names counts against the
  daily new-card limit so a long-time learner is not handed every Name at once.
- `progress.cards` (a `CardsByName`, keyed by `nameId`) stays the map of
  **meaning** cards, so status, the mosaic, forecasts and home are untouched.
  A new `progress.nameCards: CardsByName` holds the `name` cards. The provider
  splits stored cards by `cardType`. (Refined after reading the code: about 15
  call sites key off `cards`, so replacing it would be a wide change for no
  gain.) Known v1 limit: status, "due now" counts and the progress views
  reflect meaning cards only.
- `cardStateSchema.cardType` (`lib/storage/records.ts`) accepts both values.

## Preferences

Added to `UserPreferences` with defaults so current users see no change:

- `reviewMode: "meaning" | "name" | "mixed"`, default `"meaning"`.
- `nameAnswerStyle: "choice" | "reveal"`, default `"choice"`.

Script display reuses `showTransliteration`. Both fields are zod-validated;
imports lacking them fall back to defaults.

## Sessions and UI

- A mode picker in Review (and Learn where relevant) sets `reviewMode`.
- Mixed mode interleaves due `meaning` and `name` cards in one queue, still
  capped by `REVIEW_SESSION_LIMIT` (20).
- Learn is unchanged.
- Name-card prompt: the meaning is shown; the learner answers by
  - **choice** (default): 4 options, the correct Name plus 3 distractors; or
  - **reveal**: reveal the Name, then rate Again/Hard/Good/Easy (today's flow).
  The learner switches between them via `nameAnswerStyle`.
- Choice rating: wrong → Again, right → Good. No Hard/Easy in this style.
- Distractors: first the Name's existing `pairings` partners (`withId`) that
  the learner has already met, then other Names they have met, nearest by
  `order`. Never Names not yet introduced. If fewer than 2 options can be
  built (the learner has met fewer than 2 Names), the card uses the reveal
  style instead. Option order is shuffled with an injectable random function
  so tests are deterministic. A curated confusables list (e.g.
  Ar-Raḥmān/Ar-Raḥīm) is a possible follow-up, kept out of v1 because new
  religious-adjacent content needs owner review.
- UI stays calm: no streaks, confetti or timers.

## Backup and storage

- `name` cards export like any `CardState`. Older backups (meaning-only) still
  import. `BACKUP_SCHEMA_VERSION` stays 1 (additive); bump to 2 only if the
  reviewer prefers an explicit marker. IndexedDB `DB_VERSION` is unchanged.
- An unknown card type in an import is rejected with the existing
  "newer version" message.

## Content change

None. Distractors reuse existing `pairings`; no Name text, meaning or
evidence label changes.

## Testing

- Unit: card ID/type handling; scheduler filtering by type; session building
  per mode; distractor selection (determinism, confusables first, padding,
  only introduced Names); rating mapping; backup round-trip including
  importing an older meaning-only backup.
- Component: mode picker; both answer styles.
- e2e: learn → Name mode → answer by choice → reload → state persists.
- `npm run check` stays green.

## Risks

- Changing the `nameId`-keyed card maps touches several modules; types will
  guide it, tests must cover each.
- Review load rises when learners adopt Mixed mode; the session cap and the
  daily new-card limit keep this bounded.
