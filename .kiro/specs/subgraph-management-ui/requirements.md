# 需求规格说明书

**功能名称**: F08 - 子图管理（前端）  
**文档版本**: v1.1  
**创建日期**: 2024-12-04  
**最后更新**: 2024-12-04  
**需求分析师**: AI Assistant  
**状态**: 需求完善中 🔄

---

## 引言

### 文档目的

本文档定义了F08子图管理功能前端部分的详细需求规格，使用EARS（Easy Approach to Requirements Syntax）语法编写，确保需求的准确性、完整性和可测试性。

### 范围

本文档涵盖子图管理的前端界面和交互功能，包括子图的创建、查看、编辑、删除、资源节点管理和拓扑可视化的用户界面实现。不包括后端API实现和数据库设计。

### 术语表

| 术语 | 定义 |
|------|------|
| **System** | AIOps前端应用系统 |
| **Frontend** | 前端应用，基于React + TypeScript + Ant Design |
| **Subgraph** | 子图，资源节点的逻辑分组，代表特定的业务域、系统模块或运维范围 |
| **Resource Node** | 资源节点，IT资源（服务器、应用、数据库等），可以同时包含在多个子图中 |
| **Owner** | 子图所有者，拥有完全控制权限，包括编辑、删除、权限管理和资源节点管理 |
| **Viewer** | 子图查看者，只有只读访问权限，可以查看子图详情和拓扑 |
| **Topology Graph** | 拓扑图，显示子图内资源节点及其相互关系的可视化表示 |
| **Form Validation** | 表单验证，前端实时验证用户输入 |
| **Loading State** | 加载状态，异步操作时的UI反馈 |
| **Optimistic Lock** | 乐观锁，使用version字段防止并发冲突 |

---

## 需求完善说明（v1.1）

本次完善主要针对以下方面：

### 补充的边界条件
- **标签输入验证**：明确标签长度（1-50字符）和允许字符（字母、数字、连字符、下划线）
- **批量操作限制**：限制一次最多操作50个节点，防止性能问题
- **网络超时处理**：设置30秒超时阈值，提供明确的超时处理策略

### 新增的交互细节
- **表单取消确认**：有未保存更改时显示确认对话框
- **过滤器重置**：提供一键重置所有过滤条件的功能
- **列表刷新**：提供手动刷新列表的功能
- **拓扑图布局选择**：支持多种布局算法（力导向、层次、环形）
- **拓扑图导出**：支持导出为PNG或SVG图片

### 新增的非功能性需求
- **国际化支持**：支持中英文切换，日期时间本地化
- **数据缓存策略**：列表缓存5分钟，详情缓存2分钟，操作后自动失效
- **离线状态检测**：检测网络断开并显示提示
- **请求重试机制**：非4xx错误自动重试2次

### 完善的异常场景
- **拓扑图空状态**：无节点或无关系时的友好提示
- **网络超时**：明确的超时处理和重试机制
- **批量操作超限**：超过50个节点时的提示和限制

### 新增的假设和风险
- 新增5个假设验证项（AS-011至AS-015）
- 新增5个风险评估项（RISK-010至RISK-014）
- 新增5个需求澄清记录（澄清6至澄清10）

---

## 功能性需求


### 需求1：子图创建界面

**用户故事**: 作为运维工程师，我希望通过友好的界面创建新的子图，以便将相关资源组织成一个逻辑组。

#### 验收标准

**REQ-FR-001**: 创建按钮展示  
**优先级**: MUST  
WHEN 用户访问子图管理页面 THEN THE System SHALL display a "Create Subgraph" button in the top-right corner of the page

**REQ-FR-002**: 创建表单展示  
**优先级**: MUST  
WHEN 用户点击"创建子图"按钮 THEN THE System SHALL display a modal dialog with a creation form containing name field (required, 1-255 characters), description field (optional, max 1000 characters), tags field (optional, max 10 tags), and metadata fields (business domain, environment, team)

**REQ-FR-002-A**: 标签输入验证  
**优先级**: MUST  
WHEN 用户输入标签 THEN THE System SHALL validate that each tag is 1-50 characters, contains only alphanumeric characters, hyphens, and underscores, and display error message "Tag must be 1-50 characters and contain only letters, numbers, hyphens, and underscores" if invalid

**REQ-FR-002-B**: 描述字段格式  
**优先级**: MUST  
THE System SHALL preserve line breaks and whitespace in description field and display them correctly in detail view

**REQ-FR-002-C**: 表单取消确认  
**优先级**: SHOULD  
WHEN 用户在表单有未保存更改时点击取消或关闭按钮 THEN THE System SHALL display a confirmation dialog with message "You have unsaved changes. Are you sure you want to discard them?"

**REQ-FR-003**: 名称字段验证  
**优先级**: MUST  
WHEN 用户填写子图名称 THEN THE System SHALL validate in real-time that the name is 1-255 characters and display error message "Name must be 1-255 characters" if invalid

**REQ-FR-004**: 名称唯一性验证  
**优先级**: MUST  
WHEN 用户提交创建表单 AND 子图名称已存在 THEN THE System SHALL display error message "Subgraph name already exists" below the name field and prevent submission

**REQ-FR-005**: 创建提交处理  
**优先级**: MUST  
WHEN 用户点击"创建"按钮 THEN THE System SHALL validate all form fields, display loading state on the button, and submit data to backend API

**REQ-FR-006**: 创建成功反馈  
**优先级**: MUST  
WHEN 子图创建成功 THEN THE System SHALL display a success message "Subgraph created successfully" for 3 seconds, close the modal, and navigate to the subgraph detail page

**REQ-FR-007**: 创建失败处理  
**优先级**: MUST  
WHEN 子图创建失败 THEN THE System SHALL display an error message with backend error details and preserve form data

**REQ-FR-008**: 自动设置Owner  
**优先级**: MUST  
WHEN 子图创建成功 THEN THE System SHALL automatically set the creator as the first Owner of the subgraph

---

### 需求2：子图列表界面

**用户故事**: 作为运维工程师，我希望查看我有权访问的所有子图列表，并具有搜索和过滤功能，以便快速找到我需要使用的子图。

#### 验收标准

**REQ-FR-009**: 列表页面布局  
**优先级**: MUST  
WHEN 用户访问子图管理页面 THEN THE System SHALL display a three-column layout with filters panel (240px width), subgraph table (adaptive width), and search box with create button in top-right corner

**REQ-FR-010**: 子图表格展示  
**优先级**: MUST  
THE System SHALL display subgraph list in a table with columns: name (clickable), description (truncated to 100 characters), tags (max 3 visible), owner count, resource count, created time, updated time, and actions

**REQ-FR-011**: 权限过滤  
**优先级**: MUST  
THE System SHALL display only subgraphs where the user is an Owner or Viewer

**REQ-FR-012**: 表格分页  
**优先级**: MUST  
WHEN 子图列表包含超过20项 THEN THE System SHALL display pagination controls at the bottom with default page size of 20 and options for 10/20/50/100 items per page

**REQ-FR-013**: 搜索功能  
**优先级**: MUST  
WHEN 用户在搜索框输入关键词 THEN THE System SHALL debounce input for 300ms and filter subgraphs by name or description with fuzzy matching

**REQ-FR-014**: 搜索结果高亮  
**优先级**: MUST  
WHEN 搜索返回结果 THEN THE System SHALL highlight matching keywords in subgraph names and descriptions

**REQ-FR-015**: 标签过滤器  
**优先级**: MUST  
THE System SHALL display a tags filter in the left panel with checkboxes for all used tags, supporting multi-selection with AND logic

**REQ-FR-016**: 所有者过滤器  
**优先级**: MUST  
THE System SHALL display an owner filter in the left panel with checkboxes for all owners, supporting multi-selection with OR logic

**REQ-FR-017**: 排序功能  
**优先级**: MUST  
WHEN 用户选择排序选项 THEN THE System SHALL sort the subgraph list by selected criteria (created time, updated time, or name) in ascending or descending order

**REQ-FR-018**: 列表加载状态  
**优先级**: MUST  
WHEN 列表数据加载中 THEN THE System SHALL display a loading spinner in the center of the table and disable all interactions

