"use client";

import { useSocial } from "@/components/Social/SocialProvider";
import { useRequests } from "./RequestProvider";
import styles from "./Requests.module.css";

type Props = { slug: string; artistName: string; defaultOpen: boolean };

export default function OrdersStatus({ slug, artistName, defaultOpen }: Props) {
  const { state } = useSocial();
  const { openRequest } = useRequests();
  const open = state.orders[slug] ?? defaultOpen;
  const isOwner = state.role === "owner";

  return (
    <div className={styles.status}>
      <span className={`${styles.badge} ${open ? styles.badgeOpen : styles.badgeClosed}`}>
        <span aria-hidden="true">{open ? "●" : "○"}</span>
        {open ? "Открыт для заказов" : "Заказы закрыты"}
      </span>
      {open && !isOwner && (
        <button
          type="button"
          className={styles.orderBtn}
          onClick={() => openRequest({ stallSlug: slug, artistName })}
        >
          ✉ Заказать работу
        </button>
      )}
    </div>
  );
}