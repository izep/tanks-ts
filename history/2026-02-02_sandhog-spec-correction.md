# 2026-02-02: Sandhog Spec Price Correction

## Context
Re-verification of Spec 008 (Sandhog Family) during Ralph Loop mode.

## Finding
Spec document contained **incorrect prices** that didn't match Requirements.md:
- Spec said: Baby $3,000, Sandhog $5,000, Heavy $10,000
- Requirements.md (canonical): Baby $10,000, Sandhog $16,750, Heavy $25,000
- Implementation: Correctly matched Requirements.md

## Resolution
Updated spec document to reflect correct prices from Requirements.md.

## Lesson
When creating specs, always cross-reference Requirements.md for canonical values. The spec should mirror the master specification, not introduce new values.

## Verification
- All acceptance criteria verified correct
- All 7 sandhog tests passing
- Build succeeds
- Implementation matches Requirements.md exactly
