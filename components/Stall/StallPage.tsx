"use client";

import { useState } from "react";
import Link from "next/link";
import type { Post, StallData, TagInfo, Theme } from "@/types";
import { useSocial } from "@/components/Social/SocialProvider";
import PostBoard from "@/components/Posts/PostBoard";
import ArtistHeader from "./ArtistHeader";
import StallEditor from "./StallEditor";
import StallView from "./StallView";
import styles from "./StallPage.module.css";

type Tab = "stall" | "board";

type Props = {
  initialStall: StallData;
  theme: Theme;
  tagCatalog: TagInfo[];
  district?: { slug: string; name: string };
};

export default function StallPage({ initialStall, theme, tagCatalog, district }: Props) {
  // В прототипе роль задаётся общей панелью внизу. В боевой версии её определит сервер по сессии.
  const { state } = useSocial();
  const [tab, setTab] = useState<Tab>("stall");
  const [editing, setEditing] = useState(false);
  const [stall, setStall] = useState<StallData>(initialStall);
  const [posts, setPosts] = useState<Post[]>(initialStall.posts ?? []);

  const isOwner = state.role === "owner";
  const isEditing = isOwner && editing && tab === "stall";

  const patch = (p: Partial<StallData>) => setStall((s) => ({ ...s, ...p }));

  return (
    <div className={styles.page}>
      <p className={styles.top}>
        <Link href={district ? `/district/${district.slug}` : "/"}>
          ← {district ? "К району" : "Рынок"}
        </Link>
      </p>

      {isOwner && (
        <div className={styles.ownerBar} role="region" aria-label="Панель владельца">
          <strong>{isEditing ? "Режим редактирования" : "Это ваша лавка"}</strong>
          <span className={styles.note}>В прототипе изменения не сохраняются</span>
          {tab === "stall" && (
            <button type="button" onClick={() => setEditing((e) => !e)}>
              {isEditing ? "Готово" : "Редактировать лавку"}
            </button>
          )}
        </div>
      )}

      <ArtistHeader stall={stall} district={district} showFollow={!isOwner} />

      <div className={styles.tabs}>
        <div className={styles.toggle} role="group" aria-label="Раздел страницы художника">
          <button type="button" aria-pressed={tab === "stall"} onClick={() => setTab("stall")}>
            Лавка
          </button>
          <button type="button" aria-pressed={tab === "board"} onClick={() => setTab("board")}>
            Объявления ({posts.length})
          </button>
        </div>
      </div>

      {tab === "stall" ? (
        <div className={isEditing ? styles.withEditor : undefined}>
          {isEditing && (
            <StallEditor
              stall={stall}
              theme={theme}
              tagCatalog={tagCatalog}
              onChange={patch}
              onReset={() => setStall(initialStall)}
            />
          )}
          <div className={styles.stallArea}>
            <StallView stall={stall} theme={theme} />
          </div>
        </div>
      ) : (
        <div className={styles.boardWrap}>
          <div className={styles.boardInner}>
            <PostBoard stall={stall} posts={posts} onChange={setPosts} isOwner={isOwner} />
          </div>
        </div>
      )}
    </div>
  );
}