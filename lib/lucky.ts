import type { FeedItem } from "@/types";

export const HISTORY_MAX = 20;

type Options = {
  hideAi: boolean;
  excludeStall?: string; // чьи работы не показывать (например, свои у владельца)
  seen: string[];        // ключи недавно показанных работ, последним идёт текущая
  rand?: () => number;
};

const groupByAuthor = (list: FeedItem[]) => {
  const map = new Map<string, FeedItem[]>();
  for (const item of list) {
    const bucket = map.get(item.stallSlug);
    if (bucket) bucket.push(item);
    else map.set(item.stallSlug, [item]);
  }
  return [...map.values()];
};

// Сначала случайный автор, потом случайная его работа: у автора с тремя работами
// столько же шансов, сколько у автора с сорока
export function pickLucky(
  items: FeedItem[],
  { hideAi, excludeStall, seen, rand = Math.random }: Options
): FeedItem | null {
  const pool = items.filter(
    (i) => (!hideAi || !i.aiGenerated) && i.stallSlug !== excludeStall
  );
  if (pool.length === 0) return null;

  const seenSet = new Set(seen);
  let authors = groupByAuthor(pool.filter((i) => !seenSet.has(i.ref)));

  if (authors.length === 0) {
    // всё уже показывали: начинаем заново, но текущую работу сразу не повторяем
    const last = seen[seen.length - 1];
    authors = groupByAuthor(pool.filter((i) => i.ref !== last));
    if (authors.length === 0) authors = groupByAuthor(pool);
  }

  const works = authors[Math.floor(rand() * authors.length)];
  return works[Math.floor(rand() * works.length)];
}