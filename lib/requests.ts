import { LINK_RE } from "@/lib/comments";

export const REQUEST_MIN = 10;
export const REQUEST_MAX = 500;
export const REQUESTS_PER_DAY = 3;
export const DAY_MS = 24 * 60 * 60 * 1000;

export function validateRequest(message: string, contact: string): string | null {
  const m = message.trim();
  const c = contact.trim();
  if (m.length < REQUEST_MIN) {
    return `Опишите, что вас интересует (не короче ${REQUEST_MIN} символов).`;
  }
  if (m.length > REQUEST_MAX) return `Сообщение не длиннее ${REQUEST_MAX} символов.`;
  if (LINK_RE.test(m)) {
    return "В первом сообщении ссылки не допускаются. Контакт укажите в отдельном поле.";
  }
  if (c.length < 3) return "Укажите, как с вами связаться.";
  if (c.length > 80) return "Контакт слишком длинный.";
  return null;
}

export const STATUS_LABELS = { new: "Новый", read: "Прочитан", replied: "Отвечено" } as const;

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());