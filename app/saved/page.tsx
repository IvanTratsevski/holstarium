import SavedView from "@/components/Feed/SavedView";
import { buildFeed } from "@/lib/feed";
import { districts, slots, stalls } from "@/data/mock";

export default function SavedPage() {
  const items = buildFeed(stalls, slots, districts);

  return (
    <main style={{ padding: "1rem", maxWidth: 1400, margin: "0 auto" }}>
      <h1>Избранное</h1>
      <SavedView items={items} />
    </main>
  );
}