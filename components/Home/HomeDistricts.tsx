"use client";

import { useState } from "react";
import Link from "next/link";
import type { MapDistrictView, MarketMap } from "@/types";
import LuckyButton from "@/components/Discovery/LuckyButton";
import MarketMapView from "./MarketMapView";
import styles from "./Home.module.css";

type Props = { map: MarketMap; districts: MapDistrictView[] };

export default function HomeDistricts({ map, districts }: Props) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <MarketMapView map={map} districts={districts} active={active} onActive={setActive} />

      <LuckyButton />

      <section aria-labelledby="districts-title">
        <h2 id="districts-title">Районы</h2>
        <ul className={styles.cards}>
          {districts.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/district/${d.slug}`}
                className={styles.card}
                data-active={active === d.slug}
                style={d.area ? { borderLeftColor: d.area.color } : undefined}
                onMouseEnter={() => setActive(d.slug)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(d.slug)}
                onBlur={() => setActive(null)}
              >
                <strong>{d.name}</strong>
                <span className={styles.desc}>{d.description}</span>
                <small>
                  Лавок: {d.stalls} · Свободно мест: {d.free}
                </small>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}