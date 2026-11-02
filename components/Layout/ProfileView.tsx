"use client";

import Link from "next/link";
import { useSocial } from "@/components/Social/SocialProvider";
import { ROLE_LABELS, profileLinks } from "@/lib/menu";
import styles from "./ProfileView.module.css";

export default function ProfileView() {
  const { state, loggedIn, requireAuth, setRole } = useSocial();

  return (
    <div className={styles.wrap}>
      <h1>Профиль</h1>

      {loggedIn ? (
        <>
          <p>Вы вошли как: {ROLE_LABELS[state.role]}</p>
          <ul className={styles.list}>
            {profileLinks(state.role).map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.btn} onClick={() => setRole("guest")}>
            Выйти
          </button>
        </>
      ) : (
        <>
          <p>Войдите, чтобы сохранять работы, подписываться на художников и оставлять комментарии.</p>
          <button
            type="button"
            className={styles.primary}
            onClick={() => requireAuth("Войдите в аккаунт.")}
          >
            Войти
          </button>
        </>
      )}

      <h2>О сайте</h2>
      <ul className={styles.list}>
        <li>
          <Link href="/rules">Правила и безопасность</Link>
        </li>
        <li>
          <Link href="/apply">Стать художником</Link>
        </li>
      </ul>
    </div>
  );
}