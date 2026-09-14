# Know His Names --- PLAN.md

> **Learn. Remember. Reflect.**

## Implementation Progress

> Keep this section current: tick items as they are completed and verified
> (lint, typecheck, tests and build passing).

**V1 phases:** `██████████░░` **10 / 12 complete** (Phase 11 in progress; Phase 10 needs a qualified human reviewer)

| Phase | Status |
| ----- | ------ |
| 0 --- Repository foundation | ✅ Complete |
| 1 --- Design system | ✅ Complete |
| 2 --- Static UX | ✅ Complete |
| 3 --- Content layer | ✅ Complete |
| 4 --- Local persistence | ✅ Complete |
| 5 --- Learning engine | ✅ Complete |
| 6 --- FSRS | ✅ Complete |
| 7 --- Backup / restore | ✅ Complete |
| 8 --- PWA / offline | ✅ Complete |
| 9 --- UX polish | ✅ Complete |
| 10 --- Religious content verification | ⬜ Needs human scholarly review |
| 11 --- Production launch | 🔄 In progress |

### Detailed checklist

**Phase 0 --- Repository foundation**

- [x] Next.js + TypeScript project
- [x] ESLint and Prettier
- [x] Vitest (unit/component) and Playwright (E2E) configured
- [x] Folder boundaries established
- [x] PLAN.md and README.md
- [x] Production build verified and committed

**Phase 1 --- Design system**

- [x] Theme tokens, light and dark modes (no flash on load)
- [x] Arabic (Scheherazade New), serif (Newsreader) and UI (Hanken Grotesk) typography
- [x] Buttons, cards, inputs, segmented control, switch, dialog, progress bar
- [x] Mobile bottom navigation and desktop header navigation
- [x] Layout primitives, focus states, reduced-motion support
- [x] Checked at 320, 375, 390, 430, 768 and 1280 px

**Phase 2 --- Static UX**

- [x] Home, Learn, Review, Explore, Name Detail, Progress, Settings, Sources
- [x] Clickable primary journey with clearly marked sample data

**Phase 3 --- Content layer**

- [x] Zod schemas for Names and sources
- [x] Content loader and accessors
- [x] Build-time validation (duplicate ids/orders, missing fields, invalid status, unknown sources)
- [x] Source model with enumeration source
- [x] No religious content hard-coded in components

**Phase 4 --- Local persistence**

- [x] `ProgressRepository` interface
- [x] IndexedDB implementation (cards, append-only review history, preferences)
- [x] Atomic review writes, corrupt-record handling, unavailable-storage handling
- [x] Repository unit tests
- [x] UI wired to IndexedDB and verified across reloads

**Phase 5 --- Learning engine**

- [x] New Name selection and configurable daily limit
- [x] Learning sessions with interleaved recall
- [x] Due-review queue and session completion
- [x] Unit tests for session and progress logic

**Phase 6 --- FSRS**

- [x] `ts-fsrs` wrapped behind `ReviewScheduler`
- [x] Again / Hard / Good / Easy mapped and persisted
- [x] Append-only review events
- [x] Scheduling unit tests

**Phase 7 --- Backup / restore**

- [x] Export progress file
- [x] Import with schema/version validation and confirmation
- [x] Rollback of the replaced progress
- [x] E2E restoration test

**Phase 8 --- PWA / offline**

- [x] Manifest, production icons, standalone display
- [x] Service worker: offline shell and bundled content
- [x] Safe-area handling verified

**Phase 9 --- UX polish**

- [x] Transitions, loading, empty and failure states reviewed
- [x] Accessibility refinements
- [x] Lighthouse run and significant findings fixed

**Phase 10 --- Religious content verification**

- [ ] Arabic, ordering, transliteration and translation reviewed by a qualified reviewer
- [ ] Explanations written and reviewed
- [ ] Pronunciation audio recorded and reviewed
- [ ] Content version recorded as verified

**Phase 11 --- Production launch**

