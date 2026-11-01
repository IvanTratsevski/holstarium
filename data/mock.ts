import type { District, MapSlot, Post, SaleInfo, SocialLink, StallData } from "@/types";
import { pixelTheme } from "@/themes/pixel";

export const themes = { [pixelTheme.id]: pixelTheme };

const colors = ["#e07a5f", "#3d405b", "#81b29a", "#f2cc8f", "#6d597a", "#b56576", "#355070", "#eaac8b"];

const ratios = [1, 0.75, 1.33, 0.8, 1.5, 1, 0.66, 1.25];

const day = (d: number, h = 12) => Date.UTC(2026, 9, d, h);

const tagSets: string[][] = [
  ["персонаж", "фэнтези"],
  ["пейзаж", "ночной город"],
  ["животные"],
  ["цифра", "портрет"],
  ["акварель", "пейзаж"],
  ["sci-fi", "персонаж", "кофе"],
  ["скетч"],
  ["архитектура", "ночной город"],
];
const sales: (SaleInfo | undefined)[] = [
  { kind: "price", amount: 25, currency: "EUR", note: "печатная копия А4" },
  undefined,
  { kind: "negotiable", note: "оригинал на холсте" },
  undefined,
  { kind: "price", amount: 1500, currency: "RUB" },
  { kind: "price", amount: 40, currency: "USD", note: "цифровой файл" },
  undefined,
  { kind: "negotiable" },
];
const makeArtworks = (count: number, offset = 0) =>
  Array.from({ length: count }, (_, i) => ({
    id: `art-${i + 1}`,
    title: `Работа ${i + 1}`,
    description: `Тестовое описание работы ${i + 1}. Здесь будет рассказ автора о рисунке.`,
    placeholderColor: colors[i % colors.length],
    aspectRatio: ratios[(i + offset) % ratios.length],
    sortOrder: i + 1,
    tags: [...tagSets[(i + offset) % tagSets.length]],
    isFeatured: true,
    sale: sales[(i + offset) % sales.length],
  }));

const makeStall = (
  slug: string,
  artistName: string,
  signText: string,
  accentColor: string,
  artworksCount: number,
  bio?: string,
  links?: SocialLink[]
): StallData => ({
  slug,
  artistName,
  bio,
  links,
  signText,
  accentColor,
  themeId: "pixel",
  counterId: "wood",
  artworks: makeArtworks(artworksCount, slug.length),
});

export const stalls: StallData[] = [
  makeStall(
  "anna", "Анна", "Лавка Анны", "#e07a5f", 8,
  "Рисую уютные городские пейзажи и маленькие истории про людей, которые живут в этих домах. Работаю в пиксель-арте уже пять лет, люблю тёплую палитру и вечерний свет в окнах.",
  [
    { label: "Telegram", url: "https://t.me/example" },
    { label: "Портфолио", url: "example.com/anna" },
  ]
  ),
  makeStall("ivan", "Иван", "Пиксели Ивана", "#81b29a", 3, "Ретро-игры, спрайты и персонажи."),
  makeStall("maria", "Мария", "Мария рисует", "#6d597a", 6, "Иллюстрации к настольным играм и открытки."),
  makeStall("oleg", "Олег", "Олег и точки", "#355070", 5), // без описания: проверяем отсутствие bio
  makeStall("kira", "Кира", "Киры Уголок", "#b56576", 7, "Персонажи, монстры и немного уютного хоррора."),
  makeStall("tom", "Том", "Кузница Тома", "#8d6e63", 6, "Рыцари, гербы и доспехи."),
  makeStall("lena", "Лена", "Драконье гнездо", "#6a994e", 5, "Драконы и прочая крылатая живность.")
];

const addPosts = (slug: string, posts: Post[]) => {
  const stall = stalls.find((s) => s.slug === slug);
  if (stall) stall.posts = posts;
};
addPosts("anna", [
  {
    id: "post-1",
    pinned: true,
    createdAt: day(12),
    images: [],
    text: "Добро пожаловать в мою лавку! Здесь я выкладываю городские пейзажи и истории про людей в окнах. В декабре буду брать два заказа на открытки, подробности ниже в объявлениях.",
  },
  {
    id: "post-2",
    createdAt: day(27),
    text: "Закончила серию «Окна в ноябре». Двенадцать маленьких сцен, три из них показываю здесь.",
    images: [
      { id: "p2-1", placeholderColor: "#e07a5f", aspectRatio: 1.5 },
      { id: "p2-2", placeholderColor: "#3d405b", aspectRatio: 1 },
      { id: "p2-3", placeholderColor: "#81b29a", aspectRatio: 0.75 },
    ],
  },
  {
    id: "post-3",
    createdAt: day(22),
    images: [],
    text: "Подвожу итоги месяца. Закончила серию про вечерний свет в чужих квартирах: двенадцать небольших пиксельных сцен. Больше всего времени ушло на подбор палитры, хотелось тёплого янтарного света на фоне холодного синего двора. Параллельно начала эскизы к большой работе про ночной рынок, пока только набросала композицию и расставила основные силуэты. Если кто-то хочет заказать открытку или аватар в похожем стиле, пишите, в декабре возьму два заказа. Спасибо всем, кто заходит в лавку и оставляет комментарии, это очень мотивирует!",
  },
]);

