import {useRequestHeaders} from '#app'

/**
 * 设备与环境检测组合式函数
 * 支持服务端 (User-Agent) 和客户端检测
 */
export function useDevice() {
    let userAgent = ''

    if (import.meta.server) {
        // 服务端：从请求头获取 User-Agent
        const headers = useRequestHeaders(['user-agent'])
        userAgent = headers['user-agent'] || ''
    } else {
        // 客户端：从 navigator 获取
        userAgent = navigator.userAgent
    }

    // 转换为小写以便匹配
    const ua = userAgent.toLowerCase()

    // 核心检测逻辑
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
    const isTablet = /ipad|tablet|playbook|silk/i.test(ua) || (isMobile && !/phone/i.test(ua))
    const isDesktop = !isMobile

    // 操作系统检测
    const isAndroid = /android/i.test(ua)
    const isIos = /iphone|ipad|ipod/i.test(ua)
    const isWindows = /windows/i.test(ua)
    const isMac = /macintosh|mac os x/i.test(ua)
    const isLinux = /linux/i.test(ua)

    // 浏览器环境检测
    const isWechat = /micromessenger/i.test(ua)
    const isChrome = /chrome/i.test(ua) && !/edge|edg|opr|brave/i.test(ua)
    const isFirefox = /firefox/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/chrome|android/i.test(ua)

    return {
        userAgent,
        isMobile,
        isDesktop,
        isTablet,
        os: {
            isAndroid,
            isIos,
            isWindows,
            isMac,
            isLinux,
        },
        browser: {
            isWechat,
            isChrome,
            isFirefox,
            isSafari,
        },
    }
}

