import FollowingView from "@/components/Artists/FollowingView";
import { buildArtists } from "@/lib/artists";
import { districts, slots, stalls } from "@/data/mock";

export default function FollowingPage() {
  const artists = buildArtists(stalls, slots, districts);

  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "1rem" }}>
      <h1>Мои подписки</h1>
      <FollowingView artists={artists} />
    </main>
  );
}