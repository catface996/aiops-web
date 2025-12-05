# 列表页设计规范

本规范适用于带查询条件的数据列表页面，旨在提供一致的用户体验和开发标准。

## 一、页面整体布局

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 / 模块名称 (面包屑导航)                                       │
├─────────────────────────────────────────────────────────────────┤
│  [筛选条件区域]                              [操作按钮区域]       │
├─────────────────────────────────────────────────────────────────┤
│  [批量操作栏] (仅在选中数据时显示)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                        数据表格区域                               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  分页控件                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.1 面包屑导航

- **位置**：页面顶部，由父布局组件（BasicLayout）统一渲染
- **格式**：🏠 首页图标 / 当前页面名称
- **功能**：首页图标可点击返回仪表盘

```tsx
// 面包屑组件由 BasicLayout 统一管理
// 子页面不需要单独处理面包屑
<PageBreadcrumb />
```

**路由配置映射**：
```tsx
const routeMap = {
  '/dashboard': { name: '仪表盘' },
  '/resources': { name: '资源管理' },
  '/resources/:id': { name: '资源详情', parent: '/resources' },
  '/subgraphs': { name: '子图管理' },
  '/subgraphs/:id': { name: '子图详情', parent: '/subgraphs' },
}
```

### 1.2 页面标题

- **移除独立标题**：不再在页面内显示 `<Title>` 组件
- **依赖面包屑**：面包屑已包含页面名称，无需重复显示

## 二、筛选条件区域

### 2.1 布局原则

- 筛选条件和操作按钮在同一行，筛选在左，操作在右
- 筛选条件按使用频率从左到右排列
- 使用 `flexbox` 布局，支持响应式换行

```tsx
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 12
}}>
  <div style={{ display: 'flex', gap: 12 }}>
    {/* 筛选条件 */}
  </div>
  <div>
    {/* 操作按钮 */}
  </div>
</div>
```

### 2.2 筛选控件选择

| 场景 | 推荐控件 | 说明 |
|------|----------|------|
| 单选分类筛选 | `Select` | 如：单个部门、单个状态 |
| 多选分类筛选 | `Select mode="multiple"` | 如：多个类型、多个标签 |
| 关键词搜索 | `Input.Search` | 支持输入和回车搜索 |
| 日期范围 | `DatePicker.RangePicker` | 如：创建时间范围 |
| 布尔开关 | `Switch` 或 `Checkbox` | 如：是否启用 |

### 2.3 下拉复选框规范

```tsx
<Select
  mode="multiple"
  allowClear
  placeholder="请选择"
  style={{ minWidth: 160 }}
  maxTagCount="responsive"  // 自适应显示选中标签
  options={options}
  value={selectedValues}
  onChange={handleChange}
/>
```

**选项格式**（带图标）：
```tsx
const options = items.map(item => ({
  label: (
    <Space size={4}>
      <IconComponent />
      <span>{item.name}</span>
    </Space>
  ),
  value: item.id,
}))
```

### 2.4 搜索框规范

```tsx
<Input.Search
  placeholder="搜索关键词"
  allowClear
  style={{ width: 250 }}
  onSearch={handleSearch}
  onChange={(e) => handleSearch(e.target.value)}
/>
```

**搜索防抖**：
- 输入时使用 300ms 防抖延迟
- 回车或点击搜索按钮立即触发

### 2.5 重置按钮

- 当有任何筛选条件激活时显示
- 点击后清空所有筛选条件
- 位置：筛选条件末尾

```tsx
{hasActiveFilters && (
  <Button icon={<ReloadOutlined />} onClick={handleReset}>
    重置
  </Button>
)}
```

## 三、数据表格区域

### 3.1 表格列配置

| 列类型 | 建议宽度 | 说明 |
|--------|----------|------|
| 选择列 | 48px | 固定宽度 |
| 名称/标题 | 200-300px | 可点击跳转详情 |
| 类型/分类 | 120px | 带图标显示 |
| 状态 | 100px | 使用 Badge 或 Tag |
| 时间 | 180px | 格式：YYYY-MM-DD HH:mm |
| 操作 | 120-150px | 固定在右侧 |

### 3.2 表格功能

```tsx
<Table
  rowKey="id"
  columns={columns}
  dataSource={data}
  loading={loading}
  rowSelection={rowSelection}  // 行选择
  pagination={pagination}       // 分页
  scroll={{ x: 'max-content' }} // 横向滚动
  locale={{ emptyText: <EmptyState /> }}
/>
```

### 3.3 排序支持

- 常用排序字段：名称、创建时间、更新时间
- 使用 `sorter` 属性启用列排序

```tsx
{
  title: '创建时间',
  dataIndex: 'createdAt',
  sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
}
```

### 3.4 操作列规范

