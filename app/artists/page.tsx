import ArtistList from "@/components/Artists/ArtistList";
import { buildArtists } from "@/lib/artists";
import { districts, slots, stalls } from "@/data/mock";

export default function ArtistsPage() {
  const artists = buildArtists(stalls, slots, districts);

  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "1rem" }}>
      <h1>Художники</h1>
      <p>Все лавки рынка. Найдите автора по нику или загляните в район, который вам по душе.</p>
      <ArtistList
        artists={artists}
        districts={districts.map((d) => ({ slug: d.slug, name: d.name }))}
      />
    </main>
  );
}