import { describe, it, expect, beforeEach } from 'vitest'
import fc from 'fast-check'
import {
  tokenStorage,
  userStorage,
  themeStorage,
  sidebarStorage,
  clearAllStorage,
  clearAuthStorage,
  STORAGE_DEFAULTS,
  type ThemeMode,
} from './storage'
import type { User } from '@/types'
import { UserRole } from '@/types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
})

// Helper to generate valid date string using timestamp to avoid invalid date issues
const validDateArb = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() })
  .map((timestamp) => new Date(timestamp).toISOString())

// Helper to generate valid User objects
const userArbitrary = fc.record({
  userId: fc.integer({ min: 1 }),
  username: fc.string({ minLength: 3, maxLength: 20 }).filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
  email: fc.emailAddress(),
  role: fc.constantFrom(UserRole.ROLE_USER, UserRole.ROLE_ADMIN),
  createdAt: fc.option(validDateArb, { nil: undefined }),
  lastLoginAt: fc.option(validDateArb, { nil: undefined }),
  isLocked: fc.option(fc.boolean(), { nil: undefined }),
  lockUntil: fc.option(validDateArb, { nil: undefined }),
}) as fc.Arbitrary<User>

describe('LocalStorage Storage Utils', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('tokenStorage', () => {
    it('should store and retrieve token', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (token) => {
          tokenStorage.set(token)
          expect(tokenStorage.get()).toBe(token)
        }),
        { numRuns: 100 }
      )
    })

    it('should return null when no token exists', () => {
      expect(tokenStorage.get()).toBeNull()
    })

    it('should remove token', () => {
      tokenStorage.set('test-token')
      tokenStorage.remove()
      expect(tokenStorage.get()).toBeNull()
    })
  })

  describe('userStorage', () => {
    it('should store and retrieve user', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          userStorage.set(user)
          const retrieved = userStorage.get()
          expect(retrieved).toEqual(user)
        }),
        { numRuns: 100 }
      )
    })

    it('should return null when no user exists', () => {
      expect(userStorage.get()).toBeNull()
    })

    it('should return null for invalid JSON', () => {
      localStorage.setItem('aiops_user', 'invalid json')
      expect(userStorage.get()).toBeNull()
    })

    it('should remove user', () => {
      const user: User = {
        userId: 1,
        username: 'test',
        email: 'test@example.com',
        role: UserRole.ROLE_USER,
      }
      userStorage.set(user)
      userStorage.remove()
      expect(userStorage.get()).toBeNull()
    })
  })

  // Feature: antd-rbac-frontend, Property 15: Theme preference persistence
  // 对于任何主题选择，系统应该将主题偏好保存到 LocalStorage，并在下次访问时从 LocalStorage 加载并应用
  describe('themeStorage - Property 15: Theme preference persistence', () => {
    it('should persist and retrieve theme preference', () => {
      fc.assert(
        fc.property(fc.constantFrom<ThemeMode>('light', 'dark'), (theme) => {
          themeStorage.set(theme)
          expect(themeStorage.get()).toBe(theme)
        }),
        { numRuns: 100 }
      )
    })

    it('should return default theme when no preference exists', () => {
      expect(themeStorage.get()).toBe(STORAGE_DEFAULTS.THEME)
    })

    it('should return default theme for invalid value', () => {
      localStorage.setItem('aiops_theme', 'invalid')
      expect(themeStorage.get()).toBe(STORAGE_DEFAULTS.THEME)
    })

    it('should remove theme preference', () => {
      themeStorage.set('dark')
      themeStorage.remove()
      expect(themeStorage.get()).toBe(STORAGE_DEFAULTS.THEME)
    })
  })

  // Feature: antd-rbac-frontend, Property 16: Sidebar state persistence
  // 对于任何侧边栏宽度调整或展开/收起操作，系统应该将状态保存到 LocalStorage
  describe('sidebarStorage - Property 16: Sidebar state persistence', () => {
    it('should persist and retrieve collapsed state', () => {
      fc.assert(
        fc.property(fc.boolean(), (collapsed) => {
          sidebarStorage.setCollapsed(collapsed)
          expect(sidebarStorage.getCollapsed()).toBe(collapsed)
        }),
        { numRuns: 100 }
      )
    })

    it('should persist and retrieve width', () => {
      fc.assert(
        fc.property(fc.integer({ min: 100, max: 500 }), (width) => {
          sidebarStorage.setWidth(width)
          expect(sidebarStorage.getWidth()).toBe(width)
        }),
        { numRuns: 100 }
      )
    })

    it('should return default collapsed state when not set', () => {
      expect(sidebarStorage.getCollapsed()).toBe(STORAGE_DEFAULTS.SIDEBAR_COLLAPSED)
    })

    it('should return default width when not set', () => {
      expect(sidebarStorage.getWidth()).toBe(STORAGE_DEFAULTS.SIDEBAR_WIDTH)
    })

    it('should return default width for invalid value', () => {
      localStorage.setItem('aiops_sidebar_width', 'invalid')
      expect(sidebarStorage.getWidth()).toBe(STORAGE_DEFAULTS.SIDEBAR_WIDTH)
    })

    it('should remove sidebar state', () => {
      sidebarStorage.setCollapsed(true)
      sidebarStorage.setWidth(300)
      sidebarStorage.remove()
      expect(sidebarStorage.getCollapsed()).toBe(STORAGE_DEFAULTS.SIDEBAR_COLLAPSED)
      expect(sidebarStorage.getWidth()).toBe(STORAGE_DEFAULTS.SIDEBAR_WIDTH)
    })
  })

  // Feature: antd-rbac-frontend, Requirement 10.5: Clear browser data restores defaults
  describe('clearAllStorage - Requirement 10.5', () => {
    it('should clear all storage and restore defaults', () => {
      // Set all values
      tokenStorage.set('test-token')
      userStorage.set({
        userId: 1,
        username: 'test',
        email: 'test@example.com',
        role: UserRole.ROLE_USER,
      })
      themeStorage.set('dark')
      sidebarStorage.setCollapsed(true)
      sidebarStorage.setWidth(300)

      // Clear all
      clearAllStorage()

      // Verify all cleared
      expect(tokenStorage.get()).toBeNull()
      expect(userStorage.get()).toBeNull()
      expect(themeStorage.get()).toBe(STORAGE_DEFAULTS.THEME)
      expect(sidebarStorage.getCollapsed()).toBe(STORAGE_DEFAULTS.SIDEBAR_COLLAPSED)
      expect(sidebarStorage.getWidth()).toBe(STORAGE_DEFAULTS.SIDEBAR_WIDTH)
    })
  })

  describe('clearAuthStorage', () => {
    it('should only clear auth-related storage', () => {
      // Set all values
      tokenStorage.set('test-token')
      userStorage.set({
        userId: 1,
        username: 'test',
        email: 'test@example.com',
        role: UserRole.ROLE_USER,
      })
      themeStorage.set('dark')
      sidebarStorage.setCollapsed(true)

      // Clear auth only
      clearAuthStorage()

      // Verify auth cleared but preferences preserved
      expect(tokenStorage.get()).toBeNull()
      expect(userStorage.get()).toBeNull()
      expect(themeStorage.get()).toBe('dark')
      expect(sidebarStorage.getCollapsed()).toBe(true)
    })
  })
})
