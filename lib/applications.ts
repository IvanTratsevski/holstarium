import type {
  ApplicationDecision,
  ApplicationRecord,
  ApplicationSample,
  ApplicationStatus,
  MapSlot,
} from "@/types";

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "На рассмотрении",
  approved: "Одобрена",
  changes: "Нужны доработки",
  rejected: "Отклонена",
};

export const DECISION_COMMENT_MIN = 10;
export const DECISION_COMMENT_MAX = 500;

// Адреса картинок из формы живут только в памяти вкладки и в localStorage не попадают
export const samplePreviews = new Map<string, string>();

const at = (month: number, day: number, hour: number) => Date.UTC(2026, month, day, hour);
const sample = (
  id: string,
  name: string,
  color: string,
  ratio: number,
  ai = false
): ApplicationSample => ({ id, name, placeholderColor: color, aspectRatio: ratio, aiGenerated: ai });

// Тестовые заявки, чтобы очередь не была пустой
export const SEED_APPLICATIONS: ApplicationRecord[] = [
  {
    id: "A-1001",
    nick: "Ника Пиксель",
    email: "nika@example.com",
    links: ["https://www.behance.net/nika-pixel", "t.me/nika_pixel"],
    district: "pixel",
    placeWish: "Ближе к центру, рядом с Анной, если получится.",
    about: "Рисую пиксельные городские сцены и анимированные открытки. Работаю в Aseprite шесть лет.",
    createdAt: at(10, 1, 9),
    samples: [
      sample("n1", "city-night.png", "#3d405b", 1.5),
      sample("n2", "cafe.png", "#e07a5f", 1),
      sample("n3", "rain.gif", "#355070", 0.75),
      sample("n4", "tram.png", "#81b29a", 1.33),
    ],
  },
  {
    id: "A-1002",
    nick: "Тор Кузнец",
    email: "tor@example.com",
    links: ["https://tor-art.example.com"],
    district: "medieval",
    placeWish: "",
    about: "Гербы, доспехи и книжные миниатюры. Рисую традиционными материалами и оцифровываю.",
    createdAt: at(9, 31, 15),
    samples: [
      sample("t1", "herald.jpg", "#8d6e63", 0.8),
      sample("t2", "armor.jpg", "#6d597a", 0.7),
      sample("t3", "manuscript.jpg", "#b56576", 1.4),
    ],
  },
  {
    id: "A-1003",
    nick: "Лиса",
    email: "lisa@example.com",
    links: ["instagram.com/lisa.draws", "javascript:alert(1)"],
    district: "unsure",
    placeWish: "Не знаю, куда лучше. Подскажите.",
    about: "Рисую всего понемногу: персонажи, фоны, концепты. Часть работ делаю с помощью нейросетей и дорабатываю вручную.",
    createdAt: at(9, 30, 12),
    samples: [
      sample("l1", "forest.png", "#81b29a", 1.5, true),
      sample("l2", "witch.png", "#6d597a", 0.75),
      sample("l3", "castle.png", "#355070", 1.33, true),
      sample("l4", "fox.png", "#e07a5f", 1),
      sample("l5", "river.png", "#eaac8b", 1.6),
    ],
  },
];

export const statusOf = (
  id: string,
  decisions: Record<string, ApplicationDecision>
): ApplicationStatus => decisions[id]?.status ?? "pending";

// заявки из формы плюс тестовые, от новых к старым
export const allApplications = (stored: ApplicationRecord[]) =>
  [...stored, ...SEED_APPLICATIONS].sort((a, b) => b.createdAt - a.createdAt);

// слоты, занятые уже одобренными заявками
function takenSlots(decisions: Record<string, ApplicationDecision>, exceptId?: string) {
  const taken = new Set<string>();
  for (const [id, d] of Object.entries(decisions)) {
    if (id !== exceptId && d.status === "approved" && d.slotId) taken.add(d.slotId);
  }
  return taken;
}

export function freeSlotsOf(
  districtSlug: string,
  slots: MapSlot[],
  decisions: Record<string, ApplicationDecision>,
  exceptId?: string
) {
  const taken = takenSlots(decisions, exceptId);
  return slots.filter((s) => s.districtSlug === districtSlug && !s.stallSlug && !taken.has(s.id));
}

// порядковый номер слота внутри района
export function slotNumber(slotId: string, slots: MapSlot[]): number | null {
  const slot = slots.find((s) => s.id === slotId);
  if (!slot) return null;
  return slots.filter((s) => s.districtSlug === slot.districtSlug).findIndex((s) => s.id === slotId) + 1;
}

type EmailInput = {
  status: Exclude<ApplicationStatus, "pending">;
  comment?: string;
  districtName?: string;
  slotNumber?: number | null;
};

// Письмо с решением. В боевой версии то же письмо уйдёт на почту заявителя.
export function buildDecisionEmail(app: ApplicationRecord, d: EmailInput) {
  const hello = `Здравствуйте, ${app.nick}!\n\n`;
  const note = d.comment?.trim();

  if (d.status === "approved") {
    return {
      subject: "Holstarium: ваша заявка одобрена",
      body:
        hello +
        `Ваша заявка ${app.id} одобрена. Для вас готова лавка в районе «${d.districtName ?? "—"}», место №${d.slotNumber ?? "—"}.\n\n` +
        `Чтобы войти, задайте пароль по ссылке: [ссылка появится в боевой версии].\n\n` +
        `После входа вы сможете оформить лавку и загрузить работы. Напоминаем: работы, созданные с помощью ИИ, нужно отмечать, а откровенные материалы на сайте не допускаются (правила: /rules).` +
        (note ? `\n\nКомментарий администратора:\n${note}` : "") +
        `\n\nДо встречи на рынке!`,
    };
  }

  if (d.status === "changes") {
    return {
      subject: "Holstarium: по заявке нужны доработки",
      body:
        hello +
        `Спасибо за заявку ${app.id}. Мы не можем принять её в нынешнем виде. Что нужно исправить:\n\n${note ?? "—"}\n\n` +
        `Когда исправите, отправьте заявку ещё раз на странице /apply.`,
    };
  }

  return {
    subject: "Holstarium: решение по заявке",
    body:
      hello +
      `Спасибо за интерес к рынку. К сожалению, мы не можем принять заявку ${app.id}. Причина:\n\n${note ?? "—"}\n\n` +
      `Если вы считаете, что это ошибка, ответьте на это письмо.`,
  };
}