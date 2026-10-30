"use client";

import { baseLikes } from "@/lib/social";
import { useSocial } from "./SocialProvider";
import styles from "./SocialButtons.module.css";

export default function LikeButton({ refKey }: { refKey: string }) {
  const { state, toggleLike } = useSocial();
  const liked = state.likes.includes(refKey);
  const count = baseLikes(refKey) + (liked ? 1 : 0);

  return (
    <button
      type="button"
      className={`${styles.btn} ${liked ? styles.likeOn : ""}`}
      aria-pressed={liked}
      aria-label={`Нравится: ${count}`}
      onClick={() => toggleLike(refKey)}
    >
      <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
      <span aria-hidden="true">{count}</span>
    </button>
  );
}