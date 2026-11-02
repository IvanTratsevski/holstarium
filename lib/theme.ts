export type ThemePref = "system" | "light" | "dark";
export const THEME_KEY = "holstarium:theme";

const listeners = new Set<() => void>();
let pref: ThemePref = "system";
let loaded = false;

function readPref(): ThemePref {
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function resolve(p: ThemePref): "light" | "dark" {
  if (p === "light" || p === "dark") return p;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply() {
  document.documentElement.dataset.theme = resolve(pref);
}

function emit() {
  listeners.forEach((l) => l());
}

function init() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  pref = readPref();
  apply();

  // в режиме «Авто» следуем за системой, пока страница открыта
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (pref === "system") apply();
    });

  // выбор, сделанный в другой вкладке
  window.addEventListener("storage", (e) => {
    if (e.key !== THEME_KEY) return;
    pref = readPref();
    apply();
    emit();
  });
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): ThemePref {
  init();
  return pref;
}

export function getServerSnapshot(): ThemePref {
  return "system";
}

export function setPref(next: ThemePref) {
  init();
  pref = next;
  try {
    if (next === "system") window.localStorage.removeItem(THEME_KEY);
    else window.localStorage.setItem(THEME_KEY, next);
  } catch {
    // хранилище недоступно: тема действует до обновления страницы
  }
  apply();
  emit();
}