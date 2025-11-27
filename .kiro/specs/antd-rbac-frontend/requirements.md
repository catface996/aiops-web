# 需求文档

## 1. 简介

本系统是一个基于 Ant Design Pro 的前端应用，为 AIOps 平台提供用户界面。系统实现用户注册、登录、会话管理和基于角色的访问控制（RBAC）功能。

### 1.1 业务目标

- 提供安全的用户认证机制
- 实现基于角色的权限控制
- 提供友好的用户界面和交互体验
- 支持管理员进行用户管理和审计

### 1.2 系统范围

**包含功能**:
- 用户注册和登录（用户名/邮箱）
- 会话管理（Token 存储、过期处理）
- 基于角色的路由和菜单控制
- 用户管理（管理员）
- 审计日志查看（管理员）

**不包含功能**:
- 第三方登录（OAuth）
- 多因素认证（MFA）
- 密码找回功能
- 邮箱验证

### 1.3 用户角色

| 角色 | 描述 | 权限 |
|------|------|------|
| 普通用户 | 使用系统基础功能的用户 | 访问仪表盘、个人设置 |
| 系统管理员 | 管理系统和用户的管理员 | 所有普通用户权限 + 用户管理 + 审计日志查看 |

## 2. 术语表

### 2.1 业务术语

| 术语 | 定义 | 约束/说明 |
|------|------|----------|
| System（系统） | 本前端应用程序 | - |
| User（用户） | 使用系统的最终用户 | - |
| Account（账号） | 用户在系统中的账号实体 | - |
| Username（用户名） | 用户自定义的账号标识符 | 3-20个字符，仅字母数字下划线 |
| Email（邮箱） | 用户的电子邮件地址 | 可作为登录标识符，最大100字符 |
| Password（密码） | 用户的登录凭据 | 8-64个字符，需符合强度要求 |
| Role（角色） | 定义用户权限集合的标识符 | ROLE_USER（普通用户）、ROLE_ADMIN（管理员） |
| Session（会话） | 用户登录后的会话状态 | 默认2小时有效期 |
| JWT Token | JSON Web Token | 用于客户端会话管理 |
| Remember Me（记住我） | 延长会话有效期的选项 | 延长至30天 |
| Account Lock（账号锁定） | 安全保护机制 | 登录失败5次后锁定30分钟 |
| Route Guard（路由守卫） | 控制页面访问权限的前端机制 | - |
| Audit Log（审计日志） | 系统操作日志 | 用于安全审计 |

### 2.2 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Ant Design | 5.x | UI 组件库 |
| Ant Design Pro | 6.x | 中后台解决方案 |
| React Router | 6.x | 前端路由 |
| Axios | 最新稳定版 | HTTP 客户端 |
| Vite | 5.x | 构建工具 |
| Vitest | 最新稳定版 | 单元测试 |
| fast-check | 最新稳定版 | 属性测试 |

## 3. 功能需求

### 需求 1: 用户注册

**用户故事:** 作为一个新用户，我想要注册一个账户，以便我可以访问系统功能

**优先级:** MUST（必须）

#### 验收标准

1. WHEN User 访问注册页面 THEN THE System SHALL 显示包含 Username、Email、Password 和确认密码字段的注册表单
2. WHEN User 提交有效的注册信息 THEN THE System SHALL 调用后端注册 API、创建 Account 并显示成功消息
3. WHEN User 提交的 Password 与确认密码不匹配 THEN THE System SHALL 阻止提交并显示错误提示"两次输入的密码不一致"
4. WHEN User 提交的 Email 格式无效 THEN THE System SHALL 阻止提交并显示错误提示"邮箱格式无效"
5. WHEN User 提交的 Username 不符合规则 THEN THE System SHALL 阻止提交并显示错误提示"用户名必须为3-20个字符，只能包含字母、数字、下划线"
6. WHEN User 提交的 Password 不符合强度要求 THEN THE System SHALL 阻止提交并显示具体的密码要求错误消息
7. WHEN 后端返回 Email 已存在错误 THEN THE System SHALL 显示错误提示"该邮箱已被使用"
8. WHEN 后端返回 Username 已存在错误 THEN THE System SHALL 显示错误提示"该用户名已被使用"
9. WHEN User 注册成功 THEN THE System SHALL 自动跳转到登录页面

