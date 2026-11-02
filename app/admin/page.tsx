import AdminPanel from "@/components/Admin/AdminPanel";
import { districts, slots } from "@/data/mock";

export default function AdminPage() {
  return (
    <main>
      <AdminPanel
        districts={districts.map((d) => ({ slug: d.slug, name: d.name }))}
        slots={slots}
      />
    </main>
  );
}