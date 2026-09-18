// Haptic feedback indicators. On devices without the Vibration API this is a
// no-op, but the call sites document *intent* — every committed gesture fires one.
type Pattern = 'tap' | 'select' | 'commit' | 'success' | 'warn'

const patterns: Record<Pattern, number | number[]> = {
  tap: 8,
  select: 12,
  commit: [10, 30, 14],
  success: [12, 40, 18, 40, 24],
  warn: [24, 60, 24],
}

export function haptic(kind: Pattern = 'tap') {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(patterns[kind])
    }
  } catch {
    /* silently ignore — feedback is an enhancement */
  }
}
