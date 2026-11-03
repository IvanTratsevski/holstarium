import { buildArtists } from "@/lib/artists";
import { buildFeed } from "@/lib/feed";
import type { SearchIndex } from "@/lib/search";
import { districts, slots, stalls } from "@/data/mock";

export const buildDiscoveryData = (): SearchIndex => ({
  artists: buildArtists(stalls, slots, districts),
  works: buildFeed(stalls, slots, districts),
});