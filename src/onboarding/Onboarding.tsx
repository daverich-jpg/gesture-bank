import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RobotMascot, AtlasMark, IconSend, IconTrend, IconSaturn } from '../components/icons'
import { haptic } from '../lib/haptics'
import { spring, ease } from '../lib/motion'

/**
 * New-user first-run flow. A linear step machine that hands off to the main app
 * on completion. Everyday teaching uses gestures (swipe carousel); identity &
 * security steps (phone, OTP, passcode, biometric) use explicit controls — the
 * same gesture-vs-button rule the product follows everywhere else.
 *
 * All entry here is simulated (no backend, no real credentials collected).
 */

type Step = 'welcome' | 'teach' | 'phone' | 'otp' | 'passcode' | 'biometric' | 'name' | 'interests' | 'done'

const ACCOUNT_STEPS: Step[] = ['phone', 'otp', 'passcode', 'biometric', 'name', 'interests']

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>('welcome')
  const [dir, setDir] = useState(1)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')

  function go(next: Step, d: 1 | -1 = 1) { haptic('tap'); setDir(d); setStep(next) }

  const progressIndex = ACCOUNT_STEPS.indexOf(step)

  return (
    <div className="flex h-full flex-col pt-[max(18px,env(safe-area-inset-top))]">
      {/* Progress + back (account-creation steps only) */}
      {progressIndex >= 0 && (
        <div className="flex items-center gap-3 px-5 pb-1">
          <button
            onClick={() => go(ACCOUNT_STEPS[progressIndex - 1] ?? 'teach', -1)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-white/70 active:bg-white/10"
            aria-label="Back"
          >
            ‹
          </button>
          <div className="flex flex-1 gap-1.5">
            {ACCOUNT_STEPS.map((s, i) => (
              <span key={s} className={`h-1 flex-1 rounded-full transition-colors ${i <= progressIndex ? 'bg-accent' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      )}

      <motion.div
        key={step}
        initial={{ opacity: 0, x: dir * 26 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, ease: ease.standard }}
        className="flex min-h-0 flex-1 flex-col"
      >
        {step === 'welcome' && <Welcome onStart={() => go('teach')} onSkip={onDone} />}
        {step === 'teach' && <Teach onDone={() => go('phone')} onSkip={onDone} />}
        {step === 'phone' && <PhoneStep value={phone} onChange={setPhone} onNext={() => go('otp')} />}
        {step === 'otp' && <OtpStep phone={phone} onNext={() => go('passcode')} />}
        {step === 'passcode' && <PasscodeStep onNext={() => go('biometric')} />}
        {step === 'biometric' && <BiometricStep onNext={() => go('name')} />}
        {step === 'name' && <NameStep value={name} onChange={setName} onNext={() => go('interests')} />}
        {step === 'interests' && <InterestsStep onNext={() => go('done')} />}
        {step === 'done' && <Done name={name} onEnter={onDone} />}
      </motion.div>
    </div>
  )
}

/* ---------- shared building blocks ---------- */

function Keypad({ onKey, onDelete }: { onKey: (d: string) => void; onDelete: () => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {keys.map((k, i) =>
        k === '' ? (
          <div key={i} />
        ) : (
          <button
            key={i}
            onClick={() => { haptic('tap'); k === 'del' ? onDelete() : onKey(k) }}
            className="flex h-[58px] items-center justify-center rounded-2xl bg-white/[0.05] text-[23px] font-semibold text-white active:bg-white/[0.12] transition"
            aria-label={k === 'del' ? 'Delete' : k}
          >
            {k === 'del' ? '⌫' : k}
          </button>
        ),
      )}
    </div>
  )
}

function Dots({ n, filled, error }: { n: number; filled: number; error?: boolean }) {
  return (
    <motion.div animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }} className="flex justify-center gap-3.5">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className={`h-3.5 w-3.5 rounded-full transition-colors ${error ? 'bg-negative' : i < filled ? 'bg-accent' : 'bg-white/15'}`} />
      ))}
    </motion.div>
  )
}

function PrimaryButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-full bg-accent py-4 text-[15px] font-bold text-black shadow-glow active:scale-[0.99] transition disabled:opacity-25 disabled:shadow-none"
    >
      {children}
    </button>
  )
}

function Title({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-6">
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-white">{title}</h1>
      {subtitle && <p className="mt-2 text-[14px] leading-relaxed text-white/45">{subtitle}</p>}
    </div>
  )
}

/* ---------- steps ---------- */

function Welcome({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <div className="flex h-full flex-col px-6 pb-[max(24px,env(safe-area-inset-bottom))]">
      <div className="flex justify-end pt-1">
        <button onClick={onSkip} className="text-[13px] text-white/40 active:text-white/70">Skip</button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.glass}>
          <RobotMascot size={104} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.08 }}
          className="mt-8 text-[34px] font-extrabold leading-[1.1] tracking-tight text-white"
        >
          Banking that feels<br />like a conversation.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.16 }}
          className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-white/50"
        >
          Meet Atlas — your AI money assistant. Talk, swipe, done. No menus to dig through.
        </motion.p>
      </div>
      <div className="space-y-3">
        <PrimaryButton onClick={onStart}>Get started</PrimaryButton>
        <button onClick={onStart} className="w-full py-1 text-[14px] font-medium text-white/55 active:text-white/80">
          I already have an account
        </button>
      </div>
    </div>
  )
}

const SLIDES = [
  { mark: <RobotMascot size={72} />, title: 'Say it, don’t tap it', body: 'Tell Atlas what you want in plain words — “Send ₦20,000 to David.” It sets it up; you just approve.' },
  { mark: <GestureGlyph />, title: 'Move money with a gesture', body: 'Swipe a card to confirm. Drag a coin to save. Your money responds to touch — no forms.' },
  { mark: <IconSaturn size={40} className="text-accent" />, title: 'Understand every naira', body: 'Atlas watches your spending and surfaces what matters — before it becomes a problem.' },
]

function Teach({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const [slide, setSlide] = useState(0)
  const last = SLIDES.length - 1

  return (
    <div className="flex h-full flex-col pb-[max(24px,env(safe-area-inset-bottom))]">
      <div className="flex justify-end px-6 pt-1">
        <button onClick={onSkip} className="text-[13px] text-white/40 active:text-white/70">Skip</button>
      </div>

      <div className="flex-1 overflow-hidden">
        <motion.div
          className="flex h-full"
          animate={{ x: `-${slide * 100}%` }}
          transition={spring.glass}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60 && slide < last) { haptic('select'); setSlide((s) => s + 1) }
            else if (info.offset.x > 60 && slide > 0) { haptic('select'); setSlide((s) => s - 1) }
          }}
        >
          {SLIDES.map((s, i) => (
            <div key={i} className="flex min-w-full flex-col items-center justify-center px-8 text-center">
              <div className="grid h-[132px] w-[132px] place-items-center rounded-[36px] bg-white/[0.04] ring-1 ring-white/[0.06]">
                {s.mark}
              </div>
              <h2 className="mt-9 text-[25px] font-extrabold tracking-tight text-white">{s.title}</h2>
              <p className="mt-3 max-w-[300px] text-[15px] leading-relaxed text-white/50">{s.body}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === slide ? 'w-6 bg-accent' : 'w-2 bg-white/20'}`} />
        ))}
      </div>

      <div className="px-6">
        <PrimaryButton onClick={() => (slide < last ? setSlide((s) => s + 1) : onDone())}>
          {slide < last ? 'Continue' : 'Create account'}
        </PrimaryButton>
      </div>
    </div>
  )
}

function GestureGlyph() {
  return (
    <div className="relative grid place-items-center">
      <IconTrend size={44} className="text-accent" />
      <span className="absolute -right-3 -top-3 grid h-6 w-6 place-items-center rounded-full bg-accent text-black">
        <IconSend size={13} />
      </span>
    </div>
  )
}

function PhoneStep({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  const formatted = value.replace(/(\d{3})(\d{3})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '))
  return (
    <div className="flex h-full flex-col pb-[max(20px,env(safe-area-inset-bottom))]">
      <div className="mt-4">
        <Title title="What’s your number?" subtitle="We’ll text a one-time code to verify it’s you." />
      </div>
      <div className="flex flex-1 flex-col justify-center px-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="rounded-xl bg-white/[0.06] px-3 py-2 text-[17px] font-semibold text-white/80">🇳🇬 +234</span>
          <span className="text-[26px] font-bold tracking-wide text-white">{formatted || <span className="text-white/25">801 234 5678</span>}</span>
        </div>
      </div>
      <div className="space-y-5 px-6">
        <Keypad onKey={(d) => value.length < 10 && onChange(value + d)} onDelete={() => onChange(value.slice(0, -1))} />
        <PrimaryButton disabled={value.length < 10} onClick={onNext}>Send code</PrimaryButton>
      </div>
    </div>
  )
}

function OtpStep({ phone, onNext }: { phone: string; onNext: () => void }) {
  const [code, setCode] = useState('')
  const [seconds, setSeconds] = useState(30)

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  useEffect(() => {
    if (code.length === 6) { haptic('success'); const t = setTimeout(onNext, 350); return () => clearTimeout(t) }
  }, [code, onNext])

  return (
    <div className="flex h-full flex-col pb-[max(20px,env(safe-area-inset-bottom))]">
      <div className="mt-4">
        <Title title="Enter the code" subtitle={`Sent to +234 ${phone || '801 234 5678'}`} />
      </div>
      <div className="flex flex-1 flex-col justify-center px-6">
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}
              className={`grid h-14 w-11 place-items-center rounded-xl text-[22px] font-bold text-white transition
                ${i === code.length ? 'bg-white/[0.05] ring-2 ring-accent' : 'bg-white/[0.05]'}`}>
              {code[i] ?? ''}
            </div>
          ))}
        </div>
        <button
          disabled={seconds > 0}
          onClick={() => setSeconds(30)}
          className="mt-6 text-center text-[13px] text-white/40 active:text-white/70 disabled:opacity-60"
        >
          {seconds > 0 ? `Resend code in 0:${String(seconds).padStart(2, '0')}` : 'Resend code'}
        </button>
      </div>
      <div className="px-6">
        <Keypad onKey={(d) => code.length < 6 && setCode(code + d)} onDelete={() => setCode(code.slice(0, -1))} />
      </div>
    </div>
  )
}

