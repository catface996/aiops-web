# 后端缺陷清单（快速参考）

**报告日期**: 2025-11-29  
**严重程度**: 🔴 高 - 阻塞前端验收

---

## 🔴 P0 - 必须立即修复

### BE-001: Session Validate API 返回 500 错误

**API**: `GET /api/v1/session/validate`  
**状态码**: 500  
**错误响应**:
```json
{
  "code": 500002,
  "message": "系统错误，请稍后重试",
  "data": null,
  "success": false
}
```

**影响**: 用户每次刷新页面都会被强制登出

**测试 Token**:
```
eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0NCIsInVzZXJuYW1lIjoidGVzdHVzZXI5OTkiLCJyb2xlIjoiUk9MRV9BRE1JTiIsImlhdCI6MTc2NDM5NzIxOSwiZXhwIjoxNzY0NDA0NDE5LCJzZXNzaW9uSWQiOiJhZGI4NzAwZi01OTYzLTRjMzktYjUwNi1kNzAzNTNjOWExNDkifQ.28sAnEIsYNmAToUsLAs93sZQGSEdlaFWPdIgGLKT9lMhpPkCrocyTrDvh_8hS-ojPBNGNxMCZNl2uuCrgu6IKw
```

**快速测试**:
```bash
curl -X GET http://localhost:8080/api/v1/session/validate \
  -H "Authorization: Bearer <token>" \
  -v
```

**期望结果**: 200 OK + 用户信息

---

### BE-002: 用户管理 API 返回 500 错误

**API**: `GET /api/v1/admin/accounts` (推测)  
**状态码**: 500  

**影响**: 管理员无法查看用户列表

**快速测试**:
```bash
# 1. 先登录获取管理员 Token
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"testuser999","password":"Test123!@#","rememberMe":false}'

# 2. 使用 Token 获取用户列表
curl -X GET http://localhost:8080/api/v1/admin/accounts \
  -H "Authorization: Bearer <admin_token>" \
  -v
```

**期望结果**: 200 OK + 用户列表

---

## 测试账号

| 用户名 | 密码 | 角色 | 用途 |
|--------|------|------|------|
| testuser999 | Test123!@# | ROLE_ADMIN | 管理员测试 |

---

## 数据库信息

**数据库**: aiops_local  
**表名**: t_account, t_session  
**连接**: Docker MySQL (localhost:3306)

**验证账号**:
```sql
SELECT id, username, email, role, status 
FROM aiops_local.t_account 
WHERE username = 'testuser999';
```

**验证会话**:
```sql
SELECT * 
FROM aiops_local.t_session 
WHERE session_id = 'adb8700f-5963-4c39-b506-d70353c9a149';
```

---

## 修复验证

修复后请执行以下步骤验证：

1. ✅ 登录系统
2. ✅ 刷新页面（不应该被登出）
3. ✅ 访问用户管理页面（应该显示用户列表）
4. ✅ 切换路由（会话应该保持）

---

## 详细报告

完整的缺陷分析和修复建议请查看: `BACKEND-ISSUES.md`
