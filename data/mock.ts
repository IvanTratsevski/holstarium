import type { District, MapSlot, StallData } from "@/types";
import { pixelTheme } from "@/themes/pixel";

export const themes = { [pixelTheme.id]: pixelTheme };

const colors = ["#e07a5f", "#3d405b", "#81b29a", "#f2cc8f", "#6d597a", "#b56576", "#355070", "#eaac8b"];

const makeArtworks = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `art-${i + 1}`,
    title: `Работа ${i + 1}`,
    description: `Тестовое описание работы ${i + 1}. Здесь будет рассказ автора о рисунке.`,
    placeholderColor: colors[i % colors.length],
    sortOrder: i + 1,
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
  artworks: makeArtworks(artworksCount),
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
];

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

export const slots: MapSlot[] = pixelPositions.map(([x, y], i) => ({
  id: `pixel-${i + 1}`,
  districtSlug: "pixel",
  x,
  y,
  size: 120,
  stallSlug: pixelOccupied[i],
}));