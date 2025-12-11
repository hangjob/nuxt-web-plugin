import {useRuntimeConfig, useSeoMeta, useHead} from '#app'
import type {SeoOptions} from '../types/module-options'

export interface WebSeoInput {
    /**
     * 页面标题
     */
    title?: string
    /**
     * 页面描述
     */
    description?: string
    /**
     * 分享图片 URL
     */
    image?: string
    /**
     * 页面关键词
     */
    keywords?: string
    /**
     * 页面类型 (default: 'website')
     */
    type?: 'website' | 'article' | 'profile' | string
    /**
     * 是否禁止搜索引擎索引 (noindex)
     */
    noIndex?: boolean
}

/**
 * 统一 SEO 配置助手
 * 自动合并模块配置的默认值，并处理图片绝对路径
 */
export function useWebSeo(input?: WebSeoInput) {
    const config = useRuntimeConfig()
    const seoConfig = config.public.webPlugin?.seo as SeoOptions | undefined

    if (seoConfig?.enabled === false) {
        return
    }

    const {
        title: inputTitle,
        description: inputDescription,
        image: inputImage,
        keywords: inputKeywords,
        type: inputType,
        noIndex,
    } = input || {}

    // 处理标题
    const title = inputTitle || seoConfig?.defaultTitle
    const titleTemplate = seoConfig?.titleTemplate

    // 处理描述
    const description = inputDescription || seoConfig?.defaultDescription

    // 处理图片 URL (补全域名)
    const resolveImageUrl = (url?: string) => {
        if (!url) return undefined
        if (url.startsWith('http') || url.startsWith('//')) return url
        const siteUrl = seoConfig?.siteUrl?.replace(/\/$/, '')
        if (!siteUrl) return url
        return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`
    }

    const image = resolveImageUrl(inputImage || seoConfig?.defaultImage)

    // 设置基本 Meta
    if (noIndex) {
        useHead({
            meta: [{name: 'robots', content: 'noindex, nofollow'}],
        })
    }

    if (titleTemplate) {
        useHead({
            titleTemplate,
        })
    }

    useSeoMeta({
        title,
        description,
        keywords: inputKeywords,

        // Open Graph
        ogType: inputType || 'website',
        ogTitle: title,
        ogDescription: description,
        ogImage: image,

        // Twitter Card
        twitterCard: image ? 'summary_large_image' : 'summary',
        twitterTitle: title,
        twitterDescription: description,
        twitterImage: image,
    })
}

