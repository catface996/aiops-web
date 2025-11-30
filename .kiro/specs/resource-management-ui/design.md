# 设计文档

**功能名称**: F03 - 创建和管理IT资源（前端）  
**文档版本**: v1.0  
**创建日期**: 2024-11-30  
**设计师**: AI Assistant  
**状态**: 已完成 ✅

---

## 1. 概述

### 1.1 设计目标

本设计文档定义了F03功能前端部分的技术架构、组件设计、数据流和测试策略。设计遵循以下原则：

- **简洁性**: 使用React Context + Hooks，避免过度设计
- **可维护性**: 组件化设计，职责清晰
- **可测试性**: 每个组件和函数都可独立测试
- **性能优化**: 虚拟滚动、代码分割、懒加载
- **类型安全**: 完整的TypeScript类型定义

### 1.2 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI框架 |
| TypeScript | 5.x | 类型系统 |
| Ant Design | 5.x | UI组件库 |
| React Router | 6.x | 路由管理 |
| Axios | Latest | HTTP客户端 |
| Vite | 5.x | 构建工具 |
| Vitest | Latest | 测试框架 |
| React Testing Library | Latest | 组件测试 |

### 1.3 后端API依赖

基于Swagger文档（http://localhost:8080/swagger-ui/index.html），后端提供以下API：

| API端点 | 方法 | 说明 |
|---------|------|------|
| /api/v1/resources | GET | 查询资源列表（支持分页、过滤、搜索） |
| /api/v1/resources | POST | 创建资源 |
| /api/v1/resources/{id} | GET | 查询资源详情 |
| /api/v1/resources/{id} | PUT | 更新资源 |
| /api/v1/resources/{id} | DELETE | 删除资源 |
| /api/v1/resources/{id}/status | PATCH | 更新资源状态 |
| /api/v1/resources/{id}/audit-logs | GET | 查询审计日志 |
| /api/v1/resource-types | GET | 查询资源类型列表 |

---

## 2. 架构设计

### 2.1 整体架构

采用分层架构，职责清晰：

```
┌─────────────────────────────────────────────────────────┐
│                    View Layer (视图层)                    │
│  Pages + Components (页面和组件)                          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│              State Management Layer (状态管理层)          │
│  React Context + Custom Hooks                           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                Service Layer (服务层)                     │
│  API Services (Axios封装)                                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                 Utility Layer (工具层)                    │
│  Utils + Helpers + Constants                            │
└─────────────────────────────────────────────────────────┘
```

### 2.2 目录结构

```
src/
├── pages/                          # 页面组件
│   └── Resources/
│       ├── index.tsx               # 资源列表页
│       ├── Detail.tsx              # 资源详情页
│       └── components/             # 页面级组件
│           ├── ResourceTypeSelector.tsx
│           ├── ResourceForm.tsx
│           ├── ResourceTable.tsx
│           ├── ResourceFilters.tsx
│           ├── StatusBadge.tsx
│           ├── SensitiveField.tsx
│           └── DeleteConfirmModal.tsx
│
├── components/                     # 共享组件
│   ├── ResourceTypeIcon/
│   │   ├── index.tsx
│   │   └── index.test.tsx
│   ├── PermissionGuard/
│   │   ├── index.tsx
│   │   └── index.test.tsx
│   └── ErrorBoundary/
│       ├── index.tsx
│       └── index.test.tsx
│
├── services/                       # API服务
│   ├── resource.ts
│   ├── resource.test.ts
│   └── types.ts
│
├── hooks/                          # 自定义Hooks
│   ├── useResourceList.ts
│   ├── useResourceDetail.ts
│   ├── useResourceForm.ts
│   └── usePermission.ts
│
├── types/                          # 类型定义
│   ├── resource.ts
│   ├── api.ts
│   └── common.ts
│
├── utils/                          # 工具函数
│   ├── request.ts                  # Axios实例
│   ├── format.ts                   # 格式化函数
│   ├── validation.ts               # 验证函数
│   └── constants.ts                # 常量定义
│
└── contexts/                       # React Context
    └── AuthContext/                # 认证上下文（已存在）
        └── index.tsx
```

