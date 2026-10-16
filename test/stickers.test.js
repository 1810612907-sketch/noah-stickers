import test from "node:test";
import assert from "node:assert/strict";
import { findSticker, listStickers } from "../src/stickers.js";

test("lists the 15 user-supplied stickers without exposing image URLs", () => {
  const stickers = listStickers();
  assert.equal(stickers.length, 15);
  assert.equal(new Set(stickers.map(sticker => sticker.id)).size, stickers.length);
  assert.ok(stickers.every(sticker => sticker.id && sticker.mood && !("url" in sticker)));
});

test("maps a sticker id to the public image and preserves GIFs", () => {
  assert.match(findSticker("hugging-bears").url, /assets\/hugging-bears\.gif$/);
  assert.match(findSticker("annoyed-kitten").url, /^https:\/\/cdn\.jsdelivr\.net\//);
  assert.equal(findSticker("unknown"), null);
});
