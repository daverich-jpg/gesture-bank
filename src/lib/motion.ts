// Motion design system — physics tokens shared across every gesture.
// Calm technology: springs settle, they don't bounce loudly.

import { animate as fmAnimate, type MotionValue, type Transition } from 'framer-motion'

// Imperatively settle a MotionValue with one of our spring tokens.
// Wraps framer's animate() so call sites stay clean and correctly typed.
export function settle(mv: MotionValue<number>, to: number, t: Transition = spring.glass) {
  // framer's `animate` is an overload set; Transition is a superset of
  // ValueAnimationTransition, so we hand the options through untyped here.
  return (fmAnimate as (v: MotionValue<number>, k: number, o?: unknown) => ReturnType<typeof fmAnimate>)(mv, to, t)
}

export const spring = {
  // Default object motion — money cards, sheets settling into place.
  glass: { type: 'spring', stiffness: 420, damping: 38, mass: 0.9 } as Transition,
  // Snappier — small controls, chips, toggles.
  crisp: { type: 'spring', stiffness: 620, damping: 34 } as Transition,
  // Heavier — a card being physically dragged to completion.
  weighty: { type: 'spring', stiffness: 300, damping: 34, mass: 1.1 } as Transition,
  // Gentle — insights expanding, disclosure.
  soft: { type: 'spring', stiffness: 260, damping: 30 } as Transition,
}

export const ease = {
  standard: [0.32, 0.72, 0, 1] as [number, number, number, number],
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
}

export const duration = {
  micro: 0.14,
  base: 0.28,
  slow: 0.5,
}

// Gesture thresholds (px / velocity) — one source of truth so behaviour
// is consistent and documentable in the motion spec.
export const gesture = {
  swipeCommitX: 96, // px past which a swipe commits
  swipeVelocity: 480, // px/s that commits regardless of distance
  dragSnapBack: 0.16, // spring back settle time hint
}
