import { useState, useCallback, useRef } from 'react'

interface DragState {
  isDragging: boolean
  startX: number
  currentX: number
  velocity: number
  pressure: number
}

export function usePressureDrag(onFlip: (direction: 'next' | 'prev') => void) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    currentX: 0,
    velocity: 0,
    pressure: 0,
  })

  const lastTimeRef = useRef<number>(0)
  const lastXRef = useRef<number>(0)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    lastTimeRef.current = Date.now()
    lastXRef.current = e.clientX

    setDragState({
      isDragging: true,
      startX: e.clientX,
      currentX: e.clientX,
      velocity: 0,
      pressure: 0,
    })
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.isDragging) return

    const now = Date.now()
    const deltaTime = Math.max(now - lastTimeRef.current, 1)
    const deltaX = e.clientX - lastXRef.current

    // Calculate velocity
    const velocity = Math.abs(deltaX / deltaTime)

    // Calculate pressure (0-1)
    const pressure = Math.min(Math.max(velocity * 0.6, 0), 1)

    lastTimeRef.current = now
    lastXRef.current = e.clientX

    setDragState(prev => ({
      ...prev,
      currentX: e.clientX,
      velocity,
      pressure,
    }))
  }, [dragState.isDragging])

  const handlePointerUp = useCallback(() => {
    if (!dragState.isDragging) return

    const deltaX = dragState.currentX - dragState.startX
    const threshold = 50 // pixels

    // Determine flip direction
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onFlip('prev')
      } else {
        onFlip('next')
      }
    }

    setDragState({
      isDragging: false,
      startX: 0,
      currentX: 0,
      velocity: 0,
      pressure: 0,
    })
  }, [dragState, onFlip])

  return {
    dragState,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
    },
  }
}
