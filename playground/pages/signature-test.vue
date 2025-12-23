<template>
  <div class="p-8 max-w-4xl mx-auto space-y-8">
    <div class="space-y-4">
      <h1 class="text-3xl font-bold text-gray-800">API 安全签名测试</h1>
      <p class="text-gray-600">
        当前配置模式: <span class="font-mono bg-yellow-100 px-2 py-1 rounded">AES-GCM (Token 模式)</span>
      </p>
    </div>

    <!-- 请求控制区 -->
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
      <h2 class="text-xl font-semibold">1. 发起请求</h2>
      <div class="flex gap-4">
        <button
            @click="sendRequest"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            :disabled="loading"
        >
          {{ loading ? '请求中...' : '发送 GET 请求' }}
        </button>

        <button
            @click="clearLogs"
            class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
        >
          清空日志
        </button>
      </div>
    </div>

    <!-- 请求详情展示 -->
    <div v-if="lastRequest" class="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
      <h2 class="text-xl font-semibold">2. 请求头详情 (自动注入)</h2>
      <div class="grid gap-2 text-sm font-mono">
        <div class="flex border-b py-2">
          <span class="w-48 font-bold text-gray-500">X-Hmac-Algorithm:</span>
          <span class="text-green-600">{{ lastRequest.headers['X-Hmac-Algorithm'] }}</span>
        </div>
        <div class="flex border-b py-2">
          <span class="w-48 font-bold text-gray-500">X-Hmac-Key:</span>
          <span class="text-blue-600">{{ lastRequest.headers['X-Hmac-Key'] }}</span>
        </div>
        <div class="flex border-b py-2">
          <span class="w-48 font-bold text-gray-500">X-Hmac-Signature:</span>
          <span class="text-purple-600 break-all">{{ lastRequest.headers['X-Hmac-Signature'] }}</span>
        </div>
        <div class="mt-2 text-xs text-gray-400">
          * Signature 是加密后的 Token，包含 timestamp 和 nonce
        </div>
      </div>
    </div>

    <!-- 模拟服务端验证 -->
    <div v-if="lastRequest" class="bg-white p-6 rounded-lg shadow border border-green-200 space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-green-800">3. 服务端解密验证 (模拟)</h2>
        <button 
          @click="verifySignature" 
          class="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
        >
          执行解密
        </button>
      </div>

      <div v-if="decryptedToken" class="p-4 bg-gray-900 rounded text-green-400 font-mono text-sm overflow-x-auto">
        <div class="mb-2 text-gray-500">// 解密成功！还原的 Token 内容：</div>
        <pre>{{ JSON.stringify(decryptedToken, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 使用我们刚才写的插件
const { get } = useApiClient()
const { decrypt } = useSymmetricCrypto() // 用于模拟服务端解密

const loading = ref(false)
const lastRequest = ref<any>(null)
const decryptedToken = ref<any>(null)

// 模拟配置的 Secret (必须与 nuxt.config.ts 中一致才能解密成功)
const SERVER_SECRET = 'demo-secret-key-123456'

const sendRequest = async () => {
  loading.value = true
  lastRequest.value = null
  decryptedToken.value = null

  try {
    // 拦截请求以获取 Headers (仅演示用)
    const interceptor = (ctx: any) => {
        // 提取自动注入的头
        const headers: Record<string, string> = {}
        const targetHeaders = ['x-hmac-algorithm', 'x-hmac-key', 'x-hmac-signature']
        
        // Nuxt 3 $fetch 的 headers 结构可能不同，做个简单的遍历
        if (ctx.options.headers) {
             Object.entries(ctx.options.headers).forEach(([key, val]) => {
                 if (targetHeaders.includes(key.toLowerCase())) {
                     headers[key] = val as string
                 }
             })
        }
        
        // 保存这次请求的信息
        lastRequest.value = {
            url: ctx.request,
            headers
        }
    }

    // 发起真实请求 (会被插件拦截并注入签名)
    // 这里我们传入 onRequest 钩子来"偷看"发出去的 Header
    await get('/posts/1', {
        onRequest: interceptor
    })

  } catch (e) {
    console.error('请求出错', e)
  } finally {
    loading.value = false
  }
}

const verifySignature = async () => {
    if (!lastRequest.value?.headers['X-Hmac-Signature']) return

    try {
        const signature = lastRequest.value.headers['X-Hmac-Signature']
        // 模拟服务端解密
        const jsonStr = await decrypt(signature, SERVER_SECRET)
        decryptedToken.value = JSON.parse(jsonStr)
    } catch (e) {
        alert('解密失败！密钥可能不匹配。')
        console.error(e)
    }
}

const clearLogs = () => {
  lastRequest.value = null
  decryptedToken.value = null
}
</script>

