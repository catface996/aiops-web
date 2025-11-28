# 实现计划

## 任务列表

- [x] 1. 初始化项目和配置开发环境 ✅
  - 使用 Vite 创建 React + TypeScript 项目
  - 安装核心依赖（React 18.x, Ant Design 5.x, Ant Design Pro 6.x, React Router 6.x, Axios, Vitest, fast-check）
  - 配置 TypeScript 严格模式、ESLint、Prettier
  - 配置 Vite 开发服务器（代理 /api/v1 到后端）
  - 创建项目目录结构
  - 配置环境变量文件
  - **验证方法**: 【构建验证】执行 `npm run build` 确保项目构建成功，检查目录结构完整性
  - _需求: 7.1, 7.2, 7.3_
  - **验证报告**: [task-01.md](./task-verify-report/task-01.md)

- [x] 2. 实现类型定义系统 ✅
  - 创建 API 类型定义（ApiResponse, ErrorResponse, 所有请求/响应类型）
  - 创建用户类型定义（User, UserRole, UserInfo）
  - 创建路由类型定义（RouteConfig）
  - **验证方法**: 【构建验证】执行 `npm run build` 确保类型定义无错误
  - _需求: 所有 API 调用的基础_
  - **验证报告**: [task-02.md](./task-verify-report/task-02.md)

- [x] 3. 实现 LocalStorage 存储工具 ✅
  - 实现 Token 存储和读取方法
  - 实现用户信息存储和读取方法
  - 实现主题偏好存储和读取方法
  - 实现侧边栏状态存储和读取方法
  - 实现清除所有数据方法
  - **验证方法**: 【单元测试】执行单元测试验证所有存储方法正确工作
  - _需求: 2.6, 3.2, 10.1, 10.2, 10.3, 10.4_
  - **验证报告**: [task-03.md](./task-verify-report/task-03.md)

- [x] 4. 编写 LocalStorage 工具的属性测试 ✅
  - 编写主题偏好持久化属性测试（属性 15）
  - 编写侧边栏状态持久化属性测试（属性 16）
  - 编写 LocalStorage 清空恢复默认属性测试
  - **验证方法**: 【单元测试】执行 `npm test` 确保所有属性测试通过（至少 100 次迭代）
  - _需求: 10.1, 10.2, 10.3, 10.4, 10.5_
  - **验证报告**: [task-04.md](./task-verify-report/task-04.md)

- [x] 5. 实现表单验证工具 ✅
  - 实现邮箱格式验证函数（最大 100 字符）
  - 实现用户名规则验证函数（3-20 字符，字母数字下划线）
  - 实现密码强度验证函数（8-64 字符，强度检查）
  - 实现密码强度等级计算函数
  - **验证方法**: 【单元测试】执行单元测试验证所有验证函数正确工作
  - _需求: 1.4, 1.5, 1.6, 14.2, 14.3, 14.4_
  - **验证报告**: [task-05.md](./task-verify-report/task-05.md)

- [x] 6. 编写表单验证工具的属性测试 ✅
  - 编写邮箱验证属性测试（属性 3）
  - 编写用户名验证属性测试（属性 4）
  - 编写密码强度验证属性测试（属性 5, 18, 19, 20）
  - **验证方法**: 【单元测试】执行 `npm test` 确保所有属性测试通过（至少 100 次迭代）
  - _需求: 1.4, 1.5, 1.6, 14.2, 14.3, 14.4_
  - **验证报告**: [task-06.md](./task-verify-report/task-06.md)

- [x] 7. 配置 Axios 实例和请求拦截器 ✅
  - 创建 Axios 实例，配置 baseURL 为 /api/v1
  - 配置超时时间（10秒）
  - 实现请求拦截器（自动添加 Authorization Bearer Token）
  - 添加请求日志（仅开发环境）
  - **验证方法**: 【单元测试】Mock Axios 请求，验证 Token 自动添加到请求头
  - _需求: 9.1_
  - **验证报告**: [task-07.md](./task-verify-report/task-07.md)

