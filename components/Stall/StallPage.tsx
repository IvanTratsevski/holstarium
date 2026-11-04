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

type View = "stall" | "board" | "inbox";
type EditorStart = { key: number; tab: "design" | "works"; add: boolean };

type Props = {
  initialStall: StallData;
  theme: Theme;
  tagCatalog: TagInfo[];
  district?: { slug: string; name: string };
};

export default function StallPage({ initialStall, theme, tagCatalog, district }: Props) {
  // В прототипе роль задаётся общей панелью внизу. В боевой версии её определит сервер по сессии.
  const { state } = useSocial();
  const [view, setView] = useState<View>("stall");
  const [editing, setEditing] = useState(false);
  const [editorStart, setEditorStart] = useState<EditorStart>({
    key: 0,
    tab: "design",
    add: false,
  });
  const [stall, setStall] = useState<StallData>(initialStall);
  const [posts, setPosts] = useState<Post[]>(initialStall.posts ?? []);

  const isOwner = state.role === "owner";
  // если роль сменили, находясь во «Входящих», возвращаемся на лавку
  const activeView: View = view === "inbox" && !isOwner ? "stall" : view;
  const isEditing = isOwner && editing && activeView === "stall";

  const newRequests = state.requests.filter(
    (r) => r.stallSlug === stall.slug && r.status === "new"
  ).length;

  const patch = (p: Partial<StallData>) => setStall((s) => ({ ...s, ...p }));

  const toggleEdit = () => {
    if (isEditing) {
      setEditing(false);
      return;
    }
    setView("stall");
    setEditorStart((s) => ({ key: s.key + 1, tab: "design", add: false }));
    setEditing(true);
  };

  const newWork = () => {
    setView("stall");
    setEditorStart((s) => ({ key: s.key + 1, tab: "works", add: true }));
    setEditing(true);
  };

  return (
    <div className={styles.page}>
      <p className={styles.top}>
        <Link href={district ? `/district/${district.slug}` : "/"}>
          ← {district ? district.name : "Рынок"}
        </Link>
      </p>

      {isOwner && (
        <div className={styles.ownerBar} role="region" aria-label="Панель владельца">
          <strong>{isEditing ? "Режим редактирования" : "Это ваша лавка"}</strong>
          <span className={styles.note}>В прототипе изменения не сохраняются</span>
          <div className={styles.ownerActions}>
            <button type="button" className={styles.primary} onClick={toggleEdit}>
              {isEditing ? "Готово" : "Редактировать лавку"}
            </button>
            <button type="button" onClick={newWork}>
              + Новая работа
            </button>
            <button type="button" onClick={() => setView("inbox")}>
              Входящие{newRequests > 0 ? ` · ${newRequests}` : ""}
            </button>
          </div>
        </div>
      )}

      <ArtistHeader stall={stall} district={district} showActions={!isOwner} />

      <div className={styles.tabs}>
        <div className={styles.toggle} role="group" aria-label="Раздел страницы художника">
          <button
            type="button"
            aria-pressed={activeView === "stall"}
            onClick={() => setView("stall")}
          >
            Лавка
          </button>
          <button
            type="button"
            aria-pressed={activeView === "board"}
            onClick={() => setView("board")}
          >
            Объявления ({posts.length})
          </button>
        </div>
      </div>

      {activeView === "stall" && (
        <div className={isEditing ? styles.withEditor : undefined}>
          {isEditing && (
            <StallEditor
              key={editorStart.key}
              stall={stall}
              theme={theme}
              tagCatalog={tagCatalog}
              startTab={editorStart.tab}
              autoOpenAdd={editorStart.add}
              onChange={patch}
              onReset={() => setStall(initialStall)}
            />
          )}
          <div className={styles.stallArea}>
            <StallView stall={stall} theme={theme} />
          </div>
        </div>
      )}

      {activeView === "board" && (
        <div className={styles.boardWrap}>
          <div className={styles.boardInner}>
            <PostBoard stall={stall} posts={posts} onChange={setPosts} isOwner={isOwner} />
          </div>
        </div>
      )}

      {activeView === "inbox" && (
        <div className={styles.boardWrap}>
          <div className={styles.boardInner}>
            <button type="button" className={styles.back} onClick={() => setView("stall")}>
              ← К лавке
            </button>
            <Inbox stallSlug={stall.slug} />
          </div>
        </div>
      )}
    </div>
  );
}