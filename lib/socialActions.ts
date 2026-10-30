import type { Comment } from "@/types";
import { validateComment, COMMENT_COOLDOWN_MS } from "@/lib/comments";
import { getSnapshot, update } from "@/lib/socialStore";

export type Result = { ok: true } | { ok: false; error: string };

const stallOf = (ref: string) => ref.split(":")[0];
const newId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function addComment(ref: string, text: string): Result {
  const s = getSnapshot();
  if (s.commentsOffWorks.includes(ref) || s.commentsOffStalls.includes(stallOf(ref))) {
    return { ok: false, error: "Автор отключил комментарии." };
  }
  const invalid = validateComment(text);
  if (invalid) return { ok: false, error: invalid };

  const now = Date.now();
  const wait = COMMENT_COOLDOWN_MS - (now - s.lastCommentAt);
  if (wait > 0) {
    return { ok: false, error: `Подождите ещё ${Math.ceil(wait / 1000)} с перед следующим комментарием.` };
  }

  update((st) => ({
    ...st,
    lastCommentAt: now,
    comments: [
      ...st.comments,
      { id: newId("c"), ref, authorId: "me", authorName: "Вы", text: text.trim(), createdAt: now },
    ],
  }));
  return { ok: true };
}

export function editComment(id: string, text: string): Result {
  const invalid = validateComment(text);
  if (invalid) return { ok: false, error: invalid };
  const now = Date.now();
  update((st) => ({
    ...st,
    comments: st.comments.map((c) =>
      c.id === id && c.authorId === "me" ? { ...c, text: text.trim(), editedAt: now } : c
    ),
  }));
  return { ok: true };
}

// автор удаляет свой комментарий: он исчезает бесследно
export function deleteOwnComment(id: string) {
  update((st) => ({
    ...st,
    comments: st.comments.filter((c) => !(c.id === id && c.authorId === "me")),
  }));
}

// владелец лавки удаляет любой комментарий под своей работой: остаётся заглушка
export function removeComment(id: string) {
  update((st) => (st.removed.includes(id) ? st : { ...st, removed: [...st.removed, id] }));
}

export function reportComment(c: Comment, reason: string) {
  update((st) => {
    if (st.reports.some((r) => r.commentId === c.id)) return st;
    return {
      ...st,
      reports: [
        ...st.reports,
        {
          id: newId("r"),
          commentId: c.id,
          ref: c.ref,
          authorName: c.authorName,
          text: c.text,
          reason,
          createdAt: Date.now(),
        },
      ],
    };
  });
}

export function setWorkComments(ref: string, enabled: boolean) {
  update((st) => ({
    ...st,
    commentsOffWorks: enabled
      ? st.commentsOffWorks.filter((r) => r !== ref)
      : st.commentsOffWorks.includes(ref)
        ? st.commentsOffWorks
        : [...st.commentsOffWorks, ref],
  }));
}

export function setStallComments(slug: string, enabled: boolean) {
  update((st) => ({
    ...st,
    commentsOffStalls: enabled
      ? st.commentsOffStalls.filter((x) => x !== slug)
      : st.commentsOffStalls.includes(slug)
        ? st.commentsOffStalls
        : [...st.commentsOffStalls, slug],
  }));
}