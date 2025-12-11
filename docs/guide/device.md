# 设备检测

提供一个 `useDevice` 组合式函数，用于检测当前访问设备、操作系统及浏览器环境。它同时支持**服务端渲染 (SSR)** 和**客户端**调用。

## 基础用法

```vue
<script setup lang="ts">
const { isMobile, isDesktop, os, browser } = useDevice()
</script>
```

## 功能特性

### 1. SSR 支持
在服务端渲染期间，该函数会自动读取请求头中的 `User-Agent` 进行解析，确保服务端生成的 HTML 结构与客户端一致，避免 Hydration Mismatch。

### 2. 响应式布局判断
可以基于此函数实现条件渲染：

```vue
<template>
  <div>
    <MobileHeader v-if="isMobile" />
    <DesktopHeader v-else />
  </div>
</template>

<script setup lang="ts">
const { isMobile } = useDevice()
</script>
```

### 3. 特定环境检测
比如判断是否在微信内置浏览器中：

```typescript
const { browser } = useDevice()

if (browser.isWechat) {
  // 显示微信特定的分享引导层
}
```

## API 参考

返回对象结构如下：

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `userAgent` | `string` | 原始 UA 字符串 |
| `isMobile` | `boolean` | 是否为移动设备 |
| `isDesktop` | `boolean` | 是否为桌面设备 |
| `isTablet` | `boolean` | 是否为平板设备 |
| `os.isIos` | `boolean` | 是否为 iOS (iPhone/iPad) |
| `os.isAndroid` | `boolean` | 是否为 Android |
| `browser.isWechat` | `boolean` | 是否为微信浏览器 |

