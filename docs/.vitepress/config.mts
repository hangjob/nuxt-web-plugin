import {defineConfig} from 'vitepress'

export default defineConfig({
    title: "Nuxt Web Plugin",
    description: "功能强大的 Nuxt 3 插件，集成网络请求与安全套件",
    // GitHub Pages 部署时的基础路径（与仓库名保持一致）
    base: "/nuxt-web-plugin/",
    head: [
        ['link', {rel: 'icon', href: '/logo.svg'}]
    ],

    themeConfig: {
        logo: '/logo.svg',

        nav: [
            {text: '指南', link: '/guide/introduction'},
            {text: 'API 参考', link: '/guide/network'},
        ],

        sidebar: [
            {
                text: '开始',
                items: [
                    {text: '简介', link: '/guide/introduction'},
                    {text: '安装', link: '/guide/installation'},
                    {text: '配置', link: '/guide/configuration'},
                    {text: '自动化部署', link: '/guide/deploy'},
                ]
            },
            {
                text: '核心功能',
                items: [
                    {text: '网络请求', link: '/guide/network'},
                    {text: 'SEO 优化', link: '/guide/seo'},
                    {text: '页面水印', link: '/guide/watermark'},
                    {text: '设备检测', link: '/guide/device'},
                    {text: '通用工具', link: '/guide/utils'},
                    {text: '安全加密', link: '/guide/security'},
                ]
            },
            {
                text: '高级开发',
                items: [
                    {text: '中间件 (Middleware)', link: '/advanced/middleware'},
                    {text: '生命周期钩子', link: '/advanced/lifecycle'},
                ]
            }
        ],

        socialLinks: [
            {icon: 'github', link: 'https://github.com/hangjob/nuxt-web-plugin'}
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2025-present'
        }
    }
})
