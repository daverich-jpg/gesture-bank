import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { AccountState, Goal, Txn, Category } from './types'
import { seed } from './seed'

type Action =
  | { type: 'transfer'; to: string; amount: number }
  | { type: 'allocate'; goalId: string; amount: number }
  | { type: 'withdrawGoal'; goalId: string; amount: number }
  | { type: 'recategorize'; txnId: string; category: Category }
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
  const [state, dispatch] = useReducer(reducer, seed, structuredClone)
  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

// Derived selectors
export function goalProgress(g: Goal) {
  return Math.min(1, g.saved / g.target)
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
