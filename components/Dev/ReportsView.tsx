"use client";

import { update } from "@/lib/socialStore";
import { useSocial } from "@/components/Social/SocialProvider";

export default function ReportsView() {
  const { state } = useSocial();
  const reports = [...state.reports].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <h1>Жалобы на комментарии</h1>
      <p>Тестовая очередь: хранится только в вашем браузере.</p>

      {reports.length === 0 ? (
        <p>Жалоб нет.</p>
      ) : (
        <>
          <ul style={{ padding: 0, listStyle: "none" }}>
            {reports.map((r) => (
              <li key={r.id} style={{ marginBottom: "1rem", padding: "0.75rem", border: "1px solid #555", borderRadius: 8 }}>
                <p style={{ margin: 0 }}>
                  <strong>{r.reason}</strong> · на {r.authorName} · работа {r.ref} ·{" "}
                  {new Date(r.createdAt).toLocaleString("ru-RU")}
                </p>
                <p style={{ margin: "0.4rem 0 0", whiteSpace: "pre-line" }}>«{r.text}»</p>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => update((s) => ({ ...s, reports: [] }))}>
            Очистить очередь
          </button>
        </>
      )}
    </div>
  );
}