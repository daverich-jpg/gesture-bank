import { createContext, useContext, useState, type ReactNode } from 'react'
import { Sheet } from '../components/Sheet'
import { BiometricGate } from '../components/BiometricGate'
import { parseIntent, type Intent } from './intent'
import { renderIntentCard } from './cards'
import { useStore } from '../data/store'
import { naira } from '../lib/format'
import { motion } from 'framer-motion'
import { AtlasMark } from '../components/icons'

interface AiApi {
  /** Contextual "ask the AI" — used by long-press across the app. */
  ask: (prompt: string) => void
  /** Begin a transfer: opens the required biometric confirmation. */
  requestTransfer: (amount: number, to: string) => void
}

const Ctx = createContext<AiApi | null>(null)

export function AiProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useStore()
  const [ask, setAsk] = useState<{ prompt: string; intent: Intent } | null>(null)
  const [transfer, setTransfer] = useState<{ amount: number; to: string; done?: boolean } | null>(null)

  const api: AiApi = {
    ask: (prompt) => setAsk({ prompt, intent: parseIntent(prompt, state) }),
    requestTransfer: (amount, to) => setTransfer({ amount, to }),
  }

  function completeTransfer() {
    if (!transfer) return
    dispatch({ type: 'transfer', to: transfer.to, amount: transfer.amount })
    setTransfer((t) => (t ? { ...t, done: true } : t))
    setTimeout(() => setTransfer(null), 1400)
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