---

## 3. 数据模型

### 3.1 TypeScript类型定义

基于后端Swagger定义的数据模型：

```typescript
// src/types/resource.ts

/**
 * 资源状态枚举
 */
export enum ResourceStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE'
}

/**
 * 资源状态显示映射
 */
export const ResourceStatusDisplay: Record<ResourceStatus, string> = {
  [ResourceStatus.RUNNING]: '运行中',
  [ResourceStatus.STOPPED]: '已停止',
  [ResourceStatus.MAINTENANCE]: '维护中',
  [ResourceStatus.OFFLINE]: '已下线'
};

/**
 * 资源状态颜色映射（Ant Design Badge）
 */
export const ResourceStatusColor: Record<ResourceStatus, string> = {
  [ResourceStatus.RUNNING]: 'success',
  [ResourceStatus.STOPPED]: 'default',
  [ResourceStatus.MAINTENANCE]: 'warning',
  [ResourceStatus.OFFLINE]: 'error'
};

/**
 * 资源类型
 */
export interface ResourceType {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  systemPreset: boolean;
}

/**
 * 资源DTO（与后端完全一致）
 */
export interface ResourceDTO {
  id: number;
  name: string;
  description: string | null;
  resourceTypeId: number;
  resourceTypeName: string;
  resourceTypeCode: string;
  status: ResourceStatus;
  statusDisplay: string;
  attributes: string; // JSON字符串
  version: number;
  createdAt: string; // ISO 8601格式
  updatedAt: string; // ISO 8601格式
  createdBy: number;
}

/**
 * 创建资源请求
 */
export interface CreateResourceRequest {
  name: string;
  description?: string;
  resourceTypeId: number;
  attributes?: string; // JSON字符串
}

/**
 * 更新资源请求
 */
export interface UpdateResourceRequest {
  name?: string;
  description?: string;
  attributes?: string; // JSON字符串
  version: number; // 乐观锁
}

/**
 * 更新资源状态请求
 */
export interface UpdateResourceStatusRequest {
  status: ResourceStatus;
  version: number; // 乐观锁
}

/**
 * 删除资源请求
 */
export interface DeleteResourceRequest {
  confirmName: string;
}

/**
 * 资源审计日志
 */
export interface ResourceAuditLogDTO {
  id: number;
  resourceId: number;
  operation: string;
  operationDisplay: string;
  oldValue: string | null;
  newValue: string | null;
  operatorId: number;
  operatorName: string;
  operatedAt: string;
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * API响应
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}
```

### 3.2 前端扩展类型

