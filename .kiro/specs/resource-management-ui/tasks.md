# 实现任务列表

**功能名称**: F03 - 创建和管理IT资源（前端）  
**文档版本**: v1.0  
**创建日期**: 2024-11-30  
**状态**: 待执行

---

## 任务概述

本任务列表将设计文档分解为可执行的开发任务。任务按照依赖关系排序，每个任务都有明确的验收标准。

**总任务数**: 25个核心任务  
**预计工作量**: 2-3周  
**测试任务**: 标记为可选（*）

---

## 任务列表

### 阶段1：基础设施搭建

- [ ] 1. 设置项目基础结构
  - 创建目录结构：pages/Resources, components, services, hooks, types, utils
  - 配置路由：添加/resources和/resources/:id路由
  - 配置代码分割和懒加载
  - _Requirements: REQ-NFR-001, REQ-NFR-026_

- [ ] 2. 定义TypeScript类型
  - 创建src/types/resource.ts，定义所有数据模型
  - 定义ResourceDTO, ResourceType, ResourceStatus等类型
  - 定义API请求/响应类型
  - 定义ResourceTypeAttributes配置
  - _Requirements: REQ-NFR-027_

- [ ] 3. 实现API Service层
  - 创建src/services/resource.ts
  - 实现ResourceService类的所有方法（list, getById, create, update, delete, updateStatus, getResourceTypes, getAuditLogs）
  - 配置Axios实例和拦截器（request.ts）
  - 实现错误处理逻辑
  - _Requirements: REQ-NFR-013, REQ-NFR-024_

- [ ]* 3.1 编写Service层单元测试
  - 测试所有API方法
  - Mock Axios响应
  - 测试错误处理
  - _Requirements: REQ-NFR-029_

- [ ] 4. 实现工具函数
  - 创建src/utils/format.ts（时间格式化、状态格式化）
  - 创建src/utils/validation.ts（表单验证函数）
  - 创建src/utils/constants.ts（常量定义）
  - _Requirements: REQ-FR-008_

- [ ]* 4.1 编写工具函数单元测试
  - 测试格式化函数
  - 测试验证函数
  - 覆盖率≥90%
  - _Requirements: REQ-NFR-029_

### 阶段2：共享组件开发

- [ ] 5. 实现ResourceTypeIcon组件
  - 创建src/components/ResourceTypeIcon/index.tsx
  - 根据资源类型显示对应图标
  - 支持size属性
  - _Requirements: REQ-FR-003_

- [ ] 6. 实现StatusBadge组件
  - 创建src/pages/Resources/components/StatusBadge.tsx
  - 使用Ant Design Badge组件
  - 根据状态显示不同颜色
  - 支持点击事件（用于状态切换）
  - _Requirements: REQ-FR-054_

- [ ] 7. 实现SensitiveField组件
  - 创建src/pages/Resources/components/SensitiveField.tsx
  - 默认显示"***"
  - Owner可点击"显示"按钮查看明文
  - 显示3秒后自动隐藏
  - _Requirements: REQ-FR-031, REQ-FR-032_

- [ ] 8. 实现PermissionGuard组件
  - 创建src/components/PermissionGuard/index.tsx
  - 根据权限显示/隐藏子组件
  - 支持owner和viewer权限检查
  - _Requirements: REQ-FR-035, REQ-FR-036, REQ-FR-045, REQ-FR-046_

- [ ]* 8.1 编写共享组件测试
  - 测试ResourceTypeIcon渲染
  - 测试StatusBadge交互
  - 测试SensitiveField显示/隐藏逻辑
  - 测试PermissionGuard权限控制
  - _Requirements: REQ-NFR-029_

### 阶段3：Custom Hooks开发

- [ ] 9. 实现useResourceList Hook
  - 创建src/hooks/useResourceList.ts
  - 管理资源列表数据、加载状态、错误状态
  - 实现refresh, setFilters, setPagination方法
  - 使用useCallback和useEffect优化性能
  - _Requirements: REQ-FR-014, REQ-FR-015_

- [ ] 10. 实现useResourceDetail Hook
  - 创建src/hooks/useResourceDetail.ts
  - 管理资源详情数据
  - 实现refresh, update, updateStatus, delete方法
  - _Requirements: REQ-FR-029, REQ-FR-040, REQ-FR-057_

- [ ] 11. 实现useResourceForm Hook
  - 创建src/hooks/useResourceForm.ts
  - 管理表单状态和验证
  - 实现表单提交逻辑
  - _Requirements: REQ-FR-008, REQ-FR-009_

- [ ]* 11.1 编写Hooks单元测试
  - 使用@testing-library/react-hooks测试
  - 测试useResourceList的数据加载和过滤
  - 测试useResourceDetail的CRUD操作
  - 测试useResourceForm的验证逻辑
  - _Requirements: REQ-NFR-029_

### 阶段4：资源列表页面

- [ ] 12. 实现ResourceFilters组件
  - 创建src/pages/Resources/components/ResourceFilters.tsx
  - 实现类型过滤器（Radio.Group）
  - 实现标签过滤器（Checkbox.Group）
  - 实现状态过滤器（Checkbox.Group）
  - _Requirements: REQ-FR-018, REQ-FR-019, REQ-FR-020_

