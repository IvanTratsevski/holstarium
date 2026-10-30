import { notFound } from "next/navigation";
import StallPage from "@/components/Stall/StallPage";
import { districts, slots, stalls, themes } from "@/data/mock";
import { buildCatalog } from "@/lib/tags";

export function generateStaticParams() {
  return stalls.map((s) => ({ slug: s.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stall = stalls.find((s) => s.slug === slug);
  if (!stall) notFound();

  const slot = slots.find((s) => s.stallSlug === slug);
  const district = slot && districts.find((d) => d.slug === slot.districtSlug);

  return (
    <main>
      <StallPage
  key={stall.slug}
  initialStall={stall}
  theme={themes[stall.themeId]}
  tagCatalog={buildCatalog(stalls.flatMap((s) => s.artworks))}
  district={district && { slug: district.slug, name: district.name }}
/>
    </main>
  );
}