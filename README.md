# Noah Stickers MCP

小井提供的 15 张表情包保存在公开 GitHub 仓库。这个只读 MCP 暴露两个工具：`list_stickers`（列出 id 和语境）与 `show_sticker`（返回原图公网 URL 和 Markdown 图片）。服务不上传或复制表情文件。

部署到 Vercel 后，在 ChatGPT 添加自定义 MCP 服务器，地址填 `https://<你的域名>/mcp`，认证选无。发送频率由聊天语境决定；工具描述要求不要高频发图。公开服务的工具和图片任何知道地址的人都可以访问。

本地测试：`npm install && npx vercel dev`，然后用 MCP Inspector 连接 `http://localhost:3000/mcp`。`stickers.json` 与服务同仓库；改清单后重新部署即可生效。原图使用清单中的 jsDelivr 地址，CDN 对变更可能有缓存。
