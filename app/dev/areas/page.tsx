import AreaEditor from "@/components/Dev/AreaEditor";
import { districts, marketMap } from "@/data/mock";

export default function DevAreasPage() {
  // служебная страница: только для разработки
  if (process.env.NODE_ENV === "production") {
    return <main style={{ padding: "1rem" }}>Страница недоступна.</main>;
  }

  return (
    <main>
      <AreaEditor map={marketMap} districts={districts} />
    </main>
  );
}