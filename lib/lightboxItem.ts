import type { FeedItem, LightboxItem } from "@/types";
import { toTagList } from "@/lib/tags";

export const toLightboxItem = (i: FeedItem): LightboxItem => ({
  ...i,
  authorName: i.artistName,
  authorHref: `/stall/${i.stallSlug}`,
  tagList: toTagList(i.tags),
});