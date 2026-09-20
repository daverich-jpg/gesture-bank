import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { spring } from '../lib/motion'
import { haptic } from '../lib/haptics'

/**
 * Just-in-time coaching. Each space shows ONE contextual tip the first time a
 * user lands on it — teaching the key gesture right where it's used, then
 * getting out of the way. Seen-state is persisted per tip in localStorage, so
 * nothing ever nags twice. This is additive UI only: no logic/nav/data changes.
 */

const KEY = (id: string) => `atlas.coach.${id}`

export function useSeen(id: string) {
  const [seen, setSeen] = useState<boolean>(() => {
    try { return localStorage.getItem(KEY(id)) === '1' } catch { return false }
  })
  const mark = () => {
    try { localStorage.setItem(KEY(id), '1') } catch { /* private mode */ }
    setSeen(true)
  }
  return { seen, mark }
}

// Clears every coaching flag — used by "replay tips".
export function resetCoaching() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('atlas.coach.'))
      .forEach((k) => localStorage.removeItem(k))
  } catch { /* ignore */ }
}

type Gesture = 'swipe' | 'drag' | 'tap' | 'hold' | 'type'

interface Props {
  id: string
  title: string
  body: ReactNode
  gesture?: Gesture
  /** Tailwind positioning classes for the callout, e.g. "bottom-[96px] inset-x-5". */
  place: string
  arrow?: 'up' | 'down' | 'none'
}

export function Coachmark({ id, title, body, gesture, place, arrow = 'down' }: Props) {
  const { seen, mark } = useSeen(id)
  if (seen) return null

  const dismiss = () => { haptic('tap'); mark() }

  return (
    <>
      {/* Light scrim — focuses attention, tap anywhere to dismiss. Doesn't cover the dock. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={dismiss}
        className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[1px]"
      />
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring.glass}
        className={`absolute z-50 rounded-[22px] border border-accent/30 bg-[#14170e] p-4 shadow-glow ${place}`}
      >
        {arrow !== 'none' && (
          <span
            className={`absolute h-3 w-3 rotate-45 border-accent/30 bg-[#14170e] ${
              arrow === 'down'
                ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r'
                : 'top-[-6px] left-1/2 -translate-x-1/2 border-l border-t'
            }`}
          />
        )}
        <div className="flex items-start gap-3">
          {gesture && <GestureAnim kind={gesture} />}
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-white">{title}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-white/60">{body}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={dismiss} className="rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-bold text-black active:scale-95 transition">
            Got it
          </button>
        </div>
      </motion.div>
    </>
  )
}

function GestureAnim({ kind }: { kind: Gesture }) {
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.05]" aria-hidden>
      {kind === 'swipe' && (
        <motion.div
          className="h-2.5 w-6 rounded-full bg-accent"
          animate={{ x: [6, -6, 6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {kind === 'drag' && (
        <motion.div
          className="h-5 w-5 rounded-full bg-gradient-to-br from-accent to-accent-soft"
          animate={{ x: [-5, 5, -5], y: [-5, 5, -5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {kind === 'tap' && (
        <div className="relative grid place-items-center">
          <motion.span className="absolute h-6 w-6 rounded-full border border-accent"
            animate={{ scale: [0.4, 1.4], opacity: [0.9, 0] }} transition={{ duration: 1.3, repeat: Infinity }} />
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </div>
      )}
      {kind === 'hold' && (
        <div className="relative grid place-items-center">
          <motion.span className="absolute h-7 w-7 rounded-full border-2 border-accent"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.05, 0.9] }} transition={{ duration: 1.4, repeat: Infinity }} />
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </div>
      )}
      {kind === 'type' && (
        <motion.span className="text-accent text-lg font-bold"
          animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>|</motion.span>
      )}
    </div>
  )
}
