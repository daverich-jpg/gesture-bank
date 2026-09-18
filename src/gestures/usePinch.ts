import { useRef } from 'react'

// Detects a two-pointer pinch on touch devices, and a ctrl+wheel "pinch"
// on trackpads (the browser's native pinch gesture). Returns spreadable props.
export function usePinch({ onExpand, onCollapse }: { onExpand: () => void; onCollapse: () => void }) {
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const startDist = useRef(0)

  function dist() {
    const pts = [...pointers.current.values()]
    if (pts.length < 2) return 0
    const [a, b] = pts
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  return {
    onPointerDown: (e: React.PointerEvent) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.current.size === 2) startDist.current = dist()
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.current.size === 2 && startDist.current) {
        const delta = dist() - startDist.current
        if (delta > 42) { onExpand(); startDist.current = dist() }
        if (delta < -42) { onCollapse(); startDist.current = dist() }
      }
    },
    onPointerUp: (e: React.PointerEvent) => {
      pointers.current.delete(e.pointerId)
      startDist.current = 0
    },
    onPointerCancel: (e: React.PointerEvent) => {
      pointers.current.delete(e.pointerId)
    },
    onWheel: (e: React.WheelEvent) => {
      // trackpad pinch surfaces as ctrl+wheel
      if (!e.ctrlKey) return
      if (e.deltaY < 0) onExpand()
      if (e.deltaY > 0) onCollapse()
    },
  }
}
