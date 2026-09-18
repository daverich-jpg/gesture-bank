import type { AccountState, Txn } from './types'

const now = new Date('2026-09-17T09:24:00')
const daysAgo = (d: number) => new Date(now.getTime() - d * 864e5).toISOString()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 36e5).toISOString()

const txns: Txn[] = [
  { id: 't1', title: 'Salary — Northwind Ltd', merchant: 'Northwind', amount: 840000, category: 'income', date: daysAgo(2) },
  { id: 't2', title: 'Jollof & Co', merchant: 'Jollof & Co', amount: -6400, category: 'food', date: hoursAgo(3) },
  { id: 't3', title: 'Bolt ride', merchant: 'Bolt', amount: -3200, category: 'transport', date: hoursAgo(6) },
  { id: 't4', title: 'Spotify Premium', merchant: 'Spotify', amount: -1900, category: 'subscription', date: daysAgo(1), recurring: true },
  { id: 't5', title: 'Shoprite', merchant: 'Shoprite', amount: -28450, category: 'shopping', date: daysAgo(1) },
  { id: 't6', title: 'PHCN prepaid units', merchant: 'PHCN', amount: -15000, category: 'bills', date: daysAgo(3) },
  { id: 't7', title: 'Netflix', merchant: 'Netflix', amount: -4400, category: 'subscription', date: daysAgo(4), recurring: true },
  { id: 't8', title: 'Chicken Republic', merchant: 'Chicken Republic', amount: -5200, category: 'food', date: daysAgo(4) },
  { id: 't9', title: 'Uber to airport', merchant: 'Uber', amount: -12800, category: 'transport', date: daysAgo(5) },
  { id: 't10', title: 'Pharmacy', merchant: 'HealthPlus', amount: -7600, category: 'health', date: daysAgo(6) },
  { id: 't11', title: 'Transfer to David', merchant: 'David O.', amount: -20000, category: 'transfer', date: daysAgo(7) },
  { id: 't12', title: 'Coffee — Cafe Neo', merchant: 'Cafe Neo', amount: -2800, category: 'food', date: daysAgo(8) },
]

export const seed: AccountState = {
  balance: 1284500,
  available: 1284500,
  txns,
  goals: [
    { id: 'g1', name: 'Emergency Fund', emoji: '🛟', saved: 240000, target: 600000, hue: 205 },
    { id: 'g2', name: 'Japan Trip', emoji: '🗾', saved: 180000, target: 1200000, hue: 342 },
    { id: 'g3', name: 'New Laptop', emoji: '💻', saved: 95000, target: 850000, hue: 152 },
    { id: 'g4', name: 'House Deposit', emoji: '🏠', saved: 1400000, target: 8000000, hue: 38 },
  ],
  contacts: [
    { id: 'c1', name: 'David O.', handle: '@david', bank: 'GTBank', avatarHue: 210 },
    { id: 'c2', name: 'Sarah M.', handle: '@sarahm', bank: 'Kuda', avatarHue: 330 },
    { id: 'c3', name: 'Tunde A.', handle: '@tunde', bank: 'Opay', avatarHue: 150 },
    { id: 'c4', name: 'Mum', handle: '@mum', bank: 'First Bank', avatarHue: 30 },
  ],
}
