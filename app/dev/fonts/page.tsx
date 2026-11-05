import Link from "next/link";
import { Alegreya, Golos_Text, Inter, Lora, Onest, Spectral } from "next/font/google";
import styles from "./Fonts.module.css";

const golos = Golos_Text({ subsets: ["cyrillic", "latin"] });
const alegreya = Alegreya({ subsets: ["cyrillic", "latin"] });
const onest = Onest({ subsets: ["cyrillic", "latin"] });
const spectral = Spectral({ subsets: ["cyrillic", "latin"], weight: ["400", "600", "700"] });
const inter = Inter({ subsets: ["cyrillic", "latin"] });
const lora = Lora({ subsets: ["cyrillic", "latin"] });

const PAIRS = [
  { id: "А", title: "Golos Text + Alegreya", note: "тёплая, ремесленная", body: golos, heading: alegreya },
  { id: "Б", title: "Onest + Spectral", note: "современная, галерейная", body: onest, heading: spectral },
  { id: "В", title: "Inter + Lora", note: "нейтральная, спокойная", body: inter, heading: lora },
];

export default function FontsPage() {
  // служебная страница: только для разработки
  if (process.env.NODE_ENV === "production") {
    return <main style={{ padding: "1rem" }}>Страница недоступна.</main>;
  }

  return (
    <main className={styles.page}>
      <p>
        <Link href="/">← Рынок</Link>
      </p>
      <p className={styles.intro}>
        Три пары шрифтов на одном и том же куске сайта. Переключите тему в подвале и сужайте окно:
        в обеих темах и на телефоне должно читаться одинаково хорошо.
      </p>

      <div className={styles.grid}>
        {PAIRS.map((p) => {
          const body = p.body.style.fontFamily;
          const heading = p.heading.style.fontFamily;
          return (
            <article key={p.id} className={styles.sample} style={{ fontFamily: body }}>
              <p className={styles.label}>
                Вариант {p.id}: {p.title} · {p.note}
              </p>

              <div className={styles.bar}>
                <span className={styles.logo} style={{ fontFamily: heading }}>
                  Holstarium
                </span>
                <span>Карта</span>
                <span>Художники</span>
                <span>Работы</span>
              </div>

              <h1 style={{ fontFamily: heading }}>Анна</h1>
              <p className={styles.meta}>Пиксельный квартал · Работ: 8 · Подписчиков: 42</p>
              <p>
                Рисую уютные городские пейзажи и маленькие истории про людей, которые живут в этих
                домах. Работаю в пиксель-арте уже пять лет, люблю тёплую палитру и вечерний свет в
                окнах.
              </p>

              <div className={styles.sign} style={{ fontFamily: heading }}>
                Лавка Анны
              </div>

              <h2 style={{ fontFamily: heading }}>Новые работы</h2>
              <ul className={styles.cards}>
                <li>
                  <strong>Работа 3</strong>
                  <small>Анна · Пиксельный квартал</small>
                  <span className={styles.price}>25 € · печатная копия А4</span>
                </li>
                <li>
                  <strong>Ночной рынок</strong>
                  <small>Иван · Средневековый квартал</small>
                  <span className={styles.price}>1 500 ₽</span>
                </li>
                <li>
                  <strong>Без названия</strong>
                  <small>Мария · Центральная площадь</small>
                  <span className={styles.price}>Цена договорная</span>
                </li>
              </ul>

              <div className={styles.row}>
                <span className={styles.primary}>+ Подписаться</span>
                <span className={styles.outline}>✉ Запросить</span>
                <span className={styles.chip}>#пейзаж 12</span>
                <span className={styles.chip}>#акварель 7</span>
              </div>

              <p className={styles.small}>
                Съешь же ещё этих мягких французских булок, да выпей чаю. «Ёлочки», тире — и цифры
                0123456789.
              </p>
              <p className={styles.weights}>
                <span style={{ fontWeight: 400 }}>Обычный 400</span>{" "}
                <span style={{ fontWeight: 600 }}>Полужирный 600</span>{" "}
                <span style={{ fontWeight: 700 }}>Жирный 700</span>
              </p>
            </article>
          );
        })}
      </div>
    </main>
  );
}