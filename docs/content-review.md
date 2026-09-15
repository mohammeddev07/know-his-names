# Religious content review

Know His Names must not be launched publicly with unverified religious
content (PLAN.md §6, Phase 10). This guide is for the qualified reviewer
who verifies the content before launch, and for maintainers who change it
afterwards.

## Current state

- Content version `0.2.0-draft`, last updated 2026-09-13.
- All 99 Names are still `"verificationStatus": "pending"`. The source audit
  below was prepared with AI assistance and checked mechanically against
  primary texts. It is **not** the qualified scholarly review that PLAN.md
  requires, so it does not change any status.
- Audit result: 72 passed without changes, 3 corrected, 25 need qualified review.
- There are no explanations and no pronunciation audio. None were written or
  generated. Add them only after review.

## Where the content lives

| File                           | Contains                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `content/names/names.json`     | Content version and date, and each Name: Arabic, transliteration, meaning, sources, status and `audit` record |
| `content/sources/sources.json` | Sources, and which one defines the list and its order                                                         |
| `lib/content/schema.ts`        | The rules every entry must follow (checked by `npm test` and every build)                                     |

No religious text is written in the application code. Components only
display what these files contain. The `audit` record is for reviewers and is
not shown in the app.

## Audit of 2026-09-13

### Method

- **Arabic and order.** Each entry was compared by script with the Arabic
  text of Jāmiʿ at-Tirmidhī 3507 on sunnah.com, and with the numbered list in
  al-Khaṭṭābī's _Shaʾn al-Duʿāʾ_. Vowel marks were compared as well as
  letters.
- **Qur'an.** Every Qur'anic reference in `audit.evidence` was checked by
  script against the Tanzil Uthmani text: the quoted word must occur in that
  verse. Whether each Name is applied to Allah in the Qur'an was checked by
  searching the whole text and then reading each candidate verse in context.
- **Hadith.** Every hadith cited was read on sunnah.com, with the grading
  shown there. The quoted word was checked by script against the Arabic.
- **Meanings.** Compared with al-Khaṭṭābī's explanation of each Name and,
  where the English needs care, with the tafsīr of al-Ṭabarī, Ibn Kathīr and
  al-Saʿdī.
- **Transliteration.** Checked against the scheme on the Sources page. No
  errors were found.
- **Not used.** Wikipedia, blogs and unsourced lists. The Wikipedia
  cross-check source was removed from `sources.json`.

`audit.result` is one of:

- `passed`: Arabic, order, transliteration and meaning agree with the
  sources, and the Name is attested in the Qur'an or an authentic hadith.
- `corrected`: a field was changed. `audit.corrections` records the old and
  new value.
- `needs-review`: an open question that a qualified reviewer must settle
  (inclusion in the list, the enumeration, or a sensitive translation). The
  entry may also have been corrected.

### Findings about the list itself

1. **The number is authentic; the list is not.** Ṣaḥīḥ al-Bukhārī 6410 and
   Ṣaḥīḥ Muslim 2677 state that Allah has ninety-nine Names but do not list
   them. The list appears only in Tirmidhī 3507 (through al-Walīd ibn
   Muslim) and Ibn Mājah 3861 (through Zuhayr ibn Muḥammad), and the two
   differ in more than twenty Names. At-Tirmidhī calls his narration
   _gharīb_. Sunnah.com shows both as daʿīf (Darussalam).
2. **Scholarly assessment.** Ibn Ḥajar (_Fatḥ al-Bārī_ 11:219–221) reports
   that scholars differ on whether the list is the Prophet's words or was
   inserted by a narrator (_mudraj_). He quotes al-Bayhaqī that the list may
   have come from narrators, and says al-Walīd's route, the one this app
   follows, is the closest to authenticity and the one most commentators
   relied on. Ibn Taymiyya states that no authentic hadith specifies the
   ninety-nine, and that hadith masters regard the list as al-Walīd's
   compilation from his teachers. That statement is quoted in Islamweb fatwa
   222880 and has not yet been checked against a printed edition of
   _Majmūʿ al-Fatāwā_.
3. **Consequence.** Following the Tirmidhī list is a common and defensible
   choice. But the app must not present the list as the Prophet's own words,
   and some Names in it are not attested elsewhere. Those are marked
   `needs-review`, not silently kept or removed.
4. **The al-Aḥad question.** The sunnah.com text of Tirmidhī 3507 has
   ninety-eight Names after “Allah” and no al-Aḥad. The app's ninety-nine
   include al-Aḥad at no. 67. This matches al-Khaṭṭābī's text of the same
   list: he counts “Allah” as no. 1, and his nos. 2–100 match the app's
   1–99 in order. Al-Aḥad itself is firmly established (Qur'an 112:1;
   Tirmidhī 3475). The reviewer should confirm the edition and make the
   Sources page wording match it.

### Summary

**Passed without changes:** 72 Names. 1. Ar-Raḥmān, 2. Ar-Raḥīm, 3. Al-Malik, 4. Al-Quddūs, 5. As-Salām, 6. Al-Muʾmin, 7. Al-Muhaymin, 8. Al-ʿAzīz, 10. Al-Mutakabbir, 11. Al-Khāliq, 12. Al-Bāriʾ, 13. Al-Muṣawwir, 14. Al-Ghaffār, 15. Al-Qahhār, 16. Al-Wahhāb, 17. Ar-Razzāq, 18. Al-Fattāḥ, 19. Al-ʿAlīm, 20. Al-Qābiḍ, 21. Al-Bāsiṭ, 26. As-Samīʿ, 27. Al-Baṣīr, 28. Al-Ḥakam, 30. Al-Laṭīf, 31. Al-Khabīr, 32. Al-Ḥalīm, 33. Al-ʿAẓīm, 34. Al-Ghafūr, 35. Ash-Shakūr, 36. Al-ʿAliyy, 37. Al-Kabīr, 38. Al-Ḥafīẓ, 39. Al-Muqīt, 40. Al-Ḥasīb, 42. Al-Karīm, 43. Ar-Raqīb, 44. Al-Mujīb, 45. Al-Wāsiʿ, 46. Al-Ḥakīm, 47. Al-Wadūd, 48. Al-Majīd, 50. Ash-Shahīd, 51. Al-Ḥaqq, 52. Al-Wakīl, 53. Al-Qawiyy, 54. Al-Matīn, 55. Al-Waliyy, 56. Al-Ḥamīd, 60. Al-Muḥyī, 62. Al-Ḥayy, 63. Al-Qayyūm, 66. Al-Wāḥid, 68. Aṣ-Ṣamad, 69. Al-Qādir, 71. Al-Muqaddim, 72. Al-Muʾakhkhir, 73. Al-Awwal, 74. Al-Ākhir, 75. Aẓ-Ẓāhir, 76. Al-Bāṭin, 78. Al-Mutaʿālī, 79. Al-Barr, 80. At-Tawwāb, 82. Al-ʿAfuww, 83. Ar-Raʾūf, 84. Mālik al-Mulk, 87. Al-Jāmiʿ, 88. Al-Ghaniyy, 93. An-Nūr, 94. Al-Hādī, 95. Al-Badīʿ, 97. Al-Wārith.

