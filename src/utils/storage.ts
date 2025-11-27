import type { User } from '@/types'

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'aiops_token',
  USER: 'aiops_user',
  THEME: 'aiops_theme',
  SIDEBAR_COLLAPSED: 'aiops_sidebar_collapsed',
  SIDEBAR_WIDTH: 'aiops_sidebar_width',
} as const

// Theme types
export type ThemeMode = 'light' | 'dark'

// Default values
const DEFAULTS = {
  THEME: 'light' as ThemeMode,
  SIDEBAR_COLLAPSED: false,
  SIDEBAR_WIDTH: 256,
}

/**
 * Token 存储操作
 */
export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  },

  set(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  },

  remove(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
  },
}

/**
 * 用户信息存储操作
 */
export const userStorage = {
  get(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER)
    if (!data) return null
    try {
      return JSON.parse(data) as User
    } catch {
      return null
    }
  },

  set(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  },

  remove(): void {
    localStorage.removeItem(STORAGE_KEYS.USER)
  },
}

/**
 * 主题偏好存储操作
 */
export const themeStorage = {
  get(): ThemeMode {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME)
    if (theme === 'light' || theme === 'dark') {
      return theme
    }
    return DEFAULTS.THEME
  },

  set(theme: ThemeMode): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  },

  remove(): void {
    localStorage.removeItem(STORAGE_KEYS.THEME)
  },
}

/**
 * 侧边栏状态存储操作
 */
export const sidebarStorage = {
  getCollapsed(): boolean {
    const collapsed = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)
    if (collapsed === null) return DEFAULTS.SIDEBAR_COLLAPSED
    return collapsed === 'true'
  },

  setCollapsed(collapsed: boolean): void {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(collapsed))
  },

  getWidth(): number {
    const width = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH)
    if (width === null) return DEFAULTS.SIDEBAR_WIDTH
    const parsed = parseInt(width, 10)
    return isNaN(parsed) ? DEFAULTS.SIDEBAR_WIDTH : parsed
  },

  setWidth(width: number): void {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH, String(width))
  },

  remove(): void {
    localStorage.removeItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)
    localStorage.removeItem(STORAGE_KEYS.SIDEBAR_WIDTH)
  },
}

/**
 * 清除所有存储数据
 */
export function clearAllStorage(): void {
  tokenStorage.remove()
  userStorage.remove()
  themeStorage.remove()
  sidebarStorage.remove()
}

/**
 * 清除认证相关数据（用于登出）
 */
export function clearAuthStorage(): void {
  tokenStorage.remove()
  userStorage.remove()
}

// 导出默认值供测试使用
export { DEFAULTS as STORAGE_DEFAULTS }
