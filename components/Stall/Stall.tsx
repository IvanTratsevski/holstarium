import type { CSSProperties } from "react";
import type { StallData, Theme } from "@/types";
import styles from "./Stall.module.css";

type Props = { stall: StallData; theme: Theme };

export default function Stall({ stall, theme }: Props) {
  const counter =
    theme.counters.find((c) => c.id === stall.counterId) ?? theme.counters[0];

  // Избранные по порядку; сколько влезает на прилавок, столько и берём
  const featured = stall.artworks
    .filter((a) => a.isFeatured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, counter.slots.length);

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
      {/* слой 1: фон (стена) */}
      <div className={styles.wall} />

      {/* слой 2: прилавок */}
      <div className={styles.counter} />

      {/* слой 3: работы в рамках */}
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
              <div className={styles.frame}>
                {art.imageUrl ? (
                  <img src={art.imageUrl} alt={art.title} className={styles.image} />
                ) : (
                  <div
                    className={styles.placeholder}
                    style={{ background: art.placeholderColor }}
                    role="img"
                    aria-label={art.title}
                  >
                    {art.title}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.empty} />
            )}
          </div>
        );
      })}

      {/* слой 4: вывеска */}
      <div className={styles.sign}>{stall.signText}</div>
    </div>
  );
}