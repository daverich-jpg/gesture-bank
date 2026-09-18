import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { spring, gesture, settle } from '../lib/motion'
import { haptic } from '../lib/haptics'

interface Props {
  children: ReactNode
  onConfirm: () => void
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  disabled?: boolean
}

/**
 * SwipeCard — the universal advance/dismiss primitive.
 * Swipe RIGHT to advance/confirm, LEFT to cancel/dismiss.
 * The card physically tracks the finger and reveals intent behind it.
 * Accessible equivalent: two buttons rendered beneath for keyboard / switch users.
 */
export function SwipeCard({
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Approve',
  cancelLabel = 'Cancel',
  disabled,
}: Props) {
  const x = useMotionValue(0)
  const [committed, setCommitted] = useState<'left' | 'right' | null>(null)

  const bg = useTransform(
    x,
    [-160, 0, 160],
    ['rgba(240,103,79,0.20)', 'rgba(255,255,255,0.02)', 'rgba(163,230,53,0.22)'],
  )
  const confirmOpacity = useTransform(x, [20, 110], [0, 1])
  const cancelOpacity = useTransform(x, [-110, -20], [1, 0])
  const rotate = useTransform(x, [-160, 160], [-4, 4])

  function commit(dir: 'left' | 'right') {
    if (disabled) return
    setCommitted(dir)
    haptic(dir === 'right' ? 'success' : 'warn')
    settle(x, dir === 'right' ? 520 : -520, spring.weighty).then(() => {
      dir === 'right' ? onConfirm() : onCancel?.()
    })
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    const past = Math.abs(info.offset.x) > gesture.swipeCommitX
    const fast = Math.abs(info.velocity.x) > gesture.swipeVelocity
    if ((past || fast) && info.offset.x > 0) return commit('right')
    if ((past || fast) && info.offset.x < 0 && onCancel) return commit('left')
    settle(x, 0)
  }

  return (
    <div className="relative">
      <motion.div
        style={{ background: bg }}
        className="absolute inset-0 rounded-xl2 flex items-center justify-between px-6 pointer-events-none"
      >
        <motion.span style={{ opacity: cancelOpacity }} className="text-negative text-sm font-medium">
          ✕ {cancelLabel}
        </motion.span>
        <motion.span style={{ opacity: confirmOpacity }} className="text-positive text-sm font-medium ml-auto">
          {confirmLabel} →
        </motion.span>
      </motion.div>

      <motion.div
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        style={{ x, rotate }}
        onDragEnd={onDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        className="relative touch-none"
        role="group"
        aria-label="Swipe right to approve, left to cancel"
      >
        {children}
      </motion.div>

      {/* Accessible equivalents — always present, visually quiet */}
      <div className="mt-3 flex gap-2" aria-hidden={committed !== null}>
        {onCancel && (
          <button
            onClick={() => commit('left')}
            className="flex-1 rounded-full py-2.5 text-sm text-white/60 bg-white/5 active:bg-white/10 transition"
          >
            {cancelLabel}
          </button>
        )}
        <button
          onClick={() => commit('right')}
          disabled={disabled}
          className="flex-1 rounded-full py-2.5 text-sm font-medium text-ink bg-white active:scale-[0.98] transition disabled:opacity-40"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  )
}
