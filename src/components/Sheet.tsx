import { motion, AnimatePresence, useMotionValue, type PanInfo } from 'framer-motion'
import type { ReactNode } from 'react'
import { spring, settle } from '../lib/motion'
import { haptic } from '../lib/haptics'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  dismissable?: boolean
}

export function Sheet({ open, onClose, children, dismissable = true }: Props) {
  const y = useMotionValue(0)

  function onDragEnd(_: unknown, info: PanInfo) {
    if (dismissable && (info.offset.y > 120 || info.velocity.y > 600)) {
      haptic('select')
      onClose()
    } else {
      settle(y, 0)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dismissable && onClose()}
            className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring.glass}
            drag={dismissable ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            style={{ y }}
            onDragEnd={onDragEnd}
            className="absolute inset-x-0 bottom-0 z-40 rounded-t-[34px] border-t border-white/[0.08]
                       bg-[#141414] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-float"
          >
            {dismissable && <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/20" />}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
