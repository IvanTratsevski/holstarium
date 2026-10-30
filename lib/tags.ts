import type { TagInfo } from "@/types";
import { MAX_TAG_LENGTH, officialTags } from "@/data/tags";

export function normalizeTag(raw: string): string {
  return raw
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ") // убираем #, запятые и прочие знаки
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_TAG_LENGTH)
    .trim();
}

const officialNames = new Map(officialTags.map((t) => [t.key, t.name]));

// синоним → ключ официального тега
const aliasIndex = new Map<string, string>();
for (const t of officialTags) {
  aliasIndex.set(t.key, t.key);
  for (const a of t.aliases ?? []) aliasIndex.set(normalizeTag(a), t.key);
}

// Что ввёл автор → какой ключ сохранить (null, если ввод слишком короткий)
export function resolveTag(raw: string): string | null {
  const key = normalizeTag(raw);
  if (key.length < 2) return null;
  return aliasIndex.get(key) ?? key;
}

export const tagName = (key: string) => officialNames.get(key) ?? key;

export const toTagList = (keys?: string[]) =>
  (keys ?? []).map((key) => ({ key, name: tagName(key) }));

// Список всех известных тегов со счётчиками по переданным работам.
// Официальные включены всегда, даже с нулём использований.
export function buildCatalog(artworks: { tags?: string[] }[]): TagInfo[] {
  const counts = new Map<string, number>();
  for (const a of artworks) {
    for (const key of new Set(a.tags ?? [])) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const list: TagInfo[] = officialTags.map((t) => ({
    key: t.key,
    name: t.name,
    count: counts.get(t.key) ?? 0,
    official: true,
  }));

  const officialKeys = new Set(officialTags.map((t) => t.key));
  for (const [key, count] of counts) {
    if (!officialKeys.has(key)) list.push({ key, name: key, count, official: false });
  }
  return list;
}

// Подсказки при вводе: совпадение целиком, по началу, по вхождению (в названии и синонимах)
export function suggestTags(
  query: string,
  catalog: TagInfo[],
  exclude: string[] = [],
  limit = 6
): TagInfo[] {
  const q = normalizeTag(query);
  if (!q) return [];

  const aliasesOf = new Map(
    officialTags.map((t) => [t.key, (t.aliases ?? []).map(normalizeTag)])
  );

  const scored: [TagInfo, number][] = [];
  for (const tag of catalog) {
    if (exclude.includes(tag.key)) continue;
    const names = [tag.key, ...(aliasesOf.get(tag.key) ?? [])];
    let score = 0;
    if (names.some((n) => n === q)) score = 3;
    else if (names.some((n) => n.startsWith(q))) score = 2;
    else if (names.some((n) => n.includes(q))) score = 1;
    if (score) scored.push([tag, score]);
  }

  scored.sort(
    (a, b) =>
      b[1] - a[1] ||
      Number(b[0].official) - Number(a[0].official) ||
      b[0].count - a[0].count
  );
  return scored.slice(0, limit).map(([t]) => t);
}