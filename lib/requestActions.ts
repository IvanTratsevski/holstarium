import { DAY_MS, REQUESTS_PER_DAY, validateRequest } from "@/lib/requests";
import type { Result } from "@/lib/socialActions";
import { getSnapshot, update } from "@/lib/socialStore";
import type { RequestStatus } from "@/types";

type SendInput = {
  stallSlug: string;
  ref: string | null;
  workTitle: string | null;
  message: string;
  contact: string;
};

export function sendRequest(input: SendInput): Result {
  const invalid = validateRequest(input.message, input.contact);
  if (invalid) return { ok: false, error: invalid };

  const s = getSnapshot();
  const now = Date.now();

  const lastDay = s.requests.filter((r) => now - r.createdAt < DAY_MS).length;
  if (lastDay >= REQUESTS_PER_DAY) {
    return {
      ok: false,
      error: `Не больше ${REQUESTS_PER_DAY} запросов в сутки. Попробуйте завтра.`,
    };
  }

  const alreadyOpen = s.requests.some(
    (r) => r.stallSlug === input.stallSlug && r.ref === input.ref && r.status !== "replied"
  );
  if (alreadyOpen) {
    return {
      ok: false,
      error: input.ref
        ? "Вы уже отправили запрос по этой работе. Дождитесь ответа автора."
        : "Вы уже отправили этому автору запрос на заказ. Дождитесь ответа.",
    };
  }

  update((st) => ({
    ...st,
    requests: [
      ...st.requests,
      {
        id: `req-${now}-${Math.random().toString(36).slice(2, 7)}`,
        stallSlug: input.stallSlug,
        ref: input.ref,
        workTitle: input.workTitle,
        fromName: "Посетитель", // в боевой версии здесь будет ник аккаунта
        message: input.message.trim(),
        contact: input.contact.trim(),
        createdAt: now,
        status: "new",
      },
    ],
  }));
  return { ok: true };
}

export function setRequestStatus(id: string, status: RequestStatus) {
  update((st) => ({
    ...st,
    requests: st.requests.map((r) => (r.id === id ? { ...r, status } : r)),
  }));
}

export function deleteRequest(id: string) {
  update((st) => ({ ...st, requests: st.requests.filter((r) => r.id !== id) }));
}

export function setStallOrders(slug: string, open: boolean) {
  update((st) => ({ ...st, orders: { ...st.orders, [slug]: open } }));
}