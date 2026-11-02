"use client";

import { useState } from "react";
import type { ApplicationDecision, ApplicationRecord, LightboxItem, MapSlot } from "@/types";
import { safeUrl } from "@/lib/links";
import { formatPostDate } from "@/lib/posts";
import { withBase } from "@/lib/withBase";
import {
  DECISION_COMMENT_MAX,
  DECISION_COMMENT_MIN,
  STATUS_LABELS,
  buildDecisionEmail,
  freeSlotsOf,
  samplePreviews,
  slotNumber,
} from "@/lib/applications";
import { decide, undoDecision } from "@/lib/applicationActions";
import AiBadge from "@/components/Badges/AiBadge";
import Lightbox from "@/components/Lightbox/Lightbox";
import styles from "./Admin.module.css";

type DistrictInfo = { slug: string; name: string };

type Props = {
  app: ApplicationRecord;
  decision?: ApplicationDecision;
  decisions: Record<string, ApplicationDecision>;
  districts: DistrictInfo[];
  slots: MapSlot[];
};

function EmailPreview({ email }: { email: { subject: string; body: string } }) {
  return (
    <div className={styles.email}>
      <p className={styles.emailSubject}>
        <strong>Тема:</strong> {email.subject}
      </p>
      <pre>{email.body}</pre>
    </div>
  );
}

