import type { FeedItem } from "@/types";

export type FeedFilters = {
  district: string; // "all" или slug района
  tags: string[];   // работа должна иметь все эти теги
  onlySale: boolean;
  hideAi: boolean;
};

// skip нужен для подсчёта вариантов: чтобы показать, сколько работ было бы
// в каждом районе, сам фильтр по району в этот момент не применяется
export function applyFilters(
  items: FeedItem[],
  f: FeedFilters,
  skip?: "district" | "tags"
): FeedItem[] {
  return items.filter(
    (i) =>
      (skip === "district" || f.district === "all" || i.districtSlug === f.district) &&
      (skip === "tags" || f.tags.every((t) => !!i.tags?.includes(t))) &&
      (!f.onlySale || !!i.sale) &&
      (!f.hideAi || !i.aiGenerated)
  );
}

export const activeCount = (f: FeedFilters) =>
  Number(f.district !== "all") + f.tags.length + Number(f.onlySale) + Number(f.hideAi);