import { useState } from 'react'
import { motion } from 'framer-motion'
import { PhoneShell } from './components/PhoneShell'
import { SpaceDock, type Space } from './components/SpaceDock'
import { StoreProvider } from './data/store'
import { AiProvider } from './ai/AiProvider'
import { HubScreen } from './screens/HubScreen'
import { MoneyScreen } from './screens/MoneyScreen'
import { SavingsScreen } from './screens/SavingsScreen'
import { InsightsScreen } from './screens/InsightsScreen'
import { ease } from './lib/motion'

const order: Space[] = ['hub', 'money', 'savings', 'insights']

export default function App() {
  const [space, setSpace] = useState<Space>('hub')
  const [prev, setPrev] = useState<Space>('hub')
  const dir = order.indexOf(space) >= order.indexOf(prev) ? 1 : -1

  function go(s: Space) {
    setPrev(space)
    setSpace(s)
  }

  return (
    <StoreProvider>
      <PhoneShell>
        <AiProvider>
          <div className="relative flex h-full flex-col">
            {/* Top safe-area inset — clears the device's own status bar / notch.
                No fake time/status bar: the OS renders the real one. */}
            <div className="h-[max(14px,env(safe-area-inset-top))] shrink-0" />
            <div className="relative flex-1 overflow-hidden">
              {/* Keyed screen: changing `space` unmounts the old screen instantly
                  and animates the new one in. No exit overlap → no deadlock. */}
              <motion.div
                key={space}
                initial={{ opacity: 0, x: dir * 22 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.26, ease: ease.standard }}
                className="absolute inset-0"
                style={{ background: 'radial-gradient(120% 70% at 50% -15%, #141414 0%, #060606 50%, #000000 100%)' }}
              >
                {space === 'hub' && <HubScreen />}
                {space === 'money' && <MoneyScreen />}
                {space === 'savings' && <SavingsScreen />}
                {space === 'insights' && <InsightsScreen />}
              </motion.div>
            </div>
            <SpaceDock active={space} onChange={go} />
          </div>
        </AiProvider>
      </PhoneShell>
    </StoreProvider>
  )
}
