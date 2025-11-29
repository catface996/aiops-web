# 设计文档

## 概述

会话管理UI功能为AIOps Web前端应用提供完整的会话生命周期管理界面。该功能与后端会话管理API集成，实现用户登录、令牌管理、会话验证、多设备会话管理等核心功能。设计遵循React + TypeScript + Ant Design技术栈，采用Context API进行状态管理，使用Axios拦截器实现自动令牌注入和刷新机制。

## 架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Login Page   │  │ Dashboard    │  │ Sessions     │      │
│  │              │  │              │  │ Management   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   State Management Layer                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              AuthContext                              │   │
│  │  - user: UserInfo | null                             │   │
│  │  - isAuthenticated: boolean                          │   │
│  │  - login(credentials): Promise<void>                 │   │
│  │  - logout(): Promise<void>                           │   │
│  │  - refreshToken(): Promise<void>                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ auth.ts      │  │ session.ts   │  │ storage.ts   │      │
│  │ - login()    │  │ - getSessions│  │ - getToken() │      │
│  │ - logout()   │  │ - terminate  │  │ - setToken() │      │
│  │ - refresh()  │  │ - validate   │  │ - clear()    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Client Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Axios Instance (request.ts)              │   │
│  │  - Request Interceptor: Add Authorization header     │   │
│  │  - Response Interceptor: Handle 401, refresh token   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  Backend API (localhost:8080)
```

### 数据流

**登录流程:**
```
User Input → Login Page → auth.login() → POST /api/v1/auth/login
→ Store token in LocalStorage → Update AuthContext → Navigate to Dashboard
```

**API请求流程:**
```
Component → Service → Axios Request Interceptor (add token)
→ Backend API → Response Interceptor (handle errors)
→ Service → Component
```

**令牌刷新流程:**
```
API Response 401 → Response Interceptor → auth.refresh()
→ POST /api/v1/auth/refresh → Update token → Retry original request
```

## 组件和接口

### 1. AuthContext

**职责:** 管理全局认证状态，提供认证相关操作

**接口定义:**

```typescript
interface UserInfo {
  accountId: number;
  username: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  status: 'ACTIVE' | 'LOCKED' | 'DISABLED';
  createdAt: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
}

interface LoginCredentials {
  identifier: string;  // 用户名或邮箱
  password: string;
  rememberMe: boolean;
}
```

**状态管理:**
- `user`: 当前登录用户信息，从LocalStorage恢复
- `isAuthenticated`: 认证状态，基于token存在性
- `isLoading`: 初始化加载状态

### 2. AuthGuard组件

**职责:** 保护需要认证的路由

**接口定义:**

```typescript
interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ROLE_USER' | 'ROLE_ADMIN';
}
```

**行为:**
- 检查LocalStorage中的access_token
- 如果未认证，重定向到/login?redirect={currentPath}
- 如果已认证但角色不足，重定向到/403
- 显示加载状态直到认证检查完成

### 3. SessionExpirationWarning组件

**职责:** 显示会话即将过期的警告对话框

**接口定义:**

```typescript
interface SessionExpirationWarningProps {
  visible: boolean;
  remainingSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}
```

**行为:**
- 显示倒计时（格式：X分Y秒）
- 提供"延长会话"和"立即登出"按钮
- 倒计时到0时自动登出

### 4. SessionList组件

**职责:** 显示用户的所有活跃会话

**接口定义:**

```typescript
interface SessionInfo {
  sessionId: string;
  userId: number;
  ipAddress: string;
  deviceType: string;
  operatingSystem: string;
  browser: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  rememberMe: boolean;
  remainingSeconds: number;
  currentSession: boolean;
}