```tsx
{
  title: '操作',
  key: 'actions',
  width: 120,
  render: (_, record) => (
    <Space size={0}>
      <Tooltip title="编辑">
        <Button type="link" size="small" icon={<EditOutlined />} />
      </Tooltip>
      <Tooltip title="删除">
        <Button type="link" size="small" danger icon={<DeleteOutlined />} />
      </Tooltip>
    </Space>
  ),
}
```

**操作按钮数量**：
- 1-3个：直接显示图标按钮
- 3个以上：使用下拉菜单收纳

## 四、空状态处理

### 4.1 无数据状态

```tsx
<Empty
  image={<InboxOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
  description="暂无数据"
>
  <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
    创建资源
  </Button>
</Empty>
```

### 4.2 搜索无结果状态

```tsx
<Empty
  image={Empty.PRESENTED_IMAGE_SIMPLE}
  description="没有找到匹配的数据"
/>
```

## 五、分页配置

```tsx
pagination={{
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
  onChange: handlePaginationChange,
}}
```

**分页规则**：
- 默认每页 20 条
- 筛选条件变化时，重置到第 1 页
- 分页变化时，保持筛选条件不变

## 六、批量操作栏

```tsx
{selectedRowKeys.length > 0 && (
  <div style={{
    marginBottom: 16,
    padding: '8px 16px',
    background: '#f0f5ff',
    borderRadius: 4
  }}>
    <Space>
      <span>已选择 {selectedRowKeys.length} 项</span>
      <Button danger size="small" icon={<DeleteOutlined />}>
        批量删除
      </Button>
      <Button size="small" onClick={() => setSelectedRowKeys([])}>
        取消选择
      </Button>
    </Space>
  </div>
)}
```

## 七、状态管理

### 7.1 推荐的 Hook 结构

```tsx
interface UseListReturn<T> {
  // 数据
  data: T[]
  loading: boolean
  error: Error | null

  // 分页
  pagination: {
    current: number
    pageSize: number
    total: number
  }

  // 筛选
  filters: FilterParams

  // 操作
  refresh: () => Promise<void>
  setFilters: (filters: Partial<FilterParams>) => void
  setPagination: (pagination: { current?: number; pageSize?: number }) => void
}
```

### 7.2 筛选参数类型

```tsx
interface FilterParams {
  // 多选筛选（推荐）
  typeIds?: number[]
  statuses?: string[]

  // 单选筛选（兼容）
  typeId?: number
  status?: string

  // 搜索
  keyword?: string

  // 分页
  page?: number
  size?: number
}
```

## 八、API 请求规范

### 8.1 请求参数处理

```tsx
// 多选参数转换为逗号分隔字符串
if (params.typeIds?.length > 0) {
  queryParams.typeIds = params.typeIds.join(',')
}

// 空数组不传递
if (params.statuses?.length > 0) {
  queryParams.statuses = params.statuses.join(',')
}
```

### 8.2 响应数据格式

```tsx
interface PageResult<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
```

## 九、交互细节

### 9.1 加载状态

- 表格加载时显示 loading 状态
- 筛选/搜索时保持表格结构，仅显示加载遮罩

### 9.2 操作反馈

- 创建/编辑/删除成功后显示 `message.success`
- 失败时显示 `message.error`
- 批量操作显示进度或结果统计

### 9.3 键盘支持

- 搜索框支持回车触发搜索
- 下拉框支持键盘导航
- ESC 关闭下拉框

## 十、响应式适配

### 10.1 断点设计

| 屏幕宽度 | 布局调整 |
|----------|----------|
| >= 1200px | 完整布局 |
| 768-1199px | 筛选条件换行 |
| < 768px | 筛选条件垂直排列，表格横向滚动 |

### 10.2 实现方式

```tsx
<div style={{
  display: 'flex',
  flexWrap: 'wrap',  // 允许换行
  gap: 12
}}>
  {/* 筛选控件 */}
</div>
```

## 十一、代码组织

### 11.1 文件结构

```
pages/
  Resources/
    index.tsx              # 主页面
    components/
      ResourceFilterBar.tsx  # 筛选栏组件
      ResourceTable.tsx      # 表格组件
hooks/
  useResourceList.ts       # 列表数据 Hook
services/
  resource.ts              # API 服务
types/
  resource.ts              # 类型定义
```

### 11.2 组件职责

| 组件 | 职责 |
|------|------|
| 主页面 | 状态管理、事件处理、布局组合 |
| FilterBar | 筛选 UI、筛选事件触发 |
| Table | 数据展示、行操作、分页 |
| Hook | 数据获取、状态维护、参数处理 |

## 十二、最佳实践

1. **筛选条件变化时自动重置页码**
2. **使用防抖处理搜索输入**
3. **空状态提供创建入口**
4. **批量操作需要二次确认**
5. **删除操作使用危险按钮样式**
6. **时间显示使用相对友好格式**
7. **操作按钮使用 Tooltip 说明**
8. **加载状态保持布局稳定**
