import type {
  District,
  DistrictArea,
  MapSlot,
  MarketMap,
  Post,
  SaleInfo,
  SocialLink,
  StallData,
} from "@/types";

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
    aiGenerated: (i + offset) % 6 === 4 ? true : undefined,
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
// Впишите реальные размеры файла /public/maps/market.webp в пикселях.
// Если они не совпадут с настоящими, области на карте сдвинутся.
const MARKET_W = 3600;
const MARKET_H = 2400;

// Готовые области. Когда обведёте район в /dev/areas, вставьте результат сюда:
// вместо слова «area:» напишите slug района, например
//   nature: { points: [[...], ...], label: [x, y], color: "#6fb3d2" },
const areas: Record<string, DistrictArea> = {
  // plaza
plaza: {
  points: [[1720, 770], [1950, 790], [2030, 890], [1980, 970], [1790, 1020], [1610, 970], [1560, 880]],
  label: [1810, 900],
  color: "#d8c07a",
},

// nature
nature: {
  points: [[1830, 350], [1670, 460], [1130, 680], [860, 550], [510, 500], [770, 320], [910, 200], [1070, 260], [1180, 220], [1240, 270], [1400, 270], [1520, 230], [1590, 260], [1670, 260]],
  label: [1240, 350],
  color: "#6fb3d2",
},

// cyber
cyber: {
  points: [[2410, 390], [2570, 470], [2580, 600], [2330, 690], [2090, 740], [2080, 670], [1720, 550], [1680, 460], [1810, 370], [2000, 360], [2200, 350]],
  label: [2130, 510],
  color: "#c14bff",
},

// forest
forest: {
  points: [[1150, 690], [1000, 730], [890, 950], [640, 1050], [470, 1040], [230, 1090], [70, 960], [40, 810], [40, 700], [170, 660], [520, 510], [860, 560]],
  label: [510, 810],
  color: "#4fa35f",
},

// classic
classic: {
  points: [[1380, 640], [1550, 780], [1430, 970], [1230, 1020], [990, 980], [910, 920], [1010, 740], [1260, 640]],
  label: [1220, 840],
  color: "#e6d9a8",
},

// medieval
medieval: {
  points: [[2180, 970], [2450, 1040], [2810, 990], [2800, 820], [2580, 730], [2330, 690], [2030, 800]],
  label: [2450, 860],
  color: "#c97b5a",
},

// magic
magic: {
  points: [[3458, 780], [3550, 910], [3490, 1050], [3330, 1090], [3110, 1110], [2920, 1050], [2830, 980], [2850, 880], [2880, 810], [2910, 740], [3110, 660], [3300, 710]],
  label: [3140, 900],
  color: "#6a63ff",
},

// architecture
architecture: {
  points: [[1030, 1340], [920, 1130], [660, 1060], [450, 1050], [240, 1100], [60, 1180], [60, 1310], [230, 1400], [510, 1440]],
  label: [460, 1220],
  color: "#9fb8cc",
},

// anime
anime: {
  points: [[950, 1140], [1300, 1050], [1760, 1170], [1630, 1450], [1140, 1390], [1040, 1340]],
  label: [1300, 1260],
  color: "#f48fb1",
},

// abstract
abstract: {
  points: [[2290, 1470], [2360, 1190], [2070, 1060], [1800, 1170], [1660, 1440], [2080, 1520]],
  label: [2040, 1310],
  color: "#f2c230",
},

// design
design: {
  points: [[2830, 1430], [2880, 1250], [2740, 1170], [2520, 1140], [2380, 1180], [2290, 1470], [2620, 1490]],
  label: [2610, 1300],
  color: "#2fb5a8",
},

// photo
photo: {
  points: [[3530, 1550], [3580, 1430], [3460, 1300], [3280, 1220], [3040, 1200], [2890, 1280], [2840, 1430], [3160, 1570], [3380, 1590]],
  label: [3240, 1400],
  color: "#e8803a",
},

// digital
digital: {
  points: [[990, 1760], [920, 1630], [960, 1490], [710, 1440], [520, 1470], [310, 1440], [60, 1550], [40, 1630], [220, 1740], [350, 1790], [470, 1820], [610, 1850], [780, 1890]],
  label: [530, 1650],
  color: "#3a8ee6",
},

// comics
comics: {
  points: [[1440, 1770], [1490, 1650], [1540, 1550], [1340, 1500], [1140, 1420], [980, 1480], [970, 1630], [1090, 1800]],
  label: [1250, 1600],
  color: "#e0503f",
},

// crafts
crafts: {
  points: [[2250, 1870], [2230, 1720], [2170, 1620], [1960, 1550], [1630, 1550], [1520, 1660], [1470, 1770], [1600, 1880], [1650, 1920], [1960, 1980], [2140, 1930]],
  label: [1870, 1770],
  color: "#b98a5a",
},

// animation
animation: {
  points: [[3120, 1800], [3020, 1640], [2840, 1550], [2530, 1530], [2430, 1540], [2200, 1610], [2250, 1700], [2270, 1830], [2550, 1920], [2720, 1930], [2890, 1950]],
  label: [2620, 1730],
  color: "#57c7e0",
},
};

