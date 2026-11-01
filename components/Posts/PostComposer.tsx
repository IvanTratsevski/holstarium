"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import type { Post, PostImage } from "@/types";
import { ALLOWED_TYPES, MAX_FILE_MB } from "@/lib/artworks";
import { MAX_POST_IMAGES, POST_MAX, validatePost } from "@/lib/posts";
import { withBase } from "@/lib/withBase";
import styles from "./Posts.module.css";

type Props = {
  // возвращает текст ошибки или null, если пост опубликован
  onPublish: (post: Post) => string | null;
};

export default function PostComposer({ onPublish }: Props) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<PostImage[]>([]);
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState("");

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // чтобы тот же файл можно было выбрать снова
    if (files.length === 0) return;

    const room = MAX_POST_IMAGES - images.length;
    const added: PostImage[] = [];
    let problem = "";

    for (const file of files) {
      if (added.length >= room) {
        problem = `Можно прикрепить не больше ${MAX_POST_IMAGES} картинок.`;
        break;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        problem = "Подойдут JPG, PNG, WebP и GIF.";
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        problem = `Файл «${file.name}» больше ${MAX_FILE_MB} МБ.`;
        continue;
      }

      const id = `pimg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const url = URL.createObjectURL(file);
      added.push({ id, imageUrl: url, alt: "" });

      // узнаём пропорции, чтобы сетка выглядела ровно
      const probe = new window.Image();
      probe.onload = () =>
        setImages((list) =>
          list.map((x) =>
            x.id === id ? { ...x, aspectRatio: probe.naturalWidth / probe.naturalHeight } : x
          )
        );
      probe.src = url;
    }

    setImages((list) => [...list, ...added]);
    setError(problem);
  };

  const removeImage = (id: string) => {
    const target = images.find((x) => x.id === id);
    if (target?.imageUrl) URL.revokeObjectURL(target.imageUrl);
    setImages(images.filter((x) => x.id !== id));
  };

  const submit = () => {
    const invalid = validatePost(text, images.length);
    if (invalid) {
      setError(invalid);
      return;
    }
    const post: Post = {
      id: `post-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: text.trim(),
      images,
      createdAt: Date.now(),
      pinned,
    };
    const err = onPublish(post);
    if (err) {
      setError(err);
      return;
    }
    // картинки теперь принадлежат посту, поэтому здесь их не освобождаем
    setText("");
    setImages([]);
    setPinned(false);
    setError("");
  };

  return (
    <section className={styles.composer} aria-label="Новое объявление">
      <h2>Новое объявление</h2>

      <label className={styles.field}>
        <span>Текст</span>
        <textarea
          className={styles.textarea}
          rows={4}
          maxLength={POST_MAX}
          placeholder="Идеи, планы, новые работы, открытие заказов…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <small className={styles.count}>
          {text.length} / {POST_MAX}
        </small>
      </label>

      <label className={styles.field}>
        <span>
          Картинки (до {MAX_POST_IMAGES}; JPG, PNG, WebP, GIF до {MAX_FILE_MB} МБ)
        </span>
        <input
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          disabled={images.length >= MAX_POST_IMAGES}
          onChange={onFiles}
        />
      </label>

      {images.length > 0 && (
        <ul className={styles.previews}>
          {images.map((img, i) => (
            <li key={img.id} className={styles.preview}>
              {img.imageUrl && <img src={withBase(img.imageUrl)} alt={`Картинка ${i + 1}`} />}
              <button
                type="button"
                className={styles.previewRemove}
                aria-label={`Убрать картинку ${i + 1}`}
                onClick={() => removeImage(img.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className={styles.check}>
        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
        Закрепить вверху (прежнее закреплённое открепится)
      </label>

      <button type="button" className={styles.primary} onClick={submit}>
        Опубликовать
      </button>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}