import Link from "next/link";
import { districts } from "@/data/mock";

export default function Home() {
  return (
    <main style={{ padding: "1rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Holstarium</h1>
      <p>Виртуальный рынок художников. Выберите район:</p>
      <ul>
        {districts.map((d) => (
          <li key={d.slug}>
            <Link href={`/district/${d.slug}`}>{d.name}</Link>: {d.description}
          </li>
        ))}
      </ul>
      <p>
  <Link href="/feed">Смотреть все работы подряд →</Link>
</p>
    </main>
  );
}