"use client";

import { useDiscovery } from "./DiscoveryProvider";
import styles from "./Discovery.module.css";

export default function LuckyButton() {
  const { lucky } = useDiscovery();

  return (
    <div className={styles.luckyWrap}>
      <button type="button" className={styles.luckyBtn} onClick={lucky}>
        <span aria-hidden="true">🎲</span> Мне повезёт
      </button>
      <span className={styles.luckyNote}>Случайная работа случайного художника</span>
    </div>
  );
}