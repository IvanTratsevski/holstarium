"use client";

import { useState } from "react";
import Link from "next/link";
import type { FeedItem, LightboxItem, PostView } from "@/types";
import { MIN_CUSTOM_TAG_COUNT } from "@/data/tags";
import { activeCount, applyFilters } from "@/lib/feedFilters";
import type { FeedFilters } from "@/lib/feedFilters";
import { formatPrice } from "@/lib/sale";
import { setHideAi } from "@/lib/socialActions";
import { buildCatalog, tagName, toTagList } from "@/lib/tags";
import { withBase } from "@/lib/withBase";
import AiBadge from "@/components/Badges/AiBadge";
import Lightbox from "@/components/Lightbox/Lightbox";
import PostList from "@/components/Posts/PostList";
import LikeButton from "@/components/Social/LikeButton";
import SaveButton from "@/components/Social/SaveButton";
import { useSocial } from "@/components/Social/SocialProvider";
import FilterPanel from "./FilterPanel";
import styles from "./ArtworkFeed.module.css";

type Props = {
  items: FeedItem[];
  districts?: { slug: string; name: string }[]; // без него фильтра по районам нет
  allowFollowScope?: boolean; // переключатель «Все работы / Подписки»
  emptyText?: string;
  posts?: PostView[]; // объявления, они показываются на вкладке «Подписки»
};

