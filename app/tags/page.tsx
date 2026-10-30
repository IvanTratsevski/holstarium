import Link from "next/link";
import TagDemo from "@/components/Tags/TagDemo";
import { stalls } from "@/data/mock";
import { buildCatalog } from "@/lib/tags";

export default function TagsDemoPage() {
  // каталог из всех работ сайта: официальные теги и уже существующие самодельные
  const catalog = buildCatalog(stalls.flatMap((s) => s.artworks));

  return (
    <main style={{ padding: "1rem", maxWidth: 800, margin: "0 auto" }}>
      <p>
        <Link href="/">← Рынок</Link>
      </p>
      <h1>Макет поля тегов</h1>
      <p>Тестовая страница: ничего не сохраняется. Так будет выглядеть поле в форме загрузки работы.</p>
      <TagDemo catalog={catalog} />
    </main>
  );
}