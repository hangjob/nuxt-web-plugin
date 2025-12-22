# Nuxt 中间件 (Middleware)

Nuxt 中间件允许你在导航到特定路由之前运行自定义代码。这是一个执行权限检查、重定向或日志记录的绝佳位置。

## 什么是中间件？

中间件本质上是一个接收 `to` (目标路由) 和 `from` (来源路由) 作为参数的函数。

```ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === '/dashboard' && !isAuthenticated()) {
    return navigateTo('/login')
  }
})
```

## 中间件类型

1.  **匿名/内联中间件**：直接在页面组件中定义。
2.  **命名中间件**：放置在 `middleware/` 目录下，在页面中通过名称引用。
3.  **全局中间件**：放置在 `middleware/` 目录下并以 `.global.ts` 结尾，对所有路由变更生效。

## 示例：全局路由守卫

创建一个 `middleware/auth.global.ts`：

```ts
export default defineNuxtRouteMiddleware((to, from) => {
  // 如果是登录页，直接放行
  if (to.path === '/login') return

  const token = useCookie('auth_token')

  // 如果没有 token，重定向到登录页
  if (!token.value) {
    return navigateTo('/login')
  }
})
```

## 配合本插件使用

你可以结合 `useSymmetricCrypto` 来在中间件中解密 Cookie：

```ts
import { useSymmetricCrypto } from '#imports'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { decrypt } = useSymmetricCrypto()
  const encryptedToken = useCookie('secure_token')
  
  try {
    const token = await decrypt(encryptedToken.value, 'my-secret-key')
    // 验证 token...
  } catch (e) {
    return navigateTo('/login')
  }
})
```

