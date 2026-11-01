"use client";

import { useState } from "react";
import Link from "next/link";
import type { Post, StallData, TagInfo, Theme } from "@/types";
import { useSocial } from "@/components/Social/SocialProvider";
import PostBoard from "@/components/Posts/PostBoard";
import Inbox from "@/components/Requests/Inbox";
import ArtistHeader from "./ArtistHeader";
import StallEditor from "./StallEditor";
import StallView from "./StallView";
import styles from "./StallPage.module.css";

type Tab = "stall" | "board" | "inbox";

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
  // если роль сменили на странице «Входящие», возвращаемся на лавку
  const activeTab: Tab = tab === "inbox" && !isOwner ? "stall" : tab;
  const isEditing = isOwner && editing && activeTab === "stall";

  const newRequests = state.requests.filter(
    (r) => r.stallSlug === stall.slug && r.status === "new"
  ).length;

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
          {activeTab === "stall" && (
            <button type="button" onClick={() => setEditing((e) => !e)}>
              {isEditing ? "Готово" : "Редактировать лавку"}
            </button>
          )}
        </div>
      )}

      <ArtistHeader stall={stall} district={district} showFollow={!isOwner} />

      <div className={styles.tabs}>
        <div className={styles.toggle} role="group" aria-label="Раздел страницы художника">
          <button
            type="button"
            aria-pressed={activeTab === "stall"}
            onClick={() => setTab("stall")}
          >
            Лавка
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "board"}
            onClick={() => setTab("board")}
          >
            Объявления ({posts.length})
          </button>
          {isOwner && (
            <button
              type="button"
              aria-pressed={activeTab === "inbox"}
              onClick={() => setTab("inbox")}
            >
              Входящие{newRequests > 0 ? ` (${newRequests})` : ""}
            </button>
          )}
        </div>
      </div>

      {activeTab === "stall" && (
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
      )}

      {activeTab === "board" && (
        <div className={styles.boardWrap}>
          <div className={styles.boardInner}>
            <PostBoard stall={stall} posts={posts} onChange={setPosts} isOwner={isOwner} />
          </div>
        </div>
      )}

      {activeTab === "inbox" && (
        <div className={styles.boardWrap}>
          <div className={styles.boardInner}>
            <Inbox stallSlug={stall.slug} />
          </div>
        </div>
      )}
    </div>
  );
}