```typescript
// src/types/resource.ts (continued)

/**
 * 资源列表查询参数
 */
export interface ResourceListParams {
  resourceTypeId?: number;
  status?: ResourceStatus;
  keyword?: string;
  page?: number;
  size?: number;
}

/**
 * 资源表单数据（用于创建/编辑）
 */
export interface ResourceFormData {
  name: string;
  description: string;
  resourceTypeId: number;
  attributes: Record<string, any>; // 解析后的JSON对象
}

/**
 * 资源扩展属性定义（根据类型动态）
 */
export interface ResourceAttributeField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  sensitive?: boolean; // 是否为敏感字段
}

/**
 * 资源类型属性配置
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
    { key: 'appType', label: '应用类型', type: 'select', required: true, options: [
      { label: '微服务', value: 'microservice' },
      { label: '单体应用', value: 'monolithic' }
    ]},
    { key: 'port', label: '端口', type: 'number', required: true, placeholder: '8080' },
    { key: 'deployPath', label: '部署路径', type: 'text', required: false },
    { key: 'startCommand', label: '启动命令', type: 'text', required: false },
  ],
  DATABASE: [
    { key: 'dbType', label: '数据库类型', type: 'select', required: true, options: [
      { label: 'MySQL', value: 'mysql' },
      { label: 'PostgreSQL', value: 'postgresql' },
      { label: 'Redis', value: 'redis' }
    ]},
    { key: 'host', label: '主机地址', type: 'text', required: true },
    { key: 'port', label: '端口', type: 'number', required: true },
    { key: 'username', label: '用户名', type: 'text', required: false },
    { key: 'password', label: '密码', type: 'password', required: false, sensitive: true },
  ],
  API: [
    { key: 'protocol', label: '协议类型', type: 'select', required: true, options: [
      { label: 'REST', value: 'rest' },
      { label: 'gRPC', value: 'grpc' }
    ]},
    { key: 'endpoint', label: '端点URL', type: 'text', required: true },
    { key: 'authType', label: '认证方式', type: 'select', required: false, options: [
      { label: 'None', value: 'none' },
      { label: 'Basic', value: 'basic' },
      { label: 'Bearer', value: 'bearer' }
    ]},
    { key: 'apiKey', label: 'API Key', type: 'password', required: false, sensitive: true },
  ],
  MIDDLEWARE: [
    { key: 'middlewareType', label: '中间件类型', type: 'select', required: true, options: [
      { label: '消息队列', value: 'mq' },
      { label: '配置中心', value: 'config' }
    ]},
    { key: 'host', label: '主机地址', type: 'text', required: true },
    { key: 'port', label: '端口', type: 'number', required: true },
    { key: 'adminUrl', label: '管理地址', type: 'text', required: false },
  ],
  REPORT: [
    { key: 'reportType', label: '报表类型', type: 'select', required: true, options: [
      { label: '业务报表', value: 'business' },
      { label: '监控报表', value: 'monitoring' }
    ]},
    { key: 'dataSource', label: '数据源', type: 'text', required: true },
    { key: 'refreshInterval', label: '刷新频率(分钟)', type: 'number', required: false },
  ],
};
```

---

## 4. 组件设计

### 4.1 页面组件

#### 4.1.1 资源列表页 (ResourceListPage)

**职责**: 展示资源列表，提供搜索、过滤、排序、分页功能

**Props**: 无（路由页面）

**State**:
```typescript
interface ResourceListState {
  resources: ResourceDTO[];
  loading: boolean;
  error: Error | null;
  filters: ResourceListParams;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  selectedRowKeys: number[];
}
```

**主要方法**:
- `handleSearch(keyword: string)`: 处理搜索
- `handleFilterChange(filters: Partial<ResourceListParams>)`: 处理过滤
- `handleTableChange(pagination, filters, sorter)`: 处理表格变化
- `handleCreate()`: 打开创建对话框
- `handleBatchDelete()`: 批量删除

**子组件**:
- ResourceFilters: 过滤器面板
- ResourceTable: 资源表格
- ResourceTypeSelector: 类型选择器（Modal）
- ResourceForm: 资源表单（Modal）


#### 4.1.2 资源详情页 (ResourceDetailPage)

**职责**: 展示资源详细信息，提供编辑、删除、状态切换功能

**Props**: 
```typescript
interface ResourceDetailPageProps {
  // 从路由参数获取
  resourceId: string;
}
```

**State**:
```typescript
interface ResourceDetailState {
  resource: ResourceDTO | null;
  loading: boolean;
  error: Error | null;
  editMode: boolean;
  activeTab: string;
  auditLogs: ResourceAuditLogDTO[];
}
```

**主要方法**:
- `loadResource()`: 加载资源详情
- `handleEdit()`: 进入编辑模式
- `handleSave(data: ResourceFormData)`: 保存编辑
- `handleCancel()`: 取消编辑
- `handleDelete()`: 删除资源
- `handleStatusChange(status: ResourceStatus)`: 更新状态
- `handleTabChange(key: string)`: 切换Tab

**子组件**:
- StatusBadge: 状态徽章
- SensitiveField: 敏感字段显示
- DeleteConfirmModal: 删除确认对话框

### 4.2 共享组件

#### 4.2.1 ResourceTypeIcon

**职责**: 根据资源类型显示对应图标

