import styles from "./AiBadge.module.css";

type Props = { variant?: "overlay" | "inline" };

export default function AiBadge({ variant = "overlay" }: Props) {
  if (variant === "inline") {
    return <span className={`${styles.badge} ${styles.inline}`}>✦ Создано с помощью ИИ</span>;
  }
  // на картинках: подпись есть в названии кнопки, поэтому значок скрыт от читалок
  return (
    <span
      className={`${styles.badge} ${styles.overlay}`}
      aria-hidden="true"
      title="Создано с помощью ИИ"
    >
      ИИ
    </span>
  );
}