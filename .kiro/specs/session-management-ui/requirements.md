# 需求文档

## 简介

本文档规定了会话管理用户界面功能的需求，该功能为已认证用户提供可视化的会话生命周期管理界面。前端应用需要与后端会话管理系统集成，支持会话创建、验证、刷新和销毁操作，同时提供多设备会话管理界面。系统应在会话即将过期时主动提醒用户，支持用户查看和管理跨设备的活跃会话，并实现安全的令牌存储和自动刷新机制。所有会话操作应提供清晰的用户反馈，确保良好的用户体验。

## 术语表

- **会话管理界面(Session Management UI)**: 前端应用中用于显示和管理用户会话的用户界面组件
- **访问令牌(Access Token)**: 存储在LocalStorage中的短期JWT令牌(15分钟)，用于API认证
- **刷新令牌(Refresh Token)**: 存储在HttpOnly Cookie中的长期令牌(30天)，用于获取新的访问令牌
- **令牌刷新机制(Token Refresh Mechanism)**: 在访问令牌过期前自动获取新令牌的前端机制
- **会话过期警告(Session Expiration Warning)**: 在会话即将过期时显示的模态对话框
- **活跃会话列表(Active Sessions List)**: 显示用户所有活跃会话的界面组件
- **设备信息(Device Info)**: 包含设备类型、浏览器、操作系统、IP地址和登录时间的显示信息
- **当前会话(Current Session)**: 用户正在使用的会话，在界面中特殊标记
- **会话终止(Session Termination)**: 用户主动结束特定会话的操作
- **自动登出(Auto Logout)**: 会话过期后系统自动将用户重定向到登录页面
- **记住我(Remember Me)**: 登录时的选项，延长会话有效期至30天
- **请求拦截器(Request Interceptor)**: Axios拦截器，自动在请求头中添加访问令牌
- **响应拦截器(Response Interceptor)**: Axios拦截器，处理401错误和令牌刷新

## 需求

### 需求1: 登录与会话创建

**用户故事:** 作为用户，我希望在登录页面输入凭据并成功登录后，系统能够创建会话并将我导航到主界面，以便我可以开始使用应用。

#### 验收标准

1. WHEN 用户在登录表单中输入用户名和密码并点击登录按钮 THEN 前端应用 SHALL 向后端发送POST请求到/api/v1/auth/login
2. WHEN 登录请求成功返回 THEN 前端应用 SHALL 将访问令牌存储到LocalStorage中的键"access_token"
3. WHEN 登录请求成功返回 THEN 前端应用 SHALL 将用户信息存储到LocalStorage中的键"user_info"
4. WHEN 用户勾选"记住我"复选框并登录 THEN 前端应用 SHALL 在请求体中包含rememberMe字段设置为true
5. WHEN 登录成功完成 THEN 前端应用 SHALL 将用户重定向到仪表板页面
6. WHEN 登录请求失败并返回错误代码 THEN 前端应用 SHALL 在登录表单下方显示错误消息
7. WHEN 登录请求正在处理中 THEN 前端应用 SHALL 禁用登录按钮并显示加载指示器
8. WHEN 登录表单包含验证错误 THEN 前端应用 SHALL 在相应字段下方显示验证错误消息
9. WHEN 用户已经登录并访问登录页面 THEN 前端应用 SHALL 自动重定向到仪表板页面
10. WHEN 登录成功后 THEN 前端应用 SHALL 初始化令牌自动刷新机制

### 需求2: 请求认证与令牌管理

**用户故事:** 作为开发人员，我希望所有API请求自动包含认证令牌，并在令牌过期时自动刷新，以便用户无需频繁重新登录。

#### 验收标准

