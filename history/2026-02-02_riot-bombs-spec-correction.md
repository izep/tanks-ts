# 2026-02-02: Riot Bombs Spec Correction

## What Happened
During re-verification of spec 009-add-riot-bombs.md, found the spec had incorrect costs:
- Spec said Riot Bomb = $2,500, but Requirements.md says $5,000
- Spec said Heavy Riot Bomb = $8,000, but Requirements.md says $4,750

## Fix Applied
- Corrected spec to match canonical Requirements.md values
- Updated radius values (30px and 45px instead of 50px and 90px)
- Updated bundle sizes to match actual implementation (5 and 2)

## Lesson Learned
- Always verify spec values against Requirements.md (the canonical source)
- Implementation was correct, spec documentation was wrong
- Re-verification mode caught this documentation error