- [x] 8. 实现响应拦截器 ✅
  - 处理成功响应（code === 0）
  - 处理 401 错误（清除 Token，重定向到登录页）
  - 处理 403 错误（重定向到 403 页面）
  - 处理 423 错误（账号锁定，显示剩余时间）
  - 处理 500 错误和网络错误
  - **验证方法**: 【单元测试】Mock 不同错误响应，验证拦截器正确处理
  - _需求: 6.1, 9.2, 9.3, 9.4, 9.5, 11.1_
  - **验证报告**: [task-08.md](./task-verify-report/task-08.md)

- [x] 9. 编写请求拦截器的属性测试 ✅
  - 编写请求自动添加 Token 属性测试（属性 26）
  - 编写 401 错误触发重新登录属性测试（属性 14）
  - **验证方法**: 【单元测试】执行 `npm test` 确保属性测试通过
  - _需求: 9.1, 6.1, 9.2_
  - **验证报告**: [task-09.md](./task-verify-report/task-09.md)

- [x] 10. 实现 API 服务层 ✅
  - 实现认证服务（register, login, logout）
  - 实现会话服务（validateSession, forceLogoutOthers）
  - 实现管理员服务（unlockAccount）
  - **验证方法**: 【单元测试】Mock Axios 调用，验证服务方法正确调用 API
  - _需求: 1.2, 2.2, 2.3, 3.1, 6.1, 12.2_
  - **验证报告**: [task-10.md](./task-verify-report/task-10.md)

- [x] 11. 实现认证上下文（AuthContext）✅
  - 创建 AuthContext 和 AuthProvider
  - 实现 login 方法（调用 API，存储 Token 和用户信息）
  - 实现 logout 方法（调用 API，清除 Token 和用户信息）
  - 实现 register 方法（调用 API）
  - 实现 checkAuth 方法（验证 Token 有效性）
  - 在组件挂载时从 LocalStorage 恢复用户状态
  - **验证方法**: 【单元测试】测试 AuthContext 的所有方法和状态变化
  - _需求: 2.2, 2.6, 3.1, 3.2, 4.1_
  - **验证报告**: [task-11.md](./task-verify-report/task-11.md)

- [x] 12. 编写 AuthContext 的属性测试 ✅
  - 编写有效凭证登录成功属性测试（属性 6）
  - 编写退出清除会话属性测试（属性 12）
  - 编写角色信息正确存储属性测试（属性 9）
  - **验证方法**: 【单元测试】执行 `npm test` 确保属性测试通过
  - _需求: 2.2, 2.3, 2.6, 3.1, 3.2, 3.3, 4.1_
  - **验证报告**: [task-12.md](./task-verify-report/task-12.md)

- [x] 13. 实现自定义 Hooks ✅
  - 实现 useAuth Hook（封装 AuthContext）
  - 实现 usePermission Hook（hasRole, hasAnyRole, canAccessRoute）
  - **验证方法**: 【单元测试】测试 Hooks 的返回值和行为
  - _需求: 4.2, 4.3_
  - **验证报告**: [task-13.md](./task-verify-report/task-13.md)

- [x] 14. 实现路由守卫组件（AuthGuard）✅
  - 检查用户是否已登录
  - 检查用户角色权限
  - 未登录时重定向到登录页，并记录原始路径
  - 无权限时重定向到 403 页面
  - **验证方法**: 【单元测试】测试不同场景下的重定向行为
  - _需求: 3.4, 4.3, 15.1_
  - **验证报告**: [task-14.md](./task-verify-report/task-14.md)

- [x] 15. 编写 AuthGuard 的属性测试 ✅
  - 编写 Token 清除后阻止访问属性测试（属性 13）
  - 编写未授权访问被拒绝属性测试（属性 11）
  - **验证方法**: 【单元测试】执行 `npm test` 确保属性测试通过
  - _需求: 3.4, 15.1, 4.3, 12.5, 13.5_
  - **验证报告**: [task-15.md](./task-verify-report/task-15.md)

