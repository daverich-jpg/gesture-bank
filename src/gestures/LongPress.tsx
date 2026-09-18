import { useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { haptic } from '../lib/haptics'
import { spring } from '../lib/motion'

interface Props {
  children: ReactNode
  onAsk: () => void
  hint?: string
  duration?: number
  className?: string
}

/**
 * LongPress — "Ask the AI" about any object.
 * Press-and-hold reveals a radial fill; on completion it opens an AI query.
 * Accessible equivalent: a visible "Ask" affordance via context — we expose an
 * onDoubleClick and an aria-described secondary tap for keyboard users.
 */
export function LongPress({ children, onAsk, hint = 'Hold to ask AI', duration = 480, className = '' }: Props) {
  const timer = useRef<number | null>(null)
  const [pressing, setPressing] = useState(false)

  function start() {
    setPressing(true)
    haptic('select')
    timer.current = window.setTimeout(() => {
      haptic('commit')
      setPressing(false)
      onAsk()
    }, duration)
  }
  function cancel() {
    setPressing(false)
    if (timer.current) window.clearTimeout(timer.current)
  }

  return (
    <div
      className={`relative ${className}`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onContextMenu={(e) => {
        e.preventDefault()
        onAsk()
      }}
      role="button"
      tabIndex={0}
      aria-label={hint}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onAsk()
        }
      }}
    >
      {children}
      {pressing && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className="absolute left-0 bottom-0 h-[3px] origin-left rounded-full bg-accent w-full"
        />
      )}
      {pressing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={spring.crisp}
          className="absolute inset-0 rounded-[inherit] ring-1 ring-accent/40 pointer-events-none"
        />
      )}
    </div>
  )
}