**Props**:
```typescript
interface ResourceTypeIconProps {
  type: string; // 资源类型编码
  size?: number;
}
```

**实现**:
```typescript
import { 
  ServerOutlined, 
  AppstoreOutlined, 
  DatabaseOutlined,
  ApiOutlined,
  ClusterOutlined,
  FileTextOutlined 
} from '@ant-design/icons';

const iconMap: Record<string, React.ReactNode> = {
  SERVER: <ServerOutlined />,
  APPLICATION: <AppstoreOutlined />,
  DATABASE: <DatabaseOutlined />,
  API: <ApiOutlined />,
  MIDDLEWARE: <ClusterOutlined />,
  REPORT: <FileTextOutlined />,
};

export const ResourceTypeIcon: React.FC<ResourceTypeIconProps> = ({ type, size = 16 }) => {
  return <span style={{ fontSize: size }}>{iconMap[type] || <ServerOutlined />}</span>;
};
```

#### 4.2.2 StatusBadge

**职责**: 显示资源状态徽章

**Props**:
```typescript
interface StatusBadgeProps {
  status: ResourceStatus;
  onClick?: () => void;
  disabled?: boolean;
}
```

**实现**:
```typescript
import { Badge } from 'antd';
import { ResourceStatus, ResourceStatusDisplay, ResourceStatusColor } from '@/types/resource';

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, onClick, disabled }) => {
  return (
    <Badge 
      status={ResourceStatusColor[status] as any}
      text={ResourceStatusDisplay[status]}
      style={{ cursor: onClick && !disabled ? 'pointer' : 'default' }}
      onClick={!disabled ? onClick : undefined}
    />
  );
};
```

#### 4.2.3 SensitiveField

**职责**: 显示敏感字段，支持显示/隐藏切换

**Props**:
```typescript
interface SensitiveFieldProps {
  value: string;
  canView: boolean; // 是否有查看权限
  onView?: () => Promise<string>; // 获取明文的回调
}
```

**State**:
```typescript
interface SensitiveFieldState {
  visible: boolean;
  plaintext: string | null;
  loading: boolean;
}
```

**实现逻辑**:
1. 默认显示"***"
2. 如果canView=true，显示"显示"按钮
3. 点击"显示"后调用onView获取明文
4. 显示明文3秒后自动隐藏

#### 4.2.4 PermissionGuard

**职责**: 权限守卫HOC，根据权限显示/隐藏组件

**Props**:
```typescript
interface PermissionGuardProps {
  children: React.ReactNode;
  resource: ResourceDTO;
  requiredPermission: 'owner' | 'viewer';
  fallback?: React.ReactNode;
}
```

**实现**:
```typescript
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  requiredPermission,
  fallback = null
}) => {
  const { user } = useAuth();
  
  const hasPermission = () => {
    if (requiredPermission === 'owner') {
      return resource.createdBy === user.accountId || user.role === 'ROLE_ADMIN';
    }
    return true; // viewer权限所有人都有
  };
  
  return hasPermission() ? <>{children}</> : <>{fallback}</>;
};
```

---

## 5. 数据流设计

### 5.1 状态管理策略

采用React Context + Custom Hooks模式，避免Redux的复杂性：

