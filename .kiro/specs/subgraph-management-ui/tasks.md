# Tasks - Subgraph Management UI

**Feature**: F08 - 子图管理（前端）  
**Task List Version**: v1.0  
**Created Date**: 2024-12-04  
**Based On**: design.md v1.0, requirements.md v1.1  
**Status**: 待执行 ⏳

---

## 任务概览

**任务总数**: 30个任务  
**预估总工时**: 90-120小时（6周，按每周15-20小时计算）  
**实施策略**: 5阶段增量交付

### 任务分布

| 阶段 | 任务数 | 预估工时 | 说明 |
|------|--------|---------|------|
| 阶段1: 基础设施 | 5 | 15-20h | 项目搭建、路由、服务层 |
| 阶段2: 核心页面 | 8 | 24-32h | 列表页、详情页 |
| 阶段3: 拓扑集成 | 4 | 12-16h | TopologyCanvas适配 |
| 阶段4: 高级功能 | 8 | 24-32h | 编辑、删除、权限管理 |
| 阶段5: 完善优化 | 5 | 15-20h | 缓存、错误处理、测试 |

### 验证方式分布

- 【运行时验证】: 20个任务（67%）
- 【单元测试】: 5个任务（17%）
- 【构建验证】: 3个任务（10%）
- 【静态检查】: 2个任务（6%）

---

## 阶段1: 基础设施搭建（Week 1）

### 目标
搭建项目基础结构，配置开发环境，实现基础服务层和路由。


- [x] 1. 创建项目目录结构
  - 按照structure.md创建标准目录结构
  - 创建pages/SubgraphManagement、components/SubgraphManagement、services、hooks、types目录
  - 创建必要的index.ts导出文件
  - **验证方法**: 【静态检查】检查目录结构是否符合structure.md规范，所有必需目录已创建
  - _需求: REQ-NFR-030_

- [x] 2. 配置TypeScript接口定义
  - 在types/subgraph.ts中定义所有TypeScript接口
  - 定义Subgraph、SubgraphDetail、UserInfo、ResourceInfo、TopologyData等接口
  - 确保接口与后端OpenAPI规范100%对齐
  - **验证方法**: 【构建验证】执行tsc编译，确保无类型错误，接口定义完整
  - _需求: REQ-NFR-031_

- [x] 3. 实现SubgraphService服务层
  - 创建services/subgraph.ts
  - 实现9个API方法（listSubgraphs, createSubgraph, getSubgraphDetail等）
  - 配置Axios实例和请求拦截器（JWT token、CSRF token）
  - **验证方法**: 【单元测试】编写服务层单元测试，mock API响应，验证所有方法正确调用
  - _需求: REQ-FR-005, REQ-FR-010, REQ-FR-043, REQ-FR-053, REQ-FR-065, REQ-FR-075, REQ-NFR-027_

- [x] 4. 实现CacheService缓存服务
  - 创建services/cache.ts
  - 实现set、get、invalidate、invalidatePattern、clear方法
  - 支持TTL过期机制
  - **验证方法**: 【单元测试】编写缓存服务单元测试，验证TTL、失效策略正确
  - _需求: REQ-NFR-029-D, REQ-NFR-029-E, REQ-NFR-029-F_

- [x] 5. 配置路由和懒加载
  - 在routes/subgraph.tsx中配置路由
  - 配置/subgraphs和/subgraphs/:id两个路由
  - 使用React.lazy实现页面组件懒加载
  - 集成AuthGuard权限保护
  - **验证方法**: 【运行时验证】启动应用，访问/subgraphs路由，验证页面加载和权限保护
  - _需求: REQ-FR-009, REQ-FR-021, REQ-NFR-028_

---

## 阶段2: 核心页面实现（Week 2-3）

### 目标
实现子图列表页和详情页的核心功能，包括搜索、过滤、分页、Tab切换。

