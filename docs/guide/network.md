# 网络请求

模块提供了一个组合式函数 `useApiClient`，它是对 Nuxt 内置 `$fetch` 的一层轻量级封装，自动集成了配置文件中的 `baseURL`、`headers` 等选项。

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

