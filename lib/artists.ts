import type { ArtistView, District, MapSlot, StallData } from "@/types";
import { getPreviews } from "@/lib/stallPreview";

// Художники, у которых есть место на карте, по алфавиту
export function buildArtists(
  stalls: StallData[],
  slots: MapSlot[],
  districts: District[]
): ArtistView[] {
  const byDistrict = new Map(districts.map((d) => [d.slug, d]));
  const result: ArtistView[] = [];

  for (const s of stalls) {
    const slot = slots.find((x) => x.stallSlug === s.slug);
    const district = slot && byDistrict.get(slot.districtSlug);
    if (!district) continue;

    result.push({
      slug: s.slug,
      artistName: s.artistName,
      bio: s.bio,
      signText: s.signText,
      accentColor: s.accentColor,
      artworksCount: s.artworks.length,
      previews: getPreviews(s, 4),
      districtSlug: district.slug,
      districtName: district.name,
    });
  }

  return result.sort((a, b) => a.artistName.localeCompare(b.artistName, "ru"));
}