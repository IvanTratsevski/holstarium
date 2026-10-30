"use client";

import { reset } from "@/lib/socialStore";
import type { Role } from "@/lib/socialStore";
import { useSocial } from "./SocialProvider";
import styles from "./DevBar.module.css";

const ROLES: { role: Role; label: string }[] = [
  { role: "guest", label: "Гость" },
  { role: "visitor", label: "Посетитель" },
  { role: "owner", label: "Владелец" },
];

export default function DevBar() {
  const { state, setRole } = useSocial();

  return (
    <div className={styles.bar} role="group" aria-label="Только для прототипа: роль зрителя">
      <span className={styles.label}>Прототип · смотреть как:</span>
      {ROLES.map((r) => (
        <button
          key={r.role}
          type="button"
          aria-pressed={state.role === r.role}
          onClick={() => setRole(r.role)}
        >
          {r.label}
        </button>
      ))}
      <button type="button" className={styles.reset} onClick={() => reset()}>
        Сбросить
      </button>
    </div>
  );
}