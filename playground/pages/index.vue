<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 text-slate-800">
    <div class="text-center space-y-3">
      <h1 class="text-3xl font-semibold">Nuxt Web Plugin 示例入口</h1>
      <p class="text-slate-500">请选择要访问的页面：</p>
    </div>
    <div class="flex gap-4">
      <NuxtLink
        class="rounded-xl bg-slate-900 px-5 py-3 text-white font-semibold hover:-translate-y-0.5 transition"
        to="/layout"
      >
        布局示例
      </NuxtLink>
      <NuxtLink
        class="rounded-xl border border-slate-300 px-5 py-3 text-slate-700 font-semibold hover:-translate-y-0.5 transition"
        to="/test"
      >
        安全/网络示例
      </NuxtLink>
    </div>
  </div>
</template>

