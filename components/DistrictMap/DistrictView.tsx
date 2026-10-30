"use client";

import { useState } from "react";
import Link from "next/link";
import type { District, MapSlotView } from "@/types";
import DistrictMap from "./DistrictMap";
import styles from "./DistrictView.module.css";

type Props = { district: District; slots: MapSlotView[] };

export default function DistrictView({ district, slots }: Props) {
  const [mode, setMode] = useState<"map" | "list">("map");
  const [query, setQuery] = useState("");

  const occupied = slots.filter((s) => s.stall);
  const freeCount = slots.length - occupied.length;

  const filtered = occupied.filter((s) =>
    s.stall!.artistName.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <section>
      <div className={styles.toolbar}>
        <div className={styles.toggle} role="group" aria-label="Вид района">
          <button
            type="button"
            aria-pressed={mode === "map"}
            className={mode === "map" ? styles.active : ""}
            onClick={() => setMode("map")}
          >
            Карта
          </button>
          <button
            type="button"
            aria-pressed={mode === "list"}
            className={mode === "list" ? styles.active : ""}
            onClick={() => setMode("list")}
          >
            Список
          </button>
        </div>
        <span className={styles.stats}>
          Лавок: {occupied.length} · Свободно: {freeCount}
        </span>
      </div>

      {mode === "map" ? (
        <DistrictMap district={district} slots={slots} />
      ) : (
        <div className={styles.listWrap}>
          <input
            type="search"
            className={styles.search}
            placeholder="Поиск по нику"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Поиск художника по нику"
          />
          {filtered.length === 0 ? (
            <p>Ничего не найдено.</p>
          ) : (
            <ul className={styles.list}>
              {filtered.map((s) => (
                <li key={s.id}>
                  <Link href={`/stall/${s.stall!.slug}`} className={styles.card}>
                    <span className={styles.avatar} style={{ background: s.stall!.accentColor }}>
                      {s.stall!.artistName.charAt(0).toUpperCase()}
                    </span>
                    <span>
                      <strong>{s.stall!.artistName}</strong>
                      <br />
                      <small>{s.stall!.signText}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}