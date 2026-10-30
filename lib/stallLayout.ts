import type { CounterVariant, StallData, Theme } from "@/types";

export function getStallLayout(stall: StallData, theme: Theme) {
  const counter: CounterVariant =
    theme.counters.find((c) => c.id === stall.counterId) ?? theme.counters[0];

  const sorted = [...stall.artworks].sort((a, b) => a.sortOrder - b.sortOrder);

  // на прилавок идут избранные по порядку, сколько влезает
  const featured = sorted.filter((a) => a.isFeatured).slice(0, counter.slots.length);
  const featuredIds = new Set(featured.map((a) => a.id));

  // всё остальное уходит в галерею
  const gallery = sorted.filter((a) => !featuredIds.has(a.id));

  return { counter, sorted, featured, gallery };
}