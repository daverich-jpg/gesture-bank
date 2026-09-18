// Thin line icons + brand marks extracted from the reference design language.
// Visual only — no behaviour. Stroke icons inherit `currentColor`.

type IconProps = { size?: number; className?: string; stroke?: number }

function svg(size: number, className: string, stroke: number, children: React.ReactNode) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

/** Assistant — robot head (line) */
export function IconRobot({ size = 22, className = '', stroke = 1.7 }: IconProps) {
  return svg(size, className, stroke, (
    <>
      <path d="M12 4.2V6" />
      <circle cx="12" cy="3.4" r="0.9" fill="currentColor" stroke="none" />
      <rect x="4.5" y="6" width="15" height="12" rx="3.4" />
      <circle cx="9" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <path d="M2.6 11v3M21.4 11v3" />
    </>
  ))
}

/** Activity — trending up */
export function IconTrend({ size = 22, className = '', stroke = 1.7 }: IconProps) {
  return svg(size, className, stroke, (
    <>
      <path d="M3.5 15.5 9 10l3.4 3.4L20.5 5.5" />
      <path d="M15.5 5.5h5v5" />
    </>
  ))
}

/** Spaces — saturn / ringed planet */
export function IconSaturn({ size = 22, className = '', stroke = 1.7 }: IconProps) {
  return svg(size, className, stroke, (
    <>
      <circle cx="12" cy="12" r="5.2" />
      <path d="M4.8 15.6c-2.3 1.2-3.6 2.5-3.2 3.5.7 1.7 6.8.4 13.6-3s11.4-7.6 10.7-9.3c-.4-1-2.3-1-5.1-.2" />
    </>
  ))
}

/** Insights — stacked coins / data */
export function IconCoins({ size = 22, className = '', stroke = 1.7 }: IconProps) {
  return svg(size, className, stroke, (
    <>
      <ellipse cx="12" cy="6.4" rx="6.6" ry="2.6" />
      <path d="M5.4 6.4v5.4c0 1.44 2.96 2.6 6.6 2.6s6.6-1.16 6.6-2.6V6.4" />
      <path d="M5.4 11.8v5.4c0 1.44 2.96 2.6 6.6 2.6s6.6-1.16 6.6-2.6v-5.4" />
    </>
  ))
}

/** Header — 3x3 app grid */
export function IconGrid({ size = 22, className = '', stroke = 1.7 }: IconProps) {
  return svg(size, className, stroke, (
    <>
      {[5, 12, 19].map((y) =>
        [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.15" fill="currentColor" stroke="none" />),
      )}
    </>
  ))
}

/** Send — paper-plane arrow */
export function IconSend({ size = 20, className = '', stroke = 1.9 }: IconProps) {
  return svg(size, className, stroke, (
    <>
      <path d="M4.5 12h13" />
      <path d="M11.5 6l6 6-6 6" />
    </>
  ))
}

/** Small brand mark used inline where the assistant "speaks" */
export function AtlasMark({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-grid place-items-center rounded-full bg-accent/15 text-accent ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <IconRobot size={size * 0.68} stroke={2} />
    </span>
  )
}

/** Filled robot mascot avatar on a lime disc — the "Atlas" character */
export function RobotMascot({ size = 46 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(120% 120% at 30% 20%, #C8F26A, #A3E635 55%, #86C22B)',
      }}
      aria-hidden
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <path d="M12 3.6V5.4" stroke="#123" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="2.9" r="1.1" fill="#123" />
        <rect x="4.6" y="5.6" width="14.8" height="12.4" rx="4" fill="#12331A" />
        <rect x="6.6" y="8" width="10.8" height="6.4" rx="3" fill="#0B1F12" />
        <circle cx="9.6" cy="11.2" r="1.35" fill="#A3E635" />
        <circle cx="14.4" cy="11.2" r="1.35" fill="#A3E635" />
        <path d="M10 16.4h4" stroke="#0B1F12" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
