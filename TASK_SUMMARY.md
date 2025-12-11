# 文档更新总结

**日期**: 2025-12-10
**任务**: 编写插件说明文档

## 更新内容

在 `docs/index.md` 中编写了完整的插件使用说明，包含以下部分：

1.  **特性介绍**: 网络请求封装、安全加密套件（对称/非对称/哈希/存储）。
2.  **安装指南**: `npm/pnpm/yarn` 安装命令。
3.  **配置说明**: `nuxt.config.ts` 中的详细配置示例。
4.  **使用指南**:
    *   `useApiClient`: 网络请求示例。
    *   `useSymmetricCrypto`: 对称加密示例。
    *   `useAsymmetricCrypto`: 非对称加密及签名示例。
    *   `useEncryption`: 加密存储（LocalStorage/Cookie）示例。
    *   `useHash`: 哈希计算示例。

## 文档预览

运行以下命令查看文档：

```bash
pnpm docs:dev
```

