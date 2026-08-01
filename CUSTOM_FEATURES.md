# 自定义功能维护

本 Fork 增加了前台访问密码保护。管理员登录状态可免密码进入；普通访客必须通过密码验证，监控 API 与实时 WebSocket 均受保护。

## 安全同步上游

不要直接点击 GitHub 的 **Sync fork** 更新生产分支。请使用以下流程：

1. 打开仓库的 **Actions -> 安全同步上游**。
2. 点击 **Run workflow**。工作流会把上游 `kadidalax/cf-vps-monitor` 合并到临时分支。
3. 工作流会主动运行 **自定义访问保护检查**；只有检查通过才会创建 PR。
4. 检查 PR 无冲突后合并；Cloudflare 再从 `main` 构建部署。

首次使用前，在 GitHub 仓库 **Settings -> Actions -> General -> Workflow permissions** 中启用读写权限，并允许 GitHub Actions 创建 Pull Request。

建议为 `main` 配置分支保护或 Ruleset：要求通过 Pull Request 合并，并把 **检查密码门禁与构建** 设置为必需状态检查。这样上游更新无法绕过测试直接进入生产分支。

## 回归范围

`.github/workflows/custom-access-protection.yml` 会检查：

- 访问密码令牌签名、篡改拒绝和改密失效；
- 公开监控 API、实时接口及 WebSocket 门禁；
- 管理员免密码访问链路；
- 前端与 Worker 类型检查和生产构建。

如果上游修改认证、公开路由、设置结构或前端入口，检查失败时不要合并，应先解决冲突并重新验证。
