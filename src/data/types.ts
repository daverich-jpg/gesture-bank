export type Category =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'income'
  | 'transfer'
  | 'subscription'
  | 'health'

export interface Contact {
  id: string
  name: string
  handle: string
  bank: string
  avatarHue: number
}

export interface Txn {
  id: string
  title: string
  merchant: string
  amount: number // negative = outflow
  category: Category
  date: string // ISO
  note?: string
  recurring?: boolean
}

export interface Goal {
  id: string
  name: string
  emoji: string
  saved: number
  target: number
  hue: number
}

export interface AccountState {
  balance: number
  available: number
  goals: Goal[]
  txns: Txn[]
  contacts: Contact[]
}
