import type { District, MapSlot, StallData } from "@/types";
import { pixelTheme } from "@/themes/pixel";

export const themes = { [pixelTheme.id]: pixelTheme };

const colors = ["#e07a5f", "#3d405b", "#81b29a", "#f2cc8f", "#6d597a", "#b56576", "#355070", "#eaac8b"];

const ratios = [1, 0.75, 1.33, 0.8, 1.5, 1, 0.66, 1.25];

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
  }));

const makeStall = (
  slug: string,
  artistName: string,
  signText: string,
  accentColor: string,
  artworksCount: number,
  bio?: string
): StallData => ({
  slug,
  artistName,
  bio,
  signText,
  accentColor,
  themeId: "pixel",
  counterId: "wood",
  artworks: makeArtworks(artworksCount, slug.length),
});

export const stalls: StallData[] = [
  makeStall(
    "anna", "Анна", "Лавка Анны", "#e07a5f", 8,
    "Рисую уютные городские пейзажи и маленькие истории про людей, которые живут в этих домах. Работаю в пиксель-арте уже пять лет, люблю тёплую палитру и вечерний свет в окнах."
  ),
  makeStall("ivan", "Иван", "Пиксели Ивана", "#81b29a", 3, "Ретро-игры, спрайты и персонажи."),
  makeStall("maria", "Мария", "Мария рисует", "#6d597a", 6, "Иллюстрации к настольным играм и открытки."),
  makeStall("oleg", "Олег", "Олег и точки", "#355070", 5), // без описания: проверяем отсутствие bio
  makeStall("kira", "Кира", "Киры Уголок", "#b56576", 7, "Персонажи, монстры и немного уютного хоррора."),
  makeStall("tom", "Том", "Кузница Тома", "#8d6e63", 6, "Рыцари, гербы и доспехи."),
  makeStall("lena", "Лена", "Драконье гнездо", "#6a994e", 5, "Драконы и прочая крылатая живность.")
];
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

