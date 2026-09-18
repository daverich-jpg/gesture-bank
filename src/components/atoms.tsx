import type { Category } from '../data/types'

const catMeta: Record<Category, { glyph: string; label: string }> = {
  food: { glyph: '🍲', label: 'Food' },
  transport: { glyph: '🚕', label: 'Transport' },
  shopping: { glyph: '🛍️', label: 'Shopping' },
  bills: { glyph: '⚡', label: 'Bills' },
  income: { glyph: '💰', label: 'Income' },
  transfer: { glyph: '↗', label: 'Transfer' },
  subscription: { glyph: '🔁', label: 'Subscription' },
  health: { glyph: '➕', label: 'Health' },
}

export function catLabel(c: Category) {
  return catMeta[c].label
}

export function CategoryIcon({ c, size = 40 }: { c: Category; size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      {catMeta[c].glyph}
    </div>
  )
}

export function Avatar({ name, hue, size = 40 }: { name: string; hue: number; size?: number }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('')
  return (
    <div
      className="grid place-items-center rounded-full font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(145deg, hsl(${hue} 60% 52%), hsl(${hue + 30} 55% 38%))`,
      }}
      aria-hidden
    >
      {initials}
    </div>
  )
}

export function ProgressRing({ value, size = 46, stroke = 4, hue = 210 }: { value: number; size?: number; stroke?: number; hue?: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`hsl(${hue} 70% 62%)`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value)}
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.32,0.72,0,1)' }}
      />
    </svg>
  )
}

export function GestureHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] text-white/35">
      {children}
    </span>
  )
}
