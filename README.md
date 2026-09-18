# Aura — Gesture-First AI Banking

A next-generation mobile banking prototype where **AI and gestures are the primary interface** — not screens full of buttons. Managing money should feel as natural as having a conversation and manipulating objects.

Built with **React + TypeScript + Tailwind CSS + Framer Motion**.

---

## Run it

```bash
npm install
npm run dev
```

Open **http://localhost:5180** and use your browser's device toolbar (or a phone) at ~390–430px wide. Best experienced on a touch device where the gestures are native.

```bash
npm run build   # typecheck + production build
```

---

## What's built

A working, offline prototype (no backend, no API keys) with a deterministic on-device intent engine standing in for the LLM.

| Space | What it demonstrates |
|-------|----------------------|
| **Assistant** (home) | AI hub: balance, financial-health score, proactive insight, natural-language conversation that generates interactive cards |
| **Activity** | Transactions as cards — tap to expand, **long-press to ask AI**, **swipe to recategorize** |
| **Spaces** | Savings goals as physical objects — **drag the money coin onto a goal** to allocate |
| **Insights** | AI intelligence cards — **pinch out** to reveal detail (tap fallback) |

**Signature flow — conversational transfer:** type *"Send ₦20,000 to David"* → AI prepares a transfer card with explainability → **swipe right to approve** → **Face ID gate** (required control) → done. Every money move is gesture-initiated but confirmed by an explicit, accessible control.

---

## Architecture

```
src/
  ai/
    intent.ts        Natural-language → structured banking intent (rules; swap for an LLM tool-call)
    cards.tsx        Interactive intent cards (transfer, allocate, spend breakdown, affordability)
    AiProvider.tsx   Contextual "ask AI" sheet + biometric transfer orchestration (app-wide)
  gestures/
    SwipeCard.tsx    Swipe right = advance/confirm, left = cancel  (+ accessible buttons)
    LongPress.tsx    Press-and-hold = "Ask the AI"                 (+ keyboard / right-click)
    ExpandCard.tsx   Pinch out/in = reveal/collapse detail         (+ tap disclosure)
    usePinch.ts      Two-pointer + trackpad pinch detection
  components/        PhoneShell, Sheet (drag-to-dismiss), BiometricGate, SpaceDock, atoms
  screens/           HubScreen, MoneyScreen, SavingsScreen, InsightsScreen
  data/              Typed store (useReducer) that actually moves money + seed data
  lib/               motion tokens · haptics · currency formatting
```

Money moves are **real state changes**: transfers debit the balance and append a transaction; allocations move funds from *available* into a goal; recategorizing and withdrawing update the store live.

---

## Design principles honored

1. **AI first** — the assistant *is* the home screen; every action can begin with conversation.
2. **Gesture first** — swipe / drag / pinch / long-press replace navigation and forms wherever possible.
3. **Calm technology** — quiet monochrome, one confident accent, springs that settle rather than bounce.
4. **Financial confidence** — every card explains itself and shows the balance impact before you commit.
5. **Progressive disclosure** — summaries by default, detail on pinch.
6. **Explainability** — the AI always states *why* alongside *what*.

See **[docs/GESTURES.md](docs/GESTURES.md)** for the full gesture language + motion specification, and **[docs/STRATEGY.md](docs/STRATEGY.md)** for product strategy, information architecture, user flows, and AI interaction patterns.

## Accessibility

Every gesture has a visible, operable equivalent: SwipeCard renders Approve/Cancel buttons; LongPress responds to Enter/Space and right-click; ExpandCard has a tap disclosure; the money coin's amount steppers and per-goal withdraw are buttons. `prefers-reduced-motion` collapses all animation. Critical money confirmations use an explicit control, never a gesture alone.
