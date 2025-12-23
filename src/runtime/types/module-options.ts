
export interface ModuleOptions {
  security?: SecurityOptions
  network?: NetworkOptions
  seo?: SeoOptions
  utils?: UtilsOptions
  device?: DeviceOptions
}

export interface SecurityOptions {
  crypto?: {
    algorithm?: string
    keySize?: number
  }
  xss?: {
    enabled: boolean
  }
  /**
   * API 请求签名配置
   */
  apiSignature?: {
    enabled?: boolean
    /**
     * 签名算法
     * - SHA-256: 使用简单的 Hash 签名 (默认)
     * - RSA-SHA256: 使用 RSA 私钥签名 (RSASSA-PKCS1-v1_5)
     * - AES-GCM: 使用 AES 密钥加密签名串
     */
    algorithm?: 'SHA-256' | 'RSA-SHA256' | 'AES-GCM'
    appKey?: string
    /**
     * 通用密钥 (用于 SHA-256 或 AES)
     */
    appSecret?: string
    /**
     * RSA 私钥 (PEM 格式，用于 RSA 签名)
     */
    privateKey?: string
    headerPrefix?: string // 默认 'X-Hmac-'
  }
}

export interface NetworkOptions {
  baseURL?: string
  timeout?: number
  retry?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  enabled?: boolean
}

export interface SeoOptions {
  siteTitle?: string
  description?: string
  keywords?: string[]
}

export interface UtilsOptions {
  dateFormat?: string
}

export interface DeviceOptions {
  enabled?: boolean
}
