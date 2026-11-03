"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import type { LightboxItem } from "@/types";
import { formatPrice } from "@/lib/sale";
import { withBase } from "@/lib/withBase";
import AiBadge from "@/components/Badges/AiBadge";
import CommentsBar from "@/components/Comments/CommentsBar";
import RequestButton from "@/components/Requests/RequestButton";
import LikeButton from "@/components/Social/LikeButton";
import SaveButton from "@/components/Social/SaveButton";
import styles from "./Lightbox.module.css";

export type LuckyControls = {
  onNext: () => void;
  onBack: () => void;
  canBack: boolean;
};

type Props = {
  artworks: LightboxItem[]; // все работы по порядку
  index: number | null;     // null = закрыто
  onClose: () => void;
  onChange: (index: number) => void;
  onTagClick?: (key: string) => void; // если не передан, теги просто показываются
  canModerate?: boolean;               // смотрит владелец этой лавки
  lucky?: LuckyControls;               // режим «Мне повезёт»: вместо стрелок кнопки
};

export default function Lightbox({
  artworks,
  index,
  onClose,
  onChange,
  onTagClick,
  canModerate = false,
  lucky,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const total = artworks.length;
  const art = index !== null ? (artworks[index] ?? null) : null;
  const isOpen = art !== null;

  // синхронизируем состояние React с нативным <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const go = (step: number) => {
    if (index === null || total === 0) return;
    onChange((index + step + total) % total);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "ArrowRight") {
      if (lucky) lucky.onNext();
      else go(1);
    }
    if (e.key === "ArrowLeft") {
      if (lucky) {
        if (lucky.canBack) lucky.onBack();
      } else {
        go(-1);
      }
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} force-dark`}
      data-close="true"
      onClose={onClose} // срабатывает и на Esc
      onClick={(e) => {
        // клик по затемнению (не по самой работе) закрывает окно
        if ((e.target as HTMLElement).dataset.close) onClose();
      }}
      onKeyDown={onKeyDown}
      aria-label={art ? art.title : "Просмотр работы"}
    >
      {art && (
        <div className={styles.inner} data-close="true">
          {lucky && (
            <span className={styles.luckyLabel}>
              <span aria-hidden="true">🎲</span> Случайная работа
            </span>
          )}

          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
            ×
          </button>

          {!lucky && total > 1 && (
            <button
              type="button"
              className={`${styles.nav} ${styles.prev}`}
              onClick={() => go(-1)}
              aria-label="Предыдущая работа"
            >
              ‹
            </button>
          )}

          <figure className={styles.figure}>
            {art.imageUrl ? (
              <img src={withBase(art.imageUrl)} alt={art.alt || art.title} className={styles.image} />
            ) : (
              <div
                className={styles.placeholder}
                style={{ background: art.placeholderColor }}
                role="img"
                aria-label={art.title}
              />
            )}

            <figcaption className={styles.caption}>
              <h2>{art.title}</h2>

              {art.aiGenerated && (
                <p>
                  <AiBadge variant="inline" />
                </p>
              )}

              {art.description && <p>{art.description}</p>}

              {art.sale && (
                <p className={styles.price}>
                  <strong>{formatPrice(art.sale)}</strong>
                  {art.sale.note && <span> · {art.sale.note}</span>}
                </p>
              )}

              {art.ref && (
                <div className={styles.actions}>
                  <LikeButton refKey={art.ref} />
                  <SaveButton refKey={art.ref} />
                  <CommentsBar key={art.ref} refKey={art.ref} canModerate={canModerate} />
                  {art.sale && (
                    <RequestButton
                      stallSlug={art.stallSlug ?? art.ref.split(":")[0]}
                      artistName={art.authorName ?? ""}
                      defaultOpen={!!art.acceptsOrders}
                      work={{ ref: art.ref, title: art.title, priceText: formatPrice(art.sale) }}
                      secondary={!!lucky}
                    />
                  )}
                </div>
              )}

              {art.tagList && art.tagList.length > 0 && (
                <ul className={styles.tags}>
                  {art.tagList.map((t) => (
                    <li key={t.key}>
                      {onTagClick ? (
                        <button type="button" className={styles.tag} onClick={() => onTagClick(t.key)}>
                          #{t.name}
                        </button>
                      ) : (
                        <span className={styles.tag}>#{t.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {art.authorName && art.authorHref && (
                <p>
                  <Link href={art.authorHref} className={styles.author} onClick={onClose}>
                    Автор: {art.authorName} → в лавку
                  </Link>
                </p>
              )}

              {lucky ? (
                <>
                  <div className={styles.luckyRow}>
                    <button
                      type="button"
                      className={styles.luckyBack}
                      onClick={lucky.onBack}
                      disabled={!lucky.canBack}
                    >
                      ← Назад
                    </button>
                    <button type="button" className={styles.luckyNext} onClick={lucky.onNext}>
                      <span aria-hidden="true">🎲</span> Ещё одну
                    </button>
                  </div>
                  <p className={styles.srOnly} role="status">
                    Случайная работа: {art.title}
                    {art.authorName ? `, автор ${art.authorName}` : ""}
                  </p>
                </>
              ) : (
                <small>
                  {(index ?? 0) + 1} / {total}
                </small>
              )}
            </figcaption>
          </figure>

          {!lucky && total > 1 && (
            <button
              type="button"
              className={`${styles.nav} ${styles.next}`}
              onClick={() => go(1)}
              aria-label="Следующая работа"
            >
              ›
            </button>
          )}
        </div>
      )}
    </dialog>
  );
}