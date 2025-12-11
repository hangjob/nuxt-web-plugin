// 模块配置类型
export type { ModuleOptions, NetworkOptions } from './runtime/types/module-options'
export type { ApiRequestOptions, NormalizedApiError, HttpMethod } from './runtime/types/api-client'

// 加密相关类型
export interface CryptoConfig {
  algorithm?: string
  keySize?: number
}

export interface EncryptionOptions {
  expires?: Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

// 通用工具类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  code?: string | number
}

export interface AsyncState<T = unknown> {
  loading: boolean
  data: T | null
  error: string | null
}
