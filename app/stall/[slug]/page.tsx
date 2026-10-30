import { notFound } from "next/navigation";
import StallView from "@/components/Stall/StallView";
import { stalls, themes } from "@/data/mock";

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

  return (
    <main>
      <StallView stall={stall} theme={themes[stall.themeId]} />
    </main>
  );
}