- [x] 6. 实现useSubgraphList自定义Hook
  - 创建hooks/useSubgraphList.ts
  - 管理列表状态（subgraphs, loading, total, page, pageSize, keyword, filters）
  - 实现fetchSubgraphs、handleSearch、handleFilterChange、handlePageChange方法
  - 集成缓存策略（5分钟TTL）
  - **验证方法**: 【单元测试】编写Hook单元测试，验证状态管理和方法调用正确
  - _需求: REQ-FR-009, REQ-FR-013, REQ-FR-015, REQ-FR-016, REQ-FR-017, REQ-NFR-029-D_

- [x] 7. 实现SubgraphList列表页面
  - 创建pages/SubgraphManagement/SubgraphList/index.tsx
  - 使用useSubgraphList Hook管理状态
  - 实现3列布局（过滤面板、表格、工具栏）
  - 集成搜索框（300ms防抖）
  - **验证方法**: 【运行时验证】启动应用，访问/subgraphs，验证列表显示、搜索、过滤、分页功能
  - _需求: REQ-FR-009, REQ-FR-010, REQ-FR-012, REQ-FR-013_

- [x] 8. 实现SubgraphFilterPanel过滤面板
  - 创建SubgraphFilterPanel组件
  - 实现TagFilter（多选checkbox，AND逻辑）
  - 实现OwnerFilter（多选checkbox，OR逻辑）
  - 实现ResetButton重置功能
  - **验证方法**: 【运行时验证】测试标签过滤、所有者过滤、重置按钮，验证过滤逻辑正确
  - _需求: REQ-FR-015, REQ-FR-016, REQ-FR-020-A_

- [x] 9. 实现SubgraphTable表格组件
  - 创建SubgraphTable组件
  - 显示所有必需列（name, description, tags, owner count, resource count, timestamps）
  - 实现排序功能（createdAt, updatedAt, name）
  - 实现行点击跳转到详情页
  - **验证方法**: 【运行时验证】测试表格显示、排序、行点击，验证数据正确展示
  - _需求: REQ-FR-010, REQ-FR-017, REQ-FR-027_

- [x] 10. 实现EmptyState空状态组件
  - 创建EmptyState组件（可复用）
  - 支持列表空、搜索无结果两种场景
  - 显示友好提示和操作按钮
  - **验证方法**: 【运行时验证】测试空列表和搜索无结果场景，验证空状态显示
  - _需求: REQ-FR-019, REQ-FR-020, REQ-NFR-024_

- [x] 11. 实现useSubgraphDetail自定义Hook
  - 创建hooks/useSubgraphDetail.ts
  - 管理详情状态（subgraph, loading, resources, topologyData, permissions）
  - 实现fetchDetail、fetchResources、fetchTopology、fetchPermissions方法
  - 集成缓存策略（2分钟TTL）
  - **验证方法**: 【单元测试】编写Hook单元测试，验证状态管理和数据获取正确
  - _需求: REQ-FR-021, REQ-FR-024, REQ-FR-025, REQ-FR-028, REQ-FR-032, REQ-NFR-029-E_

- [x] 12. 实现SubgraphDetail详情页面
  - 创建pages/SubgraphManagement/SubgraphDetail/index.tsx
  - 使用useSubgraphDetail Hook管理状态
  - 实现页面布局（Breadcrumb、Header、Tabs）
  - 实现Tab切换和URL同步（?tab=xxx）
  - **验证方法**: 【运行时验证】访问/subgraphs/:id，验证详情页加载、Tab切换、URL同步
  - _需求: REQ-FR-021, REQ-FR-022, REQ-FR-023_

- [x] 13. 实现OverviewTab概览标签页
  - 创建OverviewTab组件
  - 使用Ant Design Descriptions组件展示基本信息
  - 显示所有字段（name, description, tags, metadata, timestamps, statistics）
  - **验证方法**: 【运行时验证】切换到Overview tab，验证所有信息正确显示
  - _需求: REQ-FR-024_

---

## 阶段3: 拓扑图集成（Week 4）

### 目标
适配F04的TopologyCanvas组件，实现子图拓扑可视化。

- [x] 14. 复用TopologyCanvas组件
  - 从F04复制TopologyCanvas、TopologyNode、TopologyEdge组件到项目
  - 确保组件接口兼容（props定义）
  - 保持F04的所有功能（拖拽、缩放、平移）
  - **验证方法**: 【构建验证】执行构建，确保组件导入无错误，TypeScript类型检查通过
  - _需求: REQ-FR-028, REQ-FR-030, REQ-FR-031_