**Corrected:**

| Name                      | Field        | Change                                                     |
| ------------------------- | ------------ | ---------------------------------------------------------- |
| 64. Al-Wājid              | shortMeaning | The Perceiver → The One Who Lacks Nothing                  |
| 70. Al-Muqtadir           | shortMeaning | The Determiner → The Perfect in Power                      |
| 85. Dhul-Jalāli wal-Ikrām | shortMeaning | Lord of Majesty and Honor → Possessor of Majesty and Honor |

**Needs qualified review:** 25 Names. 9. Al-Jabbār, 22. Al-Khāfiḍ, 23. Ar-Rāfiʿ, 24. Al-Muʿizz, 25. Al-Mudhill, 29. Al-ʿAdl, 41. Al-Jalīl, 49. Al-Bāʿith, 57. Al-Muḥṣī, 58. Al-Mubdiʾ, 59. Al-Muʿīd, 61. Al-Mumīt, 64. Al-Wājid, 65. Al-Mājid, 67. Al-Aḥad, 77. Al-Wālī, 81. Al-Muntaqim, 86. Al-Muqsiṭ, 89. Al-Mughnī, 90. Al-Māniʿ, 91. Aḍ-Ḍārr, 92. An-Nāfiʿ, 96. Al-Bāqī, 98. Ar-Rashīd, 99. Aṣ-Ṣabūr.

### Open issues for the reviewer

1. **Enumeration.** Confirm the edition that includes al-Aḥad (above), and
   decide whether the Sources page should say the list is a narrator's
   compilation.
2. **Names attested only in the list.** These are not applied to Allah as a
   Name in the Qur'an, and this audit found no authentic hadith that names
   them: 22. Al-Khāfiḍ, 23. Ar-Rāfiʿ, 24. Al-Muʿizz, 25. Al-Mudhill, 29. Al-ʿAdl, 41. Al-Jalīl, 49. Al-Bāʿith, 57. Al-Muḥṣī, 58. Al-Mubdiʾ, 59. Al-Muʿīd, 61. Al-Mumīt, 64. Al-Wājid, 65. Al-Mājid, 77. Al-Wālī, 81. Al-Muntaqim, 86. Al-Muqsiṭ, 89. Al-Mughnī, 90. Al-Māniʿ, 91. Aḍ-Ḍārr, 92. An-Nāfiʿ, 96. Al-Bāqī, 98. Ar-Rashīd, 99. Aṣ-Ṣabūr. Most describe acts or attributes that the Qur'an does
   affirm. Decide whether to keep them with a note, or follow a list drawn
   from the Qur'an and authentic Sunnah.
3. **Paired Names.** Aḍ-Ḍārr and An-Nāfiʿ, Al-Muʿizz and Al-Mudhill,
   Al-Khāfiḍ and Ar-Rāfiʿ, Al-Mubdiʾ and Al-Muʿīd, Al-Muḥyī and Al-Mumīt,
   Al-Qābiḍ and Al-Bāsiṭ, Al-Muqaddim and Al-Muʾakhkhir, Al-Muntaqim (with
   Al-ʿAfuww), and Al-Māniʿ (whose counterpart, al-Muʿṭī, is not in this
   list). Ibn al-Qayyim says several of these must not be mentioned alone.
   The app currently shows each Name alone on its own card. This is a
   content and product decision.
4. **Sensitive translations.** Al-Jabbār (“The Compeller”), Al-Muntaqim
   (“The Avenger”), Aḍ-Ḍārr (“The Distresser”), Al-Mudhill (“The Giver of
   Dishonor”) and Al-Wālī (“The Patron”). Each has a note below with the
   classical meaning. None was changed, because the choice is interpretive.
