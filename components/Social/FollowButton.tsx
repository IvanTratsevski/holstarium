"use client";

import { baseFollowers } from "@/lib/social";
import { useSocial } from "./SocialProvider";
import styles from "./SocialButtons.module.css";

export default function FollowButton({ slug }: { slug: string }) {
  const { state, toggleFollow } = useSocial();
  const followed = state.follows.includes(slug);
  const count = baseFollowers(slug) + (followed ? 1 : 0);

  return (
    <div className={styles.followWrap}>
      <button
        type="button"
        className={`${styles.btn} ${followed ? styles.followOn : styles.followOff}`}
        onClick={() => toggleFollow(slug)}
      >
        {followed ? "✓ Вы подписаны" : "+ Подписаться"}
      </button>
      <span className={styles.followCount}>Подписчиков: {count}</span>
    </div>
  );
}