- [x] 15. 实现TopologyTab拓扑标签页
  - 创建TopologyTab组件
  - 集成TopologyCanvas组件
  - 实现数据过滤逻辑（只显示子图内节点和关系）
  - 添加工具栏（布局选择、导出按钮）
  - **验证方法**: 【运行时验证】切换到Topology tab，验证拓扑图渲染、节点显示、关系过滤正确
  - _需求: REQ-FR-028, REQ-FR-029, REQ-FR-031-C, REQ-FR-031-D_

- [x] 16. 实现拓扑图空状态处理
  - 在TopologyTab中添加空状态检测
  - 无节点时显示"No nodes in this subgraph"和"Add Node"按钮
  - 有节点但无关系时显示"No relationships defined"
  - **验证方法**: 【运行时验证】测试空子图和无关系场景，验证空状态显示正确
  - _需求: REQ-FR-031-A, REQ-FR-031-B_

- [x] 17. 实现拓扑图交互功能
  - 实现节点点击高亮和tooltip显示
  - 实现节点双击跳转到资源详情
  - 实现缩放和平移（鼠标滚轮、拖拽）
  - **验证方法**: 【运行时验证】测试节点点击、双击、缩放、平移，验证交互流畅
  - _需求: REQ-FR-030, REQ-FR-031, REQ-NFR-025_

---

## 阶段4: 高级功能实现（Week 5-6）

### 目标
实现创建、编辑、删除、资源管理、权限管理等高级功能。

- [x] 18. 实现CreateSubgraphModal创建模态框
  - 创建components/SubgraphManagement/CreateSubgraphModal组件
  - 使用Ant Design Form组件
  - 实现表单字段（name, description, tags, metadata）
  - 实现实时验证（name长度、tags格式）
  - **验证方法**: 【运行时验证】点击创建按钮，填写表单，验证字段验证和提交功能
  - _需求: REQ-FR-001, REQ-FR-002, REQ-FR-003, REQ-FR-002-A_

- [x] 19. 实现表单验证逻辑
  - 在utils/validation.ts中实现验证函数
  - 实现nameRules（长度、唯一性异步验证）
  - 实现tagRules（格式、数量限制）
  - 实现descriptionRules（长度限制）
  - **验证方法**: 【单元测试】编写验证函数单元测试，验证各种边界情况
  - _需求: REQ-FR-003, REQ-FR-004, REQ-FR-002-A_

- [x] 20. 实现useFormDirty自定义Hook
  - 创建hooks/useFormDirty.ts
  - 监听表单字段变化
  - 返回isDirty状态
  - **验证方法**: 【单元测试】编写Hook单元测试，验证dirty状态检测正确
  - _需求: REQ-FR-002-C_

- [x] 21. 实现表单取消确认
  - 在CreateSubgraphModal中集成useFormDirty
  - 有未保存更改时显示确认对话框
  - 使用Modal.confirm组件
  - **验证方法**: 【运行时验证】修改表单后点击取消，验证确认对话框显示
  - _需求: REQ-FR-002-C_

- [x] 22. 实现EditSubgraphModal编辑模态框
  - 创建EditSubgraphModal组件
  - 复用CreateSubgraphModal的表单逻辑
  - 预填充当前子图数据
  - 实现版本号（optimistic locking）
  - **验证方法**: 【运行时验证】点击编辑按钮，修改字段，验证更新功能和冲突处理
  - _需求: REQ-FR-034, REQ-FR-037, REQ-FR-038, REQ-FR-043, REQ-FR-045_

- [x] 23. 实现DeleteConfirmModal删除确认框
  - 创建DeleteConfirmModal组件
  - 实现两步确认（输入子图名称）
  - 显示警告信息和影响说明
  - 实现名称匹配验证
  - **验证方法**: 【运行时验证】点击删除按钮，输入名称，验证删除功能和错误处理
  - _需求: REQ-FR-047, REQ-FR-050, REQ-FR-051, REQ-FR-052, REQ-FR-053_

