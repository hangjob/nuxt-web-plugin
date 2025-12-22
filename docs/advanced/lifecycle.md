# 生命周期钩子 (Lifecycle Hooks)

Nuxt 应用在运行过程中会触发各种生命周期钩子，插件或模块可以监听这些钩子来扩展功能。

## 常用钩子一览

### 1. App 钩子 (Runtime)

这些钩子在 Vue 应用实例中运行，通常在插件 (`plugins/`) 或组合式函数中使用。

| 钩子名称 | 说明 |
| --- | --- |
| `app:created` | Vue 应用实例创建时触发 |
| `app:mounted` | Vue 应用挂载到 DOM 后触发 (仅客户端) |
| `app:error` | 发生未捕获错误时触发 |
| `page:start` | 页面导航开始时 |
| `page:finish` | 页面导航结束时 |

```ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    console.log('应用已挂载！')
  })
  
  nuxtApp.hook('page:start', () => {
    console.log('开始加载新页面...')
  })
})
```

### 2. Nitro 钩子 (Server)

这些钩子在服务端引擎 Nitro 中运行，用于处理请求、响应或渲染过程。

| 钩子名称 | 说明 |
| --- | --- |
| `request` | 收到新请求时 |
| `beforeResponse` | 发送响应之前 |
| `render:html` | 渲染 HTML 字符串之前，可用于注入 Meta 或 Script |

```ts
// server/plugins/logger.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    console.log('收到请求:', event.path)
  })
})
```

### 3. Build 钩子 (Build Time)

主要在 `nuxt.config.ts` 或模块中使用，影响构建过程。

| 钩子名称 | 说明 |
| --- | --- |
| `build:before` | 构建开始前 |
| `pages:extend` | 扩展或修改路由表 |
| `components:dirs` | 扩展组件自动导入目录 |

## 实战：使用钩子注入脚本

假设我们需要在每个页面的 `<head>` 中注入一段统计脚本：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  hooks: {
    'app:created'(vueApp) {
      // 运行时修改
    },
    'pages:extend'(pages) {
      // 动态添加一个测试路由
      pages.push({
        name: 'test-hook',
        path: '/test-hook',
        file: '~/pages/index.vue'
      })
    }
  }
})
```