### 需求 2: 用户登录

**用户故事:** 作为一个已注册用户，我想要使用用户名或邮箱登录系统，以便我可以访问系统功能

**优先级:** MUST（必须）

#### 验收标准

1. WHEN User 访问登录页面 THEN THE System SHALL 显示包含用户名/邮箱、密码和"记住我"选项的登录表单
2. WHEN User 提交有效的 Username 和 Password THEN THE System SHALL 调用后端登录 API、接收 JWT Token 并重定向到首页
3. WHEN User 提交有效的 Email 和 Password THEN THE System SHALL 调用后端登录 API、接收 JWT Token 并重定向到首页
4. WHEN User 提交空的用户名/邮箱或密码 THEN THE System SHALL 阻止提交并显示错误提示"用户名和密码不能为空"
5. WHEN 后端返回认证失败错误 THEN THE System SHALL 显示错误消息"用户名或密码错误"
6. WHEN User 成功登录 THEN THE System SHALL 将 JWT Token 存储在 LocalStorage 中
7. WHEN User 勾选"记住我"选项 THEN THE System SHALL 在登录请求中包含 rememberMe 参数
8. WHEN User 未勾选"记住我"选项 THEN THE System SHALL 使用默认的 Session 过期时间

### 需求 3: 用户退出

**用户故事:** 作为一个已登录用户，我想要安全退出系统，以便保护我的账号安全

**优先级:** MUST（必须）

#### 验收标准

1. WHEN User 点击退出按钮 THEN THE System SHALL 调用后端退出 API 使 Session 失效
2. WHEN 退出 API 调用成功 THEN THE System SHALL 清除 LocalStorage 中的 JWT Token 和用户信息
3. WHEN User 退出后 THEN THE System SHALL 重定向 User 到登录页面
4. WHEN JWT Token 被清除后 THEN THE System SHALL 阻止 User 访问需要认证的页面

### 需求 4: 基于角色的访问控制

**用户故事:** 作为系统管理员，我想要根据用户角色控制页面访问，以便不同角色的用户看到不同的内容

**优先级:** MUST（必须）

#### 验收标准

1. WHEN User 登录成功 THEN THE System SHALL 从后端响应中获取 User 的 Role 信息并存储在应用状态中
2. WHEN THE System 初始化路由 THEN THE System SHALL 根据 User 的 Role 动态生成可访问的路由配置
3. WHEN User 尝试访问未授权的页面 THEN THE System SHALL 重定向到 403 权限拒绝页面
4. WHEN User 的 Role 为系统管理员 THEN THE System SHALL 显示包含用户管理和审计日志的完整菜单
5. WHEN User 的 Role 为普通用户 THEN THE System SHALL 仅显示基础功能菜单

### 需求 5: 导航菜单

**用户故事:** 作为一个用户，我想要看到清晰的导航菜单，以便我可以轻松访问我有权限的功能

**优先级:** MUST（必须）

#### 验收标准

1. WHEN User 登录后 THEN THE System SHALL 在侧边栏显示基于 Role 的导航菜单
2. WHEN User 的 Role 权限更新 THEN THE System SHALL 动态更新导航菜单项
3. WHEN User 点击菜单项 THEN THE System SHALL 使用 React Router 导航到对应的页面
4. WHEN 页面路由改变 THEN THE System SHALL 高亮显示当前激活的菜单项
5. WHEN 菜单项有子菜单 THEN THE System SHALL 支持展开和收起子菜单

### 需求 6: 会话管理