- [x] 24. 实现AddResourceModal添加资源模态框
  - 创建AddResourceModal组件
  - 实现资源列表展示（搜索、类型过滤、分页）
  - 实现批量选择（checkbox，最多50个）
  - 标识已添加的资源（禁用+badge）
  - **验证方法**: 【运行时验证】点击添加节点，搜索资源，批量选择，验证添加功能
  - _需求: REQ-FR-057, REQ-FR-059, REQ-FR-060, REQ-FR-061, REQ-FR-062, REQ-FR-063, REQ-FR-064, REQ-FR-064-A_

- [x] 25. 实现ResourceNodesTab资源节点标签页
  - 创建ResourceNodesTab组件
  - 显示资源节点表格（name, type, status, addedAt, addedBy, actions）
  - 实现搜索功能
  - 实现移除按钮（仅Owner可见）
  - **验证方法**: 【运行时验证】切换到Resources tab，验证列表显示、搜索、移除功能
  - _需求: REQ-FR-025, REQ-FR-026, REQ-FR-071, REQ-FR-074_

---


## 阶段5: 完善和优化（Week 6-7）

### 目标
实现权限管理、错误处理、性能优化、国际化、测试。

- [x] 26. 实现usePermission权限检查Hook
  - 创建hooks/usePermission.ts
  - 基于当前用户和子图权限计算canEdit、canDelete、canAddNode等
  - 使用useMemo优化性能
  - **验证方法**: 【单元测试】编写Hook单元测试，验证不同角色的权限计算正确
  - _需求: REQ-FR-034, REQ-FR-035, REQ-FR-047, REQ-FR-048, REQ-FR-057, REQ-FR-058, REQ-NFR-028_

- [x] 27. 实现PermissionsTab权限标签页
  - 创建PermissionsTab组件
  - 显示Owner和Viewer列表
  - 实现添加/移除Owner功能（仅Owner可操作）
  - 实现最后一个Owner保护
  - **验证方法**: 【运行时验证】切换到Permissions tab，验证权限列表显示和管理功能
  - _需求: REQ-FR-032, REQ-FR-039, REQ-FR-040, REQ-FR-041, REQ-FR-042_

- [x] 28. 实现全局错误处理
  - 配置Axios响应拦截器
  - 实现错误分类处理（400, 401, 403, 404, 409, 500）
  - 实现ErrorBoundary组件
  - 实现网络超时和重试机制（30s超时，2次重试）
  - **验证方法**: 【运行时验证】模拟各种错误场景，验证错误提示和处理正确
  - _需求: REQ-NFR-014, REQ-NFR-014-A, REQ-NFR-014-B, REQ-NFR-015, REQ-NFR-016, REQ-NFR-017, REQ-NFR-018, REQ-NFR-019_

- [x] 29. 实现性能优化
  - 实现搜索防抖（300ms）
  - 实现拓扑图拖拽节流（16ms）
  - 实现位置保存防抖（1000ms）
  - 使用React.memo优化组件渲染
  - 实现虚拟滚动（>100项时）
  - **验证方法**: 【运行时验证】测试搜索、拖拽、大列表，验证性能优化效果
  - _需求: REQ-NFR-001, REQ-NFR-002, REQ-NFR-003, REQ-NFR-005, REQ-NFR-007_

- [x] 30. 实现国际化支持
  - 配置react-intl
  - 创建locales/zh-CN/subgraph.ts和locales/en-US/subgraph.ts
  - 翻译所有UI文本
  - 实现日期时间本地化
  - **验证方法**: 【运行时验证】切换语言，验证所有文本正确翻译，日期格式正确
  - _需求: REQ-NFR-029-A, REQ-NFR-029-B, REQ-NFR-029-C_

---

## 需求追溯矩阵

### 正向追溯（需求 → 任务）

