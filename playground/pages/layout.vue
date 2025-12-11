<template>
  <div :class="wrapperClass">
    <div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <div class="absolute -top-32 left-1/3 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-800/30" />
        <div class="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-800/30" />
        <div class="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
      </div>

      <header class="sticky top-0 z-30 border-b border-white/40 bg-white/80 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl text-white shadow-lg shadow-indigo-500/30">
              ✦
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-300">Nuxt Web Plugin</p>
              <h1 class="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">插件与布局系统</h1>
            </div>
          </div>

          <nav class="hidden items-center gap-1 rounded-2xl border border-slate-200/60 bg-white/70 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 lg:flex">
            <component
              v-for="item in content.navItems"
              :key="item.label"
              :is="resolveLinkComponent(item.to)"
              class="rounded-xl px-4 py-2 text-sm font-medium transition"
              :class="item.active ? 'bg-indigo-500 text-white shadow' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'"
              :to="showNuxtLink(item.to) ? item.to : undefined"
              :href="isExternal(item.to) ? item.to : undefined"
              target="_blank"
              rel="noopener"
            >
              {{ item.label }}
            </component>
          </nav>

          <div class="flex items-center gap-3">
            <button
              class="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-indigo-500"
              @click="toggleDarkMode"
            >
              <span>{{ isDark ? '🌞' : '🌙' }}</span>
              <span>{{ isDark ? '浅色模式' : '深色模式' }}</span>
            </button>

            <component
              v-if="content.hero.secondaryCta"
              :is="resolveLinkComponent(content.hero.secondaryCta.to)"
              class="hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-indigo-400 lg:inline-flex"
              :to="showNuxtLink(content.hero.secondaryCta?.to) ? content.hero.secondaryCta?.to : undefined"
              :href="isExternal(content.hero.secondaryCta?.to) ? content.hero.secondaryCta?.to : undefined"
              target="_blank"
              rel="noopener"
            >
              {{ content.hero.secondaryCta?.label }}
            </component>

            <component
              :is="resolveLinkComponent(content.hero.primaryCta.to)"
              class="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5"
              :to="showNuxtLink(content.hero.primaryCta.to) ? content.hero.primaryCta.to : undefined"
              :href="isExternal(content.hero.primaryCta.to) ? content.hero.primaryCta.to : undefined"
              target="_blank"
              rel="noopener"
            >
              {{ content.hero.primaryCta.label }}
              <span aria-hidden="true">↗</span>
            </component>
          </div>
        </div>
      </header>

      <div class="mx-auto flex max-w-7xl flex-1 flex-col gap-6 px-4 py-8 lg:flex-row">
        <aside class="hidden w-full max-w-xs flex-col gap-6 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-lg shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-slate-900/40 lg:flex">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">版本速览</p>
            <div class="mt-3 space-y-3">
              <div class="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow dark:border-slate-800 dark:bg-slate-900/70">
                <p class="text-sm text-slate-500 dark:text-slate-400">当前版本</p>
                <p class="text-2xl font-semibold text-slate-900 dark:text-white">{{ content.spotlight.currentVersion }}</p>
                <p class="text-xs text-emerald-500">{{ content.spotlight.currentStatus }}</p>
              </div>
              <div class="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 text-indigo-900 shadow dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200">
                <p class="text-sm font-semibold">{{ content.spotlight.upcomingBadge }}</p>
                <p class="text-base">{{ content.spotlight.upcomingTitle }}</p>
                <p class="text-xs opacity-80">{{ content.spotlight.upcomingDescription }}</p>
              </div>
            </div>
          </div>

          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">快捷入口</p>
            <div class="mt-3 space-y-3">
              <component
                v-for="cta in content.quickActions"
                :key="cta.label"
                :is="resolveLinkComponent(cta.to)"
                class="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-200"
                :to="showNuxtLink(cta.to) ? cta.to : undefined"
                :href="isExternal(cta.to) ? cta.to : undefined"
                target="_blank"
                rel="noopener"
              >
                <span>{{ cta.label }}</span>
                <span aria-hidden="true">↗</span>
              </component>
            </div>
          </div>

          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">标签</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="tag in content.tags"
                :key="tag"
                class="rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </aside>

        <main class="flex-1 space-y-6">
          <section class="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-900/40">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div class="space-y-3">
                <p class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  {{ content.hero.badgeLabel }}
                </p>
                <h2 class="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">{{ content.hero.title }}</h2>
                <p class="text-base text-slate-500 dark:text-slate-300">{{ content.hero.description }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="chip in content.featureChips"
                    :key="chip"
                    class="rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300"
                  >
                    {{ chip }}
                  </span>
                </div>
              </div>
              <div class="grid w-full max-w-md gap-4 sm:grid-cols-2">
                <div
                  v-for="stat in content.stats"
                  :key="stat.label"
                  class="rounded-2xl border border-slate-100 bg-white/80 p-5 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
                >
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
                  <p class="mt-2 text-3xl font-semibold">{{ stat.value }}</p>
                  <p v-if="stat.trend" class="text-xs font-medium text-emerald-500">{{ stat.trend }}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="grid gap-6 lg:grid-cols-2">
            <article
              v-for="module in content.modules"
              :key="module.title"
              class="group rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-slate-900/30"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/90 text-xl text-white dark:bg-white/10 dark:text-white">
                    {{ module.icon }}
                  </span>
                  <div>
                    <p class="text-xs uppercase tracking-widest text-slate-400">{{ module.category }}</p>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white">{{ module.title }}</h3>
                  </div>
                </div>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {{ module.badge }}
                </span>
              </div>
              <p class="mt-4 text-sm text-slate-500 dark:text-slate-300">{{ module.description }}</p>
              <ul class="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li v-for="point in module.points" :key="point" class="flex items-center gap-2">
                  <span class="text-emerald-400">•</span>
                  <span>{{ point }}</span>
                </li>
              </ul>
            </article>
          </section>

          <section class="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-lg shadow-indigo-200/40 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-900/30">
            <div class="flex flex-col gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">设计脉络</p>
              <h3 class="text-2xl font-semibold text-slate-900 dark:text-white">Roadmap / 灵感路线</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">将设计系统、模板与插件组合成一体化体验。</p>
            </div>
            <div class="mt-6 grid gap-4 md:grid-cols-3">
              <article
                v-for="item in content.roadmap"
                :key="item.title"
                class="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
              >
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">{{ item.phase }}</p>
                <h4 class="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{{ item.title }}</h4>
                <p class="mt-2 text-sm text-slate-500 dark:text-slate-300">{{ item.description }}</p>
                <ul class="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <li v-for="point in item.points" :key="point" class="flex items-center gap-2">
                    <span class="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </article>
            </div>
          </section>

          <section class="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/80">
            <div class="flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">模板库</p>
              <h3 class="text-2xl font-semibold text-slate-900 dark:text-white">官方布局模板</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">所有模板均内置 Tailwind 风格与暗色模式，可在 playground 中实时查看。</p>
            </div>
            <div class="mt-6 grid gap-4 md:grid-cols-3">
              <div
                v-for="template in content.templates"
                :key="template.name"
                class="rounded-2xl border border-slate-100 bg-white/70 p-4 text-sm shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <p class="text-xs uppercase tracking-widest text-slate-400">{{ template.type }}</p>
                <h4 class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{{ template.name }}</h4>
                <p class="mt-2 text-slate-500 dark:text-slate-300">{{ template.description }}</p>
                <NuxtLink
                  :to="template.link"
                  class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
                >
                  立即预览
                  <span aria-hidden="true">↗</span>
                </NuxtLink>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer class="border-t border-slate-200/60 bg-white/80 px-6 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400">
        <div class="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <p class="text-base font-semibold text-slate-900 dark:text-white">Nuxt Web Plugin</p>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">更安全、更好用的 Nuxt 模块生态。</p>
          </div>
          <div>
            <h5 class="text-xs font-semibold uppercase tracking-widest text-slate-400">产品</h5>
            <ul class="mt-2 space-y-1">
              <li>安全与加密</li>
              <li>网络封装</li>
              <li>模板中心</li>
            </ul>
          </div>
          <div>
            <h5 class="text-xs font-semibold uppercase tracking-widest text-slate-400">资源</h5>
            <ul class="mt-2 space-y-1">
              <li>文档中心</li>
              <li>示例项目</li>
              <li>社区支持</li>
            </ul>
          </div>
          <div class="space-y-2">
            <h5 class="text-xs font-semibold uppercase tracking-widest text-slate-400">联系</h5>
            <p>support@example.com</p>
            <p>© {{ currentYear }} Nuxt Web Plugin</p>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NuxtLink } from '#components'

