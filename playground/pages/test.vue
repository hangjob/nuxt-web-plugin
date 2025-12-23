<template>
  <div class="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
    <div class="mx-auto max-w-4xl space-y-8">
      
      <!-- 头部 -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">功能测试控制台</h1>
          <p class="mt-2 text-slate-500">实时验证插件的安全、网络与工具特性。</p>
      </div>
        <NuxtLink to="/" class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-900/5 hover:text-slate-900">
          返回首页
        </NuxtLink>
      </div>

      <!-- 网格布局 -->
      <div class="grid gap-6 md:grid-cols-2">
        
        <!-- 1. 水印测试 -->
        <section class="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-xl">🛡️</div>
            <h2 class="text-lg font-semibold text-slate-900">页面水印</h2>
          </div>
          <p class="mb-4 text-sm text-slate-500">点击开启后，尝试使用 F12 删除水印节点，观察防篡改机制是否生效。</p>
          <div class="flex gap-3">
            <button
              @click="enableWatermark"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              开启水印
            </button>
        <button
              @click="disableWatermark"
              class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
              关闭
        </button>
          </div>
        </section>

        <!-- 2. 网络请求 -->
        <section class="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-xl">🌐</div>
            <h2 class="text-lg font-semibold text-slate-900">网络请求 (Smart Fetch)</h2>
          </div>
          <p class="mb-4 text-sm text-slate-500">集成自动去重与缓存机制。点击多次按钮，观察 Network 面板的实际请求数。</p>
          <div class="flex items-center gap-4">
        <button
              @click="fetchTodo"
              :disabled="apiLoading"
              class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
              {{ apiLoading ? '请求中...' : '发送 GET 请求' }}
        </button>
            <span v-if="apiResult" class="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Status: 200 OK</span>
          </div>
          <p v-if="apiError" class="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">❌ {{ apiError }}</p>
        </section>

        <!-- 3. 安全配置查看 -->
        <section class="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm ring-1 ring-slate-900/5 md:col-span-2">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl shadow-sm ring-1 ring-slate-900/5">⚙️</div>
            <h2 class="text-lg font-semibold text-slate-900">当前运行时配置</h2>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Security Config</h3>
              <pre class="overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-300">{{ securityConfig }}</pre>
            </div>
            <div class="space-y-2">
              <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Network Config</h3>
              <pre class="overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-300">{{ networkConfig }}</pre>
            </div>
          </div>
        </section>

      </div>

      <!-- 底部提示 -->
      <div class="text-center text-xs text-slate-400">
        <p>💡 提示：所有配置均可在 nuxt.config.ts 中实时调整。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 移除未使用的变量和方法，保持代码整洁
const user = ref(null)
const securityConfig = ref({})
const networkConfig = ref({})
const apiResult = ref(null)
const apiError = ref('')
const apiLoading = ref(false)
const apiClient = useApiClient()
const { setWatermark, clearWatermark } = useWatermark()

const enableWatermark = () => {
  setWatermark({
    text: 'Nuxt Web Plugin - 测试水印',
    color: 'rgba(0, 0, 0, 0.15)',
    fontSize: 16,
    rotate: -20
  })
}

const disableWatermark = () => {
  clearWatermark()
}

// 在客户端获取数据
if (process.client) {
  // 获取配置
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
</script>
