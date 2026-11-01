import type { SaleInfo } from "@/types";

export const CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Евро" },
  { code: "USD", symbol: "$", name: "Доллар США" },
  { code: "RUB", symbol: "₽", name: "Российский рубль" },
  { code: "UAH", symbol: "₴", name: "Гривна" },
  { code: "KZT", symbol: "₸", name: "Тенге" },
  { code: "BYN", symbol: "Br", name: "Белорусский рубль" },
];

export const DEFAULT_CURRENCY = "EUR";
export const SALE_NOTE_MAX = 80;

export type SaleDraft = {
  kind: "none" | "price" | "negotiable";
  amount: string;
  currency: string;
  note: string;
};

export const saleToDraft = (sale?: SaleInfo): SaleDraft => {
  if (!sale) return { kind: "none", amount: "", currency: DEFAULT_CURRENCY, note: "" };
  if (sale.kind === "negotiable") {
    return { kind: "negotiable", amount: "", currency: DEFAULT_CURRENCY, note: sale.note ?? "" };
  }
  return {
    kind: "price",
    amount: String(sale.amount),
    currency: sale.currency,
    note: sale.note ?? "",
  };
};

export function draftToSale(
  d: SaleDraft
): { ok: true; sale?: SaleInfo } | { ok: false; error: string } {
  const note = d.note.trim().slice(0, SALE_NOTE_MAX) || undefined;

  if (d.kind === "none") return { ok: true, sale: undefined };
  if (d.kind === "negotiable") return { ok: true, sale: { kind: "negotiable", note } };

  const text = d.amount.trim().replace(",", ".");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) {
    return { ok: false, error: "Укажите цену числом, например 25 или 25.50." };
  }
  const amount = Number(text);
  if (!(amount > 0)) return { ok: false, error: "Цена должна быть больше нуля." };
  if (!CURRENCIES.some((c) => c.code === d.currency)) {
    return { ok: false, error: "Выберите валюту." };
  }
  return { ok: true, sale: { kind: "price", amount, currency: d.currency, note } };
}

// без Intl, чтобы запись на сервере и в браузере совпадала буква в букву
function formatAmount(n: number) {
  const [int, frac] = n.toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
  return frac === "00" ? grouped : `${grouped},${frac}`;
}

export function formatPrice(sale: SaleInfo): string {
  if (sale.kind === "negotiable") return "Цена договорная";
  const symbol = CURRENCIES.find((c) => c.code === sale.currency)?.symbol ?? sale.currency;
  return `${formatAmount(sale.amount)} ${symbol}`;
}