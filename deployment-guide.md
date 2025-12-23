# Nuxt 3 项目自动化部署到宝塔服务器全攻略 (GitHub Actions + rsync)

本指南详细介绍了如何利用 GitHub Actions 持续集成工具，将 Nuxt 3 项目（静态生成 SSG 模式）自动化部署到宝塔面板服务器。

- **🚀 演示地址**: [http://nuxt.haiwb.com/](http://nuxt.haiwb.com/)
- **📖 项目文档**: [https://hangjob.github.io/nuxt-web-plugin/](https://hangjob.github.io/nuxt-web-plugin/)

---

## 插件介绍

`nuxt-web-plugin` 是一款面向 **Nuxt 3/4** 的全能增强插件，旨在提升开发体验（DX）并为应用提供坚实的基础能力。

### 核心特性：
- **🔐 深度安全防护**: 集成 AES-GCM 对称加密、RSA 非对称加密及 SHA-256 哈希算法，支持加密存储（Storage/Cookie）。
- **🛰️ 智能请求封装**: 基于 `$fetch` 的统一网络层，内置 **自动去重 (Dedupe)**、**短时缓存 (Cache)** 和 **并发锁 (Lock)**，有效防止重复请求。
- **🖼️ 页面水印系统**: 动态 Canvas 水印，支持防篡改监测（Anti-Tamper），保护页面内容版权。
- **🔍 SEO & 设备检测**: 自动元标签生成与移动端/平板/桌面端精准识别。
- **🎨 玻璃拟态布局**: 内置一套现代化的插件控制台模板，完美支持 Tailwind 暗色模式。

---

## 一、 准备工作

### 1.1 服务器环境
- 确保服务器已安装 **宝塔面板**。
- 在宝塔面板中创建一个 **静态网站**（或 PHP 网站，但我们只需其静态能力）。
- 记住你的网站根目录，例如：`/www/wwwroot/nuxt.haiwb.com`。

### 1.2 生成 SSH 密钥对
在你的本地终端或服务器执行以下命令（建议在服务器执行）：

```bash
# 生成密钥对 (ed25519 算法更安全且简短)
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

1.  **公钥 (`.pub`)**: 将内容复制并添加到服务器的 `~/.ssh/authorized_keys` 文件中。
2.  **私钥**: 将内容完整复制，下一步使用。

---

## 二、 GitHub 仓库配置

进入你的 GitHub 项目仓库，点击 `Settings -> Secrets and variables -> Actions`，点击 `New repository secret` 添加以下变量：

| 变量名 | 说明 | 示例值 |
| :--- | :--- | :--- |
| `SERVER_SSH_KEY` | 刚才生成的 **私钥** 内容 | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `SERVER_HOST` | 服务器公网 IP 或域名 | `1.2.3.4` 或 `nuxt.haiwb.com` |
| `SERVER_USER` | SSH 登录名 | `root` (建议使用有权限的普通用户) |
| `SERVER_TARGET` | 宝塔面板中的网站根目录 | `/www/wwwroot/nuxt.haiwb.com` |

---

## 三、 编写工作流文件

在项目根目录创建 `.github/workflows/deploy-playground.yml` 文件：

```yaml
name: Deploy Playground to Baota

on:
  push:
    branches: [main] # 仅在代码推送到 main 分支时触发
  workflow_dispatch:  # 支持在 GitHub Actions 页面手动点击运行

jobs:
  deploy-to-baota:
    name: Upload to Server
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: false

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24 # 关键：Node 版本需匹配项目要求 (v24.4.1+)
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --no-frozen-lockfile

      - name: Build Playground (Static)
        run: |
          # 准备模块环境
          pnpm run dev:prepare
          cd playground
          # 生成静态文件 (SSG)
          npx nuxi generate 
          echo "Build Output Check:"
          ls -R .output/public/ # 打印构建结果，方便排查路径问题

      - name: Deploy to Server
        uses: easingthemes/ssh-deploy@main
        with:
          # SSH 私钥
          SSH_PRIVATE_KEY: ${{ secrets.SERVER_SSH_KEY }}
          # 远程主机信息
          REMOTE_HOST: ${{ secrets.SERVER_HOST }}
          REMOTE_USER: ${{ secrets.SERVER_USER }}
          TARGET: ${{ secrets.SERVER_TARGET }}
          # 部署源目录 (Nuxt 3 SSG 产物路径)
          SOURCE: "playground/.output/public/"
          # rsync 参数: r(递归), l(链接), g(组), o(所有者), D(设备), z(压缩), v(详细), c(校验), --delete(删除多余文件)
          ARGS: "-rlgoDzvc -i --delete"
          # 关键排坑：排除服务器系统锁定的文件，否则会报 Operation not permitted (rsync code 23)
          EXCLUDE: "/.user.ini, /.htaccess, /.well-known/, /cgi-bin/"
```

---

## 四、 核心避坑指南 (Troubleshooting)

### 4.1 Node 引擎版本报错
**错误信息**: `Unsupported engine: wanted: {"node":">=24.4.1"}`
**原因**: 项目 `package.json` 限制了高版本 Node，而 GitHub Actions 默认环境较低。
**对策**: 在 `actions/setup-node` 步骤中明确指定 `node-version: 24`。

### 4.2 预渲染死链报错
**错误信息**: `Exiting due to prerender errors`
**原因**: Nuxt 3 在 `generate` 过程中会检查所有链接，如果发现指向 `/docs` 等不存在的内部路径会报错。
**对策**: 
1. 在 `nuxt.config.ts` 中配置 `nitro: { prerender: { failOnError: false } }`。
2. 将外部链接或独立部署的链接改为绝对路径（如 `https://...`）。

### 4.3 rsync exited with code 23
**错误信息**: `unlink(.user.ini) failed: Operation not permitted (1)`
**原因**: 宝塔面板会自动在网站目录创建 `.user.ini` 并锁定（`i` 权限）。`rsync` 尝试删除该文件以便同步时会被拦截。
**对策**: 在部署脚本中使用 `EXCLUDE` 配置将其排除掉。

---

## 五、 Nginx 伪静态设置 (非常重要)

为了让 Nuxt 的客户端路由正常工作，请在宝塔面板的网站设置 -> **伪静态** 中添加以下内容：

```nginx
location / {
  # 优先寻找文件和目录，找不到则 fallback 到 index.html 让 Vue 处理路由
  try_files $uri $uri/ /index.html;
}
```

---

## 六、 总结

通过以上配置，你可以实现代码推送即自动更新线上环境。每次提交后，只需前往 GitHub 的 **Actions** 面板查看进度。如果看到绿色的勾，恭喜你，部署成功！