- [ ] Metadata, Open Graph, favicon and PWA icons
- [ ] Privacy information
- [ ] Deployed with HTTPS and smoke-tested from the public URL

------------------------------------------------------------------------

## 1. Product Identity

**Product name:** Know His Names\
**Repository:** `know-his-names`\
**Product type:** Mobile-first Progressive Web App (PWA)\
**Primary goal:** Help Muslims learn, understand, and retain the Names
of Allah through active recall and adaptive spaced repetition.

### GitHub description

> A beautiful, open-source PWA for learning and remembering the 99 Names
> of Allah using active recall and spaced repetition (FSRS).

------------------------------------------------------------------------

## 2. Mission

Build a calm, respectful, highly usable learning application that helps
a person move from simply recognizing the Names of Allah to actually
remembering their meanings.

The product is **not primarily a reference list**. It is a personalized
learning system.

A user should be able to:

1.  Start learning immediately without creating an account.
2.  Learn a small number of Names at a time.
3.  See the Arabic Name, transliteration, meaning, and a concise
    verified explanation.
4.  Attempt active recall before seeing an answer.
5.  Rate recall as Again, Hard, Good, or Easy.
6.  Have FSRS schedule future reviews automatically.
7.  See difficult Names more frequently and well-known Names less
    frequently.
8.  Track progress across all 99 Names.
9.  Close the site and return later without losing progress on the same
    device.
10. Export their progress as a backup and import it later.
11. Install the website as a PWA on a phone or desktop.

The product should feel like a focused private learning companion rather
than a generic flashcard application.

------------------------------------------------------------------------

## 3. V1 Architecture Decision

### V1 is local-first.

This is a deliberate decision.

**Do not implement Supabase, PostgreSQL, authentication, accounts, or
cloud synchronization in V1.**

For V1:

-   Next.js provides the application framework.
-   TypeScript is used throughout.
-   The application is a responsive PWA.
-   Learning progress is stored locally using IndexedDB.
-   FSRS determines review scheduling.
-   Religious content is bundled as validated structured content.
-   No login is required.
-   No backend database is required.
-   Users can export/import their learning progress.

### Why local-first?

It allows us to ship the useful product first without introducing:

-   authentication
-   password/account management
-   database provisioning
-   cloud synchronization
-   conflict resolution
-   privacy-sensitive account data
-   backend deployment complexity

### Important limitation

Local data belongs to the browser/device.

If the user:

-   clears browser/site storage,
-   uninstalls/removes the PWA and its data,
-   resets the browser,
-   loses the device,

their local progress may be lost.

Therefore **V1 must include Export Backup and Import Backup**.

### V2

V2 may add Supabase/PostgreSQL for optional accounts and cross-device
synchronization.

The V1 architecture must make that addition straightforward without
rewriting the learning engine.

------------------------------------------------------------------------

## 4. Architectural Style

Use **one GitHub repository**.

Do not split frontend and backend repositories.

Use a **modular monolith** with explicit boundaries between:

-   UI
-   content
-   learning engine
-   spaced repetition
-   persistence
-   analytics abstractions
-   future cloud synchronization

The codebase should be easy for both humans and coding agents to
understand.

Avoid unnecessary abstraction, but maintain clear module boundaries.

------------------------------------------------------------------------

## 5. Core Product Principles

### 5.1 Learning over feature count

Every feature should answer:

> Does this help the learner understand, remember, review, or reflect
> upon the Names?

If not, it probably does not belong in V1.

### 5.2 Zero-friction onboarding

A new user should be able to begin learning within seconds.

Do not require:

-   registration
-   email
-   password
-   onboarding questionnaire

A very short first-run explanation is acceptable.

### 5.3 Active recall first

Do not merely show a Name and its meaning repeatedly.

The learner should attempt to retrieve the answer before revealing it.

### 5.4 Adaptive review

Use FSRS.

Do not invent a custom spaced-repetition algorithm.

### 5.5 Calm, respectful UX

Do not turn religious learning into an aggressive game.

Avoid:

