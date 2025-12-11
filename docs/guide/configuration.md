# 配置

在 `nuxt.config.ts` 中注册并配置模块。

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-web-plugin'],

  webPlugin: {
    // 网络请求全局配置
    network: {
      enabled: true,
      baseURL: 'https://api.example.com', // API 基础地址
      timeout: 10000, // 超时时间 (ms)
      retry: 1, // 失败重试次数
      withCredentials: true, // 跨域是否携带凭证
      headers: {
        'X-App-Version': '1.0.0' // 全局公共 Header
      }
    },
    
    // 安全功能配置
    security: {
      // 加密算法参数
      crypto: {
        symmetric: true,   // 启用对称加密
        asymmetric: true,  // 启用非对称加密
        hash: true,        // 启用哈希工具
        algorithm: 'AES-GCM',
        keySize: 256
      },
      // 加密存储配置
      encryption: {
        enabled: true,
        storage: true, // 启用 LocalStorage 加密
        cookies: true  // 启用 Cookie 加密
      }
    },

    // SEO 优化配置
    seo: {
      enabled: true,
      siteUrl: 'https://mysite.com', // 站点域名，用于生成绝对路径
      titleTemplate: '%s - 我的网站', // 标题模板
      defaultTitle: '我的网站',
      defaultDescription: '默认描述信息',
      defaultImage: '/share.jpg'
    }
  }
})
```

## 配置项说明

### Network Options

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `enabled` | `boolean` | `true` | 是否启用网络请求封装功能 |
| `baseURL` | `string` | `''` | API 的基础 URL |
| `timeout` | `number` | `15000` | 请求超时时间（毫秒） |
| `retry` | `number` | `0` | 请求失败后的自动重试次数 |
| `headers` | `object` | `{}` | 全局请求头 |

### Security Options

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `crypto.algorithm` | `string` | `'AES-GCM'` | 对称加密使用的算法 |
| `encryption.storage` | `boolean` | `true` | 是否注入 LocalStorage 加密 helper |
| `encryption.cookies` | `boolean` | `true` | 是否注入 Cookie 加密 helper |

### SEO Options

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `enabled` | `boolean` | `true` | 是否启用 SEO 助手 |
| `siteUrl` | `string` | `''` | 站点 URL，用于补全图片绝对路径 |
| `titleTemplate` | `string` | `'%s'` | 页面标题模板 |
| `defaultTitle` | `string` | `''` | 默认页面标题 |
| `defaultImage` | `string` | `''` | 默认分享图片地址 |
