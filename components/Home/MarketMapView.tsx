"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import type { MapDistrictView, MarketMap } from "@/types";
import { withBase } from "@/lib/withBase";
import styles from "./Home.module.css";

type Props = {
  map: MarketMap;
  districts: MapDistrictView[];
  active: string | null;
  onActive: (slug: string | null) => void;
};

export default function MarketMapView({ map, districts, active, onActive }: Props) {
  const router = useRouter();
  const { width: w, height: h } = map;

  const open = (slug: string) => router.push(`/district/${slug}`);

  const onKeyDown = (e: KeyboardEvent, slug: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open(slug);
    }
  };

  return (
    <div className={styles.mapRoot}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className={styles.svg}
        role="group"
        aria-label="Карта рынка: нажмите на район, чтобы увидеть его лавки"
      >
        {map.image ? (
          <image href={withBase(map.image)} width={w} height={h} />
        ) : (
          <>
            <defs>
              <pattern id="market-grid" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M200 0H0V200" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              </pattern>
            </defs>
            <rect width={w} height={h} fill="#2f3b34" />
            <rect width={w} height={h} fill="url(#market-grid)" />
          </>
        )}

        {districts.map((d) => {
          if (!d.area) return null;
          const { points, label, color } = d.area;
          return (
            <g
              key={d.slug}
              className={styles.area}
              data-active={active === d.slug}
              role="link"
              tabIndex={0}
              aria-label={`Район «${d.name}»: лавок ${d.stalls}, свободных мест ${d.free}`}
              onClick={() => open(d.slug)}
              onKeyDown={(e) => onKeyDown(e, d.slug)}
              onMouseEnter={() => onActive(d.slug)}
              onMouseLeave={() => onActive(null)}
              onFocus={() => onActive(d.slug)}
              onBlur={() => onActive(null)}
            >
              <polygon points={points.map((p) => p.join(",")).join(" ")} style={{ fill: color }} />
              <text x={label[0]} y={label[1]} textAnchor="middle" fontSize={96} className={styles.name}>
                {d.name}
              </text>
              <text x={label[0]} y={label[1] + 88} textAnchor="middle" fontSize={64} className={styles.sub}>
                Лавок: {d.stalls} · Свободно: {d.free}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}