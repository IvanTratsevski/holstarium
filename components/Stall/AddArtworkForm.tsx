"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import type { Artwork, TagInfo } from "@/types";
import { ALLOWED_TYPES, MAX_FILE_MB } from "@/lib/artworks";
import ArtworkFields from "./ArtworkFields";
import type { ArtworkFieldsValue } from "./ArtworkFields";
import styles from "./ArtworkManager.module.css";

const EMPTY: ArtworkFieldsValue = { title: "", description: "", alt: "", tags: [] };

type Props = {
  catalog: TagInfo[];
  disabled: boolean;
  onAdd: (art: Artwork) => void;
};

export default function AddArtworkForm({ catalog, disabled, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<{ url: string; aspect: number | null } | null>(null);
  const [fields, setFields] = useState<ArtworkFieldsValue>(EMPTY);
  const [error, setError] = useState("");

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // чтобы можно было выбрать тот же файл ещё раз
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Подойдут JPG, PNG, WebP и GIF.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Файл больше ${MAX_FILE_MB} МБ.`);
      return;
    }
    setError("");

    if (preview) URL.revokeObjectURL(preview.url);
    const url = URL.createObjectURL(file);
    setPreview({ url, aspect: null });

    // узнаём пропорции, чтобы лента не «прыгала»
    const img = new window.Image();
    img.onload = () =>
      setPreview((p) =>
        p && p.url === url ? { ...p, aspect: img.naturalWidth / img.naturalHeight } : p
      );
    img.src = url;

    // название по умолчанию: имя файла без расширения
    setFields((f) =>
      f.title ? f : { ...f, title: file.name.replace(/\.[^.]+$/, "").slice(0, 60) }
    );
  };

  const reset = () => {
    setFields(EMPTY);
    setError("");
    setOpen(false);
  };

  const cancel = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
    reset();
  };

  const submit = () => {
    if (!preview) {
      setError("Сначала выберите файл.");
      return;
    }
    onAdd({
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: fields.title.trim() || "Без названия",
      description: fields.description.trim() || undefined,
      alt: fields.alt.trim() || undefined,
      tags: fields.tags,
      imageUrl: preview.url, // адрес не освобождаем: теперь им пользуется работа
      aspectRatio: preview.aspect ?? 1,
      sortOrder: 0,
      isFeatured: true,
    });
    setPreview(null);
    reset();
  };

  if (!open) {
    return (
      <button type="button" className={styles.btn} disabled={disabled} onClick={() => setOpen(true)}>
        + Добавить работу
      </button>
    );
  }

  return (
    <div className={styles.addForm}>
      <h3>Новая работа</h3>

      <label className={styles.field}>
        <span>Файл (JPG, PNG, WebP, GIF, до {MAX_FILE_MB} МБ)</span>
        <input type="file" accept={ALLOWED_TYPES.join(",")} onChange={onFile} />
      </label>

      {preview && <img src={preview.url} alt="Предпросмотр выбранной работы" className={styles.preview} />}

      <ArtworkFields value={fields} onChange={(p) => setFields((f) => ({ ...f, ...p }))} catalog={catalog} />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.row}>
        <button type="button" className={styles.primary} onClick={submit}>
          Добавить в лавку
        </button>
        <button type="button" className={styles.btn} onClick={cancel}>
          Отмена
        </button>
      </div>
    </div>
  );
}