| 需求ID | 需求描述 | 任务ID | 覆盖度 |
|--------|---------|--------|--------|
| REQ-FR-001 | 创建按钮展示 | T18 | 完全 |
| REQ-FR-002 | 创建表单展示 | T18 | 完全 |
| REQ-FR-002-A | 标签输入验证 | T18, T19 | 完全 |
| REQ-FR-002-B | 描述字段格式 | T18 | 完全 |
| REQ-FR-002-C | 表单取消确认 | T20, T21 | 完全 |
| REQ-FR-003 | 名称字段验证 | T18, T19 | 完全 |
| REQ-FR-004 | 名称唯一性验证 | T19 | 完全 |
| REQ-FR-005 | 创建提交处理 | T3, T18 | 完全 |
| REQ-FR-009 | 列表页面布局 | T7 | 完全 |
| REQ-FR-010 | 子图表格展示 | T7, T9 | 完全 |
| REQ-FR-012 | 表格分页 | T7 | 完全 |
| REQ-FR-013 | 搜索功能 | T6, T7 | 完全 |
| REQ-FR-015 | 标签过滤器 | T8 | 完全 |
| REQ-FR-016 | 所有者过滤器 | T8 | 完全 |
| REQ-FR-017 | 排序功能 | T6, T9 | 完全 |
| REQ-FR-019 | 空状态展示 | T10 | 完全 |
| REQ-FR-020 | 搜索无结果状态 | T10 | 完全 |
| REQ-FR-020-A | 过滤器重置功能 | T8 | 完全 |
| REQ-FR-021 | 详情页面布局 | T12 | 完全 |
| REQ-FR-022 | Tab页签定义 | T12 | 完全 |
| REQ-FR-023 | Tab URL同步 | T12 | 完全 |
| REQ-FR-024 | 概览Tab内容 | T11, T13 | 完全 |
| REQ-FR-025 | 资源节点Tab内容 | T11, T25 | 完全 |
| REQ-FR-026 | 资源节点列表搜索 | T25 | 完全 |
| REQ-FR-027 | 资源节点点击跳转 | T9 | 完全 |
| REQ-FR-028 | 拓扑图Tab内容 | T11, T14, T15 | 完全 |
| REQ-FR-029 | 拓扑图范围限制 | T15 | 完全 |
| REQ-FR-030 | 拓扑图节点交互 | T14, T17 | 完全 |
| REQ-FR-031 | 拓扑图缩放和拖拽 | T14, T17 | 完全 |
| REQ-FR-031-A | 拓扑图空状态 | T16 | 完全 |
| REQ-FR-031-B | 拓扑图无关系状态 | T16 | 完全 |
| REQ-FR-031-C | 拓扑图布局选择 | T15 | 完全 |
| REQ-FR-031-D | 拓扑图导出功能 | T15 | 完全 |
| REQ-FR-032 | 权限Tab内容 | T11, T27 | 完全 |
| REQ-FR-034 | 编辑按钮显示 | T22, T26 | 完全 |
| REQ-FR-035 | 编辑按钮隐藏 | T26 | 完全 |
| REQ-FR-037 | 编辑表单展示 | T22 | 完全 |
| REQ-FR-038 | 名称编辑验证 | T22 | 完全 |
| REQ-FR-039 | Owner管理界面 | T27 | 完全 |
| REQ-FR-040 | 添加Owner | T27 | 完全 |
| REQ-FR-041 | 移除Owner | T27 | 完全 |
| REQ-FR-042 | 最后一个Owner保护 | T27 | 完全 |
| REQ-FR-043 | 编辑保存处理 | T3, T22 | 完全 |
| REQ-FR-045 | 编辑冲突处理 | T22 | 完全 |
| REQ-FR-047 | 删除按钮显示 | T23, T26 | 完全 |
| REQ-FR-048 | 删除按钮隐藏 | T26 | 完全 |
| REQ-FR-050 | 非空子图删除阻止 | T23 | 完全 |
| REQ-FR-051 | 空子图删除确认 | T23 | 完全 |
| REQ-FR-052 | 删除名称验证 | T23 | 完全 |
| REQ-FR-053 | 删除执行 | T3, T23 | 完全 |
| REQ-FR-057 | 添加节点按钮显示 | T24, T26 | 完全 |
| REQ-FR-058 | 添加节点按钮隐藏 | T26 | 完全 |
| REQ-FR-059 | 资源节点选择界面 | T24 | 完全 |
| REQ-FR-060 | 节点列表展示 | T24 | 完全 |
| REQ-FR-061 | 节点搜索功能 | T24 | 完全 |
| REQ-FR-062 | 节点类型过滤 | T24 | 完全 |
| REQ-FR-063 | 已添加节点标识 | T24 | 完全 |
| REQ-FR-064 | 批量选择支持 | T24 | 完全 |
| REQ-FR-064-A | 批量选择数量限制 | T24 | 完全 |
| REQ-FR-065 | 添加节点提交 | T3, T24 | 完全 |
| REQ-FR-071 | 移除按钮显示 | T25, T26 | 完全 |
| REQ-FR-074 | 移除确认对话框 | T25 | 完全 |
| REQ-FR-075 | 移除执行 | T3, T25 | 完全 |
| REQ-NFR-001 | 列表查询性能 | T6, T29 | 完全 |
| REQ-NFR-002 | 详情页加载性能 | T11, T29 | 完全 |
| REQ-NFR-003 | 拓扑图渲染性能 | T14, T29 | 完全 |
| REQ-NFR-005 | 搜索响应性能 | T6, T29 | 完全 |
| REQ-NFR-007 | 大数据量渲染优化 | T29 | 完全 |
| REQ-NFR-014 | 网络错误处理 | T28 | 完全 |
| REQ-NFR-014-A | 网络超时处理 | T28 | 完全 |
| REQ-NFR-014-B | 请求重试机制 | T28 | 完全 |
| REQ-NFR-015 | 表单验证错误 | T19 | 完全 |
| REQ-NFR-016 | 权限错误处理 | T28 | 完全 |
| REQ-NFR-017 | 404错误处理 | T28 | 完全 |
| REQ-NFR-018 | 全局错误边界 | T28 | 完全 |
| REQ-NFR-019 | 并发冲突处理 | T28 | 完全 |
| REQ-NFR-027 | CSRF防护 | T3 | 完全 |
| REQ-NFR-028 | 权限验证 | T5, T26 | 完全 |
| REQ-NFR-029-A | 多语言支持 | T30 | 完全 |
| REQ-NFR-029-B | 日期时间本地化 | T30 | 完全 |
| REQ-NFR-029-C | 数字格式本地化 | T30 | 完全 |
| REQ-NFR-029-D | 列表数据缓存 | T4, T6 | 完全 |
| REQ-NFR-029-E | 详情数据缓存 | T4, T11 | 完全 |
| REQ-NFR-029-F | 缓存失效策略 | T4 | 完全 |
| REQ-NFR-030 | 代码组织规范 | T1 | 完全 |
| REQ-NFR-031 | TypeScript类型定义 | T2 | 完全 |

