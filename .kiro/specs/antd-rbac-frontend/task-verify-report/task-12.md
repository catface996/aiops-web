# 任务 12 验证报告：编写 AuthContext 的属性测试

## 任务描述
- 编写有效凭证登录成功属性测试（属性 6）
- 编写退出清除会话属性测试（属性 12）
- 编写角色信息正确存储属性测试（属性 9）

## 完成情况

| 项目 | 状态 | 说明 |
|------|------|------|
| 属性 6 测试 | ✅ | 有效凭证登录成功 - 20 次迭代 |
| 属性 12 测试 | ✅ | 退出清除会话 - 20 次迭代 |
| 属性 9 测试 | ✅ | 角色信息正确存储 - 20 次迭代 + ROLE_USER/ROLE_ADMIN 双重验证 |
| Token 存储一致性 | ✅ | 附加属性测试 - 50 次迭代 |

## 验证方法：单元测试

```bash
npm test -- --run src/contexts/AuthContext.property.test.tsx
```

**结果**: ✅ 测试通过

```
✓ src/contexts/AuthContext.property.test.tsx (5 tests) 1163ms

Test Files  1 passed (1)
Tests       5 passed (5)
```

### 全部测试

```bash
npm test -- --run
```

**结果**: ✅ 全部通过

```
Test Files  8 passed (8)
Tests       77 passed (77)
```

## 需求覆盖

- _需求 2.2_: 调用后端登录 API ✅
- _需求 2.3_: 接收并存储 JWT Token ✅
- _需求 2.6_: 将 Token 和用户信息存储到 LocalStorage ✅
- _需求 3.1_: 调用后端退出 API 使 Session 失效 ✅
- _需求 3.2_: 清除客户端 LocalStorage 中的 Token ✅
- _需求 3.3_: 退出后用户状态应该被清除 ✅
- _需求 4.1_: 提供用户认证状态 ✅

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/contexts/AuthContext.property.test.tsx` | AuthContext 属性测试 |

## 属性测试详情

### 属性 6：有效凭证登录成功

```typescript
// Feature: antd-rbac-frontend, Property 6: Valid credentials login success
// 对于任何有效的登录凭证，系统应该成功登录并存储用户信息
it('should successfully login with valid credentials and store user info', async () => {
  await fc.assert(
    fc.asyncProperty(validUser, validToken, async (user, token) => {
      // 登录前应该未认证
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')

      await act(async () => {
        await userSetup.click(screen.getByTestId('login-btn'))
      })

      // 登录后应该已认证
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')

      // Token 应该被存储
      expect(tokenStorage.set).toHaveBeenCalledWith(token)

      // 用户信息应该被存储
      expect(userStorage.set).toHaveBeenCalledWith(user)
    }),
    { numRuns: 20 }
  )
})
```

### 属性 12：退出清除会话

```typescript
// Feature: antd-rbac-frontend, Property 12: Logout clears session
// 对于任何已登录的用户，退出操作应该清除所有会话数据
it('should clear all session data when user logs out', async () => {
  await fc.assert(
    fc.asyncProperty(validUser, validToken, async (user, token) => {
      // 模拟已登录状态
      vi.mocked(tokenStorage.get).mockReturnValue(token)
      vi.mocked(userStorage.get).mockReturnValue(user)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user })

      await act(async () => {
        await userSetup.click(screen.getByTestId('logout-btn'))
      })

      // 退出后应该未认证
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')

      // 应该调用清除存储
      expect(clearAuthStorage).toHaveBeenCalled()
    }),
    { numRuns: 20 }
  )
})
```

### 属性 9：角色信息正确存储

```typescript
// Feature: antd-rbac-frontend, Property 9: Role information correctly stored
// 对于任何有效的用户角色，登录后角色信息应该被正确存储和显示
it('should correctly store and display user role after login', async () => {
  await fc.assert(
    fc.asyncProperty(validUser, validToken, async (user, token) => {
      await act(async () => {
        await userSetup.click(screen.getByTestId('login-btn'))
      })

      // 角色信息应该正确存储
      expect(screen.getByTestId('user-role')).toHaveTextContent(user.role)

      // 验证存储的用户信息包含正确的角色
      expect(userStorage.set).toHaveBeenCalledWith(
        expect.objectContaining({ role: user.role })
      )
    }),
    { numRuns: 20 }
  )
})
```

## 测试配置

- 测试框架：Vitest + fast-check + @testing-library/react
- 属性测试迭代次数：20-50 次
- 标记格式：`// Feature: antd-rbac-frontend, Property X: [property text]`

## 自定义 Arbitrary

| 名称 | 说明 |
|------|------|
| `validUsername` | 3-20 字符，字母数字下划线 |
| `validPassword` | 8-64 字符，包含大小写、数字、特殊字符 |
| `validEmail` | 有效邮箱格式，最大 100 字符 |
| `validRole` | ROLE_USER 或 ROLE_ADMIN |
| `validUser` | 完整用户对象 |
| `validToken` | 20-200 字符 JWT 风格 Token |

## 验证结论

**任务 12 验证通过** ✅

验证时间: 2024-11-27