1. WHEN 前端应用发送API请求到受保护端点 THEN 请求拦截器 SHALL 在请求头中添加Authorization字段，值为"Bearer {access_token}"
2. WHEN 访问令牌在LocalStorage中不存在 THEN 请求拦截器 SHALL 不添加Authorization头
3. WHEN API响应返回401状态码且错误代码为AUTH-TOKEN-EXPIRED THEN 响应拦截器 SHALL 自动发送刷新令牌请求到/api/v1/auth/refresh
4. WHEN 刷新令牌请求成功返回新的访问令牌 THEN 响应拦截器 SHALL 更新LocalStorage中的访问令牌
5. WHEN 刷新令牌请求成功 THEN 响应拦截器 SHALL 使用新令牌重试原始失败的请求
6. WHEN 刷新令牌请求失败或返回401 THEN 响应拦截器 SHALL 清除所有存储的令牌和用户信息
7. WHEN 刷新令牌失败 THEN 响应拦截器 SHALL 将用户重定向到登录页面并显示消息"您的会话已过期，请重新登录"
8. WHEN 访问令牌距离过期时间少于5分钟 THEN 前端应用 SHALL 主动发送刷新请求
9. WHEN 多个并发请求同时触发令牌刷新 THEN 前端应用 SHALL 确保只发送一次刷新请求
10. WHEN 令牌刷新正在进行中 THEN 前端应用 SHALL 将后续请求加入队列等待刷新完成

### 需求3: 会话过期警告

**用户故事:** 作为用户，我希望在会话即将过期时收到提醒，以便我可以选择延长会话或安全登出，避免工作丢失。

#### 验收标准

1. WHEN API响应包含会话过期警告标志 THEN 前端应用 SHALL 显示会话过期警告模态对话框
2. WHEN 显示会话过期警告对话框 THEN 对话框 SHALL 包含标题"会话即将过期"
3. WHEN 显示会话过期警告对话框 THEN 对话框 SHALL 显示倒计时显示剩余时间（格式为"X分Y秒"）
4. WHEN 显示会话过期警告对话框 THEN 对话框 SHALL 包含"延长会话"按钮
5. WHEN 显示会话过期警告对话框 THEN 对话框 SHALL 包含"立即登出"按钮
6. WHEN 用户点击"延长会话"按钮 THEN 前端应用 SHALL 发送任意API请求以更新会话活动时间
7. WHEN 用户点击"延长会话"按钮 THEN 前端应用 SHALL 关闭警告对话框
8. WHEN 用户点击"立即登出"按钮 THEN 前端应用 SHALL 调用登出API并重定向到登录页面
9. WHEN 倒计时达到零且用户未采取行动 THEN 前端应用 SHALL 自动关闭对话框并重定向到登录页面
10. WHEN 会话过期警告对话框显示时 THEN 对话框 SHALL 阻止用户与背景内容交互

### 需求4: 登出功能

**用户故事:** 作为用户，我希望能够安全地登出系统，以便在使用完毕或离开时保护我的账户安全。

#### 验收标准

1. WHEN 用户点击导航栏中的登出按钮 THEN 前端应用 SHALL 发送POST请求到/api/v1/auth/logout
2. WHEN 登出请求成功返回 THEN 前端应用 SHALL 从LocalStorage中删除access_token
3. WHEN 登出请求成功返回 THEN 前端应用 SHALL 从LocalStorage中删除user_info
4. WHEN 登出请求成功返回 THEN 前端应用 SHALL 清除所有应用状态
5. WHEN 登出完成 THEN 前端应用 SHALL 将用户重定向到登录页面
6. WHEN 登出完成 THEN 前端应用 SHALL 显示成功消息"您已成功登出"
7. WHEN 登出请求失败 THEN 前端应用 SHALL 仍然清除本地令牌和用户信息
8. WHEN 登出请求失败 THEN 前端应用 SHALL 仍然将用户重定向到登录页面
9. WHEN 用户在登出确认对话框中点击确认 THEN 前端应用 SHALL 执行登出操作
10. WHEN 登出操作正在进行中 THEN 前端应用 SHALL 显示加载指示器

### 需求5: 活跃会话管理界面

**用户故事:** 作为用户，我希望查看和管理我在不同设备上的所有活跃会话，以便我可以监控账户访问并终止可疑会话。

#### 验收标准

