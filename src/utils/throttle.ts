/**
 * 节流工具函数
 * 需求: REQ-NFR-003 - 拓扑图拖拽节流（16ms）
 */

/**
 * 创建一个节流函数
 * @param fn 需要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall

    if (timeSinceLastCall >= delay) {
      // 立即执行
      lastCall = now
      fn.apply(this, args)
    } else {
      // 延迟执行（确保最后一次调用会被执行）
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        fn.apply(this, args)
        timeoutId = null
      }, delay - timeSinceLastCall)
    }
  }
}

/**
 * 拓扑图拖拽节流延迟（16ms，约60fps）
 * REQ-NFR-003: 拓扑图渲染性能
 */
export const DRAG_THROTTLE_DELAY = 16

/**
 * 位置保存防抖延迟（1000ms）
 * REQ-NFR-003: 避免频繁保存位置
 */
export const POSITION_SAVE_DEBOUNCE_DELAY = 1000

export default throttle
