"use client";

import Link from "next/link";
import type { FeedItem } from "@/types";
import { useSocial } from "@/components/Social/SocialProvider";
import ArtworkFeed from "./ArtworkFeed";

export default function SavedView({ items }: { items: FeedItem[] }) {
  const { state, loggedIn, requireAuth } = useSocial();

  if (!loggedIn) {
    return (
      <div>
        <p>Войдите, чтобы сохранять работы и видеть их здесь.</p>
        <button
          type="button"
          onClick={() => requireAuth("Войдите, чтобы увидеть своё избранное.")}
        >
          Войти
        </button>
      </div>
    );
  }

  const saved = items.filter((i) => state.saved.includes(i.ref));

  if (saved.length === 0) {
    return (
      <p>
        Здесь пока пусто. Нажмите «В избранное» на понравившейся работе в{" "}
        <Link href="/feed">общей ленте</Link>.
      </p>
    );
  }

  return <ArtworkFeed items={saved} />;
}