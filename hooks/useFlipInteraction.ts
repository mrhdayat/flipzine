import { useState, useCallback, useRef, useEffect } from 'react'

interface FlipState {
  currentPage: number
  targetPage: number
  flipProgress: number
  isFlipping: boolean
  dragVelocity: number
}

/**
 * useFlipInteraction Hook - Heyzine-Style with Cover Logic
 * 
 * Page 0 (Cover): Single page, flip moves to page 1
 * Page 1+: Spread view, flip moves by 2
 */
export function useFlipInteraction(totalPages: number) {
  const [flipState, setFlipState] = useState<FlipState>({
    currentPage: 0,
    targetPage: 0,
    flipProgress: 0,
    isFlipping: false,
    dragVelocity: 0,
  })

  const dragStartX = useRef(0)
  const dragStartTime = useRef(0)
  const lastDragX = useRef(0)
  const animationFrame = useRef<number>(0)

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  const handleDragStart = useCallback((clientX: number) => {
    dragStartX.current = clientX
    dragStartTime.current = Date.now()
    lastDragX.current = clientX

    setFlipState(prev => ({
      ...prev,
      isFlipping: false,
      dragVelocity: 0,
    }))
  }, [])

  const handleDragMove = useCallback((clientX: number, containerWidth: number) => {
    const deltaX = clientX - dragStartX.current
    const deltaTime = Date.now() - dragStartTime.current

    const velocity = (clientX - lastDragX.current) / Math.max(deltaTime, 1)
    lastDragX.current = clientX

    const dragProgress = -deltaX / (containerWidth * 0.4)

    let progress = 0
    let targetPage = flipState.currentPage

    // Cover page logic
    if (flipState.currentPage === 0) {
      if (dragProgress > 0 && totalPages > 1) {
        progress = Math.min(1, dragProgress)
        targetPage = 1 // Move to first spread
      }
    } else {
      // Spread logic - move by 2
      if (dragProgress > 0 && flipState.currentPage + 2 < totalPages) {
        progress = Math.min(1, dragProgress)
        targetPage = flipState.currentPage + 2
      } else if (dragProgress < 0 && flipState.currentPage - 2 >= 0) {
        progress = Math.min(1, Math.abs(dragProgress))
        targetPage = flipState.currentPage - 2
      } else if (dragProgress < 0 && flipState.currentPage === 1) {
        // Back to cover from first spread
        progress = Math.min(1, Math.abs(dragProgress))
        targetPage = 0
      }
    }

    setFlipState(prev => ({
      ...prev,
      flipProgress: progress,
      targetPage,
      dragVelocity: velocity,
    }))
  }, [flipState.currentPage, totalPages])

  const handleDragEnd = useCallback(() => {
    const { flipProgress, targetPage, currentPage, dragVelocity } = flipState

    const velocityBoost = Math.abs(dragVelocity) * 100
    const threshold = 0.5 - Math.min(velocityBoost, 0.3)

    if (flipProgress > threshold) {
      animateFlip(currentPage, targetPage)
    } else {
      animateFlip(currentPage, currentPage)
    }
  }, [flipState])

  const animateFlip = useCallback((from: number, to: number) => {
    const startTime = Date.now()
    const duration = 600
    const isForward = to > from

    setFlipState(prev => ({
      ...prev,
      isFlipping: true,
      targetPage: to,
    }))

    const animate = () => {
      const elapsed = Date.now() - startTime
      const rawProgress = Math.min(elapsed / duration, 1)
      const easedProgress = easeInOutCubic(rawProgress)

      if (rawProgress < 1) {
        setFlipState(prev => ({
          ...prev,
          flipProgress: isForward ? easedProgress : 1 - easedProgress,
        }))
        animationFrame.current = requestAnimationFrame(animate)
      } else {
        setFlipState({
          currentPage: to,
          targetPage: to,
          flipProgress: 0,
          isFlipping: false,
          dragVelocity: 0,
        })
      }
    }

    animate()
  }, [])

  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [])

  return {
    currentPage: flipState.currentPage,
    targetPage: flipState.targetPage,
    flipProgress: flipState.flipProgress,
    isFlipping: flipState.isFlipping,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  }
}
