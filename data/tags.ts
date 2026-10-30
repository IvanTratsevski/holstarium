import type { OfficialTag } from "@/types";

export const MAX_TAGS_PER_ARTWORK = 4;
export const MAX_TAG_LENGTH = 24;
// самодельный тег попадает в фильтр ленты, когда им отмечено столько работ
export const MIN_CUSTOM_TAG_COUNT = 3;

export const officialTags: OfficialTag[] = [
  { key: "персонаж", name: "Персонаж", group: "subject", aliases: ["персонажи", "character", "characters"] },
  { key: "пейзаж", name: "Пейзаж", group: "subject", aliases: ["пейзажи", "landscape"] },
  { key: "портрет", name: "Портрет", group: "subject", aliases: ["портреты", "portrait"] },
  { key: "животные", name: "Животные", group: "subject", aliases: ["животное", "animals", "animal"] },
  { key: "архитектура", name: "Архитектура", group: "subject", aliases: ["architecture", "здания"] },
  { key: "фэнтези", name: "Фэнтези", group: "subject", aliases: ["фентези", "fantasy"] },
  { key: "sci-fi", name: "Sci-fi", group: "subject", aliases: ["scifi", "sci fi", "научная фантастика"] },
  { key: "еда", name: "Еда", group: "subject", aliases: ["food"] },
  { key: "фан-арт", name: "Фан-арт", group: "subject", aliases: ["фанарт", "fanart", "fan art"] },
  { key: "цифра", name: "Цифра", group: "technique", aliases: ["цифровая", "digital", "цифровая графика"] },
  { key: "акварель", name: "Акварель", group: "technique", aliases: ["watercolor"] },
  { key: "скетч", name: "Скетч", group: "technique", aliases: ["sketch", "набросок", "наброски"] },
  { key: "3d", name: "3D", group: "technique", aliases: ["3д"] },
  { key: "традиционная графика", name: "Традиционная графика", group: "technique", aliases: ["traditional"] },
];