import {useNuxtApp, useRuntimeConfig} from '#app'
import type {ApiRequestOptions, HttpMethod, NormalizedApiError} from '../types/api-client'
import type {NetworkOptions} from '../types/module-options'

type Fetcher = typeof globalThis extends { $fetch: infer F } ? F : typeof globalThis.fetch

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

export function useApiClient() {
    const nuxtApp = useNuxtApp()
    const runtimeConfig = useRuntimeConfig()
    const networkConfig = runtimeConfig.public.webPlugin?.network as NetworkOptions | undefined

    const resolveFetcher = (): Fetcher => {
        const fetcher = (nuxtApp.$fetch ?? (globalThis as any).$fetch) as Fetcher | undefined
        if (!fetcher) {
            throw new Error('Nuxt $fetch 不可用，无法发起请求。')
        }
        return fetcher
    }

    const mergeOptions = (method: HttpMethod, options?: ApiRequestOptions): ApiRequestOptions => {
        const normalized: ApiRequestOptions = {
            ...(options ?? {}),
            method,
        }

        if (!normalized.baseURL && networkConfig?.baseURL) {
            normalized.baseURL = networkConfig.baseURL
        }

        if (typeof normalized.timeout === 'undefined' && typeof networkConfig?.timeout !== 'undefined') {
            normalized.timeout = networkConfig.timeout
        }

        if (typeof normalized.retry === 'undefined' && typeof networkConfig?.retry !== 'undefined') {
            normalized.retry = networkConfig.retry
        }

        normalized.headers = {
            ...(networkConfig?.headers ?? {}),
            ...(options?.headers ?? {}),
        }

        if (networkConfig?.withCredentials && !options?.credentials) {
            normalized.credentials = 'include' // 无论是否跨域都携带cookie
        }

        return normalized
    }

    const request = async <T>(url: string, options?: ApiRequestOptions): Promise<T> => {
        if (networkConfig?.enabled === false) {
            console.warn('[useApiClient] 当前网络封装已被禁用，但仍尝试发起请求。')
        }

        const method = (options?.method ?? 'GET').toUpperCase()
        if (!HTTP_METHODS.includes(method as HttpMethod)) {
            throw new Error(`[useApiClient] 不支持的请求方法: ${method}`)
        }

        const fetcher = resolveFetcher()
        const finalOptions = mergeOptions(method as HttpMethod, options)

        try {
            // @ts-ignore
            return await (fetcher as any)<T>(url, finalOptions)
        } catch (error) {
            const normalized = normalizeError(error)
            console.error('[useApiClient] 请求失败:', normalized)
            throw normalized
        }
    }

    const createMethod = (method: HttpMethod) => {
        return <T>(url: string, options?: ApiRequestOptions) => request<T>(url, {...options, method})
    }

    return {
        request,
        get: createMethod('GET'),
        post: createMethod('POST'),
        put: createMethod('PUT'),
        patch: createMethod('PATCH'),
        del: createMethod('DELETE'),
    }
}

const normalizeError = (error: unknown): NormalizedApiError => {
    if (error && typeof error === 'object') {
        const err = error as Record<string, unknown>
        if ('statusCode' in err || 'statusMessage' in err || 'data' in err) {
            return {
                statusCode: err.statusCode as number | undefined,
                statusMessage: err.statusMessage as string | undefined,
                data: err.data,
                message: (err.message as string) || '请求失败',
                cause: error,
            }
        }
    }

    return {
        message: error instanceof Error ? error.message : '请求失败',
        cause: error,
    }
}

