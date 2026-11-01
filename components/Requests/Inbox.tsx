"use client";

import { useState } from "react";
import Link from "next/link";
import { STATUS_LABELS, isEmail } from "@/lib/requests";
import { deleteRequest, setRequestStatus } from "@/lib/requestActions";
import { useSocial } from "@/components/Social/SocialProvider";
import styles from "./Requests.module.css";

const fmt = (ts: number) =>
  new Date(ts).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Inbox({ stallSlug }: { stallSlug: string }) {
  const { state } = useSocial();
  const [onlyNew, setOnlyNew] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const all = state.requests
    .filter((r) => r.stallSlug === stallSlug)
    .sort((a, b) => b.createdAt - a.createdAt);
  const newCount = all.filter((r) => r.status === "new").length;
  const list = onlyNew ? all.filter((r) => r.status === "new") : all;

  return (
    <section className={styles.inbox} aria-label="Входящие запросы">
      <h2>Входящие запросы</h2>
      <p className={styles.info}>
        Здесь приходят запросы на покупку и индивидуальные заказы. Ответить можно по контакту,
        который оставил человек. Сайт не участвует в сделке, поэтому перед оплатой и отправкой
        работы прочитайте <Link href="/rules">памятку по безопасности</Link>.
      </p>

      <div className={styles.filters} role="group" aria-label="Фильтр запросов">
        <button type="button" aria-pressed={!onlyNew} onClick={() => setOnlyNew(false)}>
          Все ({all.length})
        </button>
        <button type="button" aria-pressed={onlyNew} onClick={() => setOnlyNew(true)}>
          Новые ({newCount})
        </button>
      </div>

      {list.length === 0 ? (
        <p className={styles.emptyInbox}>
          {all.length === 0
            ? "Запросов пока нет. Когда кто-то нажмёт «Запросить» под вашей работой или «Заказать работу» в шапке, запрос появится здесь."
            : "Новых запросов нет."}
        </p>
      ) : (
        <ul className={styles.items}>
          {list.map((r) => (
            <li key={r.id} className={`${styles.item} ${r.status === "new" ? styles.itemNew : ""}`}>
              <div className={styles.itemHead}>
                <strong>{r.fromName}</strong>
                <time dateTime={new Date(r.createdAt).toISOString()}>{fmt(r.createdAt)}</time>
                <span
                  className={`${styles.statusTag} ${
                    r.status === "new"
                      ? styles.tagNew
                      : r.status === "read"
                        ? styles.tagRead
                        : styles.tagReplied
                  }`}
                >
                  {STATUS_LABELS[r.status]}
                </span>
              </div>

              <p className={styles.work}>
                {r.workTitle ? `Работа: «${r.workTitle}»` : "Индивидуальный заказ"}
              </p>
              <p className={styles.message}>{r.message}</p>
              <p className={styles.contact}>
                Контакт:{" "}
                {isEmail(r.contact) ? (
                  <a
                    href={`mailto:${r.contact}?subject=${encodeURIComponent(
                      `Holstarium: ${r.workTitle ?? "заказ"}`
                    )}`}
                  >
                    {r.contact}
                  </a>
                ) : (
                  r.contact
                )}
              </p>

              <div className={styles.itemActions}>
                {r.status === "new" && (
                  <button type="button" onClick={() => setRequestStatus(r.id, "read")}>
                    Отметить прочитанным
                  </button>
                )}
                {r.status !== "replied" && (
                  <button type="button" onClick={() => setRequestStatus(r.id, "replied")}>
                    Отметить отвеченным
                  </button>
                )}
                <button type="button" onClick={() => setConfirmId(confirmId === r.id ? null : r.id)}>
                  Удалить
                </button>
              </div>

              {confirmId === r.id && (
                <div className={styles.confirm} role="alertdialog" aria-label="Подтверждение удаления">
                  <span>Удалить запрос?</span>
                  <button
                    type="button"
                    className={styles.danger}
                    onClick={() => {
                      deleteRequest(r.id);
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}