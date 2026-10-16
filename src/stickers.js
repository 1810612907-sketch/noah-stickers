import manifest from "../stickers.json" with { type: "json" };

export function listStickers() {
  return manifest.stickers.map(({ id, mood }) => ({ id, mood }));
}

export function findSticker(id) {
  const sticker = manifest.stickers.find(sticker => sticker.id === id);
  if (!sticker) return null;
  return { id: sticker.id, mood: sticker.mood, url: sticker.url };
}