- [x] 16. 配置路由系统 ✅
  - 定义公开路由（/login, /register, /404, /403）
  - 定义受保护路由（/dashboard, /users, /audit）
  - 使用 AuthGuard 包装受保护路由
  - 配置管理员专属路由（/users, /audit）
  - 配置 404 路由（* 通配符）
  - **验证方法**: 【运行时验证】启动应用，访问不同路由，验证权限控制正确
  - _需求: 4.2, 4.3, 15.1, 15.5_
  - **验证报告**: [task-16.md](./task-verify-report/task-16.md)

- [x] 17. 编写路由配置的属性测试 ✅
  - 编写路由根据角色过滤属性测试（属性 10）
  - **验证方法**: 【单元测试】执行 `npm test` 确保属性测试通过
  - _需求: 4.2_
  - **验证报告**: [task-17.md](./task-verify-report/task-17.md)

- [x] 18. 实现 PasswordStrength 组件 ✅
  - 接收 password, username, email 作为 props
  - 实时计算密码强度（弱、中、强）
  - 显示强度指示器（红色、黄色、绿色）
  - 显示具体的错误提示
  - **验证方法**: 【单元测试】测试不同密码输入的强度显示
  - _需求: 14.1, 14.2, 14.3, 14.4, 14.5_
  - **验证报告**: [task-18.md](./task-verify-report/task-18.md)

- [x] 19. 编写 PasswordStrength 的属性测试 ✅
  - 编写密码强度实时更新属性测试（属性 17）
  - **验证方法**: 【单元测试】执行 `npm test` 确保属性测试通过
  - _需求: 14.1, 14.5_
  - **验证报告**: [task-19.md](./task-verify-report/task-19.md)

- [x] 20. 实现 ErrorBoundary 组件 ✅
  - 实现 componentDidCatch 捕获组件错误
  - 显示友好的错误页面
  - 记录错误到控制台
  - **验证方法**: 【单元测试】触发错误，验证 ErrorBoundary 正确捕获
  - _需求: 8.3_
  - **验证报告**: [task-20.md](./task-verify-report/task-20.md)

- [x] 21. 实现 UserLayout 布局 ✅
  - 创建用于登录、注册页面的简单布局
  - 居中显示表单
  - 显示系统标题和 Logo
  - **验证方法**: 【运行时验证】启动应用，访问登录页，验证布局正确显示
  - _需求: 1.1, 2.1_
  - **验证报告**: [task-21.md](./task-verify-report/task-21.md)

- [x] 22. 实现 BasicLayout 布局 ✅
  - 使用 Ant Design Pro 的 ProLayout 组件
  - 配置顶部导航栏（显示用户信息、主题切换、退出按钮）
  - 配置侧边菜单（根据用户角色动态生成）
  - 配置内容区域（渲染子路由）
  - 实现响应式布局
  - 实现主题切换功能
  - **验证方法**: 【运行时验证】启动应用，登录后验证布局、菜单、主题切换功能
  - _需求: 5.1, 7.1, 7.4, 7.5, 7.6_
  - **验证报告**: [task-22.md](./task-verify-report/task-22.md)

- [x] 23. 编写 BasicLayout 的属性测试 ✅
  - 编写菜单基于角色显示属性测试（属性 15）
  - **验证方法**: 【单元测试】执行 `npm test` 确保属性测试通过
  - _需求: 5.1_
  - **验证报告**: [task-23.md](./task-verify-report/task-23.md)

- [x] 24. 实现 BlankLayout 布局 ✅
  - 创建用于 404、403 页面的空白布局
  - 仅渲染子组件
  - **验证方法**: 【运行时验证】访问 404 页面，验证布局正确
  - _需求: 15.5_
  - **验证报告**: [task-24.md](./task-verify-report/task-24.md)

- [x] 25. 实现注册页面 ✅
  - 使用 Ant Design Form 组件
  - 添加用户名、邮箱、密码、确认密码字段
  - 集成 PasswordStrength 组件
  - 实现表单验证（用户名规则、邮箱格式、密码强度、密码匹配）
  - 实现表单提交（调用 register API）
  - 处理后端错误（显示字段错误或通用错误）
  - 注册成功后跳转到登录页
  - **验证方法**: 【运行时验证】启动应用，测试注册流程（成功和失败场景）
  - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_
  - **验证报告**: [task-25.md](./task-verify-report/task-25.md)

