import Link from "next/link";
import type { ArtistCardData } from "@/types";
import { withBase } from "@/lib/withBase";
import styles from "./ArtistCard.module.css";

export default function ArtistCard({ artist }: { artist: ArtistCardData }) {
  return (
    <Link href={`/stall/${artist.slug}`} className={styles.card}>
      <span className={styles.head}>
        <span className={styles.avatar} style={{ background: artist.accentColor }}>
          {artist.artistName.charAt(0).toUpperCase()}
        </span>
        <span className={styles.names}>
          <strong>{artist.artistName}</strong>
          <small>
            {artist.signText}
            {artist.districtName ? ` · ${artist.districtName}` : ""}
          </small>
        </span>
      </span>

      {artist.bio && <span className={styles.bio}>{artist.bio}</span>}

      <span className={styles.thumbs} aria-hidden="true">
        {artist.previews.map((p) =>
          p.imageUrl ? (
            <img key={p.id} src={withBase(p.imageUrl)} alt="" className={styles.thumb} />
          ) : (
            <span key={p.id} className={styles.thumb} style={{ background: p.placeholderColor }} />
          )
        )}
      </span>

      <small className={styles.count}>Работ в лавке: {artist.artworksCount}</small>
    </Link>
  );
}