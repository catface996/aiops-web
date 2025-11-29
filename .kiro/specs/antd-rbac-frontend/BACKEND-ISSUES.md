# 后端 API 缺陷报告

**报告日期**: 2025-11-29  
**测试环境**: 
- 前端: http://localhost:3000
- 后端: http://localhost:8080
- 数据库: MySQL 8.0 (Docker)

**报告人**: Kiro AI Assistant  
**严重程度**: 🔴 高 - 阻塞前端验收

---

## 缺陷概览

| 缺陷ID | API端点 | 严重程度 | 状态 | 影响 |
|--------|---------|----------|------|------|
| BE-001 | GET /api/v1/session/validate | 🔴 高 | 待修复 | 用户被强制登出 |
| BE-002 | GET /api/v1/admin/accounts | 🔴 高 | 待修复 | 用户管理功能不可用 |

---

## 缺陷 BE-001: Session Validate API 返回 500 错误

### 基本信息

- **API 端点**: `GET /api/v1/session/validate`
- **HTTP 状态码**: 500 Internal Server Error
- **严重程度**: 🔴 高
- **影响范围**: 所有已登录用户
- **发现时间**: 2025-11-29 14:22

### 问题描述

当前端调用 `/api/v1/session/validate` 验证会话有效性时，后端返回 500 错误，导致前端认为会话无效，清除用户 Token 并强制用户重新登录。

### 重现步骤

1. 用户成功登录系统（用户名: testuser999, 密码: Test123!@#）
2. 登录成功后获得 JWT Token
3. 前端在页面加载时调用 `/api/v1/session/validate` 验证会话
4. 后端返回 500 错误

### 请求详情