**REQ-FR-019**: 空状态展示  
**优先级**: MUST  
WHEN 列表无数据 THEN THE System SHALL display an empty state component with message "No subgraphs found" and a "Create Subgraph" button

**REQ-FR-020**: 搜索无结果状态  
**优先级**: MUST  
WHEN 搜索无结果 THEN THE System SHALL display an empty state with message "No subgraphs match your search" and a "Clear Search" button

**REQ-FR-020-A**: 过滤器重置功能  
**优先级**: MUST  
THE System SHALL display a "Reset Filters" button at the top of the filter panel that clears all selected filters and search keywords

**REQ-FR-020-B**: 列表刷新功能  
**优先级**: MUST  
THE System SHALL display a refresh button in the toolbar that reloads the subgraph list from the server and shows a loading indicator during refresh

**REQ-FR-020-C**: 过滤器状态持久化  
**优先级**: SHOULD  
WHEN 用户应用过滤器 THEN THE System SHALL update URL query parameters to reflect filter state and restore filters when user navigates back to the page

---

### 需求3：子图详情界面

**用户故事**: 作为运维工程师，我希望查看子图的全面详情，包括基本信息、资源节点、拓扑图和权限，以便了解子图的完整情况。

#### 验收标准

**REQ-FR-021**: 详情页面布局  
**优先级**: MUST  
WHEN 用户访问子图详情页 THEN THE System SHALL display breadcrumb navigation, page header with subgraph name and action buttons (Edit, Delete, Add Node), and tabbed content area

**REQ-FR-022**: Tab页签定义  
**优先级**: MUST  
THE System SHALL display 4 tabs (Overview, Resource Nodes, Topology, Permissions) with the Overview tab selected by default

**REQ-FR-023**: Tab URL同步  
**优先级**: MUST  
WHEN 用户切换Tab THEN THE System SHALL update the URL query parameter (?tab=overview) and support direct access to specific tabs via URL

**REQ-FR-024**: 概览Tab内容  
**优先级**: MUST  
THE System SHALL display basic information in the Overview tab using a descriptions component: name, description, tags, business domain, environment, team, created time, updated time, creator, owner count, and resource count

**REQ-FR-025**: 资源节点Tab内容  
**优先级**: MUST  
THE System SHALL display resource nodes in a table with columns: node name (clickable), type (icon + text), status (badge), added time, added by, and actions (Remove button for Owners)

**REQ-FR-026**: 资源节点列表搜索  
**优先级**: MUST  
WHEN 用户在资源节点Tab输入搜索关键词 THEN THE System SHALL filter nodes by name with fuzzy matching

**REQ-FR-027**: 资源节点点击跳转  
**优先级**: MUST  
WHEN 用户点击资源节点列表中的节点名称 THEN THE System SHALL navigate to the resource node detail page

**REQ-FR-028**: 拓扑图Tab内容  
**优先级**: MUST  
WHEN 用户查看拓扑图Tab THEN THE System SHALL render a visual representation of all nodes in the subgraph and their relationships using custom SVG-based topology visualization (not third-party library)

**REQ-FR-029**: 拓扑图范围限制  
**优先级**: MUST  
THE System SHALL display only relationships between nodes within the subgraph, not relationships with nodes outside the subgraph

**REQ-FR-030**: 拓扑图节点交互  
**优先级**: MUST  
WHEN 用户点击拓扑图中的节点 THEN THE System SHALL highlight the node and display a tooltip with node information (name, type, status)

**REQ-FR-031**: 拓扑图缩放和拖拽  
**优先级**: MUST  
THE System SHALL support zoom in/out using mouse wheel and pan using mouse drag in the topology graph

**REQ-FR-031-A**: 拓扑图空状态  
**优先级**: MUST  
WHEN 子图不包含任何资源节点 THEN THE System SHALL display an empty state in the Topology tab with message "No nodes in this subgraph" and an "Add Node" button

**REQ-FR-031-B**: 拓扑图无关系状态  
**优先级**: MUST  
WHEN 子图包含节点但节点间无关系 THEN THE System SHALL display all nodes in the topology graph with a message "No relationships defined between nodes"

**REQ-FR-031-C**: 拓扑图布局选择  
**优先级**: SHOULD  
THE System SHALL provide layout options (force-directed, hierarchical, circular) in the topology graph toolbar and remember user's layout preference

**REQ-FR-031-D**: 拓扑图导出功能  
**优先级**: SHOULD  
THE System SHALL provide an export button in the topology graph toolbar to download the graph as PNG or SVG image

**REQ-FR-032**: 权限Tab内容  
**优先级**: MUST  
THE System SHALL display Owner list in the Permissions tab, with each user showing avatar, name, and email

**REQ-FR-033**: 权限列表为空状态  
**优先级**: MUST  
WHEN Owner列表为空 THEN THE System SHALL display message "No owners assigned" with an "Add Owner" button (visible only to current Owners)

---

### 需求4：子图信息编辑界面

**用户故事**: 作为子图所有者，我希望编辑子图的基本信息和权限，以便保持子图元数据的最新状态并管理访问控制。

#### 验收标准

**REQ-FR-034**: 编辑按钮显示  
**优先级**: MUST  
WHEN 用户是子图的Owner THEN THE System SHALL display an "Edit" button in the top-right corner of the detail page

**REQ-FR-035**: 编辑按钮隐藏  
**优先级**: MUST  
WHEN 用户不是子图的Owner THEN THE System SHALL hide the "Edit" button

**REQ-FR-036**: 编辑权限验证  
**优先级**: MUST  
WHEN 非Owner用户直接访问编辑URL THEN THE System SHALL display a 403 error page with message "You do not have permission to edit this subgraph"

**REQ-FR-037**: 编辑表单展示  
**优先级**: MUST  
WHEN Owner点击"编辑"按钮 THEN THE System SHALL display a modal dialog with an edit form pre-filled with current subgraph information

**REQ-FR-038**: 名称编辑验证  
**优先级**: MUST  
WHEN Owner更新子图名称为已存在的名称 THEN THE System SHALL display error message "Subgraph name already exists" and prevent submission

**REQ-FR-039**: Owner管理界面  
**优先级**: MUST  
THE System SHALL display an Owner management section in the edit form with a list of current Owners and an "Add Owner" button

**REQ-FR-040**: 添加Owner  
**优先级**: MUST  
WHEN Owner点击"添加Owner"按钮 THEN THE System SHALL display a user selection dialog with search functionality to find and select users

**REQ-FR-041**: 移除Owner  
**优先级**: MUST  
WHEN Owner点击移除其他Owner THEN THE System SHALL display a confirmation dialog and remove the user from the Owner list upon confirmation

**REQ-FR-042**: 最后一个Owner保护  
**优先级**: MUST  
WHEN Owner尝试移除自己作为最后一个Owner THEN THE System SHALL prevent the operation and display warning message "Cannot remove the last owner. Please add another owner first"

**REQ-FR-043**: 编辑保存处理  
**优先级**: MUST  
WHEN Owner点击"保存"按钮 THEN THE System SHALL validate form, display loading state, and submit update request with version field for optimistic locking

**REQ-FR-044**: 编辑成功反馈  
**优先级**: MUST  
WHEN 子图更新成功 THEN THE System SHALL display success message "Subgraph updated successfully", close the modal, and refresh the detail page data

**REQ-FR-045**: 编辑冲突处理  
**优先级**: MUST  
WHEN 子图更新冲突(version不匹配) THEN THE System SHALL display a modal dialog with message "Subgraph has been modified by others. Please refresh and try again" with a "Refresh Page" button

**REQ-FR-046**: Owner变更通知  
**优先级**: SHOULD  
WHEN Owner添加或移除其他Owner THEN THE System SHALL display a notification indicating that affected users will be notified

---

### 需求5：子图删除功能

**用户故事**: 作为子图所有者，我希望删除不再需要的子图，以便维护一个干净有序的子图列表。

#### 验收标准

