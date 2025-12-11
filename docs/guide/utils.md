# 通用工具

提供了一系列高频使用的业务逻辑函数，包括剪贴板复制、日期/金额格式化、防抖和节流等。

## 基础用法

```vue
<script setup lang="ts">
const { 
  copyToClipboard, 
  formatDate, 
  formatMoney, 
  debounce, 
  throttle 
} = useWebUtils()
</script>
```

## 功能详解

### 1. 剪贴板复制

兼容性良好的复制文本功能。

```typescript
const handleCopy = async () => {
  const success = await copyToClipboard('Hello Nuxt')
  if (success) {
    alert('复制成功')
  }
}
```

### 2. 格式化日期

支持自定义格式字符串。

```typescript
// 默认格式: YYYY-MM-DD HH:mm:ss
formatDate(new Date()) // '2025-12-10 15:30:00'

// 自定义格式
formatDate(1733815800000, 'YYYY/MM/DD') // '2025/12/10'
formatDate(Date.now(), 'HH:mm') // '15:30'
```

### 3. 格式化金额

千分位分隔符及小数处理。

```typescript
formatMoney(1234567.89) // '¥1,234,567.89'
formatMoney(1234.5, 0, '$') // '$1,235'
```

### 4. 防抖 (Debounce)

适用于搜索框输入、窗口调整大小等高频触发事件，只在最后一次触发后执行。

```vue
<script setup lang="ts">
const handleInput = debounce((e: Event) => {
  const value = (e.target as HTMLInputElement).value
  console.log('搜索:', value)
}, 500)
</script>

<template>
  <input @input="handleInput" placeholder="输入搜索..." />
</template>
```

### 5. 节流 (Throttle)

适用于滚动监听、按钮防重点击，限制一定时间内只能执行一次。

```vue
<script setup lang="ts">
const handleScroll = throttle(() => {
  console.log('页面滚动中...')
}, 200)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
</script>
```

