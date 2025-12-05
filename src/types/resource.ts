/**
 * 资源管理类型定义
 * 需求: REQ-NFR-027 - 完整的TypeScript类型定义
 */

// ==================== 状态定义 ====================

/**
 * 资源状态常量
 * 对应需求 REQ-FR-054
 */
export const ResourceStatus = {
  RUNNING: 'RUNNING',
  STOPPED: 'STOPPED',
  MAINTENANCE: 'MAINTENANCE',
  OFFLINE: 'OFFLINE',
} as const

export type ResourceStatus = (typeof ResourceStatus)[keyof typeof ResourceStatus]

/**
 * 资源状态显示映射
 */
export const ResourceStatusDisplay: Record<ResourceStatus, string> = {
  RUNNING: '运行中',
  STOPPED: '已停止',
  MAINTENANCE: '维护中',
  OFFLINE: '已下线',
}

/**
 * 资源状态颜色映射（Ant Design Badge）
 */
export const ResourceStatusColor: Record<ResourceStatus, string> = {
  RUNNING: 'success',
  STOPPED: 'default',
  MAINTENANCE: 'warning',
  OFFLINE: 'error',
}

// ==================== 资源类型定义 ====================

/**
 * 资源类型
 */
export interface ResourceType {
  id: number
  code: string
  name: string
  description: string
  icon: string
  systemPreset: boolean
}

/**
 * 预置资源类型编码
 */
export const ResourceTypeCodes = {
  SERVER: 'SERVER',
  APPLICATION: 'APPLICATION',
  DATABASE: 'DATABASE',
  API: 'API',
  MIDDLEWARE: 'MIDDLEWARE',
  REPORT: 'REPORT',
} as const

export type ResourceTypeCode = (typeof ResourceTypeCodes)[keyof typeof ResourceTypeCodes]

// ==================== 资源DTO定义 ====================

/**
 * 资源DTO（与后端完全一致）
 */
export interface ResourceDTO {
  id: number
  name: string
  description: string | null
  resourceTypeId: number
  resourceTypeName: string
  resourceTypeCode: string
  status: ResourceStatus
  statusDisplay: string
  attributes: string // JSON字符串
  version: number
  createdAt: string // ISO 8601格式
  updatedAt: string // ISO 8601格式
  createdBy: number
}

/**
 * 资源审计日志DTO
 */
export interface ResourceAuditLogDTO {
  id: number
  resourceId: number
  operation: string
  operationDisplay: string
  oldValue: string | null
  newValue: string | null
  operatorId: number
  operatorName: string
  operatedAt: string
}

// ==================== 请求类型定义 ====================

/**
 * 创建资源请求
 */
export interface CreateResourceRequest {
  name: string
  description?: string
  resourceTypeId: number
  attributes?: string // JSON字符串
}

/**
 * 更新资源请求
 */
export interface UpdateResourceRequest {
  name?: string
  description?: string
  attributes?: string // JSON字符串
  version: number // 乐观锁
}

/**
 * 更新资源状态请求
 */
export interface UpdateResourceStatusRequest {
  status: ResourceStatus
  version: number // 乐观锁
}

/**
 * 删除资源请求
 */
export interface DeleteResourceRequest {
  confirmName: string
}

/**
 * 资源列表查询参数
 */
export interface ResourceListParams {
  resourceTypeId?: number
  resourceTypeIds?: number[]
  status?: ResourceStatus
  statuses?: ResourceStatus[]
  keyword?: string
  page?: number
  size?: number
}

// ==================== 响应类型定义 ====================

/**
 * 分页结果
 */
export interface PageResult<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

/**
 * 资源API响应（专用于资源模块）
 */
export interface ResourceApiResponse<T> {
  code: number
  message: string
  data: T
  success: boolean
}

// ==================== 前端扩展类型 ====================

/**
 * 资源表单数据（用于创建/编辑）
 */
export interface ResourceFormData {
  name: string
  description: string
  resourceTypeId: number
  attributes: Record<string, unknown> // 解析后的JSON对象
}

/**
 * 资源扩展属性字段定义
 */
export interface ResourceAttributeField {
  key: string
  label: string
  type: 'text' | 'number' | 'password' | 'textarea' | 'select'
  required: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string | number }>
  sensitive?: boolean // 是否为敏感字段
}

/**
 * 资源类型属性配置
 * 对应需求 REQ-FR-006, REQ-FR-007
 */
