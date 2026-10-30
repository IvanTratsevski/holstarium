"use client";

import { useState } from "react";
import Link from "next/link";
import type { FeedItem, LightboxItem } from "@/types";
import { MIN_CUSTOM_TAG_COUNT } from "@/data/tags";
import { buildCatalog, toTagList } from "@/lib/tags";
import { withBase } from "@/lib/withBase";
import Lightbox from "@/components/Lightbox/Lightbox";
import LikeButton from "@/components/Social/LikeButton";
import SaveButton from "@/components/Social/SaveButton";
import { useSocial } from "@/components/Social/SocialProvider";
import styles from "./ArtworkFeed.module.css";

const TAGS_COLLAPSED = 8;

type Props = {
  items: FeedItem[];
  districts?: { slug: string; name: string }[]; // без него фильтра по районам нет
  allowFollowScope?: boolean; // вкладки «Все работы / Подписки»
  emptyText?: string;
};

export default function ArtworkFeed({
  items,
  districts = [],
  allowFollowScope = false,
  emptyText = "Здесь пока нет работ.",
}: Props) {
  const { state, loggedIn, requireAuth } = useSocial();
  const [scope, setScope] = useState<"all" | "follows">("all");
  const [district, setDistrict] = useState<string>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // если пользователь вышел, «Подписки» больше недоступны
  const activeScope = loggedIn ? scope : "all";

  const pickScope = (next: "all" | "follows") => {
    if (
      next === "follows" &&
      !requireAuth("Войдите, чтобы видеть работы художников, на которых вы подписаны.")
    ) {
      return;
    }
    setScope(next);
    setDistrict("all");
    setTag(null);
  };

  const pickDistrict = (slug: string) => {
    setDistrict(slug);
    setTag(null);
  };

  const scoped =
    activeScope === "follows" ? items.filter((i) => state.follows.includes(i.stallSlug)) : items;

  const inDistrict =
    district === "all" ? scoped : scoped.filter((i) => i.districtSlug === district);

  // Чипы тегов считаются по выбранному району.
  // Официальные показываем всегда, самодельные только когда их достаточно;
  // выбранный тег всегда виден и стоит первым.
  const chips = buildCatalog(inDistrict)
    .filter(
      (t) =>
        t.count > 0 && (t.official || t.count >= MIN_CUSTOM_TAG_COUNT || t.key === tag)
    )
    .sort((a, b) => Number(b.key === tag) - Number(a.key === tag) || b.count - a.count);
  const shownChips = showAllTags ? chips : chips.slice(0, TAGS_COLLAPSED);

  const visible = tag ? inDistrict.filter((i) => i.tags?.includes(tag)) : inDistrict;

  const lightboxItems: LightboxItem[] = visible.map((i) => ({
    ...i,
    authorName: i.artistName,
    authorHref: `/stall/${i.stallSlug}`,
    tagList: toTagList(i.tags),
  }));

  const countOf = (slug: string) => scoped.filter((i) => i.districtSlug === slug).length;

  return (
    <section>
      {allowFollowScope && (
        <div className={styles.scope} role="group" aria-label="Какие работы показывать">
          <button
            type="button"
            aria-pressed={activeScope === "all"}
            onClick={() => pickScope("all")}
          >
            Все работы
          </button>
          <button
            type="button"
            aria-pressed={activeScope === "follows"}
            onClick={() => pickScope("follows")}
          >
            Подписки{loggedIn ? ` (${state.follows.length})` : ""}
          </button>
        </div>
      )}

      {districts.length > 1 && (
        <div className={styles.filters} role="group" aria-label="Фильтр по районам">
          <button
            type="button"
            aria-pressed={district === "all"}
            className={district === "all" ? styles.active : ""}
            onClick={() => pickDistrict("all")}
          >
            Все ({scoped.length})
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
        activeScope === "follows" && state.follows.length === 0 ? (
          <p>
            Вы пока ни на кого не подписаны. Откройте <Link href="/">любой район</Link> и
            подпишитесь на понравившихся художников.
          </p>
        ) : (
          <p>{emptyText}</p>
        )
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
                <div className={styles.metaMain}>
                  <Link href={`/stall/${item.stallSlug}`} className={styles.author}>
                    <span className={styles.dot} style={{ background: item.accentColor }} />
                    {item.artistName}
                  </Link>
                  <small>{item.districtName}</small>
                </div>
                <div className={styles.cardActions}>
                  <LikeButton refKey={item.ref} />
                  <SaveButton refKey={item.ref} compact />
                </div>
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