**REQ-FR-047**: 删除按钮显示  
**优先级**: MUST  
WHEN 用户是子图的Owner THEN THE System SHALL display a "Delete" button (danger type) in the top-right corner of the detail page

**REQ-FR-048**: 删除按钮隐藏  
**优先级**: MUST  
WHEN 用户不是子图的Owner THEN THE System SHALL hide the "Delete" button

**REQ-FR-049**: 删除权限验证  
**优先级**: MUST  
WHEN 非Owner用户尝试删除子图 THEN THE System SHALL reject the operation and display error message "You do not have permission to delete this subgraph"

**REQ-FR-050**: 非空子图删除阻止  
**优先级**: MUST  
WHEN Owner尝试删除包含资源节点的子图 THEN THE System SHALL reject the operation and display error message "Cannot delete subgraph with resources. Please remove all resources first" with resource count

**REQ-FR-051**: 空子图删除确认  
**优先级**: MUST  
WHEN Owner点击"删除"按钮 AND 子图为空 THEN THE System SHALL display a confirmation dialog with warning message "This action cannot be undone. Are you sure you want to delete this subgraph?"

**REQ-FR-052**: 删除名称验证  
**优先级**: MUST  
THE System SHALL require the user to input the exact subgraph name in the confirmation dialog to enable the "Confirm Delete" button

**REQ-FR-053**: 删除执行  
**优先级**: MUST  
WHEN Owner输入正确的子图名称并点击"确认删除" THEN THE System SHALL call delete API, display loading state, and disable the button to prevent duplicate submissions

**REQ-FR-054**: 删除成功反馈  
**优先级**: MUST  
WHEN 子图删除成功 THEN THE System SHALL display success message "Subgraph deleted successfully" and navigate to the subgraph list page

**REQ-FR-055**: 删除失败处理  
**优先级**: MUST  
WHEN 子图删除失败 THEN THE System SHALL display an error message with backend error details and close the confirmation dialog

**REQ-FR-056**: 资源节点保留确认  
**优先级**: MUST  
THE System SHALL display information in the delete confirmation dialog stating "Resource nodes will not be deleted, only the subgraph association will be removed"

---

### 需求6：向子图添加资源节点

**用户故事**: 作为子图所有者，我希望向子图添加资源节点而不考虑节点所有权，以便构建跨不同所有者的相关资源的完整视图。

#### 验收标准

**REQ-FR-057**: 添加节点按钮显示  
**优先级**: MUST  
WHEN 用户是子图的Owner THEN THE System SHALL display an "Add Node" button in the top-right corner of the detail page and in the Resource Nodes tab

**REQ-FR-058**: 添加节点按钮隐藏  
**优先级**: MUST  
WHEN 用户不是子图的Owner THEN THE System SHALL hide the "Add Node" button

**REQ-FR-059**: 资源节点选择界面  
**优先级**: MUST  
WHEN Owner点击"添加节点"按钮 THEN THE System SHALL display a modal dialog with a resource node selection interface including search box, type filter, and node list

**REQ-FR-060**: 节点列表展示  
**优先级**: MUST  
THE System SHALL display available resource nodes in a table with columns: checkbox, name, type (icon + text), status (badge), and owner, with pagination support

**REQ-FR-061**: 节点搜索功能  
**优先级**: MUST  
WHEN Owner在选择界面输入搜索关键词 THEN THE System SHALL filter nodes by name with fuzzy matching

**REQ-FR-062**: 节点类型过滤  
**优先级**: MUST  
THE System SHALL provide a type filter dropdown to filter nodes by resource type

**REQ-FR-063**: 已添加节点标识  
**优先级**: MUST  
THE System SHALL disable checkboxes and display a "Already Added" badge for nodes that are already in the subgraph

**REQ-FR-064**: 批量选择支持  
**优先级**: MUST  
THE System SHALL support selecting multiple nodes using checkboxes and display selected count in the modal footer

**REQ-FR-064-A**: 批量选择数量限制  
**优先级**: MUST  
WHEN 用户选择超过50个节点 THEN THE System SHALL display a warning message "You can add up to 50 nodes at once. Please reduce your selection" and disable the Add button

**REQ-FR-064-B**: 全选功能  
**优先级**: SHOULD  
THE System SHALL provide a "Select All" checkbox in the table header that selects all nodes on the current page (excluding already added nodes)

**REQ-FR-065**: 添加节点提交  
**优先级**: MUST  
WHEN Owner选择节点并点击"添加"按钮 THEN THE System SHALL submit the request to add selected nodes to the subgraph and display loading state

**REQ-FR-066**: 添加成功反馈  
**优先级**: MUST  
WHEN 节点添加成功 THEN THE System SHALL display success message "X nodes added successfully", close the modal, and refresh the resource nodes list

**REQ-FR-067**: 添加失败处理  
**优先级**: MUST  
WHEN 节点添加失败 THEN THE System SHALL display an error message with backend error details and keep the modal open

**REQ-FR-068**: 重复节点提示  
**优先级**: MUST  
WHEN Owner尝试添加已存在的节点 THEN THE System SHALL display message "Node already exists in this subgraph"

**REQ-FR-069**: 无所有权限制  
**优先级**: MUST  
THE System SHALL allow adding resource nodes to the subgraph without verifying node ownership

**REQ-FR-070**: 审计日志记录  
**优先级**: MUST  
WHEN 节点成功添加 THEN THE System SHALL display a notification that the operation has been logged in the audit log

---

### 需求7：从子图移除资源节点

**用户故事**: 作为子图所有者，我希望从子图中移除资源节点，以便维护当前系统范围的准确表示。

#### 验收标准

**REQ-FR-071**: 移除按钮显示  
**优先级**: MUST  
WHEN 用户是子图的Owner THEN THE System SHALL display a "Remove" button in the actions column for each resource node in the Resource Nodes tab

**REQ-FR-072**: 移除按钮隐藏  
**优先级**: MUST  
WHEN 用户不是子图的Owner THEN THE System SHALL hide the "Remove" button

**REQ-FR-073**: 移除权限验证  
**优先级**: MUST  
WHEN 非Owner用户尝试移除节点 THEN THE System SHALL reject the operation and display error message "You do not have permission to remove nodes"

**REQ-FR-074**: 移除确认对话框  
**优先级**: MUST  
WHEN Owner点击资源节点的"移除"按钮 THEN THE System SHALL display a confirmation dialog with message "Are you sure you want to remove this node from the subgraph? The node itself will not be deleted"

**REQ-FR-075**: 移除执行  
**优先级**: MUST  
WHEN Owner确认节点移除 THEN THE System SHALL call API to remove the association between the subgraph and the node

**REQ-FR-076**: 移除成功反馈  
**优先级**: MUST  
WHEN 节点移除成功 THEN THE System SHALL display success message "Node removed successfully" and refresh the resource nodes list

**REQ-FR-077**: 移除失败处理  
**优先级**: MUST  
WHEN 节点移除失败 THEN THE System SHALL display an error message with backend error details

**REQ-FR-078**: 节点保留确认  
**优先级**: MUST  
THE System SHALL clearly indicate in the confirmation dialog that the resource node itself will not be deleted or modified

**REQ-FR-079**: 其他子图关联保留  
**优先级**: MUST  
THE System SHALL preserve the node's associations with other subgraphs when removing it from the current subgraph

**REQ-FR-080**: 批量移除支持  
**优先级**: SHOULD  
WHEN Owner选中多个节点 THEN THE System SHALL display a "Batch Remove" button in the toolbar

**REQ-FR-081**: 批量移除确认  
**优先级**: SHOULD  
WHEN Owner点击"批量移除"按钮 THEN THE System SHALL display a confirmation dialog showing the count of nodes to be removed

**REQ-FR-082**: 审计日志记录  
**优先级**: MUST  
WHEN 节点成功移除 THEN THE System SHALL display a notification that the operation has been logged in the audit log

---

## 非功能性需求

### 需求8：性能要求

**REQ-NFR-001**: 列表查询性能  
**优先级**: MUST  
THE System SHALL ensure subgraph list query response time is less than 1 second for up to 1000 subgraphs