-   manipulative streak loss
-   excessive confetti
-   leaderboards
-   competitive rankings
-   attention-maximizing notifications
-   meaningless XP systems

### 5.6 Content integrity

AI must never fabricate Islamic sources or theological explanations.

------------------------------------------------------------------------

## 6. Religious Content Architecture

Religious content must be completely separated from UI components and
business logic.

Never hard-code meanings or explanations directly in React components.

Suggested content location:

``` text
/content
  /names
    names.json
  /sources
    sources.json
```

Example Name model:

``` ts
interface DivineName {
  id: string;
  order: number;
  arabic: string;
  transliteration: string;
  shortMeaning: string;
  explanation?: string;
  audioUrl?: string;
  sourceIds: string[];
  verificationStatus: "pending" | "reviewed" | "verified";
}
```

The exact enumeration, translations, explanations, references, and
pronunciation content must be transparently sourced and reviewed.

### AI content rule

Coding agents must **not** fill missing religious content by guessing or
generating authoritative-sounding text.

During development, use clearly marked sample/development content when
verified material is not yet available.

### Sources page

Create `/sources`.

It should eventually explain:

-   which enumeration/list the project follows
-   translation methodology
-   source references
-   content version
-   verification/review process
-   corrections/contact process

------------------------------------------------------------------------

## 7. Core V1 Navigation

Primary mobile navigation:

-   Home
-   Learn
-   Explore
-   Progress

Settings should be accessible from the header or a compact menu.

Review may be entered primarily through Home/Continue rather than
occupying permanent navigation.

Desktop should adapt gracefully without becoming a separate desktop
product.

------------------------------------------------------------------------

## 8. Home Screen

The Home screen should answer:

1.  What should I do now?
2.  What is due?
3.  How far have I progressed?

Example:

``` text
Assalamu Alaikum

Continue your journey

17 of 99 Names introduced

8 ready for review

[ Continue Learning ]

Today
3 learned · 8 reviewed
```

The primary CTA is always obvious.

Possible secondary section:

**Name of the Day**

This must not compete visually with the learning CTA.

------------------------------------------------------------------------

## 9. Learn Flow

Default new Names per day:

**3**

Settings may later offer:

-   1
-   2
-   3
-   5
-   7

Learning screen:

``` text
Arabic Name

Transliteration

[ Play pronunciation ]

Meaning

Short verified explanation

[ Continue ]
```

After introduction, the learner should soon encounter active recall for
that Name.

Learning sessions should remain intentionally short.

------------------------------------------------------------------------

## 10. Review Flow

This is the core interaction.

### Question

``` text
الرَّحْمَٰن

Ar-Raḥmān

What does this Name mean?

[ Reveal Meaning ]
```

### Answer

``` text
The Most Merciful

Concise verified explanation

Again    Hard    Good    Easy
```

Meaning:

-   **Again** --- failed recall
-   **Hard** --- recalled with significant difficulty
-   **Good** --- correctly recalled
-   **Easy** --- immediate, confident recall

The rating is passed to the FSRS adapter.

Do not calculate scheduling intervals in UI components.

------------------------------------------------------------------------

## 11. FSRS Architecture

FSRS must be isolated.

Suggested structure:

``` text
/lib/srs
  scheduler.ts
  fsrs-adapter.ts
  types.ts
```

Expose an application-owned interface such as:

``` ts
interface ReviewScheduler {
  getDueCards(now: Date): Promise<LearningCard[]>;
  recordReview(
    cardId: string,
    rating: ReviewRating,
    reviewedAt: Date
  ): Promise<ReviewResult>;
}
```

The rest of the application should not depend directly on a particular
FSRS package.

This allows us to:

-   upgrade FSRS libraries
-   change implementation
-   test scheduling independently
-   migrate data later

------------------------------------------------------------------------

## 12. Card Types

V1 should primarily implement:

### Arabic/transliteration → Meaning

Future architecture should support:

-   Meaning → Name
-   Arabic → transliteration
-   Audio → identify Name
-   Name → deeper explanation/reflection

