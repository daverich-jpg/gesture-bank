import { createContext, useContext, useState, type ReactNode } from 'react'
import { Sheet } from '../components/Sheet'
import { BiometricGate } from '../components/BiometricGate'
import { parseIntent, type Intent } from './intent'
import { renderIntentCard } from './cards'
import { useStore } from '../data/store'
import { naira, shortNaira } from '../lib/format'
import { motion } from 'framer-motion'
import { AtlasMark, RobotMascot } from '../components/icons'

interface AiApi {
  /** Contextual "ask the AI" — used by long-press across the app. */
  ask: (prompt: string) => void
  /** Begin a transfer: opens the required biometric confirmation. */
  requestTransfer: (amount: number, to: string) => void
  /** Open the "Add money" sheet — the new user's first successful action. */
  addMoney: () => void
}

const Ctx = createContext<AiApi | null>(null)

const FUND_PRESETS = [5000, 20000, 100000, 250000]

export function AiProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useStore()
  const [ask, setAsk] = useState<{ prompt: string; intent: Intent } | null>(null)
  const [transfer, setTransfer] = useState<{ amount: number; to: string; done?: boolean } | null>(null)
  const [fund, setFund] = useState<{ done?: number } | null>(null)

  const api: AiApi = {
    ask: (prompt) => setAsk({ prompt, intent: parseIntent(prompt, state) }),
    requestTransfer: (amount, to) => setTransfer({ amount, to }),
    addMoney: () => setFund({}),
  }

  function completeTransfer() {
    if (!transfer) return
    dispatch({ type: 'transfer', to: transfer.to, amount: transfer.amount })
    setTransfer((t) => (t ? { ...t, done: true } : t))
    setTimeout(() => setTransfer(null), 1400)
  }

  function doFund(amount: number) {
    dispatch({ type: 'fund', amount })
    setFund({ done: amount })
    setTimeout(() => setFund(null), 1300)
  }

  return (
    <Ctx.Provider value={api}>
      {children}

      {/* Contextual AI answer sheet (long-press target) */}
      <Sheet open={!!ask} onClose={() => setAsk(null)}>
        {ask && (
          <div className="pb-2">
            <div className="flex items-center gap-2 mb-3">
              <AtlasMark size={22} />
              <span className="text-[12px] uppercase tracking-widest text-white/45">Atlas</span>
            </div>
            <p className="text-white/80 text-[14px] leading-relaxed mb-4">
              {answerText(ask.intent)}
            </p>
            {renderIntentCard(ask.intent, {
              onTransfer: (a, t) => { setAsk(null); api.requestTransfer(a, t) },
              dismiss: () => setAsk(null),
            })}
            {ask.intent.kind === 'clarify' && (
              <div className="flex flex-wrap gap-2">
                {ask.intent.suggestions.map((s) => (
                  <button key={s} onClick={() => setAsk({ prompt: s, intent: parseIntent(s, state) })}
                    className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[12.5px] text-white/70 active:bg-white/10">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* Required biometric confirmation for money movement */}
      <Sheet open={!!transfer} onClose={() => !transfer?.done && setTransfer(null)} dismissable={!transfer?.done}>
        {transfer && !transfer.done && (
          <BiometricGate amount={naira(transfer.amount)} to={transfer.to} onDone={completeTransfer} />
        )}
        {transfer?.done && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-positive/15 text-positive text-3xl">✓</div>
            <p className="mt-4 text-white font-medium">{naira(transfer.amount)} sent</p>
            <p className="text-white/50 text-sm">to {transfer.to}</p>
          </motion.div>
        )}
      </Sheet>

      {/* Add money — the new user's first successful action */}
      <Sheet open={!!fund} onClose={() => !fund?.done && setFund(null)} dismissable={!fund?.done}>
        {fund && !fund.done && (
          <div className="pb-2">
            <div className="flex items-center gap-3">
              <RobotMascot size={40} />
              <div>
                <p className="text-[15px] font-bold text-white">Add money</p>
                <p className="text-[12.5px] text-white/50">Fund your account to start using Atlas.</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {FUND_PRESETS.map((amt) => (
                <button key={amt} onClick={() => doFund(amt)}
                  className="rounded-2xl border border-white/[0.1] bg-white/[0.03] py-4 text-[17px] font-extrabold text-white active:bg-white/[0.07] transition">
                  {shortNaira(amt)}
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-[11px] text-white/30">Demo top-up · no real money moves</p>
          </div>
        )}
        {fund?.done && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-accent/15 text-accent text-3xl">✓</div>
            <p className="mt-4 text-white font-medium">{naira(fund.done)} added</p>
            <p className="text-white/50 text-sm">Your account is ready to go.</p>
          </motion.div>
        )}
      </Sheet>
    </Ctx.Provider>
  )
}

function answerText(intent: Intent): string {
  switch (intent.kind) {
    case 'transfer': return intent.explain
    case 'allocate': return intent.explain
    case 'spendQuery': return intent.answer
    case 'affordability': return intent.verdict
    case 'insight': return intent.answer
    case 'clarify': return intent.answer
  }
}

export function useAi() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAi must be inside AiProvider')
  return ctx
}
