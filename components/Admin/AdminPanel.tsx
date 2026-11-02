"use client";

import { useState } from "react";
import Link from "next/link";
import type { ApplicationStatus, MapSlot } from "@/types";
import { STATUS_LABELS, allApplications, statusOf } from "@/lib/applications";
import { formatPostDate } from "@/lib/posts";
import { useSocial } from "@/components/Social/SocialProvider";
import ApplicationCard from "./ApplicationCard";
import styles from "./Admin.module.css";

type Props = {
  districts: { slug: string; name: string }[];
  slots: MapSlot[];
};

const FILTERS: ("all" | ApplicationStatus)[] = ["pending", "changes", "approved", "rejected", "all"];

export default function AdminPanel({ districts, slots }: Props) {
  const { state } = useSocial();
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("pending");
  const [openId, setOpenId] = useState<string | null>(null);

  if (state.role !== "admin") {
    return (
      <div className={styles.wrap}>
        <h1>Админ-панель</h1>
        <p>
          Нет доступа. В прототипе выберите роль «Админ» в нижней панели. В боевой версии сюда
          пускает только вход администратора, а проверку делает сервер.
        </p>
        <p>
          <Link href="/">← Рынок</Link>
        </p>
      </div>
    );
  }

  const apps = allApplications(state.applications);
  const count = (f: "all" | ApplicationStatus) =>
    f === "all" ? apps.length : apps.filter((a) => statusOf(a.id, state.decisions) === f).length;
  const list = apps.filter((a) => filter === "all" || statusOf(a.id, state.decisions) === filter);

  return (
    <div className={styles.wrap}>
      <h1>Заявки художников</h1>
      <p className={styles.note}>
        Тестовая очередь: три готовые заявки и все, что вы отправили через «Стать художником».
        Решения хранятся только в вашем браузере, письма не отправляются, а одобрение лавку на
        карте не создаёт.
      </p>

      <div className={styles.filters} role="group" aria-label="Фильтр по статусу">
        {FILTERS.map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "Все" : STATUS_LABELS[f]} ({count(f)})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p>В этом разделе заявок нет.</p>
      ) : (
        <ul className={styles.list}>
          {list.map((app) => {
            const status = statusOf(app.id, state.decisions);
            const open = openId === app.id;
            const aiCount = app.samples.filter((s) => s.aiGenerated).length;
            return (
              <li key={app.id} className={styles.item}>
                <div className={styles.row}>
                  <div className={styles.rowMain}>
                    <strong>{app.nick}</strong>
                    <small>
                      {app.id} · {formatPostDate(app.createdAt)} · примеров: {app.samples.length}
                      {aiCount > 0 ? `, с ИИ: ${aiCount}` : ""}
                    </small>
                  </div>
                  <span className={`${styles.tag} ${styles[`tag_${status}`]}`}>
                    {STATUS_LABELS[status]}
                  </span>
                  <button
                    type="button"
                    className={styles.openBtn}
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : app.id)}
                  >
                    {open ? "Свернуть" : "Открыть"}
                  </button>
                </div>

                {open && (
                  <ApplicationCard
                    app={app}
                    decision={state.decisions[app.id]}
                    decisions={state.decisions}
                    districts={districts}
                    slots={slots}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}