Do not build all modes in V1 unless the core product is already complete
and stable.

------------------------------------------------------------------------

## 13. Explore

Display all Names.

Each item should communicate learning state:

-   Not started
-   Learning
-   Reviewing
-   Strong

Example:

``` text
01  Ar-Raḥmān       Strong
02  Ar-Raḥīm        Strong
03  Al-Malik        Learning
04  Al-Quddūs       Not started
```

Allow search.

Selecting a Name opens its detail screen.

------------------------------------------------------------------------

## 14. Name Detail

Show:

-   Arabic
-   transliteration
-   short meaning
-   pronunciation/audio when available
-   concise explanation
-   references/sources
-   current learning state

Primary action:

**Practice this Name**

Keep the page visually restrained.

------------------------------------------------------------------------

## 15. Progress

Useful metrics:

-   Names introduced
-   Names strong
-   Names learning
-   Names needing attention
-   reviews completed
-   reviews due
-   recent consistency

Example:

``` text
Your Journey

27 / 99 introduced

21 Strong
4 Learning
2 Need attention
```

A missed day should not punish the user.

Use:

> Welcome back. You have 12 Names ready to review.

Avoid:

> You lost your 37-day streak!

------------------------------------------------------------------------

## 16. Local Persistence

Use **IndexedDB**, not `localStorage`, for learning state and review
history.

Wrap persistence behind an application-owned repository.

Suggested structure:

``` text
/lib/storage
  progress-repository.ts
  indexeddb-progress-repository.ts
  backup.ts
```

Example:

``` ts
interface ProgressRepository {
  getCardState(cardId: string): Promise<CardState | null>;
  saveCardState(state: CardState): Promise<void>;
  appendReview(event: ReviewEvent): Promise<void>;
  getReviewHistory(cardId?: string): Promise<ReviewEvent[]>;
  getPreferences(): Promise<UserPreferences>;
  savePreferences(preferences: UserPreferences): Promise<void>;
}
```

The learning engine must not know IndexedDB details.

------------------------------------------------------------------------

## 17. Review History

Keep review events append-only.

Example:

``` ts
interface ReviewEvent {
  id: string;
  cardId: string;
  reviewedAt: string;
  rating: "again" | "hard" | "good" | "easy";
  previousState: unknown;
  resultingState: unknown;
}
```

Do not store only the latest state.

Review history enables:

-   debugging
-   statistics
-   algorithm migration
-   cloud synchronization
-   recovery
-   future analytics

------------------------------------------------------------------------

## 18. Backup / Restore --- Required in V1

Because progress is local, V1 must provide backup and restore.

Settings should include:

### Export Progress

Downloads a portable backup file.

Suggested format:

``` text
know-his-names-backup-YYYY-MM-DD.json
```

Backup should contain:

-   schema version
-   export timestamp
-   app/content version if useful
-   learning state
-   review history
-   user preferences

### Import Progress

Allow the user to select a previously exported backup.

Before import:

1.  Validate schema.
2.  Validate supported version.
3.  Show a confirmation.
4.  Never silently overwrite data.
5.  Create a safe rollback strategy where practical.

Malformed files must fail safely.

Do not execute arbitrary imported content.

------------------------------------------------------------------------

## 19. Future Supabase Architecture

Supabase is **V2**, not V1.

Potential V2 capabilities:

-   optional accounts
-   cloud backup
-   multi-device sync
-   recovery after device loss
-   authenticated progress history

Likely stack:

-   Supabase Auth
-   Supabase PostgreSQL
-   Row Level Security
-   server-side validation

The future cloud repository should implement the same conceptual
persistence contract.

Example:

``` text
ProgressRepository
    |
    +-- IndexedDbProgressRepository   // V1
    |
    +-- SupabaseProgressRepository    // V2
```

A possible later hybrid approach:

``` text
UI
 ↓
Learning Engine
 ↓
Progress Repository
 ↓
Local IndexedDB
 ↓
Optional Sync Engine
 ↓
Supabase
```

