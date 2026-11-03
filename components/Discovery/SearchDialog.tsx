"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import type { FeedItem } from "@/types";
import { formatPrice } from "@/lib/sale";
import { MIN_QUERY, searchAll } from "@/lib/search";
import type { SearchIndex } from "@/lib/search";
import { withBase } from "@/lib/withBase";
import styles from "./Search.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  index: SearchIndex;
  hideAi: boolean;
  onOpenWork: (item: FeedItem) => void;
};

export default function SearchDialog({ open, onClose, index, hideAi, onOpenWork }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const q = query.trim();
  const searching = q.length >= MIN_QUERY;
  const result = searchAll(index, q, hideAi);
  const found = result.artistsTotal + result.worksTotal;

  // стрелки вверх и вниз переходят по результатам
  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const dialog = ref.current;
    if (!dialog) return;
    const items = Array.from(dialog.querySelectorAll<HTMLElement>("[data-result]"));
    if (items.length === 0) return;
    e.preventDefault();
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      items[Math.min(i + 1, items.length - 1)].focus();
    } else if (i <= 0) {
      dialog.querySelector<HTMLInputElement>("input")?.focus();
    } else {
      items[i - 1].focus();
    }
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label="Поиск по сайту"
      onClose={() => {
        setQuery("");
        onClose();
      }}
      onClick={(e) => {
        // клик по затемнению закрывает окно
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div className={styles.box}>
        <div className={styles.bar}>
          <input
            type="search"
            className={styles.input}
            placeholder="Художник, лавка или работа"
            aria-label="Поиск по сайту"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть поиск">
            ×
          </button>
        </div>

        <div className={styles.results}>
          {!searching ? (
            <p className={styles.hint}>
              Введите хотя бы {MIN_QUERY} символа: ник художника, название лавки, района или работы,
              тег. Например: «Анна», «пейзаж», «акварель».
            </p>
          ) : found === 0 ? (
            <p className={styles.hint}>
              По запросу «{q}» ничего не нашлось. Проверьте написание или попробуйте короче.
            </p>
          ) : (
            <>
              {result.artists.length > 0 && (
                <section aria-labelledby="search-artists">
                  <h2 id="search-artists" className={styles.heading}>
                    Художники
                    {result.artistsTotal > result.artists.length && (
                      <span className={styles.more}>
                        {" "}
                        ({result.artists.length} из {result.artistsTotal})
                      </span>
                    )}
                  </h2>
                  <ul className={styles.list}>
                    {result.artists.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`/stall/${a.slug}`}
                          className={styles.row}
                          data-result
                          onClick={onClose}
                        >
                          <span className={styles.avatar} style={{ background: a.accentColor }}>
                            {a.artistName.charAt(0).toUpperCase()}
                          </span>
                          <span className={styles.text}>
                            <strong>{a.artistName}</strong>
                            <small>
                              {a.signText} · {a.districtName}
                            </small>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.works.length > 0 && (
                <section aria-labelledby="search-works">
                  <h2 id="search-works" className={styles.heading}>
                    Работы
                    {result.worksTotal > result.works.length && (
                      <span className={styles.more}>
                        {" "}
                        ({result.works.length} из {result.worksTotal})
                      </span>
                    )}
                  </h2>
                  <ul className={styles.list}>
                    {result.works.map((w) => (
                      <li key={w.id}>
                        <button
                          type="button"
                          className={styles.row}
                          data-result
                          onClick={() => onOpenWork(w)}
                        >
                          <span className={styles.thumb} style={{ background: w.placeholderColor }}>
                            {w.imageUrl && <img src={withBase(w.imageUrl)} alt="" />}
                          </span>
                          <span className={styles.text}>
                            <strong>{w.title}</strong>
                            <small>
                              {w.artistName} · {w.districtName}
                              {w.sale ? ` · ${formatPrice(w.sale)}` : ""}
                            </small>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}

          {hideAi && (
            <p className={styles.note}>Работы с ИИ скрыты: так включён фильтр в ленте.</p>
          )}

          <p className={styles.srOnly} role="status">
            {searching ? `Найдено: ${found}` : ""}
          </p>
        </div>

        <p className={styles.tip}>
          <kbd>/</kbd> открывает поиск, <kbd>Esc</kbd> закрывает, стрелки ↑ ↓ переходят по результатам.
        </p>
      </div>
    </dialog>
  );
}