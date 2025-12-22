# Git 提交规范

为了保持代码提交历史的清晰和可追溯性，本项目采用 **Conventional Commits (约定式提交)** 规范。

## 提交格式

每次提交的消息应遵循以下格式：

```text
<emoji> <type>(<scope>): <subject>

<body>

<footer>
```

> **注意**：
> 1. `<emoji>` 是可选的，建议根据类型添加（见下表）。
> 2. `<type>` 必须是纯英文（见下表）。
> 3. **冒号 `:` 后面必须有一个空格**。

### Type (必需)

| 表情 | 类型 | 说明 |
| --- | --- | --- |
| ✨ | **feat** | 新功能 (feature) |
| 🐛 | **fix** | 修补 bug |
| 📝 | **docs** | 文档 (documentation) |
| 💄 | **style** | 格式 (不影响代码运行的变动) |
| ♻️ | **refactor** | 重构 (既不新增功能，也不修改 bug) |
| ⚡️ | **perf** | 性能优化 |
| ✅ | **test** | 增加测试 |
| 📦 | **build** | 构建过程或辅助工具的变动 |
| 🎡 | **ci** | CI 配置或脚本的变动 |
| 🔨 | **chore** | 其他琐事（构建过程等） |
| ⏪ | **revert** | 回退 |

## 示例

```bash
✨ feat(network): 增加请求缓存功能
🐛 fix(security): 修复加密算法漏洞
📝 docs: 更新部署文档
```

## 强制校验

本项目已集成 `husky` 和 `commitlint`。如果不符合上述规范，`git commit` 将会失败。

如果你需要临时跳过校验（不推荐），可以在命令后添加 `--no-verify`：

```bash
git commit -m "..." --no-verify
```

