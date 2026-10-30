import { notFound } from "next/navigation";
import Stall from "@/components/Stall/Stall";
import { stalls, themes } from "@/data/mock";

// Для статического экспорта: заранее перечисляем все адреса
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

  const theme = themes[stall.themeId];

  // Избранные, которые не влезли на прилавок, плюс неизбранные: уйдут в галерею
  const onCounter = theme.counters.find((c) => c.id === stall.counterId)!.slots.length;
  const sorted = [...stall.artworks].sort((a, b) => a.sortOrder - b.sortOrder);
  const featuredIds = new Set(
    sorted.filter((a) => a.isFeatured).slice(0, onCounter).map((a) => a.id)
  );
  const gallery = sorted.filter((a) => !featuredIds.has(a.id));

  return (
    <main>
      <Stall stall={stall} theme={theme} />

      {gallery.length > 0 && (
        <section style={{ maxWidth: 1400, margin: "2rem auto", padding: "0 1rem" }}>
          <h2>Все работы</h2>
          <ul style={{ display: "flex", gap: "1rem", flexWrap: "wrap", listStyle: "none", padding: 0 }}>
            {gallery.map((a) => (
              <li
                key={a.id}
                style={{ width: 160, height: 120, background: a.placeholderColor, color: "#fff", display: "grid", placeItems: "center" }}
              >
                {a.title}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}