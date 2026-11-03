import type { District, MapSlot } from "@/types";

export function districtStats(districts: District[], slots: MapSlot[]) {
  return districts.map((d) => {
    const own = slots.filter((s) => s.districtSlug === d.slug);
    return {
      slug: d.slug,
      stalls: own.filter((s) => s.stallSlug).length,
      free: own.filter((s) => !s.stallSlug).length,
    };
  });
}