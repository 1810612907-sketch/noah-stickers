import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { listStickers, findSticker } from "../src/stickers.js";

function createStickerServer() {
  const server = new McpServer({ name: "noah-stickers", version: "1.0.0" });
  const annotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };

  server.registerTool("list_stickers", {
    title: "列出 Noah 的表情包",
    description: "在亲密、撒娇、想念、认错、安慰或轻微拌嘴的聊天里，需要挑一张小井提供的表情包时调用。不要在严肃技术任务里主动发图，也不要高频发送。",
    inputSchema: {},
    outputSchema: { stickers: z.array(z.object({ id: z.string(), mood: z.string() })) },
    annotations,
  }, async () => {
    const stickers = listStickers();
    return {
      structuredContent: { stickers },
      content: [{ type: "text", text: stickers.map(s => `${s.id}：${s.mood}`).join("\n") }],
    };
  });

  server.registerTool("show_sticker", {
    title: "发送 Noah 的表情包",
    description: "从 list_stickers 选定一张后，以原图公网 URL 返回。若要在聊天里展示，使用返回的 Markdown 图片；不要用别的图片代替。",
    inputSchema: { id: z.string().describe("list_stickers 返回的表情包 id") },
    outputSchema: { id: z.string(), mood: z.string(), url: z.string() },
    annotations,
  }, async ({ id }) => {
    const sticker = findSticker(id);
    if (!sticker) return { isError: true, content: [{ type: "text", text: `没有这张表情：${id}。先调用 list_stickers。` }] };
    const { mood, url } = sticker;
    return {
      structuredContent: { id, mood, url },
      content: [{ type: "text", text: `![${mood}](${url})` }],
    };
  });

  return server;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type, accept, authorization, mcp-session-id, mcp-protocol-version");
    return res.status(204).end();
  }
  if (!["POST", "GET", "DELETE"].includes(req.method)) return res.status(405).end();
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
  const server = createStickerServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on("close", () => { void transport.close(); void server.close(); });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed", error);
    if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
  }
}
