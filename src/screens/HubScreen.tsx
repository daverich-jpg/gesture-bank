import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore, spentThisMonth } from '../data/store'
import { parseIntent, type Intent } from '../ai/intent'
import { renderIntentCard } from '../ai/cards'
import { useAi } from '../ai/AiProvider'
import { naira } from '../lib/format'
import { spring } from '../lib/motion'
import { haptic } from '../lib/haptics'
import { AtlasMark, RobotMascot, IconSend, IconGrid } from '../components/icons'

interface Msg { id: string; role: 'user' | 'ai'; text?: string; intent?: Intent }

const STARTERS = ['Send ₦20,000 to David', 'How much on food this month?', 'Move 10% into savings', 'Can I afford ₦150,000?']

export function HubScreen() {
  const { state } = useStore()
  const ai = useAi()
  const [thread, setThread] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [thread])

  function send(text: string) {
    const q = text.trim()
    if (!q) return
    haptic('tap')
    const intent = parseIntent(q, state)
    setThread((t) => [
      ...t,
      { id: 'u' + Date.now(), role: 'user', text: q },
      { id: 'a' + Date.now(), role: 'ai', intent },
    ])
    setInput('')
  }

  const spent = spentThisMonth(state)
  const health = Math.round(100 - (spent / state.balance) * 100)

  return (
    <div className="flex h-full flex-col">
      {/* Header: greeting + health */}
      <div className="px-6 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/[0.05] text-white/70">
              <IconGrid size={18} />
            </span>
            <p className="text-[17px] font-bold text-white tracking-tight">Good morning David</p>
          </div>
          <HealthPill score={health} />
        </div>

        <div className="mt-6 flex items-baseline gap-1.5">
          <span className="text-[30px] font-extrabold text-white/30 leading-none">₦</span>
          <p className="text-[46px] leading-none font-extrabold text-white tracking-tight">
            {balanceDigits(state.available)}
          </p>
        </div>
        <p className="mt-3 text-[13px] text-white/40">Available · {naira(state.balance)} total</p>
      </div>

      {/* Conversation / proactive area */}
      <div ref={scroller} className="hide-scroll mt-5 flex-1 overflow-y-auto px-4 pb-3">
        {thread.length === 0 ? (
          <ProactiveIntro onPick={send} spent={spent} />
        ) : (
          <div className="space-y-3">
            {thread.map((m) => (
              <MessageBubble key={m.id} msg={m} onTransfer={ai.requestTransfer} onRefine={send} />
            ))}
          </div>
        )}
      </div>

      {/* Composer — extra bottom gap keeps it clear of the nav dock */}
      <div className="px-4 pb-[120px] pt-1">
        <div className="flex items-center gap-2 rounded-[26px] border border-white/[0.06] bg-white/[0.05] px-3 py-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Ask Atlas anything…"
            className="flex-1 bg-transparent pl-1 text-[15px] text-white placeholder:text-white/40 outline-none"
            aria-label="Ask the AI assistant"
          />
          <button
            onClick={() => send(input)}
            className="grid h-11 w-11 place-items-center rounded-full bg-accent text-black shadow-glow active:scale-95 transition"
            aria-label="Send"
          >
            <IconSend size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Splits a naira amount so the fractional part could render smaller if desired;
// here it keeps the exact integer figure from the data model (unchanged).
function balanceDigits(amount: number) {
  return amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })
}

function HealthPill({ score }: { score: number }) {
  const tone = score > 70 ? 'text-accent' : score > 45 ? 'text-amber-300' : 'text-negative'
  const dot = score > 70 ? 'bg-accent' : score > 45 ? 'bg-amber-300' : 'bg-negative'
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1.5 ring-1 ring-white/[0.06]">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className={`text-[12px] font-bold ${tone}`}>{score}</span>
      <span className="text-[11px] text-white/40">health</span>
    </div>
  )
}

function ProactiveIntro({ onPick, spent }: { onPick: (s: string) => void; spent: number }) {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.soft}
        className="rounded-[26px] bg-white/[0.05] p-4"
      >
        <div className="flex gap-3">
          <RobotMascot size={44} />
          <p className="text-[14.5px] text-white/85 leading-relaxed">
            I noticed you're spending <b className="text-white">12% less</b> than last month — nice, but two
            subscriptions renew this week ({naira(6300)}). Want me to review them?
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 pl-[56px]">
          <button onClick={() => onPick('review my subscriptions')} className="rounded-full bg-white text-black px-5 py-2 text-[13px] font-semibold active:scale-95 transition">Review</button>
          <button className="px-2 text-[13px] text-white/45">Not now</button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2.5">
        {STARTERS.map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.soft, delay: 0.05 * i }}
            onClick={() => onPick(s)}
            className="flex min-h-[62px] items-center justify-center rounded-[24px] border border-white/[0.12] px-4 text-center text-[13px] leading-snug text-white/80 active:bg-white/[0.05] transition"
          >
            {s}
          </motion.button>
        ))}
      </div>
      <p className="px-2 text-[11px] text-white/25">Spent this month · {naira(spent)}</p>
    </div>
  )
}

function MessageBubble({ msg, onTransfer, onRefine }: { msg: Msg; onTransfer: (a: number, t: string) => void; onRefine: (s: string) => void }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-[20px] rounded-br-md bg-accent text-black px-4 py-2.5 text-[14px] font-medium">{msg.text}</div>
      </div>
    )
  }
  const intent = msg.intent!
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring.soft} className="space-y-2.5">
      <div className="flex items-start gap-2.5">
        <AtlasMark size={26} className="mt-0.5 shrink-0" />
        <p className="text-[14px] text-white/85 leading-relaxed">{answerFor(intent)}</p>
      </div>
      {renderIntentCard(intent, { onTransfer, dismiss: () => {} })}
      {intent.kind === 'clarify' && (
        <div className="flex flex-wrap gap-2 pl-9">
          {intent.suggestions.map((s) => (
            <button key={s} onClick={() => onRefine(s)} className="rounded-full border border-white/[0.12] px-3.5 py-1.5 text-[12.5px] text-white/75 active:bg-white/[0.05]">{s}</button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function answerFor(intent: Intent): string {
  switch (intent.kind) {
    case 'transfer': return intent.explain
    case 'allocate': return intent.explain
    case 'spendQuery': return intent.answer
    case 'affordability': return intent.verdict
    case 'insight': return intent.answer
    case 'clarify': return intent.answer
  }
}
