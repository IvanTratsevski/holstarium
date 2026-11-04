"use client";

import Link from "next/link";
import type { StallData } from "@/types";
import { safeUrl } from "@/lib/links";
import { baseFollowers } from "@/lib/social";
import OrderButton from "@/components/Requests/OrderButton";
import OrdersStatus from "@/components/Requests/OrdersStatus";
import FollowButton from "@/components/Social/FollowButton";
import { useSocial } from "@/components/Social/SocialProvider";
import styles from "./ArtistHeader.module.css";

type Props = {
  stall: StallData;
  district?: { slug: string; name: string };
  showActions?: boolean; // кнопки «Подписаться» и «Заказать» (у владельца их нет)
};

export default function ArtistHeader({ stall, district, showActions = true }: Props) {
  const { state } = useSocial();
  const followers = baseFollowers(stall.slug) + (state.follows.includes(stall.slug) ? 1 : 0);

  const links = (stall.links ?? []).flatMap((l) => {
    const href = safeUrl(l.url);
    return href ? [{ label: l.label.trim() || new URL(href).hostname, href }] : [];
  });

  return (
    <header className={styles.header}>
      <span className={styles.avatar} style={{ background: stall.accentColor }} aria-hidden="true">
        {stall.artistName.charAt(0).toUpperCase()}
      </span>

      <div className={styles.main}>
        <h1>{stall.artistName}</h1>
        <p className={styles.meta}>
          {district && (
            <>
              <Link href={`/district/${district.slug}`}>{district.name}</Link>
              <span aria-hidden="true"> · </span>
            </>
          )}
          Работ: {stall.artworks.length}
          <span aria-hidden="true"> · </span>
          Подписчиков: {followers}
        </p>

        {stall.bio && <p className={styles.bio}>{stall.bio}</p>}

        <div className={styles.chips}>
          <OrdersStatus slug={stall.slug} defaultOpen={!!stall.acceptsOrders} />
          {links.length > 0 && (
            <ul className={styles.links}>
              {links.map((l, i) => (
                <li key={`${l.href}-${i}`}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer nofollow">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showActions && (
        <div className={styles.actions}>
          <FollowButton slug={stall.slug} showCount={false} />
          <OrderButton
            slug={stall.slug}
            artistName={stall.artistName}
            defaultOpen={!!stall.acceptsOrders}
          />
        </div>
      )}
    </header>
  );
}