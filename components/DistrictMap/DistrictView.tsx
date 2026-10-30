"use client";

import { useState } from "react";
import Link from "next/link";
import type { District, FeedItem,MapSlotView } from "@/types";
import DistrictMap from "./DistrictMap";
import styles from "./DistrictView.module.css";
import { withBase } from "@/lib/withBase";
import ArtworkFeed from "@/components/Feed/ArtworkFeed";

type Props = { district: District; slots: MapSlotView[]; works: FeedItem[] };

export default function DistrictView({ district, slots, works }: Props) {
  const [mode, setMode] = useState<"map" | "list" | "works">("map");
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
          <button
  type="button"
  aria-pressed={mode === "works"}
  className={mode === "works" ? styles.active : ""}
  onClick={() => setMode("works")}
>
  Работы
</button>
        </div>
        <span className={styles.stats}>
          Лавок: {occupied.length} · Свободно: {freeCount}
        </span>
      </div>

      {mode === "map" && <DistrictMap district={district} slots={slots} />}

      {mode === "works" && <ArtworkFeed items={works} />}

      {mode === "list" && (
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
  {filtered.map((s) => {
    const st = s.stall!;
    return (
      <li key={s.id}>
        <Link href={`/stall/${st.slug}`} className={styles.card}>
          <span className={styles.head}>
            <span className={styles.avatar} style={{ background: st.accentColor }}>
              {st.artistName.charAt(0).toUpperCase()}
            </span>
            <span className={styles.names}>
              <strong>{st.artistName}</strong>
              <small>{st.signText}</small>
            </span>
          </span>

          {st.bio && <span className={styles.bio}>{st.bio}</span>}

          <span className={styles.thumbs} aria-hidden="true">
            {st.previews.map((p) =>
              p.imageUrl ? (
                <img key={p.id} src={withBase(p.imageUrl)} alt="" className={styles.thumb} />
              ) : (
                <span key={p.id} className={styles.thumb} style={{ background: p.placeholderColor }} />
              )
            )}
          </span>

          <small className={styles.count}>Работ в лавке: {st.artworksCount}</small>
        </Link>
      </li>
    );
  })}
</ul>
          )}
        </div>
      )}
    </section>
  );
}