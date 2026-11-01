import { safeUrl } from "@/lib/links";

export const SAMPLES_MIN = 3;
export const SAMPLES_MAX = 5;
export const LINKS_MAX = 4;
export const ABOUT_MAX = 300;
export const PLACE_MAX = 200;
export const REVIEW_DAYS = "2–3 дней"; // срок ответа в текстах, поправьте под себя

export type SampleDraft = {
  id: string;
  name: string;
  url: string; // blob-адрес, нужен только для предпросмотра
  aiGenerated: boolean;
};

export type ApplicationForm = {
  nick: string;
  email: string;
  links: string[];
  samples: SampleDraft[];
  district: string; // slug района или "unsure"
  placeWish: string;
  about: string;
  agree: boolean;
};

export type FieldKey = keyof ApplicationForm;
export type FormErrors = Partial<Record<FieldKey, string>>;

export const FIELD_ORDER: FieldKey[] = [
  "nick", "email", "links", "samples", "district", "placeWish", "about", "agree",
];

export const FIELD_META: Record<FieldKey, { id: string; label: string }> = {
  nick: { id: "apply-nick", label: "Ник" },
  email: { id: "apply-email", label: "Почта" },
  links: { id: "apply-link-0", label: "Ссылки" },
  samples: { id: "apply-files", label: "Примеры работ" },
  district: { id: "apply-district", label: "Район" },
  placeWish: { id: "apply-place", label: "Пожелание по месту" },
  about: { id: "apply-about", label: "О себе" },
  agree: { id: "apply-agree", label: "Согласие с правилами" },
};

const NICK_RE = /^[\p{L}\p{N}][\p{L}\p{N} _.-]{1,29}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateApplication(f: ApplicationForm, districtSlugs: string[]): FormErrors {
  const e: FormErrors = {};

  const nick = f.nick.trim();
  if (!nick) e.nick = "Укажите ник или имя, под которым вас будут знать на рынке.";
  else if (!NICK_RE.test(nick)) {
    e.nick = "От 2 до 30 символов: буквы, цифры, пробел, точка, дефис и подчёркивание.";
  }

  const email = f.email.trim();
  if (!email) e.email = "Укажите почту: туда придёт решение по заявке.";
  else if (email.length > 120 || !EMAIL_RE.test(email)) {
    e.email = "Похоже, адрес почты введён неверно.";
  }

  const links = f.links.map((l) => l.trim()).filter(Boolean);
  if (links.length === 0) {
    e.links = "Добавьте хотя бы одну ссылку на портфолио или соцсеть.";
  } else if (links.some((l) => safeUrl(l) === null)) {
    e.links = "Одна из ссылок похожа на неверный адрес. Проверьте её.";
  }

  if (f.samples.length < SAMPLES_MIN) {
    e.samples = `Приложите минимум ${SAMPLES_MIN} примера работ (сейчас ${f.samples.length}).`;
  }

  if (!f.district) e.district = "Выберите район. Если не уверены, выберите «Нужен совет».";
  else if (f.district !== "unsure" && !districtSlugs.includes(f.district)) {
    e.district = "Такого района нет.";
  }

  if (f.placeWish.length > PLACE_MAX) e.placeWish = `Не длиннее ${PLACE_MAX} символов.`;
  if (f.about.length > ABOUT_MAX) e.about = `Не длиннее ${ABOUT_MAX} символов.`;
  if (!f.agree) e.agree = "Нужно согласиться с правилами, чтобы отправить заявку.";

  return e;
}