**正向追溯汇总**:
- 总需求数: 76个（前端相关）
- 完全覆盖: 76个（100%）
- 部分覆盖: 0个
- 未覆盖: 0个

### 反向追溯（任务 → 需求）

| 任务ID | 任务描述 | 追溯到的需求 | 合理性状态 |
|--------|---------|-------------|-----------|
| T1 | 创建项目目录结构 | REQ-NFR-030 | 已验证 |
| T2 | 配置TypeScript接口定义 | REQ-NFR-031 | 已验证 |
| T3 | 实现SubgraphService服务层 | REQ-FR-005, REQ-FR-010, REQ-FR-043, REQ-FR-053, REQ-FR-065, REQ-FR-075, REQ-NFR-027 | 已验证 |
| T4 | 实现CacheService缓存服务 | REQ-NFR-029-D, REQ-NFR-029-E, REQ-NFR-029-F | 已验证 |
| T5 | 配置路由和懒加载 | REQ-FR-009, REQ-FR-021, REQ-NFR-028 | 已验证 |
| T6 | 实现useSubgraphList Hook | REQ-FR-009, REQ-FR-013, REQ-FR-015, REQ-FR-016, REQ-FR-017, REQ-NFR-001, REQ-NFR-005, REQ-NFR-029-D | 已验证 |
| T7 | 实现SubgraphList列表页面 | REQ-FR-009, REQ-FR-010, REQ-FR-012, REQ-FR-013 | 已验证 |
| T8 | 实现SubgraphFilterPanel | REQ-FR-015, REQ-FR-016, REQ-FR-020-A | 已验证 |
| T9 | 实现SubgraphTable表格 | REQ-FR-010, REQ-FR-017, REQ-FR-027 | 已验证 |
| T10 | 实现EmptyState组件 | REQ-FR-019, REQ-FR-020, REQ-NFR-024 | 已验证 |
| T11 | 实现useSubgraphDetail Hook | REQ-FR-021, REQ-FR-024, REQ-FR-025, REQ-FR-028, REQ-FR-032, REQ-NFR-002, REQ-NFR-029-E | 已验证 |
| T12 | 实现SubgraphDetail页面 | REQ-FR-021, REQ-FR-022, REQ-FR-023 | 已验证 |
| T13 | 实现OverviewTab | REQ-FR-024 | 已验证 |
| T14 | 复用TopologyCanvas组件 | REQ-FR-028, REQ-FR-030, REQ-FR-031, REQ-NFR-003 | 已验证 |
| T15 | 实现TopologyTab | REQ-FR-028, REQ-FR-029, REQ-FR-031-C, REQ-FR-031-D | 已验证 |
| T16 | 实现拓扑图空状态 | REQ-FR-031-A, REQ-FR-031-B | 已验证 |
| T17 | 实现拓扑图交互 | REQ-FR-030, REQ-FR-031, REQ-NFR-025 | 已验证 |
| T18 | 实现CreateSubgraphModal | REQ-FR-001, REQ-FR-002, REQ-FR-003, REQ-FR-002-A, REQ-FR-002-B | 已验证 |
| T19 | 实现表单验证逻辑 | REQ-FR-003, REQ-FR-004, REQ-FR-002-A, REQ-NFR-015 | 已验证 |
| T20 | 实现useFormDirty Hook | REQ-FR-002-C | 已验证 |
| T21 | 实现表单取消确认 | REQ-FR-002-C | 已验证 |
| T22 | 实现EditSubgraphModal | REQ-FR-034, REQ-FR-037, REQ-FR-038, REQ-FR-043, REQ-FR-045 | 已验证 |
| T23 | 实现DeleteConfirmModal | REQ-FR-047, REQ-FR-050, REQ-FR-051, REQ-FR-052, REQ-FR-053 | 已验证 |
| T24 | 实现AddResourceModal | REQ-FR-057, REQ-FR-059, REQ-FR-060, REQ-FR-061, REQ-FR-062, REQ-FR-063, REQ-FR-064, REQ-FR-064-A, REQ-FR-065 | 已验证 |
| T25 | 实现ResourceNodesTab | REQ-FR-025, REQ-FR-026, REQ-FR-071, REQ-FR-074, REQ-FR-075 | 已验证 |
| T26 | 实现usePermission Hook | REQ-FR-034, REQ-FR-035, REQ-FR-047, REQ-FR-048, REQ-FR-057, REQ-FR-058, REQ-NFR-028 | 已验证 |
| T27 | 实现PermissionsTab | REQ-FR-032, REQ-FR-039, REQ-FR-040, REQ-FR-041, REQ-FR-042 | 已验证 |
| T28 | 实现全局错误处理 | REQ-NFR-014, REQ-NFR-014-A, REQ-NFR-014-B, REQ-NFR-015, REQ-NFR-016, REQ-NFR-017, REQ-NFR-018, REQ-NFR-019 | 已验证 |
| T29 | 实现性能优化 | REQ-NFR-001, REQ-NFR-002, REQ-NFR-003, REQ-NFR-005, REQ-NFR-007 | 已验证 |
| T30 | 实现国际化支持 | REQ-NFR-029-A, REQ-NFR-029-B, REQ-NFR-029-C | 已验证 |

