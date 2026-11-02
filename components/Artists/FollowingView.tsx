"use client";

import Link from "next/link";
import type { ArtistView } from "@/types";
import { useSocial } from "@/components/Social/SocialProvider";
import ArtistGrid from "./ArtistGrid";
import styles from "./Artists.module.css";

export default function FollowingView({ artists }: { artists: ArtistView[] }) {
  const { state, loggedIn, requireAuth } = useSocial();

  if (!loggedIn) {
    return (
      <div>
        <p>Войдите, чтобы видеть художников, на которых вы подписаны.</p>
        <button
          type="button"
          className={styles.btn}
          onClick={() => requireAuth("Войдите, чтобы видеть свои подписки.")}
        >
          Войти
        </button>
      </div>
    );
  }

  const list = artists.filter((a) => state.follows.includes(a.slug));

  if (list.length === 0) {
    return (
      <p>
        Вы пока ни на кого не подписаны. Загляните на страницу <Link href="/artists">«Художники»</Link>{" "}
        и подпишитесь на тех, кто понравится.
      </p>
    );
  }

  return (
    <>
      <p>
        Подписок: {list.length}. Новые работы этих художников собраны на странице{" "}
        <Link href="/feed">«Работы»</Link> во вкладке «Подписки».
      </p>
      <ArtistGrid artists={list} />
    </>
  );
}