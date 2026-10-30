// Добавляет префикс к путям файлов из public/ (для GitHub Pages)
export const withBase = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;