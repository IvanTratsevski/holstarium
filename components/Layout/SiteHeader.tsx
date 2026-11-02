"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import { useSocial } from "@/components/Social/SocialProvider";
import { MAIN_LINKS, currentPath } from "@/lib/menu";
import ProfileMenu from "./ProfileMenu";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  const pathname = currentPath(usePathname());
  const { loggedIn, requireAuth } = useSocial();

  return (
    <>
      <a href="#content" className={styles.skip}>
        Перейти к содержимому
      </a>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/" className={styles.logo}>
            Holstarium
          </Link>

          <nav className={styles.nav} aria-label="Основное меню">
            <ul>
              {MAIN_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} aria-current={l.match(pathname) ? "page" : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.right}>
            <ThemeToggle />
            <div className={styles.auth}>
              {loggedIn ? (
                <ProfileMenu />
              ) : (
                <button
                  type="button"
                  className={styles.login}
                  onClick={() =>
                    requireAuth(
                      "Войдите, чтобы сохранять работы, подписываться на художников и оставлять комментарии."
                    )
                  }
                >
                  Войти
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}