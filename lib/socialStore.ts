import type {
  ApplicationDecision,
  ApplicationRecord,
  ApplicationSample,
  Comment,
  PurchaseRequest,
  Report,
} from "@/types";

export type Role = "guest" | "visitor" | "owner" | "admin";

export type SocialState = {
  role: Role;
  likes: string[];
  saved: string[];
  follows: string[];
  comments: Comment[];
  removed: string[];
  reports: Report[];
  commentsOffWorks: string[];
  commentsOffStalls: string[];
  lastCommentAt: number;
  requests: PurchaseRequest[];
  orders: Record<string, boolean>;
  hideAi: boolean;
  applications: ApplicationRecord[];                 // заявки, отправленные в этом браузере
  decisions: Record<string, ApplicationDecision>;    // решения по заявкам (id заявки -> решение)
};

const KEY = "holstarium:social:v1";

export const DEFAULT_STATE: SocialState = {
  role: "guest",
  likes: [],
  saved: [],
  follows: [],
  comments: [],
  removed: [],
  reports: [],
  commentsOffWorks: [],
  commentsOffStalls: [],
  lastCommentAt: 0,
  requests: [],
  orders: {},
  hideAi: false,
  applications: [],
  decisions: {},
};

let state: SocialState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

const bools = (v: unknown): Record<string, boolean> =>
  isObj(v)
    ? (Object.fromEntries(
        Object.entries(v).filter(([, x]) => typeof x === "boolean")
      ) as Record<string, boolean>)
    : {};

const isComment = (v: unknown): v is Comment =>
  isObj(v) &&
  typeof v.id === "string" &&
  typeof v.ref === "string" &&
  typeof v.authorId === "string" &&
  typeof v.authorName === "string" &&
  typeof v.text === "string" &&
  typeof v.createdAt === "number";

const isReport = (v: unknown): v is Report =>
  isObj(v) &&
  typeof v.id === "string" &&
  typeof v.commentId === "string" &&
  typeof v.ref === "string" &&
  typeof v.authorName === "string" &&
  typeof v.text === "string" &&
  typeof v.reason === "string" &&
  typeof v.createdAt === "number";

const isRequest = (v: unknown): v is PurchaseRequest =>
  isObj(v) &&
  typeof v.id === "string" &&
  typeof v.stallSlug === "string" &&
  (v.ref === null || typeof v.ref === "string") &&
  (v.workTitle === null || typeof v.workTitle === "string") &&
  typeof v.fromName === "string" &&
  typeof v.message === "string" &&
  typeof v.contact === "string" &&
  typeof v.createdAt === "number" &&
  (v.status === "new" || v.status === "read" || v.status === "replied");

const isSample = (v: unknown): v is ApplicationSample =>
  isObj(v) &&
  typeof v.id === "string" &&
  typeof v.name === "string" &&
  typeof v.aiGenerated === "boolean";

const isApplication = (v: unknown): v is ApplicationRecord =>
  isObj(v) &&
  typeof v.id === "string" &&
  typeof v.nick === "string" &&
  typeof v.email === "string" &&
  Array.isArray(v.links) &&
  v.links.every((x) => typeof x === "string") &&
  Array.isArray(v.samples) &&
  v.samples.every(isSample) &&
  typeof v.district === "string" &&
  typeof v.placeWish === "string" &&
  typeof v.about === "string" &&
  typeof v.createdAt === "number";

function parseDecisions(v: unknown): Record<string, ApplicationDecision> {
  const out: Record<string, ApplicationDecision> = {};
  if (!isObj(v)) return out;
  for (const [id, d] of Object.entries(v)) {
    if (!isObj(d)) continue;
    const status = d.status;
    if (
      (status === "approved" || status === "rejected" || status === "changes") &&
      typeof d.decidedAt === "number"
    ) {
      out[id] = {
        status,
        comment: typeof d.comment === "string" ? d.comment : undefined,
        districtSlug: typeof d.districtSlug === "string" ? d.districtSlug : undefined,
        slotId: typeof d.slotId === "string" ? d.slotId : undefined,
        decidedAt: d.decidedAt,
      };
    }
  }
  return out;
}

function parse(raw: string | null): SocialState {
  if (!raw) return DEFAULT_STATE;
  try {
    const d = JSON.parse(raw);
    if (!isObj(d)) return DEFAULT_STATE;
    return {
      role:
        d.role === "visitor" || d.role === "owner" || d.role === "admin" ? d.role : "guest",
      likes: strings(d.likes),
      saved: strings(d.saved),
      follows: strings(d.follows),
      comments: Array.isArray(d.comments) ? d.comments.filter(isComment) : [],
      removed: strings(d.removed),
      reports: Array.isArray(d.reports) ? d.reports.filter(isReport) : [],
      commentsOffWorks: strings(d.commentsOffWorks),
      commentsOffStalls: strings(d.commentsOffStalls),
      lastCommentAt: typeof d.lastCommentAt === "number" ? d.lastCommentAt : 0,
      requests: Array.isArray(d.requests) ? d.requests.filter(isRequest) : [],
      orders: bools(d.orders),
      hideAi: d.hideAi === true,
      applications: Array.isArray(d.applications) ? d.applications.filter(isApplication) : [],
      decisions: parseDecisions(d.decisions),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    state = parse(window.localStorage.getItem(KEY));
  } catch {
    state = DEFAULT_STATE;
  }
  // изменения из другой вкладки
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    state = parse(e.newValue);
    emit();
  });
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot() {
  load();
  return state;
}

export function getServerSnapshot() {
  return DEFAULT_STATE;
}

export function update(fn: (s: SocialState) => SocialState) {
  load();
  state = fn(state);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // хранилище недоступно (например, приватный режим): работаем только в памяти
  }
  emit();
}

export const reset = () => update(() => DEFAULT_STATE);