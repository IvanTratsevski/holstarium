"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { FeedItem, LightboxItem } from "@/types";
import { withBase } from "@/lib/withBase";
import Lightbox from "@/components/Lightbox/Lightbox";
import styles from "./ArtworkFeed.module.css";

type Props = {
  items: FeedItem[];
  districts?: { slug: string; name: string }[]; // для фильтра; без него фильтра нет
};

export default function ArtworkFeed({ items, districts = [] }: Props) {
  const [district, setDistrict] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => (district === "all" ? items : items.filter((i) => i.districtSlug === district)),
    [items, district]
  );

  // то, что получает лайтбокс: те же работы, но со ссылкой на автора
  const lightboxItems: LightboxItem[] = useMemo(
    () =>
      visible.map((i) => ({
        ...i,
        authorName: i.artistName,
        authorHref: `/stall/${i.stallSlug}`,
      })),
    [visible]
  );

  const countOf = (slug: string) => items.filter((i) => i.districtSlug === slug).length;

  return (
    <section>
      {districts.length > 1 && (
        <div className={styles.filters} role="group" aria-label="Фильтр по районам">
          <button
            type="button"
            aria-pressed={district === "all"}
            className={district === "all" ? styles.active : ""}
            onClick={() => setDistrict("all")}
          >
            Все ({items.length})
          </button>
          {districts.map((d) => (
            <button
              key={d.slug}
              type="button"
              aria-pressed={district === d.slug}
              className={district === d.slug ? styles.active : ""}
              onClick={() => setDistrict(d.slug)}
            >
              {d.name} ({countOf(d.slug)})
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p>Здесь пока нет работ.</p>
      ) : (
        <ul className={styles.grid}>
          {visible.map((item, i) => (
            <li key={item.id} className={styles.item}>
              <button
                type="button"
                className={styles.work}
                onClick={() => setOpenIndex(i)}
                aria-label={`Открыть работу: ${item.title}, автор ${item.artistName}`}
              >
                {item.imageUrl ? (
                  <img
                    src={withBase(item.imageUrl)}
                    alt=""
                    loading="lazy"
                    className={styles.image}
                    style={item.aspectRatio ? { aspectRatio: item.aspectRatio } : undefined}
                  />
                ) : (
                  <span
                    className={styles.placeholder}
                    style={{
                      background: item.placeholderColor,
                      aspectRatio: item.aspectRatio ?? 1,
                    }}
                  >
                    {item.title}
                  </span>
                )}
              </button>
              <div className={styles.meta}>
                <Link href={`/stall/${item.stallSlug}`} className={styles.author}>
                  <span className={styles.dot} style={{ background: item.accentColor }} />
                  {item.artistName}
                </Link>
                <small>{item.districtName}</small>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Lightbox
        artworks={lightboxItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />
    </section>
  );
}