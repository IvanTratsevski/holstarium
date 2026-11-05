import { Alegreya, Golos_Text } from "next/font/google";

// Основной текст и интерфейс
export const bodyFont = Golos_Text({
  subsets: ["cyrillic", "latin"],
  variable: "--font-body",
});

// Заголовки, логотип, вывески, подписи районов на карте
export const headingFont = Alegreya({
  subsets: ["cyrillic", "latin"],
  variable: "--font-heading",
});