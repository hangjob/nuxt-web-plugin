export default defineNuxtConfig({
    modules: ['@nuxtjs/tailwindcss', '../dist/module.mjs'],
    devtools: {enabled: false},
    css: ['~/assets/css/tailwind.css'],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    webPlugin: {
        security: {
            crypto: {
                symmetric: true,
                asymmetric: true,
                hash: true,
            },
            encryption: {
                enabled: true,
                storage: true,
            },
        },
        network: {
            enabled: true,
            baseURL: 'https://jsonplaceholder.typicode.com',
            timeout: 8000,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: false,
            retry: 1,
        },
        layout: {
            theme: {
                content: {
                    hero: {
                        title: '我的插件控制台',
                        primaryCta: {label: '立即体验', to: 'http://localhost:4173'},
                    },
                },
                // componentPath: './components/MyTheme.vue' // 完全自定义时启用
            },
            demoPage: {enabled: true, route: '/layout'},
        },
    },
    runtimeConfig: {
        sing: '123',
    },
    nitro: {
        routeRules: {
            '/**': {
                headers: {
                    // 设置请求头
                    'Cache-Control': 'public, max-age=3600', // 1小时缓存
                    'CDN-Cache-Control': 'public, max-age=86400' // CDN 缓存1天
                }
            }
        }
    }
})
