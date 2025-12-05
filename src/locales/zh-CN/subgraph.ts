/**
 * 子图管理 - 中文翻译
 */
export default {
  // 页面标题
  'subgraph.list.title': '子图管理',
  'subgraph.detail.title': '子图详情',
  'subgraph.create.title': '创建子图',
  'subgraph.edit.title': '编辑子图',

  // 按钮
  'subgraph.button.create': '创建子图',
  'subgraph.button.edit': '编辑',
  'subgraph.button.delete': '删除',
  'subgraph.button.addNode': '添加节点',
  'subgraph.button.save': '保存',
  'subgraph.button.cancel': '取消',
  'subgraph.button.confirm': '确认',
  'subgraph.button.reset': '重置',
  'subgraph.button.refresh': '刷新',
  'subgraph.button.export': '导出',
  'subgraph.button.search': '搜索',
  'subgraph.button.clearSearch': '清除搜索',
  'subgraph.button.resetFilters': '重置筛选',
  'subgraph.button.selectAll': '全选',
  'subgraph.button.batchRemove': '批量移除',

  // 表单字段
  'subgraph.form.name': '名称',
  'subgraph.form.name.placeholder': '请输入子图名称',
  'subgraph.form.name.required': '名称是必填项',
  'subgraph.form.name.length': '名称长度必须在1-255个字符之间',
  'subgraph.form.name.exists': '子图名称已存在',
  'subgraph.form.description': '描述',
  'subgraph.form.description.placeholder': '请输入子图描述',
  'subgraph.form.description.maxLength': '描述不能超过1000个字符',
  'subgraph.form.tags': '标签',
  'subgraph.form.tags.placeholder': '请输入标签',
  'subgraph.form.tags.maxCount': '最多允许10个标签',
  'subgraph.form.tags.format': '标签必须是1-50个字符，只能包含字母、数字、连字符和下划线',
  'subgraph.form.metadata': '元数据',
  'subgraph.form.businessDomain': '业务域',
  'subgraph.form.businessDomain.placeholder': '请输入业务域',
  'subgraph.form.environment': '环境',
  'subgraph.form.environment.placeholder': '请选择环境',
  'subgraph.form.team': '团队',
  'subgraph.form.team.placeholder': '请输入团队名称',

  // 表格列
  'subgraph.table.name': '名称',
  'subgraph.table.description': '描述',
  'subgraph.table.tags': '标签',
  'subgraph.table.ownerCount': '所有者数量',
  'subgraph.table.resourceCount': '资源数量',
  'subgraph.table.createdAt': '创建时间',
  'subgraph.table.updatedAt': '更新时间',
  'subgraph.table.actions': '操作',
  'subgraph.table.type': '类型',
  'subgraph.table.status': '状态',
  'subgraph.table.addedAt': '添加时间',
  'subgraph.table.addedBy': '添加者',
  'subgraph.table.owner': '所有者',

  // 筛选器
  'subgraph.filter.title': '筛选',
  'subgraph.filter.tags': '按标签筛选',
  'subgraph.filter.owner': '按所有者筛选',
  'subgraph.filter.noTags': '无标签',
  'subgraph.filter.noOwners': '无所有者',

  // Tab标签
  'subgraph.tab.overview': '概览',
  'subgraph.tab.resources': '资源节点',
  'subgraph.tab.topology': '拓扑图',
  'subgraph.tab.permissions': '权限',

  // 概览信息
  'subgraph.overview.basicInfo': '基本信息',
  'subgraph.overview.statistics': '统计信息',
  'subgraph.overview.creator': '创建者',
  'subgraph.overview.version': '版本',

  // 拓扑图
  'subgraph.topology.layout': '布局',
  'subgraph.topology.layout.force': '力导向',
  'subgraph.topology.layout.hierarchical': '层次',
  'subgraph.topology.layout.circular': '环形',
  'subgraph.topology.export.png': '导出为PNG',
  'subgraph.topology.export.svg': '导出为SVG',
  'subgraph.topology.empty': '此子图中没有节点',
  'subgraph.topology.noRelationships': '节点之间没有定义关系',

  // 权限管理
  'subgraph.permission.owners': '所有者',
  'subgraph.permission.viewers': '查看者',
  'subgraph.permission.addOwner': '添加所有者',
  'subgraph.permission.addViewer': '添加查看者',
  'subgraph.permission.removeOwner': '移除所有者',
  'subgraph.permission.removeViewer': '移除查看者',
  'subgraph.permission.noOwners': '未分配所有者',
  'subgraph.permission.noViewers': '未分配查看者',
  'subgraph.permission.lastOwnerWarning': '无法移除最后一个所有者。请先添加另一个所有者',

  // 资源节点
  'subgraph.resource.search.placeholder': '搜索资源节点',
  'subgraph.resource.type.filter': '按类型筛选',
  'subgraph.resource.alreadyAdded': '已添加',
  'subgraph.resource.selected': '已选择 {count} 个',
  'subgraph.resource.maxSelection': '一次最多可以添加50个节点。请减少选择',
  'subgraph.resource.remove': '移除',

  // 空状态
  'subgraph.empty.list': '未找到子图',
  'subgraph.empty.list.description': '还没有创建任何子图',
  'subgraph.empty.search': '没有匹配的子图',
  'subgraph.empty.search.description': '尝试调整搜索条件或筛选器',
  'subgraph.empty.resources': '此子图中没有资源节点',
  'subgraph.empty.resources.description': '点击"添加节点"按钮开始添加资源',

  // 成功消息
  'subgraph.message.createSuccess': '子图创建成功',
  'subgraph.message.updateSuccess': '子图更新成功',
  'subgraph.message.deleteSuccess': '子图删除成功',
  'subgraph.message.addResourceSuccess': '成功添加 {count} 个节点',
  'subgraph.message.removeResourceSuccess': '节点移除成功',
  'subgraph.message.addOwnerSuccess': '所有者添加成功',
  'subgraph.message.removeOwnerSuccess': '所有者移除成功',

  // 错误消息
  'subgraph.error.loadFailed': '加载子图失败',
  'subgraph.error.createFailed': '创建子图失败',
  'subgraph.error.updateFailed': '更新子图失败',
  'subgraph.error.deleteFailed': '删除子图失败',
  'subgraph.error.addResourceFailed': '添加节点失败',
  'subgraph.error.removeResourceFailed': '移除节点失败',
  'subgraph.error.permissionDenied': '您没有权限执行此操作',
  'subgraph.error.notFound': '子图不存在或已被删除',
  'subgraph.error.conflict': '子图已被其他人修改。请刷新后重试',
  'subgraph.error.networkError': '网络错误。请检查您的连接',
  'subgraph.error.timeout': '请求超时。请检查您的网络连接并重试',

  // 确认对话框
  'subgraph.confirm.delete.title': '删除子图',
  'subgraph.confirm.delete.content': '此操作无法撤销。您确定要删除此子图吗？',
  'subgraph.confirm.delete.nonEmpty': '无法删除包含资源的子图。请先移除所有资源',
  'subgraph.confirm.delete.inputName': '请输入子图名称以确认删除',
  'subgraph.confirm.delete.resourceNote': '资源节点不会被删除，只会移除子图关联',
  'subgraph.confirm.removeResource.title': '移除节点',
  'subgraph.confirm.removeResource.content': '您确定要从此子图中移除此节点吗？节点本身不会被删除或修改',
  'subgraph.confirm.batchRemove.title': '批量移除节点',
  'subgraph.confirm.batchRemove.content': '您确定要移除 {count} 个节点吗？',
  'subgraph.confirm.unsavedChanges.title': '未保存的更改',
  'subgraph.confirm.unsavedChanges.content': '您有未保存的更改。确定要放弃它们吗？',
  'subgraph.confirm.removeOwner.title': '移除所有者',
  'subgraph.confirm.removeOwner.content': '您确定要移除此所有者吗？',

  // 分页
  'subgraph.pagination.total': '共 {total} 项',
  'subgraph.pagination.pageSize': '每页 {size} 项',

  // 加载状态
  'subgraph.loading': '加载中...',
  'subgraph.loading.list': '加载子图列表...',
  'subgraph.loading.detail': '加载子图详情...',
  'subgraph.loading.topology': '加载拓扑图...',
  'subgraph.loading.resources': '加载资源节点...',

  // 其他
  'subgraph.breadcrumb.home': '首页',
  'subgraph.breadcrumb.list': '子图管理',
  'subgraph.breadcrumb.detail': '子图详情',
  'subgraph.notificationLogged': '操作已记录到审计日志',
  'subgraph.ownerNotification': '受影响的用户将收到通知',
};
