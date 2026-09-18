import { useRef, useState } from 'react'
import { motion, useMotionValue, type PanInfo } from 'framer-motion'
import { useStore, goalProgress } from '../data/store'
import { useAi } from '../ai/AiProvider'
import { LongPress } from '../gestures/LongPress'
import { ProgressRing } from '../components/atoms'
import { naira, shortNaira } from '../lib/format'
import { spring, settle } from '../lib/motion'
import { haptic } from '../lib/haptics'
import type { Goal } from '../data/types'

const STEPS = [5000, 10000, 25000, 50000]

export function SavingsScreen() {
  const { state, dispatch } = useStore()
  const ai = useAi()
  const [amount, setAmount] = useState(10000)
  const [hover, setHover] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const goalRefs = useRef<Map<string, HTMLElement>>(new Map())
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  function hitTest(point: { x: number; y: number }): string | null {
    for (const [id, el] of goalRefs.current) {
      const r = el.getBoundingClientRect()
      if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) return id
    }
    return null
  }

  function onDrag(_: unknown, info: PanInfo) {
    const id = hitTest(info.point)
    if (id !== hover) { setHover(id); if (id) haptic('select') }
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    const id = hitTest(info.point)
    if (id) {
      haptic('commit')
      dispatch({ type: 'allocate', goalId: id, amount })
      setFlash(id)
      setTimeout(() => setFlash(null), 900)
    }
    setHover(null)
    settle(x, 0, spring.weighty)
    settle(y, 0, spring.weighty)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-3 pb-2">
        <h1 className="text-[30px] font-extrabold text-white tracking-tight">Spaces</h1>
        <p className="mt-1 text-[13px] text-white/40">Drag the coin onto a goal · hold a goal to ask Atlas</p>
      </div>

      {/* Editable contribution amount + draggable money coin */}
      <div className="relative px-6 pb-3">
        <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-widest text-white/40">Contribution amount</p>
            <p className="text-[11px] text-white/40">Available {naira(state.available)}</p>
          </div>

          {/* Editable amount field */}
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[22px] font-extrabold text-white/35 leading-none">₦</span>
            <input
              inputMode="numeric"
              value={amount ? amount.toLocaleString('en-NG') : ''}
              onChange={(e) => {
                const n = parseInt(e.target.value.replace(/\D/g, '') || '0', 10)
                setAmount(Math.min(n, state.available))
              }}
              placeholder="0"
              aria-label="Contribution amount"
              className="w-full min-w-0 bg-transparent text-[28px] font-extrabold tracking-tight text-white outline-none placeholder:text-white/25"
            />
          </div>

          {/* Quick presets */}
          <div className="mt-3 flex gap-1.5">
            {STEPS.map((s) => (
              <button key={s} onClick={() => { haptic('tap'); setAmount(s) }}
                className={`flex-1 rounded-full py-1.5 text-[12px] font-medium transition ${amount === s ? 'bg-white text-ink' : 'bg-white/[0.06] text-white/60 active:bg-white/10'}`}>
                {shortNaira(s)}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          drag
          dragSnapToOrigin
          style={{ x, y }}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          whileDrag={{ scale: 1.1, zIndex: 50 }}
          className="relative z-20 mx-auto mt-4 grid h-24 w-24 cursor-grab touch-none place-items-center rounded-full
                     bg-gradient-to-br from-accent to-accent-soft text-ink shadow-glow active:cursor-grabbing"
          aria-label={`Drag ${naira(amount)} onto a goal`}
        >
          <div className="text-center leading-tight">
            <p className="text-[11px] font-medium opacity-70">move</p>
            <p className="text-[17px] font-extrabold tracking-tight">{shortNaira(amount)}</p>
          </div>
        </motion.div>
        <p className="mt-2 text-center text-[11px] text-white/30">drag me onto a goal ↓</p>
      </div>

      {/* Goals grid = drop zones */}
      <div className="hide-scroll flex-1 overflow-y-auto px-4 pb-[96px]">
        <div className="grid grid-cols-2 gap-3">
          {state.goals.map((g) => (
            <GoalCard
              key={g.id}
              g={g}
              hovered={hover === g.id}
              flash={flash === g.id}
              onAsk={() => ai.ask(`How can I reach my ${g.name} goal faster? I've saved ${naira(g.saved)} of ${naira(g.target)}.`)}
              onWithdraw={() => dispatch({ type: 'withdrawGoal', goalId: g.id, amount })}
              register={(el) => { if (el) goalRefs.current.set(g.id, el); else goalRefs.current.delete(g.id) }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function GoalCard({ g, hovered, flash, onAsk, onWithdraw, register }: {
  g: Goal; hovered: boolean; flash: boolean; onAsk: () => void; onWithdraw: () => void; register: (el: HTMLElement | null) => void
}) {
  const p = goalProgress(g)
  return (
    <LongPress onAsk={onAsk} hint={`Ask Atlas about ${g.name}`} className="rounded-2xl">
      <motion.div
        ref={register as any}
        animate={{
          scale: hovered ? 1.03 : 1,
          boxShadow: hovered ? `0 0 0 2px hsl(${g.hue} 70% 62%)` : '0 0 0 1px rgba(255,255,255,0.08)',
        }}
        transition={spring.crisp}
        className="relative overflow-hidden rounded-2xl bg-white/[0.04] p-3.5"
        style={{ background: `linear-gradient(160deg, hsl(${g.hue} 40% 16%), rgba(255,255,255,0.02))` }}
      >
        {flash && (
          <motion.div initial={{ opacity: 0.8, scale: 0.6 }} animate={{ opacity: 0, scale: 1.4 }} transition={{ duration: 0.9 }}
            className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: `hsl(${g.hue} 70% 60% / 0.4)` }} />
        )}
        <div className="flex items-center justify-between">
          <span className="text-2xl">{g.emoji}</span>
          <div className="relative grid place-items-center">
            <ProgressRing value={p} hue={g.hue} size={44} />
            <span className="absolute text-[10px] font-medium text-white/80">{Math.round(p * 100)}%</span>
          </div>
        </div>
        <p className="mt-2 text-[13.5px] font-medium text-white">{g.name}</p>
        <p className="text-[11.5px] text-white/50">{naira(g.saved)} <span className="text-white/30">/ {shortNaira(g.target)}</span></p>
        <button onClick={onWithdraw} className="mt-2 text-[10.5px] text-white/35 active:text-white/60" aria-label={`Withdraw from ${g.name}`}>↩ withdraw</button>
      </motion.div>
    </LongPress>
  )
}
