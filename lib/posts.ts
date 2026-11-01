import type { LightboxItem, MapSlot, Post, PostView, StallData } from "@/types";

export const POST_MAX = 2000;
export const MAX_POST_IMAGES = 4;
export const MAX_POSTS_PER_DAY = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

// ключ поста устроен так же, как ключ работы: «лавка:id»
export const postRef = (stallSlug: string, postId: string) => `${stallSlug}:${postId}`;

export function validatePost(text: string, imagesCount: number): string | null {
  const t = text.trim();
  if (!t && imagesCount === 0) return "Добавьте текст или хотя бы одну картинку.";
  if (t.length > POST_MAX) return `Не больше ${POST_MAX} символов.`;
  return null;
}

// закреплённое сверху, остальные от новых к старым
export const sortPosts = (list: Post[]) =>
  [...list].sort(
    (a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.createdAt - a.createdAt
  );

// сколько объявлений опубликовано за последние сутки
export const recentCount = (list: Post[], now: number) =>
  list.filter((p) => now - p.createdAt < DAY_MS).length;

export const addPost = (list: Post[], post: Post): Post[] => [
  post,
  ...(post.pinned ? list.map((p) => ({ ...p, pinned: false })) : list),
];

// закрепляет выбранный пост и снимает закрепление с остальных
export const togglePin = (list: Post[], id: string): Post[] =>
  list.map((p) => ({ ...p, pinned: p.id === id ? !p.pinned : false }));

export const editPost = (list: Post[], id: string, text: string, now: number): Post[] =>
  list.map((p) => (p.id === id ? { ...p, text: text.trim(), editedAt: now } : p));

export const removePost = (list: Post[], id: string): Post[] =>
  list.filter((p) => p.id !== id);

// Дата без времени и в UTC: так сервер и браузер выводят одно и то же
export const formatPostDate = (ts: number) =>
  new Date(ts).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

// Объявления всех лавок, у которых есть место на карте, от новых к старым
export function buildPostFeed(stalls: StallData[], slots: MapSlot[]): PostView[] {
  const placed = new Set(slots.map((s) => s.stallSlug));
  return stalls
    .filter((s) => placed.has(s.slug))
    .flatMap((s) =>
      (s.posts ?? []).map((p) => ({
        ...p,
        stallSlug: s.slug,
        artistName: s.artistName,
        accentColor: s.accentColor,
      }))
    )
    .sort((a, b) => b.createdAt - a.createdAt);
}

// Картинки поста в виде, который понимает лайтбокс (без лайков и комментариев)
export function postImagesToLightbox(post: Post): LightboxItem[] {
  return post.images.map((img, i) => ({
    id: img.id,
    title: `Картинка ${i + 1} из ${post.images.length}`,
    alt: img.alt,
    imageUrl: img.imageUrl,
    placeholderColor: img.placeholderColor,
    aspectRatio: img.aspectRatio,
    sortOrder: i + 1,
    isFeatured: false,
  }));
}