- [ ] 13. 实现ResourceTable组件
  - 创建src/pages/Resources/components/ResourceTable.tsx
  - 使用Ant Design Table组件
  - 配置列定义（名称、类型、状态、标签、时间、操作）
  - 实现排序功能
  - 实现行选择（批量操作）
  - _Requirements: REQ-FR-014, REQ-FR-021, REQ-FR-024_

- [ ] 14. 实现ResourceTypeSelector组件
  - 创建src/pages/Resources/components/ResourceTypeSelector.tsx
  - 使用Modal组件展示类型选择
  - 6种类型卡片网格布局（2列3行）
  - 每个卡片显示图标、名称、描述
  - _Requirements: REQ-FR-002, REQ-FR-003_

- [ ] 15. 实现ResourceForm组件
  - 创建src/pages/Resources/components/ResourceForm.tsx
  - 使用Ant Design Form组件
  - 实现基本信息字段（名称、描述、标签）
  - 根据资源类型动态渲染扩展属性
  - 实现表单验证
  - 敏感字段使用Input.Password
  - _Requirements: REQ-FR-004, REQ-FR-005, REQ-FR-006, REQ-FR-007, REQ-FR-008_

- [ ] 16. 实现ResourceListPage页面
  - 创建src/pages/Resources/index.tsx
  - 实现三栏布局（过滤器、列表、搜索）
  - 集成useResourceList Hook
  - 实现搜索功能（防抖300ms）
  - 实现创建资源流程（类型选择 → 表单填写）
  - 实现批量删除功能
  - _Requirements: REQ-FR-001, REQ-FR-013, REQ-FR-016, REQ-FR-025_

- [ ]* 16.1 编写列表页集成测试
  - 测试列表加载和显示
  - 测试搜索功能
  - 测试过滤功能
  - 测试创建资源流程
  - _Requirements: REQ-NFR-029_

### 阶段5：资源详情页面

- [ ] 17. 实现DeleteConfirmModal组件
  - 创建src/pages/Resources/components/DeleteConfirmModal.tsx
  - 显示关联关系信息
  - 要求输入资源名称确认
  - 只有输入完全匹配时才能确认
  - _Requirements: REQ-FR-048, REQ-FR-049, REQ-FR-050_

- [ ] 18. 实现ResourceDetailPage页面
  - 创建src/pages/Resources/Detail.tsx
  - 实现PageHeader（面包屑、标题、操作按钮）
  - 集成useResourceDetail Hook
  - 实现Tab切换（概览、配置、拓扑、Agent、任务、权限）
  - Tab切换时更新URL参数
  - _Requirements: REQ-FR-026, REQ-FR-027, REQ-FR-028_

- [ ] 19. 实现概览Tab内容
  - 使用Descriptions组件展示基本信息
  - 显示：名称、类型、状态、描述、标签、时间、创建者
  - 底部显示操作历史（Timeline组件）
  - _Requirements: REQ-FR-029, REQ-FR-034_

- [ ] 20. 实现配置Tab内容
  - 使用Descriptions组件展示扩展属性
  - 根据资源类型显示不同字段
  - 敏感字段使用SensitiveField组件
  - _Requirements: REQ-FR-030_

- [ ] 21. 实现权限Tab内容
  - 使用List组件展示Owner和Viewer列表
  - 每个用户显示头像、姓名、邮箱
  - _Requirements: REQ-FR-033_

- [ ] 22. 实现编辑功能
  - 点击"编辑"按钮切换到编辑模式
  - Descriptions切换为Form
  - 表单预填充当前值
  - 实现保存和取消逻辑
  - 处理并发冲突（version不匹配）
  - _Requirements: REQ-FR-035, REQ-FR-038, REQ-FR-040, REQ-FR-042, REQ-FR-043_

- [ ] 23. 实现删除功能
  - 点击"删除"按钮先检查关联关系
  - 显示DeleteConfirmModal
  - 删除成功后跳转到列表页
  - _Requirements: REQ-FR-047, REQ-FR-051, REQ-FR-052_

- [ ] 24. 实现状态切换功能
  - 列表页：点击状态徽章显示下拉菜单
  - 详情页：使用Select组件切换状态
  - 只有Owner可以切换
  - 更新成功后刷新数据
  - _Requirements: REQ-FR-055, REQ-FR-056, REQ-FR-057, REQ-FR-059_

- [ ]* 24.1 编写详情页集成测试
  - 测试详情加载和显示
  - 测试编辑功能
  - 测试删除功能
  - 测试状态切换
  - 测试权限控制
  - _Requirements: REQ-NFR-029_

### 阶段6：性能优化和错误处理

- [ ] 25. 实现性能优化
  - 实现代码分割（React.lazy）
  - 对纯展示组件使用React.memo
  - 实现虚拟滚动（当资源>1000时）
  - 优化搜索防抖（300ms）
  - _Requirements: REQ-NFR-001, REQ-NFR-006_