- [x] 26. 编写注册页面的属性测试 ✅
  - 编写有效注册数据提交成功属性测试（属性 1）
  - 编写密码不匹配阻止提交属性测试（属性 2）
  - **验证方法**: 【单元测试】执行 `npm test` 确保属性测试通过
  - _需求: 1.2, 1.3_
  - **验证报告**: [task-26.md](./task-verify-report/task-26.md)

- [x] 27. 实现登录页面 ✅
  - 使用 Ant Design Form 组件
  - 添加用户名/邮箱、密码、记住我字段
  - 实现表单验证（非空验证）
  - 实现表单提交（调用 login API）
  - 处理后端错误（认证失败、账号锁定）
  - 登录成功后跳转到原始路径或首页
  - 显示账号锁定剩余时间
  - **验证方法**: 【构建验证】执行 `npm run build` 确保项目构建成功
  - _需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8, 11.1, 15.2_
  - **验证报告**: [task-27.md](./task-verify-report/task-27.md)

- [x] 29. 实现仪表盘页面 ✅
  - 显示欢迎消息和用户信息
  - 根据用户角色显示不同内容
  - **验证方法**: 【构建验证】执行 `npm run build` 确保项目构建成功
  - _需求: 2.2, 4.4, 4.5_
  - **验证报告**: [task-29.md](./task-verify-report/task-29.md)

- [x] 30. 实现用户管理页面（管理员）✅
  - 使用 Ant Design Table 组件显示用户列表
  - 显示用户名、邮箱、角色、账号状态
  - 实现解锁账号功能（调用 unlockAccount API）
  - 处理解锁成功和失败情况
  - 仅管理员可访问（使用 AuthGuard）
  - **验证方法**: 【构建验证】执行 `npm run build` 确保项目构建成功
  - _需求: 12.1, 12.2, 12.3, 12.4, 12.5_
  - **验证报告**: [task-30.md](./task-verify-report/task-30.md)

- [x] 31. 实现审计日志页面（管理员）✅
  - 使用 Ant Design Table 组件显示日志列表
  - 显示时间戳、用户名、操作类型、IP地址、结果
  - 实现筛选功能（用户名、操作类型、时间范围）
  - 实现分页功能
  - 实现日志详情查看（Modal）
  - 仅管理员可访问（使用 AuthGuard）
  - **验证方法**: 【构建验证】执行 `npm run build` 确保项目构建成功
  - _需求: 13.1, 13.2, 13.3, 13.4, 13.5_
  - **验证报告**: [task-31.md](./task-verify-report/task-31.md)

- [x] 32. 实现错误页面 ✅
  - 创建 403 权限拒绝页面
  - 创建 404 页面不存在页面
  - 提供返回首页按钮
  - **验证方法**: 【构建验证】执行 `npm run build` 确保项目构建成功
  - _需求: 4.3, 15.5_
  - **验证报告**: [task-32.md](./task-verify-report/task-32.md)

- [x] 33. 集成所有组件到 App.tsx ✅
  - 包装 AuthProvider
  - 包装 ErrorBoundary
  - 配置 React Router
  - 配置 Ant Design ConfigProvider（主题）
  - **验证方法**: 【构建验证】执行 `npm run build` 确保项目构建成功
  - _需求: 所有需求_
  - **验证报告**: [task-33.md](./task-verify-report/task-33.md)

- [x] 34. 配置 Vite 代理和环境变量 ✅
  - 配置 /api/v1 代理到后端服务器
  - 配置开发环境和生产环境的 API 地址
  - **验证方法**: 【构建验证】执行 `npm run build` 确保项目构建成功
  - _需求: 所有 API 调用_
  - **验证报告**: [task-34.md](./task-verify-report/task-34.md)

- [x] 35. 最终验证和优化 ✅
  - 检查代码质量（ESLint）
  - 优化性能（代码分割、懒加载）
  - 验证所有功能正常工作
  - **验证方法**: 【构建验证】执行 `npm run build` 确保项目构建成功
  - _需求: 所有需求_
  - **验证报告**: [task-35.md](./task-verify-report/task-35.md)