addPosts("ivan", [
  {
    id: "post-1",
    createdAt: day(29),
    text: "Новый спрайт-лист готов. Теперь герой умеет бегать, прыгать и ругаться на баги.",
    images: [{ id: "p1-1", placeholderColor: "#81b29a", aspectRatio: 2 }],
  },
]);

addPosts("maria", [
  {
    id: "post-1",
    createdAt: day(25),
    text: "Ищу тестировщиков для карточной игры, которую иллюстрирую. Нужна пара вечеров и честное мнение.",
    images: [],
  },
  {
    id: "post-2",
    createdAt: day(18),
    text: "Эскизы к колоде.",
    images: [
      { id: "p2-1", placeholderColor: "#6d597a", aspectRatio: 0.7 },
      { id: "p2-2", placeholderColor: "#b56576", aspectRatio: 0.7 },
      { id: "p2-3", placeholderColor: "#355070", aspectRatio: 0.7 },
      { id: "p2-4", placeholderColor: "#eaac8b", aspectRatio: 0.7 },
    ],
  },
]);

addPosts("kira", [
  {
    id: "post-1",
    createdAt: day(26),
    text: "На следующей неделе открываю заказы на небольших монстров для настольных игр. Расскажу подробнее позже.",
    images: [],
  },
]);
stalls[0].artworks[0].tags = [...(stalls[0].artworks[0].tags ?? []), "единорожки"];
export const districts: District[] = [
  {
    slug: "pixel",
    name: "Пиксельный квартал",
    description: "Пиксель-арт, ретро-игры и всё, что состоит из квадратиков.",
    themeId: "pixel",
    mapImage: "/maps/pixel_town.webp",
    mapWidth: 1536,
    mapHeight: 1024,
  },
  {
  slug: "medieval",
  name: "Средневековый квартал",
  description: "Гербы, драконы, рыцари и всё, что пахнет пергаментом.",
  themeId: "pixel",
  mapWidth: 2400,
  mapHeight: 1500,
},
];

for (const slug of ["anna", "maria", "kira"]) {
  const s = stalls.find((x) => x.slug === slug);
  if (s) s.acceptsOrders = true;
}

// Координаты центров слотов, пока расставлены вручную сеткой
// район: Пиксельный квартал, карта 1536×1024, рекомендуемый size: 73
const pixelPositions: [number, number][] = [
  [420, 290],
  [550, 280],
  [970, 290],
  [1600, 400],
  [2000, 400],
  [510, 740],
  [1020, 760],
  [1250, 490],
  [1800, 800],
  [400, 1200],
  [800, 1200],
  [1200, 1200],
  [1600, 1200],
  [2000, 1200],
  [1120, 320],
  [280, 580],
  [1390, 800],
  [260, 130],
  [100, 390],
];

// номер слота → slug лавки
const pixelOccupied: Record<number, string> = {
  0: "anna",
  2: "ivan",
  4: "maria",
  6: "oleg",
  10: "kira",
};
const medievalSlots: MapSlot[] = [
  { id: "medieval-1", districtSlug: "medieval", x: 800, y: 600, size: 120, stallSlug: "tom" },
  { id: "medieval-2", districtSlug: "medieval", x: 1200, y: 600, size: 120, stallSlug: "lena" },
  { id: "medieval-3", districtSlug: "medieval", x: 1600, y: 600, size: 120 },
];

const pixelSlots: MapSlot[] = pixelPositions.map(([x, y], i) => ({
  id: `pixel-${i + 1}`,
  districtSlug: "pixel",
  x,
  y,
  size: 120,
  stallSlug: pixelOccupied[i],
}));

export const slots: MapSlot[] = [...pixelSlots, ...medievalSlots];

