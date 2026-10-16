import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import handler from "../api/mcp.js";

test("MCP initializes, lists both tools, and returns one sticker", async () => {
  const server = createServer((req, res) => {
    res.status = code => { res.statusCode = code; return res; };
    res.json = value => res.end(JSON.stringify(value));
    void handler(req, res);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/mcp`;
  async function call(id, method, params = {}) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    });
    assert.equal(response.status, 200);
    return response.json();
  }
  try {
    const init = await call(1, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } });
    assert.equal(init.result.serverInfo.name, "noah-stickers");
    const listed = await call(2, "tools/list");
    assert.deepEqual(listed.result.tools.map(tool => tool.name), ["list_stickers", "show_sticker"]);
    const list = await call(3, "tools/call", { name: "list_stickers", arguments: {} });
    assert.equal(list.result.structuredContent.stickers.length, 15);
    const shown = await call(4, "tools/call", { name: "show_sticker", arguments: { id: "hugging-bears" } });
    assert.match(shown.result.content[0].text, /!\[拥抱、贴贴\]\(https:\/\/cdn\.jsdelivr\.net\/.*\.gif\)/);
    const missing = await call(5, "tools/call", { name: "show_sticker", arguments: { id: "missing" } });
    assert.equal(missing.result.isError, true);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
