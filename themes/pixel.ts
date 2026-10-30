import type { Theme } from "@/types";

export const pixelTheme: Theme = {
  id: "pixel",
  name: "Пиксельный квартал",
  aspectRatio: "16 / 9",
  colors: {
    wall: "#2b2d42",
    counter: "#8d6e63",
    frame: "#f5f0e6",
    signText: "#ffffff",
  },
  counters: [
    {
      id: "wood",
      name: "Деревянный прилавок",
      slots: [
        // три места на стене
        { x: 8, y: 14, w: 24, h: 32, rotate: -2 },
        { x: 38, y: 14, w: 24, h: 32, rotate: 1 },
        { x: 68, y: 14, w: 24, h: 32, rotate: -1 },
        // три места на прилавке
        { x: 8, y: 56, w: 24, h: 32, rotate: 1 },
        { x: 38, y: 56, w: 24, h: 32, rotate: -1 },
        { x: 68, y: 56, w: 24, h: 32, rotate: 2 },
      ],
    },
    {
      id: "shelves",
      name: "Две полки",
      slots: [
        { x: 6, y: 14, w: 20, h: 30, rotate: -1 },
        { x: 28, y: 14, w: 20, h: 30, rotate: 1 },
        { x: 50, y: 14, w: 20, h: 30, rotate: -1 },
        { x: 72, y: 14, w: 20, h: 30, rotate: 1 },
        { x: 6, y: 56, w: 20, h: 30, rotate: 1 },
        { x: 28, y: 56, w: 20, h: 30, rotate: -1 },
        { x: 50, y: 56, w: 20, h: 30, rotate: 1 },
        { x: 72, y: 56, w: 20, h: 30, rotate: -1 },
      ],
    },
  ],
};