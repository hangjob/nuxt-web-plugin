# Nuxt 3 开发提效指南：我封装了一个“瑞士军刀”级插件，并顺手搞定了自动化部署

> 在 Nuxt 3 的开发过程中，我们经常会遇到一些重复性的工作：封装 Fetch 请求、处理 AES/RSA 加密、配置 SEO Meta、判断设备类型等等。虽然社区有很多优秀的库，但每次新开项目都要重新把这些库集成一遍，还是略显繁琐。
>
> 于是，我开发了 **nuxt-web-plugin**，一个集成了网络请求、安全加密、SEO 优化、设备检测等常用功能的 Nuxt 3 插件，旨在让开发变得更简单、更高效。
>
> **GitHub 仓库**：[https://github.com/hangjob/nuxt-web-plugin](https://github.com/hangjob/nuxt-web-plugin)  
> **在线文档**：[https://hangjob.github.io/nuxt-web-plugin/](https://hangjob.github.io/nuxt-web-plugin/)

## 🚀 为什么需要这个插件？

在实际业务开发中，我们往往需要解决以下痛点：
1.  **API 请求繁琐**：原生 `useFetch` 虽然好用，但缺乏统一的拦截器、错误处理和 Token 自动注入。
2.  **数据安全焦虑**：前后端交互敏感数据（如密码、手机号）裸奔，手动引入 `crypto-js` 或 `jsencrypt` 体积大且配置麻烦。
3.  **SEO 配置重复**：每个页面都要手写 `useHead`，不仅累还容易漏掉 Open Graph 标签。
4.  **设备适配麻烦**：需要手动解析 User-Agent 来判断是移动端还是 PC 端，或者是否在微信环境内。

`nuxt-web-plugin` 就是为了解决这些问题而生的。它不是一个臃肿的 UI 库，而是一套轻量级的**业务逻辑增强套件**。

## ✨ 核心功能一览

### 1. 优雅的网络请求 (`useApiClient`)

基于 Nuxt `useFetch` 的深度封装，支持全局拦截器、自动携带 Token、统一错误处理。

```typescript
const api = useApiClient()

// GET 请求
const { data } = await api.get('/user/profile')

// POST 请求（自动处理 Content-Type）
await api.post('/auth/login', { body: { username, password } })
```

在 `nuxt.config.ts` 中简单配置即可生效：

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-web-plugin'],
  webPlugin: {
    network: {
      baseURL: 'https://api.example.com',
      timeout: 10000
    }
  }
})
```

### 2. 开箱即用的安全加密 (`useCrypto`, `useWebUtils`)

内置了 AES 对称加密、RSA 非对称加密和 Hash 哈希计算，无需额外安装依赖。

```typescript
const { encrypt, decrypt } = useSymmetricCrypto() // AES
const { encrypt: rsaEncrypt } = useAsymmetricCrypto() // RSA
const { hash } = useHash() // MD5, SHA-256

// 示例：登录密码加密
const encryptedPassword = rsaEncrypt(password)
// 示例：本地存储敏感数据
const secureData = encrypt(userData)
```

### 3. 懒人版 SEO 优化 (`useWebSeo`)

一行代码搞定 Title、Description、Keywords 以及 Open Graph 社交分享卡片。

```typescript
useWebSeo({
  title: '我的文章标题',
  description: '这是一篇关于 Nuxt 3 插件的介绍文章',
  image: '/cover.png' // 自动转换为绝对路径
})
```

### 4. 设备与环境检测 (`useDevice`)

在 SSR 和客户端均可准确识别设备类型。

```typescript
const { isMobile, isDesktop, isWeChat, isIOS } = useDevice()

if (isMobile) {
  // 加载移动端组件
}
```

---

## 🛠️ 附加技能：如何使用 GitHub Actions 自动部署文档

在这个项目的开发过程中，我使用了 **VitePress** 编写文档，并利用 **GitHub Actions** 实现了自动化部署到 GitHub Pages。这里分享一下我的踩坑经验和最终方案。

### 1. 准备 VitePress

首先，确保你的文档项目（通常在 `docs` 目录）能正常 build。

在 `docs/.vitepress/config.mts` 中，**最关键的一步**是设置 `base` 路径，必须与你的 GitHub 仓库名一致：

```typescript
export default defineConfig({
  // 如果仓库地址是 https://github.com/hangjob/nuxt-web-plugin
  // 那么 base 必须是 /nuxt-web-plugin/
  base: '/nuxt-web-plugin/', 
  // ...
})
```

### 2. 配置 GitHub Actions

在项目根目录创建 `.github/workflows/docs.yml`。

**遇到的坑**：
1.  **权限不足**：GitHub Actions 默认只有只读权限，无法推送到 `gh-pages` 分支。需要在仓库 `Settings -> Actions -> General -> Workflow permissions` 中开启 `Read and write permissions`。
2.  **pnpm 找不到**：Actions 环境默认没有 pnpm，需要专门安装。
3.  **锁文件问题**：如果不想提交 `pnpm-lock.yaml`，安装依赖时不能用 `--frozen-lockfile`。

**最终可用的配置（亲测有效）**：

```yaml
name: Deploy Docs

on:
  push:
    branches: [main] # 推送 main 分支时触发

permissions:
  contents: write # 显式赋予写权限

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # 1. 安装 pnpm
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: false

      # 2. 设置 Node 环境 (推荐 LTS v20 或 v22)
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm # 如果提交了锁文件，可以用这个加速

      # 3. 安装依赖 (无锁文件模式)
      - name: Install deps
        run: pnpm install --no-frozen-lockfile

      # 4. 解决 Nuxt 特有的构建问题 (生成 .nuxt 目录)
      - name: Prepare Nuxt
        run: pnpm run dev:prepare 

      # 5. 构建文档
      - name: Build docs
        run: pnpm docs:build

      # 6. 发布到 gh-pages 分支
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```

### 3. 享受自动化

配置完成后，每次 `git push`，GitHub Actions 就会自动帮你构建文档并发布。你可以通过 `https://<username>.github.io/<repo-name>/` 访问你的文档站点。

---

## 💡 结语

**nuxt-web-plugin** 目前还在持续迭代中，希望能为你的 Nuxt 开发之旅减少一些重复劳动。如果你觉得有用，欢迎来 GitHub 点个 Star ⭐️！

同时也希望这篇关于自动化部署的分享能帮到你，少走一些弯路。

👉 **GitHub**: [https://github.com/hangjob/nuxt-web-plugin](https://github.com/hangjob/nuxt-web-plugin)

