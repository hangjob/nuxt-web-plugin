<template>
  <div style="min-height: 100vh; padding: 2rem;">
    <div style="max-width: 800px; margin: 0 auto;">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">🧪 安全功能测试页面</h1>
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 0.5rem; padding: 1rem; margin-bottom: 2rem;">
        <h2 style="font-size: 1.2rem; font-weight: 600; color: #92400e; margin-bottom: 0.5rem;">安全配置</h2>
      </div>

      <div style="background: #ecfccb; border: 1px solid #bef264; border-radius: 0.5rem; padding: 1rem; margin-bottom: 2rem;">
        <h2 style="font-size: 1.2rem; font-weight: 600; color: #3f6212; margin-bottom: 0.5rem;">统一网络配置</h2>
      </div>

      <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 0.5rem; padding: 1rem; margin-bottom: 2rem;">
        <h2 style="font-size: 1.2rem; font-weight: 600; color: #3730a3; margin-bottom: 0.5rem;">网络请求示例</h2>
        <p style="font-size: 0.9rem; color: #3730a3; margin-bottom: 0.75rem;">
          通过 <code>useApiClient</code> 调用 JSONPlaceholder，观察全局配置带来的效果。
        </p>
        <button
          @click="fetchTodo"
          :disabled="apiLoading"
          style="background: #4f46e5; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;"
        >
          {{ apiLoading ? '请求中...' : '获取 Todo 示例' }}
        </button>

        <p v-if="apiError" style="color: #b91c1c; margin-top: 0.75rem;">请求失败：{{ apiError }}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <NuxtLink
          to="/"
          style="background: #2563eb; color: white; padding: 1rem; border-radius: 0.5rem; text-decoration: none; text-align: center; display: block;"
        >
          🏠 首页
        </NuxtLink>

        <NuxtLink
          to="/login"
          style="background: #059669; color: white; padding: 1rem; border-radius: 0.5rem; text-decoration: none; text-align: center; display: block;"
        >
          🔑 登录
        </NuxtLink>

        <NuxtLink
          to="/dashboard"
          style="background: #7c3aed; color: white; padding: 1rem; border-radius: 0.5rem; text-decoration: none; text-align: center; display: block;"
        >
          📊 仪表板
        </NuxtLink>

        <NuxtLink
          to="/admin"
          style="background: #dc2626; color: white; padding: 1rem; border-radius: 0.5rem; text-decoration: none; text-align: center; display: block;"
        >
          👑 管理
        </NuxtLink>
      </div>

      <div style="margin-top: 2rem;">
        <button
          @click="testAuth"
          style="background: #f59e0b; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; margin-right: 1rem;"
        >
          测试认证状态
        </button>

        <button
          @click="clearAuth"
          style="background: #6b7280; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;"
        >
          清除认证
        </button>
      </div>

      <div style="margin-top: 1rem; font-size: 0.9rem; color: #6b7280;">
        <p>💡 打开浏览器控制台查看安全配置、网络配置与本地存储加密结果</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = ref(null)
const securityConfig = ref({})
const networkConfig = ref({})
const apiResult = ref(null)
const apiError = ref('')
const apiLoading = ref(false)
const apiClient = useApiClient()

// 在客户端获取数据
if (process.client) {
  const userStr = localStorage.getItem('user_info')
  if (userStr) {
    try {
      user.value = JSON.parse(userStr)
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }

  // 获取安全配置
  try {
    const config = useRuntimeConfig()
    securityConfig.value = config.public.webPlugin?.security || {}
    networkConfig.value = config.public.webPlugin?.network || {}
  } catch (e) {
    console.error('获取配置失败:', e)
  }
}

const fetchTodo = async () => {
  apiLoading.value = true
  apiError.value = ''
  try {
    apiResult.value = await apiClient.get('/todos/1')
  } catch (error) {
    const err = error as { message?: string }
    apiError.value = err?.message || '未知错误'
  } finally {
    apiLoading.value = false
  }
}

const testAuth = () => {
  if (process.client) {
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('user_info')
    console.log('认证状态测试:', { token: !!token, user: !!user })
    alert(`认证状态: Token=${!!token}, User=${!!user}`)
  }
}

const clearAuth = () => {
  if (process.client) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
    user.value = null
    console.log('认证信息已清除')
    alert('认证信息已清除')
  }
}
</script>