export const ResourceTypeAttributes: Record<string, ResourceAttributeField[]> = {
  SERVER: [
    { key: 'ip', label: 'IP地址', type: 'text', required: true, placeholder: '192.168.1.100' },
    { key: 'port', label: '端口', type: 'number', required: false, placeholder: '22' },
    { key: 'os', label: '操作系统', type: 'text', required: false, placeholder: 'Ubuntu 22.04' },
    { key: 'cpu', label: 'CPU核数', type: 'number', required: false },
    { key: 'memory', label: '内存(GB)', type: 'number', required: false },
  ],
  APPLICATION: [
    {
      key: 'appType',
      label: '应用类型',
      type: 'select',
      required: true,
      options: [
        { label: '微服务', value: 'microservice' },
        { label: '单体应用', value: 'monolithic' },
      ],
    },
    { key: 'port', label: '端口', type: 'number', required: true, placeholder: '8080' },
    { key: 'deployPath', label: '部署路径', type: 'text', required: false },
    { key: 'startCommand', label: '启动命令', type: 'text', required: false },
  ],
  DATABASE: [
    {
      key: 'dbType',
      label: '数据库类型',
      type: 'select',
      required: true,
      options: [
        { label: 'MySQL', value: 'mysql' },
        { label: 'PostgreSQL', value: 'postgresql' },
        { label: 'Redis', value: 'redis' },
      ],
    },
    { key: 'host', label: '主机地址', type: 'text', required: true },
    { key: 'port', label: '端口', type: 'number', required: true },
    { key: 'username', label: '用户名', type: 'text', required: false },
    { key: 'password', label: '密码', type: 'password', required: false, sensitive: true },
  ],
  API: [
    {
      key: 'protocol',
      label: '协议类型',
      type: 'select',
      required: true,
      options: [
        { label: 'REST', value: 'rest' },
        { label: 'gRPC', value: 'grpc' },
      ],
    },
    { key: 'endpoint', label: '端点URL', type: 'text', required: true },
    {
      key: 'authType',
      label: '认证方式',
      type: 'select',
      required: false,
      options: [
        { label: 'None', value: 'none' },
        { label: 'Basic', value: 'basic' },
        { label: 'Bearer', value: 'bearer' },
      ],
    },
    { key: 'apiKey', label: 'API Key', type: 'password', required: false, sensitive: true },
  ],
  MIDDLEWARE: [
    {
      key: 'middlewareType',
      label: '中间件类型',
      type: 'select',
      required: true,
      options: [
        { label: '消息队列', value: 'mq' },
        { label: '配置中心', value: 'config' },
      ],
    },
    { key: 'host', label: '主机地址', type: 'text', required: true },
    { key: 'port', label: '端口', type: 'number', required: true },
    { key: 'adminUrl', label: '管理地址', type: 'text', required: false },
  ],
  REPORT: [
    {
      key: 'reportType',
      label: '报表类型',
      type: 'select',
      required: true,
      options: [
        { label: '业务报表', value: 'business' },
        { label: '监控报表', value: 'monitoring' },
      ],
    },
    { key: 'dataSource', label: '数据源', type: 'text', required: true },
    { key: 'refreshInterval', label: '刷新频率(分钟)', type: 'number', required: false },
  ],
}

// ==================== 状态管理类型 ====================

/**
 * 资源列表状态
 */
export interface ResourceListState {
  resources: ResourceDTO[]
  loading: boolean
  error: Error | null
  filters: ResourceListParams
  pagination: {
    current: number
    pageSize: number
    total: number
  }
  selectedRowKeys: number[]
}

/**
 * 资源详情状态
 */
export interface ResourceDetailState {
  resource: ResourceDTO | null
  loading: boolean
  error: Error | null
  editMode: boolean
  activeTab: string
  auditLogs: ResourceAuditLogDTO[]
}

// ==================== Hooks返回类型 ====================

/**
 * useResourceList Hook 返回类型
 */
export interface UseResourceListReturn {
  resources: ResourceDTO[]
  loading: boolean
  error: Error | null
  pagination: {
    current: number
    pageSize: number
    total: number
  }
  filters: ResourceListParams
  refresh: () => Promise<void>
  setFilters: (filters: Partial<ResourceListParams>) => void
  setPagination: (pagination: { current?: number; pageSize?: number }) => void
}

/**
 * useResourceDetail Hook 返回类型
 */
export interface UseResourceDetailReturn {
  resource: ResourceDTO | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  update: (data: UpdateResourceRequest) => Promise<void>
  updateStatus: (status: ResourceStatus) => Promise<void>
  deleteResource: (confirmName: string) => Promise<void>
}
