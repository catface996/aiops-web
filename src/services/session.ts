/**
 * 会话服务
 * 需求: 6.1
 */
import { get, post } from '@/utils/request'
import type { ValidateSessionResponse, ForceLogoutOthersResponse } from '@/types'

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
