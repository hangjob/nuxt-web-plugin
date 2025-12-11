/**
 * 通用业务工具组合式函数
 */
export function useWebUtils() {
    /**
     * 复制文本到剪贴板
     * @param text 要复制的文本
     * @returns Promise<boolean> 是否复制成功
     */
    const copyToClipboard = async (text: string): Promise<boolean> => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text)
                return true
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea')
                textArea.value = text
                textArea.style.position = 'fixed'
                textArea.style.left = '-9999px'
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                const successful = document.execCommand('copy')
                document.body.removeChild(textArea)
                return successful
            }
        } catch (err) {
            console.error('Failed to copy text: ', err)
            return false
        }
    }

    /**
     * 格式化日期
     * @param date Date 对象或时间戳
     * @param format 格式字符串 (default: 'YYYY-MM-DD HH:mm:ss')
     * Supported tokens: YYYY, MM, DD, HH, mm, ss
     */
    const formatDate = (date: Date | number | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
        const d = new Date(date)
        if (isNaN(d.getTime())) return ''

        const pad = (n: number) => n.toString().padStart(2, '0')

        const map: Record<string, string> = {
            YYYY: d.getFullYear().toString(),
            MM: pad(d.getMonth() + 1),
            DD: pad(d.getDate()),
            HH: pad(d.getHours()),
            mm: pad(d.getMinutes()),
            ss: pad(d.getSeconds()),
        }

        return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => map[match])
    }

    /**
     * 格式化金额
     * @param amount 金额数值
     * @param decimals 小数位数 (default: 2)
     * @param currency 货币符号 (default: '¥')
     */
    const formatMoney = (amount: number | string, decimals: number = 2, currency: string = '¥'): string => {
        const num = Number(amount)
        if (isNaN(num)) return `${currency}0.00`

        return `${currency}${num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    }

    /**
     * 创建防抖函数
     * @param fn 要执行的函数
     * @param delay 延迟时间 (ms)
     */
    const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number = 300) => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null

        return (...args: Parameters<T>) => {
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                fn(...args)
            }, delay)
        }
    }

    /**
     * 创建节流函数
     * @param fn 要执行的函数
     * @param limit 时间限制 (ms)
     */
    const throttle = <T extends (...args: any[]) => any>(fn: T, limit: number = 300) => {
        let inThrottle: boolean
        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                fn(...args)
                inThrottle = true
                setTimeout(() => (inThrottle = false), limit)
            }
        }
    }

    return {
        copyToClipboard,
        formatDate,
        formatMoney,
        debounce,
        throttle,
    }
}

