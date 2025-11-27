# 任务 7 验证报告：配置 Axios 实例和请求拦截器

## 任务描述
- 创建 Axios 实例，配置 baseURL 为 /api/v1
- 配置超时时间（10秒）
- 实现请求拦截器（自动添加 Authorization Bearer Token）
- 添加请求日志（仅开发环境）

## 完成情况

| 项目 | 状态 | 说明 |
|------|------|------|
| Axios 实例创建 | ✅ | baseURL 从环境变量读取，默认 `/api/v1` |
| 超时配置 | ✅ | 10000ms (10秒) |
| 请求拦截器 | ✅ | 自动添加 `Authorization: Bearer {token}` |
| 请求日志 | ✅ | 仅在 `import.meta.env.DEV` 时输出 |
| Content-Type | ✅ | 默认 `application/json` |

## 验证方法：单元测试

```bash
npm test
```

**结果**: ✅ 测试通过

```
✓ src/utils/request.test.ts (8 tests) 27ms

Test Files  3 passed (3)
Tests       46 passed (46)
```

## 需求覆盖

- _需求 9.1_: 自动在请求头中添加 Authorization Bearer Token ✅

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/utils/request.ts` | Axios 实例和拦截器配置 |

## 代码实现详情

### Axios 实例配置
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### 请求拦截器实现
```typescript
// 需求 9.1: 自动在请求头中添加 Authorization Bearer Token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 开发环境下打印请求日志
    if (import.meta.env.DEV) {
      console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)
```

### 导出的便捷方法
```typescript
export const get = <T>(url: string, params?: Record<string, unknown>) =>
  request.get<ApiResponse<T>>(url, { params }).then((res) => res.data)

export const post = <T>(url: string, data?: unknown) =>
  request.post<ApiResponse<T>>(url, data).then((res) => res.data)

export const put = <T>(url: string, data?: unknown) =>
  request.put<ApiResponse<T>>(url, data).then((res) => res.data)

export const del = <T>(url: string) =>
  request.delete<ApiResponse<T>>(url).then((res) => res.data)
```

## 测试验证

### Token 自动添加测试
```typescript
it('should add Authorization header when token exists', async () => {
  const tokens = [
    'jwt-token-12345',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    'test-token-abcdef',
  ]

  for (const token of tokens) {
    vi.mocked(tokenStorage.get).mockReturnValue(token)

    mock.onGet('/test').reply((config) => {
      expect(config.headers?.Authorization).toBe(`Bearer ${token}`)
      return [200, { code: 0, message: 'success', data: null }]
    })

    await get('/test')
  }
})
```

### 无 Token 时不添加 Header 测试
```typescript
it('should not add Authorization header when token does not exist', async () => {
  vi.mocked(tokenStorage.get).mockReturnValue(null)

  mock.onGet('/test').reply((config) => {
    expect(config.headers?.Authorization).toBeUndefined()
    return [200, { code: 0, message: 'success', data: null }]
  })

  await get('/test')
})
```

## 验证结论

**任务 7 验证通过** ✅

验证时间: 2024-11-27
