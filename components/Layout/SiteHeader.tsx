"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import { useDiscovery } from "@/components/Discovery/DiscoveryProvider";
import { useSocial } from "@/components/Social/SocialProvider";
import { MAIN_LINKS, currentPath } from "@/lib/menu";
import { IconDice, IconSearch } from "./icons";
import ProfileMenu from "./ProfileMenu";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  const pathname = currentPath(usePathname());
  const { loggedIn, requireAuth } = useSocial();
  const { openSearch, lucky } = useDiscovery();

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
            <button
              type="button"
              className={styles.action}
              aria-haspopup="dialog"
              title="Поиск (клавиша /)"
              onClick={openSearch}
            >
              <IconSearch />
              <span className={styles.actionLabel}>Поиск</span>
            </button>
            <button
              type="button"
              className={styles.action}
              title="Случайная работа случайного художника"
              onClick={lucky}
            >
              <IconDice />
              <span className={styles.actionLabel}>Мне повезёт</span>
            </button>

            <div className={styles.theme}>
              <ThemeToggle />
            </div>

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