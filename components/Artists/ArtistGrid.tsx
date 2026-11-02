import type { ArtistCardData } from "@/types";
import ArtistCard from "./ArtistCard";
import styles from "./ArtistCard.module.css";

export default function ArtistGrid({ artists }: { artists: ArtistCardData[] }) {
  return (
    <ul className={styles.grid}>
      {artists.map((a) => (
        <li key={a.slug}>
          <ArtistCard artist={a} />
        </li>
      ))}
    </ul>
  );
}