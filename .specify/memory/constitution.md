# Tanks-a-Lot TS Constitution

> A modern reimplementation of "Scorched Earth" artillery game. Staying faithful to the awesome parts, but can ignore the parts that were limitations from the old technology. Optimized to play on iPhone as well as desktop.

**Version:** 1.0.0

---

## Ralph Wiggum

**Source:** https://github.com/izep/ralph-wiggum
**Commit:** a5edbcd0a686bf76ea84f28ee3feb911ea07e10d
**Installed:** 2026-02-02

### Auto-Update

At session start, check for updates:
1. Run: `git ls-remote https://github.com/izep/ralph-wiggum.git HEAD`
2. If hash differs: fetch latest scripts, update this file, inform user

---

## Context Detection

**Ralph Loop Mode** (you're in this if started by ralph-loop.sh):
- Focus on implementation — no unnecessary questions
- Pick highest priority incomplete spec (or a different achievable one if top priority seems blocked)
- Check `NR_OF_TRIES` at bottom of spec — if ≥10, split into simpler specs
- Check `history/` folder for lessons learned from previous attempts
- Complete ALL acceptance criteria
- Add concise notes to `history/YYYY-MM-DD_brief-topic.md` about what was learned
- Test thoroughly
- Commit and push
- Output `<promise>DONE</promise>` ONLY when 100% complete

**Interactive Mode** (normal conversation):
- Be helpful and conversational
- Guide decisions, create specs
- Explain Ralph loop when ready

---

## Core Principles

### I. Faithful Authenticity
Honor the original Scorched Earth's spirit. Preserve the gameplay mechanics, weapon behaviors, and strategic depth that made the original memorable. When in doubt, refer to Requirements.md for the canonical specification.

### II. Code Quality
Maintain clean, testable TypeScript with:
- Strict type safety
- Comprehensive test coverage
- ECS-inspired architecture
- Minimal, surgical changes

### III. Modern UX
Mobile-first, smooth experience:
- Touch controls optimized for iPhone
- Responsive UI for all screen sizes
- 60fps performance target
- Progressive Web App capabilities

---

## Technical Stack

**Detected from codebase:**
- **Language:** TypeScript (Strict Mode)
- **Build System:** Vite
- **Testing:** Vitest + Playwright
- **Rendering:** HTML5 Canvas (no 3D libraries)
- **Icons:** FontAwesome
- **Target Platforms:** Web / PWA (desktop + mobile)

**Architecture:**
- ECS-inspired pattern
- Centralized GameState
- Stateless system classes
- Event-driven game loop

---

## Autonomy

**YOLO Mode:** ENABLED
Full permission to read/write files, execute commands, make HTTP requests.

**Git Autonomy:** ENABLED
Commit and push changes automatically after completing each spec. Use meaningful commit messages in the format: `feat: [spec name] - [brief description]`

---

## Work Items & Tracking

The agent discovers work dynamically from:
1. **specs/ folder** — Primary source, look for incomplete `.md` files
2. **TODO.md** — 10-phase implementation plan (3,371 lines)
3. **Requirements.md** — Full Scorched Earth specification (392 lines)
4. **history/ folder** — Lessons learned from previous attempts

Create specs using `/speckit.specify [description]` or manually create `specs/NNN-feature-name.md`.

Each spec MUST have **testable acceptance criteria**.

### NR_OF_TRIES Tracking

Each spec tracks attempts as `<!-- NR_OF_TRIES: N -->` at the bottom. If a spec reaches 10 tries without completion, it should be split into simpler, more achievable specs.

### Re-Verification Mode

When all specs appear complete, the agent will:
1. Randomly pick a completed spec
2. Strictly re-verify ALL acceptance criteria
3. Fix any regressions found
4. Only output `<promise>DONE</promise>` if quality confirmed

---

## Development Philosophy

### What Makes Scorched Earth Great
- Turn-based strategic depth
- Destructible terrain creating emergent gameplay
- Rich weapon variety with distinct tactical uses
- Wind/gravity creating skill-based aiming
- Economic strategy (buying weapons between rounds)
- Multiple AI personalities for varied challenge

### What to Preserve
- All weapon types and behaviors from specification
- Physics calculations (ballistics, terrain destruction)
- Economic system (dynamic pricing, interest rates)
- AI personality diversity
- Turn-based game flow

### What to Modernize
- Touch-friendly controls
- Responsive UI scaling
- PWA installation
- Smooth animations (no VGA limitations)
- Web audio (no PC speaker limitations)
- Modern color depth (not limited to 256 colors)

---

## Success Criteria

A successful implementation will:
1. Match the Requirements.md specification (95%+ feature compliance)
2. Run smoothly on iPhone and desktop (60fps)
3. Feel authentic to original Scorched Earth players
4. Have comprehensive test coverage (>80%)
5. Use clean, maintainable TypeScript architecture

---

## References

- **Requirements:** `Requirements.md` (392 lines, comprehensive spec)
- **Implementation Plan:** `TODO.md` (3,371 lines, 10 phases)
- **Code Review:** `.copilot/session-state/.../code-review.md`

---

## Running Ralph

```bash
# Claude Code / Cursor (Recommended)
./scripts/ralph-loop.sh

# OpenAI Codex
./scripts/ralph-loop-codex.sh

# GitHub Copilot
./scripts/ralph-loop-copilot.sh

# Google Gemini
./scripts/ralph-loop-gemini.sh

# With iteration limit
./scripts/ralph-loop.sh 20
```

---

**This constitution guides all development decisions. When uncertain, refer back to these principles and the project vision.**
