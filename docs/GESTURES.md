# Gesture Language & Motion Specification

A universal gesture system. Each gesture maps to one clear intent, produces meaningful physical feedback, has a haptic signature, and ships with an accessible equivalent. Motion teaches the interface — users learn by doing.

---

## The gesture vocabulary

| Gesture | Intent | Where it's used | Feedback | Accessible equivalent |
|---------|--------|-----------------|----------|-----------------------|
| **Tap** | Focus & inspect | Open account, expand a transaction, select | Scale-down `0.98`, `haptic('tap')` | Native button/focus |
| **Swipe right** | Advance & confirm | Approve transfer, accept recommendation | Card tracks finger, green wash grows, commits past **96px** or **480px/s** | "Approve" button |
| **Swipe left** | Cancel & dismiss | Reject, undo, remove | Card tracks finger, red wash grows | "Cancel" button |
| **Drag** | Move & allocate money | Coin → savings goal, funds between spaces | Object lifts (`scale 1.12`), drop zone highlights on hover, ripple on drop | Amount steppers + goal actions |
| **Pinch out** | Reveal detail | Spending breakdown, subscriptions, metadata | Height springs open, content fades in | Tap disclosure chip |
| **Pinch in** | Simplify & summarize | Collapse insight, return to overview | Height springs closed | Tap disclosure chip |
| **Long press** | Ask the AI | Any transaction, goal, or category | Radial accent bar fills over **480ms**, ring appears, then AI sheet opens | Enter/Space, right-click (context menu) |

Thresholds live in one place — `src/lib/motion.ts` `gesture` — so behavior stays consistent and tunable.

---

## Motion tokens (`src/lib/motion.ts`)

Physics-based springs, not duration tweens, for anything a finger touches.

| Token | Stiffness / Damping | Use |
|-------|--------------------|-----|
| `spring.glass` | 420 / 38 | Default object motion — sheets & cards settling |
| `spring.crisp` | 620 / 34 | Small controls, chips, toggles |
| `spring.weighty` | 300 / 34 · mass 1.1 | A card being physically thrown to completion |
| `spring.soft` | 260 / 30 | Disclosure, insight expansion |

Ease curves for non-physical transitions: `ease.standard = cubic-bezier(0.32, 0.72, 0, 1)`. Screen changes: 260ms, standard ease, slide-in 22px + fade.

**Haptic signatures** (`src/lib/haptics.ts`, Vibration API where supported): `tap` 8ms · `select` 12ms · `commit` `[10,30,14]` · `success` `[12,40,18,40,24]` · `warn` `[24,60,24]`. Every committed gesture fires one — feedback confirms the system understood.

**Reduced motion:** `@media (prefers-reduced-motion: reduce)` drops all animation to ~0ms; gestures still function, they just don't animate.

---

## Interaction contracts

**SwipeCard** — `onConfirm` fires only after the commit animation resolves, so state changes never feel premature. A left swipe is available only when `onCancel` is provided. Both directions are mirrored as buttons beneath the card (always present, visually quiet).

**LongPress** — hold duration is configurable per surface (default 480ms). Releasing early cancels cleanly. `onContextMenu` and keyboard activation route to the same `onAsk`, so the "ask the AI" affordance is never gesture-only.

**Drag-to-allocate** (`SavingsScreen`) — the coin carries a chosen amount (₦5k–₦50k steppers). On drag, live hit-testing against each goal's bounding box highlights the target and fires `select` haptics; on drop, the goal ripples and the store moves funds from *available* into the goal. `dragSnapToOrigin` returns the coin home.

**Pinch** (`usePinch`) — detects a genuine two-finger pinch on touch devices and maps trackpad `ctrl+wheel` (the browser's native pinch) to the same expand/collapse, with a tap disclosure as the universal fallback.

---

## Why buttons still exist

Traditional controls appear only where the vision demands them: **security & critical financial confirmation** (the Face ID gate on every transfer), **accessibility** (every gesture's equivalent), and **compliance/identity**. Everything else is conversation and touch.