```
┌─────────────────────────────────────────────────────────┐
│                    AuthContext                           │
│  (已存在，提供用户信息和权限)                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Custom Hooks (业务逻辑封装)                   │
│  - useResourceList: 列表数据和操作                        │
│  - useResourceDetail: 详情数据和操作                      │
│  - useResourceForm: 表单状态和验证                        │
│  - usePermission: 权限检查                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                 Service Layer                            │
│  resourceService.ts (API调用)                            │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Custom Hooks设计

#### 5.2.1 useResourceList

**职责**: 管理资源列表的数据和操作

```typescript
interface UseResourceListReturn {
  resources: ResourceDTO[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationConfig;
  filters: ResourceListParams;
  refresh: () => Promise<void>;
  setFilters: (filters: Partial<ResourceListParams>) => void;
  setPagination: (pagination: Partial<PaginationConfig>) => void;
}

export const useResourceList = (): UseResourceListReturn => {
  const [resources, setResources] = useState<ResourceDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ResourceListParams>({
    page: 1,
    size: 20
  });
  const [pagination, setPagination] = useState<PaginationConfig>({
    current: 1,
    pageSize: 20,
    total: 0
  });

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await resourceService.list(filters);
      setResources(response.data.content);
      setPagination({
        current: response.data.page,
        pageSize: response.data.size,
        total: response.data.totalElements
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  return {
    resources,
    loading,
    error,
    pagination,
    filters,
    refresh: loadResources,
    setFilters: (newFilters) => setFilters({ ...filters, ...newFilters }),
    setPagination: (newPagination) => {
      setPagination({ ...pagination, ...newPagination });
      setFilters({ ...filters, page: newPagination.current, size: newPagination.pageSize });
    }
  };
};
```

#### 5.2.2 useResourceDetail

**职责**: 管理资源详情的数据和操作

```typescript
interface UseResourceDetailReturn {
  resource: ResourceDTO | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  update: (data: UpdateResourceRequest) => Promise<void>;
  updateStatus: (status: ResourceStatus) => Promise<void>;
  delete: (confirmName: string) => Promise<void>;
}

export const useResourceDetail = (resourceId: number): UseResourceDetailReturn => {
  const [resource, setResource] = useState<ResourceDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadResource = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await resourceService.getById(resourceId);
      setResource(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    loadResource();
  }, [loadResource]);

  const update = async (data: UpdateResourceRequest) => {
    await resourceService.update(resourceId, data);
    await loadResource();
  };

  const updateStatus = async (status: ResourceStatus) => {
    if (!resource) return;
    await resourceService.updateStatus(resourceId, {
      status,
      version: resource.version
    });
    await loadResource();
  };

  const deleteResource = async (confirmName: string) => {
    await resourceService.delete(resourceId, { confirmName });
  };

  return {
    resource,
    loading,
    error,
    refresh: loadResource,
    update,
    updateStatus,
    delete: deleteResource
  };
};
```

### 5.3 Service Layer设计

```typescript
// src/services/resource.ts

import { request } from '@/utils/request';
import type {
  ResourceDTO,
  ResourceType,
  CreateResourceRequest,
  UpdateResourceRequest,
  UpdateResourceStatusRequest,
  DeleteResourceRequest,
  ResourceListParams,
  PageResult,
  ApiResponse
} from '@/types/resource';

class ResourceService {
  /**
   * 查询资源列表
   */
  async list(params: ResourceListParams): Promise<ApiResponse<PageResult<ResourceDTO>>> {
    return request.get('/api/v1/resources', { params });
  }

  /**
   * 查询资源详情
   */
  async getById(id: number): Promise<ApiResponse<ResourceDTO>> {
    return request.get(`/api/v1/resources/${id}`);
  }

  /**
   * 创建资源
   */
  async create(data: CreateResourceRequest): Promise<ApiResponse<ResourceDTO>> {
    return request.post('/api/v1/resources', data);
  }

  /**
   * 更新资源
   */
  async update(id: number, data: UpdateResourceRequest): Promise<ApiResponse<ResourceDTO>> {
    return request.put(`/api/v1/resources/${id}`, data);
  }

  /**
   * 更新资源状态
   */
  async updateStatus(id: number, data: UpdateResourceStatusRequest): Promise<ApiResponse<ResourceDTO>> {
    return request.patch(`/api/v1/resources/${id}/status`, data);
  }

  /**
   * 删除资源
   */
  async delete(id: number, data: DeleteResourceRequest): Promise<ApiResponse<void>> {
    return request.delete(`/api/v1/resources/${id}`, { data });
  }

  /**
   * 查询资源类型列表
   */
  async getResourceTypes(): Promise<ApiResponse<ResourceType[]>> {
    return request.get('/api/v1/resource-types');
  }

  /**
   * 查询审计日志
   */
  async getAuditLogs(id: number, page: number = 1, size: number = 10) {
    return request.get(`/api/v1/resources/${id}/audit-logs`, {
      params: { page, size }
    });
  }
}

export const resourceService = new ResourceService();
```

---

## 6. 错误处理

### 6.1 错误类型

```typescript
// src/types/error.ts

export enum ErrorCode {
  // 认证错误
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  
  // 业务错误
  NOT_FOUND = 404,
  CONFLICT = 409,
  BAD_REQUEST = 400,
  
  // 系统错误
  INTERNAL_ERROR = 500,
  NETWORK_ERROR = 0
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
}
```

### 6.2 错误处理策略

```typescript
// src/utils/request.ts

import axios, { AxiosError } from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiResponse<any>>) => {
    const { response } = error;
    
    if (!response) {
      // 网络错误
      message.error('网络连接失败，请检查网络');
      return Promise.reject({ code: 0, message: '网络错误' });
    }
    
    const { status, data } = response;
    
    switch (status) {
      case 401:
        message.error('未登录或登录已过期');
        // 跳转到登录页
        window.location.href = '/login';
        break;
      case 403:
        message.error(data?.message || '无权限执行此操作');
        break;
      case 404:
        message.error(data?.message || '资源不存在');
        break;
      case 409:
        // 版本冲突，由业务代码处理
        break;
      case 400:
        message.error(data?.message || '请求参数错误');
        break;
      default:
        message.error(data?.message || '服务器错误');
    }
    
    return Promise.reject(data || { code: status, message: '请求失败' });
  }
);

