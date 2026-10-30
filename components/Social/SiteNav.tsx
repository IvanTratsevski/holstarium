import Link from "next/link";
import styles from "./SiteNav.module.css";

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
      </ul>
    </nav>
  );
}