"use client";

import { useState } from "react";
import type { FeedItem, LightboxItem } from "@/types";
import { toTagList } from "@/lib/tags";
import { withBase } from "@/lib/withBase";
import AiBadge from "@/components/Badges/AiBadge";
import Lightbox from "@/components/Lightbox/Lightbox";
import styles from "./Home.module.css";

export default function WorkStrip({ items }: { items: FeedItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const lightboxItems: LightboxItem[] = items.map((i) => ({
    ...i,
    authorName: i.artistName,
    authorHref: `/stall/${i.stallSlug}`,
    tagList: toTagList(i.tags),
  }));

  return (
    <>
      <ul className={styles.works}>
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              className={styles.work}
              onClick={() => setOpenIndex(i)}
              aria-label={`Открыть работу: ${item.title}, автор ${item.artistName}${
                item.aiGenerated ? ", создано с помощью ИИ" : ""
              }`}
            >
              {item.imageUrl ? (
                <img src={withBase(item.imageUrl)} alt="" loading="lazy" />
              ) : (
                <span className={styles.workPh} style={{ background: item.placeholderColor }}>
                  {item.title}
                </span>
              )}
              {item.aiGenerated && <AiBadge />}
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        artworks={lightboxItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />
    </>
  );
}