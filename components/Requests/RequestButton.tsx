"use client";

import { useSocial } from "@/components/Social/SocialProvider";
import { useRequests } from "./RequestProvider";
import styles from "./Requests.module.css";

type Props = {
  stallSlug: string;
  artistName: string;
  defaultOpen: boolean; // принимает ли автор заказы по данным лавки
  work: { ref: string; title: string; priceText?: string };
  secondary?: boolean;  // контурная кнопка вместо залитой
};

export default function RequestButton({
  stallSlug,
  artistName,
  defaultOpen,
  work,
  secondary = false,
}: Props) {
  const { state } = useSocial();
  const { openRequest } = useRequests();

  if (state.role === "owner") return null; // автору запрашивать у себя нечего

  const open = state.orders[stallSlug] ?? defaultOpen;
  if (!open) {
    return <span className={styles.closedNote}>Автор сейчас не принимает запросы</span>;
  }

  const pending = state.requests.some((r) => r.ref === work.ref && r.status !== "replied");
  if (pending) {
    return (
      <button type="button" className={styles.btnSent} disabled>
        ✓ Запрос отправлен
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`${styles.btn} ${secondary ? styles.btnSecondary : ""}`}
      onClick={() => openRequest({ stallSlug, artistName, work })}
    >
      ✉ Запросить
    </button>
  );
}