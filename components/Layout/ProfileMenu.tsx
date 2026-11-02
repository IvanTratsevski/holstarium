"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSocial } from "@/components/Social/SocialProvider";
import { ROLE_LABELS, profileLinks } from "@/lib/menu";
import styles from "./ProfileMenu.module.css";

export default function ProfileMenu() {
  const { state, setRole } = useSocial();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // при переходе на другую страницу меню закрывается
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = ROLE_LABELS[state.role];

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Меню профиля: ${label}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.avatar} aria-hidden="true">
          {label.charAt(0)}
        </span>
        <span className={styles.caret} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div id={panelId} className={styles.panel}>
          <p className={styles.role}>Вы вошли как: {label}</p>
          <ul className={styles.list}>
            {profileLinks(state.role).map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <hr className={styles.sep} />
          <button
            type="button"
            className={styles.logout}
            onClick={() => {
              setRole("guest");
              setOpen(false);
            }}
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}