The application should continue functioning offline even after cloud
sync exists.

------------------------------------------------------------------------

## 20. Anonymous-to-Account Migration

When accounts arrive in V2:

A user who has already learned locally must **not lose their progress**
when signing up.

Design V1 data with stable IDs so local history can later be associated
with an account.

Future signup flow:

``` text
Local progress exists
        ↓
Create/sign in to account
        ↓
Offer to sync existing progress
        ↓
Upload/merge safely
        ↓
Continue learning
```

Conflict resolution must be deliberately designed in V2.

Do not implement it prematurely.

------------------------------------------------------------------------

## 21. Visual Direction

The application should feel:

-   peaceful
-   refined
-   warm
-   reverent
-   modern
-   premium
-   uncluttered

Avoid cliché-heavy Islamic app styling.

Do not overuse:

-   mosque silhouettes
-   crescents
-   lanterns
-   ornamental borders
-   bright gold
-   gradients
-   geometric backgrounds

Subtle Islamic geometric influence is acceptable.

### Light theme

-   warm ivory/off-white background
-   white/soft surfaces
-   deep emerald primary
-   restrained muted-gold accent
-   charcoal text

### Dark theme

-   deep charcoal/dark green background
-   slightly lighter surfaces
-   soft emerald primary
-   restrained gold accent
-   warm near-white text

Accessibility takes precedence over visual styling.

------------------------------------------------------------------------

## 22. Typography

Arabic typography is a first-class design requirement.

Use separate typography tokens:

``` css
--font-arabic
--font-sans
```

Arabic Names should be visually dominant.

Transliteration should have secondary hierarchy.

Support proper language and direction attributes.

Do not fake RTL.

------------------------------------------------------------------------

## 23. Responsive UX

Design mobile-first.

Explicitly test:

-   320px
-   375px
-   390px
-   430px
-   tablet
-   desktop

No horizontal scrolling.

Important actions should remain thumb-friendly.

Minimum interactive target should generally be approximately 44px.

Support device safe areas when installed as a PWA.

------------------------------------------------------------------------

## 24. Motion

Use subtle motion for:

-   card reveal
-   screen transitions
-   progress changes
-   review acknowledgement

Typical duration:

**150--250ms**

Respect:

``` css
prefers-reduced-motion
```

No distracting celebration after every answer.

------------------------------------------------------------------------

## 25. Accessibility

Required:

-   semantic HTML
-   keyboard navigation
-   visible focus states
-   accessible labels
-   sufficient contrast
-   scalable text
-   screen-reader-friendly controls
-   reduced-motion support
-   correct Arabic language metadata
-   RTL readiness
-   status indicators that do not rely solely on color

Target WCAG AA wherever practical.

------------------------------------------------------------------------

## 26. PWA

V1 must be installable.

Implement:

-   web app manifest
-   icons
-   standalone display
-   theme/background colors
-   mobile safe-area handling
-   installable experience
-   basic offline application shell
-   offline access to bundled learning content where practical

The PWA should feel app-like without requiring native Android/iOS
projects.

------------------------------------------------------------------------

## 27. Suggested Repository Structure

``` text
know-his-names/
├── app/
│   ├── page.tsx
│   ├── learn/
│   ├── review/
│   ├── explore/
│   ├── progress/
│   ├── settings/
│   ├── sources/
│   └── names/
│
├── components/
│   ├── ui/
│   ├── learning/
│   ├── navigation/
│   └── progress/
│
├── content/
│   ├── names/
│   │   └── names.json
│   └── sources/
│       └── sources.json
│
├── lib/
│   ├── content/
│   ├── learning/
│   ├── srs/
│   │   ├── scheduler.ts
│   │   ├── fsrs-adapter.ts
│   │   └── types.ts
│   └── storage/
│       ├── progress-repository.ts
│       ├── indexeddb-progress-repository.ts
│       └── backup.ts
│
├── hooks/
├── types/
├── public/
│   ├── icons/
│   └── audio/
├── tests/
├── docs/
├── PLAN.md
├── README.md
└── package.json
```

