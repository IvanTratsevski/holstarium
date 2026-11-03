import Link from "next/link";
import ArtistGrid from "@/components/Artists/ArtistGrid";
import HomeDistricts from "@/components/Home/HomeDistricts";
import WorkStrip from "@/components/Home/WorkStrip";
import styles from "@/components/Home/Home.module.css";
import { buildArtists } from "@/lib/artists";
import { buildFeed } from "@/lib/feed";
import { districtStats } from "@/lib/market";
import { districts, marketMap, slots, stalls } from "@/data/mock";
import type { ArtistView, MapDistrictView } from "@/types";

export default function Home() {
  const stats = new Map(districtStats(districts, slots).map((s) => [s.slug, s]));
  const mapDistricts: MapDistrictView[] = districts.map((d) => ({
    slug: d.slug,
    name: d.name,
    description: d.description,
    area: d.area,
    stalls: stats.get(d.slug)?.stalls ?? 0,
    free: stats.get(d.slug)?.free ?? 0,
  }));

  // в прототипе «новые» это порядок в тестовых данных, в боевой версии будет сортировка по дате
  const works = buildFeed(stalls, slots, districts).slice(0, 8);
  const artists = buildArtists(stalls, slots, districts);
  const newest = stalls
    .slice(-4)
    .reverse()
    .map((s) => artists.find((a) => a.slug === s.slug))
    .filter((a): a is ArtistView => !!a);

  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "1rem" }}>
      <h1>Holstarium</h1>
      <p>Виртуальный рынок художников. Выберите район на карте, чтобы увидеть его лавки.</p>

      <HomeDistricts map={marketMap} districts={mapDistricts} />

      <section aria-labelledby="new-works">
        <div className={styles.sectionHead}>
          <h2 id="new-works">Новые работы</h2>
          <Link href="/feed">Все работы →</Link>
        </div>
        <WorkStrip items={works} />
      </section>

      <section aria-labelledby="new-stalls">
        <div className={styles.sectionHead}>
          <h2 id="new-stalls">Новые лавки</h2>
          <Link href="/artists">Все художники →</Link>
        </div>
        <ArtistGrid artists={newest} />
      </section>
    </main>
  );
}