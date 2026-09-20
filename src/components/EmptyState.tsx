import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { spring } from '../lib/motion'

/**
 * A friendly empty state: says what the page is for, why it matters, and offers
 * one clear next action. Fills the available space and centres itself.
 */
export function EmptyState({
  icon, title, body, cta, onCta, secondary,
}: {
  icon: ReactNode
  title: string
  body: string
  cta?: string
  onCta?: () => void
  secondary?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.soft}
      className="flex flex-1 flex-col items-center justify-center px-8 pb-[110px] text-center"
    >
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]">
        {icon}
      </div>
      <h2 className="text-[19px] font-extrabold tracking-tight text-white">{title}</h2>
      <p className="mt-2 max-w-[290px] text-[13.5px] leading-relaxed text-white/50">{body}</p>
      {cta && (
        <button
          onClick={onCta}
          className="mt-6 rounded-full bg-accent px-6 py-3 text-[14px] font-bold text-black shadow-glow active:scale-[0.98] transition"
        >
          {cta}
        </button>
      )}
      {secondary && <div className="mt-4">{secondary}</div>}
    </motion.div>
  )
}
