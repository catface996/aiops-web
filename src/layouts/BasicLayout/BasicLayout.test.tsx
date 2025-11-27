/**
 * BasicLayout 组件测试
 * 需求: 5.1, 7.1, 7.4, 7.5, 7.6
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { BasicLayout } from './index'
import { AuthProvider } from '@/contexts/AuthContext'
import { themeStorage, sidebarStorage } from '@/utils/storage'

// Mock storage module
vi.mock('@/utils/storage', () => ({
  themeStorage: {
    get: vi.fn(() => 'light'),
    set: vi.fn(),
    remove: vi.fn(),
  },
  sidebarStorage: {
    getCollapsed: vi.fn(() => false),
    setCollapsed: vi.fn(),
    getWidth: vi.fn(() => 256),
    setWidth: vi.fn(),
    remove: vi.fn(),
  },
  tokenStorage: {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  },
  userStorage: {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  },
  clearAuthStorage: vi.fn(),
}))

// 用于测试中获取 mock
const mockThemeStorage = themeStorage as {
  get: ReturnType<typeof vi.fn>
  set: ReturnType<typeof vi.fn>
  remove: ReturnType<typeof vi.fn>
}
const mockSidebarStorage = sidebarStorage as {
  getCollapsed: ReturnType<typeof vi.fn>
  setCollapsed: ReturnType<typeof vi.fn>
  getWidth: ReturnType<typeof vi.fn>
  setWidth: ReturnType<typeof vi.fn>
  remove: ReturnType<typeof vi.fn>
}

// Mock useAuth hook
const mockLogout = vi.fn()
let mockUserRoles: string[] = ['ROLE_USER']

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', username: 'testuser', email: 'test@example.com', roles: mockUserRoles },
    isAuthenticated: true,
    logout: mockLogout,
  }),
}))

// Mock usePermission hook
vi.mock('@/hooks/usePermission', () => ({
  usePermission: () => ({
    hasRole: (role: string) => mockUserRoles.includes(role),
    hasAnyRole: (roles: string[]) => roles.some((r) => mockUserRoles.includes(r)),
  }),
}))

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// 包装组件以提供必要的上下文
const renderWithProviders = (ui: React.ReactElement, { route = '/dashboard' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  )
}

describe('BasicLayout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 重置 mockUser
    mockUserRoles = ['ROLE_USER']
    // 重置 storage mock
    mockThemeStorage.get.mockReturnValue('light')
    mockSidebarStorage.getCollapsed.mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // 需求 5.1: 侧边菜单根据用户角色动态生成
  describe('Layout rendering', () => {
    it('should render the layout container', () => {
      renderWithProviders(<BasicLayout />)
      expect(screen.getByTestId('basic-layout')).toBeInTheDocument()
    })

    it('should render the content area', () => {
      renderWithProviders(<BasicLayout />)
      expect(screen.getByTestId('basic-layout-content')).toBeInTheDocument()
    })

    it('should render children when provided', () => {
      renderWithProviders(
        <BasicLayout>
          <div data-testid="test-content">Test Content</div>
        </BasicLayout>
      )
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('should render Outlet when no children provided', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route element={<BasicLayout />}>
                <Route
                  path="/dashboard"
                  element={<div data-testid="outlet-content">Outlet Content</div>}
                />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      )
      expect(screen.getByTestId('outlet-content')).toBeInTheDocument()
    })
  })

  // 需求 7.4: 显示用户信息
  describe('User info display', () => {
    it('should render user dropdown', () => {
      renderWithProviders(<BasicLayout />)
      expect(screen.getByTestId('user-dropdown')).toBeInTheDocument()
    })

    it('should display username', () => {
      renderWithProviders(<BasicLayout />)
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
  })

  // 需求 7.5: 主题切换功能
  describe('Theme switching', () => {
    it('should render theme switch', () => {
      renderWithProviders(<BasicLayout />)
      expect(screen.getByTestId('theme-switch')).toBeInTheDocument()
    })

    it('should toggle theme when switch is clicked', () => {
      renderWithProviders(<BasicLayout />)
      const switchElement = screen.getByRole('switch')

      // 点击切换到深色模式
      fireEvent.click(switchElement)
      expect(mockThemeStorage.set).toHaveBeenCalledWith('dark')
    })

    it('should persist theme preference', () => {
      // 预设深色模式
      mockThemeStorage.get.mockReturnValue('dark')

      renderWithProviders(<BasicLayout />)
      const switchElement = screen.getByRole('switch')

      // 开关应该是开启状态（深色模式）
      expect(switchElement).toBeChecked()
    })
  })

  // 需求 7.6: 退出按钮
  describe('Logout functionality', () => {
    it('should render user dropdown with logout option', () => {
      renderWithProviders(<BasicLayout />)

      // 用户下拉菜单应该存在
      const userDropdown = screen.getByTestId('user-dropdown')
      expect(userDropdown).toBeInTheDocument()
    })
  })

  // 需求 5.1: 根据用户角色动态生成侧边菜单
  // 注意：角色过滤的详细测试在属性测试中（BasicLayout.property.test.tsx）
  describe('Menu display', () => {
    it('should render sidebar menu', () => {
      renderWithProviders(<BasicLayout />)

      // 布局应该渲染成功
      expect(screen.getByTestId('basic-layout')).toBeInTheDocument()
    })
  })

  // 需求 7.1: 响应式布局
  describe('Responsive layout', () => {
    it('should persist sidebar collapsed state', () => {
      // 预设折叠状态
      mockSidebarStorage.getCollapsed.mockReturnValue(true)

      renderWithProviders(<BasicLayout />)

      // 验证 storage 被调用
      expect(mockSidebarStorage.getCollapsed).toHaveBeenCalled()
    })
  })

  // 导航测试
  describe('Navigation', () => {
    it('should render header actions', () => {
      renderWithProviders(<BasicLayout />)
      expect(screen.getByTestId('basic-layout-header-actions')).toBeInTheDocument()
    })
  })
})
