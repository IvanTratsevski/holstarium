"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, setPref, subscribe } from "@/lib/theme";
import type { ThemePref } from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

const OPTIONS: { value: ThemePref; label: string; icon: string }[] = [
  { value: "system", label: "Авто", icon: "◐" },
  { value: "light", label: "Светлая", icon: "\u2600\uFE0E" },
  { value: "dark", label: "Тёмная", icon: "☾" },
];

export default function ThemeToggle() {
  const pref = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className={styles.toggle} role="group" aria-label="Тема оформления">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={pref === o.value}
          aria-label={o.label}
          onClick={() => setPref(o.value)}
        >
          <span aria-hidden="true">{o.icon}</span>
          <span className={styles.label}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}