"use client";

import { useSocial } from "./SocialProvider";
import styles from "./SocialButtons.module.css";

type Props = { refKey: string; compact?: boolean };

export default function SaveButton({ refKey, compact = false }: Props) {
  const { state, toggleSaved } = useSocial();
  const saved = state.saved.includes(refKey);

  return (
    <button
      type="button"
      className={`${styles.btn} ${saved ? styles.saveOn : ""}`}
      aria-label={compact ? (saved ? "Убрать из избранного" : "Добавить в избранное") : undefined}
      onClick={() => toggleSaved(refKey)}
    >
      <span aria-hidden="true">🔖</span>
      {!compact && <span>{saved ? "В избранном" : "В избранное"}</span>}
    </button>
  );
}