Adapt to current stable Next.js conventions when necessary.

------------------------------------------------------------------------

## 28. Domain Model

### DivineName

``` text
id
order
arabic
transliteration
shortMeaning
explanation
audioUrl
sourceIds[]
verificationStatus
```

### LearningCard

``` text
id
nameId
cardType
```

### ReviewState

Exact fields should follow the selected FSRS implementation, while being
isolated from UI code.

Likely concepts include:

``` text
cardId
due
stability
difficulty
reps
lapses
state
lastReview
```

### ReviewEvent

``` text
id
cardId
reviewedAt
rating
previousState
resultingState
```

### UserPreferences

Potential fields:

``` text
newNamesPerDay
theme
audioEnabled
transliterationVisible
```

Do not add preferences unless they serve a real UX need.

------------------------------------------------------------------------

## 29. Error Handling

Failures must never silently destroy learning progress.

Handle:

-   IndexedDB unavailable
-   failed writes
-   corrupt records
-   invalid backup files
-   unsupported backup versions
-   missing content
-   unavailable audio
-   unexpected FSRS errors

User-facing errors should be calm and actionable.

Never expose stack traces in production.

------------------------------------------------------------------------

## 30. Privacy

V1 should collect essentially no personal information.

No login.

No advertising trackers.

No selling data.

Avoid unnecessary analytics.

If analytics are introduced later, collect only what is necessary to
understand product quality.

The goal is learning effectiveness, not maximizing screen time.

------------------------------------------------------------------------

## 31. Testing Strategy

### Unit tests

Test:

-   FSRS adapter
-   review rating mapping
-   due-card calculation
-   learning-session selection
-   daily new-name limits
-   progress calculation
-   IndexedDB repository
-   backup serialization
-   backup validation
-   backup restoration
-   content schema validation

### Component tests

Test:

-   learning card
-   review card
-   reveal behavior
-   rating controls
-   progress indicator
-   navigation
-   empty states
-   backup/import controls

### E2E

Critical workflow:

``` text
New user
→ opens application
→ starts learning
→ learns Names
→ completes review
→ reloads application
→ progress remains
→ exports backup
→ clears test data
→ imports backup
→ progress is restored
```

Also test all four review ratings.

------------------------------------------------------------------------

## 32. Content Validation

Religious content must be schema-validated.

Build/test should catch:

-   duplicate IDs
-   duplicate order numbers
-   missing Arabic
-   missing transliteration
-   missing meaning
-   invalid verification status
-   malformed source references

Do not silently publish malformed content.

------------------------------------------------------------------------

## 33. Performance Targets

Aim for:

-   Lighthouse Performance \> 90
-   Accessibility \> 95
-   Best Practices \> 95
-   SEO \> 90

Prefer server components where appropriate.

Avoid unnecessary client-side JavaScript.

Lazy-load non-critical functionality.

Do not add a global state library unless the complexity genuinely
requires it.

------------------------------------------------------------------------

## 34. SEO

Eventually provide indexable public pages such as:

``` text
/names/ar-rahman
/names/ar-rahim
```

Pages can contain:

-   Arabic
-   transliteration
-   meaning
-   verified explanation
-   references

Educational discovery through search should complement the learning
product.

------------------------------------------------------------------------

## 35. V1 Implementation Phases

### Phase 0 --- Repository Foundation

-   Create Next.js TypeScript project.
-   Configure linting and formatting.
-   Configure testing.
-   Establish folder boundaries.
-   Add `PLAN.md`.
-   Add `README.md`.
-   Verify production build.
-   Commit.

**Done when:** clean application builds and tests run.

------------------------------------------------------------------------

### Phase 1 --- Design System

Implement:

-   theme tokens
-   light/dark mode
-   Arabic typography
-   English typography
-   spacing
-   buttons
-   cards
-   inputs
-   navigation
-   layout primitives
-   accessibility states
-   responsive breakpoints