function PasscodeStep({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<'create' | 'confirm'>('create')
  const [first, setFirst] = useState('')
  const [entry, setEntry] = useState('')
  const [error, setError] = useState(false)

  function press(d: string) {
    if (entry.length >= 6) return
    const next = entry + d
    setEntry(next)
    if (next.length === 6) {
      if (phase === 'create') {
        haptic('select')
        setTimeout(() => { setFirst(next); setEntry(''); setPhase('confirm') }, 180)
      } else if (next === first) {
        haptic('success')
        setTimeout(onNext, 220)
      } else {
        haptic('warn')
        setError(true)
        setTimeout(() => { setError(false); setEntry(''); setFirst(''); setPhase('create') }, 620)
      }
    }
  }

  return (
    <div className="flex h-full flex-col pb-[max(20px,env(safe-area-inset-bottom))]">
      <div className="mt-4">
        <Title
          title={phase === 'create' ? 'Create a passcode' : 'Confirm your passcode'}
          subtitle={phase === 'create' ? 'You’ll use this to unlock Atlas.' : 'Enter it once more to confirm.'}
        />
      </div>
      <div className="flex flex-1 items-center justify-center px-6">
        <Dots n={6} filled={entry.length} error={error} />
      </div>
      <div className="px-6">
        <Keypad onKey={press} onDelete={() => setEntry(entry.slice(0, -1))} />
      </div>
    </div>
  )
}

function BiometricStep({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle')

  useEffect(() => {
    if (phase !== 'scanning') return
    const t = setTimeout(() => { haptic('success'); setPhase('done'); setTimeout(onNext, 650) }, 1000)
    return () => clearTimeout(t)
  }, [phase, onNext])

  return (
    <div className="flex h-full flex-col px-6 pb-[max(24px,env(safe-area-inset-bottom))]">
      <div className="mt-4">
        <Title title="Unlock with Face ID" subtitle="Faster sign-in, every time. Your biometrics never leave your device." />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <motion.button
          onPointerDown={() => { haptic('select'); setPhase('scanning') }}
          onPointerUp={() => phase === 'scanning' && setPhase('idle')}
          className="relative grid h-32 w-32 place-items-center rounded-full"
          aria-label="Hold to enable Face ID"
        >
          <motion.span
            className="absolute inset-0 rounded-full border-2"
            animate={{
              borderColor: phase === 'done' ? '#A3E635' : phase === 'scanning' ? '#A3E635' : 'rgba(255,255,255,0.18)',
              scale: phase === 'scanning' ? [1, 1.06, 1] : 1,
            }}
            transition={phase === 'scanning' ? { duration: 1, repeat: Infinity } : spring.crisp}
          />
          {phase === 'done'
            ? <span className="text-4xl text-accent">✓</span>
            : <FaceGlyph active={phase === 'scanning'} />}
        </motion.button>
      </div>
      <div className="space-y-3">
        <PrimaryButton onClick={() => setPhase('scanning')}>Enable Face ID</PrimaryButton>
        <button onClick={onNext} className="w-full py-1 text-[14px] font-medium text-white/50 active:text-white/80">Not now</button>
      </div>
    </div>
  )
}

function FaceGlyph({ active }: { active: boolean }) {
  const c = active ? '#A3E635' : 'rgba(255,255,255,0.85)'
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <path d="M9 9v1.5M15 9v1.5M12 9v3.2c0 .5-.4.8-.9.8" />
      <path d="M9.2 14.6c1.5 1.1 4.1 1.1 5.6 0" />
    </svg>
  )
}

function NameStep({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div className="flex h-full flex-col pb-[max(24px,env(safe-area-inset-bottom))]">
      <div className="mt-4 flex items-center gap-3 px-6">
        <AtlasMark size={30} />
        <span className="text-[12px] uppercase tracking-widest text-white/40">Atlas</span>
      </div>
      <div className="mt-3">
        <Title title="What should Atlas call you?" />
      </div>
      <div className="flex flex-1 flex-col justify-center px-6">
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && value.trim() && onNext()}
          placeholder="First name"
          className="w-full border-b border-white/10 bg-transparent pb-4 text-[28px] font-bold text-white outline-none placeholder:text-white/25"
        />
      </div>
      <div className="px-6">
        <PrimaryButton disabled={!value.trim()} onClick={onNext}>Continue</PrimaryButton>
      </div>
    </div>
  )
}

