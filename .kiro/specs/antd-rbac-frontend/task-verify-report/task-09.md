# 任务 9 验证报告：编写请求拦截器的属性测试

## 任务描述
- 编写请求自动添加 Token 属性测试（属性 26）
- 编写 401 错误触发重新登录属性测试（属性 14）

## 完成情况

| 项目 | 状态 | 说明 |
|------|------|------|
| 属性 26 测试 | ✅ | 请求自动添加 Token - 5 个不同 token 测试用例 |
| 属性 14 测试 | ✅ | 401 错误触发重新登录 - 清除 Token 并重定向 |

## 验证方法：单元测试

```bash
npm test -- --run src/utils/request.test.ts
```

**结果**: ✅ 测试通过

```
✓ src/utils/request.test.ts (8 tests) 10ms

Test Files  1 passed (1)
Tests       8 passed (8)
```

## 需求覆盖

- _需求 9.1_: 自动在请求头中添加 Authorization Bearer Token ✅
- _需求 6.1_: API 请求返回 401 未授权错误时清除 JWT Token 并重定向到登录页面 ✅
- _需求 9.2_: 401 错误拦截响应、清除 Session 并重定向到登录页面 ✅

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/utils/request.test.ts` | 请求拦截器属性测试 |

## 属性测试详情

### 属性 26：请求自动添加 Token

```typescript
// Feature: antd-rbac-frontend, Property 26: Request auto-adds Token
// 对于任何 API 请求，当用户已登录时，系统应该自动在请求头中添加 Authorization Bearer Token
describe('Request Interceptor - Property: Request auto-adds Token', () => {
  it('should add Authorization header when token exists', async () => {
    // 使用多个具体的 token 测试
    const tokens = [
      'jwt-token-12345',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      'test-token-abcdef',
      'Bearer-like-token-xyz',
      'long-token-' + 'a'.repeat(100),
    ]

    for (const token of tokens) {
      vi.mocked(tokenStorage.get).mockReturnValue(token)

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe(`Bearer ${token}`)
        return [200, { code: 0, message: 'success', data: null }]
      })

      await get('/test')
      mock.reset()
    }
  })

  it('should not add Authorization header when token does not exist', async () => {
    vi.mocked(tokenStorage.get).mockReturnValue(null)

    mock.onGet('/test').reply((config) => {
      expect(config.headers?.Authorization).toBeUndefined()
      return [200, { code: 0, message: 'success', data: null }]
    })

    await get('/test')
  })
})
```

### 属性 14：401 错误触发重新登录

```typescript
// Feature: antd-rbac-frontend, Property 14: 401 error triggers re-login
// 对于任何返回 401 状态码的 API 响应，系统应该清除 JWT Token 并重定向到登录页面
describe('Response Interceptor - Property 14: 401 triggers re-login', () => {
  it('should clear auth and redirect on 401 error', async () => {
    mock.onGet('/test').reply(401, { message: 'Unauthorized' })

    await expect(get('/test')).rejects.toThrow()

    expect(clearAuthStorage).toHaveBeenCalled()
    expect(redirectedPath).toBe('/login')
  })
})
```

## 测试配置

- 测试框架：Vitest + axios-mock-adapter
- Token 测试样例数：5 个不同格式的 token
- Mock 策略：使用 vi.mock 模拟 storage 和 antd 组件

## 验证结论

**任务 9 验证通过** ✅

验证时间: 2024-11-27