No FSRS/business logic yet.

Test on target mobile widths.

**Done when:** reusable UI foundation is visually polished and
responsive.

------------------------------------------------------------------------

### Phase 2 --- Static UX

Implement polished versions of:

-   Home
-   Learn
-   Review
-   Explore
-   Name Detail
-   Progress
-   Settings
-   Sources

Use clearly marked development/sample data.

Do not wire persistence or FSRS yet.

**Done when:** the complete primary user journey can be clicked through.

------------------------------------------------------------------------

### Phase 3 --- Content Layer

-   Define content schemas.
-   Build content loader.
-   Build validation.
-   Add source model.
-   Replace development records only with approved/verified content.
-   Ensure components never contain religious content directly.

**Done when:** content is structured, validated, and independent of UI.

------------------------------------------------------------------------

### Phase 4 --- Local Persistence

Implement IndexedDB storage behind `ProgressRepository`.

Persist:

-   preferences
-   card state
-   review history
-   daily progress

Test browser refresh/restart behavior.

**Done when:** state reliably survives reloads.

------------------------------------------------------------------------

### Phase 5 --- Learning Engine

Implement:

-   new Name selection
-   configurable daily limits
-   learning sessions
-   card generation
-   session completion
-   due-review queue

Keep learning logic independent of UI.

**Done when:** users can progress through new material
deterministically.

------------------------------------------------------------------------

### Phase 6 --- FSRS

-   Choose a maintained compatible FSRS implementation.
-   Wrap it with the application's scheduler interface.
-   Implement Again/Hard/Good/Easy.
-   Persist FSRS state.
-   Persist append-only review events.
-   Add unit tests.

Do not proceed with broken scheduling tests.

**Done when:** review timing adapts based on recall ratings.

------------------------------------------------------------------------

### Phase 7 --- Backup / Restore

Implement:

-   Export Progress
-   Import Progress
-   schema version
-   validation
-   confirmation before replacement/merge
-   safe failure handling
-   E2E restoration test

**Done when:** a user can move their V1 progress manually between
devices using a backup file.

------------------------------------------------------------------------

### Phase 8 --- PWA / Offline

Implement:

-   manifest
-   production icons
-   installability
-   standalone behavior
-   basic offline shell
-   offline bundled content
-   safe-area handling

Test installed mode on modern mobile browsers.

**Done when:** the website can be installed and the core experience
remains useful offline.

------------------------------------------------------------------------

### Phase 9 --- UX Polish

Add:

-   subtle transitions
-   loading states
-   empty states
-   failure states
-   accessibility refinements
-   reduced-motion behavior
-   responsive refinements

Run Lighthouse and fix significant findings.

**Done when:** the product feels intentionally designed rather than
generated.

------------------------------------------------------------------------

### Phase 10 --- Religious Content Verification

Before public launch, review all production content.

Verify:

-   Arabic spelling
-   ordering/list
-   transliteration
-   translation
-   explanation
-   sources
-   pronunciation/audio
-   attribution

Record a content version.

**Do not publicly launch AI-generated unverified theological content.**

------------------------------------------------------------------------

### Phase 11 --- Production Launch

-   Deploy production build.
-   Configure custom domain when available.
-   HTTPS.
-   metadata.
-   Open Graph.
-   favicon/PWA icons.
-   privacy information.
-   Sources page.
-   error monitoring if appropriate.
-   run production smoke tests.

**Done when:** a new user can successfully complete the core workflow
from the public URL.

------------------------------------------------------------------------

## 36. V2 --- Optional Cloud Sync

Only begin after V1 is stable.

Potential implementation:

-   Supabase
-   PostgreSQL
-   Supabase Auth
-   Row Level Security
-   cloud progress repository
-   local/cloud synchronization
-   anonymous-to-account migration
-   multi-device sync
-   account deletion/export

Local-first behavior should remain.

Cloud should enhance the product rather than become a requirement for
learning.

------------------------------------------------------------------------

