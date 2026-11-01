"use client";

import { useId, useState } from "react";
import type { SaleInfo } from "@/types";
import { CURRENCIES, SALE_NOTE_MAX, draftToSale, saleToDraft } from "@/lib/sale";
import type { SaleDraft } from "@/lib/sale";
import styles from "./ArtworkManager.module.css";

type Props = {
  value?: SaleInfo;
  onChange: (sale?: SaleInfo) => void; // вызывается только с корректным значением
  onValidity?: (valid: boolean) => void; // сообщает, корректен ли сейчас ввод
};

export default function SaleFields({ value, onChange, onValidity }: Props) {
  const uid = useId();
  const [draft, setDraft] = useState<SaleDraft>(() => saleToDraft(value));
  const result = draftToSale(draft);

  const change = (patch: Partial<SaleDraft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    const r = draftToSale(next);
    onValidity?.(r.ok);
    if (r.ok) onChange(r.sale); // пока ввод неверный, в лавке остаётся прежнее значение
  };

  const kinds: { kind: SaleDraft["kind"]; label: string }[] = [
    { kind: "none", label: "Не продаётся" },
    { kind: "price", label: "Указать цену" },
    { kind: "negotiable", label: "Цена договорная" },
  ];

  return (
    <fieldset className={styles.field}>
      <legend>Продажа</legend>

      {kinds.map((k) => (
        <label key={k.kind} className={styles.saleRadio}>
          <input
            type="radio"
            name={`${uid}-kind`}
            checked={draft.kind === k.kind}
            onChange={() => change({ kind: k.kind })}
          />
          {k.label}
        </label>
      ))}

      {draft.kind === "price" && (
        <div className={styles.priceRow}>
          <input
            type="text"
            inputMode="decimal"
            aria-label="Цена"
            aria-invalid={!result.ok}
            placeholder="25"
            value={draft.amount}
            onChange={(e) => change({ amount: e.target.value })}
          />
          <select
            aria-label="Валюта"
            value={draft.currency}
            onChange={(e) => change({ currency: e.target.value })}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </div>
      )}

      {draft.kind !== "none" && (
        <input
          type="text"
          aria-label="Пояснение к цене"
          maxLength={SALE_NOTE_MAX}
          placeholder="Пояснение: печатная копия А4, оригинал, цифровой файл…"
          value={draft.note}
          onChange={(e) => change({ note: e.target.value })}
        />
      )}

      {!result.ok && (
        <small className={styles.saleError} role="alert">
          {result.error} Пока цена неверна, в лавке остаётся прежнее значение.
        </small>
      )}

      <small>
        Сайт не принимает оплату: покупатель присылает вам запрос, а условия сделки вы
        обсуждаете сами.
      </small>
    </fieldset>
  );
}