/**
 * 认证服务
 * 需求: 1.2, 2.2, 2.3, 3.1
 */
import { post } from '@/utils/request'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
} from '@/types'

/**
 * 用户注册
 * 需求 1.2: 调用后端注册 API
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await post<RegisterResponse>('/auth/register', data)
  return response.data!
}

/**
 * 用户登录
 * 需求 2.2, 2.3: 调用后端登录 API、接收 JWT Token
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await post<LoginResponse>('/auth/login', data)
  return response.data!
}

/**
 * 用户登出
 * 需求 3.1: 调用后端退出 API 使 Session 失效
 */
export async function logout(): Promise<void> {
  await post<LogoutResponse>('/auth/logout')
}
