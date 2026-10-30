"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import type { TagInfo } from "@/types";
import { MAX_TAG_LENGTH, MAX_TAGS_PER_ARTWORK } from "@/data/tags";
import { normalizeTag, resolveTag, suggestTags, tagName } from "@/lib/tags";
import styles from "./TagInput.module.css";

type Props = {
  catalog: TagInfo[];
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
};

type Option = { key: string; label: string; hint: string; isNew: boolean };

export default function TagInput({ catalog, value, onChange, max = MAX_TAGS_PER_ARTWORK }: Props) {
  const [input, setInput] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  const full = value.length >= max;

  const options = useMemo<Option[]>(() => {
    if (!normalizeTag(input)) return [];

    const found: Option[] = suggestTags(input, catalog, value).map((t) => ({
      key: t.key,
      label: t.name,
      hint: t.official ? "из списка" : `используют: ${t.count}`,
      isNew: false,
    }));

    // «Создать» предлагаем только если такого тега ещё нет
    const resolved = resolveTag(input);
    const exists =
      resolved !== null && (catalog.some((t) => t.key === resolved) || value.includes(resolved));
    if (resolved && !exists) {
      found.push({ key: resolved, label: resolved, hint: "новый тег", isNew: true });
    }
    return found;
  }, [input, catalog, value]);

  const activeIdx = options.length ? Math.min(active, options.length - 1) : 0;
  const showList = open && !full && options.length > 0;

  const add = (key: string) => {
    if (value.includes(key)) {
      setNotice("Этот тег уже добавлен");
      return;
    }
    if (full) {
      setNotice(`Можно не больше ${max} тегов`);
      return;
    }
    onChange([...value, key]);
    setInput("");
    setActive(0);
    setNotice("");
  };

  const remove = (key: string) => onChange(value.filter((k) => k !== key));

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setActive(0);
    setOpen(true);
    setNotice("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && options.length) {
      e.preventDefault();
      setOpen(true);
      setActive((activeIdx + 1) % options.length);
    } else if (e.key === "ArrowUp" && options.length) {
      e.preventDefault();
      setActive((activeIdx - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === ",") {
      // Enter на пустом поле не трогаем: пусть работает отправка формы
      if (e.key === "," || input.trim()) e.preventDefault();
      if (!input.trim()) return;
      if (options.length && !full) {
        add(options[activeIdx].key);
      } else {
        const resolved = resolveTag(input);
        if (resolved) add(resolved);
        else setNotice("Тег слишком короткий");
      }
    } else if (e.key === "Backspace" && !input && value.length) {
      remove(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.box} onClick={() => inputRef.current?.focus()}>
        {value.map((key) => (
          <span key={key} className={styles.chip}>
            {tagName(key)}
            <button
              type="button"
              onClick={() => remove(key)}
              aria-label={`Убрать тег ${tagName(key)}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className={styles.input}
          role="combobox"
          aria-label="Добавить тег"
          aria-expanded={showList}
          aria-controls={`${uid}-list`}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${uid}-opt-${activeIdx}` : undefined}
          autoComplete="off"
          maxLength={MAX_TAG_LENGTH}
          placeholder={full ? "" : value.length ? "Ещё тег…" : "Начните вводить тег…"}
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />
      </div>

      {showList && (
        <ul id={`${uid}-list`} role="listbox" className={styles.list}>
          {options.map((o, i) => (
            <li
              key={o.key}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              className={`${styles.option} ${i === activeIdx ? styles.optionActive : ""}`}
              // mousedown, а не click: иначе поле потеряет фокус раньше, чем сработает выбор
              onMouseDown={(e) => {
                e.preventDefault();
                add(o.key);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span>{o.isNew ? `Создать «${o.label}»` : o.label}</span>
              <small>{o.hint}</small>
            </li>
          ))}
        </ul>
      )}

      <p className={styles.help} aria-live="polite">
        {notice || `Выбрано: ${value.length} из ${max}. Enter или запятая добавляют тег.`}
      </p>
    </div>
  );
}