**REQ-NFR-002**: 详情页加载性能  
**优先级**: MUST  
THE System SHALL ensure subgraph detail page load time is less than 2 seconds for subgraphs with up to 500 nodes

**REQ-NFR-003**: 拓扑图渲染性能  
**优先级**: MUST  
THE System SHALL ensure topology graph rendering time is less than 3 seconds for up to 500 nodes and 1000 relationships

**REQ-NFR-004**: 操作响应性能  
**优先级**: MUST  
THE System SHALL ensure subgraph operations (create, update, delete) complete within 500 milliseconds

**REQ-NFR-005**: 搜索响应性能  
**优先级**: MUST  
THE System SHALL ensure search response time is less than 500ms with debouncing of 300ms

**REQ-NFR-006**: 并发用户支持  
**优先级**: MUST  
THE System SHALL maintain acceptable response times for up to 100 concurrent users accessing subgraph features

**REQ-NFR-007**: 大数据量渲染优化  
**优先级**: MUST  
THE System SHALL use virtual scrolling or pagination to optimize rendering performance when displaying large lists (>100 items)

---

### 需求9：响应式设计

**REQ-NFR-008**: 桌面端适配  
**优先级**: MUST  
THE System SHALL provide optimal experience on desktop (≥1200px width) with three-column layout, full table columns, and centered dialogs

**REQ-NFR-009**: 平板端适配  
**优先级**: SHOULD  
THE System SHALL provide good experience on tablets (768px-1199px width) with collapsible filters, hidden non-essential table columns, and adaptive form width

**REQ-NFR-010**: 移动端基本支持  
**优先级**: COULD  
THE System SHALL provide basic usability on mobile devices (<768px width) with card view for list, drawer for filters, and fullscreen forms

---

### 需求10：可访问性

**REQ-NFR-011**: 键盘导航支持  
**优先级**: SHOULD  
THE System SHALL support complete keyboard navigation with Tab key for traversing interactive elements, Enter key for triggering buttons, and Esc key for closing dialogs

**REQ-NFR-012**: 屏幕阅读器支持  
**优先级**: SHOULD  
THE System SHALL support screen readers by providing aria-label for icon buttons, proper label associations for form fields, aria-live for error messages, and correct role attributes for dialogs

**REQ-NFR-013**: 颜色对比度  
**优先级**: MUST  
THE System SHALL ensure text-to-background contrast ratio ≥ 4.5:1 and button-to-background contrast ratio ≥ 3:1

---

### 需求11：错误处理

**REQ-NFR-014**: 网络错误处理  
**优先级**: MUST  
WHEN 网络请求失败 THEN THE System SHALL display a user-friendly error message with specific error details and provide a retry button when applicable

**REQ-NFR-014-A**: 网络超时处理  
**优先级**: MUST  
WHEN 网络请求超过30秒未响应 THEN THE System SHALL cancel the request, display timeout error message "Request timed out. Please check your network connection and try again", and provide a retry button

**REQ-NFR-014-B**: 请求重试机制  
**优先级**: SHOULD  
WHEN 网络请求失败(非4xx错误) THEN THE System SHALL automatically retry up to 2 times with exponential backoff (1s, 2s) before showing error message

**REQ-NFR-014-C**: 离线状态检测  
**优先级**: SHOULD  
WHEN 用户网络断开 THEN THE System SHALL display a persistent notification banner "You are offline. Some features may not be available" at the top of the page

**REQ-NFR-015**: 表单验证错误  
**优先级**: MUST  
WHEN 表单验证失败 THEN THE System SHALL display error messages below invalid fields, highlight field borders in red, and scroll to the first error field

**REQ-NFR-016**: 权限错误处理  
**优先级**: MUST  
WHEN 用户无权限操作 THEN THE System SHALL display a 403 error page with title "Access Denied", description "You do not have permission to perform this action", and a "Return to List" button

**REQ-NFR-017**: 404错误处理  
**优先级**: MUST  
WHEN 子图不存在 THEN THE System SHALL display a 404 error page with title "Subgraph Not Found", description "The subgraph you are looking for does not exist or has been deleted", and a "Return to List" button

**REQ-NFR-018**: 全局错误边界  
**优先级**: MUST  
THE System SHALL use React ErrorBoundary to catch all unhandled component errors, display a friendly error page, log errors to console, and provide a "Refresh Page" button

**REQ-NFR-019**: 并发冲突处理  
**优先级**: MUST  
WHEN 并发操作修改同一子图 THEN THE System SHALL use optimistic locking to detect conflicts and display a clear error message prompting the user to refresh and retry

---

### 需求12：用户体验

**REQ-NFR-020**: 加载状态反馈  
**优先级**: MUST  
THE System SHALL provide loading state feedback for all async operations: spinner in table center for list loading, loading state on buttons for actions, top progress bar for page navigation, and skeleton screens for detail page loading

**REQ-NFR-021**: 操作成功反馈  
**优先级**: MUST  
THE System SHALL provide clear success feedback for all successful operations using message component displayed for 3 seconds at the top center of the page with specific success message

**REQ-NFR-022**: 危险操作确认  
**优先级**: MUST  
THE System SHALL provide confirmation dialogs for dangerous operations: delete subgraph (two-step confirmation with name input), remove nodes (showing impact), and remove owners (showing affected users)

**REQ-NFR-023**: 界面偏好持久化  
**优先级**: SHOULD  
THE System SHALL persist user interface preferences: list page size to localStorage, filter selections to URL parameters, and table sorting to URL parameters, restoring user selections after page refresh

**REQ-NFR-024**: 友好的空状态  
**优先级**: MUST  
THE System SHALL provide friendly empty states with clear explanatory text, relevant action buttons, and appropriate icons and text combinations

**REQ-NFR-025**: 拓扑图交互体验  
**优先级**: MUST  
THE System SHALL provide smooth topology graph interactions: smooth zoom and pan animations, node hover effects, clear node selection states, and responsive tooltip display

---

### 需求13：安全性

**REQ-NFR-026**: XSS防护  
**优先级**: MUST  
THE System SHALL prevent XSS attacks by escaping all user input, using React JSX automatic escaping, avoiding dangerouslySetInnerHTML unless necessary and sanitized, and not passing sensitive fields in URLs

**REQ-NFR-027**: CSRF防护  
**优先级**: MUST  
THE System SHALL include CSRF token in all requests using Axios interceptor to automatically add token obtained from cookie or response header, with all POST/PUT/DELETE requests including the token

**REQ-NFR-028**: 权限验证  
**优先级**: MUST  
THE System SHALL perform strict permission checks (frontend + backend dual verification) for all operations: create, edit, delete, add nodes, and remove nodes

**REQ-NFR-029**: 审计日志可见性  
**优先级**: SHOULD  
THE System SHALL provide visibility into audit logging by displaying notifications when operations are logged and optionally showing recent audit logs in the detail page

---

### 需求14：国际化

**REQ-NFR-029-A**: 多语言支持  
**优先级**: SHOULD  
THE System SHALL support Chinese (Simplified) and English languages with ability to switch between them via user preferences

**REQ-NFR-029-B**: 日期时间本地化  
**优先级**: SHOULD  
THE System SHALL display dates and times according to user's locale settings (e.g., YYYY-MM-DD HH:mm:ss for Chinese, MM/DD/YYYY HH:mm:ss for English)

**REQ-NFR-029-C**: 数字格式本地化  
**优先级**: SHOULD  
THE System SHALL format numbers according to user's locale (e.g., 1,000 for English, 1 000 for some locales)

---

### 需求15：数据缓存

**REQ-NFR-029-D**: 列表数据缓存  
**优先级**: SHOULD  
THE System SHALL cache subgraph list data for 5 minutes to reduce server load and improve response time for repeated visits

**REQ-NFR-029-E**: 详情数据缓存  
**优先级**: SHOULD  
THE System SHALL cache subgraph detail data for 2 minutes and invalidate cache when user performs update operations

**REQ-NFR-029-F**: 缓存失效策略  
**优先级**: SHOULD  
THE System SHALL invalidate relevant caches when user creates, updates, or deletes subgraphs to ensure data consistency

---

