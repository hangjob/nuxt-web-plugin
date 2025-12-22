import {addImports, createResolver, defineNuxtModule, useLogger} from '@nuxt/kit'
import type {Nuxt} from '@nuxt/schema'
import {defu} from 'defu'
import {FUNCTION_SERIALIZE_PREFIX} from './runtime/constants'
import type {ModuleOptions} from './runtime/types/module-options'

type Resolver = ReturnType<typeof createResolver>
type CryptoOptions = NonNullable<NonNullable<ModuleOptions['security']>['crypto']>

const defaults: ModuleOptions = {
    security: {
        crypto: {
            symmetric: true,
            asymmetric: true,
            hash: true,
            keySize: 256,
            algorithm: 'AES-GCM',
        },
        encryption: {
            enabled: true,
            storage: true,
            cookies: true,
        },
    },
    network: {
        enabled: true,
        baseURL: '',
        timeout: 15000,
        headers: {},
        withCredentials: false,
        retry: 0,
    },
    seo: {
        enabled: true,
        siteUrl: '',
        titleTemplate: '%s',
        defaultTitle: '',
        defaultDescription: '',
        defaultImage: '',
    },
    utils: {
        enabled: true,
    },
    device: {
        enabled: true,
    },
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: 'nuxt-web-plugin',
        configKey: 'webPlugin',
        compatibility: {
            nuxt: '^3.0.0 || ^4.0.0',
        },
    },
    defaults,
    async setup(options, nuxt) {
        const resolver = createResolver(import.meta.url)
        const logger = useLogger('nuxt-web-plugin')

        const mergedOptions = defu(options, defaults) as Required<ModuleOptions>

        // 基础配置检查 (DX)
        if (mergedOptions.network?.enabled && !mergedOptions.network.baseURL) {
            logger.warn('已启用网络模块，但未检测到 [network.baseURL] 配置，请求可能无法正常工作。')
        }
        if (mergedOptions.security?.encryption?.enabled && !mergedOptions.security?.crypto?.symmetric) {
            logger.warn('已启用加密存储，但检测到禁用了 [symmetric] 对称加密，这可能会导致功能异常。')
        }

        const sanitizedOptions = sanitizeConfig(mergedOptions)

        setRuntimeConfig(nuxt, sanitizedOptions)
        setModuleOptionsSnapshot(nuxt, sanitizedOptions)

        registerCryptoComposables(mergedOptions.security?.crypto, resolver)
        registerNetworkComposable(resolver)
        registerSeoComposable(resolver)
        registerUtilsComposable(resolver)
        registerWatermarkComposable(resolver)
        registerDeviceComposable(resolver)
        registerTypeDefinitions(nuxt, resolver)

        logger.success('nuxt-web-plugin 初始化完成！')
    },
})

const setRuntimeConfig = (nuxt: Nuxt, configData: ModuleOptions) => {
    if (!nuxt.options.runtimeConfig.public) {
        nuxt.options.runtimeConfig.public = {} as typeof nuxt.options.runtimeConfig.public
    }

    const publicConfig = nuxt.options.runtimeConfig.public as Record<string, unknown>
    publicConfig.webPlugin = configData
}

const setModuleOptionsSnapshot = (nuxt: Nuxt, configData: ModuleOptions) => {
    const options = nuxt.options as Nuxt['options'] & { webPlugin?: ModuleOptions }
    options.webPlugin = configData
}

const registerCryptoComposables = (
    cryptoOptions: CryptoOptions | undefined,
    resolver: Resolver,
) => {
    if (!cryptoOptions) {
        return
    }
    addImports([
        {name: 'useSymmetricCrypto', from: resolver.resolve('./runtime/composables/useCrypto')},
        {name: 'useAsymmetricCrypto', from: resolver.resolve('./runtime/composables/useCrypto')},
        {name: 'useHash', from: resolver.resolve('./runtime/composables/useCrypto')},
        {name: 'useEncryption', from: resolver.resolve('./runtime/composables/useCrypto')},
    ])
}

const registerNetworkComposable = (resolver: Resolver) => {
    addImports([{name: 'useApiClient', from: resolver.resolve('./runtime/composables/useApiClient')}])
}

const registerSeoComposable = (resolver: Resolver) => {
    addImports([{name: 'useWebSeo', from: resolver.resolve('./runtime/composables/useWebSeo')}])
}

const registerUtilsComposable = (resolver: Resolver) => {
    addImports([{name: 'useWebUtils', from: resolver.resolve('./runtime/composables/useWebUtils')}])
}

const registerWatermarkComposable = (resolver: Resolver) => {
    addImports([{name: 'useWatermark', from: resolver.resolve('./runtime/composables/useWatermark')}])
}

const registerDeviceComposable = (resolver: Resolver) => {
    addImports([{name: 'useDevice', from: resolver.resolve('./runtime/composables/useDevice')}])
}

const registerTypeDefinitions = (nuxt: Nuxt, resolver: Resolver) => {
    nuxt.hook('prepare:types', ({references}) => {
        references.push({path: resolver.resolve('./types')})
    })
}

const sanitizeConfig = <T>(config: T): T => {
    return JSON.parse(
        JSON.stringify(
            config,
            (_, value) =>
                typeof value === 'function' ? `${FUNCTION_SERIALIZE_PREFIX}${value.toString()}` : value,
        ),
    ) as T
}
