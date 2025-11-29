/**
 * 会话服务
 * 需求: 5.1, 6.1, 6.3
 */
import { get, post, del } from '@/utils/request'
import type {
  ValidateSessionResponse,
  ForceLogoutOthersResponse,
  SessionListResponse,
  TerminateSessionResponse,
} from '@/types'

/**
 * 验证会话有效性
 * 需求 6.1: 验证 Token 有效性
 */
export async function validateSession(): Promise<ValidateSessionResponse> {
  const response = await get<ValidateSessionResponse>('/session/validate')
  return response.data!
}

/**
 * 强制登出其他设备
 * 需求 11.3: 支持强制登出其他设备
 */
export async function forceLogoutOthers(): Promise<ForceLogoutOthersResponse> {
  const response = await post<ForceLogoutOthersResponse>('/session/force-logout-others')
  return response.data!
}

/**
 * 获取会话列表
 * 需求 5.1: 获取用户所有活动会话
 */
export async function getSessionList(): Promise<SessionListResponse> {
  const response = await get<SessionListResponse>('/session/list')
  return response.data!
}

/**
 * 终止指定会话
 * 需求 6.3: 终止指定会话
 */
export async function terminateSession(sessionId: string): Promise<TerminateSessionResponse> {
  const response = await del<TerminateSessionResponse>(`/session/${sessionId}`)
  return response.data!
}

/**
 * 终止所有其他会话
 * 需求 6.5: 终止所有其他会话
 */
export async function terminateOtherSessions(): Promise<TerminateSessionResponse> {
  const response = await post<TerminateSessionResponse>('/session/terminate-others')
  return response.data!
}
