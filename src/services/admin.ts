/**
 * 管理员服务
 * 需求: 12.1, 12.2, 13.1, 13.2
 */
import { get, post } from '@/utils/request'
import type {
  AdminUserListResponse,
  UnlockAccountResponse,
  AuditLogListResponse,
  AuditLogQuery,
} from '@/types'

/**
 * 获取用户列表
 * 需求 12.1: 显示所有用户的列表
 */
export async function getUserList(
  page: number = 1,
  pageSize: number = 10
): Promise<AdminUserListResponse> {
  // 前端页码从1开始，后端从0开始，需要转换
  const backendPage = page - 1
  const response = await get<any>('/admin/users', { page: backendPage, size: pageSize })
  const data = response.data!
  
  // 转换后端 Spring Data 分页格式为前端期望格式
  return {
    users: data.content || [],
    total: data.totalElements || 0,
    page: (data.page || 0) + 1, // 后端的 page 字段是当前页码（从0开始），转换为前端的1开始
    pageSize: data.size || pageSize,
  }
}

/**
 * 解锁账号
 * 需求 12.2: 调用后端解锁 API
 */
export async function unlockAccount(accountId: number): Promise<UnlockAccountResponse> {
  const response = await post<UnlockAccountResponse>(`/admin/accounts/${accountId}/unlock`)
  return response.data!
}

/**
 * 获取审计日志列表
 * 需求 13.1, 13.2: 显示日志列表和筛选功能
 */
export async function getAuditLogs(query: AuditLogQuery = {}): Promise<AuditLogListResponse> {
  const response = await get<AuditLogListResponse>('/admin/audit-logs', query as Record<string, unknown>)
  return response.data!
}
