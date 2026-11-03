import type { ArtistView, FeedItem } from "@/types";
import { tagName } from "@/lib/tags";

export type SearchIndex = { artists: ArtistView[]; works: FeedItem[] };

export type SearchResult = {
  artists: ArtistView[];
  works: FeedItem[];
  artistsTotal: number;
  worksTotal: number;
};

export const MIN_QUERY = 2;

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();

// 3: текст начинается с запроса, 2: с запроса начинается слово, 1: запрос внутри, 0: нет
function rank(text: string, q: string): number {
  const t = norm(text);
  if (t.startsWith(q)) return 3;
  if (t.split(" ").some((w) => w.startsWith(q))) return 2;
  return t.includes(q) ? 1 : 0;
}

export function searchAll(
  index: SearchIndex,
  query: string,
  hideAi: boolean,
  limits = { artists: 5, works: 8 }
): SearchResult {
  const q = norm(query);
  if (q.length < MIN_QUERY) return { artists: [], works: [], artistsTotal: 0, worksTotal: 0 };

  const artists = index.artists
    .map((a) => ({
      item: a,
      score: Math.max(rank(a.artistName, q) * 2, rank(a.signText, q), rank(a.districtName, q)),
    }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score);

  const works = index.works
    .filter((w) => !hideAi || !w.aiGenerated)
    .map((w) => ({
      item: w,
      score: Math.max(
        rank(w.title, q) * 2,
        rank(w.artistName, q),
        ...(w.tags ?? []).map((t) => rank(tagName(t), q))
      ),
    }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score);

  return {
    artists: artists.slice(0, limits.artists).map((x) => x.item),
    works: works.slice(0, limits.works).map((x) => x.item),
    artistsTotal: artists.length,
    worksTotal: works.length,
  };
}