1. WHEN 用户导航到会话管理页面 THEN 前端应用 SHALL 发送GET请求到/api/v1/sessions
2. WHEN 会话列表加载成功 THEN 前端应用 SHALL 显示所有活跃会话的列表
3. WHEN 显示会话列表 THEN 每个会话项 SHALL 显示设备类型图标（桌面、移动、平板）
4. WHEN 显示会话列表 THEN 每个会话项 SHALL 显示浏览器名称和版本
5. WHEN 显示会话列表 THEN 每个会话项 SHALL 显示操作系统信息
6. WHEN 显示会话列表 THEN 每个会话项 SHALL 显示IP地址
7. WHEN 显示会话列表 THEN 每个会话项 SHALL 显示登录时间（相对时间格式，如"2小时前"）
8. WHEN 显示会话列表 THEN 每个会话项 SHALL 显示最后活动时间（相对时间格式）
9. WHEN 会话是当前会话 THEN 会话项 SHALL 显示"当前设备"徽章
10. WHEN 会话不是当前会话 THEN 会话项 SHALL 显示"终止会话"按钮

### 需求6: 终止会话操作

**用户故事:** 作为用户，我希望能够终止特定设备上的会话，以便我可以远程登出忘记登出的设备或终止可疑会话。

#### 验收标准

1. WHEN 用户点击非当前会话的"终止会话"按钮 THEN 前端应用 SHALL 显示确认对话框
2. WHEN 确认对话框显示 THEN 对话框 SHALL 包含消息"确定要终止此设备上的会话吗？"
3. WHEN 用户在确认对话框中点击确认 THEN 前端应用 SHALL 发送DELETE请求到/api/v1/sessions/{sessionId}
4. WHEN 终止会话请求成功 THEN 前端应用 SHALL 从会话列表中移除该会话
5. WHEN 终止会话请求成功 THEN 前端应用 SHALL 显示成功消息"会话已终止"
6. WHEN 终止会话请求失败 THEN 前端应用 SHALL 显示错误消息
7. WHEN 用户点击"终止所有其他会话"按钮 THEN 前端应用 SHALL 显示确认对话框
8. WHEN 用户确认终止所有其他会话 THEN 前端应用 SHALL 发送POST请求到/api/v1/sessions/terminate-others
9. WHEN 终止所有其他会话成功 THEN 前端应用 SHALL 刷新会话列表只显示当前会话
10. WHEN 用户只有一个活跃会话 THEN 前端应用 SHALL 显示消息"您当前只在一个设备上登录"并隐藏"终止所有其他会话"按钮

### 需求7: 路由保护与认证状态

**用户故事:** 作为开发人员，我希望受保护的路由只能被已认证用户访问，未认证用户应被重定向到登录页面。

#### 验收标准

1. WHEN 未认证用户尝试访问受保护路由 THEN AuthGuard组件 SHALL 将用户重定向到登录页面
2. WHEN 未认证用户被重定向到登录页面 THEN 前端应用 SHALL 在URL中保存原始目标路径作为redirect参数
3. WHEN 用户成功登录且URL包含redirect参数 THEN 前端应用 SHALL 将用户重定向到原始目标路径
4. WHEN 已认证用户访问受保护路由 THEN AuthGuard组件 SHALL 允许访问并渲染目标组件
5. WHEN 检查认证状态 THEN AuthGuard组件 SHALL 验证LocalStorage中存在access_token
6. WHEN 访问令牌存在但已过期 THEN AuthGuard组件 SHALL 尝试刷新令牌
7. WHEN 令牌刷新失败 THEN AuthGuard组件 SHALL 清除存储并重定向到登录页面
8. WHEN 用户访问登录或注册页面且已认证 THEN 前端应用 SHALL 重定向到仪表板页面
9. WHEN 认证状态检查正在进行中 THEN AuthGuard组件 SHALL 显示加载指示器
10. WHEN 会话在用户浏览期间过期 THEN 前端应用 SHALL 在下一次API请求时检测到并重定向到登录页面

### 需求8: 错误处理与用户反馈

**用户故事:** 作为用户，我希望在会话操作失败时收到清晰的错误消息，以便我了解发生了什么并知道如何解决。

#### 验收标准

