import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, type PanInfo } from 'framer-motion'
import { useStore } from '../data/store'
import { useAi } from '../ai/AiProvider'
import { LongPress } from '../gestures/LongPress'
import { CategoryIcon, catLabel } from '../components/atoms'
import { naira } from '../lib/format'
import { spring, settle } from '../lib/motion'
import { haptic } from '../lib/haptics'
import type { Txn, Category } from '../data/types'

const CATS: Category[] = ['food', 'transport', 'shopping', 'bills', 'subscription', 'health', 'transfer']

export function MoneyScreen() {
  const { state } = useStore()
  const groups = useMemo(() => groupByDay(state.txns), [state.txns])

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-3 pb-4">
        <h1 className="text-[30px] font-extrabold text-white tracking-tight">Activity</h1>
        <p className="mt-1 text-[13px] text-white/40">Swipe any item to recategorize · hold to ask Atlas</p>
      </div>
      <div className="hide-scroll flex-1 overflow-y-auto px-4 pb-[100px]">
        {groups.map(([day, items]) => (
          <div key={day} className="mb-5">
            <p className="px-2 pb-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/35">{day}</p>
            <div className="space-y-2.5">
              {items.map((t) => <TxnRow key={t.id} t={t} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TxnRow({ t }: { t: Txn }) {
  const { dispatch } = useStore()
  const ai = useAi()
  const [expanded, setExpanded] = useState(false)
  const [picking, setPicking] = useState(false)
  const x = useMotionValue(0)

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -70) {
      haptic('select')
      setPicking(true)
    }
    settle(x, 0)
  }

  return (
    <div>
      {/* Row + swipe reveal live in their own layer so the reveal never
          stretches over the expanded detail below. */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-end rounded-[22px] bg-accent/15 pr-5 text-[12px] font-medium text-accent">
          Recategorize
        </div>

        <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.4} style={{ x }} onDragEnd={onDragEnd} className="relative touch-pan-y">
          <LongPress
            onAsk={() => ai.ask(`Explain this purchase: ${t.title} for ${naira(Math.abs(t.amount))}. Why this amount?`)}
            hint={`Ask Atlas about ${t.title}`}
          >
            <button
              onClick={() => { haptic('tap'); setExpanded((e) => !e) }}
              className="flex w-full items-center gap-3.5 rounded-[22px] bg-[#171717] px-3.5 py-3.5 text-left active:bg-[#1f1f1f] transition"
            >
              <CategoryIcon c={t.category} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-white/90">{t.title}</p>
                <p className="text-[12px] text-white/40">{catLabel(t.category)}{t.recurring ? ' · recurring' : ''}</p>
              </div>
              <span className={`text-[14.5px] font-medium ${t.amount > 0 ? 'text-positive' : 'text-white/85'}`}>
                {naira(t.amount, { sign: true })}
              </span>
            </button>
          </LongPress>
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring.soft} className="overflow-hidden">
            <div className="mx-1 mt-1.5 rounded-2xl bg-[#151515] p-3 text-[12.5px] text-white/60">
              <div className="flex justify-between py-0.5"><span>Date</span><span className="text-white/80">{new Date(t.date).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
              <div className="flex justify-between py-0.5"><span>Merchant</span><span className="text-white/80">{t.merchant}</span></div>
              <div className="flex justify-between py-0.5"><span>Category</span><span className="text-white/80">{catLabel(t.category)}</span></div>
              <button onClick={() => ai.ask(`Explain this purchase: ${t.title}`)} className="mt-2 w-full rounded-full bg-white/[0.06] py-2 text-[12.5px] text-accent active:bg-white/10">Ask Atlas about this</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {picking && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring.soft} className="overflow-hidden">
            <div className="mx-1 mt-1.5 flex flex-wrap gap-1.5 rounded-2xl bg-[#151515] p-2.5">
              {CATS.map((c) => (
                <button key={c} onClick={() => { haptic('commit'); dispatch({ type: 'recategorize', txnId: t.id, category: c }); setPicking(false) }}
                  className={`rounded-full px-3 py-1.5 text-[12px] transition ${c === t.category ? 'bg-white text-ink' : 'bg-white/[0.06] text-white/70 active:bg-white/10'}`}>
                  {catLabel(c)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function groupByDay(txns: Txn[]): [string, Txn[]][] {
  const fmt = (iso: string) => {
    const d = new Date(iso)
    const today = new Date('2026-09-17')
    const diff = Math.floor((+today - +new Date(d.toDateString())) / 864e5)
    if (diff <= 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'short' })
  }
  const map = new Map<string, Txn[]>()
  for (const t of txns) {
    const k = fmt(t.date)
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(t)
  }
  return [...map.entries()]
}
