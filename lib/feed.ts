import type { District, FeedItem, MapSlot, StallData } from "@/types";

export function buildFeed(
  stalls: StallData[],
  slots: MapSlot[],
  districts: District[]
): FeedItem[] {
  const districtBySlug = new Map(districts.map((d) => [d.slug, d]));

  const lists: FeedItem[][] = [];
  for (const stall of stalls) {
    const slot = slots.find((s) => s.stallSlug === stall.slug);
    const district = slot && districtBySlug.get(slot.districtSlug);
    if (!district) continue; // лавка без места на карте в ленте не показывается

    lists.push(
      [...stall.artworks]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((a) => ({
          ...a,
          id: `${stall.slug}-${a.id}`, // id должен быть уникальным по всему сайту
          stallSlug: stall.slug,
          artistName: stall.artistName,
          accentColor: stall.accentColor,
          districtSlug: district.slug,
          districtName: district.name,
        }))
    );
  }

  // чередуем авторов: по одной работе от каждого, потом по второй и т. д.
  const result: FeedItem[] = [];
  const max = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) {
    for (const list of lists) {
      if (list[i]) result.push(list[i]);
    }
  }
  return result;
}