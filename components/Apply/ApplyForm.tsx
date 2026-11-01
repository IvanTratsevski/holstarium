"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import Link from "next/link";
import {
  ABOUT_MAX,
  FIELD_META,
  FIELD_ORDER,
  LINKS_MAX,
  PLACE_MAX,
  REVIEW_DAYS,
  SAMPLES_MAX,
  SAMPLES_MIN,
  validateApplication,
} from "@/lib/application";
import type { ApplicationForm, FormErrors, SampleDraft } from "@/lib/application";
import { ALLOWED_TYPES, MAX_FILE_MB } from "@/lib/artworks";
import styles from "./Apply.module.css";

type DistrictOption = { slug: string; name: string; description: string; free: number };

const EMPTY: ApplicationForm = {
  nick: "",
  email: "",
  links: [""],
  samples: [],
  district: "",
  placeWish: "",
  about: "",
  agree: false,
};

const describe = (id: string, hasHint: boolean, error?: string) =>
  [hasHint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {hint && (
        <small id={`${id}-hint`} className={styles.hint}>
          {hint}
        </small>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function ApplyForm({ districts }: { districts: DistrictOption[] }) {
  const [form, setForm] = useState<ApplicationForm>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [fileNotice, setFileNotice] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const trapRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ApplicationForm>(key: K, value: ApplicationForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined })); // ошибка поля уходит, когда его начали править
  };

  const errorKeys = FIELD_ORDER.filter((k) => errors[k]);
  const selectedDistrict = districts.find((d) => d.slug === form.district);

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // чтобы тот же файл можно было выбрать снова
    if (files.length === 0) return;

    const room = SAMPLES_MAX - form.samples.length;
    const added: SampleDraft[] = [];
    const notes: string[] = [];

    for (const file of files) {
      if (added.length >= room) {
        notes.push(`Можно приложить не больше ${SAMPLES_MAX} работ.`);
        break;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        notes.push(`«${file.name}»: подойдут JPG, PNG, WebP и GIF.`);
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        notes.push(`«${file.name}»: больше ${MAX_FILE_MB} МБ.`);
        continue;
      }
      added.push({
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        url: URL.createObjectURL(file),
        aiGenerated: false,
      });
    }

    if (added.length > 0) set("samples", [...form.samples, ...added]);
    setFileNotice(notes.join(" "));
  };

  const removeSample = (id: string) => {
    const target = form.samples.find((s) => s.id === id);
    if (target) URL.revokeObjectURL(target.url);
    set("samples", form.samples.filter((s) => s.id !== id));
  };

  const toggleAi = (id: string, value: boolean) =>
    set("samples", form.samples.map((s) => (s.id === id ? { ...s, aiGenerated: value } : s)));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const number = `A-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    // ловушка для ботов: человек это поле не видит, а бот его заполняет
    if (trapRef.current?.value) {
      setSubmitted(number);
      return;
    }

    const found = validateApplication(
      form,
      districts.map((d) => d.slug)
    );
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    form.samples.forEach((s) => URL.revokeObjectURL(s.url));
    setSubmitted(number);
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  if (submitted) {
    return (
      <div className={styles.done} role="status">
        <h2 ref={doneRef} tabIndex={-1}>
          Заявка отправлена
        </h2>
        <p>
          Номер заявки: <strong>{submitted}</strong>. Сохраните его на случай, если понадобится
          уточнить статус.
        </p>
        <p>
          Обычно мы отвечаем в течение {REVIEW_DAYS}. Решение придёт на {form.email.trim()}:
        </p>
        <ul>
          <li>
            <strong>одобрена</strong>: придёт письмо со ссылкой, где вы задаёте пароль и входите в
            свою лавку;
          </li>
          <li>
            <strong>нужны доработки</strong>: в письме будет написано, что исправить, и вы сможете
            отправить заявку снова;
          </li>
          <li>
            <strong>отклонена</strong>: в письме будет указана причина.
          </li>
        </ul>
        <p>
          Если ответа нет дольше недели, проверьте папку «Спам», а затем свяжитесь с администрацией
          (способ связи будет указан здесь перед запуском).
        </p>
        <p className={styles.hint}>В прототипе письма не отправляются и ничего не сохраняется.</p>
        <p>
          <Link href="/">← Вернуться на рынок</Link>
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {errorKeys.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className={styles.summary}>
          <strong>Нужно исправить:</strong>
          <ul>
            {errorKeys.map((k) => (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => document.getElementById(FIELD_META[k].id)?.focus()}
                >
                  {FIELD_META[k].label}: {errors[k]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Field
        id="apply-nick"
        label="Ник или имя"
        hint="Так вас будут видеть на карте и в лавке."
        error={errors.nick}
      >
        <input
          id="apply-nick"
          className={styles.input}
          type="text"
          autoComplete="nickname"
          maxLength={30}
          aria-required="true"
          aria-invalid={!!errors.nick}
          aria-describedby={describe("apply-nick", true, errors.nick)}
          value={form.nick}
          onChange={(e) => set("nick", e.target.value)}
        />
      </Field>

      <Field
        id="apply-email"
        label="Почта"
        hint="Туда придёт решение по заявке и ссылка для входа."
        error={errors.email}
      >
        <input
          id="apply-email"
          className={styles.input}
          type="email"
          autoComplete="email"
          maxLength={120}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={describe("apply-email", true, errors.email)}
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </Field>

      <fieldset className={styles.group}>
        <legend>Ссылки на портфолио или соцсети</legend>
        <small id="apply-links-hint" className={styles.hint}>
          Минимум одна, до {LINKS_MAX}: Behance, ArtStation, Instagram, Telegram, личный сайт…
        </small>
        {form.links.map((url, i) => (
          <div key={i} className={styles.linkRow}>
            <input
              id={i === 0 ? "apply-link-0" : undefined}
              className={styles.input}
              type="text"
              aria-label={`Ссылка ${i + 1}`}
              aria-invalid={!!errors.links}
              aria-describedby={describe("apply-links", true, errors.links)}
              placeholder="https://…"
              value={url}
              onChange={(e) =>
                set(
                  "links",
                  form.links.map((l, idx) => (idx === i ? e.target.value : l))
                )
              }
            />
            {form.links.length > 1 && (
              <button
                type="button"
                className={styles.iconBtn}
                aria-label={`Удалить ссылку ${i + 1}`}
                onClick={() =>
                  set(
                    "links",
                    form.links.filter((_, idx) => idx !== i)
                  )
                }
              >
                ×
              </button>
            )}
          </div>
        ))}
        {form.links.length < LINKS_MAX && (
          <button
            type="button"
            className={styles.btn}
            onClick={() => set("links", [...form.links, ""])}
          >
            + Добавить ссылку
          </button>
        )}
        {errors.links && (
          <p id="apply-links-error" className={styles.error}>
            {errors.links}
          </p>
        )}
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Примеры работ</legend>
        <small id="apply-files-hint" className={styles.hint}>
          От {SAMPLES_MIN} до {SAMPLES_MAX} файлов (JPG, PNG, WebP, GIF, до {MAX_FILE_MB} МБ).
          Покажите свои лучшие и самые характерные работы. Работы, созданные с помощью ИИ,
          допускаются, но их нужно отметить галочкой.
        </small>
        <input
          id="apply-files"
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          disabled={form.samples.length >= SAMPLES_MAX}
          aria-invalid={!!errors.samples}
          aria-describedby={describe("apply-files", true, errors.samples)}
          onChange={onFiles}
        />
        {fileNotice && (
          <p role="alert" className={styles.error}>
            {fileNotice}
          </p>
        )}

        {form.samples.length > 0 && (
          <ul className={styles.samples}>
            {form.samples.map((s, i) => (
              <li key={s.id} className={styles.sample}>
                <img src={s.url} alt={`Пример ${i + 1}`} />
                <div className={styles.sampleBody}>
                  <span className={styles.sampleName}>{s.name}</span>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={s.aiGenerated}
                      onChange={(e) => toggleAi(s.id, e.target.checked)}
                    />
                    Создано с помощью ИИ
                  </label>
                </div>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={`Убрать пример ${i + 1}`}
                  onClick={() => removeSample(s.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <small className={styles.hint}>
          Приложено: {form.samples.length} из {SAMPLES_MAX}
        </small>
        {errors.samples && (
          <p id="apply-files-error" className={styles.error}>
            {errors.samples}
          </p>
        )}
      </fieldset>

      <Field
        id="apply-district"
        label="Желаемый район"
        hint="Окончательно район подтверждает администратор."
        error={errors.district}
      >
        <select
          id="apply-district"
          className={styles.select}
          aria-required="true"
          aria-invalid={!!errors.district}
          aria-describedby={describe("apply-district", true, errors.district)}
          value={form.district}
          onChange={(e) => set("district", e.target.value)}
        >
          <option value="" disabled>
            Выберите район
          </option>
          {districts.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name} (свободно мест: {d.free})
            </option>
          ))}
          <option value="unsure">Не уверен(а), нужен совет</option>
        </select>
        {selectedDistrict && <p className={styles.districtNote}>{selectedDistrict.description}</p>}
        {form.district === "unsure" && (
          <p className={styles.districtNote}>
            Администратор предложит подходящий район по вашим работам.
          </p>
        )}
      </Field>

      <Field
        id="apply-place"
        label="Пожелание по месту (необязательно)"
        hint="Например: «ближе к центру» или «рядом с лавкой Анны». Конкретное место назначает администратор."
        error={errors.placeWish}
      >
        <textarea
          id="apply-place"
          className={styles.textarea}
          rows={2}
          maxLength={PLACE_MAX}
          aria-invalid={!!errors.placeWish}
          aria-describedby={describe("apply-place", true, errors.placeWish)}
          value={form.placeWish}
          onChange={(e) => set("placeWish", e.target.value)}
        />
      </Field>

      <Field
        id="apply-about"
        label="О себе (необязательно)"
        hint="Короткий рассказ: что рисуете и в каком стиле. Потом его можно использовать как описание лавки."
        error={errors.about}
      >
        <textarea
          id="apply-about"
          className={styles.textarea}
          rows={4}
          maxLength={ABOUT_MAX}
          aria-invalid={!!errors.about}
          aria-describedby={describe("apply-about", true, errors.about)}
          value={form.about}
          onChange={(e) => set("about", e.target.value)}
        />
        <small className={styles.count}>
          {form.about.length} / {ABOUT_MAX}
        </small>
      </Field>

      <div className={styles.field}>
        <label className={styles.check} htmlFor="apply-agree">
          <input
            id="apply-agree"
            type="checkbox"
            aria-required="true"
            aria-invalid={!!errors.agree}
            aria-describedby={describe("apply-agree", false, errors.agree)}
            checked={form.agree}
            onChange={(e) => set("agree", e.target.checked)}
          />
          <span>
            Я автор отправленных работ и имею право их показывать, не публикую чужие материалы и
            буду отмечать работы, созданные с помощью ИИ. Принимаю{" "}
            <Link href="/rules" target="_blank" rel="noopener">
              правила сайта
            </Link>
            .
          </span>
        </label>
        {errors.agree && (
          <p id="apply-agree-error" className={styles.error}>
            {errors.agree}
          </p>
        )}
      </div>

      {/* ловушка для ботов: поле спрятано от людей и читалок */}
      <div className={styles.trap} aria-hidden="true">
        <label>
          Оставьте это поле пустым
          <input ref={trapRef} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button type="submit" className={styles.primary}>
        Отправить заявку
      </button>
    </form>
  );
}