function DecisionForm({
  app,
  decisions,
  districts,
  slots,
}: Omit<Props, "decision">) {
  const [mode, setMode] = useState<"approved" | "changes" | "rejected">("approved");
  const [districtSlug, setDistrictSlug] = useState(
    districts.some((d) => d.slug === app.district) ? app.district : districts[0].slug
  );
  const [slotId, setSlotId] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const free = freeSlotsOf(districtSlug, slots, decisions, app.id);
  // если выбранного слота в списке нет (сменили район), берём первый свободный
  const activeSlot = free.some((s) => s.id === slotId) ? slotId : (free[0]?.id ?? "");

  const email = buildDecisionEmail(app, {
    status: mode,
    comment,
    districtName: districts.find((d) => d.slug === districtSlug)?.name,
    slotNumber: activeSlot ? slotNumber(activeSlot, slots) : null,
  });

  const submit = () => {
    const text = comment.trim();
    if (mode === "approved") {
      if (!activeSlot) {
        setError("В этом районе нет свободных мест. Выберите другой район.");
        return;
      }
    } else if (text.length < DECISION_COMMENT_MIN) {
      setError(
        mode === "changes"
          ? `Опишите, что нужно исправить (не короче ${DECISION_COMMENT_MIN} символов).`
          : `Укажите причину отказа (не короче ${DECISION_COMMENT_MIN} символов).`
      );
      return;
    }

    decide(app.id, {
      status: mode,
      comment: text || undefined,
      districtSlug: mode === "approved" ? districtSlug : undefined,
      slotId: mode === "approved" ? activeSlot : undefined,
      decidedAt: Date.now(),
    });
  };

  const modes: { value: typeof mode; label: string }[] = [
    { value: "approved", label: "Одобрить" },
    { value: "changes", label: "Запросить доработки" },
    { value: "rejected", label: "Отклонить" },
  ];

  return (
    <section className={styles.decision} aria-label="Решение по заявке">
      <h3>Решение</h3>

      <div className={styles.modes} role="group" aria-label="Тип решения">
        {modes.map((m) => (
          <button
            key={m.value}
            type="button"
            aria-pressed={mode === m.value}
            onClick={() => {
              setMode(m.value);
              setError("");
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "approved" && (
        <div className={styles.placeRow}>
          <label className={styles.field}>
            <span>Район</span>
            <select value={districtSlug} onChange={(e) => setDistrictSlug(e.target.value)}>
              {districts.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Свободное место</span>
            <select
              value={activeSlot}
              disabled={free.length === 0}
              onChange={(e) => setSlotId(e.target.value)}
            >
              {free.length === 0 && <option value="">Нет свободных мест</option>}
              {free.map((s) => (
                <option key={s.id} value={s.id}>
                  №{slotNumber(s.id, slots)} (x {s.x}, y {s.y})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <label className={styles.field}>
        <span>
          {mode === "approved"
            ? "Комментарий к одобрению (необязательно)"
            : mode === "changes"
              ? "Что нужно исправить"
              : "Причина отказа"}
        </span>
        <textarea
          rows={3}
          maxLength={DECISION_COMMENT_MAX}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setError("");
          }}
        />
      </label>

      <h4>Письмо, которое получит заявитель</h4>
      <EmailPreview email={email} />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="button" className={styles.primary} onClick={submit}>
        Принять решение
      </button>
    </section>
  );
}

export default function ApplicationCard({ app, decision, decisions, districts, slots }: Props) {
  const [viewer, setViewer] = useState<number | null>(null);

  const aiCount = app.samples.filter((s) => s.aiGenerated).length;
  const wish =
    app.district === "unsure"
      ? "Не уверен(а), нужен совет"
      : (districts.find((d) => d.slug === app.district)?.name ?? app.district);

  const items: LightboxItem[] = app.samples.map((s, i) => ({
    id: s.id,
    title: s.name,
    imageUrl: samplePreviews.get(s.id),
    placeholderColor: s.placeholderColor ?? "#444",
    aspectRatio: s.aspectRatio,
    aiGenerated: s.aiGenerated,
    sortOrder: i + 1,
    isFeatured: false,
  }));

  return (
    <div className={styles.detail}>
      <dl className={styles.facts}>
        <dt>Ник</dt>
        <dd>{app.nick}</dd>
        <dt>Почта</dt>
        <dd>
          <a href={`mailto:${app.email}`}>{app.email}</a>
        </dd>
        <dt>Подана</dt>
        <dd>{formatPostDate(app.createdAt)}</dd>
        <dt>Желаемый район</dt>
        <dd>{wish}</dd>
        <dt>Пожелание по месту</dt>
        <dd>{app.placeWish || "—"}</dd>
        <dt>О себе</dt>
        <dd className={styles.pre}>{app.about || "—"}</dd>
        <dt>Ссылки</dt>
        <dd>
          <ul className={styles.links}>
            {app.links.map((l, i) => {
              const href = safeUrl(l);
              return (
                <li key={`${l}-${i}`}>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer nofollow">
                      {l}
                    </a>
                  ) : (
                    <span className={styles.badLink}>{l} (некорректная ссылка, не открывается)</span>
                  )}
                </li>
              );
            })}
          </ul>
        </dd>
      </dl>

      <h3>
        Примеры работ ({app.samples.length}
        {aiCount > 0 ? `, из них с пометкой ИИ: ${aiCount}` : ""})
      </h3>
      <ul className={styles.samples}>
        {app.samples.map((s, i) => {
          const url = samplePreviews.get(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                className={styles.sample}
                aria-label={`Открыть пример ${i + 1}: ${s.name}${
                  s.aiGenerated ? " (создано с помощью ИИ)" : ""
                }`}
                onClick={() => setViewer(i)}
              >
                {url ? (
                  <img src={withBase(url)} alt="" />
                ) : (
                  <span
                    className={styles.samplePlaceholder}
                    style={{ background: s.placeholderColor ?? "#444" }}
                  >
                    {s.placeholderColor ? s.name : "Файл недоступен после обновления страницы"}
                  </span>
                )}
                {s.aiGenerated && <AiBadge />}
              </button>
            </li>
          );
        })}
      </ul>

      {decision ? (
        <section className={styles.decision} aria-label="Принятое решение">
          <h3>Решение: {STATUS_LABELS[decision.status]}</h3>
          {decision.status === "approved" && (
            <p>
              Район:{" "}
              {districts.find((d) => d.slug === decision.districtSlug)?.name ?? "—"}, место №
              {decision.slotId ? slotNumber(decision.slotId, slots) : "—"}
            </p>
          )}
          {decision.comment && <p className={styles.pre}>Комментарий: {decision.comment}</p>}
          <h4>Отправленное письмо</h4>
          <EmailPreview
            email={buildDecisionEmail(app, {
              status: decision.status,
              comment: decision.comment,
              districtName: districts.find((d) => d.slug === decision.districtSlug)?.name,
              slotNumber: decision.slotId ? slotNumber(decision.slotId, slots) : null,
            })}
          />
          <button type="button" className={styles.secondary} onClick={() => undoDecision(app.id)}>
            Вернуть в очередь (только в прототипе)
          </button>
        </section>
      ) : (
        <DecisionForm
          key={app.id}
          app={app}
          decisions={decisions}
          districts={districts}
          slots={slots}
        />
      )}

      <Lightbox
        artworks={items}
        index={viewer}
        onClose={() => setViewer(null)}
        onChange={setViewer}
      />
    </div>
  );
}