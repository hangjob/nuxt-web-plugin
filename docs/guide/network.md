# 网络请求

模块提供了一个组合式函数 `useApiClient`，它是对 Nuxt 内置 `$fetch` 的一层轻量级封装，自动集成了配置文件中的 `baseURL`、`headers` 等选项。

在 v1.1.0+ 中，我们新增了**智能缓存**、**自动去重**和**并发锁**等高级特性。

## 基础用法

```vue
<script setup lang="ts">
const { get, post, put, del, request } = useApiClient()

// GET 请求
const fetchUser = async () => {
  const user = await get('/users/1')
}

// POST 请求
const createUser = async () => {
  await post('/users', {
    body: { name: 'Nuxt' }
  })
}
</script>
```

## 高级特性 (NEW)

### 1. 自动去重 (Deduplication)

默认情况下，`useApiClient` 会自动对相同的请求进行去重。
当两个组件几乎同时发起相同的请求（相同的 URL、Method 和参数）时，**实际上只会发送一次网络请求**，所有调用者都会收到同一个 Promise 结果。

```ts
// 组件 A
const data1 = api.get('/api/config')

// 组件 B (几乎同时调用)
const data2 = api.get('/api/config')

// 结果：网络面板中只有一条请求，data1 和 data2 共享结果
```

如果你需要强制发起新请求（例如刷新数据），可以关闭去重：

```ts
// 强制发起新请求，不复用正在进行的 Promise
api.get('/api/config', { dedupe: false })
```

### 2. 短时缓存 (Caching)

对于 GET 请求，你可以设置 `cache` 选项来启用内存缓存。在缓存有效期内，相同的请求将直接返回内存中的数据，实现“秒开”体验。

```ts
// 启用缓存，默认有效期 3000ms (3秒)
const list = await api.get('/api/news', { cache: true })

// 自定义缓存时长，例如 5秒
const hotList = await api.get('/api/hot', { cache: 5000 })
```

### 3. 并发锁 (Request Lock)

为了防止用户快速点击按钮导致表单重复提交，你可以开启 `lock` 模式。
当一个请求正在进行时，任何具有相同特征（URL + 参数）的新请求都会被**直接忽略**，直到前一个请求完成。

```ts
const submitForm = async () => {
  // 如果上一次提交还没结束，这次调用会被直接忽略
  await api.post('/api/order', {
    body: form.value,
    lock: true 
  })
}
```

## 进阶用法

### 拦截器与自定义 Header

你可以像使用 `$fetch` 一样使用拦截器，这对于添加认证 Token 或处理全局错误非常有用。

```vue
<script setup lang="ts">
const { get } = useApiClient()

const fetchWithInterceptor = async () => {
  const data = await get('/profile', {
    // 覆盖/添加 Header
    headers: {
      'Authorization': 'Bearer my-token'
    },
    
    // 请求拦截器
    onRequest({ options }) {
      console.log('正在发送请求...')
      // 动态添加 Header
      options.headers.set('X-Timestamp', Date.now().toString())
    },
    
    // 响应拦截器
    onResponse({ response }) {
      console.log('收到响应:', response.status)
    },
    
    // 错误处理
    onResponseError({ response }) {
      console.error('API 错误:', response._data)
    }
  })
}
</script>
```

### 错误处理

`useApiClient` 会抛出一个归一化的错误对象，方便统一处理。

```typescript
try {
  await get('/error-api')
} catch (error) {
  // error 对象结构
  console.log(error.statusCode) // HTTP 状态码
  console.log(error.message)    // 错误消息
  console.log(error.data)       // 响应数据
}
```
