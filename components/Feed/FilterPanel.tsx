"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { TagInfo } from "@/types";
import styles from "./FilterPanel.module.css";

const TAGS_COLLAPSED = 10;

type DistrictOption = { slug: string; name: string; count: number };

type Props = {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  districts: DistrictOption[];
  district: string;
  onDistrict: (slug: string) => void;
  tags: TagInfo[];
  selectedTags: string[];
  onToggleTag: (key: string) => void;
  onlySale: boolean;
  onOnlySale: (value: boolean) => void;
  hideAi: boolean;
  onHideAi: (value: boolean) => void;
  canReset: boolean;
  onReset: () => void;
};

export default function FilterPanel({
  open,
  onClose,
  resultCount,
  districts,
  district,
  onDistrict,
  tags,
  selectedTags,
  onToggleTag,
  onlySale,
  onOnlySale,
  hideAi,
  onHideAi,
  canReset,
  onReset,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const shownTags = showAllTags
  ? tags
  : tags.filter((t, i) => i < TAGS_COLLAPSED || selectedTags.includes(t.key));
  const hiddenTags = tags.length - shownTags.length;

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={`${uid}-title`}
      onClose={onClose} // срабатывает и на Esc
      onClick={(e) => {
        // клик по затемнению (не по самой панели) закрывает её
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.box}>
        <div className={styles.head}>
          <h2 id={`${uid}-title`}>Фильтры</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть фильтры">
            ×
          </button>
        </div>

        <div className={styles.body}>
          {districts.length > 1 && (
            <section aria-labelledby={`${uid}-district`}>
              <h3 id={`${uid}-district`}>Район</h3>
              <div className={styles.chips}>
                <button
                  type="button"
                  className={styles.chip}
                  aria-pressed={district === "all"}
                  onClick={() => onDistrict("all")}
                >
                  Все
                </button>
                {districts.map((d) => (
                  <button
                    key={d.slug}
                    type="button"
                    className={styles.chip}
                    aria-pressed={district === d.slug}
                    disabled={d.count === 0 && district !== d.slug}
                    onClick={() => onDistrict(district === d.slug ? "all" : d.slug)}
                  >
                    {d.name} <span className={styles.count}>{d.count}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {tags.length > 0 && (
            <section aria-labelledby={`${uid}-tags`}>
                <h3 id={`${uid}-tags`}>Теги</h3>
                {selectedTags.length > 1 && (
                <p className={styles.hint}>Показываются работы со всеми выбранными тегами.</p>
                )}
                <div className={styles.chips}>
                {shownTags.map((t) => {
                    const selected = selectedTags.includes(t.key);
                    return (
                    <button
                        key={t.key}
                        type="button"
                        className={styles.chip}
                        aria-pressed={selected}
                        disabled={t.count === 0 && !selected}
                        onClick={() => onToggleTag(t.key)}
                    >
                        #{t.name}
                        {!selected && <span className={styles.count}>{t.count}</span>}
                    </button>
                    );
                })}
                {(hiddenTags > 0 || showAllTags) && tags.length > TAGS_COLLAPSED && (
                    <button
                    type="button"
                    className={`${styles.chip} ${styles.more}`}
                    aria-expanded={showAllTags}
                    onClick={() => setShowAllTags((v) => !v)}
                    >
                    {showAllTags ? "Свернуть" : `Ещё ${hiddenTags}`}
                    </button>
                )}
                </div>
            </section>
            )}

          <section aria-labelledby={`${uid}-show`}>
            <h3 id={`${uid}-show`}>Показывать</h3>
            <label className={styles.switch}>
              <span>Только в продаже</span>
              <input
                type="checkbox"
                role="switch"
                checked={onlySale}
                onChange={(e) => onOnlySale(e.target.checked)}
              />
            </label>
            <label className={styles.switch}>
              <span>Скрыть работы с ИИ</span>
              <input
                type="checkbox"
                role="switch"
                checked={hideAi}
                onChange={(e) => onHideAi(e.target.checked)}
              />
            </label>
          </section>
        </div>

        <div className={styles.foot}>
          <button type="button" className={styles.reset} disabled={!canReset} onClick={onReset}>
            Сбросить
          </button>
          <button
            type="button"
            className={styles.apply}
            disabled={resultCount === 0}
            onClick={onClose}
          >
            {resultCount > 0 ? `Показать ${resultCount}` : "Ничего не найдено"}
          </button>
          <p className={styles.srOnly} role="status">
            Найдено работ: {resultCount}
          </p>
        </div>
      </div>
    </dialog>
  );
}