- [ ] 26. 实现错误处理
  - 实现ErrorBoundary组件
  - 配置Axios错误拦截器
  - 实现403错误页面
  - 实现404错误页面
  - 所有错误显示友好提示
  - _Requirements: REQ-NFR-013, REQ-NFR-015, REQ-NFR-016, REQ-NFR-017_

- [ ] 27. 实现加载状态和用户反馈
  - 所有异步操作显示loading状态
  - 操作成功显示success message
  - 危险操作显示确认对话框
  - 空状态显示Empty组件
  - _Requirements: REQ-NFR-018, REQ-NFR-019, REQ-NFR-020, REQ-NFR-022_

### 阶段7：最终测试和优化

- [ ] 28. 端到端测试
  - 测试完整的创建资源流程
  - 测试完整的编辑资源流程
  - 测试完整的删除资源流程
  - 测试搜索和过滤组合
  - 测试权限控制
  - 确保所有测试通过，询问用户是否有问题

- [ ] 29. 性能测试和优化
  - 测试页面首次加载时间（目标<2秒）
  - 测试列表查询响应时间（目标<1秒）
  - 测试搜索响应时间（目标<500ms）
  - 测试1000条数据渲染性能（目标<500ms）
  - 根据测试结果进行优化
  - 确保所有测试通过，询问用户是否有问题

- [ ] 30. 浏览器兼容性测试
  - 测试Chrome ≥90
  - 测试Firefox ≥88
  - 测试Safari ≥14
  - 测试Edge ≥90
  - 修复兼容性问题
  - 确保所有测试通过，询问用户是否有问题

---

## 任务依赖关系

```
阶段1（1-4）→ 阶段2（5-8）→ 阶段3（9-11）
                                    ↓
                            阶段4（12-16）
                                    ↓
                            阶段5（17-24）
                                    ↓
                            阶段6（25-27）
                                    ↓
                            阶段7（28-30）
```

**关键路径**：
1 → 2 → 3 → 9 → 12-16 → 17-24 → 28-30

**可并行任务**：
- 阶段2的所有任务（5-8）可以并行
- 阶段4的组件任务（12-15）可以并行
- 阶段5的Tab内容任务（19-21）可以并行

---

## 验收标准

### 功能验收

- [ ] 所有52个功能需求都已实现
- [ ] 用户可以创建、查看、编辑、删除资源
- [ ] 搜索、过滤、排序功能正常工作
- [ ] 权限控制正确（Owner/Viewer）
- [ ] 敏感信息正确保护
- [ ] 状态切换功能正常

### 性能验收

- [ ] 页面首次加载时间 < 2秒
- [ ] 列表查询响应时间 < 1秒
- [ ] 搜索响应时间 < 500ms
- [ ] 详情页加载时间 < 500ms
- [ ] 1000条数据渲染时间 < 500ms

### 质量验收

- [ ] 测试覆盖率 ≥ 70%
- [ ] 所有TypeScript类型检查通过
- [ ] 所有ESLint检查通过
- [ ] 所有单元测试通过
- [ ] 所有集成测试通过

### 兼容性验收

- [ ] Chrome ≥90 正常运行
- [ ] Firefox ≥88 正常运行
- [ ] Safari ≥14 正常运行
- [ ] Edge ≥90 正常运行

---

## 注意事项

### 开发规范

1. **代码组织**：严格遵循设计文档中的目录结构
2. **类型定义**：所有组件和函数都必须有完整的TypeScript类型
3. **组件命名**：使用PascalCase，文件名与组件名一致
4. **测试编写**：每个功能实现后立即编写测试
5. **提交规范**：使用[TaskID] Description格式

### 测试策略

1. **单元测试**：工具函数、Service层、Hooks（覆盖率≥80%）
2. **组件测试**：所有共享组件和页面级组件（覆盖率≥70%）
3. **集成测试**：完整的用户流程（核心流程必须覆盖）
4. **性能测试**：关键性能指标必须达标

### 性能优化

1. **代码分割**：使用React.lazy懒加载页面组件
2. **组件优化**：纯展示组件使用React.memo
3. **虚拟滚动**：列表数据>1000时启用react-window
4. **防抖节流**：搜索使用300ms防抖

### 错误处理

1. **网络错误**：显示友好提示，提供重试按钮
2. **权限错误**：显示403错误页面
3. **资源不存在**：显示404错误页面
4. **并发冲突**：提示用户刷新后重试
5. **全局错误**：使用ErrorBoundary捕获

---

## 参考文档

- 需求澄清文档: `.kiro/specs/resource-management-ui/requirement-clarification.md`
- 需求规格说明书: `.kiro/specs/resource-management-ui/requirements.md`
- 需求验证文档: `.kiro/specs/resource-management-ui/requirement-verification.md`
- 设计文档: `.kiro/specs/resource-management-ui/design.md`
- 设计验证文档: `.kiro/specs/resource-management-ui/design-verification.md`
- 后端Swagger文档: `http://localhost:8080/swagger-ui/index.html`

---

**文档版本**: v1.0  
**最后更新**: 2024-11-30  
**状态**: 待用户确认