export default function ArtworkFeed({
  items,
  districts = [],
  allowFollowScope = false,
  emptyText = "Здесь пока нет работ.",
  posts = [],
}: Props) {
  const { state, loggedIn, requireAuth } = useSocial();
  const [scope, setScope] = useState<"all" | "follows">("all");
  const [district, setDistrict] = useState("all");
  const [tags, setTags] = useState<string[]>([]);
  const [onlySale, setOnlySale] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // если пользователь вышел, «Подписки» больше недоступны
  const activeScope = loggedIn ? scope : "all";

  const filters: FeedFilters = { district, tags, onlySale, hideAi: state.hideAi };
  const activeN = activeCount(filters);

  const toggleTag = (key: string) =>
    setTags((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));
  const addTag = (key: string) => setTags((list) => (list.includes(key) ? list : [...list, key]));

  const pickScope = (next: "all" | "follows") => {
    if (
      next === "follows" &&
      !requireAuth("Войдите, чтобы видеть работы художников, на которых вы подписаны.")
    ) {
      return;
    }
    setScope(next);
    setDistrict("all");
    setTags([]);
  };

  const reset = () => {
    setDistrict("all");
    setTags([]);
    setOnlySale(false);
    setHideAi(false);
  };

  const byScope =
    activeScope === "follows" ? items.filter((i) => state.follows.includes(i.stallSlug)) : items;
  const visible = applyFilters(byScope, filters);

  // варианты в панели считаются без собственного фильтра, но с остальными
  const forDistricts = applyFilters(byScope, filters, "district");
  const districtOptions = districts.map((d) => ({
    ...d,
    count: forDistricts.filter((i) => i.districtSlug === d.slug).length,
  }));

  // Теги. Список и порядок определяют все фильтры, кроме тегов, чтобы порядок не прыгал при выборе.
  // Официальные теги показываем всегда, самодельные только когда ими отмечено достаточно работ.
  // Число у тега это сколько работ останется, если его добавить к уже выбранным.
  const forTags = applyFilters(byScope, filters, "tags");
  const baseTags = buildCatalog(forTags)
    .filter((t) => t.count > 0 && (t.official || t.count >= MIN_CUSTOM_TAG_COUNT))
    .sort((a, b) => b.count - a.count);
  const poolCounts = new Map(buildCatalog(visible).map((t) => [t.key, t.count]));
  const tagOptions = [
    ...baseTags.map((t) => ({ ...t, count: poolCounts.get(t.key) ?? 0 })),
    // выбранные теги остаются в списке, даже если под другими фильтрами у них нет работ
    ...tags
      .filter((k) => !baseTags.some((t) => t.key === k))
      .map((k) => ({
        key: k,
        name: tagName(k),
        count: poolCounts.get(k) ?? 0,
        official: false,
      })),
  ];

  // выбранные фильтры чипами над лентой
  const chips: { id: string; label: string; remove: () => void }[] = [];
  if (district !== "all") {
    chips.push({
      id: "district",
      label: districts.find((d) => d.slug === district)?.name ?? district,
      remove: () => setDistrict("all"),
    });
  }
  for (const key of tags) {
    chips.push({ id: `tag-${key}`, label: `#${tagName(key)}`, remove: () => toggleTag(key) });
  }
  if (onlySale) chips.push({ id: "sale", label: "В продаже", remove: () => setOnlySale(false) });
  if (state.hideAi) chips.push({ id: "ai", label: "Без ИИ", remove: () => setHideAi(false) });

  const followedPosts =
    activeScope === "follows"
      ? posts.filter((p) => state.follows.includes(p.stallSlug)).slice(0, 6)
      : [];

  const lightboxItems: LightboxItem[] = visible.map((i) => ({
    ...i,
    authorName: i.artistName,
    authorHref: `/stall/${i.stallSlug}`,
    tagList: toTagList(i.tags),
  }));

  return (
    <section>
      <div className={styles.toolbar}>
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

        <button
          type="button"
          className={`${styles.filterBtn} ${activeN > 0 ? styles.filterBtnOn : ""}`}
          aria-haspopup="dialog"
          onClick={() => setPanelOpen(true)}
        >
          Фильтры
          {activeN > 0 && (
            <>
              <span className={styles.badge} aria-hidden="true">
                {activeN}
              </span>
              <span className={styles.srOnly}>, выбрано: {activeN}</span>
            </>
          )}
        </button>

        <span className={styles.total} role="status">
          Работ: {visible.length}
        </span>
      </div>

      {chips.length > 0 && (
        <div className={styles.applied} role="group" aria-label="Выбранные фильтры">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              className={styles.chipX}
              aria-label={`Убрать фильтр: ${c.label}`}
              onClick={c.remove}
            >
              {c.label} <span aria-hidden="true">×</span>
            </button>
          ))}
          {chips.length > 1 && (
            <button type="button" className={styles.clearAll} onClick={reset}>
              Сбросить всё
            </button>
          )}
        </div>
      )}

      {followedPosts.length > 0 && (
        <section aria-label="Объявления художников">
          <h2>Объявления</h2>
          <PostList posts={followedPosts} showAuthor />
          <h2>Работы</h2>
        </section>
      )}

      {visible.length === 0 ? (
        activeScope === "follows" && state.follows.length === 0 ? (
          <p>
            Вы пока ни на кого не подписаны. Загляните на страницу{" "}
            <Link href="/artists">«Художники»</Link> и подпишитесь на понравившихся авторов.
          </p>
        ) : activeN > 0 ? (
          <div>
            <p>По выбранным фильтрам ничего не нашлось.</p>
            <button type="button" className={styles.clearAll} onClick={reset}>
              Сбросить фильтры
            </button>
          </div>
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
                aria-label={`Открыть работу: ${item.title}, автор ${item.artistName}${
                  item.aiGenerated ? ", создано с помощью ИИ" : ""
                }`}
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
                {item.aiGenerated && <AiBadge />}
              </button>

              <div className={styles.meta}>
                <div className={styles.metaMain}>
                  <Link href={`/stall/${item.stallSlug}`} className={styles.author}>
                    <span className={styles.dot} style={{ background: item.accentColor }} />
                    {item.artistName}
                  </Link>
                  <small>{item.districtName}</small>
                  {item.sale && <small className={styles.price}>{formatPrice(item.sale)}</small>}
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
          addTag(key);
          setOpenIndex(null);
        }}
      />

      <FilterPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        resultCount={visible.length}
        districts={districts.length > 1 ? districtOptions : []}
        district={district}
        onDistrict={setDistrict}
        tags={tagOptions}
        selectedTags={tags}
        onToggleTag={toggleTag}
        onlySale={onlySale}
        onOnlySale={setOnlySale}
        hideAi={state.hideAi}
        onHideAi={setHideAi}
        canReset={activeN > 0}
        onReset={reset}
      />
    </section>
  );
}