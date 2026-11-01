import Link from "next/link";
import ApplyForm from "@/components/Apply/ApplyForm";
import { districts, slots } from "@/data/mock";

export default function ApplyPage() {
  const options = districts.map((d) => ({
    slug: d.slug,
    name: d.name,
    description: d.description,
    free: slots.filter((s) => s.districtSlug === d.slug && !s.stallSlug).length,
  }));

  return (
    <main style={{ padding: "1rem", maxWidth: 800, margin: "0 auto" }}>
      <p>
        <Link href="/">← Рынок</Link>
      </p>
      <h1>Стать художником</h1>
      <p>
        Лавки на рынке открываются по заявкам: администратор смотрит примеры работ и подбирает
        место. Заполните форму, и мы ответим на почту.
      </p>
      <ApplyForm districts={options} />
    </main>
  );
}