"use client";

import { useState } from "react";
import type { LightboxItem, StallData, Theme } from "@/types";
import { getStallLayout } from "@/lib/stallLayout";
import { toTagList } from "@/lib/tags";
import { withBase } from "@/lib/withBase";
import Lightbox from "@/components/Lightbox/Lightbox";
import Stall from "./Stall";
import styles from "./StallView.module.css";
import { useSocial } from "@/components/Social/SocialProvider";

type Props = { stall: StallData; theme: Theme };

export default function StallView({ stall, theme }: Props) {
  const { state } = useSocial();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { sorted, gallery } = getStallLayout(stall, theme);

  const lightboxItems: LightboxItem[] = sorted.map((a) => ({
  ...a,
  ref: `${stall.slug}:${a.id}`,
  tagList: toTagList(a.tags),
}));

  const openById = (id: string) => {
    const i = sorted.findIndex((a) => a.id === id);
    if (i !== -1) setOpenIndex(i);
  };
  return (
    <div className={styles.root}>
      <Stall stall={stall} theme={theme} onOpenArtwork={openById} />

      {gallery.length > 0 && (
        <section className={styles.gallery}>
          <h2>Все работы</h2>
          <ul className={styles.list}>
            {gallery.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className={styles.item}
                  style={a.imageUrl ? undefined : { background: a.placeholderColor }}
                  onClick={() => openById(a.id)}
                  aria-label={`Открыть работу: ${a.title}`}
                >
                  {a.imageUrl ? (
                    <img src={withBase(a.imageUrl)} alt="" className={styles.itemImage} />
                  ) : (
                    a.title
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Lightbox
        artworks={lightboxItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
        canModerate={state.role === "owner"}
      />
    </div>
  );
}