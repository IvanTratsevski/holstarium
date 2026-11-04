"use client";

import { useSocial } from "@/components/Social/SocialProvider";
import styles from "./Requests.module.css";

type Props = { slug: string; defaultOpen: boolean };

export default function OrdersStatus({ slug, defaultOpen }: Props) {
  const { state } = useSocial();
  const open = state.orders[slug] ?? defaultOpen;

  return (
    <span className={`${styles.badge} ${open ? styles.badgeOpen : styles.badgeClosed}`}>
      <span aria-hidden="true">{open ? "●" : "○"}</span>
      {open ? "Открыт для заказов" : "Заказы закрыты"}
    </span>
  );
}