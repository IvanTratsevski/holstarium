"use client";

import { useSocial } from "@/components/Social/SocialProvider";
import { useRequests } from "./RequestProvider";
import styles from "./Requests.module.css";

type Props = { slug: string; artistName: string; defaultOpen: boolean };

export default function OrderButton({ slug, artistName, defaultOpen }: Props) {
  const { state } = useSocial();
  const { openRequest } = useRequests();

  const open = state.orders[slug] ?? defaultOpen;
  if (!open || state.role === "owner") return null;

  return (
    <button
      type="button"
      className={`${styles.orderBtn} ${styles.orderOutline}`}
      onClick={() => openRequest({ stallSlug: slug, artistName })}
    >
      ✉ Заказать работу
    </button>
  );
}