import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Intent } from './intent'
import { naira } from '../lib/format'
import { Avatar, CategoryIcon, catLabel } from '../components/atoms'
import { SwipeCard } from '../gestures/SwipeCard'
import { ExpandCard } from '../gestures/ExpandCard'
import { useStore } from '../data/store'
import { spring } from '../lib/motion'
import type { Category } from '../data/types'
import { AtlasMark } from '../components/icons'

/** Transfer card — swipe right to approve, which triggers the biometric gate. */
export function TransferCard({
  amount,
  to,
  onApprove,
  onCancel,
}: {
  amount: number
  to: string
  onApprove: () => void
  onCancel: () => void
}) {
  const { state } = useStore()
  const contact = state.contacts.find((c) => c.name.toLowerCase().startsWith(to.toLowerCase()))
  return (
    <SwipeCard confirmLabel="Approve" cancelLabel="Cancel" onConfirm={onApprove} onCancel={onCancel}>
      <div className="rounded-[24px] bg-white/[0.05] ring-1 ring-white/[0.06] p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-widest text-white/40">Transfer</span>
          <span className="text-[11px] text-white/40">Instant · Free</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Avatar name={contact?.name ?? to} hue={contact?.avatarHue ?? 210} size={46} />
          <div className="min-w-0">
            <p className="text-white font-medium truncate">{contact?.name ?? to}</p>
            <p className="text-white/45 text-[13px] truncate">
              {contact ? `${contact.handle} · ${contact.bank}` : 'New recipient'}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-semibold text-white tracking-tight">{naira(amount)}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2">
          <AtlasMark size={18} />
          <p className="text-[12.5px] text-white/55 leading-snug">
            Leaves {naira(state.available - amount)} available. Within your usual range for {contact?.name ?? to}.
          </p>
        </div>
      </div>
    </SwipeCard>
  )
}

/** Affordability verdict — calm yes/no with reasoning. */
export function AffordabilityCard({ amount, ok, verdict }: { amount: number; ok: boolean; verdict: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.soft}
      className="rounded-[24px] bg-white/[0.05] ring-1 ring-white/[0.06] p-5"
    >
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${ok ? 'bg-positive' : 'bg-negative'}`} />
        <span className="text-white font-medium">{ok ? 'Comfortable' : 'Tight'} — {naira(amount)}</span>
      </div>
      <p className="mt-2 text-[13.5px] text-white/60 leading-relaxed">{verdict}</p>
    </motion.div>
  )
}

/** Spend breakdown — tap to reveal per-category detail. */
export function SpendCard({ answer, breakdown }: { answer: string; breakdown: [string, number][] }) {
  const total = breakdown.reduce((s, [, v]) => s + v, 0)
  return (
    <div className="rounded-[24px] bg-white/[0.05] ring-1 ring-white/[0.06] p-5">
      <ExpandCard
        label="category breakdown"
        summary={
          <div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/5">
              {breakdown.map(([c, v], i) => (
                <div key={c} style={{ width: `${(v / total) * 100}%`, background: `hsl(${(i * 47) % 360} 60% 58%)` }} />
              ))}
            </div>
            <p className="mt-3 text-[13.5px] text-white/65 leading-relaxed">{answer}</p>
          </div>
        }
        detail={
          <div className="space-y-2.5">
            {breakdown.map(([c, v]) => (
              <div key={c} className="flex items-center gap-3">
                <CategoryIcon c={c as Category} size={32} />
                <span className="text-[13px] text-white/70">{catLabel(c as Category)}</span>
                <span className="ml-auto text-[13px] text-white/90">{naira(v)}</span>
              </div>
            ))}
          </div>
        }
      />
    </div>
  )
}

/** Allocate card — confirm moving money into a goal by swipe. */
export function AllocateCard({
  amount,
  goalHint,
  onDone,
}: {
  amount: number
  goalHint?: string
  onDone: () => void
}) {
  const { state, dispatch } = useStore()
  const [done, setDone] = useState(false)
  const goal = state.goals.find((g) => g.name === goalHint) ?? state.goals[0]

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[22px] bg-accent/10 ring-1 ring-accent/30 p-4 text-[13.5px] text-accent">
        ✓ Moved {naira(amount)} into {goal.emoji} {goal.name}.
      </motion.div>
    )
  }

  return (
    <SwipeCard
      confirmLabel="Move to savings"
      cancelLabel="Not now"
      onConfirm={() => { dispatch({ type: 'allocate', goalId: goal.id, amount }); setDone(true); onDone() }}
      onCancel={onDone}
    >
      <div className="rounded-[24px] bg-white/[0.05] ring-1 ring-white/[0.06] p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full text-xl" style={{ background: `hsl(${goal.hue} 45% 22%)` }}>{goal.emoji}</div>
          <div>
            <p className="text-white font-medium">{goal.name}</p>
            <p className="text-white/45 text-[13px]">{naira(goal.saved)} of {naira(goal.target)}</p>
          </div>
          <p className="ml-auto text-xl font-semibold text-white">+{naira(amount)}</p>
        </div>
      </div>
    </SwipeCard>
  )
}

export function renderIntentCard(intent: Intent, handlers: { onTransfer: (a: number, t: string) => void; dismiss: () => void }) {
  switch (intent.kind) {
    case 'transfer':
      return <TransferCard amount={intent.amount} to={intent.to} onApprove={() => handlers.onTransfer(intent.amount, intent.to)} onCancel={handlers.dismiss} />
    case 'affordability':
      return <AffordabilityCard amount={intent.amount} ok={intent.ok} verdict={intent.verdict} />
    case 'spendQuery':
      return <SpendCard answer={intent.answer} breakdown={intent.breakdown} />
    case 'allocate':
      return <AllocateCard amount={intent.amount} goalHint={intent.goalHint} onDone={handlers.dismiss} />
    default:
      return null
  }
}
