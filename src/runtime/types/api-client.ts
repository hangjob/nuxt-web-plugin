export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiRequestOptions {
  /**
   * 请求方法，默认为 GET
   */
  method?: HttpMethod
  /**
   * 追加在 URL 上的查询参数
   */
  query?: Record<string, unknown>
  /**
   * 请求体
   */
  body?: unknown
  /**
   * 自定义请求头
   */
  headers?: Record<string, string>
  /**
   * 覆盖默认 baseURL
   */
  baseURL?: string
  /**
   * 覆盖默认超时时长
   */
  timeout?: number
  /**
   * 重试次数，false 表示关闭
   */
  retry?: number | false
  /**
   * 是否自动携带跨域 Cookie
   */
  credentials?: 'omit' | 'same-origin' | 'include'
  /**
   * 取消信号
   */
  signal?: AbortSignal
  /**
   * 自定义响应解析
   */
  parseResponse?: (input: string) => unknown
  /**
   * 其它 `$fetch` 支持的原生参数
   */
  [key: string]: unknown
}

export interface NormalizedApiError {
  statusCode?: number
  statusMessage?: string
  message: string
  data?: unknown
  cause?: unknown
}

