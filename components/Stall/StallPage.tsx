"use client";

import { useState } from "react";
import Link from "next/link";
import type { StallData, TagInfo, Theme } from "@/types";
import { useSocial } from "@/components/Social/SocialProvider";
import ArtistHeader from "./ArtistHeader";
import StallEditor from "./StallEditor";
import StallView from "./StallView";
import styles from "./StallPage.module.css";

type Props = {
  initialStall: StallData;
  theme: Theme;
  tagCatalog: TagInfo[];
  district?: { slug: string; name: string };
};

export default function StallPage({ initialStall, theme, tagCatalog, district }: Props) {
  // В прототипе роль задаётся общей панелью внизу. В боевой версии её определит сервер по сессии.
  const { state } = useSocial();
  const [editing, setEditing] = useState(false);
  const [stall, setStall] = useState<StallData>(initialStall);

  const isOwner = state.role === "owner";
  const isEditing = isOwner && editing;

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
          <button type="button" onClick={() => setEditing((e) => !e)}>
            {isEditing ? "Готово" : "Редактировать лавку"}
          </button>
        </div>
      )}

      <ArtistHeader stall={stall} district={district} showFollow={!isOwner} />

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
    </div>
  );
}