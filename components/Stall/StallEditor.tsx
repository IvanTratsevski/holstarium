"use client";

import type { StallData, Theme } from "@/types";
import { safeUrl } from "@/lib/links";
import styles from "./StallEditor.module.css";

const MAX_LINKS = 4;
const BIO_MAX = 300;
const PRESETS = ["#e07a5f", "#81b29a", "#6d597a", "#355070", "#b56576", "#f2cc8f"];

type Props = {
  stall: StallData;
  theme: Theme;
  onChange: (patch: Partial<StallData>) => void;
  onReset: () => void;
};

export default function StallEditor({ stall, theme, onChange, onReset }: Props) {
  const links = stall.links ?? [];
  const counter = theme.counters.find((c) => c.id === stall.counterId) ?? theme.counters[0];
  const featuredCount = stall.artworks.filter((a) => a.isFeatured).length;

  const setLink = (i: number, patch: Partial<{ label: string; url: string }>) =>
    onChange({ links: links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) });

  return (
    <section className={styles.panel} aria-label="Редактирование лавки">
      <h2>Оформление лавки</h2>

      <label className={styles.field}>
        <span>Вывеска</span>
        <input
          type="text"
          value={stall.signText}
          maxLength={28}
          onChange={(e) => onChange({ signText: e.target.value })}
        />
      </label>

      <div className={styles.field}>
        <span id="color-label">Цвет вывески</span>
        <div className={styles.colors} role="group" aria-labelledby="color-label">
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              className={styles.swatch}
              style={{ background: c }}
              aria-label={`Цвет ${c}`}
              aria-pressed={stall.accentColor.toLowerCase() === c}
              onClick={() => onChange({ accentColor: c })}
            />
          ))}
          <input
            type="color"
            value={stall.accentColor}
            aria-label="Свой цвет"
            onChange={(e) => onChange({ accentColor: e.target.value })}
          />
        </div>
      </div>

      <fieldset className={styles.field}>
        <legend>Прилавок</legend>
        {theme.counters.map((c) => (
          <label key={c.id} className={styles.radio}>
            <input
              type="radio"
              name="counter"
              checked={stall.counterId === c.id}
              onChange={() => onChange({ counterId: c.id })}
            />
            {c.name} · мест: {c.slots.length}
          </label>
        ))}
        {featuredCount > counter.slots.length && (
          <p className={styles.warn}>
            Избранных работ {featuredCount}, а на прилавке помещается {counter.slots.length}.
            Остальные покажутся в блоке «Все работы».
          </p>
        )}
      </fieldset>

      <h2>Профиль</h2>

      <label className={styles.field}>
        <span>Имя или ник</span>
        <input
          type="text"
          value={stall.artistName}
          maxLength={40}
          onChange={(e) => onChange({ artistName: e.target.value })}
        />
      </label>

      <label className={styles.field}>
        <span>О себе</span>
        <textarea
          rows={5}
          maxLength={BIO_MAX}
          value={stall.bio ?? ""}
          onChange={(e) => onChange({ bio: e.target.value })}
        />
        <small className={styles.count}>
          {(stall.bio ?? "").length} / {BIO_MAX}
        </small>
      </label>

      <div className={styles.field}>
        <span>Ссылки (до {MAX_LINKS})</span>
        <ul className={styles.linkList}>
          {links.map((l, i) => {
            const invalid = l.url.trim() !== "" && safeUrl(l.url) === null;
            return (
              <li key={i} className={styles.linkRow}>
                <div className={styles.linkInputs}>
                  <input
                    type="text"
                    aria-label={`Название ссылки ${i + 1}`}
                    placeholder="Название (Telegram, Behance…)"
                    maxLength={30}
                    value={l.label}
                    onChange={(e) => setLink(i, { label: e.target.value })}
                  />
                  <input
                    type="text"
                    aria-label={`Адрес ссылки ${i + 1}`}
                    aria-invalid={invalid}
                    placeholder="https://…"
                    value={l.url}
                    onChange={(e) => setLink(i, { url: e.target.value })}
                  />
                  {invalid && (
                    <small className={styles.error} role="alert">
                      Похоже на неверный адрес. Такая ссылка не будет показана.
                    </small>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={`Удалить ссылку ${i + 1}`}
                  onClick={() => onChange({ links: links.filter((_, idx) => idx !== i) })}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className={styles.btn}
          disabled={links.length >= MAX_LINKS}
          onClick={() => onChange({ links: [...links, { label: "", url: "" }] })}
        >
          + Добавить ссылку
        </button>
      </div>

      <button type="button" className={styles.btn} onClick={onReset}>
        Сбросить изменения
      </button>
    </section>
  );
}