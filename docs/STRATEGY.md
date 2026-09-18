# Product Strategy, IA & AI Patterns

## Vision

ChatGPT × Apple Wallet × a modern bank, as one experience. The AI assistant is the primary interface: it understands banking intent, financial goals, transaction history, and spending behavior. Users communicate intent instead of navigating menus — and manipulate money as physical objects.

**Positioning:** the calm, conversational alternative to feature-cluttered banking apps. Every interaction should *increase* trust.

---

## Information architecture

Four "spaces", not a menu tree. The assistant is home; the other three are direct manipulation surfaces the AI can also drive.

```
Aura
├─ Assistant (home)      Balance · health score · proactive insight · conversation
│    └─ generates → Transfer · Allocate · Spend-answer · Affordability cards
├─ Activity              Transactions as cards (tap · expand · long-press · swipe)
├─ Spaces                Savings goals as draggable objects
└─ Insights              AI intelligence (pinch to expand)

Global overlays
├─ Contextual "Ask Aura" sheet   (from any long-press)
└─ Biometric gate                (required for money movement)
```

Navigation is a quiet bottom dock (tappable — the accessible spine) rather than gestures, so screen-swaps never collide with the swipe/drag gestures that live *inside* screens.

---

## Core user flows

**Transfer (conversational)**
`"Send ₦20,000 to David"` → AI parses amount + recipient, matches the contact, shows a transfer card with the post-transfer balance and a plain-language rationale → user swipes right (or taps Approve) → **Face ID gate** → balance debits, transaction appears. Missing info (no amount, or no recipient) → the AI asks one clarifying question with tappable suggestions.

**Save (drag or say)**
`"Move 10% into savings"` → AI computes the amount and proposes a goal → swipe to confirm. Or, in Spaces, pick an amount and **drag the coin onto a goal**. Both paths hit the same store action.

**Understand spending**
`"How much on food this month?"` → AI answers with the figure and its share of outflow → **pinch the card open** for the full category breakdown.

**Affordability**
`"Can I afford ₦150,000?"` → AI returns a calm yes/tight verdict with reasoning (share of available balance, goal impact, timing vs. next salary).

**Ask about anything**
Long-press a transaction → *"Explain this purchase."* Long-press a goal → *"How can I reach this faster?"* A contextual AI sheet answers in place.

---

## AI interaction patterns

- **Intent → interaction, not intent → text.** The assistant's job is to translate language into the right *gestural flow* (a card to swipe, a coin to drag), not to reply in prose. See `src/ai/intent.ts` → `src/ai/cards.tsx`.
- **Never auto-execute money movement.** The AI *prepares*; the human *commits* with a gesture and a biometric. This is the trust contract.
- **Always explain.** Every card carries a one-line rationale and the concrete balance impact.
- **Proactive, not noisy.** The home surfaces one useful nudge (subscriptions renewing, spending trend) with an easy dismiss — calm technology.
- **Progressive disclosure.** Answers start as a summary; detail is one pinch away.
- **Graceful clarification.** Ambiguity yields exactly one question plus tappable options, never an error.

**Productionizing the AI:** `parseIntent()` is a deterministic rules engine so the prototype runs fully offline. Swap it for an LLM with tool-calling — each `Intent` variant maps to a tool (`prepare_transfer`, `allocate_to_goal`, `query_spend`, `check_affordability`), and the returned structured object renders the exact same interactive cards. The UI contract doesn't change.

---

## Component system

Composable primitives over one-off screens:

- **Gesture primitives** — `SwipeCard`, `LongPress`, `ExpandCard` — encapsulate a gesture, its motion, its haptics, and its accessible fallback. Screens compose them; they never re-implement gesture logic.
- **Surfaces** — `PhoneShell`, `Sheet` (drag-to-dismiss), `BiometricGate`, `SpaceDock`.
- **Atoms** — `CategoryIcon`, `Avatar`, `ProgressRing`, gesture hints.
- **AI cards** — `TransferCard`, `AllocateCard`, `SpendCard`, `AffordabilityCard`, unified by `renderIntentCard()`.

**Design tokens** (`tailwind.config.js`): near-black `ink` surfaces, off-white type, a single `accent` (#5B7CFA), semantic `positive`/`negative`. Monochrome + one accent keeps the interface quiet and premium; color is reserved for meaning (money in/out, goal identity).

---

## Roadmap beyond the prototype

Real LLM intent + streaming · live bank data & open-banking rails · true biometric (WebAuthn / native) · budgets and shared spaces · richer proactive insights · full VoiceOver/TalkBack pass and switch-control testing.
