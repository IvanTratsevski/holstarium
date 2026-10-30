"use client";

import { useState } from "react";
import type { StallData, Theme } from "@/types";
import { getStallLayout } from "@/lib/stallLayout";
import Lightbox from "@/components/Lightbox/Lightbox";
import Stall from "./Stall";
import styles from "./StallView.module.css";

type Props = { stall: StallData; theme: Theme };

export default function StallView({ stall, theme }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { sorted, gallery } = getStallLayout(stall, theme);

  const openById = (id: string) => {
    const i = sorted.findIndex((a) => a.id === id);
    if (i !== -1) setOpenIndex(i);
  };

  return (
    <>
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
                  style={{ background: a.placeholderColor }}
                  onClick={() => openById(a.id)}
                  aria-label={`Открыть работу: ${a.title}`}
                >
                  {a.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Lightbox
        artworks={sorted}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />
    </>
  );
}