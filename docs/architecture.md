# Architecture

Know His Names is a local-first modular monolith (PLAN.md §3–4). Everything
runs in the browser. There is no backend database, no account and no network
call for learning data.

```text
UI (app/, components/)
 │  reads and changes progress only through useProgress()
 ▼
ProgressProvider (components/providers/progress-provider.tsx)
 │
 ├── Learning engine (lib/learning/)   pure: sessions, limits, status, progress
 ├── ReviewScheduler (lib/srs/)        FSRS behind an app-owned interface
 └── ProgressRepository (lib/storage/) IndexedDB behind an app-owned interface
Content (content/, lib/content/)       validated JSON, never hard-coded in UI
```

## Modules

| Path            | Responsibility                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `content/`      | Names and sources as JSON. The only place religious content lives.                                                         |
| `lib/content/`  | Zod schema, build-time validation (`assertValidContent`), accessors, and search normalisation.                             |
| `lib/learning/` | Domain types, card factory, daily limits, session queues, status (`not-started`/`learning`/`reviewing`/`strong`), metrics. |
| `lib/srs/`      | `ReviewScheduler` contract, `fsrs-adapter.ts` (the only `ts-fsrs` import), and `FsrsReviewScheduler`.                      |
| `lib/storage/`  | `ProgressRepository` contract, IndexedDB implementation, record schemas, and backup files.                                 |
| `components/`   | UI: `ui/` primitives, `learning/` session screens, `progress/`, `navigation/`, `pwa/`, `settings/`.                        |
| `app/`          | Routes. `(main)` has the header and navigation. `(focus)` is distraction-free Learn and Review.                            |
| `public/sw.js`  | Hand-written service worker for the offline shell and saved Name pages.                                                    |

## Rules that keep the boundaries

- Components never import `ts-fsrs`, `indexedDB` or the content JSON
  schema. They use `useProgress()` and `lib/content/names.ts`.
- Scheduling is computed in `lib/srs`, never in components.
- Review events are append-only (`add`, never `put`) and are written in the
  same IndexedDB transaction as the card state they produce.
- Everything read from storage or a backup file is validated
  (`lib/storage/records.ts`). Bad records are skipped and never trusted.
- Card ids (`<nameId>:meaning`) and review event ids are stable, so V2 can
  attach local history to an account without migration.

## Data

| Store (IndexedDB `know-his-names`, v1) | Key   | Contents                                             |
| -------------------------------------- | ----- | ---------------------------------------------------- |
| `cards`                                | `id`  | `CardState`: Name, introduction time, FSRS schedule  |
| `reviews`                              | `id`  | `ReviewEvent`: rating, previous and resulting state  |
| `meta`                                 | `key` | Preferences, and the rollback copy kept by an import |

The theme choice is also mirrored in `localStorage` so it can be applied
before first paint.

## Adding cloud sync (V2)

Implement `ProgressRepository` for the cloud (for example
`SupabaseProgressRepository`), keep IndexedDB as the local source, and add a
sync layer between them. The learning engine, the scheduler and the UI don't
need to change.

## Testing

| Command            | Covers                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `npm test`         | Content validation, FSRS adapter, scheduler, repository, backup, learning logic, components |
| `npm run test:e2e` | Learn, review with all ratings, reload, export, clear, import, offline (needs a build)      |
