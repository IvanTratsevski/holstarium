import type { StallData } from "@/types";
import { pixelTheme } from "@/themes/pixel";

export const themes = { [pixelTheme.id]: pixelTheme };

const colors = ["#e07a5f", "#3d405b", "#81b29a", "#f2cc8f", "#6d597a", "#b56576", "#355070", "#eaac8b"];

const makeArtworks = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `art-${i + 1}`,
    title: `Работа ${i + 1}`,
    placeholderColor: colors[i % colors.length],
    sortOrder: i + 1,
    isFeatured: true,
  }));

export const stalls: StallData[] = [
  {
    slug: "anna",
    artistName: "Анна",
    signText: "Лавка Анны",
    accentColor: "#e07a5f",
    themeId: "pixel",
    counterId: "wood",
    artworks: makeArtworks(8), // больше, чем мест: проверяем переполнение
  },
  {
    slug: "ivan",
    artistName: "Иван",
    signText: "Пиксели Ивана",
    accentColor: "#81b29a",
    themeId: "pixel",
    counterId: "wood",
    artworks: makeArtworks(3), // меньше, чем мест: проверяем пустые места
  },
];