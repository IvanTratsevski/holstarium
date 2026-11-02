"use client";

import { useState } from "react";
import type { ArtistView } from "@/types";
import ArtistGrid from "./ArtistGrid";
import styles from "./Artists.module.css";

type Props = {
  artists: ArtistView[];
  districts: { slug: string; name: string }[];
};

export default function ArtistList({ artists, districts }: Props) {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("all");

  const q = query.trim().toLowerCase();
  const list = artists.filter(
    (a) =>
      (district === "all" || a.districtSlug === district) &&
      (!q || a.artistName.toLowerCase().includes(q) || a.signText.toLowerCase().includes(q))
  );

  return (
    <section>
      <div className={styles.toolbar}>
        <label className={styles.field}>
          <span className={styles.srOnly}>Поиск по нику или названию лавки</span>
          <input
            type="search"
            placeholder="Поиск по нику или названию лавки"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.srOnly}>Район</span>
          <select value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="all">Все районы ({artists.length})</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name} ({artists.filter((a) => a.districtSlug === d.slug).length})
              </option>
            ))}
          </select>
        </label>
        <span className={styles.count} role="status">
          Найдено: {list.length}
        </span>
      </div>

      {list.length === 0 ? (
        <div>
          <p>Никого не нашли. Попробуйте другой запрос или район.</p>
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              setQuery("");
              setDistrict("all");
            }}
          >
            Сбросить поиск
          </button>
        </div>
      ) : (
        <ArtistGrid artists={list} />
      )}
    </section>
  );
}