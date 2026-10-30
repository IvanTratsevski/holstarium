// Позиции задаются в процентах от размера сцены, чтобы всё масштабировалось само
export type SlotPosition = {
  x: number; // от левого края, %
  y: number; // от верхнего края, %
  w: number; // ширина, %
  h: number; // высота, %
  rotate?: number; // наклон рамки, градусы
};
export type SocialLink = { label: string; url: string };
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
  tags?: string[]; // ключи тегов (нормализованный текст)
  alt?: string;
};

export type StallData = {
  slug: string;
  artistName: string;
  bio?: string; // новое: короткое описание автора
  links?: SocialLink[]; // новое
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
  artworkId: string; // новое: исходный id работы в лавке
  ref: string;       // новое: уникальный ключ по всему сайту, «лавка:работа»
  stallSlug: string;
  artistName: string;
  accentColor: string;
  districtSlug: string;
  districtName: string;
};

// то, что умеет показывать лайтбокс: работа и, по желанию, ссылка на автора
export type LightboxItem = Artwork & {
  ref?: string; // новое: если есть, в лайтбоксе показываются лайк и избранное
  authorName?: string;
  authorHref?: string;
  tagList?: { key: string; name: string }[]; // теги с отображаемыми названиями
};

export type OfficialTag = {
  key: string;      // нормализованное название, оно же ключ
  name: string;     // как показывать
  group: "subject" | "technique";
  aliases?: string[];
};

export type TagInfo = {
  key: string;
  name: string;
  count: number;    // сколько работ отмечено этим тегом
  official: boolean;
};

export type Comment = {
  id: string;
  ref: string;        // ключ работы «лавка:работа»
  authorId: string;   // "me" для комментариев текущего пользователя
  authorName: string;
  text: string;
  createdAt: number;  // миллисекунды
  editedAt?: number;
};

export type Report = {
  id: string;
  commentId: string;
  ref: string;
  authorName: string; // кого обвиняют
  text: string;       // копия текста на момент жалобы
  reason: string;
  createdAt: number;
};