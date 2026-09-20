import { useStore, spentByCategory, spentThisMonth } from '../data/store'
import { useAi } from '../ai/AiProvider'
import { ExpandCard } from '../gestures/ExpandCard'
import { LongPress } from '../gestures/LongPress'
import { CategoryIcon, catLabel } from '../components/atoms'
import { naira } from '../lib/format'
import { motion } from 'framer-motion'
import { spring } from '../lib/motion'
import type { Category } from '../data/types'
import { AtlasMark } from '../components/icons'
import { Coachmark } from '../onboarding/coach'

export function InsightsScreen() {
  const { state } = useStore()
  const ai = useAi()
  const total = spentThisMonth(state)
  const byCat = spentByCategory(state)
  const subs = state.txns.filter((t) => t.recurring)
  const subTotal = subs.reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-3 pb-4">
        <h1 className="text-[30px] font-extrabold text-white tracking-tight">Insights</h1>
        <p className="mt-1 text-[13px] text-white/40">Tap a card to expand · hold to ask</p>
      </div>

      <div className="hide-scroll flex-1 space-y-3 overflow-y-auto px-4 pb-[96px]">
        {/* Spending trends */}
        <InsightShell hue={205} title="Spending this month" onAsk={() => ai.ask('How much did I spend this month?')}>
          <ExpandCard
            label="category breakdown"
            summary={
              <div>
                <p className="text-[26px] font-semibold text-white tracking-tight">{naira(total)}</p>
                <p className="text-[12.5px] text-positive">↓ 12% vs last month</p>
                <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white/5">
                  {byCat.map(([c, v], i) => (
                    <div key={c} style={{ width: `${(v / total) * 100}%`, background: `hsl(${(i * 47) % 360} 60% 58%)` }} />
                  ))}
                </div>
              </div>
            }
            detail={
              <div className="space-y-2">
                {byCat.map(([c, v]) => (
                  <div key={c} className="flex items-center gap-3">
                    <CategoryIcon c={c as Category} size={30} />
                    <span className="text-[13px] text-white/70">{catLabel(c as Category)}</span>
                    <div className="ml-auto text-right">
                      <span className="text-[13px] text-white/90">{naira(v)}</span>
                      <span className="ml-2 text-[11px] text-white/35">{Math.round((v / total) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            }
          />
        </InsightShell>

        {/* Subscriptions */}
        <InsightShell hue={342} title="Subscriptions" onAsk={() => ai.ask('review my subscriptions')}>
          <ExpandCard
            label={`${subs.length} recurring charges`}
            summary={
              <div>
                <p className="text-[26px] font-semibold text-white tracking-tight">{naira(subTotal)}<span className="text-[13px] text-white/40">/mo</span></p>
                <p className="text-[12.5px] text-white/50">{subs.length} active · 2 renew this week</p>
              </div>
            }
            detail={
              <div className="space-y-2">
                {subs.map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <CategoryIcon c={t.category} size={30} />
                    <span className="text-[13px] text-white/70">{t.merchant}</span>
                    <span className="ml-auto text-[13px] text-white/90">{naira(Math.abs(t.amount))}</span>
                  </div>
                ))}
                <p className="pt-1 text-[12px] text-white/45">Atlas tip: pausing Netflix until December saves {naira(4400 * 3)}.</p>
              </div>
            }
          />
        </InsightShell>

        {/* Cash flow */}
        <InsightShell hue={152} title="Cash flow" onAsk={() => ai.ask('how am i doing this month?')}>
          <div>
            <p className="text-[13.5px] text-white/70 leading-relaxed">
              Income lands Friday. At your current pace you'll end the month <b className="text-positive">{naira(210000)} positive</b> — enough to hit your Emergency Fund milestone early.
            </p>
          </div>
        </InsightShell>
      </div>

      <Coachmark
        id="insights"
        title="Your money, explained"
        body="These are Atlas’s read on your spending. Tap a card to see the full breakdown, or hold one to ask about it."
        gesture="tap"
        place="bottom-[104px] inset-x-4"
        arrow="none"
      />
    </div>
  )
}

function InsightShell({ title, hue, onAsk, children }: { title: string; hue: number; onAsk: () => void; children: React.ReactNode }) {
  return (
    <LongPress onAsk={onAsk} hint={`Ask Atlas about ${title}`} className="rounded-[26px]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.soft}
        className="rounded-[26px] bg-white/[0.05] p-4"
      >
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/45">{title}</span>
          <AtlasMark size={20} />
        </div>
        {children}
      </motion.div>
    </LongPress>
  )
}