**用户故事:** 作为一个用户，我想要系统自动处理会话过期，以便我的会话安全且用户体验流畅

**优先级:** MUST（必须）

#### 验收标准

1. WHEN API 请求返回 401 未授权错误 THEN THE System SHALL 清除 JWT Token 并重定向到登录页面
2. WHEN Session 过期 THEN THE System SHALL 显示提示消息"会话已过期，请重新登录"
3. WHEN User 在多个标签页中操作 THEN THE System SHALL 使用 LocalStorage 事件在所有标签页中同步登录状态
4. WHEN User 在一个标签页退出登录 THEN THE System SHALL 在所有标签页中清除 Session 并重定向到登录页面

### 需求 7: 布局和主题

**用户故事:** 作为开发者，我想要使用 Ant Design Pro 的布局组件，以便快速构建专业的界面

**优先级:** MUST（必须）

#### 验收标准

1. THE System SHALL 使用 Ant Design Pro 6.x 版本的 ProLayout 组件作为主布局
2. THE System SHALL 集成 Ant Design 5.x 最新稳定版本的组件库
3. THE System SHALL 使用 React 18.x 作为前端框架
4. WHEN 页面加载 THEN THE System SHALL 显示包含顶部导航栏、侧边菜单和内容区域的布局
5. WHEN User 调整浏览器窗口大小 THEN THE System SHALL 响应式地调整布局
6. THE System SHALL 支持亮色和暗色主题切换

### 需求 8: 加载状态和错误提示

**用户故事:** 作为一个用户，我想要看到加载状态和错误提示，以便我了解系统的运行状态

**优先级:** MUST（必须）

#### 验收标准

1. WHEN THE System 发起 API 请求 THEN THE System SHALL 显示 Ant Design 的 Spin 加载指示器
2. WHEN API 请求成功完成 THEN THE System SHALL 隐藏加载指示器并显示结果
3. WHEN API 请求失败 THEN THE System SHALL 使用 Ant Design 的 message 组件显示友好的错误消息
4. WHEN 表单提交失败 THEN THE System SHALL 在表单字段旁显示具体的错误信息
5. WHEN 操作成功 THEN THE System SHALL 使用 Ant Design 的 message.success 显示成功提示

### 需求 9: API 请求拦截器

**用户故事:** 作为开发者，我想要实现 API 请求拦截器，以便统一处理认证和错误

**优先级:** MUST（必须）

#### 验收标准

1. WHEN THE System 发起 API 请求 THEN THE System SHALL 自动在请求头中添加 Authorization Bearer Token
2. WHEN API 返回 401 错误 THEN THE System SHALL 拦截响应、清除 Session 并重定向到登录页面
3. WHEN API 返回 403 错误 THEN THE System SHALL 拦截响应并重定向到 403 权限拒绝页面
4. WHEN API 返回 500 错误 THEN THE System SHALL 拦截响应并显示错误消息"服务器错误，请稍后重试"
5. WHEN 网络请求失败 THEN THE System SHALL 捕获错误并显示错误消息"网络连接失败，请检查网络设置"

### 需求 10: 用户偏好设置

**用户故事:** 作为一个用户，我想要系统记住我的偏好设置，以便每次使用时保持一致的体验

**优先级:** SHOULD（应该）

#### 验收标准

1. WHEN User 选择主题 THEN THE System SHALL 将主题偏好保存到 LocalStorage
2. WHEN User 下次访问系统 THEN THE System SHALL 从 LocalStorage 加载并应用保存的主题偏好
3. WHEN User 调整侧边栏宽度 THEN THE System SHALL 保存侧边栏宽度设置到 LocalStorage
4. WHEN User 折叠或展开侧边栏 THEN THE System SHALL 保存侧边栏状态到 LocalStorage
5. WHEN User 清除浏览器数据 THEN THE System SHALL 恢复到默认设置

### 需求 11: 登录失败提示

