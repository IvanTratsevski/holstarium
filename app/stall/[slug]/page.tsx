import { notFound } from "next/navigation";
import StallView from "@/components/Stall/StallView";
import Link from "next/link";
import { slots, stalls, themes } from "@/data/mock";

export function generateStaticParams() {
  return stalls.map((s) => ({ slug: s.slug }));
}

export default async function StallPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stall = stalls.find((s) => s.slug === slug);
  if (!stall) notFound();
  const slot = slots.find((s) => s.stallSlug === slug);
  return (
    <main>
            {slot && (
        <p style={{ padding: "0.5rem 1rem" }}>
          <Link href={`/district/${slot.districtSlug}`}>← К району</Link>
        </p>
      )}
      <StallView stall={stall} theme={themes[stall.themeId]} />
    </main>
  );
}