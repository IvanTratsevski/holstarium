import type { Artwork } from "@/types";

export const MAX_ARTWORKS = 40;
export const MAX_FILE_MB = 8;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const sortArtworks = (list: Artwork[]) =>
  [...list].sort((a, b) => a.sortOrder - b.sortOrder);

// после любой операции номера снова идут подряд: 1, 2, 3...
const renumber = (list: Artwork[]) => list.map((a, i) => ({ ...a, sortOrder: i + 1 }));

// новая работа становится первой
export const addArtwork = (list: Artwork[], art: Artwork) =>
  renumber([art, ...sortArtworks(list)]);

export function moveArtwork(list: Artwork[], id: string, dir: -1 | 1) {
  const sorted = sortArtworks(list);
  const i = sorted.findIndex((a) => a.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= sorted.length) return renumber(sorted);
  [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
  return renumber(sorted);
}

export const removeArtwork = (list: Artwork[], id: string) =>
  renumber(sortArtworks(list).filter((a) => a.id !== id));

export const updateArtwork = (list: Artwork[], id: string, patch: Partial<Artwork>) =>
  list.map((a) => (a.id === id ? { ...a, ...patch } : a));