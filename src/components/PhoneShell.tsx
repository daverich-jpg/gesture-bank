import type { ReactNode } from 'react'

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="stage">
      <div
        className="relative w-full max-w-[430px] h-[min(932px,100dvh)] overflow-hidden bg-black
                   sm:rounded-[46px] sm:border sm:border-white/10 sm:shadow-float"
      >
        {/* Ambient lift — subtle, neutral */}
        <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-64 w-[130%] rounded-full blur-3xl opacity-60"
             style={{ background: 'radial-gradient(closest-side, rgba(163,230,53,0.06), transparent)' }} />
        {children}
      </div>
    </div>
  )
}
