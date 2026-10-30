// Позиции задаются в процентах от размера сцены, чтобы всё масштабировалось само
export type SlotPosition = {
  x: number; // от левого края, %
  y: number; // от верхнего края, %
  w: number; // ширина, %
  h: number; // высота, %
  rotate?: number; // наклон рамки, градусы
};

export type CounterVariant = {
  id: string;
  name: string;
  slots: SlotPosition[]; // места для работ по порядку
};

export type Theme = {
  id: string;
  name: string;
  aspectRatio: string; // например "16 / 9"
  colors: {
    wall: string;
    counter: string;
    frame: string;
    signText: string;
  };
  counters: CounterVariant[];
};

export type Artwork = {
  id: string;
  title: string;
  imageUrl?: string; // пока необязательно, вместо него цветная заглушка
  placeholderColor?: string;
  sortOrder: number;
  isFeatured: boolean;
};

export type StallData = {
  slug: string;
  artistName: string;
  signText: string;
  accentColor: string;
  themeId: string;
  counterId: string;
  artworks: Artwork[];
};