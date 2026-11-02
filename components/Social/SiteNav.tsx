import Link from "next/link";
import styles from "./SiteNav.module.css";
import ThemeToggle from "@/components/Theme/ThemeToggle";

export default function SiteNav() {
  return (
    <nav className={styles.nav} aria-label="Основное меню">
      <Link href="/" className={styles.brand}>
        Holstarium
      </Link>
      <ul className={styles.list}>
        <li><Link href="/">Рынок</Link></li>
        <li><Link href="/feed">Все работы</Link></li>
        <li><Link href="/saved">Избранное</Link></li>
        <li><Link href="/rules">Правила</Link></li>
        <li><Link href="/apply">Стать художником</Link></li>
      </ul>
      <div className={styles.right}>
        <ThemeToggle />
      </div>
    </nav>
  );
}