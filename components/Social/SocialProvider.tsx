"use client";

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { getServerSnapshot, getSnapshot, subscribe, update } from "@/lib/socialStore";
import type { Role, SocialState } from "@/lib/socialStore";
import styles from "./SocialProvider.module.css";

type Ctx = {
  state: SocialState;
  loggedIn: boolean;
  setRole: (role: Role) => void;
  // true, если действие разрешено; для гостя открывает окно входа и возвращает false
  requireAuth: (reason: string) => boolean;
  toggleLike: (ref: string) => void;
  toggleSaved: (ref: string) => void;
  toggleFollow: (slug: string) => void;
};

const SocialContext = createContext<Ctx | null>(null);

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial нужно вызывать внутри SocialProvider");
  return ctx;
}

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export default function SocialProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [reason, setReason] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const loggedIn = state.role !== "guest";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (reason !== null && !dialog.open) dialog.showModal();
    if (reason === null && dialog.open) dialog.close();
  }, [reason]);

  const requireAuth = (why: string) => {
    if (loggedIn) return true;
    setReason(why);
    return false;
  };

  const value: Ctx = {
    state,
    loggedIn,
    setRole: (role) => update((s) => ({ ...s, role })),
    requireAuth,
    toggleLike: (ref) => {
      if (requireAuth("Войдите, чтобы ставить лайки."))
        update((s) => ({ ...s, likes: toggle(s.likes, ref) }));
    },
    toggleSaved: (ref) => {
      if (requireAuth("Войдите, чтобы сохранять работы в избранное."))
        update((s) => ({ ...s, saved: toggle(s.saved, ref) }));
    },
    toggleFollow: (slug) => {
      if (requireAuth("Войдите, чтобы подписываться на художников."))
        update((s) => ({ ...s, follows: toggle(s.follows, slug) }));
    },
  };

  return (
    <SocialContext.Provider value={value}>
      {children}

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="auth-title"
        onClose={() => setReason(null)}
      >
        <h2 id="auth-title">Нужен аккаунт</h2>
        <p>{reason}</p>
        <p className={styles.note}>
          В прототипе настоящего входа нет, можно зайти как тестовый посетитель. В боевой версии
          здесь будут вход и регистрация.
        </p>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              update((s) => ({ ...s, role: "visitor" }));
              setReason(null);
            }}
          >
            Войти как посетитель
          </button>
          <button type="button" onClick={() => setReason(null)}>
            Позже
          </button>
        </div>
      </dialog>
    </SocialContext.Provider>
  );
}