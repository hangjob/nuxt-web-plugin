# 宝塔面板 + GitHub 自动化部署指南

对于使用宝塔面板 (BT) 的开发者，结合 **GitHub Actions** 可以实现一套非常顺畅的自动化部署流程：只需 `git push`，GitHub 就会自动构建项目并将产物同步到你的宝塔服务器上。

## 1. 服务器环境准备

在开始之前，请确保您的宝塔面板已满足以下条件：

*   **网站环境**：已创建一个“纯静态”站点（用于托管 Playground 的静态产物）。
*   **SSH 服务**：确保宝塔面板 -> 安全 -> SSH 管理中，“SSH服务”已开启，且防火墙已放行 22 端口。
*   **Node.js 环境**：建议在宝塔面板安装“Node.js 版本管理器”，并安装 v24.4.1 或更高版本。

---

## 2. SSH 免密登录配置 (关键)

为了让 GitHub Actions 能够免密登录你的服务器进行文件传输，必须配置 SSH 密钥对。

### A. 生成 SSH Key
在你的**本地电脑**终端执行：
```bash
# 生成 ed25519 密钥（一直按回车，不要设置密码）
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

### B. 配置服务器受信列表
你需要把生成的公钥内容（通常是 `~/.ssh/id_ed25519.pub`）添加到服务器的信任列表中：
1.  复制公钥内容。
2.  登录服务器，执行：`cat >> ~/.ssh/authorized_keys`，粘贴内容并回车。
3.  **设置权限**（极其重要）：
    ```bash
    chmod 700 ~/.ssh
    chmod 600 ~/.ssh/authorized_keys
    ```

### C. 如何查看密钥内容
如果你需要查看已经生成的密钥（例如为了复制到 GitHub Secrets），请在终端执行：

#### 查看私钥 (用于 GitHub Secrets)
```bash
# 本地或服务器执行（取决于你在哪生成的）
cat ~/.ssh/id_ed25519
```
> **注意**：请务必完整复制从 `-----BEGIN...` 到 `-----END...` 的所有内容。

#### 查看公钥 (用于添加到服务器)
```bash
cat ~/.ssh/id_ed25519.pub
```

#### 查看服务器已有的信任列表
```bash
# 在服务器上执行
cat ~/.ssh/authorized_keys
```

---

## 3. 配置 GitHub Secrets

GitHub 为了安全，不会直接在代码中显示敏感信息。你需要进入项目仓库 -> **Settings** -> **Secrets and variables** -> **Actions**，点击 **New repository secret** 添加以下变量：

| Secret 名称 | 说明 | 示例值 |
| --- | --- | --- |
| `SERVER_HOST` | 服务器公网 IP 地址 | `1.2.3.4` |
| `SERVER_USER` | SSH 登录用户名 | `root` |
| `SERVER_SSH_KEY` | 刚才生成的**私钥**全文 (`id_ed25519`) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_TARGET` | 宝塔站点的**绝对路径** | `/www/wwwroot/demo.yourdomain.com` |

---

## 4. 自动化脚本 (Workflow)

在项目根目录创建 `.github/workflows/deploy-playground.yml`：

```yaml
name: Deploy Playground

on:
  push:
    branches: [main]
    paths:
      - 'playground/**'
      - 'src/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24

      - name: Install & Build
        run: |
          pnpm install --no-frozen-lockfile
          pnpm run dev:prepare
          cd playground
          pnpm generate

      - name: Deploy to BT Server
        uses: easingthemes/ssh-deploy@main
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SERVER_SSH_KEY }}
          ARGS: "-rlgoDzvc -i --delete"
          SOURCE: "playground/.output/public/"
          REMOTE_HOST: ${{ secrets.SERVER_HOST }}
          REMOTE_USER: ${{ secrets.SERVER_USER }}
          TARGET: ${{ secrets.SERVER_TARGET }}
```

---

## 5. 域名访问与 Nginx 配置

由于 Nuxt (SSG) 默认使用路由 History 模式，刷新页面可能会出现 404。

在宝塔面板 -> 网站 -> 对应站点设置 -> **配置文件** 或 **伪静态** 中添加：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 6. 常见问题排查

*   **Host Key Verification Failed**：通常是因为 GitHub 无法验证服务器指纹。`ssh-deploy` 插件默认会自动处理，如果失败，请检查 `SERVER_HOST` 是否填写正确。
*   **Permission Denied**：请检查服务器上 `.ssh` 目录和 `authorized_keys` 文件的权限是否分别为 `700` 和 `600`。
*   **私钥格式不正确**：确保粘贴到 Secrets 的私钥包含开头的 `-----BEGIN...` 和结尾的 `-----END...`。

---

## 7. 关于 Deploy Keys 的说明

在本项目使用的 **GitHub Actions (推模式)** 方案中，**不需要配置 GitHub 的 Deploy Keys**。

*   **原因**：Deploy Keys 通常用于让服务器主动去拉取 (git pull) GitHub 上的私有代码。而本项目是通过 GitHub Actions 构建完成后，直接使用 SSH 协议将文件“推”送到服务器。
*   **配置重点**：你只需要确保 **GitHub Secrets** 中的 `SERVER_SSH_KEY` 配置正确即可。

---

> 参考来源：[Strapi Plugin Bag 部署指南](https://hangjob.github.io/strapi-plugin-bag/guide/deployment-bt.html)