export { request };
```

---

## 7. 性能优化

### 7.1 代码分割

```typescript
// src/router/index.tsx

import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const ResourceListPage = lazy(() => import('@/pages/Resources'));
const ResourceDetailPage = lazy(() => import('@/pages/Resources/Detail'));

const routes = [
  {
    path: '/resources',
    element: (
      <Suspense fallback={<Spin size="large" />}>
        <ResourceListPage />
      </Suspense>
    )
  },
  {
    path: '/resources/:id',
    element: (
      <Suspense fallback={<Spin size="large" />}>
        <ResourceDetailPage />
      </Suspense>
    )
  }
];
```

### 7.2 虚拟滚动

对于大数据量列表，使用react-window实现虚拟滚动：

```typescript
import { FixedSizeList } from 'react-window';

// 当资源数量>1000时启用虚拟滚动
const VirtualResourceTable = ({ resources }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ResourceRow resource={resources[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={resources.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 7.3 React.memo优化

```typescript
// 对纯展示组件使用React.memo
export const StatusBadge = React.memo<StatusBadgeProps>(({ status, onClick, disabled }) => {
  return (
    <Badge 
      status={ResourceStatusColor[status] as any}
      text={ResourceStatusDisplay[status]}
      style={{ cursor: onClick && !disabled ? 'pointer' : 'default' }}
      onClick={!disabled ? onClick : undefined}
    />
  );
});

// 对列表项使用React.memo
export const ResourceTableRow = React.memo<ResourceTableRowProps>(({ resource, onEdit, onDelete }) => {
  // ...
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.resource.id === nextProps.resource.id &&
         prevProps.resource.version === nextProps.resource.version;
});
```

### 7.4 防抖和节流

```typescript
import { debounce } from 'lodash-es';

// 搜索防抖
const handleSearch = debounce((keyword: string) => {
  setFilters({ ...filters, keyword });
}, 300);

// 滚动节流
const handleScroll = throttle(() => {
  // 处理滚动
}, 100);
```

---

## 8. 测试策略

### 8.1 单元测试

**测试目标**: 测试纯函数、工具函数、Hooks

**测试框架**: Vitest

**示例**:
```typescript
// src/utils/format.test.ts

import { describe, it, expect } from 'vitest';
import { formatDateTime, formatResourceStatus } from './format';

describe('formatDateTime', () => {
  it('should format ISO date string to YYYY-MM-DD HH:mm', () => {
    const input = '2024-11-30T10:30:00Z';
    const output = formatDateTime(input);
    expect(output).toBe('2024-11-30 10:30');
  });
  
  it('should handle invalid date', () => {
    const input = 'invalid';
    const output = formatDateTime(input);
    expect(output).toBe('-');
  });
});

describe('formatResourceStatus', () => {
  it('should return correct display text for RUNNING', () => {
    expect(formatResourceStatus('RUNNING')).toBe('运行中');
  });
  
  it('should return correct display text for STOPPED', () => {
    expect(formatResourceStatus('STOPPED')).toBe('已停止');
  });
});
```

### 8.2 组件测试

**测试目标**: 测试组件渲染、用户交互

**测试框架**: React Testing Library + Vitest

**示例**:
```typescript
// src/components/StatusBadge/index.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusBadge } from './index';
import { ResourceStatus } from '@/types/resource';

describe('StatusBadge', () => {
  it('should render status badge with correct text', () => {
    render(<StatusBadge status={ResourceStatus.RUNNING} />);
    expect(screen.getByText('运行中')).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<StatusBadge status={ResourceStatus.RUNNING} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('运行中'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<StatusBadge status={ResourceStatus.RUNNING} onClick={handleClick} disabled />);
    
    fireEvent.click(screen.getByText('运行中'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 8.3 集成测试

**测试目标**: 测试完整的用户流程

**示例**:
```typescript
// src/pages/Resources/index.integration.test.tsx

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResourceListPage from './index';
import { resourceService } from '@/services/resource';

vi.mock('@/services/resource');

describe('ResourceListPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should load and display resources', async () => {
    const mockResources = [
      { id: 1, name: 'Resource 1', status: 'RUNNING', /* ... */ },
      { id: 2, name: 'Resource 2', status: 'STOPPED', /* ... */ }
    ];
    
    vi.mocked(resourceService.list).mockResolvedValue({
      code: 200,
      message: 'success',
      data: {
        content: mockResources,
        page: 1,
        size: 20,
        totalElements: 2,
        totalPages: 1,
        first: true,
        last: true
      },
      success: true
    });
    
    render(
      <BrowserRouter>
        <ResourceListPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Resource 1')).toBeInTheDocument();
      expect(screen.getByText('Resource 2')).toBeInTheDocument();
    });
  });
  
  it('should filter resources by type', async () => {
    // 测试过滤功能
  });
  
  it('should search resources by keyword', async () => {
    // 测试搜索功能
  });
});
```

### 8.4 测试覆盖率目标

| 类型 | 目标覆盖率 |
|------|-----------|
| 工具函数 | ≥90% |
| Service层 | ≥80% |
| Custom Hooks | ≥80% |
| 组件 | ≥70% |
| 整体 | ≥75% |

---

## 9. 正确性属性

基于需求文档中的验收标准，定义以下正确性属性：

### 9.1 属性定义

**Property 1: 创建资源后列表包含新资源**
*For any* valid resource data, after successfully creating a resource, the resource list SHALL contain the newly created resource
**Validates: Requirements REQ-FR-010**

**Property 2: 搜索结果匹配关键词**
*For any* search keyword, all returned resources SHALL have names containing the keyword (case-insensitive)
**Validates: Requirements REQ-FR-016, REQ-FR-017**

**Property 3: 过滤结果匹配条件**
*For any* filter criteria (type, status, tags), all returned resources SHALL match ALL selected filter conditions
**Validates: Requirements REQ-FR-018, REQ-FR-019, REQ-FR-020**

**Property 4: 编辑冲突检测**
*For any* resource update with outdated version, the system SHALL reject the update and display conflict message
**Validates: Requirements REQ-FR-042**

**Property 5: 删除需要名称确认**
*For any* delete operation, the system SHALL only proceed when the input name exactly matches the resource name
**Validates: Requirements REQ-FR-049, REQ-FR-050**

**Property 6: 权限控制正确性**
*For any* resource, only Owner or Admin SHALL see edit and delete buttons
**Validates: Requirements REQ-FR-035, REQ-FR-036, REQ-FR-045, REQ-FR-046**

**Property 7: 敏感信息权限控制**
*For any* sensitive field, only Owner SHALL see the "Show" button and be able to view plaintext
**Validates: Requirements REQ-FR-031, REQ-FR-032**

**Property 8: 状态切换权限控制**
*For any* resource, only Owner SHALL be able to change the status
**Validates: Requirements REQ-FR-059**

**Property 9: 分页一致性**
*For any* page navigation, the total number of resources across all pages SHALL equal totalElements
**Validates: Requirements REQ-FR-015**

**Property 10: 表单验证正确性**
*For any* invalid form input, the system SHALL display specific error messages and prevent submission
**Validates: Requirements REQ-FR-008, REQ-FR-014**

### 9.2 属性测试实现

使用fast-check进行属性测试（如果需要）：

```typescript
// src/utils/validation.property.test.ts

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateResourceName } from './validation';

