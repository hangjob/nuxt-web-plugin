# 页面水印

`useWatermark` 提供了在页面上覆盖全屏水印的能力，支持自定义文本、颜色与旋转角度，并内置了简单的防篡改机制（防止通过 F12 删除 DOM 节点）。

## 基础用法

通常在 `app.vue` 或 `layouts/default.vue` 中调用，以实现全局覆盖。

```vue
<script setup lang="ts">
const { setWatermark, clearWatermark } = useWatermark()

onMounted(() => {
  setWatermark({
    text: 'Nuxt Web Plugin - 内部专用',
    color: 'rgba(0, 0, 0, 0.1)'
  })
})

// 可选：在特定条件下清除
// clearWatermark()
</script>
```

## API 参考

### `setWatermark(options)`

设置全屏水印。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `text` | `string` | **必填** | 水印显示的文本内容 |
| `fontSize` | `number` | `16` | 字体大小 (px) |
| `color` | `string` | `rgba(200, 200, 200, 0.30)` | 字体颜色，支持 hex/rgba |
| `rotate` | `number` | `-20` | 旋转角度 (deg) |
| `gap` | `[number, number]` | `[100, 100]` | 水印之间的水平与垂直间距 |
| `zIndex` | `number` | `9999` | DOM 节点的层级 |

### `clearWatermark()`

清除当前页面上的水印节点，并停止防篡改监控。

## 防篡改机制

插件内部使用 `MutationObserver` 监听 DOM 变化：
- 如果水印节点被手动删除，插件会立即重新插入。
- 如果水印节点的样式（如 `display: none` 或 `opacity: 0`）被修改，插件会强制恢复默认样式。

