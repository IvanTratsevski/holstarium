import Link from "next/link";
import type { StallData } from "@/types";
import { safeUrl } from "@/lib/links";
import styles from "./ArtistHeader.module.css";

type Props = {
  stall: StallData;
  district?: { slug: string; name: string };
};

export default function ArtistHeader({ stall, district }: Props) {
  const links = (stall.links ?? []).flatMap((l) => {
    const href = safeUrl(l.url);
    return href ? [{ label: l.label.trim() || new URL(href).hostname, href }] : [];
  });

  return (
    <header className={styles.header}>
      <span className={styles.avatar} style={{ background: stall.accentColor }} aria-hidden="true">
        {stall.artistName.charAt(0).toUpperCase()}
      </span>

      <div>
        <h1>{stall.artistName}</h1>
        <p className={styles.meta}>
          {district && (
            <>
              <Link href={`/district/${district.slug}`}>{district.name}</Link> ·{" "}
            </>
          )}
          Работ: {stall.artworks.length}
        </p>

        {stall.bio && <p className={styles.bio}>{stall.bio}</p>}

        {links.length > 0 && (
          <ul className={styles.links}>
            {links.map((l, i) => (
              <li key={`${l.href}-${i}`}>
                <a href={l.href} target="_blank" rel="noopener noreferrer nofollow">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}