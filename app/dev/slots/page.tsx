import SlotEditor from "@/components/Dev/SlotEditor";
import { districts, slots } from "@/data/mock";

export default function DevSlotsPage() {
  // служебная страница: только для разработки
  if (process.env.NODE_ENV === "production") {
    return <main style={{ padding: "1rem" }}>Страница недоступна.</main>;
  }

  return (
    <main>
      <SlotEditor districts={districts} slots={slots} />
    </main>
  );
}