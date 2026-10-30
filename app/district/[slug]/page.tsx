import Link from "next/link";
import { notFound } from "next/navigation";
import DistrictView from "@/components/DistrictMap/DistrictView";
import { districts, slots, stalls } from "@/data/mock";
import type { MapSlotView } from "@/types";
import { getPreviews } from "@/lib/stallPreview";
import { buildFeed } from "@/lib/feed";

export function generateStaticParams() {
  return districts.map((d) => ({ slug: d.slug }));
}

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const district = districts.find((d) => d.slug === slug);
  const works = buildFeed(stalls, slots, districts).filter((w) => w.districtSlug === slug);

  if (!district) notFound();

  const slotViews: MapSlotView[] = slots
  .filter((s) => s.districtSlug === slug)
  .map((s) => {
    const st = s.stallSlug ? stalls.find((x) => x.slug === s.stallSlug) : undefined;
    return {
      ...s,
      stall: st && {
        slug: st.slug,
        artistName: st.artistName,
        bio: st.bio,
        signText: st.signText,
        accentColor: st.accentColor,
        artworksCount: st.artworks.length,
        previews: getPreviews(st, 4),
      },
    };
  });

  return (
    <main style={{ padding: "1rem" }}>
      <p>
        <Link href="/">← Рынок</Link>
      </p>
      <h1>{district.name}</h1>
      <p>{district.description}</p>
      <DistrictView district={district} slots={slotViews} works={works} />
    </main>
  );
}