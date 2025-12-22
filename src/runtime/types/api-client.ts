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

  /**
   * 缓存时间 (毫秒)，仅对 GET 有效。
   * 设置为 true 使用默认值 (3000ms)，数字则为自定义时长。
   */
  cache?: boolean | number

  /**
   * 唯一请求键，用于缓存和去重。如果不传，自动根据 URL + 参数生成。
   */
  key?: string

  /**
   * 是否开启请求去重。默认 true (相同 key 的请求在 pending 状态时会共享 Promise)
   */
  dedupe?: boolean

  /**
   * 并发锁。如果设为 true，在前一个相同 key 的请求完成前，新的请求会被直接忽略。
   * 适用于防止表单重复提交。
   */
  lock?: boolean
}

export interface NormalizedApiError {
  statusCode?: number
  statusMessage?: string
  message: string
  data?: unknown
  cause?: unknown
}

