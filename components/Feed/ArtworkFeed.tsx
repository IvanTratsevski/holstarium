"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { FeedItem, LightboxItem } from "@/types";
import { MIN_CUSTOM_TAG_COUNT } from "@/data/tags";
import { buildCatalog, toTagList } from "@/lib/tags";
import { withBase } from "@/lib/withBase";
import Lightbox from "@/components/Lightbox/Lightbox";
import styles from "./ArtworkFeed.module.css";

const TAGS_COLLAPSED = 8;

type Props = {
  items: FeedItem[];
  districts?: { slug: string; name: string }[]; // для фильтра; без него фильтра по районам нет
};

export default function ArtworkFeed({ items, districts = [] }: Props) {
  const [district, setDistrict] = useState<string>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const pickDistrict = (slug: string) => {
    setDistrict(slug);
    setTag(null);
  };

  const inDistrict = useMemo(
    () => (district === "all" ? items : items.filter((i) => i.districtSlug === district)),
    [items, district]
  );

  // Чипы тегов считаются по выбранному району.
  // Официальные показываем всегда, самодельные только когда их достаточно;
  // выбранный тег всегда виден и стоит первым.
  const chips = useMemo(
    () =>
      buildCatalog(inDistrict)
        .filter(
          (t) =>
            t.count > 0 &&
            (t.official || t.count >= MIN_CUSTOM_TAG_COUNT || t.key === tag)
        )
        .sort((a, b) => Number(b.key === tag) - Number(a.key === tag) || b.count - a.count),
    [inDistrict, tag]
  );
  const shownChips = showAllTags ? chips : chips.slice(0, TAGS_COLLAPSED);

  const visible = useMemo(
    () => (tag ? inDistrict.filter((i) => i.tags?.includes(tag)) : inDistrict),
    [inDistrict, tag]
  );

  const lightboxItems = useMemo<LightboxItem[]>(
    () =>
      visible.map((i) => ({
        ...i,
        authorName: i.artistName,
        authorHref: `/stall/${i.stallSlug}`,
        tagList: toTagList(i.tags),
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
            onClick={() => pickDistrict("all")}
          >
            Все ({items.length})
          </button>
          {districts.map((d) => (
            <button
              key={d.slug}
              type="button"
              aria-pressed={district === d.slug}
              className={district === d.slug ? styles.active : ""}
              onClick={() => pickDistrict(d.slug)}
            >
              {d.name} ({countOf(d.slug)})
            </button>
          ))}
        </div>
      )}

      {chips.length > 0 && (
        <div className={styles.tagRow} role="group" aria-label="Фильтр по тегам">
          {shownChips.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={tag === t.key}
              className={`${styles.tagChip} ${tag === t.key ? styles.tagActive : ""}`}
              onClick={() => setTag(tag === t.key ? null : t.key)}
            >
              #{t.name} <span>{t.count}</span>
            </button>
          ))}
          {chips.length > TAGS_COLLAPSED && (
            <button
              type="button"
              className={styles.more}
              onClick={() => setShowAllTags((v) => !v)}
            >
              {showAllTags ? "Свернуть" : `Ещё ${chips.length - TAGS_COLLAPSED}`}
            </button>
          )}
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
        onTagClick={(key) => {
          setTag(key);
          setOpenIndex(null);
        }}
      />
    </section>
  );
}