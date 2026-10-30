"use client";

import { useState } from "react";
import type { Artwork, StallData, TagInfo, Theme } from "@/types";
import { getStallLayout } from "@/lib/stallLayout";
import {
  MAX_ARTWORKS,
  addArtwork,
  moveArtwork,
  removeArtwork,
  sortArtworks,
  updateArtwork,
} from "@/lib/artworks";
import { withBase } from "@/lib/withBase";
import AddArtworkForm from "./AddArtworkForm";
import ArtworkFields from "./ArtworkFields";
import styles from "./ArtworkManager.module.css";

type Props = {
  stall: StallData;
  theme: Theme;
  catalog: TagInfo[];
  onChange: (artworks: Artwork[]) => void;
};

export default function ArtworkManager({ stall, theme, catalog, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const { counter, featured } = getStallLayout(stall, theme);
  const onCounter = new Set(featured.map((a) => a.id));
  const sorted = sortArtworks(stall.artworks);

  const move = (a: Artwork, dir: -1 | 1) => {
    const next = moveArtwork(stall.artworks, a.id, dir);
    onChange(next);
    const pos = next.find((x) => x.id === a.id)?.sortOrder ?? 0;
    setStatus(`«${a.title}»: позиция ${pos} из ${next.length}`);
  };

  const toggleFeatured = (a: Artwork) => {
    onChange(updateArtwork(stall.artworks, a.id, { isFeatured: !a.isFeatured }));
    setStatus(a.isFeatured ? `«${a.title}» убрана из избранного` : `«${a.title}» в избранном`);
  };

  const remove = (a: Artwork) => {
    if (a.imageUrl?.startsWith("blob:")) URL.revokeObjectURL(a.imageUrl);
    onChange(removeArtwork(stall.artworks, a.id));
    setConfirmId(null);
    if (editingId === a.id) setEditingId(null);
    setStatus(`«${a.title}» удалена`);
  };

  const placeText = (a: Artwork) =>
    onCounter.has(a.id)
      ? "На прилавке"
      : a.isFeatured
        ? "В галерее (на прилавке нет места)"
        : "В галерее";

  return (
    <div>
      <h2>Мои работы ({sorted.length})</h2>
      <p className={styles.info}>
        На прилавке помещается {counter.slots.length}: туда попадают первые избранные работы по
        порядку, остальные показываются в блоке «Все работы».
      </p>

      <AddArtworkForm
        catalog={catalog}
        disabled={sorted.length >= MAX_ARTWORKS}
        onAdd={(art) => {
          onChange(addArtwork(stall.artworks, art));
          setStatus(`«${art.title}» добавлена в начало`);
        }}
      />
      {sorted.length >= MAX_ARTWORKS && (
        <p className={styles.warn}>Достигнут лимит: {MAX_ARTWORKS} работ.</p>
      )}

      {sorted.length === 0 ? (
        <p>В лавке пока нет работ.</p>
      ) : (
        <ul className={styles.list}>
          {sorted.map((a, i) => (
            <li key={a.id} className={styles.item}>
              <div className={styles.row}>
                {a.imageUrl ? (
                  <img src={withBase(a.imageUrl)} alt="" className={styles.thumb} />
                ) : (
                  <span className={styles.thumb} style={{ background: a.placeholderColor }} />
                )}

                <div className={styles.titleBox}>
                  <strong>{a.title || "Без названия"}</strong>
                  <small className={onCounter.has(a.id) ? styles.onCounter : undefined}>
                    {i + 1}. {placeText(a)}
                  </small>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    aria-label={`Поднять выше: ${a.title}`}
                    disabled={i === 0}
                    onClick={() => move(a, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Опустить ниже: ${a.title}`}
                    disabled={i === sorted.length - 1}
                    onClick={() => move(a, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`В избранное: ${a.title}`}
                    aria-pressed={a.isFeatured}
                    className={a.isFeatured ? styles.starOn : undefined}
                    onClick={() => toggleFeatured(a)}
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    aria-label={`Редактировать: ${a.title}`}
                    aria-expanded={editingId === a.id}
                    onClick={() => setEditingId(editingId === a.id ? null : a.id)}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    aria-label={`Удалить: ${a.title}`}
                    onClick={() => setConfirmId(confirmId === a.id ? null : a.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {confirmId === a.id && (
                <div className={styles.confirm} role="alertdialog" aria-label="Подтверждение удаления">
                  <span>Удалить «{a.title}»?</span>
                  <button type="button" className={styles.danger} onClick={() => remove(a)}>
                    Да, удалить
                  </button>
                  <button type="button" className={styles.btn} onClick={() => setConfirmId(null)}>
                    Отмена
                  </button>
                </div>
              )}

              {editingId === a.id && (
                <ArtworkFields
                  value={{
                    title: a.title,
                    description: a.description ?? "",
                    alt: a.alt ?? "",
                    tags: a.tags ?? [],
                  }}
                  onChange={(patch) => onChange(updateArtwork(stall.artworks, a.id, patch))}
                  catalog={catalog}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <p className={styles.srOnly} role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}