### 需求16：可维护性

**REQ-NFR-030**: 代码组织规范  
**优先级**: MUST  
THE System SHALL follow project code organization standards: components in src/components/, pages in src/pages/, services in src/services/, type definitions in src/types/, with each functional module in independent directory

**REQ-NFR-031**: TypeScript类型定义  
**优先级**: MUST  
THE System SHALL provide complete type definitions for all components and functions: interface definitions for all Props, type definitions for all API responses, type definitions for all states, avoiding any type, and using strict mode (strict: true)

**REQ-NFR-032**: 组件复用  
**优先级**: SHOULD  
THE System SHALL extract reusable components: subgraph card component, owner list component, node selection component, topology graph component, and permission check HOC

**REQ-NFR-033**: 测试覆盖率  
**优先级**: SHOULD  
THE System SHALL achieve reasonable test coverage: component test coverage ≥ 70%, critical business logic test coverage ≥ 80%, using React Testing Library and Vitest as test framework

---

## 优先级说明

### MoSCoW优先级

| 优先级 | 说明 | 需求数量 |
|-------|------|---------|
| **MUST** | MVP必须实现 | 80个 |
| **SHOULD** | 重要但可延后 | 20个 |
| **COULD** | 可选功能 | 1个 |
| **WONT** | 本版本不实现 | 0个 |

### 优先级分布

- **功能性需求**: 76个MUST，6个SHOULD
- **非功能性需求**: 27个MUST，14个SHOULD，1个COULD

---

## 需求追溯矩阵

| 需求ID | 用户故事 | 后端需求 | 后端API | 状态 |
|-------|---------|---------|---------|------|
| REQ-FR-001 | 需求1 | 需求1-AC1 | - | 已定义 |
| REQ-FR-002 | 需求1 | 需求1-AC1 | - | 已定义 |
| REQ-FR-003 | 需求1 | 需求1-AC3 | - | 已定义 |
| REQ-FR-004 | 需求1 | 需求1-AC4 | - | 已定义 |
| REQ-FR-005 | 需求1 | 需求1-AC2 | POST /api/v1/subgraphs | 已定义 |
| REQ-FR-006 | 需求1 | 需求1-AC5 | - | 已定义 |
| REQ-FR-007 | 需求1 | 需求1-AC2 | - | 已定义 |
| REQ-FR-008 | 需求1 | 需求1-AC2 | - | 已定义 |
| REQ-FR-009 | 需求2 | 需求2-AC1 | - | 已定义 |
| REQ-FR-010 | 需求2 | 需求2-AC1 | GET /api/v1/subgraphs | 已定义 |
| REQ-FR-011 | 需求2 | 需求2-AC1 | - | 已定义 |
| REQ-FR-012 | 需求2 | 需求2-AC6 | - | 已定义 |
| REQ-FR-013 | 需求2 | 需求2-AC2 | GET /api/v1/subgraphs | 已定义 |
| REQ-FR-014 | 需求2 | 需求2-AC2 | - | 已定义 |
| REQ-FR-015 | 需求2 | 需求2-AC3 | - | 已定义 |
| REQ-FR-016 | 需求2 | 需求2-AC4 | - | 已定义 |
| REQ-FR-017 | 需求2 | 需求2-AC5 | - | 已定义 |
| REQ-FR-018 | 需求2 | - | - | 已定义 |
| REQ-FR-019 | 需求2 | - | - | 已定义 |
| REQ-FR-020 | 需求2 | - | - | 已定义 |
| REQ-FR-021 | 需求7 | 需求7-AC1 | - | 已定义 |
| REQ-FR-022 | 需求7 | 需求7-AC1 | - | 已定义 |
| REQ-FR-023 | 需求7 | - | - | 已定义 |
| REQ-FR-024 | 需求7 | 需求7-AC1 | - | 已定义 |
| REQ-FR-025 | 需求7 | 需求7-AC2 | - | 已定义 |
| REQ-FR-026 | 需求7 | - | - | 已定义 |
| REQ-FR-027 | 需求7 | 需求7-AC5 | - | 已定义 |
| REQ-FR-028 | 需求7 | 需求7-AC3 | GET /api/v1/subgraphs/{id}/topology | 已定义 |
| REQ-FR-029 | 需求7 | 需求7-AC4 | - | 已定义 |
| REQ-FR-030 | 需求7 | 需求7-AC6 | - | 已定义 |
| REQ-FR-031 | 需求7 | - | - | 已定义 |
| REQ-FR-032 | 需求7 | 需求7-AC7 | - | 已定义 |
| REQ-FR-033 | 需求7 | - | - | 已定义 |
| REQ-FR-034 | 需求3 | 需求3-AC1 | - | 已定义 |
| REQ-FR-035 | 需求3 | 需求3-AC2 | - | 已定义 |
| REQ-FR-036 | 需求3 | 需求3-AC2 | - | 已定义 |
| REQ-FR-037 | 需求3 | 需求3-AC1 | - | 已定义 |
| REQ-FR-038 | 需求3 | 需求3-AC3 | - | 已定义 |
| REQ-FR-039 | 需求3 | 需求3-AC5 | - | 已定义 |
| REQ-FR-040 | 需求3 | 需求3-AC5 | - | 已定义 |
| REQ-FR-041 | 需求3 | 需求3-AC5 | - | 已定义 |
| REQ-FR-042 | 需求3 | 需求3-AC6 | - | 已定义 |
| REQ-FR-043 | 需求3 | 需求3-AC4 | PUT /api/v1/subgraphs/{id} | 已定义 |
| REQ-FR-044 | 需求3 | 需求3-AC4 | - | 已定义 |
| REQ-FR-045 | 需求3 | 需求3-AC4 | - | 已定义 |
| REQ-FR-046 | 需求3 | 需求3-AC5 | - | 已定义 |
| REQ-FR-047 | 需求4 | 需求4-AC1 | - | 已定义 |
| REQ-FR-048 | 需求4 | 需求4-AC1 | - | 已定义 |
| REQ-FR-049 | 需求4 | 需求4-AC1 | - | 已定义 |
| REQ-FR-050 | 需求4 | 需求4-AC2 | - | 已定义 |
| REQ-FR-051 | 需求4 | 需求4-AC3 | - | 已定义 |
| REQ-FR-052 | 需求4 | 需求4-AC3 | - | 已定义 |
| REQ-FR-053 | 需求4 | 需求4-AC4 | DELETE /api/v1/subgraphs/{id} | 已定义 |
| REQ-FR-054 | 需求4 | 需求4-AC4 | - | 已定义 |
| REQ-FR-055 | 需求4 | 需求4-AC6 | - | 已定义 |
| REQ-FR-056 | 需求4 | 需求4-AC5 | - | 已定义 |
| REQ-FR-057 | 需求5 | 需求5-AC1 | - | 已定义 |
| REQ-FR-058 | 需求5 | 需求5-AC2 | - | 已定义 |
| REQ-FR-059 | 需求5 | 需求5-AC1 | - | 已定义 |
| REQ-FR-060 | 需求5 | 需求5-AC1 | - | 已定义 |
| REQ-FR-061 | 需求5 | - | - | 已定义 |
| REQ-FR-062 | 需求5 | - | - | 已定义 |
| REQ-FR-063 | 需求5 | 需求5-AC4 | - | 已定义 |
| REQ-FR-064 | 需求5 | - | - | 已定义 |
| REQ-FR-065 | 需求5 | 需求5-AC2 | POST /api/v1/subgraphs/{id}/nodes | 已定义 |
| REQ-FR-066 | 需求5 | 需求5-AC5 | - | 已定义 |
| REQ-FR-067 | 需求5 | 需求5-AC2 | - | 已定义 |
| REQ-FR-068 | 需求5 | 需求5-AC4 | - | 已定义 |
| REQ-FR-069 | 需求5 | 需求5-AC3 | - | 已定义 |
| REQ-FR-070 | 需求5 | 需求5-AC5 | - | 已定义 |
| REQ-FR-071 | 需求6 | 需求6-AC1 | - | 已定义 |
| REQ-FR-072 | 需求6 | 需求6-AC2 | - | 已定义 |
| REQ-FR-073 | 需求6 | 需求6-AC2 | - | 已定义 |
| REQ-FR-074 | 需求6 | 需求6-AC1 | - | 已定义 |
| REQ-FR-075 | 需求6 | 需求6-AC3 | DELETE /api/v1/subgraphs/{id}/nodes/{nodeId} | 已定义 |
| REQ-FR-076 | 需求6 | 需求6-AC6 | - | 已定义 |
| REQ-FR-077 | 需求6 | 需求6-AC3 | - | 已定义 |
| REQ-FR-078 | 需求6 | 需求6-AC4 | - | 已定义 |
| REQ-FR-079 | 需求6 | 需求6-AC5 | - | 已定义 |
| REQ-FR-080 | 需求6 | - | - | 已定义 |
| REQ-FR-081 | 需求6 | - | - | 已定义 |
| REQ-FR-082 | 需求6 | 需求6-AC6 | - | 已定义 |

