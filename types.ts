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
  description?: string; // новое
  imageUrl?: string; // пока необязательно, вместо него цветная заглушка
  placeholderColor?: string;
  aspectRatio?: number; // ширина / высота, нужна для заглушек и против «прыжков» вёрстки
  sortOrder: number;
  isFeatured: boolean;
};

export type StallData = {
  slug: string;
  artistName: string;
  bio?: string; // новое: короткое описание автора
  signText: string;
  accentColor: string;
  themeId: string;
  counterId: string;
  artworks: Artwork[];
};

export type District = {
  slug: string;
  name: string;
  description: string;
  themeId: string;
  mapImage?: string; // пока нет картинки, рисуется заглушка
  mapWidth: number;  // размер картинки в пикселях, в этих единицах хранятся координаты слотов
  mapHeight: number;
};

export type MapSlot = {
  id: string;
  districtSlug: string;
  x: number;    // центр маркера, в пикселях исходной карты
  y: number;
  size: number; // диаметр маркера, в тех же единицах
  stallSlug?: string; // нет значения = место свободно
};

export type ArtworkPreview = {
  id: string;
  title: string;
  imageUrl?: string;
  placeholderColor?: string;
};

// слот вместе с краткими данными лавки, чтобы клиентскому компоненту не тащить лишнее
export type MapSlotView = MapSlot & {
  stall?: {
    slug: string;
    artistName: string;
    bio?: string;
    signText: string;
    accentColor: string;
    artworksCount: number;
    previews: ArtworkPreview[];
  };
};

// работа в ленте: сама работа плюс данные автора и района
export type FeedItem = Artwork & {
  stallSlug: string;
  artistName: string;
  accentColor: string;
  districtSlug: string;
  districtName: string;
};

// то, что умеет показывать лайтбокс: работа и, по желанию, ссылка на автора
export type LightboxItem = Artwork & {
  authorName?: string;
  authorHref?: string;
};