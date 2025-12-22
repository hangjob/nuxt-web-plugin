# 自动化部署

本项目使用 GitHub Actions 实现了 VitePress 文档的自动化构建与部署。每当 `main` 分支有代码更新时，系统会自动触发工作流，将最新生成的静态文档发布到 GitHub Pages。

## 工作流配置文件

配置文件位于 `.github/workflows/docs.yml`，主要流程如下：

1.  **触发条件**：
    - 监听 `main` 分支的 `push` 事件。
    - 支持手动触发 (`workflow_dispatch`)。

2.  **环境准备**：
    - 运行于 `ubuntu-latest` 环境。
    - 使用 `pnpm` 包管理器。
    - 设置 Node.js 版本（目前为 v22，确保兼容性）。

3.  **构建步骤**：
    - **检出代码**：使用 `actions/checkout@v4`。
    - **安装依赖**：运行 `pnpm install`。
    - **预构建**：运行 `pnpm run dev:prepare`。这一步非常关键，因为它会生成 Nuxt 必需的 `.nuxt` 目录和类型定义，防止 VitePress 在引用 Nuxt 模块时因缺少类型文件而报错。
    - **构建文档**：运行 `pnpm docs:build`，生成静态文件至 `docs/.vitepress/dist`。

4.  **部署**：
    - 使用 `peaceiris/actions-gh-pages@v3` 插件。
    - 将构建产物 (`docs/.vitepress/dist`) 推送到 `gh-pages` 分支。
    - 使用 `force_orphan: true` 确保发布分支保持清洁。

## 配置参考

完整的 workflow 配置文件内容如下：

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
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
          node-version: 22

      - name: Install deps
        run: pnpm install --no-frozen-lockfile

      - name: Prepare Nuxt
        run: pnpm run dev:prepare # 关键步骤：修复类型引用

      - name: Build docs
        run: pnpm docs:build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
          publish_branch: gh-pages
          force_orphan: true
```

## 启用 Pages

要使部署生效，你需要在 GitHub 仓库设置中开启 Pages 功能：

1.  进入仓库 **Settings** -> **Pages**。
2.  在 **Build and deployment** 下的 Source 选择 **Deploy from a branch**。
3.  Branch 选择 `gh-pages`，文件夹选择 `/ (root)`。
4.  保存后，等待几分钟即可访问你的文档站点。