describe('Property Tests: Resource Name Validation', () => {
  it('Property: Valid names (2-100 chars) should pass validation', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2, maxLength: 100 }),
        (name) => {
          const result = validateResourceName(name);
          return result.valid === true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property: Invalid names (<2 or >100 chars) should fail validation', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ maxLength: 1 }),
          fc.string({ minLength: 101 })
        ),
        (name) => {
          const result = validateResourceName(name);
          return result.valid === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

---

## 10. 安全考虑

### 10.1 XSS防护

- 使用React的JSX自动转义
- 避免使用dangerouslySetInnerHTML
- 对用户输入进行验证和清理

### 10.2 CSRF防护

- 所有请求包含JWT Token
- Token存储在localStorage（考虑使用httpOnly cookie）

### 10.3 敏感信息保护

- 敏感字段默认隐藏
- 不在localStorage中存储敏感信息
- 不在控制台日志中输出敏感信息
- 不在URL参数中传递敏感信息

### 10.4 权限验证

- 前端权限检查（UI层面）
- 后端权限验证（安全层面）
- 双重验证确保安全

---

## 11. 部署考虑

### 11.1 环境变量

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_TITLE=AIOps Service

# .env.production
VITE_API_BASE_URL=https://api.aiops.example.com/api/v1
VITE_APP_TITLE=AIOps Service
```

### 11.2 构建优化

```typescript
// vite.config.ts

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd': ['antd', '@ant-design/icons'],
          'utils': ['axios', 'lodash-es']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

---

## 12. 附录

### 12.1 API接口完整列表

| 端点 | 方法 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| /api/v1/resources | GET | 查询资源列表 | - | PageResult<ResourceDTO> |
| /api/v1/resources | POST | 创建资源 | CreateResourceRequest | ResourceDTO |
| /api/v1/resources/{id} | GET | 查询资源详情 | - | ResourceDTO |
| /api/v1/resources/{id} | PUT | 更新资源 | UpdateResourceRequest | ResourceDTO |
| /api/v1/resources/{id} | DELETE | 删除资源 | DeleteResourceRequest | void |
| /api/v1/resources/{id}/status | PATCH | 更新状态 | UpdateResourceStatusRequest | ResourceDTO |
| /api/v1/resources/{id}/audit-logs | GET | 查询审计日志 | - | PageResult<ResourceAuditLogDTO> |
| /api/v1/resource-types | GET | 查询资源类型 | - | ResourceType[] |

### 12.2 参考文档

- 需求澄清文档: `.kiro/specs/resource-management-ui/requirement-clarification.md`
- 需求规格说明书: `.kiro/specs/resource-management-ui/requirements.md`
- 需求验证文档: `.kiro/specs/resource-management-ui/requirement-verification.md`
- 后端Swagger文档: `http://localhost:8080/swagger-ui/index.html`
- Ant Design文档: https://ant.design/
- React文档: https://react.dev/

---

**文档版本**: v1.0  
**最后更新**: 2024-11-30  
**下一步**: 进入任务规划阶段 - 创建tasks.md

