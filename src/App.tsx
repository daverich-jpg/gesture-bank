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
import { Onboarding } from './onboarding/Onboarding'
import { ease } from './lib/motion'

const ONBOARDED_KEY = 'atlas.onboarded'

export default function App() {
  // A brand-new user starts in onboarding; completing it hands off to the app.
  // The flag is persisted per-device, so returning users skip straight to Home.
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    try { return localStorage.getItem(ONBOARDED_KEY) === '1' } catch { return false }
  })

  function complete() {
    try { localStorage.setItem(ONBOARDED_KEY, '1') } catch { /* private mode — fall back to in-memory */ }
    setOnboarded(true)
  }

  return (
    <StoreProvider>
      <PhoneShell>
        {onboarded ? <MainApp /> : <Onboarding onDone={complete} />}
      </PhoneShell>
    </StoreProvider>
  )
}

const order: Space[] = ['hub', 'money', 'savings', 'insights']

function MainApp() {
  const [space, setSpace] = useState<Space>('hub')
  const [prev, setPrev] = useState<Space>('hub')
  const dir = order.indexOf(space) >= order.indexOf(prev) ? 1 : -1

  function go(s: Space) {
    setPrev(space)
    setSpace(s)
  }

  return (
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
  )
}
