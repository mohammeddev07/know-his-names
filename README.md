# Know His Names

> Learn. Remember. Reflect.

A beautiful, open-source PWA for learning and remembering the 99 Names of Allah using active recall and spaced repetition (FSRS).

Know His Names is a local-first learning companion. There is no account and no server-side database: learning progress lives in the browser's IndexedDB, reviews are scheduled with FSRS, and progress can be exported to a backup file and imported on another device.

`PLAN.md` is the product and architecture contract. Read it before changing anything.

## Getting started

Requires Node.js 22 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Command             | What it does                                 |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Development server                           |
| `npm run build`     | Production build (fails on invalid content)  |
| `npm start`         | Serve the production build                   |
| `npm run lint`      | ESLint                                       |
| `npm run typecheck` | TypeScript, no emit                          |
| `npm run format`    | Prettier (write)                             |
| `npm test`          | Unit and component tests (Vitest)            |
| `npm run test:e2e`  | End-to-end tests (Playwright, needs a build) |
| `npm run check`     | Lint, typecheck, formatting and unit tests   |

## Implementation progress

- [x] Phase 0 — Repository foundation
- [ ] Phase 1 — Design system
- [ ] Phase 2 — Static UX
- [ ] Phase 3 — Content layer
- [ ] Phase 4 — Local persistence
- [ ] Phase 5 — Learning engine
- [ ] Phase 6 — FSRS
- [ ] Phase 7 — Backup / restore
- [ ] Phase 8 — PWA / offline
- [ ] Phase 9 — UX polish
- [ ] Phase 10 — Religious content verification
- [ ] Phase 11 — Production launch

## License

Code is open source. Religious content is provided for learning and is subject to the review process described on the in-app Sources page.