## 37. Explicitly Out of Scope for V1

Do not implement:

-   Supabase
-   PostgreSQL
-   authentication
-   social login
-   cloud synchronization
-   native Android application
-   native iOS application
-   subscriptions
-   payments
-   leaderboards
-   public profiles
-   social feeds
-   chat
-   AI religious advisor
-   multiplayer
-   complicated achievements
-   manipulative streak mechanics
-   push notifications unless deliberately approved later

Do not allow coding agents to expand scope casually.

------------------------------------------------------------------------

## 38. Definition of Done --- V1

V1 is complete only when:

-   A first-time user can open the site on a phone.
-   No account is required.
-   They can immediately begin learning.
-   They can learn Names in small sessions.
-   Arabic renders correctly.
-   Transliteration and meaning are clear.
-   They attempt active recall.
-   They can choose Again, Hard, Good, or Easy.
-   FSRS schedules subsequent reviews.
-   Difficult material returns more appropriately.
-   Progress survives page reload and browser restart.
-   All 99 Names can be explored.
-   Progress metrics are understandable.
-   Export Backup works.
-   Import Backup safely restores progress.
-   Light and dark themes work.
-   Mobile UX is polished.
-   Desktop UX is functional and polished.
-   The application is installable as a PWA.
-   Core bundled content remains usable offline where practical.
-   Religious content is separated from application code.
-   Production religious content is sourced and reviewed.
-   Critical automated tests pass.
-   Production build succeeds.
-   There are no critical console/runtime errors.

------------------------------------------------------------------------

## 39. Instructions for Codex / Claude Code

This document is the implementation contract.

Before making changes:

1.  Read `PLAN.md` completely.
2.  Read `README.md`.
3.  Inspect the repository.
4.  Identify the current implementation phase.
5.  Preserve working completed functionality.
6.  Do not redesign architecture without a concrete reason.

For each phase:

1.  Briefly state the implementation approach.
2.  Implement only that phase's scope.
3.  Run formatting/linting.
4.  Run type checking.
5.  Run relevant unit tests.
6.  Run relevant E2E tests when applicable.
7.  Fix failures.
8.  Check responsive behavior.
9.  Check accessibility basics.
10. Update implementation progress/documentation.
11. Keep changes logically isolated.

Coding agents must NOT:

-   skip architectural boundaries
-   hard-code religious content into UI
-   invent Quran/Hadith citations
-   invent theological explanations
-   silently alter verified content
-   add Supabase to V1
-   add authentication to V1
-   introduce unnecessary dependencies
-   put FSRS calculations in components
-   access IndexedDB directly throughout the UI
-   remove review history in favor of latest-state-only storage
-   mark a phase complete with failing tests
-   add speculative features without approval
-   optimize for desktop at the expense of mobile
-   perform broad rewrites merely for stylistic preference

When a choice is ambiguous, prefer:

1.  correctness
2.  simplicity
3.  maintainability
4.  accessibility
5.  performance

in that order, while respecting this plan.

------------------------------------------------------------------------

## 40. Recommended Agent Starting Prompt

When starting implementation, provide the coding agent with:

> Read PLAN.md completely before writing code. Treat it as the product
> and architecture contract. Inspect the current repository and
> determine the current phase. Implement the plan sequentially,
> beginning with the earliest incomplete phase. Do not add Supabase,
> PostgreSQL, authentication, or cloud sync in V1. V1 is local-first
> using IndexedDB behind the ProgressRepository abstraction, with FSRS
> behind the ReviewScheduler abstraction. Export/import backup is
> required. Never fabricate religious content or sources. Run lint, type
> checking, tests, and the production build as appropriate after each
> phase. Fix failures before proceeding. Keep the mobile-first UX
> polished, accessible, and consistent with PLAN.md.

------------------------------------------------------------------------

## 41. Product North Star

The product succeeds when a learner can truthfully say:

> **"I didn't just read the Names. I actually remember what they
> mean."**

Every product, design, and engineering decision should support that
outcome.
