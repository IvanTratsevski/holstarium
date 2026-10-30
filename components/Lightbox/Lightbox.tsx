"use client";

import { useEffect, useRef } from "react";
import type { Artwork } from "@/types";
import styles from "./Lightbox.module.css";
import Link from "next/link";
import type { LightboxItem } from "@/types";

type Props = {
  artworks: LightboxItem[]; // все работы по порядку
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export default function Lightbox({ artworks, index, onClose, onChange }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = index !== null;
  const art = index !== null ? artworks[index] : null;
  const total = artworks.length;

  // синхронизируем состояние React с нативным <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const go = (step: number) => {
    if (index === null) return;
    onChange((index + step + total) % total);
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      data-close="true"
      onClose={onClose} // срабатывает и на Esc
      onClick={(e) => {
        // клик по затемнению (не по самой работе) закрывает окно
        if ((e.target as HTMLElement).dataset.close) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      aria-label={art ? art.title : "Просмотр работы"}
    >
      {art && (
        <div className={styles.inner} data-close="true">
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>

          {total > 1 && (
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
              <img src={art.imageUrl} alt={art.title} className={styles.image} />
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
  {art.description && <p>{art.description}</p>}
  {art.authorName && art.authorHref && (
    <p>
      <Link href={art.authorHref} className={styles.author}>
        Автор: {art.authorName} → в лавку
      </Link>
    </p>
  )}
  <small>
    {index! + 1} / {total}
  </small>
</figcaption>
          </figure>

          {total > 1 && (
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