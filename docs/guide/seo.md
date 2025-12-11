# SEO 优化

模块提供了一个强大的组合式函数 `useWebSeo`，旨在简化 Nuxt 项目的 SEO 配置。通过全局配置和页面级覆盖，你可以轻松管理 TDK（Title, Description, Keywords）以及 Open Graph 和 Twitter Card 元标签。

## 为什么需要它？

Nuxt 3 原生的 `useSeoMeta` 非常强大，但在实际项目中，我们经常遇到以下痛点：
1.  **重复劳动**：每个页面都要重复设置 `og:title`, `twitter:title`, `og:image` 等。
2.  **图片路径**：社交分享图片通常需要绝对路径（e.g. `https://example.com/cover.jpg`），手动拼接很麻烦。
3.  **全局默认值**：希望有一个地方配置默认的分享图或标题后缀。

`useWebSeo` 解决了这些问题。

## 基础用法

在任何页面或组件中：

```vue
<script setup lang="ts">
// 自动继承全局默认配置
useWebSeo({
  title: '关于我们',
  description: '公司简介及发展历程...',
  image: '/images/about-us.jpg' // 会自动补全为绝对路径
})
</script>
```

这将自动生成：
- `<title>` (包含模板，如 "关于我们 - 我的网站")
- `<meta name="description">`
- `og:title`, `og:description`, `og:image`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

## 高级用法

### 1. 禁止索引 (NoIndex)

对于不需要被搜索引擎收录的页面（如后台管理、个人中心）：

```vue
<script setup lang="ts">
useWebSeo({
  title: '个人中心',
  noIndex: true // 生成 <meta name="robots" content="noindex, nofollow">
})
</script>
```

### 2. 文章详情页

指定内容类型，有助于社交媒体更好地展示内容。

```vue
<script setup lang="ts">
useWebSeo({
  title: '2025年 Nuxt 开发趋势',
  type: 'article', // 默认为 'website'
  keywords: 'nuxt, vue, web development'
})
</script>
```

## 全局配置

你可以在 `nuxt.config.ts` 中设置默认策略，这样在页面中未指定的字段将自动回退到默认值。

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-web-plugin'],
  webPlugin: {
    seo: {
      enabled: true,
      siteUrl: 'https://example.com', // 必须配置，用于生成绝对路径
      titleTemplate: '%s - 我的超酷网站', // 页面标题模板
      defaultTitle: '我的超酷网站', // 默认首页标题
      defaultDescription: '这是一个基于 Nuxt 3 构建的示例站点',
      defaultImage: '/default-share.jpg' // 默认分享图
    }
  }
})
```

## API 参考

### `useWebSeo(options)`

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `title` | `string` | 页面标题 |
| `description` | `string` | 页面描述 |
| `image` | `string` | 分享图片 URL (支持相对路径) |
| `keywords` | `string` | 关键词 (逗号分隔) |
| `type` | `string` | Open Graph 类型，默认为 `website` |
| `noIndex` | `boolean` | 是否禁止搜索引擎索引 |

