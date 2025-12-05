# CSS 样式最佳实践

## 核心原则

### 1. 禁止使用内联样式

**禁止**在 React 组件中使用内联 `style` 属性定义样式。

```tsx
// ❌ 错误示例
<Select style={{ width: 160 }} />
<div style={{ display: 'flex', gap: 12 }} />

// ✅ 正确示例
<Select className={listStyles.selectWide} />
<div className={listStyles.filterBar} />
```

### 2. 使用 CSS Modules

所有样式必须通过 CSS Modules (`.module.css`) 文件定义：

```tsx
// ✅ 正确的导入方式
import styles from './Component.module.css'
import listStyles from '@/styles/list-page.module.css'
```

### 3. 列表页使用统一样式文件

**所有列表页面必须使用 `@/styles/list-page.module.css` 统一样式文件**，禁止在各页面单独定义筛选栏相关样式。

```tsx
// ✅ 正确：使用统一样式
import listStyles from '@/styles/list-page.module.css'

<div className={listStyles.filterBar}>
  <Select className={listStyles.selectWide} />
  <Select className={listStyles.selectStandard} />
  <Search className={listStyles.searchInput} />
</div>
```

## 统一样式规范

### 筛选栏控件尺寸

| 类名 | 宽度 | 用途 |
|------|------|------|
| `.selectStandard` | 140px | 标准下拉框（状态筛选、所有者筛选等） |
| `.selectWide` | 160px | 宽型下拉框（类型筛选、标签筛选等） |
| `.searchInput` | 220px | 搜索框 |

### 按钮样式

| 类名 | 样式 | 用途 |
|------|------|------|
| `.primaryButton` | 圆角 6px，高度 32px | 主操作按钮 |
| `.smallButton` | 圆角 4px | 小型按钮 |

### 布局容器

| 类名 | 用途 |
|------|------|
| `.filterBar` | 筛选栏容器（筛选控件 + 操作按钮） |
| `.filterControls` | 筛选控件组容器 |
| `.actionButtons` | 操作按钮组容器 |
| `.batchActionBar` | 批量操作栏 |

## 使用示例

### 列表页筛选栏

```tsx
import listStyles from '@/styles/list-page.module.css'

// 页面主容器中
<div className={listStyles.filterBar}>
  {/* 左侧筛选控件 */}
  <FilterBarComponent />

  {/* 右侧操作按钮 */}
  <div className={listStyles.actionButtons}>
    <Button className={listStyles.primaryButton}>创建</Button>
  </div>
</div>

// 筛选栏组件内
<div className={listStyles.filterControls}>
  <Select className={listStyles.selectWide} placeholder="类型筛选" />
  <Select className={listStyles.selectStandard} placeholder="状态筛选" />
  <Search className={listStyles.searchInput} placeholder="搜索" />
</div>
```

### 批量操作栏

```tsx
{selectedRowKeys.length > 0 && (
  <div className={listStyles.batchActionBar}>
    <span className={listStyles.batchActionText}>
      已选择 {selectedRowKeys.length} 项
    </span>
    <Button size="small" className={listStyles.smallButton}>
      批量删除
    </Button>
  </div>
)}
```

## 文件组织

```
src/
├── styles/
│   └── list-page.module.css    # 列表页统一样式（必须使用）
└── pages/
    └── SomePage/
        └── index.tsx           # 导入 @/styles/list-page.module.css
```

## 检查清单

创建或修改列表页时，请确认：

- [ ] 使用 `@/styles/list-page.module.css` 统一样式
- [ ] 没有使用内联 `style` 属性
- [ ] 没有创建独立的筛选栏 CSS Module 文件
- [ ] 下拉框、搜索框宽度与其他页面保持一致
- [ ] 按钮样式使用统一的类名
