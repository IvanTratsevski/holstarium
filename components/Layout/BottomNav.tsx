"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_LINKS, PROFILE_LINK, SAVED_LINK, currentPath } from "@/lib/menu";
import { IconBookmark, IconMap, IconPhoto, IconUser, IconUsers } from "./icons";
import styles from "./BottomNav.module.css";

const ITEMS = [
  { link: MAIN_LINKS[0], Icon: IconMap },
  { link: MAIN_LINKS[1], Icon: IconUsers },
  { link: MAIN_LINKS[2], Icon: IconPhoto },
  { link: SAVED_LINK, Icon: IconBookmark },
  { link: PROFILE_LINK, Icon: IconUser },
];

export default function BottomNav() {
  const pathname = currentPath(usePathname());

  return (
    <nav className={styles.nav} aria-label="Нижнее меню">
      {ITEMS.map(({ link, Icon }) => (
        <Link
          key={link.href}
          href={link.href}
          className={styles.item}
          aria-current={link.match(pathname) ? "page" : undefined}
        >
          <Icon />
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}