import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Nuxt Web Plugin",
  description: "功能强大的 Nuxt 3 插件，集成网络请求与安全套件",
  
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API 参考', link: '/guide/network' },
    ],

    sidebar: [
      {
        text: '开始',
        items: [
          { text: '简介', link: '/guide/introduction' },
          { text: '安装', link: '/guide/installation' },
          { text: '配置', link: '/guide/configuration' },
        ]
      },
      {
        text: '核心功能',
        items: [
          { text: '网络请求', link: '/guide/network' },
          { text: 'SEO 优化', link: '/guide/seo' },
          { text: '设备检测', link: '/guide/device' },
          { text: '通用工具', link: '/guide/utils' },
          { text: '安全加密', link: '/guide/security' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/my-module' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present'
    }
  }
})
