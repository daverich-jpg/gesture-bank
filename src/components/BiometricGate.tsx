import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { haptic } from '../lib/haptics'
import { spring } from '../lib/motion'

/**
 * Critical financial confirmation — a required, explicit control (not a gesture).
 * Simulates Face ID: press-and-hold the orb to authenticate.
 */
export function BiometricGate({ amount, to, onDone }: { amount: string; to: string; onDone: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle')

  useEffect(() => {
    if (phase !== 'scanning') return
    const t = setTimeout(() => {
      haptic('success')
      setPhase('done')
      setTimeout(onDone, 720)
    }, 1100)
    return () => clearTimeout(t)
  }, [phase, onDone])

  return (
    <div className="flex flex-col items-center text-center py-4">
      <p className="text-white/50 text-sm">Confirm transfer</p>
      <p className="mt-1 text-2xl font-semibold text-white">{amount}</p>
      <p className="text-white/50 text-sm mb-8">to {to}</p>

      <motion.button
        onPointerDown={() => { haptic('select'); setPhase('scanning') }}
        onPointerUp={() => phase === 'scanning' && setPhase('idle')}
        className="relative h-28 w-28 rounded-full grid place-items-center"
        aria-label="Hold to confirm with Face ID"
      >
        <motion.span
          className="absolute inset-0 rounded-full border-2"
          animate={{
            borderColor: phase === 'done' ? '#A3E635' : phase === 'scanning' ? '#A3E635' : 'rgba(255,255,255,0.2)',
            scale: phase === 'scanning' ? [1, 1.06, 1] : 1,
          }}
          transition={phase === 'scanning' ? { duration: 1, repeat: Infinity } : spring.crisp}
        />
        <motion.span
          className="grid place-items-center text-positive"
          animate={{ scale: phase === 'done' ? [1, 1.3, 1] : 1 }}
          transition={spring.crisp}
        >
          {phase === 'done' ? (
            <span className="text-3xl">✓</span>
          ) : (
            <FaceIdGlyph active={phase === 'scanning'} />
          )}
        </motion.span>
        {phase !== 'done' && (
          <span className="absolute -bottom-8 text-[12px] text-white/40">
            {phase === 'scanning' ? 'Authenticating…' : 'Hold to confirm'}
          </span>
        )}
      </motion.button>

      <div className="h-8" />
    </div>
  )
}

function FaceIdGlyph({ active }: { active: boolean }) {
  const c = active ? '#A3E635' : 'rgba(255,255,255,0.85)'
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <path d="M9 9v1.5M15 9v1.5M12 9v3.2c0 .5-.4.8-.9.8" />
      <path d="M9.2 14.6c1.5 1.1 4.1 1.1 5.6 0" />
    </svg>
  )
}
