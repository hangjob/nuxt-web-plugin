<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-8 bg-slate-50 text-slate-800">
    <div class="text-center space-y-4">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl mb-2 shadow-lg shadow-indigo-200">
        🔌
      </div>
      <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Nuxt Web Plugin</h1>
      <p class="text-slate-500 text-lg max-w-md mx-auto">功能强大的 Nuxt 3/4 增强插件，集成网络请求、安全套件与高级工具链。</p>
    </div>
    
    <div class="grid gap-4 w-full max-w-sm px-4">
      <NuxtLink
        class="group flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300"
        to="/layout"
      >
        <div class="flex items-center gap-3">
          <span class="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">📐</span>
          <div class="text-left">
            <h3 class="font-semibold text-slate-900">布局演示</h3>
            <p class="text-xs text-slate-500">Layout System</p>
          </div>
        </div>
        <span class="text-slate-300 group-hover:text-indigo-500 transition-colors">→</span>
      </NuxtLink>

      <NuxtLink
        class="group flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300"
        to="/test"
      >
        <div class="flex items-center gap-3">
          <span class="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">🧪</span>
          <div class="text-left">
            <h3 class="font-semibold text-slate-900">功能测试</h3>
            <p class="text-xs text-slate-500">Security & Network</p>
          </div>
        </div>
        <span class="text-slate-300 group-hover:text-emerald-500 transition-colors">→</span>
      </NuxtLink>
    </div>

    <div class="text-xs text-slate-400 mt-8">
      Powered by nuxt-web-plugin v1.1.0
    </div>
  </div>
</template>