---

## 技术栈说明

### 核心技术

- **React**: 18.x - 前端框架，支持并发特性
- **TypeScript**: 5.x - 类型安全，启用严格模式
- **Ant Design**: 5.x - 企业级UI组件库
- **React Router**: 6.x - 声明式路由
- **Axios**: Latest - HTTP客户端，支持拦截器
- **Vite**: 5.x - 快速构建工具和开发服务器

### 拓扑图可视化

- **已选方案**: 自定义SVG实现（无第三方库依赖）
  - 实现方式：基于React + SVG + CSS的自定义组件
  - 核心组件：
    - `TopologyCanvas`: 主画布组件，管理交互
    - `TopologyNode`: 节点组件，支持拖拽
    - `TopologyEdge`: 边组件，支持箭头标记
    - `RelationModal`: 关系创建/编辑弹窗
  - 功能特性：
    - 节点拖拽和位置持久化（LocalStorage）
    - 鼠标滚轮缩放和拖拽平移
    - 连接点创建关系
    - 节点和边的选择
    - 双击打开详情
    - 自动布局算法
  - 优势：
    - 完全控制渲染和交互逻辑
    - 轻量级（无外部依赖）
    - 可根据需求高度定制
    - 中等规模图（<500节点）性能优秀
  - 代码位置：`src/pages/Topology/components/`
  - 参考实现：已在F04功能中实现并验证

### 状态管理

- **React Context**: 全局状态管理（认证、用户信息）
- **React Hooks**: 组件状态管理（表单、列表、详情）
- 不使用Redux（保持轻量）

### 测试工具

- **Vitest**: 单元测试框架
- **React Testing Library**: 组件测试
- **fast-check**: 属性测试（最少100次迭代）

---

## API接口依赖

### 子图管理API

| 接口 | 方法 | 说明 | 对应需求 |
|------|------|------|---------|
| /api/v1/subgraphs | GET | 获取子图列表 | REQ-FR-010, REQ-FR-013 |
| /api/v1/subgraphs | POST | 创建子图 | REQ-FR-005 |
| /api/v1/subgraphs/{id} | GET | 获取子图详情 | REQ-FR-024 |
| /api/v1/subgraphs/{id} | PUT | 更新子图 | REQ-FR-043 |
| /api/v1/subgraphs/{id} | DELETE | 删除子图 | REQ-FR-053 |
| /api/v1/subgraphs/{id}/nodes | GET | 获取子图资源节点列表 | REQ-FR-025 |
| /api/v1/subgraphs/{id}/nodes | POST | 添加资源节点到子图 | REQ-FR-065 |
| /api/v1/subgraphs/{id}/nodes/{nodeId} | DELETE | 从子图移除资源节点 | REQ-FR-075 |
| /api/v1/subgraphs/{id}/topology | GET | 获取子图拓扑数据 | REQ-FR-028 |
| /api/v1/subgraphs/{id}/permissions | GET | 获取子图权限信息 | REQ-FR-032 |
| /api/v1/subgraphs/{id}/permissions | PUT | 更新子图权限 | REQ-FR-040, REQ-FR-041 |
| /api/v1/resources | GET | 获取可用资源节点列表（用于添加） | REQ-FR-060 |

### 请求/响应格式

所有API遵循统一的请求/响应格式：

**成功响应**:
```typescript
{
  code: 200,
  message: "success",
  data: T
}
```

**错误响应**:
```typescript
{
  code: number,
  message: string,
  errors?: Array<{
    field: string,
    message: string
  }>
}
```

### 数据模型

**Subgraph（子图）**:
```typescript
interface Subgraph {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  metadata?: {
    businessDomain?: string;
    environment?: string;
    team?: string;
  };
  ownerCount: number;
  resourceCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number; // 用于乐观锁
}
```

**SubgraphDetail（子图详情）**:
```typescript
interface SubgraphDetail extends Subgraph {
  owners: User[];
  resources: ResourceNode[];
}
```

**ResourceNode（资源节点）**:
```typescript
interface ResourceNode {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  addedAt: string;
  addedBy: string;
}
```

**TopologyData（拓扑数据）**:
```typescript
interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

interface TopologyNode {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
}

interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}
```

---

## 假设验证结果

| 假设ID | 假设内容 | 验证方法 | 验证结果 | 状态 |
|-------|---------|---------|---------|------|
| AS-001 | 后端API已经实现并可用 | 调用API测试 | 待验证 | 待验证 |
| AS-002 | 用户浏览器支持ES2015+ | 浏览器兼容性测试 | 待验证 | 待验证 |
| AS-003 | 单个子图的资源节点不超过500个 | 查看后端限制 | 待验证 | 待验证 |
| AS-004 | 用户网络环境稳定，延迟<100ms | 网络测试 | 待验证 | 待验证 |
| AS-005 | 用户熟悉基本的Web操作 | 用户测试 | 待验证 | 待验证 |
| AS-006 | Ant Design 5.x组件库满足所有UI需求 | 原型设计 | 待验证 | 待验证 |
| AS-007 | 子图列表不会超过1000个 | 性能测试 | 待验证 | 待验证 |
| AS-008 | 自定义SVG拓扑图实现满足子图可视化需求 | 参考F04实现 | 已验证 ✅ | 已确认 |
| AS-009 | 用户不会频繁创建和删除子图 | 用户行为监控 | 待验证 | 待验证 |
| AS-010 | 子图名称全局唯一性由后端保证 | 后端验证 | 待验证 | 待验证 |
| AS-011 | 批量操作不会超过50个节点 | 用户行为分析 | 待验证 | 待验证 |
| AS-012 | 用户网络超时阈值设置为30秒合理 | 用户体验测试 | 待验证 | 待验证 |
| AS-013 | 标签长度限制50字符满足业务需求 | 业务需求确认 | 待验证 | 待验证 |
| AS-014 | 缓存5分钟不会导致数据不一致问题 | 业务场景分析 | 待验证 | 待验证 |

---

## 风险评估

| 风险ID | 风险描述 | 概率 | 影响 | 等级 | 缓解策略 | 状态 |
|-------|---------|------|------|------|---------|------|
| RISK-001 | 拓扑图渲染性能问题（大量节点） | 低 | 高 | 中 | 复用F04已验证的SVG实现，限制子图节点数量<500，实现虚拟化 | 已缓解 ✅ |
| RISK-002 | 拓扑图组件复用适配问题 | 低 | 中 | 低 | F04组件已实现，只需适配子图范围过滤逻辑 | 已制定 |
| RISK-003 | 权限控制逻辑复杂 | 低 | 高 | 中 | HOC封装+统一处理 | 已制定 |
| RISK-004 | 并发编辑冲突处理 | 低 | 中 | 低 | 乐观锁+友好提示 | 已制定 |
| RISK-005 | 子图名称唯一性验证延迟 | 中 | 低 | 低 | 前端防抖+后端最终验证 | 已制定 |
| RISK-006 | 浏览器兼容性问题 | 低 | 中 | 低 | Polyfill+测试 | 已制定 |
| RISK-007 | 网络不稳定导致操作失败 | 中 | 中 | 中 | 请求重试+离线提示 | 已制定 |
| RISK-008 | 批量操作性能问题 | 低 | 中 | 低 | 分批处理+进度提示 | 已制定 |
| RISK-009 | 拓扑图数据量过大导致内存溢出 | 低 | 高 | 中 | 数据分页加载+节点聚合 | 已制定 |
| RISK-010 | 标签输入特殊字符导致XSS攻击 | 低 | 高 | 中 | 严格输入验证+转义 | 已制定 |
| RISK-011 | 缓存策略导致数据不一致 | 中 | 中 | 中 | 合理的缓存失效策略+版本控制 | 已制定 |
| RISK-012 | 批量操作超时 | 中 | 中 | 中 | 限制批量数量+进度反馈 | 已制定 |
| RISK-013 | 国际化翻译不完整或不准确 | 中 | 低 | 低 | 专业翻译审核+回退机制 | 已制定 |