const INTERESTS = ['Save toward goals', 'Send & receive', 'Track spending', 'Stick to a budget', 'Grow my savings', 'Manage subscriptions']

function InterestsStep({ onNext }: { onNext: () => void }) {
  const [picked, setPicked] = useState<string[]>([])
  const toggle = (i: string) => { haptic('tap'); setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i])) }

  return (
    <div className="flex h-full flex-col pb-[max(24px,env(safe-area-inset-bottom))]">
      <div className="mt-4">
        <Title title="What brings you to Atlas?" subtitle="Pick any — Atlas personalizes your home around these." />
      </div>
      <div className="flex flex-1 flex-col justify-center px-6">
        <div className="flex flex-wrap gap-2.5">
          {INTERESTS.map((i) => {
            const on = picked.includes(i)
            return (
              <button key={i} onClick={() => toggle(i)}
                className={`rounded-full px-4 py-2.5 text-[13.5px] font-medium transition
                  ${on ? 'bg-accent text-black' : 'border border-white/[0.14] text-white/75 active:bg-white/[0.05]'}`}>
                {i}
              </button>
            )
          })}
        </div>
      </div>
      <div className="px-6">
        <PrimaryButton disabled={picked.length === 0} onClick={onNext}>
          {picked.length ? `Continue with ${picked.length}` : 'Pick at least one'}
        </PrimaryButton>
      </div>
    </div>
  )
}

function Done({ name, onEnter }: { name: string; onEnter: () => void }) {
  return (
    <div className="flex h-full flex-col items-center px-6 pb-[max(24px,env(safe-area-inset-bottom))] text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.glass}
          className="grid h-24 w-24 place-items-center rounded-full bg-accent/15 ring-1 ring-accent/40">
          <span className="text-5xl text-accent">✓</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.1 }}
          className="mt-8 text-[30px] font-extrabold tracking-tight text-white">
          You’re all set{name ? `, ${name}` : ''}.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.18 }}
          className="mt-3 max-w-[280px] text-[15px] leading-relaxed text-white/50">
          Atlas is ready. Just say what you need — or explore with a swipe.
        </motion.p>
      </div>
      <div className="w-full">
        <PrimaryButton onClick={onEnter}>Enter Atlas</PrimaryButton>
      </div>
    </div>
  )
}
