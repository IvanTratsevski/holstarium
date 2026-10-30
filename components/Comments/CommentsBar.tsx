"use client";

import { useId, useState } from "react";
import type { Comment } from "@/types";
import { COMMENT_MAX, REPORT_REASONS, listComments } from "@/lib/comments";
import {
  addComment,
  deleteOwnComment,
  editComment,
  removeComment,
  reportComment,
  setWorkComments,
} from "@/lib/socialActions";
import { useSocial } from "@/components/Social/SocialProvider";
import styles from "./Comments.module.css";

const fmt = (ts: number) =>
  new Date(ts).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

type Props = {
  refKey: string;       // ключ работы «лавка:работа»
  canModerate: boolean; // true, если смотрит владелец этой лавки
};

export default function CommentsBar({ refKey, canModerate }: Props) {
    
  const { state, loggedIn, requireAuth } = useSocial();

  const uid = useId();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reason, setReason] = useState(REPORT_REASONS[0]);

  const stallSlug = refKey.split(":")[0];
  const stallClosed = state.commentsOffStalls.includes(stallSlug);
  const workClosed = state.commentsOffWorks.includes(refKey);
  const closed = stallClosed || workClosed;

  const items = closed ? [] : listComments(refKey, state);
  const count = items.filter((i) => !i.removed).length;

  const submit = () => {
    const res = addComment(refKey, text);
    if (res.ok) {
      setText("");
      setError("");
    } else {
      setError(res.error);
    }
  };

  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditText(c.text);
    setEditError("");
    setConfirmId(null);
    setReportingId(null);
  };

  const saveEdit = (id: string) => {
    const res = editComment(id, editText);
    if (res.ok) setEditingId(null);
    else setEditError(res.error);
  };

  return (
    <>
      <button
        type="button"
        className={styles.openBtn}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">💬</span> Комментарии{!closed && ` (${count})`}
      </button>

      {open && (
        <div
          className={styles.sheet}
          role="region"
          aria-label="Комментарии"
          onKeyDown={(e) => {
            // стрелки и пробел не должны листать работы в лайтбоксе
            e.stopPropagation();
            if (e.key === "Escape") {
              e.preventDefault(); // Esc сначала закрывает панель, а не весь лайтбокс
              setOpen(false);
            }
          }}
        >
          <div className={styles.head}>
            <h3>Комментарии{!closed && ` (${count})`}</h3>
            <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть комментарии">
              ×
            </button>
          </div>

          {canModerate && (
            <div className={styles.modbar}>
              {stallClosed ? (
                <small>Комментарии отключены во всей лавке (настройка в редакторе).</small>
              ) : (
                <button type="button" onClick={() => setWorkComments(refKey, workClosed)}>
                  {workClosed
                    ? "Включить комментарии к этой работе"
                    : "Отключить комментарии к этой работе"}
                </button>
              )}
            </div>
          )}

          {closed ? (
            <p className={styles.closed}>
              {canModerate
                ? "Комментарии отключены. Написанные ранее скрыты, а при включении снова появятся."
                : "Автор отключил комментарии."}
            </p>
          ) : (
            <>
              {items.length === 0 ? (
                <p className={styles.empty}>Пока никто ничего не написал. Будьте первым.</p>
              ) : (
                <ul className={styles.list}>
                  {items.map(({ comment: c, removed }) => {
                    const mine = c.authorId === "me";
                    const reported = state.reports.some((r) => r.commentId === c.id);

                    if (removed) {
                      return (
                        <li key={c.id} className={styles.comment}>
                          <p className={styles.removed}>Комментарий удалён автором лавки</p>
                        </li>
                      );
                    }

                    return (
                      <li key={c.id} className={styles.comment}>
                        <div className={styles.cmeta}>
                          <strong>{c.authorName}</strong>
                          <time dateTime={new Date(c.createdAt).toISOString()}>
                            {fmt(c.createdAt)}
                          </time>
                          {c.editedAt && <span>изменён</span>}
                        </div>

                        {editingId === c.id ? (
                          <div>
                            <textarea
                              className={styles.textarea}
                              rows={3}
                              maxLength={COMMENT_MAX}
                              value={editText}
                              aria-label="Изменить комментарий"
                              onChange={(e) => setEditText(e.target.value)}
                            />
                            {editError && (
                              <p className={styles.error} role="alert">
                                {editError}
                              </p>
                            )}
                            <div className={styles.actions}>
                              <button type="button" className={styles.primary} onClick={() => saveEdit(c.id)}>
                                Сохранить
                              </button>
                              <button type="button" onClick={() => setEditingId(null)}>
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className={styles.text}>{c.text}</p>
                        )}

                        {editingId !== c.id && (
                          <div className={styles.actions}>
                            {mine && (
                              <>
                                <button type="button" onClick={() => startEdit(c)}>
                                  Изменить
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmId(confirmId === c.id ? null : c.id)}
                                >
                                  Удалить
                                </button>
                              </>
                            )}

                            {!mine &&
                              (reported ? (
                                <small>Жалоба отправлена</small>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!requireAuth("Войдите, чтобы отправить жалобу.")) return;
                                    setReportingId(reportingId === c.id ? null : c.id);
                                    setConfirmId(null);
                                  }}
                                >
                                  Пожаловаться
                                </button>
                              ))}

                            {!mine && canModerate && (
                              <button
                                type="button"
                                onClick={() => setConfirmId(confirmId === c.id ? null : c.id)}
                              >
                                Удалить как автор
                              </button>
                            )}
                          </div>
                        )}

                        {confirmId === c.id && (
                          <div className={styles.confirm} role="alertdialog" aria-label="Подтверждение удаления">
                            <span>Удалить комментарий?</span>
                            <button
                              type="button"
                              className={styles.danger}
                              onClick={() => {
                                if (mine) deleteOwnComment(c.id);
                                else removeComment(c.id);
                                setConfirmId(null);
                              }}
                            >
                              Да, удалить
                            </button>
                            <button type="button" onClick={() => setConfirmId(null)}>
                              Отмена
                            </button>
                          </div>
                        )}

                        {reportingId === c.id && (
                          <div className={styles.confirm}>
                            <label>
                              Причина:{" "}
                              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                                {REPORT_REASONS.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <button
                              type="button"
                              className={styles.primary}
                              onClick={() => {
                                reportComment(c, reason);
                                setReportingId(null);
                              }}
                            >
                              Отправить
                            </button>
                            <button type="button" onClick={() => setReportingId(null)}>
                              Отмена
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className={styles.composer}>
                {loggedIn ? (
                  <>
                    <label htmlFor={`${uid}-new`} className={styles.srOnly}>
                      Ваш комментарий
                    </label>
                    <textarea
                      id={`${uid}-new`}
                      className={styles.textarea}
                      rows={3}
                      maxLength={COMMENT_MAX}
                      placeholder="Напишите комментарий…"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <div className={styles.cfoot}>
                      <small>
                        {text.length} / {COMMENT_MAX}
                      </small>
                      <button type="button" className={styles.primary} onClick={submit}>
                        Отправить
                      </button>
                    </div>
                    {error && (
                      <p className={styles.error} role="alert">
                        {error}
                      </p>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => requireAuth("Войдите, чтобы оставлять комментарии.")}
                  >
                    Войти, чтобы комментировать
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}