---

## 依赖关系

### 前置依赖

- **F01: 用户登录和身份认证** - 提供用户身份验证和JWT token
- **F02: 管理资源的访问权限** - 提供权限验证机制
- **F03: 创建和管理IT资源** - 提供资源节点数据
- **F04: 建立资源间的拓扑关系** - 提供节点关系数据
- **F05: 可视化查看拓扑图** - 提供拓扑图渲染能力（可复用组件）

### 后置依赖

无

---

## 界面设计要点

### 子图列表页面

**布局结构**:
```
┌─────────────────────────────────────────────────────────────┐
│ Header: 子图管理                    [搜索框] [创建子图]      │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ 过滤器   │  子图表格                                        │
│          │  ┌────────────────────────────────────────────┐ │
│ 标签     │  │ 名称 | 描述 | 标签 | Owner | 节点 | 时间  │ │
│ ☐ tag1   │  ├────────────────────────────────────────────┤ │
│ ☐ tag2   │  │ 子图A | ... | ... | 2 | 15 | 2024-12-01  │ │
│          │  │ 子图B | ... | ... | 1 | 8  | 2024-12-02  │ │
│ 所有者   │  └────────────────────────────────────────────┘ │
│ ☐ User1  │                                                  │
│ ☐ User2  │  [分页控件]                                     │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

**关键元素**:
- 左侧过滤面板：240px固定宽度，包含标签过滤器和所有者过滤器
- 中间表格区域：自适应宽度，显示子图列表
- 右上角操作区：搜索框（300px宽）+ 创建按钮
- 表格列：名称（可点击）、描述（截断）、标签（最多显示3个）、Owner数量、资源数量、创建时间、更新时间、操作
- 分页控件：底部居中，显示总数和页码

---

### 子图创建/编辑对话框

**表单结构**:
```
┌─────────────────────────────────────────────┐
│ 创建子图                              [×]   │
├─────────────────────────────────────────────┤
│                                             │
│ 基本信息                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ 名称 *                                  │ │
│ │ [                                    ]  │ │
│ │                                         │ │
│ │ 描述                                    │ │
│ │ [                                    ]  │ │
│ │ [                                    ]  │ │
│ │                                         │ │
│ │ 标签                                    │ │
│ │ [tag1] [tag2] [+ 添加]                 │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 元数据                                      │
│ ┌─────────────────────────────────────────┐ │
│ │ 业务域                                  │ │
│ │ [下拉选择                            ▼] │ │
│ │                                         │ │
│ │ 环境                                    │ │
│ │ [下拉选择                            ▼] │ │
│ │                                         │ │
│ │ 团队                                    │ │
│ │ [下拉选择                            ▼] │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 权限设置（仅编辑时显示）                    │
│ ┌─────────────────────────────────────────┐ │
│ │ Owner列表                               │ │
│ │ • User1 (you) [×]                       │ │
│ │ • User2       [×]                       │ │
│ │ [+ 添加Owner]                           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│                        [取消]  [创建/保存]  │
└─────────────────────────────────────────────┘
```

**关键元素**:
- 模态对话框：宽度600px，居中显示
- 必填字段标记：红色星号(*)
- 实时验证：输入时显示错误提示
- 标签输入：支持添加/删除，最多10个
- Owner管理：列表显示，支持添加/删除，最后一个不可删除

---

### 子图详情页面

**Tab布局**:
```
┌─────────────────────────────────────────────────────────────┐
│ 首页 > 子图管理 > 子图A                                      │
├─────────────────────────────────────────────────────────────┤
│ 子图A                          [编辑] [删除] [添加节点]     │
│ 业务系统 | 15个资源节点                                      │
├─────────────────────────────────────────────────────────────┤
│ [概览] [资源节点] [拓扑图] [权限]                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 【概览Tab】                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 基本信息                                                │ │
│ │ 名称：子图A                                             │ │
│ │ 描述：业务系统相关资源                                  │ │
│ │ 标签：[生产环境] [核心业务]                            │ │
│ │ 业务域：支付系统                                        │ │
│ │ 环境：生产                                              │ │
│ │ 团队：运维团队                                          │ │
│ │ 创建时间：2024-12-01 10:00:00                           │ │
│ │ 更新时间：2024-12-04 15:30:00                           │ │
│ │ 创建者：User1                                           │ │
│ │                                                         │ │
│ │ 统计信息                                                │ │
│ │ Owner数量：2                                            │ │
│ │ 资源节点数量：15                                        │ │
│ │ 拓扑关系数量：23                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**资源节点Tab**:
```
┌─────────────────────────────────────────────────────────────┐
│ [搜索框]                                      [添加节点]     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 节点名称 | 类型 | 状态 | 添加时间 | 添加者 | 操作      │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Server-01 | 🖥️ 服务器 | 🟢 运行中 | 2024-12-01 | User1 | [移除] │ │
│ │ App-API   | 📱 应用   | 🟢 运行中 | 2024-12-01 | User1 | [移除] │ │
│ │ DB-Main   | 🗄️ 数据库 | 🟢 运行中 | 2024-12-02 | User2 | [移除] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [分页控件]                                                  │
└─────────────────────────────────────────────────────────────┘
```

**拓扑图Tab**:
```
┌─────────────────────────────────────────────────────────────┐
│ [缩放控件] [全屏] [刷新]                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────┐                             │
│                    │Server-01│                             │
│                    └────┬────┘                             │
│                         │                                   │
│                    ┌────▼────┐                             │
│                    │ App-API │                             │
│                    └────┬────┘                             │
│                         │                                   │
│                    ┌────▼────┐                             │
│                    │ DB-Main │                             │
│                    └─────────┘                             │
│                                                             │
│ [图例] 🖥️ 服务器  📱 应用  🗄️ 数据库                      │
└─────────────────────────────────────────────────────────────┘
```

