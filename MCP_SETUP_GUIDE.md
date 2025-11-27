# MCP 服务器配置和使用指南

我已经为你配置了三个常用的 MCP 服务器，它们可以大大扩展 Claude Code 的功能。

## 📋 已配置的 MCP 服务器

### 1. Fetch MCP 服务器 (`@sylphlab/mcp-fetch`)
- **功能**: 用于 HTTP 请求，可以获取网页内容、调用 API 等
- **包名**: `@sylphlab/mcp-fetch`
- **状态**: ✅ 已配置，可直接使用

### 2. Brave Search MCP 服务器 (`@modelcontextprotocol/server-brave-search`)
- **功能**: 网页搜索，使用 Brave Search API
- **包名**: `@modelcontextprotocol/server-brave-search`
- **状态**: ⚠️ 需要配置 API 密钥

### 3. Puppeteer MCP 服务器 (`@modelcontextprotocol/server-puppeteer`)
- **功能**: 浏览器自动化，可以控制浏览器进行网页操作
- **包名**: `@modelcontextprotocol/server-puppeteer`
- **状态**: ✅ 已配置，可直接使用

## 🚀 如何使用

### 启用 MCP 服务器
在 Claude Code 中，你可以通过以下方式启用/禁用 MCP 服务器：

1. **使用 @ 提及**：
   ```
   @fetch 启用 fetch 服务器
   @brave-search 启用 brave-search 服务器
   @puppeteer 启用 puppeteer 服务器
   ```

2. **使用 /mcp 命令**：
   ```
   /mcp
   ```
   然后选择要启用/禁用的服务器

### 具体使用示例

#### Fetch 服务器使用
```bash
# 让 Claude 获取网页内容
请帮我获取 https://example.com 的内容

# 调用 API
请调用 https://api.github.com/users/octocat 获取用户信息
```

#### Brave Search 服务器使用
首先需要配置 API 密钥：
1. 访问 [Brave Search API](https://brave.com/search/api/)
2. 注册并获取 API 密钥
3. 编辑 `.claude/mcp_config.json` 文件，将 `YOUR_BRAVE_API_KEY_HERE` 替换为你的密钥

然后可以使用：
```bash
# 搜索网页
请搜索 "Claude Code MCP 教程"

# 搜索最新资讯
请帮我搜索关于 AI 开发的最新消息
```

#### Puppeteer 服务器使用
```bash
# 截图网页
请帮我给 https://example.com 截个图

# 自动化操作
请打开网页，填写表单并提交
```

## ⚙️ 配置文件说明

配置文件位于：`.claude/mcp_config.json`

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@sylphlab/mcp-fetch"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "YOUR_BRAVE_API_KEY_HERE"
      }
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

## 🔧 故障排除

### 常见问题

1. **MCP 服务器无法启动**
   - 检查网络连接
   - 确保 npm 可正常使用
   - 尝试手动运行 `npx -y [package-name]` 测试

2. **Brave Search 不工作**
   - 确认 API 密钥已正确配置
   - 检查 API 密钥是否有足够的配额

3. **Puppeteer 相关问题**
   - 可能需要下载 Chromium，首次使用会比较慢
   - 确保系统有足够的内存

### 检查 MCP 状态
```bash
# 查看 MCP 服务器状态
/mcp

# 检查具体服务器
@fetch 检查状态
@brave-search 检查状态
@puppeteer 检查状态
```

## 💡 进阶使用

### 组合使用
你可以组合使用多个 MCP 服务器：
```bash
# 使用搜索找到网页，然后获取内容
请搜索 "Python教程"，然后获取第一个结果的网页内容

# 使用 Puppeteer 截图，然后使用 Fetch 分析
请打开某网页截图，然后获取该网页的 HTML 内容进行分析
```

### 自定义配置
如需自定义配置，可以：
1. 修改 `.claude/mcp_config.json`
2. 添加环境变量
3. 调整服务器参数

## 📚 更多资源

- [Claude Code 官方文档](https://docs.claude.com/en/docs/claude-code)
- [Model Context Protocol 规范](https://modelcontextprotocol.io/)
- [MCP 服务器列表](https://github.com/modelcontextprotocol/servers)

---

**注意**: 使用 MCP 服务器可能会产生网络流量和 API 调用费用，请注意使用量。