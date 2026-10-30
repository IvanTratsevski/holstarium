// Добавляет префикс к путям файлов из public/ (для GitHub Pages).
// Полные адреса (https:, blob:, data:) остаются как есть.
export const withBase = (path: string) =>
  /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path)
    ? path
    : `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;