**用户故事:** 作为一个用户，我想要在登录失败时看到清晰的提示，以便我了解账号状态

**优先级:** MUST（必须）

#### 验收标准

1. WHEN 后端返回账号锁定错误 THEN THE System SHALL 显示错误消息"账号已锁定，请在X分钟后重试"并显示剩余锁定时间
2. WHEN User 多次登录失败但未锁定 THEN THE System SHALL 显示错误消息"用户名或密码错误"
3. WHEN 后端返回会话互斥错误 THEN THE System SHALL 显示提示消息"您的账号已在其他设备登录"
4. WHEN User 在被锁定期间尝试登录 THEN THE System SHALL 阻止提交并显示锁定状态

### 需求 12: 用户管理（管理员）

**用户故事:** 作为系统管理员，我想要查看和管理用户账号，以便维护系统安全

**优先级:** MUST（必须）

#### 验收标准

1. WHEN 管理员访问用户管理页面 THEN THE System SHALL 显示所有用户的列表，包含 Username、Email、Role 和账号状态
2. WHEN 管理员选择被锁定的 Account 并点击解锁按钮 THEN THE System SHALL 调用后端解锁 API 并刷新用户列表
3. WHEN 管理员解锁 Account 成功 THEN THE System SHALL 显示成功消息"账号已解锁"
4. WHEN 管理员尝试解锁未锁定的 Account THEN THE System SHALL 显示提示消息"该账号未被锁定"
5. WHEN 普通用户尝试访问用户管理页面 THEN THE System SHALL 重定向到 403 权限拒绝页面

### 需求 13: 审计日志（管理员）

**用户故事:** 作为系统管理员，我想要查看审计日志，以便进行安全审计和问题追踪

**优先级:** MUST（必须）

#### 验收标准

1. WHEN 管理员访问审计日志页面 THEN THE System SHALL 显示包含时间戳、用户名、操作类型、IP地址和结果的日志列表
2. WHEN 管理员使用筛选条件 THEN THE System SHALL 根据用户名、操作类型、时间范围筛选日志
3. WHEN 管理员点击日志条目 THEN THE System SHALL 显示该条目的详细信息
4. WHEN 日志列表超过一页 THEN THE System SHALL 提供分页功能
5. WHEN 普通用户尝试访问审计日志页面 THEN THE System SHALL 重定向到 403 权限拒绝页面

### 需求 14: 密码强度验证

**用户故事:** 作为开发者，我想要实现密码强度验证，以便确保用户设置安全的密码

**优先级:** MUST（必须）

#### 验收标准

1. WHEN User 输入 Password THEN THE System SHALL 实时显示密码强度指示器
2. WHEN Password 长度少于 8 个字符 THEN THE System SHALL 显示错误提示"密码长度至少为8个字符"
3. WHEN Password 不包含至少 3 类字符（大写字母、小写字母、数字、特殊字符）THEN THE System SHALL 显示错误提示"密码必须包含大写字母、小写字母、数字、特殊字符中的至少3类"
4. WHEN Password 包含 Username 或 Email 的任何部分 THEN THE System SHALL 显示错误提示"密码不能包含用户名或邮箱"
5. WHEN Password 符合所有要求 THEN THE System SHALL 显示绿色的强度指示器

### 需求 15: 路由守卫

**用户故事:** 作为开发者，我想要实现路由守卫，以便保护需要认证的页面

**优先级:** MUST（必须）

#### 验收标准

1. WHEN User 未登录且访问受保护的页面 THEN THE System SHALL 重定向到登录页面
2. WHEN User 登录后 THEN THE System SHALL 重定向到原本要访问的页面
3. WHEN User 已登录且访问登录页面 THEN THE System SHALL 重定向到首页
4. WHEN User 的 JWT Token 无效 THEN THE System SHALL 清除 Token 并重定向到登录页面
5. WHEN User 访问不存在的路由 THEN THE System SHALL 显示 404 页面
