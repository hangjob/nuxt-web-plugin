# Nuxt Web Plugin

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

一个功能强大的 Nuxt 3 插件，提供常用的布局、UI组件、SEO 优化、安全功能和性能优化工具。

- [📖 在线文档](https://hangjob.github.io/nuxt-web-plugin/)

## 特性

### 🔐 安全功能 (Security)
- **对称加密**: AES-GCM 算法，支持数据加密解密
- **非对称加密**: RSA-OAEP 算法，支持密钥交换和数字签名
- **哈希函数**: SHA-256、SHA-512、MD5 支持
- **加密存储**: localStorage 和 Cookie 的安全存储
- **XSS防护**: 输入过滤和清理
- **CSRF保护**: Token 验证机制

### 🎨 布局与UI组件 (Layout & UI)
- 响应式布局组件
- UI组件库
- 移动端适配
- 插件控制台布局示例（头部 + 左右 + Footer）

### 🔍 SEO优化 (SEO Optimization)
- 自动生成元标签
- Open Graph 和 Twitter Cards
- JSON-LD 结构化数据
- 自动生成 Sitemap 和 Robots.txt

### ⚡ 性能优化 (Performance)
- 图片懒加载
- 虚拟滚动
- 资源预加载
- Web Vitals 监控

### 📱 状态与数据管理 (State Management)
- 全局状态管理
- 表单处理和验证
- 异步数据管理
- 本地存储同步

### 🎯 用户体验增强 (UX Enhancement)
- 骨架屏加载
- 空状态处理
- 图片预览功能
- 丰富的交互组件

### 🛰️ 网络请求封装 (Network)
- **统一 `$fetch`**: 集中维护 baseURL、超时、请求头
- **语义化 API**: 内置 `get/post/put/patch/del` 快捷方法
- **错误归一化**: 捕获并输出结构化错误，方便日志分析

## 环境要求

- **Node.js**: v24.4.1 或更高版本
- **Nuxt**: ^3.0.0 或 ^4.0.0
- **PNPM**: 建议使用最新版本

## 安装

```bash
npm install nuxt-web-plugin
```

## 配置

在 `nuxt.config.ts` 中添加模块：

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-web-plugin'],
  webPlugin: {
    // 安全功能配置
    security: {
      crypto: {
        symmetric: true,
        asymmetric: true,
        hash: true,
        keySize: 256,
        algorithm: 'AES-GCM'
      }
    },
    // 统一网络请求配置
    network: {
      enabled: true,
      baseURL: 'https://jsonplaceholder.typicode.com',
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: false,
      retry: 1
    }
  }
})
```

> ⚠️ 2025-12-03 起，模块不再包含路由中间件，请移除旧的 `webPlugin.middleware` 配置以避免无效字段。

## 加密功能使用

### 对称加密

```typescript
const { generateKey, encrypt, decrypt } = useSymmetricCrypto()

// 生成密钥
const key = await generateKey()

// 加密数据
const { encrypted, iv } = await encrypt('敏感数据', key)

// 解密数据
const decrypted = await decrypt(encrypted, key, iv)
```

### 非对称加密

```typescript
const { generateKeyPair, encrypt, decrypt } = useAsymmetricCrypto()

// 生成密钥对
const keyPair = await generateKeyPair()

// 使用公钥加密
const encrypted = await encrypt('数据', keyPair.publicKey)

// 使用私钥解密
const decrypted = await decrypt(encrypted, keyPair.privateKey)
```

### 加密存储

```typescript
const { setEncryptedItem, getEncryptedItem } = useEncryption()

// 安全存储
await setEncryptedItem('key', '敏感数据', '密码')

// 安全读取
const data = await getEncryptedItem('key', '密码')
```

## 网络请求封装

```typescript
const apiClient = useApiClient()

const fetchTodo = async () => {
  try {
    const todo = await apiClient.get('/todos/1', {
      headers: { 'x-trace-id': crypto.randomUUID() }
    })
    console.log(todo)
  } catch (error) {
    console.error('请求失败', error)
  }
}
```

默认会使用 `webPlugin.network` 中的配置，必要时你可以在调用时覆盖 `baseURL`、`timeout`、`retry` 等选项。

## 布局展示模板（Playground）

- 访问 `http://localhost:3000/layout` 体验“头部菜单 + 左右布局 + Footer”组合页面
- 展示插件信息、快捷入口、统计卡、模块介绍与模板库
- 同样支持 Tailwind 暗色模式，并与 `/test` 页面互相跳转

## 文档

项目包含完整的 VitePress 文档站点。

### 启动文档开发服务器

```bash
pnpm docs:dev
```

访问 `http://localhost:5174` 查看文档。

### 构建文档

```bash
pnpm docs:build
```

### 预览构建结果

```bash
pnpm docs:preview
```

## 开发

```bash
# 安装依赖
pnpm install

# 生成类型存根
pnpm run dev:prepare

# 开发 playground
pnpm run dev

# 构建 playground
pnpm run dev:build

# 运行 ESLint
pnpm run lint

# 运行测试
pnpm run test
pnpm run test:watch

# 文档相关命令
pnpm docs:dev      # 开发文档
pnpm docs:build    # 构建文档
pnpm docs:preview  # 预览文档

# 发布新版本
pnpm run release
```

## 许可证

MIT License

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-web-plugin/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-web-plugin

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-web-plugin.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-web-plugin

[license-src]: https://img.shields.io/npm/l/nuxt-web-plugin.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-web-plugin

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