**反向追溯汇总**:
- 总任务数: 30个
- 已验证: 30个（100%）
- 推断: 0个
- 无依据: 0个

---

## 任务依赖关系

### 依赖图

```
阶段1（基础设施）
T1 → T2 → T3, T4
         ↓
         T5

阶段2（核心页面）
T5 → T6 → T7 → T8, T9, T10
T5 → T11 → T12 → T13

阶段3（拓扑集成）
T11 → T14 → T15 → T16, T17

阶段4（高级功能）
T3 → T18 → T19, T20, T21
T3 → T22
T3 → T23
T3 → T24
T11 → T25

阶段5（完善优化）
T11 → T26 → T27
T3 → T28
T6, T11, T14 → T29
All → T30
```

### 关键路径

**最长路径**: T1 → T2 → T3 → T18 → T19 → T20 → T21（约25-30小时）

### 并行机会

- T8, T9, T10可以并行开发（依赖T7）
- T16, T17可以并行开发（依赖T15）
- T19, T20可以并行开发（依赖T18）
- T22, T23, T24可以并行开发（依赖T3）

---

## 验证策略

### 验证方式分布

| 验证方式 | 任务数 | 占比 | 说明 |
|---------|--------|------|------|
| 【运行时验证】 | 20 | 67% | 启动应用，测试功能 |
| 【单元测试】 | 5 | 17% | 编写测试用例 |
| 【构建验证】 | 3 | 10% | 执行构建命令 |
| 【静态检查】 | 2 | 6% | 检查文件和内容 |

