import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.about}>
          <strong>Holstarium</strong> — виртуальный рынок, где художники открывают свои лавки. Сайт
          связывает авторов и покупателей, но не участвует в сделках.
        </p>
        <nav aria-label="Дополнительное меню">
          <ul className={styles.list}>
            <li>
              <Link href="/rules">Правила и безопасность</Link>
            </li>
            <li>
              <Link href="/apply">Стать художником</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}