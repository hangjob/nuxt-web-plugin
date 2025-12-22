import { onMounted, onUnmounted, ref } from 'vue'

export interface WatermarkOptions {
  /**
   * 水印文案
   */
  text: string
  /**
   * 字体大小 (px), 默认 16
   */
  fontSize?: number
  /**
   * 字体颜色, 默认 'rgba(200, 200, 200, 0.30)'
   */
  color?: string
  /**
   * 旋转角度 (deg), 默认 -20
   */
  rotate?: number
  /**
   * z-index 层级, 默认 9999
   */
  zIndex?: number
  /**
   * 间距 [x, y], 默认 [100, 100]
   */
  gap?: [number, number]
  /**
   * 是否在组件销毁时清除水印, 默认 true
   */
  clearOnUnmount?: boolean
}

/**
 * 页面水印组合式函数
 * 使用 Canvas 生成平铺水印，并带有防篡改机制（MutationObserver）
 */
export function useWatermark() {
  const id = 'nuxt-web-plugin-watermark'
  const watermarkRef = ref<HTMLElement | null>(null)
  let observer: MutationObserver | null = null

  const createWatermarkUrl = ({
    text,
    fontSize = 16,
    color = 'rgba(200, 200, 200, 0.30)',
    rotate = -20,
    gap = [100, 100]
  }: WatermarkOptions) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const ratio = window.devicePixelRatio || 1

    const config = {
      text,
      fontSize: fontSize * ratio,
      font: `${fontSize * ratio}px sans-serif`,
      rotate,
      gap: gap.map(v => v * ratio) as [number, number]
    }

    // 计算单个水印内容的宽高
    if (ctx) {
      ctx.font = config.font
      const measure = ctx.measureText(config.text)
      const width = measure.width
      const height = config.fontSize
      
      // 画布大小 = 内容大小 + 间距
      const canvasWidth = width + config.gap[0]
      const canvasHeight = height + config.gap[1]
      
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      
      ctx.translate(canvasWidth / 2, canvasHeight / 2)
      ctx.rotate((Math.PI / 180) * config.rotate)
      ctx.fillStyle = color
      ctx.font = config.font
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(config.text, 0, 0)
    }

    return canvas.toDataURL('image/png')
  }

  const setWatermark = (options: WatermarkOptions) => {
    if (!import.meta.client) return

    const url = createWatermarkUrl(options)
    const container = document.body

    // 检查是否已存在
    let div = document.getElementById(id)
    if (!div) {
      div = document.createElement('div')
      div.id = id
      div.style.pointerEvents = 'none'
      div.style.top = '0px'
      div.style.left = '0px'
      div.style.position = 'fixed'
      div.style.zIndex = (options.zIndex || 9999).toString()
      div.style.width = '100%'
      div.style.height = '100%'
      div.style.backgroundRepeat = 'repeat'
      container.appendChild(div)
      watermarkRef.value = div
    }

    div.style.backgroundImage = `url(${url})`

    // 防篡改监控
    if (observer) {
      observer.disconnect()
    }

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // 如果被删除或属性被修改，重新生成
        if (
          mutation.type === 'childList' &&
          Array.from(mutation.removedNodes).some((node) => node === div)
        ) {
          container.appendChild(div as Node)
        }
        if (
          mutation.type === 'attributes' &&
          mutation.target === div
        ) {
          // 恢复关键样式
          div!.style.display = 'block'
          div!.style.visibility = 'visible'
          div!.style.opacity = '1'
          div!.style.backgroundImage = `url(${url})`
          div!.style.width = '100%'
          div!.style.height = '100%'
        }
      })
    })

    observer.observe(container, {
      childList: true,
      attributes: true,
      subtree: true
    })
  }

  const clearWatermark = () => {
    if (!import.meta.client) return
    
    if (observer) {
      observer.disconnect()
      observer = null
    }

    const div = document.getElementById(id)
    if (div && div.parentNode) {
      div.parentNode.removeChild(div)
    }
  }

  // 默认在组件销毁时清除，除非 clearOnUnmount 为 false
  // 注意：如果是全局单例水印，调用时需注意不要在 layout 或 page 的 onUnmounted 中误删
  onUnmounted(() => {
    // 可以在这里加逻辑判断，目前由调用者手动 clear 或自行封装
  })

  return {
    setWatermark,
    clearWatermark
  }
}

