"use client";

import { useState } from "react";
import Link from "next/link";
import type { PostImage, PostView } from "@/types";
import { POST_MAX, formatPostDate, postRef } from "@/lib/posts";
import { withBase } from "@/lib/withBase";
import LikeButton from "@/components/Social/LikeButton";
import CommentsBar from "@/components/Comments/CommentsBar";
import styles from "./Posts.module.css";

export type PostOwnerActions = {
  onTogglePin: (id: string) => void;
  onEdit: (id: string, text: string) => string | null; // текст ошибки или null
  onDelete: (id: string) => void;
};

type Props = {
  post: PostView;
  showAuthor?: boolean;   // в общей ленте показываем, чей это пост
  canModerate?: boolean;  // смотрит владелец этой лавки
  owner?: PostOwnerActions;
  onOpenImage: (index: number) => void;
};

const LONG_TEXT = 400;

// слишком вытянутые картинки слегка обрезаются, целиком их видно в лайтбоксе
const clampRatio = (img: PostImage) => Math.min(2, Math.max(0.8, img.aspectRatio ?? 1.5));

export default function PostCard({
  post,
  showAuthor = false,
  canModerate = false,
  owner,
  onOpenImage,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const ref = postRef(post.stallSlug, post.id);
  const long = post.text.length > LONG_TEXT;
  const count = post.images.length;

  const startEdit = () => {
    setEditText(post.text);
    setEditError("");
    setConfirming(false);
    setEditing(true);
  };

  const saveEdit = () => {
    const err = owner?.onEdit(post.id, editText) ?? null;
    if (err) setEditError(err);
    else setEditing(false);
  };

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        {showAuthor && (
          <Link href={`/stall/${post.stallSlug}`} className={styles.author}>
            <span
              className={styles.avatar}
              style={{ background: post.accentColor }}
              aria-hidden="true"
            >
              {post.artistName.charAt(0).toUpperCase()}
            </span>
            {post.artistName}
          </Link>
        )}
        <span className={styles.meta}>
          {post.pinned && !showAuthor && <span className={styles.pin}>📌 Закреплено</span>}
          <time dateTime={new Date(post.createdAt).toISOString()}>
            {formatPostDate(post.createdAt)}
          </time>
          {post.editedAt && <span>изменено</span>}
        </span>
      </header>

      {editing ? (
        <div className={styles.editBox}>
          <textarea
            className={styles.textarea}
            rows={5}
            maxLength={POST_MAX}
            value={editText}
            aria-label="Изменить объявление"
            onChange={(e) => setEditText(e.target.value)}
          />
          {editError && (
            <p className={styles.error} role="alert">
              {editError}
            </p>
          )}
          <div className={styles.row}>
            <button type="button" className={styles.primary} onClick={saveEdit}>
              Сохранить
            </button>
            <button type="button" className={styles.btn} onClick={() => setEditing(false)}>
              Отмена
            </button>
          </div>
        </div>
      ) : (
        post.text && (
          <>
            <p className={`${styles.text} ${long && !expanded ? styles.textClamp : ""}`}>
              {post.text}
            </p>
            {long && (
              <button
                type="button"
                className={styles.more}
                aria-expanded={expanded}
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Свернуть" : "Читать полностью"}
              </button>
            )}
          </>
        )
      )}

      {count > 0 && (
        <ul className={`${styles.images} ${styles[`n${count}`]}`}>
          {post.images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                className={styles.imgBtn}
                style={count === 1 ? { aspectRatio: clampRatio(img) } : undefined}
                aria-label={`Открыть картинку ${i + 1} из ${count}`}
                onClick={() => onOpenImage(i)}
              >
                {img.imageUrl ? (
                  <img src={withBase(img.imageUrl)} alt="" />
                ) : (
                  <span
                    className={styles.imgPlaceholder}
                    style={{ background: img.placeholderColor }}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className={styles.foot}>
        <LikeButton refKey={ref} />
        <CommentsBar key={ref} refKey={ref} canModerate={canModerate} tone="page" />

        {owner && (
          <div className={styles.ownerActions}>
            <button type="button" onClick={() => owner.onTogglePin(post.id)}>
              {post.pinned ? "Открепить" : "Закрепить"}
            </button>
            <button type="button" onClick={startEdit}>
              Изменить
            </button>
            <button type="button" onClick={() => setConfirming((v) => !v)}>
              Удалить
            </button>
          </div>
        )}
      </footer>

      {confirming && owner && (
        <div className={styles.confirm} role="alertdialog" aria-label="Подтверждение удаления">
          <span>Удалить объявление? Лайки и комментарии к нему тоже пропадут.</span>
          <button type="button" className={styles.danger} onClick={() => owner.onDelete(post.id)}>
            Да, удалить
          </button>
          <button type="button" className={styles.btn} onClick={() => setConfirming(false)}>
            Отмена
          </button>
        </div>
      )}
    </article>
  );
}