const content = {
  navItems: [
    { label: '概览', active: true },
    { label: '模块' },
    { label: '模板' },
    { label: '文档' },
    { label: '支持' },
  ],
  quickActions: [
    { label: '查看配置示例' },
    { label: 'API 参考', to: '/docs' },
    { label: '部署指南' },
    { label: '反馈建议' },
  ],
  tags: ['安全', '网络', '模板', 'Playground', 'Tailwind', 'Nuxt 3', '暗色模式'],
  featureChips: ['零配置注入', 'Tailwind 设计语言', '暗色模式', 'Playground 即时预览', '模块化输出'],
  stats: [
    { label: '可用模块', value: '12', trend: '+3 本月新增' },
    { label: '模板数量', value: '5', trend: '两周内更新' },
    { label: '下载量', value: '14k', trend: '+18% YoY' },
    { label: '社区贡献', value: '37', trend: '活跃作者' },
  ],
  modules: [
    {
      title: 'Security & Crypto',
      category: '安全模块',
      icon: '🔐',
      description: '包含对称/非对称加密、哈希、加密存储与运行时动态配置，强化 Nuxt 应用的安全基线。',
      badge: '核心',
      points: ['AES-GCM / RSA-OAEP 封装', '统一密钥管理', 'Cookie & localStorage 加密'],
    },
    {
      title: 'Network Fabric',
      category: '网络模块',
      icon: '🛰️',
      description: '基于 `$fetch` 的统一请求层，支持超时、重试、凭证与错误归一化。',
      badge: '稳定',
      points: ['Get/Post 语法糖', '重试与超时控制', '结构化错误对象'],
    },
    {
      title: 'Layout Showcase',
      category: '模板',
      icon: '📐',
      description: '当前页面展示的布局范例，含顶栏、左右面板与 Footer，可作为产品控制台起始模板。',
      badge: 'New',
      points: ['玻璃拟态卡片', '统计面板', '模块/模板组合'],
    },
  ],
  templates: [
    {
      name: '安全与网络示例',
      type: 'Playground',
      description: '演示加密能力与统一请求封装的互动页面。',
      link: '/test',
    },
    {
      name: '插件布局展示',
      type: 'Template',
      description: '当前页面，集合头部、侧栏、内容与 Footer 的综合布局。',
      link: '/layout',
    },
  ],
  roadmap: [
    {
      phase: 'Now',
      title: '基础能力',
      description: '巩固安全、网络与模板的核心体验，提供统一设计语言。',
      points: ['暗色模式完善', 'Tailwind token', 'Playground 示例'],
    },
    {
      phase: 'Next',
      title: '模板中心',
      description: '扩展多行业模板，支持一键导出 Nuxt 页面。',
      points: ['模板下载', '可视化配置', '同步文档'],
    },
    {
      phase: 'Later',
      title: '生态集成',
      description: '开放插件 API，接入第三方主题与组件库。',
      points: ['Theme API', '社区提交', '版本管理'],
    },
  ],
  hero: {
    badgeLabel: '实时运行',
    title: '用一个插件驱动安全、网络与模板',
    description:
      '模块化注入安全加密、统一请求封装与多套官方模板，通过 playground 即可体验最新布局，所有示例都能直接复制到项目中使用。',
    primaryCta: { label: '获取插件', to: 'https://github.com' },
    secondaryCta: { label: '查看安全与网络', to: '/test' },
  },
  spotlight: {
    currentVersion: 'v1.0.1',
    currentStatus: '已同步最新功能',
    upcomingTitle: '模板管理中心',
    upcomingDescription: '预计 12 月发布',
    upcomingBadge: '即将上线',
  },
}

const currentYear = new Date().getFullYear()
const STORAGE_KEY = 'layout_dark_mode'
const isDark = ref(false)

if (process.client) {
  const stored = localStorage.getItem(STORAGE_KEY)
  isDark.value = stored ? JSON.parse(stored) : window.matchMedia('(prefers-color-scheme: dark)').matches

  watch(
    () => isDark.value,
    value => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    },
    { immediate: false },
  )
}

const wrapperClass = computed(() => (isDark.value ? 'dark' : ''))
const toggleDarkMode = () => {
  isDark.value = !isDark.value
}

const isExternal = (link?: string) => Boolean(link && /^https?:\/\//.test(link))
const showNuxtLink = (link?: string) => Boolean(link && !isExternal(link))
const resolveLinkComponent = (link?: string) => {
  if (!link) {
    return 'button'
  }
  return isExternal(link) ? 'a' : NuxtLink
}
</script>

