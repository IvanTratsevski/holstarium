"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { REQUEST_MAX } from "@/lib/requests";
import { sendRequest } from "@/lib/requestActions";
import { useSocial } from "@/components/Social/SocialProvider";
import styles from "./Requests.module.css";

export type RequestTarget = {
  stallSlug: string;
  artistName: string;
  work?: { ref: string; title: string; priceText?: string };
};

type Ctx = { openRequest: (target: RequestTarget) => void };

const RequestContext = createContext<Ctx | null>(null);

export function useRequests() {
  const ctx = useContext(RequestContext);
  if (!ctx) throw new Error("useRequests нужно вызывать внутри RequestProvider");
  return ctx;
}

export default function RequestProvider({ children }: { children: ReactNode }) {
  const { requireAuth } = useSocial();
  const [target, setTarget] = useState<RequestTarget | null>(null);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (target !== null && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (target === null && dialog.open) dialog.close();
  }, [target]);

  const openRequest = (t: RequestTarget) => {
    if (!requireAuth("Войдите, чтобы отправить запрос автору.")) return;
    setMessage("");
    setError("");
    setSent(false);
    setTarget(t);
  };

  const close = () => setTarget(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!target) return;
    const res = sendRequest({
      stallSlug: target.stallSlug,
      ref: target.work?.ref ?? null,
      workTitle: target.work?.title ?? null,
      message,
      contact,
    });
    if (res.ok) {
      setSent(true);
      setError("");
    } else {
      setError(res.error);
    }
  };

  return (
    <RequestContext.Provider value={{ openRequest }}>
      {children}

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="request-title"
        onClose={() => setTarget(null)}
      >
        {target &&
          (sent ? (
            <div role="status">
              <h2 id="request-title">Запрос отправлен</h2>
              <p>
                Автор ({target.artistName}) увидит его во «Входящих» и ответит по указанному
                контакту. Сроки ответа зависят от автора, сайт их не контролирует.
              </p>
              <p className={styles.hint}>
                В прототипе запросы хранятся только в вашем браузере. Чтобы увидеть, как это
                выглядит у автора, переключитесь на «Владелец» и откройте у этой лавки вкладку
                «Входящие».
              </p>
              <div className={styles.row}>
                <button type="button" className={styles.primary} onClick={close}>
                  Закрыть
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 id="request-title">
                {target.work
                  ? `Запрос по работе «${target.work.title}»`
                  : "Запрос на индивидуальный заказ"}
              </h2>
              <p className={styles.sub}>
                Автор: {target.artistName}
                {target.work?.priceText && <> · {target.work.priceText}</>}
              </p>

              <label className={styles.field}>
                <span>Сообщение</span>
                <textarea
                  data-autofocus
                  className={styles.textarea}
                  rows={5}
                  maxLength={REQUEST_MAX}
                  placeholder={
                    target.work
                      ? "Что именно вас интересует: оригинал, печать, размер…"
                      : "Что вы хотите заказать, сроки, примерный бюджет…"
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <small className={styles.count}>
                  {message.length} / {REQUEST_MAX}
                </small>
              </label>

              <label className={styles.field}>
                <span>Как с вами связаться</span>
                <input
                  type="text"
                  className={styles.input}
                  maxLength={80}
                  placeholder="почта или @ник в мессенджере"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
                <small className={styles.hint}>
                  Контакт увидит только автор. Публично он не показывается.
                </small>
              </label>

              <p className={styles.safety}>
                Сайт только помогает связаться с автором. Он не участвует в сделках, не принимает
                оплату и не отвечает за их исход. Договоритесь об условиях заранее, не
                отправляйте предоплату без проверки и не переходите по подозрительным ссылкам.{" "}
                <Link href="/rules" target="_blank" rel="noopener">
                  Памятка по безопасности
                </Link>
              </p>

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <div className={styles.row}>
                <button type="submit" className={styles.primary}>
                  Отправить запрос
                </button>
                <button type="button" className={styles.secondary} onClick={close}>
                  Отмена
                </button>
              </div>
            </form>
          ))}
      </dialog>
    </RequestContext.Provider>
  );
}