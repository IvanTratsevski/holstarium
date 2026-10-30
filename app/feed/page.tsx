import Link from "next/link";
import ArtworkFeed from "@/components/Feed/ArtworkFeed";
import { buildFeed } from "@/lib/feed";
import { districts, slots, stalls } from "@/data/mock";

export default function FeedPage() {
  const items = buildFeed(stalls, slots, districts);

  return (
    <main style={{ padding: "1rem", maxWidth: 1400, margin: "0 auto" }}>
      <p>
        <Link href="/">← Рынок</Link>
      </p>
      <h1>Все работы</h1>
      <ArtworkFeed
        items={items}
        districts={districts.map((d) => ({ slug: d.slug, name: d.name }))}
        allowFollowScope
      />
    </main>
  );
}