// Временная метка района: маленький треугольник у его подписи на картинке.
// px и py это доли ширины и высоты картинки (0.5 = середина)
const placeholderArea = (px: number, py: number, color: string): DistrictArea => {
  const cx = Math.round(MARKET_W * px);
  const cy = Math.round(MARKET_H * py);
  const r = Math.round(MARKET_W * 0.03);
  return {
    points: [
      [cx - r, cy + r],
      [cx, cy - r],
      [cx + r, cy + r],
    ],
    label: [cx, cy],
    color,
  };
};

const makeDistrict = (
  slug: string,
  name: string,
  description: string,
  px: number,
  py: number,
  color: string
): District => ({
  slug,
  name,
  description,
  themeId: "pixel",
  mapWidth: 2400,
  mapHeight: 1500,
  area: areas[slug] ?? placeholderArea(px, py, color),
});

export const districts: District[] = [
  makeDistrict("plaza", "Центральная площадь", "Для тех, кто не вписывается в стили других районов: реализм, смешанные техники и всё необычное.", 0.5, 0.33, "#d8c07a"),
  makeDistrict("nature", "Природные просторы", "Горы, моря, животные и пейзажи под открытым небом.", 0.34, 0.08, "#6fb3d2"),
  makeDistrict("cyber", "Киберметрополис", "Неон, киберпанк, роботы и технологии будущего.", 0.6, 0.16, "#c14bff"),
  makeDistrict("forest", "Лесной район", "Леса, озёра, сказочные существа и уютная природа.", 0.18, 0.26, "#4fa35f"),
  makeDistrict("classic", "Классическое искусство", "Живопись, графика и скульптура в традициях академической школы.", 0.35, 0.32, "#e6d9a8"),
  makeDistrict("medieval", "Средневековый район", "Гербы, замки, рыцари и всё, что пахнет пергаментом.", 0.72, 0.32, "#c97b5a"),
  makeDistrict("magic", "Магический район", "Фэнтези, волшебство, мистика и потусторонние миры.", 0.89, 0.32, "#6a63ff"),
  makeDistrict("architecture", "Архитектура и города", "Здания, интерьеры, города будущего и прошлого.", 0.135, 0.51, "#9fb8cc"),
  makeDistrict("anime", "Аниме и манга", "Аниме, манга и арт в японской стилистике.", 0.38, 0.51, "#f48fb1"),
  makeDistrict("abstract", "Абстракция и эксперимент", "Работы с формой, цветом и материалом без привязки к реальности.", 0.56, 0.53, "#f2c230"),
  makeDistrict("design", "Дизайн и коммерческое искусство", "Плакаты, упаковка, мерч, айдентика и иллюстрации для брендов.", 0.73, 0.52, "#2fb5a8"),
  makeDistrict("photo", "Фотография", "Фотографии, обработанные снимки и фотоколлажи.", 0.92, 0.56, "#e8803a"),
  makeDistrict("digital", "Цифровое искусство", "Цифровая живопись, пиксель-арт и работы из графических редакторов.", 0.11, 0.69, "#3a8ee6"),
  makeDistrict("comics", "Комиксы и повествование", "Комиксы, раскадровки и иллюстрации, рассказывающие историю.", 0.35, 0.7, "#e0503f"),
  makeDistrict("crafts", "Традиционные ремёсла", "Акварель, масло, гравюра, керамика, каллиграфия и другие работы руками.", 0.53, 0.74, "#b98a5a"),
  makeDistrict("animation", "3D и анимация", "3D-модели, рендеры, анимация и моушн-графика.", 0.765, 0.74, "#57c7e0"),
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
  districtSlug: "digital",
  x,
  y,
  size: 120,
  stallSlug: pixelOccupied[i],
}));

const plazaSlots: MapSlot[] = [
  { id: "plaza-1", districtSlug: "plaza", x: 600, y: 600, size: 120 },
  { id: "plaza-2", districtSlug: "plaza", x: 1000, y: 600, size: 120 },
  { id: "plaza-3", districtSlug: "plaza", x: 1400, y: 600, size: 120 },
  { id: "plaza-4", districtSlug: "plaza", x: 1800, y: 600, size: 120 },
];

// временные места для новых районов; настоящие расставьте в /dev/slots
const gridSlots = (slug: string, count: number): MapSlot[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${slug}-${i + 1}`,
    districtSlug: slug,
    x: 400 + (i % 5) * 400,
    y: 400 + Math.floor(i / 5) * 400,
    size: 120,
  }));

const newDistrictSlots = [
  "nature", "cyber", "forest", "classic", "magic", "architecture",
  "anime", "abstract", "design", "photo", "comics", "crafts", "animation",
].flatMap((slug) => gridSlots(slug, 6));

export const slots: MapSlot[] = [
  ...pixelSlots,
  ...medievalSlots,
  ...plazaSlots,
  ...newDistrictSlots,
];

// общий план рынка; когда появится картинка: image: "/maps/market.webp" и её реальные размеры
export const marketMap: MarketMap = {
  width: MARKET_W,
  height: MARKET_H,
  image: "/maps/town_map.webp",
  labels: "hover", // названия уже нарисованы на картинке; "always" покажет и наши подписи
};