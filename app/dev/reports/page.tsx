import Link from "next/link";
import ReportsView from "@/components/Dev/ReportsView";

export default function ReportsPage() {
  // служебная страница: только для разработки
  if (process.env.NODE_ENV === "production") {
    return <main style={{ padding: "1rem" }}>Страница недоступна.</main>;
  }

  return (
    <main style={{ padding: "1rem", maxWidth: 800, margin: "0 auto" }}>
      <p>
        <Link href="/">← Рынок</Link>
      </p>
      <ReportsView />
    </main>
  );
}