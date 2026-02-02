# Ralph Wiggum Setup Complete! 🎉

Ralph Wiggum has been successfully installed in your Tanks-a-Lot TS project.

---

## What Was Created

| File/Directory | Purpose |
|----------------|---------|
| `.specify/memory/constitution.md` | Your project's guiding document with principles and vision |
| `scripts/ralph-loop.sh` | Autonomous build loop for Claude/Cursor |
| `scripts/ralph-loop-codex.sh` | Autonomous build loop for Codex |
| `AGENTS.md` | Entry point for AI agents |
| `CLAUDE.md` | Quick entry point for Claude |
| `PROMPT_build.md` | Build mode instructions |
| `.cursorrules` | Cursor AI configuration |
| `specs/` | Directory for feature specifications (empty, ready for specs) |
| `history/` | Directory for lessons learned (empty initially) |
| `logs/` | Directory for Ralph loop logs |

---

## Your Constitution

**Project:** Tanks-a-Lot TS  
**Vision:** Modern reimplementation of Scorched Earth, faithful to the original's spirit, optimized for iPhone and desktop

**Core Principles:**
1. **Faithful Authenticity** — Honor the original's gameplay and mechanics
2. **Code Quality** — Clean, testable TypeScript with ECS architecture
3. **Modern UX** — Mobile-first, smooth 60fps experience

**Autonomy:** ENABLED (YOLO Mode + Git Autonomy)  
**Status:** 23% complete, 10-phase roadmap in TODO.md

---

## How to Use Ralph Wiggum

### Step 1: Create Specifications

Specifications define WHAT to build with clear acceptance criteria. Create them in `specs/` directory.

**Example:** `specs/01_weapon_bundle_system.md`

```markdown
# Weapon Bundle System

**Priority:** Critical  
**Status:** Not Started

## Overview
Implement weapon bundle purchasing system where weapons are bought in bundles (e.g., 10 missiles per purchase) instead of single items.

## Acceptance Criteria
- [ ] WeaponStats interface has `bundleSize` property
- [ ] Shop purchase adds `bundleSize` items, not 1
- [ ] Inventory enforces 99-item cap per weapon
- [ ] UI shows bundle info: "Missile ($1,875 / bundle of 5)"
- [ ] All tests pass

## Files to Modify
- `src/core/WeaponData.ts` - Add bundleSize to interface
- `src/systems/ShopSystem.ts` - Update purchase logic
- Shop UI components - Display bundle info

## Testing
- Unit test: purchasing adds correct quantity
- Unit test: inventory cap enforcement
- Integration test: full purchase flow

---
NR_OF_TRIES: 0
```

### Step 2: Start Ralph Loop

Once you have specs, run:

```bash
# Claude/Cursor
./scripts/ralph-loop.sh

# Limit to 20 iterations
./scripts/ralph-loop.sh 20

# Codex CLI
./scripts/ralph-loop-codex.sh
```

Ralph will:
1. Read your constitution and specs
2. Pick the highest priority incomplete spec
3. Implement it completely
4. Run tests
5. Commit and push
6. Move to next spec
7. Repeat autonomously

---

## The Magic

```
┌─────────┐   ┌─────────┐   ┌─────────┐
│ Loop 1  │ → │ Loop 2  │ → │ Loop 3  │ → ...
│ Spec A  │   │ Spec B  │   │ Spec C  │
│  DONE   │   │  DONE   │   │  DONE   │
└─────────┘   └─────────┘   └─────────┘
     ↑             ↑             ↑
   Fresh        Fresh         Fresh
  Context      Context       Context
```

Each iteration gets a **fresh context window** — no context overflow, no degradation.

The agent outputs `<promise>DONE</promise>` only when:
- ALL acceptance criteria verified
- Tests pass
- Changes committed and pushed

---

## Quick Reference

| Task | Command |
|------|---------|
| Create spec | Describe feature to AI or manually create in `specs/` |
| Start autonomous build | `./scripts/ralph-loop.sh` |
| Limit iterations | `./scripts/ralph-loop.sh 20` |
| View constitution | `cat .specify/memory/constitution.md` |
| Check logs | `tail -f logs/ralph-*.log` |

---

## Your Current Plan

You already have a comprehensive **10-phase implementation plan** in `TODO.md`:

1. **Phase 1:** Core weapons (rollers, tracers, sandhogs, bundle system)
2. **Phase 2:** Economic system (dynamic pricing, interest)
3. **Phase 3:** AI personalities (all 8 types)
4. **Phase 4:** Configuration system
5. **Phase 5:** Defense systems
6. **Phase 6:** Team play
7. **Phase 7:** Enhanced UI
8. **Phase 8:** Save/load
9. **Phase 9:** Audio
10. **Phase 10:** Polish

---

## Next Steps

### Option 1: Create Your First Spec
Tell me what feature from TODO.md you want to tackle first, and I'll create a proper spec for it.

### Option 2: Start Ralph Loop
If you already have specs or want to work from TODO.md directly, you can start the loop:

```bash
./scripts/ralph-loop.sh
```

(Note: Ralph works best with dedicated specs, but can also work from TODO.md)

### Option 3: Keep Working Interactively
Continue our conversation — I can help create specs, answer questions, or guide implementation.

---

## Tips for Success

✅ **DO:**
- Write clear, testable acceptance criteria in specs
- Let Ralph handle one complete spec per iteration
- Trust the loop — it will commit and move on when done
- Check `history/` folder for lessons learned

❌ **DON'T:**
- Interrupt the loop mid-iteration
- Create specs with ambiguous acceptance criteria
- Put too many features in one spec (split if needed)

---

Ralph Wiggum is ready to autonomously build your Scorched Earth clone! 🚀

What would you like to do first?
