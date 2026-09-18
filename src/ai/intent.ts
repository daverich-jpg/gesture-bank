import type { AccountState, Category } from '../data/types'
import { naira } from '../lib/format'
import { spentByCategory, spentThisMonth } from '../data/store'

// A lightweight, deterministic intent parser. In production this is an LLM with
// tool-calling; here it's rules so the prototype is fully offline and predictable.
// Every intent returns an explanation (Explainability principle) + an optional
// interactive "card" the user must gesture-confirm (never auto-execute money moves).

export type Intent =
  | { kind: 'transfer'; amount: number; to: string; explain: string }
  | { kind: 'allocate'; amount: number; goalHint?: string; explain: string }
  | { kind: 'spendQuery'; category?: Category; answer: string; breakdown: [string, number][] }
  | { kind: 'affordability'; amount: number; verdict: string; ok: boolean }
  | { kind: 'insight'; answer: string }
  | { kind: 'clarify'; answer: string; suggestions: string[] }

const NAMES = ['david', 'sarah', 'tunde', 'mum', 'sarah m', 'david o']

function parseAmount(text: string): number | null {
  // matches ₦20,000 / 20000 / 20k / 50 naira / 1.2m
  const kMatch = text.match(/(?:₦|ngn|naira)?\s*([\d,.]+)\s*(k|m)\b/i)
  if (kMatch) {
    const base = parseFloat(kMatch[1].replace(/,/g, ''))
    return Math.round(base * (kMatch[2].toLowerCase() === 'm' ? 1_000_000 : 1_000))
  }
  const plain = text.match(/(?:₦|ngn|naira)\s*([\d,]+)|([\d,]{3,})/i)
  if (plain) {
    const raw = (plain[1] ?? plain[2]).replace(/,/g, '')
    const n = parseInt(raw, 10)
    if (!Number.isNaN(n)) return n
  }
  return null
}

function findName(text: string): string | null {
  const lower = text.toLowerCase()
  for (const n of NAMES) {
    if (lower.includes(n)) {
      // Title-case first token for display
      return n.split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
    }
  }
  const toMatch = lower.match(/to\s+([a-z]+)/)
  if (toMatch) return toMatch[1][0].toUpperCase() + toMatch[1].slice(1)
  return null
}

const CATEGORY_WORDS: Record<string, Category> = {
  food: 'food', eat: 'food', restaurant: 'food', dining: 'food',
  transport: 'transport', ride: 'transport', uber: 'transport', bolt: 'transport',
  shopping: 'shopping', shop: 'shopping',
  bills: 'bills', bill: 'bills', electricity: 'bills',
  subscription: 'subscription', subscriptions: 'subscription', netflix: 'subscription', spotify: 'subscription',
  health: 'health', pharmacy: 'health',
}

export function parseIntent(text: string, state: AccountState): Intent {
  const t = text.trim().toLowerCase()
  const amount = parseAmount(text)

  // Transfer
  if (/\b(send|transfer|pay|move.*to\s+[a-z]+)\b/.test(t) && !/savings|goal/.test(t)) {
    const to = findName(text)
    if (amount && to) {
      return {
        kind: 'transfer',
        amount,
        to,
        explain: `I've prepared a transfer of ${naira(amount)} to ${to}. Review the card, then swipe right to approve. You'll confirm with Face ID.`,
      }
    }
    if (amount && !to) {
      return { kind: 'clarify', answer: `Who should I send ${naira(amount)} to?`, suggestions: state.contacts.map((c) => c.name) }
    }
    if (!amount && to) {
      return { kind: 'clarify', answer: `How much should I send to ${to}?`, suggestions: ['₦5,000', '₦20,000', '₦50,000'] }
    }
  }

  // Allocate to savings
  if (/\b(save|move|put|allocate)\b/.test(t) && /(saving|goal|fund|trip|laptop|house|emergency|japan)/.test(t)) {
    const pctMatch = t.match(/(\d+)\s*%/)
    let amt = amount ?? 0
    if (pctMatch) amt = Math.round((state.balance * parseInt(pctMatch[1], 10)) / 100)
    const goalHint =
      /emergency/.test(t) ? 'Emergency Fund'
      : /japan|trip|vacation/.test(t) ? 'Japan Trip'
      : /laptop/.test(t) ? 'New Laptop'
      : /house|deposit/.test(t) ? 'House Deposit'
      : undefined
    return {
      kind: 'allocate',
      amount: amt || 50000,
      goalHint,
      explain: goalHint
        ? `Ready to move ${naira(amt || 50000)} into ${goalHint}. Drag the coin onto the goal, or swipe the card right to confirm.`
        : `Ready to move ${naira(amt || 50000)} into savings. Drag it onto a goal below.`,
    }
  }

  // Spend query
  if (/\b(how much|spend|spent|spending)\b/.test(t)) {
    let category: Category | undefined
    for (const [word, cat] of Object.entries(CATEGORY_WORDS)) {
      if (t.includes(word)) { category = cat; break }
    }
    const breakdown = spentByCategory(state).map(([c, v]) => [c, v] as [string, number])
    if (category) {
      const total = breakdown.find(([c]) => c === category)?.[1] ?? 0
      return {
        kind: 'spendQuery',
        category,
        answer: `You've spent ${naira(total)} on ${category} this month — that's ${Math.round((total / spentThisMonth(state)) * 100)}% of your outflow. Open the breakdown below for the full split.`,
        breakdown,
      }
    }
    return {
      kind: 'spendQuery',
      answer: `You've spent ${naira(spentThisMonth(state))} this month across ${breakdown.length} categories. Open the breakdown below to explore.`,
      breakdown,
    }
  }

  // Affordability
  if (/\b(can i afford|afford|should i buy)\b/.test(t) && amount) {
    const ok = amount <= state.available * 0.4
    return {
      kind: 'affordability',
      amount,
      ok,
      verdict: ok
        ? `Yes — ${naira(amount)} is ${Math.round((amount / state.available) * 100)}% of your available balance and leaves your goals on track. Comfortable buy.`
        : `Doable, but ${naira(amount)} is a big bite — ${Math.round((amount / state.available) * 100)}% of what's available. I'd wait until after Friday's salary, or pull from a goal.`,
    }
  }

  // Generic insight
  if (/\b(insight|health|how am i|doing|advice|tip)\b/.test(t)) {
    return {
      kind: 'insight',
      answer: `You're trending 12% under last month's spend. Two subscriptions (Netflix, Spotify) renew this week — ₦6,300 total. Want me to review them?`,
    }
  }

  return {
    kind: 'clarify',
    answer: `I can move money, answer spending questions, or check what you can afford. Try one of these:`,
    suggestions: ['Send ₦20,000 to David', 'How much on food this month?', 'Move 10% into savings', 'Can I afford ₦150,000?'],
  }
}