1. WHEN API返回错误代码AUTH-SESSION-EXPIRED THEN 前端应用 SHALL 显示消息"您的会话已过期，请重新登录"
2. WHEN API返回错误代码AUTH-SESSION-IDLE-TIMEOUT THEN 前端应用 SHALL 显示消息"由于长时间不活动，您的会话已过期"
3. WHEN API返回错误代码AUTH-SESSION-NOT-FOUND THEN 前端应用 SHALL 显示消息"会话不存在，请重新登录"
4. WHEN API返回错误代码AUTH-TOKEN-EXPIRED THEN 前端应用 SHALL 自动尝试刷新令牌而不显示错误
5. WHEN API返回错误代码AUTH-TOKEN-BLACKLISTED THEN 前端应用 SHALL 显示消息"此令牌已失效，请重新登录"
6. WHEN API返回网络错误 THEN 前端应用 SHALL 显示消息"网络连接失败，请检查您的网络"
7. WHEN API返回500服务器错误 THEN 前端应用 SHALL 显示消息"服务器错误，请稍后重试"
8. WHEN 显示错误消息 THEN 前端应用 SHALL 使用Ant Design的message组件显示3秒
9. WHEN 显示成功消息 THEN 前端应用 SHALL 使用Ant Design的message组件显示2秒
10. WHEN 关键操作失败 THEN 前端应用 SHALL 在控制台记录详细错误信息用于调试

### 需求9: 会话状态持久化

**用户故事:** 作为用户，我希望在刷新页面或关闭浏览器后重新打开时，我的登录状态能够保持，以便我不需要频繁重新登录。

#### 验收标准

1. WHEN 用户刷新页面 THEN 前端应用 SHALL 从LocalStorage读取access_token
2. WHEN 访问令牌存在且有效 THEN 前端应用 SHALL 恢复用户的认证状态
3. WHEN 用户关闭浏览器并重新打开 THEN 前端应用 SHALL 从LocalStorage恢复会话
4. WHEN 恢复会话时访问令牌已过期 THEN 前端应用 SHALL 尝试使用刷新令牌获取新的访问令牌
5. WHEN 刷新令牌也已过期 THEN 前端应用 SHALL 清除存储并要求用户重新登录
6. WHEN 用户信息存储在LocalStorage中 THEN 前端应用 SHALL 在应用启动时恢复用户信息到AuthContext
7. WHEN 用户登录时未勾选"记住我" THEN 会话 SHALL 在8小时后过期
8. WHEN 用户登录时勾选"记住我" THEN 会话 SHALL 在30天后过期
9. WHEN LocalStorage中的数据损坏或无效 THEN 前端应用 SHALL 清除所有存储并重定向到登录页面
10. WHEN 用户在多个标签页中打开应用 THEN 所有标签页 SHALL 共享相同的认证状态

### 需求10: 会话管理界面响应式设计

**用户故事:** 作为用户，我希望会话管理界面在不同设备和屏幕尺寸上都能良好显示，以便我可以在任何设备上管理我的会话。

#### 验收标准

1. WHEN 用户在桌面设备上查看会话列表 THEN 会话列表 SHALL 以表格形式显示所有信息列
2. WHEN 用户在移动设备上查看会话列表 THEN 会话列表 SHALL 以卡片形式显示，每个会话一张卡片
3. WHEN 在移动设备上显示会话卡片 THEN 卡片 SHALL 垂直堆叠所有信息
4. WHEN 会话过期警告对话框在移动设备上显示 THEN 对话框 SHALL 占据屏幕宽度的90%
5. WHEN 会话过期警告对话框在桌面设备上显示 THEN 对话框 SHALL 固定宽度为480像素
6. WHEN 用户在小屏幕设备上查看会话管理页面 THEN 页面 SHALL 使用单列布局
7. WHEN 用户在大屏幕设备上查看会话管理页面 THEN 页面 SHALL 使用适当的边距和最大宽度
8. WHEN 设备类型图标显示 THEN 图标 SHALL 根据屏幕尺寸调整大小
9. WHEN 按钮在移动设备上显示 THEN 按钮 SHALL 具有足够的触摸目标大小（最小44x44像素）
10. WHEN 文本内容在小屏幕上显示 THEN 文本 SHALL 自动换行而不被截断