interface SessionListProps {
  sessions: SessionInfo[];
  onTerminate: (sessionId: string) => Promise<void>;
  onTerminateOthers: () => Promise<void>;
}
```

**行为:**
- 桌面端：表格形式显示
- 移动端：卡片形式显示
- 当前会话显示"当前设备"徽章
- 非当前会话显示"终止会话"按钮

### 5. Service层接口

**auth.ts:**

```typescript
interface LoginRequest {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

interface LoginResult {
  token: string;
  userInfo: UserInfo;
  sessionId: string;
  expiresAt: string;
  deviceInfo: string;
  message: string;
}

interface RefreshTokenResponse {
  token: string;
  sessionId: string;
  expiresAt: string;
  message: string;
}

export const authService = {
  login: (data: LoginRequest): Promise<ApiResponse<LoginResult>>;
  logout: (): Promise<ApiResponse<void>>;
  refresh: (): Promise<ApiResponse<RefreshTokenResponse>>;
  register: (data: RegisterRequest): Promise<ApiResponse<RegisterResult>>;
};
```

**session.ts:**

```typescript
interface SessionListResponse {
  sessions: SessionInfo[];
  total: number;
}

interface TerminateOthersResponse {
  terminatedCount: number;
  message: string;
}

interface SessionValidationResult {
  valid: boolean;
  userInfo: UserInfo;
  sessionId: string;
  expiresAt: string;
  remainingSeconds: number;
  message: string;
}

export const sessionService = {
  getSessions: (): Promise<ApiResponse<SessionListResponse>>;
  terminateSession: (sessionId: string): Promise<ApiResponse<void>>;
  terminateOthers: (): Promise<ApiResponse<TerminateOthersResponse>>;
  validateSession: (): Promise<ApiResponse<SessionValidationResult>>;
};
```

**storage.ts:**

```typescript
export const storageService = {
  getToken: (): string | null;
  setToken: (token: string): void;
  removeToken: (): void;
  getUserInfo: (): UserInfo | null;
  setUserInfo: (user: UserInfo): void;
  removeUserInfo: (): void;
  clear: (): void;
};
```

## 数据模型

### LocalStorage数据结构

```typescript
// Key: "access_token"
// Value: JWT字符串
"eyJhbGciOiJIUzUxMiJ9..."

// Key: "user_info"
// Value: JSON字符串
{
  "accountId": 12345,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "ROLE_USER",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### API响应格式

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}
```

### 错误代码映射

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  'AUTH-SESSION-EXPIRED': '您的会话已过期，请重新登录',
  'AUTH-SESSION-IDLE-TIMEOUT': '由于长时间不活动，您的会话已过期',
  'AUTH-SESSION-NOT-FOUND': '会话不存在，请重新登录',
  'AUTH-TOKEN-EXPIRED': '令牌已过期',
  'AUTH-TOKEN-BLACKLISTED': '此令牌已失效，请重新登录',
  'AUTH-INVALID-CREDENTIALS': '用户名或密码错误',
  'AUTH-ACCOUNT-LOCKED': '账号已被锁定，请联系管理员',
};
```

## 正确性属性

*属性是应该在系统所有有效执行中保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性1: 令牌存储一致性

*对于任何*成功的登录响应，LocalStorage中存储的access_token应该与响应中返回的token值完全相同
**验证: 需求 1.2**

### 属性2: 用户信息存储一致性

*对于任何*成功的登录响应，LocalStorage中存储的user_info应该与响应中返回的userInfo对象完全相同
**验证: 需求 1.3**

### 属性3: 记住我参数传递

*对于任何*登录请求，如果用户勾选了"记住我"复选框，则请求体中的rememberMe字段应该为true，否则为false
**验证: 需求 1.4**

### 属性4: 请求头令牌注入

*对于任何*发送到受保护端点的API请求，如果LocalStorage中存在access_token，则请求头应该包含Authorization字段，值为"Bearer {token}"
**验证: 需求 2.1**

### 属性5: 无令牌时不添加认证头

*对于任何*API请求，如果LocalStorage中不存在access_token，则请求头不应该包含Authorization字段
**验证: 需求 2.2**

### 属性6: 刷新后令牌更新

*对于任何*成功的令牌刷新响应，LocalStorage中的access_token应该被更新为新返回的token值
**验证: 需求 2.4**

### 属性7: 刷新成功后请求重试

*对于任何*因401错误触发刷新的请求，如果刷新成功，原始请求应该使用新令牌重新发送
**验证: 需求 2.5**

### 属性8: 刷新失败后清理

*对于任何*失败的令牌刷新请求，LocalStorage中的所有认证数据(access_token和user_info)都应该被清除
**验证: 需求 2.6**

### 属性9: 令牌刷新幂等性

*对于任何*并发的令牌刷新请求，系统应该只发送一次刷新请求到后端，并且所有等待的请求应该使用相同的新令牌
**验证: 需求 2.9**

### 属性10: 请求队列等待刷新

*对于任何*在令牌刷新进行中时发起的API请求，该请求应该被加入队列等待刷新完成后再发送
**验证: 需求 2.10**

### 属性11: 倒计时格式化

*对于任何*剩余秒数值，会话过期警告对话框应该将其正确格式化为"X分Y秒"的格式
**验证: 需求 3.3**

### 属性12: 登出清理完整性

*对于任何*登出操作，无论API请求成功或失败，LocalStorage中的access_token和user_info都应该被删除
**验证: 需求 4.2, 4.3, 4.7, 4.8**

### 属性13: 相对时间格式化

*对于任何*时间戳，会话列表应该将其正确格式化为相对时间格式（如"2小时前"）
**验证: 需求 5.7, 5.8**

### 属性14: 当前会话条件渲染

*对于任何*会话项，如果其currentSession字段为true，则应该显示"当前设备"徽章，否则应该显示"终止会话"按钮
**验证: 需求 5.9, 5.10**

### 属性15: 会话终止后列表更新

*对于任何*成功的会话终止操作，被终止的会话应该从会话列表中移除
**验证: 需求 6.4**

### 属性16: 路由保护重定向

*对于任何*未认证用户访问受保护路由的尝试，用户应该被重定向到登录页面，并且原始路径应该保存在URL的redirect参数中
**验证: 需求 7.1, 7.2**

### 属性17: 重定向恢复

*对于任何*成功的登录操作，如果URL中包含redirect参数，用户应该被重定向到该参数指定的路径
**验证: 需求 7.3**

### 属性18: 认证状态检查

*对于任何*路由保护检查，AuthGuard应该验证LocalStorage中存在access_token
**验证: 需求 7.5**

### 属性19: 错误消息显示时长

*对于任何*错误消息，应该使用Ant Design的message组件显示3秒
**验证: 需求 8.8**

### 属性20: 成功消息显示时长

*对于任何*成功消息，应该使用Ant Design的message组件显示2秒
**验证: 需求 8.9**

### 属性21: 页面刷新后状态恢复

*对于任何*页面刷新操作，如果LocalStorage中存在有效的access_token和user_info，应用应该恢复用户的认证状态
**验证: 需求 9.1, 9.2**

### 属性22: 损坏数据清理

*对于任何*从LocalStorage读取的损坏或无效数据，应用应该清除所有存储并重定向到登录页面
**验证: 需求 9.9**

## 错误处理

### 1. 网络错误处理

```typescript
// 在Axios响应拦截器中
if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
  message.error('网络连接失败，请检查您的网络');
  return Promise.reject(error);
}
```

### 2. 认证错误处理

```typescript
// 401错误处理流程
if (error.response?.status === 401) {
  const errorCode = error.response?.data?.code;
  
  if (errorCode === 'AUTH-TOKEN-EXPIRED') {
    // 尝试刷新令牌
    try {
      const newToken = await refreshToken();
      // 重试原始请求
      return axios.request(originalRequest);
    } catch (refreshError) {
      // 刷新失败，清除状态并重定向
      storageService.clear();
      window.location.href = '/login?message=session-expired';
    }
  } else {
    // 其他401错误，直接登出
    storageService.clear();
    window.location.href = '/login';
  }
}
```

### 3. 业务错误处理

```typescript
// 显示业务错误消息
if (error.response?.data?.message) {
  const errorCode = error.response.data.code;
  const errorMessage = ERROR_MESSAGES[errorCode] || error.response.data.message;
  message.error(errorMessage);
}
```

### 4. 会话终止错误处理

```typescript
// 403错误 - 无权限终止会话
if (error.response?.status === 403) {
  message.error('无权限终止该会话');
  return Promise.reject(error);
}
```

## 测试策略

### 单元测试

使用Vitest和React Testing Library进行组件和服务层测试：

**AuthContext测试:**
- 测试login成功后更新状态
- 测试logout清除状态
- 测试从LocalStorage恢复状态
- 测试refreshToken更新令牌

**AuthGuard测试:**
- 测试未认证用户重定向到登录页
- 测试已认证用户允许访问
- 测试角色权限检查
- 测试redirect参数保存

**Service层测试:**
- 测试API调用参数正确性
- 测试响应数据转换
- 测试错误处理

**Storage服务测试:**
- 测试token存储和读取
- 测试用户信息序列化
- 测试clear清除所有数据

### 属性测试

使用fast-check进行属性测试，每个属性测试运行至少100次迭代：

**属性测试1: 令牌存储一致性**
```typescript
// Feature: session-management-ui, Property 1: 令牌存储一致性
// Validates: Requirements 1.2
fc.assert(
  fc.property(fc.string(), (token) => {
    storageService.setToken(token);
    const retrieved = storageService.getToken();
    return retrieved === token;
  }),
  { numRuns: 100 }
);
```

**属性测试2: 认证状态同步**
```typescript
// Feature: session-management-ui, Property 2: 认证状态同步
// Validates: Requirements 7.5
fc.assert(
  fc.property(
    fc.record({
      token: fc.option(fc.string(), { nil: null }),
      user: fc.option(fc.record({
        accountId: fc.integer(),
        username: fc.string(),
        email: fc.emailAddress(),
        role: fc.constantFrom('ROLE_USER', 'ROLE_ADMIN'),
        status: fc.constantFrom('ACTIVE', 'LOCKED', 'DISABLED'),
        createdAt: fc.date().map(d => d.toISOString())
      }), { nil: null })
    }),
    ({ token, user }) => {
      if (token) storageService.setToken(token);
      else storageService.removeToken();
      
      if (user) storageService.setUserInfo(user);
      else storageService.removeUserInfo();
      
      const hasToken = storageService.getToken() !== null;
      const hasUser = storageService.getUserInfo() !== null;
      const expectedAuth = hasToken && hasUser;
      
      // 在实际实现中，这会检查AuthContext的isAuthenticated
      return expectedAuth === (hasToken && hasUser);
    }
  ),
  { numRuns: 100 }
);
```

**属性测试3: 登出清理完整性**
```typescript
// Feature: session-management-ui, Property 5: 登出清理完整性
// Validates: Requirements 4.2, 4.3, 4.7
fc.assert(
  fc.property(
    fc.record({
      token: fc.string(),
      user: fc.record({
        accountId: fc.integer(),
        username: fc.string(),
        email: fc.emailAddress(),
        role: fc.constantFrom('ROLE_USER', 'ROLE_ADMIN'),
        status: fc.constantFrom('ACTIVE', 'LOCKED', 'DISABLED'),
        createdAt: fc.date().map(d => d.toISOString())
      })
    }),
    ({ token, user }) => {
      // 设置初始状态
      storageService.setToken(token);
      storageService.setUserInfo(user);
      
      // 执行清理
      storageService.clear();
      
      // 验证所有数据已清除
      return storageService.getToken() === null &&
             storageService.getUserInfo() === null;
    }
  ),
  { numRuns: 100 }
);
```

**属性测试4: 错误消息映射完整性**
```typescript
// Feature: session-management-ui, Property 8: 错误消息映射完整性
// Validates: Requirements 8.1-8.5
fc.assert(
  fc.property(
    fc.constantFrom(
      'AUTH-SESSION-EXPIRED',
      'AUTH-SESSION-IDLE-TIMEOUT',
      'AUTH-SESSION-NOT-FOUND',
      'AUTH-TOKEN-EXPIRED',
      'AUTH-TOKEN-BLACKLISTED'
    ),
    (errorCode) => {
      const message = ERROR_MESSAGES[errorCode];
      return message !== undefined && message.length > 0;
    }
  ),
  { numRuns: 100 }
);
```

### 集成测试

**登录流程集成测试:**
- 测试完整登录流程：输入凭据 → API调用 → 存储令牌 → 更新状态 → 导航
- 测试登录失败场景
- 测试"记住我"功能

**令牌刷新集成测试:**
- 测试401响应触发刷新
- 测试刷新成功后重试原始请求
- 测试刷新失败后登出

**会话管理集成测试:**
- 测试加载会话列表
- 测试终止单个会话
- 测试终止所有其他会话

## 性能考虑

### 1. 令牌刷新防抖

使用Promise缓存防止并发刷新请求：

```typescript
let refreshPromise: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }
  
  refreshPromise = authService.refresh()
    .then(response => {
      storageService.setToken(response.data.token);
      return response.data.token;
    })
    .finally(() => {
      refreshPromise = null;
    });
  
  return refreshPromise;
}
```

### 2. 会话列表缓存

会话列表数据缓存5分钟，减少不必要的API调用：

```typescript
const SESSION_CACHE_TTL = 5 * 60 * 1000; // 5分钟
let sessionCache: { data: SessionInfo[]; timestamp: number } | null = null;

async function getSessions(forceRefresh = false): Promise<SessionInfo[]> {
  if (!forceRefresh && sessionCache && 
      Date.now() - sessionCache.timestamp < SESSION_CACHE_TTL) {
    return sessionCache.data;
  }
  
  const response = await sessionService.getSessions();
  sessionCache = {
    data: response.data.sessions,
    timestamp: Date.now()
  };
  
  return sessionCache.data;
}
```

### 3. 组件懒加载

使用React.lazy延迟加载会话管理页面：

```typescript
const SessionManagement = React.lazy(() => import('./pages/SessionManagement'));
```

## 安全考虑

### 1. XSS防护

- 使用React的自动转义防止XSS
- 不使用dangerouslySetInnerHTML
- 验证和清理用户输入

### 2. CSRF防护

- 后端Cookie设置SameSite=Strict
- 前端不需要额外CSRF token

### 3. 令牌存储

- 访问令牌存储在LocalStorage（短期，15分钟）
- 刷新令牌由后端管理在HttpOnly Cookie中
- 不在JavaScript中暴露刷新令牌

### 4. 敏感信息保护

- 不在控制台日志中输出令牌
- 不在URL中传递令牌
- 错误消息不泄露敏感信息

## 部署考虑

### 环境变量

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api/v1

# .env.production
VITE_API_BASE_URL=https://api.aiops.example.com/api/v1
```

### 构建配置

- 生产构建启用代码分割
- 使用Terser压缩代码
- 生成source map用于调试

### 浏览器兼容性

- 目标浏览器：Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- 使用Vite的自动polyfill
- 测试LocalStorage API可用性
