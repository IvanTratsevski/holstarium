"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { FeedItem } from "@/types";
import { toLightboxItem } from "@/lib/lightboxItem";
import { HISTORY_MAX, pickLucky } from "@/lib/lucky";
import { OWN_STALL_SLUG } from "@/lib/menu";
import type { SearchIndex } from "@/lib/search";
import Lightbox from "@/components/Lightbox/Lightbox";
import { useSocial } from "@/components/Social/SocialProvider";
import SearchDialog from "./SearchDialog";
import styles from "./Discovery.module.css";

type Ctx = { openSearch: () => void; lucky: () => void };

const DiscoveryContext = createContext<Ctx | null>(null);

export function useDiscovery() {
  const ctx = useContext(DiscoveryContext);
  if (!ctx) throw new Error("useDiscovery нужно вызывать внутри DiscoveryProvider");
  return ctx;
}

type LuckyState = { history: FeedItem[]; pos: number };

const noop = () => {};

export default function DiscoveryProvider({
  data,
  children,
}: {
  data: SearchIndex;
  children: ReactNode;
}) {
  const { state } = useSocial();
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewing, setViewing] = useState<FeedItem | null>(null);
  const [luckyState, setLuckyState] = useState<LuckyState | null>(null);
  const [notice, setNotice] = useState("");
  const seen = useRef<string[]>([]);
  const noticeTimer = useRef<number | undefined>(undefined);

  // клавиша «/» открывает поиск, как на многих сайтах
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (document.querySelector("dialog[open]")) return;
      e.preventDefault();
      setSearchOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const notify = (text: string) => {
    setNotice(text);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 5000);
  };

  const pick = (): FeedItem | null => {
    const item = pickLucky(data.works, {
      hideAi: state.hideAi,
      excludeStall: state.role === "owner" ? OWN_STALL_SLUG : undefined,
      seen: seen.current,
    });
    if (!item) {
      notify(
        state.hideAi
          ? "Все подходящие работы скрыты фильтром «Скрыть работы с ИИ». Отключите его в фильтрах ленты."
          : "Пока нет работ, которые можно показать."
      );
      return null;
    }
    seen.current = [...seen.current, item.ref].slice(-HISTORY_MAX);
    return item;
  };

  const startLucky = () => {
    const item = pick();
    if (!item) return;
    setLuckyState({ history: [item], pos: 0 });
  };

  const nextLucky = () => {
    const item = pick();
    if (!item) return;
    setLuckyState((s) => {
      const base = s ? s.history.slice(0, s.pos + 1) : [];
      const history = [...base, item].slice(-HISTORY_MAX);
      return { history, pos: history.length - 1 };
    });
  };

  const backLucky = () =>
    setLuckyState((s) => (s && s.pos > 0 ? { ...s, pos: s.pos - 1 } : s));

  const openWork = (item: FeedItem) => {
    setSearchOpen(false);
    setViewing(item);
  };

  const luckyItem = luckyState ? luckyState.history[luckyState.pos] : null;

  return (
    <DiscoveryContext.Provider value={{ openSearch: () => setSearchOpen(true), lucky: startLucky }}>
      {children}

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        index={data}
        hideAi={state.hideAi}
        onOpenWork={openWork}
      />

      <Lightbox
        artworks={viewing ? [toLightboxItem(viewing)] : []}
        index={viewing ? 0 : null}
        onClose={() => setViewing(null)}
        onChange={noop}
      />

      <Lightbox
        artworks={luckyItem ? [toLightboxItem(luckyItem)] : []}
        index={luckyItem ? 0 : null}
        onClose={() => setLuckyState(null)}
        onChange={noop}
        lucky={{
          onNext: nextLucky,
          onBack: backLucky,
          canBack: !!luckyState && luckyState.pos > 0,
        }}
      />

      <div className={`${styles.toast} ${notice ? styles.toastOn : ""}`} role="status">
        {notice}
      </div>
    </DiscoveryContext.Provider>
  );
}