# 简介

**Nuxt Web Plugin** 是一个专为 Nuxt 3 设计的功能增强插件。它旨在解决日常开发中重复造轮子的痛点，将网络请求封装、SEO 管理、安全加密、通用工具、本地存储管理等高频需求集成到一个模块中。

## 核心特性

- **🛠 网络请求封装**
  - 基于 `ofetch` 的二次封装
  - 统一的错误处理与归一化
  - 支持全局拦截器与单次请求拦截器
  - 自动处理 BaseURL 和超时

- **🔍 智能 SEO 优化**
  - 提供 `useWebSeo` 组合式函数
  - 一键配置 Title, Description, Keywords
  - 自动生成 Open Graph 和 Twitter Card 标签
  - 自动处理分享图片的绝对路径补全

- **📱 设备与环境检测**
  - 提供 `useDevice` 组合式函数，支持 SSR
  - 识别 Mobile/Desktop/Tablet
  - 识别 iOS/Android/Windows/Mac
  - 识别 微信/Chrome 等特定浏览器环境

- **🧩 通用业务工具**
  - **剪贴板**: 兼容性良好的 `copyToClipboard`
  - **格式化**: 日期 `formatDate` 与金额 `formatMoney`
  - **性能**: 防抖 `debounce` 与节流 `throttle`

- **🔐 安全加密套件**
  - **对称加密**: 支持 AES-GCM 算法，适用于大段数据加密。
  - **非对称加密**: 支持 RSA-OAEP 算法，适用于密钥交换和数字签名。
  - **哈希工具**: 提供 SHA-256, SHA-512, MD5 等常用哈希计算。

- **📦 加密存储**
  - 提供 `useEncryption` 组合式函数
  - 支持 `localStorage` 的自动加密存取
  - 支持 `Cookie` 的自动加密存取
