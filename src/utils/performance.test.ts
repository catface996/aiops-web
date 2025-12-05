/**
 * Performance Optimization Tests
 * 
 * Tests for debounce, throttle, and other performance utilities.
 * 
 * REQ-NFR-001: List query performance
 * REQ-NFR-003: Topology graph rendering performance
 * REQ-NFR-005: Search response performance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce, SEARCH_DEBOUNCE_DELAY } from './debounce'
import { throttle, DRAG_THROTTLE_DELAY, POSITION_SAVE_DEBOUNCE_DELAY } from './throttle'

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('debounce', () => {
    it('should delay function execution', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 300)

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(299)
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should cancel previous calls', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 300)

      debouncedFn()
      vi.advanceTimersByTime(100)
      debouncedFn()
      vi.advanceTimersByTime(100)
      debouncedFn()

      vi.advanceTimersByTime(300)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments correctly', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 300)

      debouncedFn('arg1', 'arg2')
      vi.advanceTimersByTime(300)

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should use correct delay for search (300ms)', () => {
      expect(SEARCH_DEBOUNCE_DELAY).toBe(300)
    })
  })

  describe('throttle', () => {
    it('should execute immediately on first call', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 16)

      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should throttle subsequent calls', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 16)

      throttledFn() // Immediate
      expect(fn).toHaveBeenCalledTimes(1)

      throttledFn() // Throttled
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(16)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should ensure last call is executed', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 16)

      throttledFn() // Immediate
      throttledFn() // Throttled, scheduled
      throttledFn() // Throttled, reschedules

      vi.advanceTimersByTime(16)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should pass arguments correctly', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 16)

      throttledFn('arg1', 'arg2')
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should use correct delay for drag (16ms)', () => {
      expect(DRAG_THROTTLE_DELAY).toBe(16)
    })

    it('should use correct delay for position save (1000ms)', () => {
      expect(POSITION_SAVE_DEBOUNCE_DELAY).toBe(1000)
    })
  })

  describe('Performance Constants', () => {
    it('should have search debounce at 300ms for good UX', () => {
      // REQ-NFR-005: Search response performance
      expect(SEARCH_DEBOUNCE_DELAY).toBe(300)
    })

    it('should have drag throttle at 16ms for 60fps', () => {
      // REQ-NFR-003: Topology graph rendering performance
      // 16ms = 1000ms / 60fps
      expect(DRAG_THROTTLE_DELAY).toBe(16)
    })

    it('should have position save debounce at 1000ms to avoid frequent saves', () => {
      // REQ-NFR-003: Avoid frequent position saves
      expect(POSITION_SAVE_DEBOUNCE_DELAY).toBe(1000)
    })
  })

  describe('Real-world scenarios', () => {
    it('should handle rapid search input efficiently', () => {
      const searchFn = vi.fn()
      const debouncedSearch = debounce(searchFn, SEARCH_DEBOUNCE_DELAY)

      // Simulate user typing "test"
      debouncedSearch('t')
      vi.advanceTimersByTime(50)
      debouncedSearch('te')
      vi.advanceTimersByTime(50)
      debouncedSearch('tes')
      vi.advanceTimersByTime(50)
      debouncedSearch('test')

      // Should not have called yet
      expect(searchFn).not.toHaveBeenCalled()

      // After debounce delay, should call once with final value
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_DELAY)
      expect(searchFn).toHaveBeenCalledTimes(1)
      expect(searchFn).toHaveBeenCalledWith('test')
    })

    it('should handle rapid drag movements efficiently', () => {
      const moveFn = vi.fn()
      const throttledMove = throttle(moveFn, DRAG_THROTTLE_DELAY)

      // Simulate rapid mouse movements (every 5ms)
      for (let i = 0; i < 10; i++) {
        throttledMove({ x: i * 10, y: i * 10 })
        vi.advanceTimersByTime(5)
      }

      // Should have throttled most calls
      // First call immediate, then throttled to ~16ms intervals
      // In 50ms (10 * 5ms), we should have ~3-4 calls (0ms, 16ms, 32ms, 48ms)
      expect(moveFn.mock.calls.length).toBeLessThan(10)
      expect(moveFn.mock.calls.length).toBeGreaterThanOrEqual(3)
    })

    it('should save position only after user stops dragging', () => {
      const saveFn = vi.fn()
      const debouncedSave = debounce(saveFn, POSITION_SAVE_DEBOUNCE_DELAY)

      // Simulate continuous dragging
      for (let i = 0; i < 20; i++) {
        debouncedSave({ x: i * 10, y: i * 10 })
        vi.advanceTimersByTime(50) // 50ms between moves
      }

      // Should not have saved yet (still dragging)
      expect(saveFn).not.toHaveBeenCalled()

      // After user stops dragging (1000ms)
      vi.advanceTimersByTime(POSITION_SAVE_DEBOUNCE_DELAY)
      expect(saveFn).toHaveBeenCalledTimes(1)
      expect(saveFn).toHaveBeenCalledWith({ x: 190, y: 190 })
    })
  })
})
