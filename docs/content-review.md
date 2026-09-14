# Religious content review

Know His Names must not be launched publicly with unverified religious
content (PLAN.md §6, §35 Phase 10). This guide is for the qualified reviewer
who verifies the content before launch, and for maintainers who change it
afterwards.

## Where the content lives

| File                           | Contains                                                                  |
| ------------------------------ | ------------------------------------------------------------------------- |
| `content/names/names.json`     | Content version, and each Name: Arabic, transliteration, meaning, status  |
| `content/sources/sources.json` | Sources, and which one defines the list and its order                     |
| `lib/content/schema.ts`        | The rules every entry must follow (checked by `npm test` and every build) |

No religious text is written in the application code. Components only
display what these files contain.

## Current state

- Version `0.1.0-draft`. All 99 Names are marked `"verificationStatus": "pending"`.
- The list and its order follow Jāmiʿ at-Tirmidhī, Hadith 3507.
- Arabic spelling, transliterations and short English meanings were prepared
  during development and cross-checked against a secondary reference. They
  **have not** been reviewed by a qualified scholar.
- There are no explanations and no pronunciation audio yet. The app says so
  plainly wherever they would appear.

## What to verify for each Name

1. **Arabic**: spelling and full vocalisation (tashkīl).
2. **Order**: position in the enumeration being followed.
3. **Transliteration**: follows the scheme described on the Sources page.
4. **Meaning**: one short English rendering that is faithful and easy to recall.
5. **Explanation** (optional): a concise, sourced explanation. Leave it out
   rather than add anything unreviewed.
6. **Sources**: every `sourceIds` entry exists in `sources.json` and supports
   the entry.
7. **Pronunciation audio** (optional): a reviewed recording, stored locally
   as `public/audio/<id>.mp3` and referenced as `"audioUrl": "/audio/<id>.mp3"`.
8. **Attribution**: sources and any quoted translations are credited correctly.

## Recording the review

- Set `verificationStatus` to `"reviewed"` once an entry has been checked,
  and to `"verified"` once a second reviewer has confirmed it.
- Also update `verificationStatus` for each source in `sources.json`.
- Bump `version` in `names.json` for every content release (for example
  `1.0.0` for the first verified release). The version appears in Settings,
  on the Sources page and in every backup file.
- Never change a `verified` entry without another review.

## Checking your changes

```bash
npm test         # validates both content files, among other checks
npm run build    # the build fails if content is malformed
```

Validation catches duplicate ids or orders, gaps in the order, missing
Arabic, transliteration or meaning, invalid statuses, unknown sources, and
remote audio URLs. It cannot judge correctness. That is what the review is for.

## Ids are permanent

A Name's `id` (for example `ar-rahman`) is part of every learner's saved
progress and backup files. Don't rename an id once the app is public. Fix
the displayed fields instead.
