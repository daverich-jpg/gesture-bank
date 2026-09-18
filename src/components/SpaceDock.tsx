import { motion } from 'framer-motion'
import { spring } from '../lib/motion'
import { haptic } from '../lib/haptics'
import { IconRobot, IconTrend, IconSaturn, IconCoins } from './icons'

export type Space = 'hub' | 'money' | 'savings' | 'insights'

const items: { id: Space; label: string; Icon: typeof IconRobot }[] = [
  { id: 'hub', label: 'Assistant', Icon: IconRobot },
  { id: 'money', label: 'Activity', Icon: IconTrend },
  { id: 'savings', label: 'Spaces', Icon: IconSaturn },
  { id: 'insights', label: 'Insights', Icon: IconCoins },
]

export function SpaceDock({ active, onChange }: { active: Space; onChange: (s: Space) => void }) {
  return (
    <div className="absolute bottom-0 inset-x-0 z-20 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3
                    bg-gradient-to-t from-black via-black/90 to-transparent">
      <div className="mx-auto flex max-w-[380px] items-center justify-between rounded-[28px]
                      border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-2">
        {items.map(({ id, label, Icon }) => {
          const on = active === id
          return (
            <button
              key={id}
              onClick={() => { haptic('tap'); onChange(id) }}
              className="relative flex-1 flex flex-col items-center gap-1 py-2.5 rounded-[22px]"
              aria-current={on}
              aria-label={label}
            >
              {on && (
                <motion.span
                  layoutId="dock-pill"
                  transition={spring.crisp}
                  className="absolute inset-0 rounded-[22px] bg-white/[0.07] ring-1 ring-white/[0.06]"
                />
              )}
              <span className={`relative ${on ? 'text-white' : 'text-white/40'}`}>
                <Icon size={22} />
              </span>
              <span className={`relative text-[10px] font-medium tracking-wide ${on ? 'text-white' : 'text-white/40'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
