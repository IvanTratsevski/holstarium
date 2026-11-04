import type { CSSProperties } from "react";
import type { StallData, Theme } from "@/types";
import { sortArtworks } from "@/lib/artworks";
import { withBase } from "@/lib/withBase";
import AiBadge from "@/components/Badges/AiBadge";
import styles from "./StallGrid.module.css";

type Props = {
  stall: StallData;
  theme: Theme;
  onOpenArtwork?: (artworkId: string) => void;
};

export default function StallGrid({ stall, theme, onOpenArtwork }: Props) {
  const works = sortArtworks(stall.artworks);

  const cssVars = {
    "--wall": theme.colors.wall,
    "--frame": theme.colors.frame,
    "--sign-text": theme.colors.signText,
    "--accent": stall.accentColor,
  } as CSSProperties;

  return (
    <section className={styles.banner} style={cssVars} aria-label="Работы лавки">
      <h2 className={styles.sign}>{stall.signText}</h2>

      {works.length === 0 ? (
        <p className={styles.empty}>В лавке пока нет работ.</p>
      ) : (
        <ul className={styles.grid}>
          {works.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={styles.tile}
                onClick={() => onOpenArtwork?.(a.id)}
                aria-label={`Открыть работу: ${a.title}${
                  a.aiGenerated ? " (создано с помощью ИИ)" : ""
                }`}
              >
                {a.imageUrl ? (
                  <img src={withBase(a.imageUrl)} alt="" />
                ) : (
                  <span className={styles.ph} style={{ background: a.placeholderColor }}>
                    {a.title}
                  </span>
                )}
                {a.aiGenerated && <AiBadge />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}