5. **Smaller items.** The spelling of Ar-Raʾūf (modern الرَّؤُوف or
   Qur'anic رَءُوف), and a printed-edition reference for Ibn Taymiyya's
   statement.
6. **Explanations and audio.** Still absent. Nothing was generated.

### Per-Name results

| #   | Name                  | Arabic                        | Meaning                        | Result                       | Evidence                                                                                                                                                                                   |
| --- | --------------------- | ----------------------------- | ------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Ar-Raḥmān             | الرَّحْمَٰنُ                  | The Most Compassionate         | Passed                       | Qur'an 59:22 (ٱلرَّحْمَٰنُ); Qur'an 1:3 (ٱلرَّحْمَٰنِ)                                                                                                                                     |
| 2   | Ar-Raḥīm              | الرَّحِيمُ                    | The Most Merciful              | Passed                       | Qur'an 59:22 (ٱلرَّحِيمُ); Qur'an 1:3 (ٱلرَّحِيمِ)                                                                                                                                         |
| 3   | Al-Malik              | الْمَلِكُ                     | The King                       | Passed                       | Qur'an 59:23 (ٱلْمَلِكُ); Qur'an 20:114 (ٱلْمَلِكُ)                                                                                                                                        |
| 4   | Al-Quddūs             | الْقُدُّوسُ                   | The Most Holy                  | Passed                       | Qur'an 59:23 (ٱلْقُدُّوسُ); Qur'an 62:1 (ٱلْقُدُّوسِ)                                                                                                                                      |
| 5   | As-Salām              | السَّلَامُ                    | The Source of Peace            | Passed                       | Qur'an 59:23 (ٱلسَّلَٰمُ)                                                                                                                                                                  |
| 6   | Al-Muʾmin             | الْمُؤْمِنُ                   | The Granter of Security        | Passed                       | Qur'an 59:23 (ٱلْمُؤْمِنُ)                                                                                                                                                                 |
| 7   | Al-Muhaymin           | الْمُهَيْمِنُ                 | The Guardian Over All          | Passed                       | Qur'an 59:23 (ٱلْمُهَيْمِنُ)                                                                                                                                                               |
| 8   | Al-ʿAzīz              | الْعَزِيزُ                    | The Almighty                   | Passed                       | Qur'an 59:23 (ٱلْعَزِيزُ)                                                                                                                                                                  |
| 9   | Al-Jabbār             | الْجَبَّارُ                   | The Compeller                  | **Needs review**             | Qur'an 59:23 (ٱلْجَبَّارُ)                                                                                                                                                                 |
| 10  | Al-Mutakabbir         | الْمُتَكَبِّرُ                | The Supreme in Greatness       | Passed                       | Qur'an 59:23 (ٱلْمُتَكَبِّرُ)                                                                                                                                                              |
| 11  | Al-Khāliq             | الْخَالِقُ                    | The Creator                    | Passed                       | Qur'an 59:24 (ٱلْخَٰلِقُ); Qur'an 13:16 (خَٰلِقُ)                                                                                                                                          |
| 12  | Al-Bāriʾ              | الْبَارِئُ                    | The Maker                      | Passed                       | Qur'an 59:24 (ٱلْبَارِئُ)                                                                                                                                                                  |
| 13  | Al-Muṣawwir           | الْمُصَوِّرُ                  | The Fashioner                  | Passed                       | Qur'an 59:24 (ٱلْمُصَوِّرُ)                                                                                                                                                                |
| 14  | Al-Ghaffār            | الْغَفَّارُ                   | The Repeatedly Forgiving       | Passed                       | Qur'an 38:66 (ٱلْغَفَّٰرُ); Qur'an 39:5 (ٱلْغَفَّٰرُ)                                                                                                                                      |
| 15  | Al-Qahhār             | الْقَهَّارُ                   | The Subduer                    | Passed                       | Qur'an 13:16 (ٱلْقَهَّٰرُ); Qur'an 40:16 (ٱلْقَهَّارِ)                                                                                                                                     |
| 16  | Al-Wahhāb             | الْوَهَّابُ                   | The Bestower                   | Passed                       | Qur'an 3:8 (ٱلْوَهَّابُ); Qur'an 38:35 (ٱلْوَهَّابُ)                                                                                                                                       |
| 17  | Ar-Razzāq             | الرَّزَّاقُ                   | The Provider                   | Passed                       | Qur'an 51:58 (ٱلرَّزَّاقُ); Jāmiʿ at-Tirmidhī 1314 (الرَّزَّاقُ)                                                                                                                           |
| 18  | Al-Fattāḥ             | الْفَتَّاحُ                   | The Opener                     | Passed                       | Qur'an 34:26 (ٱلْفَتَّاحُ)                                                                                                                                                                 |
| 19  | Al-ʿAlīm              | الْعَلِيمُ                    | The All-Knowing                | Passed                       | Qur'an 2:32 (ٱلْعَلِيمُ)                                                                                                                                                                   |
| 20  | Al-Qābiḍ              | الْقَابِضُ                    | The Withholder                 | Passed                       | Jāmiʿ at-Tirmidhī 1314 (الْقَابِضُ); Qur'an 2:245 (يَقْبِضُ), verb only                                                                                                                    |
| 21  | Al-Bāsiṭ              | الْبَاسِطُ                    | The Extender                   | Passed                       | Jāmiʿ at-Tirmidhī 1314 (الْبَاسِطُ); Qur'an 2:245 (وَيَبْصُۜطُ), verb only                                                                                                                 |
| 22  | Al-Khāfiḍ             | الْخَافِضُ                    | The Abaser                     | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 56:3 (خَافِضَةٌ), describes the Hour, not Allah                                                   |
| 23  | Ar-Rāfiʿ              | الرَّافِعُ                    | The Exalter                    | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 3:55 (وَرَافِعُكَ), said of raising ʿĪsā; Qur'an 40:15 (رَفِيعُ), a different word                |
| 24  | Al-Muʿizz             | الْمُعِزُّ                    | The Giver of Honor             | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 3:26 (وَتُعِزُّ), verb only                                                                       |
| 25  | Al-Mudhill            | الْمُذِلُّ                    | The Giver of Dishonor          | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 3:26 (وَتُذِلُّ), verb only                                                                       |
| 26  | As-Samīʿ              | السَّمِيعُ                    | The All-Hearing                | Passed                       | Qur'an 42:11 (ٱلسَّمِيعُ); Qur'an 2:127 (ٱلسَّمِيعُ)                                                                                                                                       |
| 27  | Al-Baṣīr              | الْبَصِيرُ                    | The All-Seeing                 | Passed                       | Qur'an 42:11 (ٱلْبَصِيرُ); Qur'an 17:1 (ٱلْبَصِيرُ)                                                                                                                                        |
| 28  | Al-Ḥakam              | الْحَكَمُ                     | The Judge                      | Passed                       | Sunan Abī Dāwūd 4955 (هُوَ الْحَكَمُ); Qur'an 6:114 (حَكَمًا)                                                                                                                              |
| 29  | Al-ʿAdl               | الْعَدْلُ                     | The Just                       | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an)                                                                                                           |
| 30  | Al-Laṭīf              | اللَّطِيفُ                    | The Subtly Kind                | Passed                       | Qur'an 6:103 (ٱللَّطِيفُ); Qur'an 67:14 (ٱللَّطِيفُ)                                                                                                                                       |
| 31  | Al-Khabīr             | الْخَبِيرُ                    | The All-Aware                  | Passed                       | Qur'an 6:18 (ٱلْخَبِيرُ); Qur'an 67:14 (ٱلْخَبِيرُ)                                                                                                                                        |
| 32  | Al-Ḥalīm              | الْحَلِيمُ                    | The Forbearing                 | Passed                       | Qur'an 2:225 (حَلِيمٌ); Qur'an 64:17 (حَلِيمٌ)                                                                                                                                             |
| 33  | Al-ʿAẓīm              | الْعَظِيمُ                    | The Magnificent                | Passed                       | Qur'an 2:255 (ٱلْعَظِيمُ)                                                                                                                                                                  |
| 34  | Al-Ghafūr             | الْغَفُورُ                    | The Ever-Forgiving             | Passed                       | Qur'an 10:107 (ٱلْغَفُورُ); Qur'an 85:14 (ٱلْغَفُورُ)                                                                                                                                      |
| 35  | Ash-Shakūr            | الشَّكُورُ                    | The Most Appreciative          | Passed                       | Qur'an 35:30 (شَكُورٌ); Qur'an 64:17 (شَكُورٌ)                                                                                                                                             |
| 36  | Al-ʿAliyy             | الْعَلِيُّ                    | The Most High                  | Passed                       | Qur'an 2:255 (ٱلْعَلِىُّ); Qur'an 22:62 (ٱلْعَلِىُّ)                                                                                                                                       |
| 37  | Al-Kabīr              | الْكَبِيرُ                    | The Most Great                 | Passed                       | Qur'an 13:9 (ٱلْكَبِيرُ); Qur'an 22:62 (ٱلْكَبِيرُ)                                                                                                                                        |
| 38  | Al-Ḥafīẓ              | الْحَفِيظُ                    | The Preserver                  | Passed                       | Qur'an 11:57 (حَفِيظٌ); Qur'an 34:21 (حَفِيظٌ)                                                                                                                                             |
| 39  | Al-Muqīt              | الْمُقِيتُ                    | The Nourisher                  | Passed                       | Qur'an 4:85 (مُّقِيتًا)                                                                                                                                                                    |
| 40  | Al-Ḥasīb              | الْحَسِيبُ                    | The Reckoner                   | Passed                       | Qur'an 4:6 (حَسِيبًا); Qur'an 33:39 (حَسِيبًا)                                                                                                                                             |
| 41  | Al-Jalīl              | الْجَلِيلُ                    | The Majestic                   | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 55:27 (ذُو ٱلْجَلَٰلِ), majesty as an attribute                                                   |
| 42  | Al-Karīm              | الْكَرِيمُ                    | The Most Generous              | Passed                       | Qur'an 82:6 (ٱلْكَرِيمِ); Qur'an 27:40 (كَرِيمٌ)                                                                                                                                           |
| 43  | Ar-Raqīb              | الرَّقِيبُ                    | The Watchful                   | Passed                       | Qur'an 5:117 (ٱلرَّقِيبَ); Qur'an 4:1 (رَقِيبًا)                                                                                                                                           |
| 44  | Al-Mujīb              | الْمُجِيبُ                    | The Responsive                 | Passed                       | Qur'an 11:61 (مُّجِيبٌ)                                                                                                                                                                    |
| 45  | Al-Wāsiʿ              | الْوَاسِعُ                    | The All-Encompassing           | Passed                       | Qur'an 2:115 (وَٰسِعٌ); Qur'an 2:268 (وَٰسِعٌ)                                                                                                                                             |
| 46  | Al-Ḥakīm              | الْحَكِيمُ                    | The All-Wise                   | Passed                       | Qur'an 59:24 (ٱلْحَكِيمُ); Qur'an 2:32 (ٱلْحَكِيمُ)                                                                                                                                        |
| 47  | Al-Wadūd              | الْوَدُودُ                    | The Loving                     | Passed                       | Qur'an 85:14 (ٱلْوَدُودُ); Qur'an 11:90 (وَدُودٌ)                                                                                                                                          |
| 48  | Al-Majīd              | الْمَجِيدُ                    | The All-Glorious               | Passed                       | Qur'an 11:73 (مَّجِيدٌ)                                                                                                                                                                    |
| 49  | Al-Bāʿith             | الْبَاعِثُ                    | The Resurrector                | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 22:7 (يَبْعَثُ), verb only                                                                        |
| 50  | Ash-Shahīd            | الشَّهِيدُ                    | The Witness                    | Passed                       | Qur'an 5:117 (شَهِيدٌ); Qur'an 22:17 (شَهِيدٌ)                                                                                                                                             |
| 51  | Al-Ḥaqq               | الْحَقُّ                      | The Truth                      | Passed                       | Qur'an 22:6 (ٱلْحَقُّ); Qur'an 24:25 (ٱلْحَقُّ)                                                                                                                                            |
| 52  | Al-Wakīl              | الْوَكِيلُ                    | The Trustee                    | Passed                       | Qur'an 3:173 (ٱلْوَكِيلُ); Qur'an 6:102 (وَكِيلٌ)                                                                                                                                          |
| 53  | Al-Qawiyy             | الْقَوِيُّ                    | The Strong                     | Passed                       | Qur'an 42:19 (ٱلْقَوِىُّ); Qur'an 11:66 (ٱلْقَوِىُّ)                                                                                                                                       |
| 54  | Al-Matīn              | الْمَتِينُ                    | The Firm                       | Passed                       | Qur'an 51:58 (ٱلْمَتِينُ)                                                                                                                                                                  |
| 55  | Al-Waliyy             | الْوَلِيُّ                    | The Protecting Friend          | Passed                       | Qur'an 42:9 (ٱلْوَلِىُّ); Qur'an 42:28 (ٱلْوَلِىُّ)                                                                                                                                        |
| 56  | Al-Ḥamīd              | الْحَمِيدُ                    | The Praiseworthy               | Passed                       | Qur'an 22:64 (ٱلْحَمِيدُ); Qur'an 35:15 (ٱلْحَمِيدُ)                                                                                                                                       |
| 57  | Al-Muḥṣī              | الْمُحْصِي                    | The Accounter of All           | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 72:28 (وَأَحْصَىٰ), verb only; Qur'an 19:94 (أَحْصَىٰهُمْ), verb only                             |
| 58  | Al-Mubdiʾ             | الْمُبْدِئُ                   | The Originator                 | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 85:13 (يُبْدِئُ), verb only                                                                       |
| 59  | Al-Muʿīd              | الْمُعِيدُ                    | The Restorer                   | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 85:13 (وَيُعِيدُ), verb only                                                                      |
| 60  | Al-Muḥyī              | الْمُحْيِي                    | The Giver of Life              | Passed                       | Qur'an 30:50 (لَمُحْىِ ٱلْمَوْتَىٰ), construct form; Qur'an 41:39 (لَمُحْىِ ٱلْمَوْتَىٰٓ), construct form                                                                                  |
| 61  | Al-Mumīt              | الْمُمِيتُ                    | The Bringer of Death           | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 57:2 (وَيُمِيتُ), verb only; Qur'an 15:23 (وَنُمِيتُ), verb only                                  |
| 62  | Al-Ḥayy               | الْحَيُّ                      | The Ever-Living                | Passed                       | Qur'an 2:255 (ٱلْحَىُّ); Qur'an 40:65 (ٱلْحَىُّ)                                                                                                                                           |
| 63  | Al-Qayyūm             | الْقَيُّومُ                   | The Self-Subsisting            | Passed                       | Qur'an 2:255 (ٱلْقَيُّومُ); Qur'an 3:2 (ٱلْقَيُّومُ)                                                                                                                                       |
| 64  | Al-Wājid              | الْوَاجِدُ                    | The One Who Lacks Nothing      | **Needs review** (corrected) | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an)                                                                                                           |
| 65  | Al-Mājid              | الْمَاجِدُ                    | The Illustrious                | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an)                                                                                                           |
| 66  | Al-Wāḥid              | الْوَاحِدُ                    | The Unique                     | Passed                       | Qur'an 13:16 (ٱلْوَٰحِدُ); Qur'an 14:48 (ٱلْوَٰحِدِ)                                                                                                                                       |
| 67  | Al-Aḥad               | الْأَحَدُ                     | The One                        | **Needs review**             | Qur'an 112:1 (أَحَدٌ); Jāmiʿ at-Tirmidhī 3475 (الأَحَدُ الصَّمَدُ)                                                                                                                         |
| 68  | Aṣ-Ṣamad              | الصَّمَدُ                     | The Eternal Refuge             | Passed                       | Qur'an 112:2 (ٱلصَّمَدُ); Jāmiʿ at-Tirmidhī 3475 (الصَّمَدُ)                                                                                                                               |
| 69  | Al-Qādir              | الْقَادِرُ                    | The All-Powerful               | Passed                       | Qur'an 6:65 (ٱلْقَادِرُ); Qur'an 36:81 (بِقَٰدِرٍ)                                                                                                                                         |
| 70  | Al-Muqtadir           | الْمُقْتَدِرُ                 | The Perfect in Power           | Corrected                    | Qur'an 54:42 (مُّقْتَدِرٍ); Qur'an 54:55 (مُّقْتَدِرٍۭ); Qur'an 18:45 (مُّقْتَدِرًا)                                                                                                       |
| 71  | Al-Muqaddim           | الْمُقَدِّمُ                  | The Expediter                  | Passed                       | Ṣaḥīḥ al-Bukhārī 1120 (الْمُقَدِّمُ)                                                                                                                                                       |
| 72  | Al-Muʾakhkhir         | الْمُؤَخِّرُ                  | The Delayer                    | Passed                       | Ṣaḥīḥ al-Bukhārī 1120 (الْمُؤَخِّرُ)                                                                                                                                                       |
| 73  | Al-Awwal              | الْأَوَّلُ                    | The First                      | Passed                       | Qur'an 57:3 (ٱلْأَوَّلُ)                                                                                                                                                                   |
| 74  | Al-Ākhir              | الْآخِرُ                      | The Last                       | Passed                       | Qur'an 57:3 (وَٱلْـَٔاخِرُ)                                                                                                                                                                |
| 75  | Aẓ-Ẓāhir              | الظَّاهِرُ                    | The Manifest                   | Passed                       | Qur'an 57:3 (وَٱلظَّٰهِرُ)                                                                                                                                                                 |
| 76  | Al-Bāṭin              | الْبَاطِنُ                    | The Hidden                     | Passed                       | Qur'an 57:3 (وَٱلْبَاطِنُ)                                                                                                                                                                 |
| 77  | Al-Wālī               | الْوَالِي                     | The Patron                     | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 13:11 (وَالٍ), “they have no protector besides Him”                                               |
| 78  | Al-Mutaʿālī           | الْمُتَعَالِي                 | The Supremely Exalted          | Passed                       | Qur'an 13:9 (ٱلْمُتَعَالِ)                                                                                                                                                                 |
| 79  | Al-Barr               | الْبَرُّ                      | The Beneficent                 | Passed                       | Qur'an 52:28 (ٱلْبَرُّ)                                                                                                                                                                    |
| 80  | At-Tawwāb             | التَّوَّابُ                   | The Acceptor of Repentance     | Passed                       | Qur'an 2:37 (ٱلتَّوَّابُ); Qur'an 9:118 (ٱلتَّوَّابُ)                                                                                                                                      |
| 81  | Al-Muntaqim           | الْمُنْتَقِمُ                 | The Avenger                    | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 3:4 (ذُو ٱنتِقَامٍ); Qur'an 32:22 (مُنتَقِمُونَ); Qur'an 43:55 (ٱنتَقَمْنَا), verb only           |
| 82  | Al-ʿAfuww             | الْعَفُوُّ                    | The Pardoner                   | Passed                       | Qur'an 4:43 (عَفُوًّا); Qur'an 22:60 (لَعَفُوٌّ)                                                                                                                                           |
| 83  | Ar-Raʾūf              | الرَّؤُوفُ                    | The Most Kind                  | Passed                       | Qur'an 2:143 (لَرَءُوفٌ); Qur'an 24:20 (رَءُوفٌ)                                                                                                                                           |
| 84  | Mālik al-Mulk         | مَالِكُ الْمُلْكِ             | The Owner of All Sovereignty   | Passed                       | Qur'an 3:26 (مَٰلِكَ ٱلْمُلْكِ)                                                                                                                                                            |
| 85  | Dhul-Jalāli wal-Ikrām | ذُو الْجَلَالِ وَالْإِكْرَامِ | Possessor of Majesty and Honor | Corrected                    | Qur'an 55:27 (ذُو ٱلْجَلَٰلِ وَٱلْإِكْرَامِ); Qur'an 55:78 (ذِى ٱلْجَلَٰلِ وَٱلْإِكْرَامِ)                                                                                                 |
| 86  | Al-Muqsiṭ             | الْمُقْسِطُ                   | The Equitable                  | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 3:18 (بِٱلْقِسْطِ), upholding justice; Qur'an 49:9 (ٱلْمُقْسِطِينَ), said of people               |
| 87  | Al-Jāmiʿ              | الْجَامِعُ                    | The Gatherer                   | Passed                       | Qur'an 3:9 (جَامِعُ ٱلنَّاسِ), construct form; Qur'an 4:140 (جَامِعُ), construct form                                                                                                      |
| 88  | Al-Ghaniyy            | الْغَنِيُّ                    | The Self-Sufficient            | Passed                       | Qur'an 35:15 (ٱلْغَنِىُّ); Qur'an 22:64 (ٱلْغَنِىُّ)                                                                                                                                       |
| 89  | Al-Mughnī             | الْمُغْنِي                    | The Enricher                   | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 9:28 (يُغْنِيكُمُ), verb only; Qur'an 53:48 (أَغْنَىٰ), verb only                                 |
| 90  | Al-Māniʿ              | الْمَانِعُ                    | The Preventer                  | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an)                                                                                                           |
| 91  | Aḍ-Ḍārr               | الضَّارُّ                     | The Distresser                 | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 48:11 (ضَرًّا), harm only by His will; Qur'an 6:17 (بِضُرٍّ); Jāmiʿ at-Tirmidhī 2516 (يَضُرُّوكَ) |
| 92  | An-Nāfiʿ              | النَّافِعُ                    | The Benefactor                 | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 48:11 (نَفْعًۢا); Jāmiʿ at-Tirmidhī 2516 (يَنْفَعُوكَ)                                            |
| 93  | An-Nūr                | النُّورُ                      | The Light                      | Passed                       | Qur'an 24:35 (نُورُ ٱلسَّمَٰوَٰتِ), construct form; Ṣaḥīḥ al-Bukhārī 1120 (نُورُ السَّمَوَاتِ)                                                                                             |
| 94  | Al-Hādī               | الْهَادِي                     | The Guide                      | Passed                       | Qur'an 22:54 (لَهَادِ); Qur'an 25:31 (هَادِيًا)                                                                                                                                            |
| 95  | Al-Badīʿ              | الْبَدِيعُ                    | The Incomparable Originator    | Passed                       | Qur'an 2:117 (بَدِيعُ), construct form; Qur'an 6:101 (بَدِيعُ), construct form                                                                                                             |
| 96  | Al-Bāqī               | الْبَاقِي                     | The Everlasting                | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 55:27 (وَيَبْقَىٰ), verb only                                                                     |
| 97  | Al-Wārith             | الْوَارِثُ                    | The Inheritor of All           | Passed                       | Qur'an 15:23 (ٱلْوَٰرِثُونَ); Qur'an 21:89 (خَيْرُ ٱلْوَٰرِثِينَ)                                                                                                                          |
| 98  | Ar-Rashīd             | الرَّشِيدُ                    | The Guide to the Right Path    | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Qur'an 11:87 (ٱلرَّشِيدُ), said of Shuʿayb, not Allah                                                    |
| 99  | Aṣ-Ṣabūr              | الصَّبُورُ                    | The Most Patient               | **Needs review**             | Jāmiʿ at-Tirmidhī 3507 (list only; not applied to Allah as a Name in the Qur'an); Ṣaḥīḥ al-Bukhārī 7378 (أَصْبَرُ), the attribute                                                          |

### Notes by Name

- **5. As-Salām** Al-Khaṭṭābī explains as-Salām as the One free from every defect, or the One whose creation is safe from any injustice from Him; al-Ṭabarī on 59:23 gives the second meaning. “The Source of Peace” is a common but interpretive rendering.
- **9. Al-Jabbār** Attested in 59:23. Classical explanations give several meanings: the One who compels His creation to what He wills (Qatāda, cited by al-Ṭabarī and Ibn Kathīr on 59:23); the One who sets right the affairs of His creation (al-Ṭabarī); the One who mends the broken and enriches the poor (al-Saʿdī); the One exalted beyond reach (al-Khaṭṭābī). In modern English “Compeller” can suggest coercion or tyranny and carries only the first meaning. Reviewer to decide whether to keep “The Compeller” or use a rendering that also carries the restoring sense.
- **10. Al-Mutakabbir** “The Supreme in Greatness” deliberately avoids “The Proud”. Al-Khaṭṭābī: the tāʾ marks that greatness belongs to Him alone, not affected pride, which is blameworthy only in creatures. Qatāda (in al-Ṭabarī): exalted above every evil.
- **18. Al-Fattāḥ** In 34:26 the Name follows “then He will judge between us in truth” (yaftaḥu baynanā bil-ḥaqq), so it also carries the meaning “the Judge”.
- **20. Al-Qābiḍ** Named with al-Bāsiṭ in an authentic hadith. Best mentioned as a pair.
- **21. Al-Bāsiṭ** Named with al-Qābiḍ in an authentic hadith. Best mentioned as a pair.
- **22. Al-Khāfiḍ** No verse or authentic hadith checked in this audit uses al-Khāfiḍ as a Name. Its place rests on the Tirmidhī list, which hadith scholars regard as a narrator's compilation (Ibn Ḥajar, Fatḥ al-Bārī 11:219). Al-Khaṭṭābī explains it together with ar-Rāfiʿ; if kept, present the two together.
- **23. Ar-Rāfiʿ** Same basis as al-Khāfiḍ. In 3:55 Allah tells ʿĪsā “I will raise you to Myself”, a participle tied to that event; 40:15 uses rafīʿ (Exalted in degrees), a different word. Ibn Ḥajar notes that Ibn Ḥibbān's version of the same chain has ar-Rāfiʿ where others have al-Māniʿ.
- **24. Al-Muʿizz** The Qur'an states the act (“You honour whom You will”) but does not use al-Muʿizz as a Name. Al-Khaṭṭābī explains al-Muʿizz and al-Mudhill together, like al-Qābiḍ and al-Bāsiṭ.
- **25. Al-Mudhill** Same basis as al-Muʿizz (“You humble whom You will”). “The Giver of Dishonor” is accurate but reads harshly on its own. Classical explanations present it only with al-Muʿizz, and the fuller quotation of Ibn al-Qayyim's rule (Islamweb fatwa 464491) lists al-Muʿizz al-Mudhill among paired Names. Reviewer to decide how the pair is presented.
- **29. Al-ʿAdl** Allah's perfect justice is not in question; the question is whether al-ʿAdl is a transmitted Name. No verse applies it to Allah (ʿadl occurs as “justice”), and Ibn Ḥajar notes that the Ibn Mājah version of the list has al-ʿĀdil instead.
- **39. Al-Muqīt** Al-Khaṭṭābī: al-Muqīt is the All-Able (Ibn ʿAbbās on 4:85: “muqtadiran”), and also the Giver of sustenance. “The Nourisher” carries only the second meaning. Ibn Ḥajar reports al-Mughīth in place of al-Muqīt in one version.
- **40. Al-Ḥasīb** Al-Khaṭṭābī first explains al-Ḥasīb as the One who suffices (from aḥsabanī, “he gave me enough”). “The Reckoner” is the other common meaning.
- **41. Al-Jalīl** The Qur'an ascribes majesty to Allah (Dhū al-Jalāl) but does not use al-Jalīl as a Name. Ibn Ḥajar notes it is absent from the Ibn Mājah version.
- **49. Al-Bāʿith** The Qur'an states the act of resurrection, not the Name.
- **57. Al-Muḥṣī** The Qur'an states the act (“He has enumerated everything in number”), not the Name.
- **58. Al-Mubdiʾ** The Qur'an states the act together with its counterpart (85:13), not the Name. Best presented with al-Muʿīd.
- **59. Al-Muʿīd** The Qur'an states the act together with its counterpart (85:13), not the Name. Best presented with al-Mubdiʾ.
- **60. Al-Muḥyī** Occurs in construct form: “the Giver of life to the dead”. Ibn Ḥajar reports that Ibn Ḥazm counted only Names that occur in absolute form, so not every scholar counts construct forms.
- **61. Al-Mumīt** Only the verb occurs, always with its counterpart “gives life”. Best presented with al-Muḥyī.
- **64. Al-Wājid** — corrected shortMeaning: The Perceiver → The One Who Lacks Nothing. Corrected meaning: “The Perceiver” is not supported by the classical explanation. Al-Khaṭṭābī: al-Wājid is the Rich who is never in need (wajd and jida mean wealth), and secondarily the One whom nothing He seeks can escape. The Name itself is list-based.
- **65. Al-Mājid** List-based. Al-Khaṭṭābī: the same root and meaning as al-Majīd (glory and abundance), perhaps repeated to pair with al-Wājid.
- **67. Al-Aḥad** The Name is firmly established; the open question is only its place in this enumeration. The sunnah.com text of Tirmidhī 3507 goes directly from al-Wāḥid to aṣ-Ṣamad, so that text reaches ninety-nine only by counting “Allah” as the first Name. Al-Khaṭṭābī's text of the same list includes al-Aḥad (his no. 68, counting “Allah” as no. 1), and Ibn Ḥajar reports al-Aḥad in Ibn Khuzayma's version in place of al-Mughnī. Reviewer to confirm which edition the app cites for its ninety-nine.
- **70. Al-Muqtadir** — corrected shortMeaning: The Determiner → The Perfect in Power. “The Determiner” suggests divine decree (qadar) rather than power. Muqtadir means perfectly able: al-Ṭabarī on 54:42: “able to do what He wills, neither incapable nor weak”.
- **71. Al-Muqaddim** Named in the Prophet's supplication (also in Ṣaḥīḥ Muslim 771a). Best mentioned with al-Muʾakhkhir.
- **72. Al-Muʾakhkhir** Named in the Prophet's supplication (also in Ṣaḥīḥ Muslim 771a). Best mentioned with al-Muqaddim.
- **77. Al-Wālī** 13:11 implies the meaning but does not apply the Name to Allah directly. Ibn Ḥajar notes al-Mawlā in its place in Ibn Khuzayma's version. Al-Khaṭṭābī: the Owner and Governor of all things, who manages them as He wills. “The Patron” is loose; “The Governor of All Things” may be closer.
- **78. Al-Mutaʿālī** The Qur'an writes ٱلْمُتَعَالِ (without the final yāʾ); the hadith text has الْمُتَعَالِي. Both are correct.
- **81. Al-Muntaqim** The Qur'an speaks of Allah's retribution only in restricted forms: “Owner of Retribution” (3:4, 14:47, 39:37), “We will take retribution from the criminals” (32:22, 43:41, 44:16) and “We took retribution from them” (43:25, 43:55). Ibn al-Qayyim (Badāʾiʿ al-Fawāʾid): mention it only with its counterpart, al-ʿAfuww. Ibn ʿUthaymīn, commenting on that passage, adds that Ibn Taymiyya rejected naming Allah al-Muntaqim because it occurs only in restricted form. Translation: “The Avenger” can suggest personal vengeance; the Qur'anic sense is just retribution against wrongdoers. Reviewer to decide on inclusion and wording.
- **83. Ar-Raʾūf** The Qur'an and the hadith text write رَءُوف; the app uses the modern spelling الرَّؤُوف. Both are correct; the reviewer may prefer the Qur'anic spelling.
- **85. Dhul-Jalāli wal-Ikrām** — corrected shortMeaning: Lord of Majesty and Honor → Possessor of Majesty and Honor. “Lord of” translates rabb, a different word. Dhū means “Possessor of”.
- **86. Al-Muqsiṭ** The Qur'an describes Allah as upholding justice (3:18); al-muqsiṭīn in 49:9 are people whom Allah loves. The Name itself is list-based.
- **87. Al-Jāmiʿ** Occurs in construct form (“Gatherer of mankind”).
- **89. Al-Mughnī** Only the verb occurs. Ibn Ḥajar reports al-Aḥad in its place in Ibn Khuzayma's version.
- **90. Al-Māniʿ** Ibn al-Qayyim: mention it only with its counterpart al-Muʿṭī (the Giver), which is not in this list. Al-Khaṭṭābī gives two meanings: the One who protects His allies, and the One who withholds from those who do not deserve. Ibn Ḥajar notes ar-Rāfiʿ in its place in Ibn Ḥibbān's version.
- **91. Aḍ-Ḍārr** The Qur'an affirms that harm and benefit happen only by Allah's will, and so does Tirmidhī 2516. Ibn al-Qayyim: never mention it alone, only as aḍ-Ḍārr an-Nāfiʿ, because the praise lies in the pair: He alone controls benefit and harm. Al-Khaṭṭābī also explains the two together. Islamweb fatwa 464491 states that no clear text of the Qur'an or authentic Sunnah establishes aḍ-Ḍārr as a Name. Translation: “The Distresser” is an unusual word and, shown alone on a flashcard, can mislead. Reviewer to decide the wording and whether the pair is always shown together.
- **92. An-Nāfiʿ** Same basis and pairing as aḍ-Ḍārr.
- **93. An-Nūr** Occurs in construct form (“the Light of the heavens and the earth”).
- **95. Al-Badīʿ** Occurs in construct form (“Originator of the heavens and the earth”). Ibn Ḥajar reports that Ibn Ḥazm did not count construct forms.
- **96. Al-Bāqī** Only the verb occurs (“the Face of your Lord remains”). Ibn Ḥajar cites this as the reason Ibn Ḥazm excluded al-Bāqī.
- **97. Al-Wārith** Occurs in plural and construct forms.
- **98. Ar-Rashīd** In 11:87 his people say ar-rashīd of Shuʿayb; no verse applies it to Allah. Al-Khaṭṭābī: the One who guides creation to what benefits them, and whose management is always right.
- **99. Aṣ-Ṣabūr** The attribute is established in an authentic hadith, but the Name aṣ-Ṣabūr is not in the Qur'an. Islamweb fatwa 464491 notes scholarly disagreement over it as a Name. Al-Khaṭṭābī: the One who does not hasten to punish the disobedient but gives them respite.

### Sources consulted

- Qur'an: Tanzil Uthmani text (tanzil.net), cross-checked on quran.com.
- Hadith, all on sunnah.com: Tirmidhī 1314, 2516, 3475 and 3507; Ibn Mājah
  3861; al-Bukhārī 1120, 2736, 6410, 7378 and 7392; Muslim 771a and 2677a;
  Abū Dāwūd 1493, 3451 and 4955.
- al-Khaṭṭābī, _Shaʾn al-Duʿāʾ_ (shamela.ws/book/95700).
- Ibn Ḥajar, _Fatḥ al-Bārī_ 11:219–221 (islamweb.net library, book 52).
- Ibn al-Qayyim, _Badāʾiʿ al-Fawāʾid_, as excerpted by Ibn ʿUthaymīn in
  _al-Muntaqā min Farāʾid al-Fawāʾid_ (shamela.ws/book/21802/11).
- al-Ṭabarī, Ibn Kathīr and al-Saʿdī on 59:23, and al-Ṭabarī on 54:42
  (quran.com tafsīr).
- Islamweb fatwas 222880 and 464491. These are secondary and were used only
  to locate and quote classical statements.

## Launch readiness

Phase 10 is **not** safe to mark complete. The Arabic, order and
transliterations agree with the primary sources, and every citation has been
checked. But:

- no qualified scholar has reviewed the content, and PLAN.md forbids
  launching AI-prepared theological content without that review;
- 25 Names have open questions that only a qualified reviewer can
  settle;
- the enumeration edition (al-Aḥad) must be confirmed;
- explanations and audio have not been written or recorded.

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

- Set `verificationStatus` to `"reviewed"` once a qualified reviewer has
  checked an entry, and to `"verified"` once a second reviewer has confirmed
  it. The `audit` record does not count as a review.
- When an issue in `audit.notes` is settled, update the entry and its
  `audit` record so the decision is written down.
- Also update `verificationStatus` for each source in `sources.json`.
- Bump `version` and `updated` in `names.json` for every content release
  (for example `1.0.0` for the first verified release). The version appears
  in Settings, on the Sources page and in every backup file.
- Never change a `verified` entry without another review.

## Checking your changes

```bash
npm test         # validates both content files, among other checks
npm run build    # the build fails if content is malformed
```

Validation catches duplicate ids or orders, gaps in the order, missing
Arabic, transliteration or meaning, invalid statuses or dates, unknown
sources, audit records without evidence, and remote audio URLs. It cannot
judge correctness. That is what the review is for.

## Ids are permanent

A Name's `id` (for example `ar-rahman`) is part of every learner's saved
progress and backup files. Don't rename an id once the app is public. Fix
the displayed fields instead.
