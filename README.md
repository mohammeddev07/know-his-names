# Know His Names

> Learn. Remember. Reflect.

A beautiful, open-source PWA for learning and remembering the 99 Names of Allah using active recall and spaced repetition (FSRS).

Know His Names is a local-first learning companion. There is no account and no server-side database. Learning progress lives in the browser's IndexedDB, reviews are scheduled with FSRS, and progress can be exported to a backup file and imported on another device. It installs as an app and keeps working offline.

`PLAN.md` is the product and architecture contract, and its top section tracks implementation progress. Read it before changing anything.

> **Content status:** the religious content is a **draft (`0.2.0-draft`) awaiting scholarly review**. It has been audited against primary sources, but every Name is still marked `pending`, several need a qualified reviewer's decision, and there are no explanations or audio yet. Don't launch publicly until the review in [docs/content-review.md](docs/content-review.md) is complete.

## Scholar review deployment

A temporary GitHub Pages build lets qualified reviewers open the app and use
the learning experience while reviewing the Phase 10 content above — it is
**not** the public launch. See [docs/deployment.md](docs/deployment.md#scholar-review-deployment-github-pages)
for how it's deployed, and report any correction through the project's
repository (see the in-app Sources page). The Vercel instructions in that
same document are unchanged and remain the plan for the eventual Phase 11
public launch, which happens only after reviewer corrections are applied and
Phase 10 is formally complete.

## What it does

- **Learn** a few new Names a day (1, 2, 3, 5 or 7; default 3). Each Name shows its Arabic, transliteration and meaning, then comes straight back for recall.
- **Review** with active recall: try to remember, reveal, then rate **Again, Hard, Good or Easy**. FSRS decides when each Name returns, so hard Names come back sooner and well-known ones later.
- **Explore** all 99 Names, with search by name, meaning, Arabic or number, and filters by learning status.
- **Progress**: a mosaic of the 99 Names, status counts, recent consistency (no streaks to lose) and upcoming reviews.
- **Backup**: export and import a versioned JSON file. Imports are validated, confirmed first, and can be undone.
- **PWA**: installable, with light and dark themes. It works offline after the first visit.

## Getting started

Requires Node.js 22 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

The service worker is only registered in production builds (`npm run build && npm start`).

## Scripts

| Command              | What it does                                             |
| -------------------- | -------------------------------------------------------- |
| `npm run dev`        | Development server                                       |
| `npm run build`      | Production build (fails on invalid content)              |
| `npm start`          | Serve the production build                               |
| `npm run lint`       | ESLint                                                   |
| `npm run typecheck`  | TypeScript, no emit                                      |
| `npm run format`     | Prettier (write)                                         |
| `npm test`           | Unit and component tests (Vitest)                        |
| `npm run test:e2e`   | End-to-end tests (Playwright; run `npm run build` first) |
| `npm run test:smoke` | E2E against a deployed site (`PLAYWRIGHT_BASE_URL=…`)    |
| `npm run check`      | Lint, typecheck, formatting and unit tests               |

## Documentation

- [docs/architecture.md](docs/architecture.md): module boundaries, data model and testing
- [docs/content-review.md](docs/content-review.md): how religious content is reviewed and versioned
- [docs/deployment.md](docs/deployment.md): environment variables, deploying (Vercel and the temporary GitHub Pages scholar review build) and smoke tests

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · ts-fsrs · Zod · IndexedDB · Vitest · Playwright

## Branches

`develop` is the default branch. Work happens on feature branches (V1 was built on `feat/v1`) that merge into `develop`.

## Implementation progress

- [x] Phase 0: Repository foundation
- [x] Phase 1: Design system
- [x] Phase 2: Static UX
- [x] Phase 3: Content layer
- [x] Phase 4: Local persistence
- [x] Phase 5: Learning engine
- [x] Phase 6: FSRS
- [x] Phase 7: Backup / restore
- [x] Phase 8: PWA / offline
- [x] Phase 9: UX polish
- [ ] Phase 10: Religious content verification (needs a qualified human reviewer)
- [ ] Phase 11: Production launch (ready to deploy; see docs/deployment.md)

## Privacy

No accounts, no analytics, no advertising, no tracking. Progress never leaves the device unless you export a backup.

## License

Code is open source. Religious content is provided for learning and is subject to the review process described on the in-app Sources page.
