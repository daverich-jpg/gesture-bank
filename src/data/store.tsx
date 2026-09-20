import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { AccountState, Goal, Txn, Category } from './types'
import { seed } from './seed'

// A brand-new account: no money, no goals, no transactions, no insights.
// Contacts (the address book) are kept so transfers work once funded — they
// aren't "activity" and don't imply the user has done anything yet.
const emptyAccount: AccountState = {
  balance: 0,
  available: 0,
  goals: [],
  txns: [],
  contacts: seed.contacts,
}

type Action =
  | { type: 'transfer'; to: string; amount: number }
  | { type: 'allocate'; goalId: string; amount: number }
  | { type: 'withdrawGoal'; goalId: string; amount: number }
  | { type: 'recategorize'; txnId: string; category: Category }
  | { type: 'fund'; amount: number }
  | { type: 'addGoal'; name: string; emoji: string; target: number; hue: number }
  | { type: 'reset' }

function reducer(state: AccountState, action: Action): AccountState {
  switch (action.type) {
    case 'transfer': {
      const txn: Txn = {
        id: 'tx' + Math.random().toString(36).slice(2, 7),
        title: `Transfer to ${action.to}`,
        merchant: action.to,
        amount: -action.amount,
        category: 'transfer',
        date: new Date().toISOString(),
      }
      return {
        ...state,
        balance: state.balance - action.amount,
        available: state.available - action.amount,
        txns: [txn, ...state.txns],
      }
    }
    case 'allocate': {
      const amt = Math.min(action.amount, state.available)
      return {
        ...state,
        available: state.available - amt,
        goals: state.goals.map((g) =>
          g.id === action.goalId ? { ...g, saved: g.saved + amt } : g,
        ),
      }
    }
    case 'withdrawGoal': {
      const goal = state.goals.find((g) => g.id === action.goalId)
      if (!goal) return state
      const amt = Math.min(action.amount, goal.saved)
      return {
        ...state,
        available: state.available + amt,
        goals: state.goals.map((g) =>
          g.id === action.goalId ? { ...g, saved: g.saved - amt } : g,
        ),
      }
    }
    case 'recategorize':
      return {
        ...state,
        txns: state.txns.map((t) =>
          t.id === action.txnId ? { ...t, category: action.category } : t,
        ),
      }
    case 'fund': {
      const txn: Txn = {
        id: 'fund' + Math.random().toString(36).slice(2, 7),
        title: 'Added money',
        merchant: 'Top-up',
        amount: action.amount,
        category: 'income',
        date: new Date().toISOString(),
      }
      return {
        ...state,
        balance: state.balance + action.amount,
        available: state.available + action.amount,
        txns: [txn, ...state.txns],
      }
    }
    case 'addGoal': {
      const goal: Goal = {
        id: 'g' + Math.random().toString(36).slice(2, 7),
        name: action.name,
        emoji: action.emoji,
        saved: 0,
        target: action.target,
        hue: action.hue,
      }
      return { ...state, goals: [...state.goals, goal] }
    }
    case 'reset':
      return structuredClone(seed)
    default:
      return state
  }
}

const StoreCtx = createContext<{
  state: AccountState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  // New users start empty and build up their account through real actions.
  const [state, dispatch] = useReducer(reducer, emptyAccount, structuredClone)
  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

// Derived selectors
export function goalProgress(g: Goal) {
  return g.target > 0 ? Math.min(1, g.saved / g.target) : 0
}

// True for a freshly-created account that has done nothing yet.
export function isNewUser(state: AccountState) {
  return state.balance === 0 && state.txns.length === 0 && state.goals.length === 0
}

// First-run checklist progress, derived entirely from account state.
export function gettingStarted(state: AccountState) {
  const funded = state.balance > 0 || state.txns.some((t) => t.amount > 0)
  const hasGoal = state.goals.length > 0
  const moved = state.goals.some((g) => g.saved > 0) || state.txns.some((t) => t.category === 'transfer')
  return { funded, hasGoal, moved, done: funded && hasGoal && moved }
}

export function spentThisMonth(state: AccountState) {
  return state.txns
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)
}

export function spentByCategory(state: AccountState) {
  const map = new Map<Category, number>()
  for (const t of state.txns) {
    if (t.amount < 0) map.set(t.category, (map.get(t.category) ?? 0) + Math.abs(t.amount))
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}
