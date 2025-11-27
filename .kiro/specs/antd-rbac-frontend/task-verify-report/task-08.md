# 任务 8 验证报告：实现响应拦截器

## 任务描述
- 处理成功响应（code === 0）
- 处理 401 错误（清除 Token，重定向到登录页）
- 处理 403 错误（重定向到 403 页面）
- 处理 423 错误（账号锁定，显示剩余时间）
- 处理 500 错误和网络错误

## 完成情况

| 项目 | 状态 | 说明 |
|------|------|------|
| 成功响应处理 | ✅ | `code === 0` 时返回数据 |
| 业务错误处理 | ✅ | `code !== 0` 时显示错误消息并 reject |
| 401 错误处理 | ✅ | 清除 Token，显示提示，重定向到 `/login` |
| 403 错误处理 | ✅ | 显示提示，重定向到 `/403` |
| 423 错误处理 | ✅ | 显示账号锁定消息 |
| 409 错误处理 | ✅ | 显示资源冲突消息 |
| 400 错误处理 | ✅ | 显示请求参数无效消息 |
| 500 错误处理 | ✅ | 显示服务器错误消息 |
| 网络错误处理 | ✅ | 显示网络连接失败消息 |

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

- _需求 6.1_: API 请求返回 401 未授权错误时清除 JWT Token 并重定向到登录页面 ✅
- _需求 9.2_: 401 错误拦截响应、清除 Session 并重定向到登录页面 ✅
- _需求 9.3_: 403 错误拦截响应并重定向到 403 权限拒绝页面 ✅
- _需求 9.4_: 500 错误拦截响应并显示错误消息"服务器错误，请稍后重试" ✅
- _需求 9.5_: 网络请求失败捕获错误并显示错误消息"网络连接失败，请检查网络设置" ✅
- _需求 11.1_: 账号锁定错误显示消息"账号已锁定，请在X分钟后重试" ✅

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/utils/request.ts` | 响应拦截器实现 |
| `src/utils/request.test.ts` | 响应拦截器测试 |

## 代码实现详情

### 响应拦截器实现
```typescript
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const { data } = response

    // 开发环境下打印响应日志
    if (import.meta.env.DEV) {
      console.log(`[Response] ${response.config.url}`, data)
    }

    // 检查业务状态码
    if (data.code !== 0) {
      message.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }

    return response
  },
  (error: AxiosError<ErrorResponse>) => {
    const { response } = error

    if (!response) {
      // 需求 9.5: 网络请求失败显示错误消息
      message.error('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }

    const { status, data } = response

    switch (status) {
      case 401:
        // 需求 9.2, 6.1: 401 错误清除 Token 并重定向到登录页
        clearAuthStorage()
        message.error('会话已过期，请重新登录')
        redirectHandler('/login')
        break

      case 403:
        // 需求 9.3: 403 错误重定向到 403 页面
        message.error('您没有权限访问此资源')
        redirectHandler('/403')
        break

      case 423:
        // 需求 11.1: 账号锁定错误
        const lockMessage = data?.message || '账号已锁定，请稍后重试'
        message.error(lockMessage)
        break

      case 409:
        message.error(data?.message || '资源已存在')
        break

      case 400:
        message.error(data?.message || '请求参数无效')
        break

      case 500:
      default:
        // 需求 9.4: 500 错误显示服务器错误消息
        message.error('服务器错误，请稍后重试')
        break
    }

    return Promise.reject(error)
  }
)
```

## 测试验证

### 401 错误处理测试
```typescript
// Feature: antd-rbac-frontend, Property 14: 401 triggers re-login
it('should clear auth and redirect on 401 error', async () => {
  mock.onGet('/test').reply(401, { message: 'Unauthorized' })

  await expect(get('/test')).rejects.toThrow()

  expect(clearAuthStorage).toHaveBeenCalled()
  expect(redirectedPath).toBe('/login')
})
```

### 403 错误处理测试
```typescript
it('should redirect to 403 page on 403 error', async () => {
  mock.onGet('/test').reply(403, { message: 'Forbidden' })

  await expect(get('/test')).rejects.toThrow()

  expect(redirectedPath).toBe('/403')
})
```

### 423 账号锁定处理测试
```typescript
it('should handle 423 account locked error', async () => {
  const lockMessage = '账号已锁定，请在30分钟后重试'
  mock.onGet('/test').reply(423, { message: lockMessage })

  await expect(get('/test')).rejects.toThrow()
})
```

### 业务错误处理测试
```typescript
it('should reject on business error code', async () => {
  mock.onGet('/test').reply(200, { code: 1001, message: '业务错误', data: null })

  await expect(get('/test')).rejects.toThrow('业务错误')
})
```

### 成功响应处理测试
```typescript
it('should return data on successful response', async () => {
  const testData = { id: 1, name: 'test' }
  mock.onGet('/test').reply(200, { code: 0, message: 'success', data: testData })

  const response = await get<{ id: number; name: string }>('/test')
  expect(response.data).toEqual(testData)
})
```

## 验证结论

**任务 8 验证通过** ✅

验证时间: 2024-11-27