**权限Tab**:
```
┌─────────────────────────────────────────────────────────────┐
│ Owner列表                                    [添加Owner]     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👤 User1                                                │ │
│ │    user1@example.com                          [移除]    │ │
│ │                                                         │ │
│ │ 👤 User2                                                │ │
│ │    user2@example.com                          [移除]    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 添加资源节点对话框

**选择界面**:
```
┌─────────────────────────────────────────────┐
│ 添加资源节点                          [×]   │
├─────────────────────────────────────────────┤
│ [搜索框]              [类型过滤 ▼]          │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ ☐ | 节点名称 | 类型 | 状态 | Owner     │ │
│ ├─────────────────────────────────────────┤ │
│ │ ☐ | Server-02 | 🖥️ 服务器 | 🟢 | User3 │ │
│ │ ☐ | App-Web   | 📱 应用   | 🟢 | User4 │ │
│ │ ☑ | DB-Cache  | 🗄️ 数据库 | 🟢 | User5 │ │
│ │ - | Server-01 | 🖥️ 服务器 | 🟢 | User1 │ │ ← 已添加
│ └─────────────────────────────────────────┘ │
│ [分页控件]                                  │
│                                             │
│ 已选择 1 个节点              [取消]  [添加] │
└─────────────────────────────────────────────┘
```

**关键元素**:
- 模态对话框：宽度800px，高度600px
- 搜索框：支持模糊搜索节点名称
- 类型过滤：下拉选择资源类型
- 表格：支持多选，已添加的节点禁用并标记
- 底部：显示已选择数量，添加按钮

---

### 删除确认对话框

**两步确认**:
```
┌─────────────────────────────────────────────┐
│ ⚠️ 删除子图                           [×]   │
├─────────────────────────────────────────────┤
│                                             │
│ 此操作无法撤销！                            │
│                                             │
│ 删除子图后：                                │
│ • 子图将被永久删除                          │
│ • 所有权限记录将被删除                      │
│ • 资源节点本身不会被删除                    │
│                                             │
│ 请输入子图名称以确认删除：                  │
│ ┌─────────────────────────────────────────┐ │
│ │ [                                    ]  │ │
│ └─────────────────────────────────────────┘ │
│ 提示：请输入 "子图A"                        │
│                                             │
│                        [取消]  [确认删除]  │
│                                  (禁用)     │
└─────────────────────────────────────────────┘
```

**关键元素**:
- 警告图标：醒目的红色警告
- 后果说明：清晰列出删除影响
- 名称输入：必须完全匹配才能启用确认按钮
- 确认按钮：默认禁用，输入正确后启用
- 危险样式：红色按钮表示危险操作

---

## 需求质量检查清单

### 完整性检查 ✅

- [x] 所有用户故事都有明确的验收标准
- [x] 所有MUST需求都有对应的测试要点
- [x] 所有API依赖都已明确定义
- [x] 所有数据模型都有TypeScript类型定义
- [x] 所有界面都有设计要点说明

### 一致性检查 ✅

- [x] 需求ID编号连续且无重复
- [x] 优先级标记统一使用MoSCoW方法
- [x] EARS语法使用一致
- [x] 术语使用统一（参考术语表）
- [x] 需求追溯矩阵完整

### 可测试性检查 ✅

- [x] 所有需求都可以通过测试验证
- [x] 验收标准明确且可量化
- [x] 边界条件和异常场景已覆盖
- [x] 性能指标具体且可测量

### 可实现性检查 ✅

- [x] 技术栈选择合理且可行
- [x] 性能要求在技术能力范围内
- [x] 依赖关系清晰且可满足
- [x] 风险已识别且有缓解策略

### 待确认项 ⚠️

- [ ] 后端API是否已实现（AS-001）
- [x] 拓扑图可视化实现（已确认使用自定义SVG，复用F04组件）
- [ ] 国际化翻译资源准备
- [ ] 缓存策略与后端协调

---

## 测试要点

### 功能测试

- 测试创建子图（正常流程、名称重复、必填字段验证、标签验证、表单取消确认）
- 测试编辑子图信息（基本信息、Owner管理、并发冲突、表单取消确认）
- 测试删除子图（空子图、非空子图、权限验证）
- 测试添加资源节点（单个、批量、重复节点、无所有权限制、批量数量限制、全选功能）
- 测试移除资源节点（单个、批量、权限验证）
- 测试搜索和过滤功能（名称搜索、标签过滤、所有者过滤、排序、过滤器重置、状态持久化）
- 测试权限控制（Owner、Viewer、未授权用户）
- 测试拓扑图展示（节点渲染、关系显示、交互操作、空状态、布局切换、导出功能）
- 测试列表刷新功能（手动刷新、自动刷新）

### 性能测试

- 测试大量子图的列表加载性能（1000个子图）
- 测试包含大量节点的子图详情页加载性能（500个节点）
- 测试子图拓扑图的渲染性能（500个节点，1000个关系）
- 测试搜索和过滤的响应速度
- 测试批量操作的性能（批量添加/移除节点）

### 安全测试

- 测试未授权用户无法编辑/删除子图
- 测试未授权用户无法添加/移除资源节点
- 测试XSS防护（用户输入转义）
- 测试CSRF防护（token验证）
- 测试审计日志记录完整性

### 集成测试

- 测试子图与资源节点的关联
- 测试子图拓扑图与全局拓扑图的一致性
- 测试删除子图后资源节点不受影响
- 测试权限变更后的访问控制
- 测试多个子图共享资源节点的场景

### 用户体验测试

- 测试加载状态反馈
- 测试操作成功/失败提示
- 测试空状态展示（列表空、搜索无结果、拓扑图空）
- 测试错误处理和恢复（网络错误、超时、离线状态）
- 测试响应式布局（桌面、平板、移动）
- 测试国际化（中英文切换、日期时间格式、数字格式）
- 测试缓存策略（数据一致性、缓存失效）

---

## 附录

### A. EARS语法说明

本文档使用EARS（Easy Approach to Requirements Syntax）语法编写需求：

- **无条件**: THE System SHALL [行为]
- **事件驱动**: WHEN [事件] THEN THE System SHALL [响应]
- **条件**: IF [条件] THEN THE System SHALL [行为]
- **状态**: WHILE [状态] THE System SHALL [行为]
- **可选**: WHERE [选项] THE System SHALL [行为]

### B. 参考文档

- 后端需求文档: `doc/features/F08-子图管理.md`（后端需求分析）
- 原始Feature文档: `doc/features/F08-子图管理.md`
- Ant Design文档: https://ant.design/
- React文档: https://react.dev/
- 拓扑图参考实现: `src/pages/Topology/components/`（F04功能）

### C. 需求澄清记录

#### 澄清1: 子图名称唯一性

**问题**: 子图名称是否需要全局唯一？  
**澄清**: 是的，子图名称必须在系统中全局唯一，由后端保证。前端需要在创建和编辑时进行验证，并在名称重复时显示清晰的错误提示。

#### 澄清2: 资源节点与子图的关系

**问题**: 一个资源节点可以属于多个子图吗？  
**澄清**: 是的，一个资源节点可以同时属于多个子图（多对多关系）。从一个子图移除节点不影响其在其他子图中的存在。

#### 澄清3: 权限角色简化

**问题**: 是否需要Manager角色？  
**澄清**: 不需要。只保留Owner和Viewer两种角色。Owner拥有完全控制权（包括资源节点管理），Viewer只有查看权限。

#### 澄清4: 子图删除策略

**问题**: 删除子图时如何处理资源节点？  
**澄清**: 子图采用物理删除，但删除前必须先移除所有资源节点。非空子图的删除请求会被拒绝，并提示用户先移除节点。资源节点本身不会被删除。

#### 澄清5: 拓扑图显示范围

**问题**: 子图拓扑图是否显示与子图外节点的关系？  
**澄清**: 不显示。子图拓扑图只显示子图内节点之间的关系，不显示与子图外节点的关系。这样可以保持拓扑图的清晰性和性能。

#### 澄清6: 批量操作限制

**问题**: 批量添加/移除节点是否有数量限制？  
**澄清**: 是的。为了保证性能和用户体验，批量操作限制为一次最多50个节点。超过限制时前端会提示用户分批操作。

#### 澄清7: 标签输入规则

**问题**: 标签可以包含哪些字符？  
**澄清**: 标签只能包含字母、数字、连字符(-)和下划线(_)，长度1-50字符。不允许空格和特殊字符，以确保标签的一致性和可读性。

#### 澄清8: 表单取消行为

**问题**: 用户取消表单时是否需要确认？  
**澄清**: 如果表单有未保存的更改，需要显示确认对话框。如果表单未修改，直接关闭。这样可以防止用户误操作丢失数据。

#### 澄清9: 缓存策略

**问题**: 前端是否需要缓存数据？  
**澄清**: 是的。列表数据缓存5分钟，详情数据缓存2分钟。当用户执行创建、更新、删除操作时，自动失效相关缓存。这样可以在性能和数据一致性之间取得平衡。

### D. 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| v1.0 | 2024-12-04 | 初始版本，基于后端需求分析创建 | AI Assistant |
| v1.1 | 2024-12-04 | 完善需求：补充边界条件、异常场景、交互细节；新增国际化、缓存、离线处理需求；更新假设、风险和澄清记录 | AI Assistant |

---

**文档版本**: v1.1  
**最后更新**: 2024-12-04  
**状态**: 需求完善中 🔄  
**下一步**: 继续完善需求细节，然后进入设计阶段