**请求方法**: GET  
**请求 URL**: http://localhost:3000/api/v1/session/validate  
**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0NCIsInVzZXJuYW1lIjoidGVzdHVzZXI5OTkiLCJyb2xlIjoiUk9MRV9BRE1JTiIsImlhdCI6MTc2NDM5NzIxOSwiZXhwIjoxNzY0NDA0NDE5LCJzZXNzaW9uSWQiOiJhZGI4NzAwZi01OTYzLTRjMzktYjUwNi1kNzAzNTNjOWExNDkifQ.28sAnEIsYNmAToUsLAs93sZQGSEdlaFWPdIgGLKT9lMhpPkCrocyTrDvh_8hS-ojPBNGNxMCZNl2uuCrgu6IKw
Accept: application/json, text/plain, */*
```

### 响应详情

**HTTP 状态码**: 500  
**响应头**:
```
Content-Type: application/json
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
```

**响应体**:
```json
{
  "code": 500002,
  "message": "系统错误，请稍后重试",
  "data": null,
  "success": false
}
```

### JWT Token 解析

**Token Payload**:
```json
{
  "sub": "44",
  "username": "testuser999",
  "role": "ROLE_ADMIN",
  "iat": 1764397219,
  "exp": 1764404419,
  "sessionId": "adb8700f-5963-4c39-b506-d70353c9a149"
}
```

**Token 信息**:
- 用户ID: 44
- 用户名: testuser999
- 角色: ROLE_ADMIN
- 签发时间: 2025-11-29 06:20:19 UTC
- 过期时间: 2025-11-29 08:20:19 UTC (2小时有效期)
- Session ID: adb8700f-5963-4c39-b506-d70353c9a149

### 数据库状态

**账号信息** (t_account 表):
```sql
SELECT id, username, email, role, status 
FROM t_account 
WHERE username = 'testuser999';
```

**结果**:
```
id: 44
username: testuser999
email: testuser999@test.com
role: ROLE_ADMIN
status: ACTIVE
```

**会话信息** (t_session 表):
需要检查 sessionId 为 `adb8700f-5963-4c39-b506-d70353c9a149` 的记录是否存在。

### 影响

1. **用户体验严重受损**: 用户每次刷新页面或切换路由都会被强制登出
2. **功能完全不可用**: 用户无法正常使用系统
3. **阻塞前端验收**: 前端无法完成完整的功能测试

### 可能的原因

1. Session 表中没有对应的 sessionId 记录
2. Session 验证逻辑存在 bug
3. 数据库连接或查询异常
4. JWT Token 签名验证失败
5. 角色权限验证逻辑错误

### 建议修复方案

1. **检查后端日志**: 查看详细的异常堆栈信息
2. **验证 Session 表**: 确认 sessionId 记录是否存在
3. **检查 JWT 验证逻辑**: 确保 Token 签名和过期时间验证正确
4. **添加详细日志**: 在 session/validate 方法中添加调试日志
5. **单元测试**: 为 session/validate 添加单元测试覆盖

### 测试用例

**测试用例 1: 有效 Token 验证**
```bash
curl -X GET http://localhost:8080/api/v1/session/validate \
  -H "Authorization: Bearer <valid_token>" \
  -H "Content-Type: application/json"
```
**期望结果**: 200 OK, 返回用户信息

**测试用例 2: 过期 Token 验证**
```bash
curl -X GET http://localhost:8080/api/v1/session/validate \
  -H "Authorization: Bearer <expired_token>" \
  -H "Content-Type: application/json"
```
**期望结果**: 401 Unauthorized

**测试用例 3: 无效 Token 验证**
```bash
curl -X GET http://localhost:8080/api/v1/session/validate \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json"
```
**期望结果**: 401 Unauthorized

---

## 缺陷 BE-002: 用户管理 API 返回 500 错误

### 基本信息

- **API 端点**: `GET /api/v1/admin/accounts` (推测)
- **HTTP 状态码**: 500 Internal Server Error
- **严重程度**: 🔴 高
- **影响范围**: 管理员用户
- **发现时间**: 2025-11-29 14:25

### 问题描述

管理员访问用户管理页面时，前端调用获取用户列表的 API，后端返回 500 错误，导致页面显示"服务器错误，请稍后重试"和"获取用户列表失败"。

### 重现步骤

1. 使用管理员账号登录（用户名: testuser999, 角色: ROLE_ADMIN）
2. 点击侧边栏"用户管理"菜单
3. 页面跳转到 /users
4. 前端调用用户列表 API
5. 后端返回 500 错误
6. 页面显示错误消息和空表格

### 前端页面状态

**URL**: http://localhost:3000/users  
**页面标题**: 用户管理 - AIOps

**显示的错误消息**:
- "服务器错误，请稍后重试" (出现2次)
- "获取用户列表失败" (出现2次)

**表格状态**: 显示"暂无数据"

### 影响

1. **管理员功能不可用**: 管理员无法查看用户列表
2. **无法管理用户**: 无法执行解锁账号等操作
3. **阻塞功能验收**: 用户管理功能无法测试

### 可能的原因

1. API 端点路径错误或不存在
2. 权限验证逻辑错误
3. 数据库查询异常
4. 分页参数处理错误
5. 数据序列化错误

### 建议修复方案

1. **确认 API 端点**: 检查用户管理 API 的正确路径
2. **检查权限验证**: 确保 ROLE_ADMIN 有权限访问
3. **验证数据库查询**: 测试查询所有用户的 SQL
4. **检查后端日志**: 查看详细的异常信息
5. **添加单元测试**: 为用户管理 API 添加测试

### 数据库验证

**查询所有用户**:
```sql
SELECT id, username, email, role, status, created_at, updated_at
FROM t_account
ORDER BY created_at DESC;
```

**结果**: 数据库中有 43 个用户记录，查询正常

### 测试用例

**测试用例 1: 获取用户列表（管理员）**
```bash
curl -X GET http://localhost:8080/api/v1/admin/accounts \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```
**期望结果**: 200 OK, 返回用户列表

**测试用例 2: 获取用户列表（普通用户）**
```bash
curl -X GET http://localhost:8080/api/v1/admin/accounts \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json"
```
**期望结果**: 403 Forbidden

**测试用例 3: 获取用户列表（分页）**
```bash
curl -X GET "http://localhost:8080/api/v1/admin/accounts?page=0&size=10" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```
**期望结果**: 200 OK, 返回分页数据

---

## 前端相关信息

### 前端 API 调用代码

**用户管理页面**: `src/pages/Users/index.tsx`

前端期望的 API 响应格式:
```typescript
interface ApiResponse<T> {
  code: number;      // 0 表示成功
  message: string;
  data: T | null;
  success: boolean;
}

interface User {
  userId: number;
  username: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  isLocked?: boolean;
  lockUntil?: string;
}
```

### 前端错误处理

前端在 `src/utils/request.ts` 中配置了响应拦截器：
- 500 错误: 显示"服务器错误，请稍后重试"
- 401 错误: 清除 Token，重定向到登录页
- 403 错误: 重定向到 403 页面

---

## 修复优先级

### P0 - 最高优先级（阻塞验收）

1. ✅ **BE-001: Session Validate API 500 错误**
   - 影响: 所有用户无法正常使用系统
   - 预计修复时间: 2-4小时

2. ✅ **BE-002: 用户管理 API 500 错误**
   - 影响: 管理员功能完全不可用
   - 预计修复时间: 1-2小时

### P1 - 高优先级（建议修复）

3. 审计日志 API - 未测试，可能存在类似问题

---

## 测试建议

### 修复后的验证步骤

1. **验证 Session Validate API**:
   ```bash
   # 1. 登录获取 Token
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"identifier":"testuser999","password":"Test123!@#","rememberMe":false}'
   
   # 2. 使用 Token 验证会话
   curl -X GET http://localhost:8080/api/v1/session/validate \
     -H "Authorization: Bearer <token>"
   
   # 期望: 200 OK, 返回用户信息
   ```

2. **验证用户管理 API**:
   ```bash
   # 使用管理员 Token 获取用户列表
   curl -X GET http://localhost:8080/api/v1/admin/accounts \
     -H "Authorization: Bearer <admin_token>"
   
   # 期望: 200 OK, 返回用户列表
   ```

3. **前端完整测试**:
   - 登录系统
   - 刷新页面（验证会话保持）
   - 访问用户管理页面（验证列表加载）
   - 切换路由（验证会话不丢失）

---

## 联系方式

如需更多信息或协助调试，请联系前端团队。

**前端测试环境**: http://localhost:3000  
**后端测试环境**: http://localhost:8080  
**测试账号**: testuser999 / Test123!@#  
**测试角色**: ROLE_ADMIN

---

**报告生成时间**: 2025-11-29 15:30  
**报告版本**: v1.0
