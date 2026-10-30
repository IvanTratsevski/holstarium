import type { ArtworkPreview, StallData } from "@/types";

// Работы для карточки в списке: сначала избранные по порядку, затем остальные
export function getPreviews(stall: StallData, count = 4): ArtworkPreview[] {
  const sorted = [...stall.artworks].sort((a, b) => a.sortOrder - b.sortOrder);
  const featured = sorted.filter((a) => a.isFeatured);
  const rest = sorted.filter((a) => !a.isFeatured);

  return [...featured, ...rest].slice(0, count).map((a) => ({
    id: a.id,
    title: a.title,
    imageUrl: a.imageUrl,
    placeholderColor: a.placeholderColor,
  }));
}