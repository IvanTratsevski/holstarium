import type { CSSProperties } from "react";
import type { StallData, Theme } from "@/types";
import { getStallLayout } from "@/lib/stallLayout";
import styles from "./Stall.module.css";
import { withBase } from "@/lib/withBase";

type Props = {
  stall: StallData;
  theme: Theme;
  onOpenArtwork?: (artworkId: string) => void;
};

export default function Stall({ stall, theme, onOpenArtwork }: Props) {
  const { counter, featured } = getStallLayout(stall, theme);

  const cssVars = {
    "--wall": theme.colors.wall,
    "--counter": theme.colors.counter,
    "--frame": theme.colors.frame,
    "--sign-text": theme.colors.signText,
    "--accent": stall.accentColor,
    aspectRatio: theme.aspectRatio,
  } as CSSProperties;

  return (
    <div className={styles.scene} style={cssVars}>
      <div className={styles.wall} />
      <div className={styles.counter} />

      {counter.slots.map((pos, i) => {
        const art = featured[i];
        return (
          <div
            key={i}
            className={styles.slot}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${pos.w}%`,
              height: `${pos.h}%`,
              transform: pos.rotate ? `rotate(${pos.rotate}deg)` : undefined,
            }}
          >
            {art ? (
              <button
                type="button"
                className={styles.frame}
                onClick={() => onOpenArtwork?.(art.id)}
                aria-label={`Открыть работу: ${art.title}`}
              >
                {art.imageUrl ? (
                  <img src={withBase(art.imageUrl)} alt="" className={styles.image} />
                ) : (
                  <span
                    className={styles.placeholder}
                    style={{ background: art.placeholderColor }}
                  >
                    {art.title}
                  </span>
                )}
              </button>
            ) : (
              <div className={styles.empty} />
            )}
          </div>
        );
      })}

      <div className={styles.sign}>{stall.signText}</div>
    </div>
  );
}