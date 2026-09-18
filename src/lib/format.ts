// Currency: Nigerian Naira. Kept as integer kobo-free naira for prototype clarity.
export function naira(amount: number, opts: { sign?: boolean } = {}) {
  const sign = opts.sign && amount > 0 ? '+' : ''
  const neg = amount < 0 ? '−' : ''
  const abs = Math.abs(amount)
  return `${neg || sign}₦${abs.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
}

export function shortNaira(amount: number) {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000) return `₦${(abs / 1_000_000).toFixed(abs % 1_000_000 ? 1 : 0)}M`
  if (abs >= 1_000) return `₦${(abs / 1_000).toFixed(abs % 1_000 ? 1 : 0)}k`
  return `₦${abs}`
}

export function pct(n: number) {
  return `${Math.round(n)}%`
}