### 测试覆盖目标

- **单元测试覆盖率**: ≥70%
- **关键业务逻辑**: 100%测试覆盖
- **组件测试**: 核心组件100%覆盖

---

## 风险和缓解措施

| 风险 | 概率 | 影响 | 缓解措施 | 负责任务 |
|------|------|------|---------|---------|
| TopologyCanvas适配问题 | 低 | 中 | F04组件已验证，只需过滤逻辑 | T14, T15 |
| 后端API未就绪 | 中 | 高 | 使用Mock API并行开发 | T3 |
| 性能问题 | 低 | 中 | 实施缓存、防抖、节流 | T29 |
| 表单验证复杂度 | 低 | 低 | 使用Ant Design Form | T19 |
| 时间线延误 | 中 | 中 | 每周跟踪进度，及时调整 | 全部 |

---

## 进度跟踪

### 里程碑

| 里程碑 | 完成标志 | 目标日期 | 状态 |
|--------|---------|---------|------|
| M1: 基础设施完成 | T1-T5完成 | Week 1 | ⏳ 待开始 |
| M2: 核心页面完成 | T6-T13完成 | Week 3 | ⏳ 待开始 |
| M3: 拓扑集成完成 | T14-T17完成 | Week 4 | ⏳ 待开始 |
| M4: 高级功能完成 | T18-T25完成 | Week 6 | ⏳ 待开始 |
| M5: 完善优化完成 | T26-T30完成 | Week 7 | ⏳ 待开始 |

### 每周目标

- **Week 1**: 完成基础设施（T1-T5）
- **Week 2**: 完成列表页（T6-T10）
- **Week 3**: 完成详情页（T11-T13）
- **Week 4**: 完成拓扑集成（T14-T17）
- **Week 5**: 完成创建编辑删除（T18-T23）
- **Week 6**: 完成资源管理（T24-T25）
- **Week 7**: 完成权限和优化（T26-T30）

---

## 附录

### A. 任务格式说明

每个任务遵循以下格式：
```markdown
- [ ] N. 任务标题
  - 关键要点1
  - 关键要点2
  - **验证方法**: 【验证方式】具体验证步骤
  - _需求: FR-xxx, FR-yyy_
```

### B. 验证方式优先级

1. 【运行时验证】- 最优先
2. 【单元测试】- 次优先
3. 【构建验证】- 第三优先
4. 【静态检查】- 最后

### C. 相关文档

- **需求文档**: `requirements.md` (v1.1)
- **设计文档**: `design.md` (v1.0)
- **设计验证报告**: `design-verification-report.md`
- **后端设计**: Backend design document

---

**任务列表版本**: v1.0  
**创建日期**: 2024-12-04  
**状态**: ✅ **任务规划完成，等待用户确认**

---

**下一步**: 获得用户确认后开始任务执行
