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

export function StatusBar() {
  return (
    <div className="relative z-10 flex items-center justify-between px-7 pt-3 pb-1 text-[13px] font-medium text-white/80">
      <span>9:24</span>
      <div className="flex items-center gap-1.5 text-white/80">
        <span className="font-semibold tracking-tight">Atlas</span>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </div>
      <div className="flex items-center gap-[3px]">
        <span className="flex items-end gap-[2px] h-3">
          <i className="w-[3px] h-[5px] rounded-sm bg-white/80 not-italic" />
          <i className="w-[3px] h-[7px] rounded-sm bg-white/80 not-italic" />
          <i className="w-[3px] h-[9px] rounded-sm bg-white/80 not-italic" />
          <i className="w-[3px] h-[11px] rounded-sm bg-white/40 not-italic" />
        </span>
        <span className="ml-1.5 inline-block w-6 h-3 rounded-[3px] border border-white/50 relative">
          <i className="absolute inset-[2px] right-[6px] rounded-[1px] bg-white/80 not-italic" />
        </span>
      </div>
    </div>
  )
}
