import type { Comment } from "@/types";
import type { SocialState } from "@/lib/socialStore";
import { hash } from "@/lib/social";

export const COMMENT_MAX = 500;
export const COMMENT_COOLDOWN_MS = 20_000;
export const REPORT_REASONS = ["Спам или реклама", "Оскорбления", "Другое"];

// Простая проверка на адреса сайтов. На сервере будет строже.
const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|ru|net|org|io|me|ly|gg|su|xyz)\b)/i;

export function validateComment(raw: string): string | null {
  const text = raw.trim();
  if (!text) return "Напишите хотя бы пару слов.";
  if (text.length > COMMENT_MAX) return `Не больше ${COMMENT_MAX} символов.`;
  if (LINK_RE.test(text)) return "Ссылки в комментариях пока нельзя.";
  return null;
}

const NAMES = ["Мила", "Дима", "Соня", "Артём", "Лис", "Ника"];
const TEXTS = [
  "Очень красиво!",
  "Нравится палитра, особенно свет.",
  "Классная композиция. Сколько времени ушло?",
  "Хочу такое на обои)",
  "Спасибо, что делитесь работами.",
  "Атмосфера огонь.",
];
const BASE = Date.UTC(2026, 9, 20);

// Тестовые комментарии от «других людей». Для одной работы всегда одни и те же.
export function seedComments(ref: string): Comment[] {
  const h = hash(ref);
  const count = h % 4; // от 0 до 3
  return Array.from({ length: count }, (_, i) => ({
    id: `seed:${ref}:${i}`,
    ref,
    authorId: `seed-${(h + i * 7) % NAMES.length}`,
    authorName: NAMES[(h + i * 7) % NAMES.length],
    text: TEXTS[((h >> 3) + i * 5) % TEXTS.length],
    createdAt: BASE + ((h % 96) + i * 11) * 3_600_000,
  }));
}

export type CommentItem = { comment: Comment; removed: boolean };

export function listComments(ref: string, state: SocialState): CommentItem[] {
  return [...seedComments(ref), ...state.comments.filter((c) => c.ref === ref)]
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((comment) => ({ comment, removed: state.removed.includes(comment.id) }));
}