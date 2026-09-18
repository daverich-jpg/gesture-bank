import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { spring } from '../lib/motion'
import { haptic } from '../lib/haptics'

interface Props {
  summary: ReactNode
  detail: ReactNode
  label?: string
}

/**
 * ExpandCard — a standard, discoverable disclosure (tap to expand / collapse).
 * The whole summary is tappable and a clearly-labelled control with a chevron
 * makes the affordance obvious. No hidden gesture required.
 */
export function ExpandCard({ summary, detail, label = 'details' }: Props) {
  const [open, setOpen] = useState(false)
  const toggle = () => { haptic('tap'); setOpen((o) => !o) }

  return (
    <div className="select-none">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() } }}
        className="cursor-pointer"
      >
        {summary}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring.soft}
            className="overflow-hidden"
          >
            <div className="pt-4">{detail}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggle}
        className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-full bg-white/[0.05] py-2
                   text-[12.5px] font-medium text-white/60 active:bg-white/[0.09] active:text-white/80 transition"
        aria-expanded={open}
      >
        {open ? `Hide ${label}` : `View ${label}`}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring.crisp} className="leading-none">⌄</motion.span>
      </button>
    </div>
  )
}
