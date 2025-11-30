/**
 * 资源管理常量定义
 * 需求: REQ-FR-003, REQ-FR-054
 */

/**
 * 默认分页配置
 */
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/**
 * 搜索防抖延迟（毫秒）
 * 需求: REQ-FR-016 - 搜索功能防抖300ms
 */
export const SEARCH_DEBOUNCE_DELAY = 300

/**
 * 敏感信息显示时间（毫秒）
 * 需求: REQ-FR-031 - 敏感信息显示3秒后自动隐藏
 */
export const SENSITIVE_DISPLAY_DURATION = 3000

/**
 * 消息显示时间（秒）
 * 需求: REQ-FR-010 - 成功消息显示3秒
 */
export const MESSAGE_DURATION = 3

/**
 * 资源类型图标映射
 */
export const RESOURCE_TYPE_ICONS: Record<string, string> = {
  SERVER: 'server',
  APPLICATION: 'appstore',
  DATABASE: 'database',
  API: 'api',
  MIDDLEWARE: 'cluster',
  REPORT: 'file-text',
}

/**
 * 资源类型显示名称
 */
export const RESOURCE_TYPE_NAMES: Record<string, string> = {
  SERVER: '服务器',
  APPLICATION: '应用',
  DATABASE: '数据库',
  API: '接口',
  MIDDLEWARE: '中间件',
  REPORT: '报表',
}

/**
 * 资源类型描述
 */
export const RESOURCE_TYPE_DESCRIPTIONS: Record<string, string> = {
  SERVER: '物理服务器或虚拟机',
  APPLICATION: '业务应用程序',
  DATABASE: '数据库实例',
  API: 'API接口服务',
  MIDDLEWARE: '中间件服务',
  REPORT: '业务报表',
}

/**
 * 资源详情Tab配置
 * 需求: REQ-FR-027 - Tab页签定义
 */
export const RESOURCE_DETAIL_TABS = [
  { key: 'overview', label: '概览' },
  { key: 'configuration', label: '配置' },
  { key: 'topology', label: '拓扑' },
  { key: 'agent', label: 'Agent' },
  { key: 'tasks', label: '任务' },
  { key: 'permissions', label: '权限' },
] as const

export type ResourceDetailTab = (typeof RESOURCE_DETAIL_TABS)[number]['key']

/**
 * 操作类型映射（用于审计日志）
 */
export const OPERATION_TYPE_NAMES: Record<string, string> = {
  CREATE: '创建',
  UPDATE: '更新',
  DELETE: '删除',
  STATUS_CHANGE: '状态变更',
}

/**
 * 请求超时时间（毫秒）
 */
export const REQUEST_TIMEOUT = 10000

/**
 * 最大标签数量
 * 需求: REQ-FR-005 - tags字段最多10个
 */
export const MAX_TAGS_COUNT = 10

/**
 * 最大批量操作数量
 * 需求: REQ-FR-024 - 批量选择
 */
export const MAX_BATCH_SIZE = 100

/**
 * 虚拟滚动阈值
 * 超过此数量启用虚拟滚动
 */
export const VIRTUAL_SCROLL_THRESHOLD = 1000

/**
 * 表格列宽配置
 */
export const TABLE_COLUMN_WIDTHS = {
  name: 200,
  type: 120,
  status: 100,
  tags: 200,
  createdAt: 180,
  updatedAt: 180,
  actions: 150,
}

/**
 * 左侧过滤面板宽度
 * 需求: REQ-FR-013 - 三列布局（过滤面板240px）
 */
export const FILTER_PANEL_WIDTH = 240

/**
 * 响应式断点
 * 需求: REQ-NFR-007, REQ-NFR-008, REQ-NFR-009
 */
export const BREAKPOINTS = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
}

/**
 * 历史记录最大显示数量
 * 需求: REQ-FR-034 - 最近10条操作记录
 */
export const MAX_HISTORY_ITEMS = 10

/**
 * API路径
 */
export const API_PATHS = {
  RESOURCES: '/resources',
  RESOURCE_TYPES: '/resource-types',
  RESOURCE_BY_ID: (id: number) => `/resources/${id}`,
  RESOURCE_STATUS: (id: number) => `/resources/${id}/status`,
  RESOURCE_AUDIT_LOGS: (id: number) => `/resources/${id}/audit-logs`,
}
