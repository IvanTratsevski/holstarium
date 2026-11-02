import type { Role } from "@/lib/socialStore";

export type NavLink = { href: string; label: string; match: (path: string) => boolean };

export const currentPath = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

export const MAIN_LINKS: NavLink[] = [
  { href: "/", label: "Карта", match: (p) => p === "/" || p.startsWith("/district") },
  { href: "/artists", label: "Художники", match: (p) => p.startsWith("/artists") || p.startsWith("/stall") },
  { href: "/feed", label: "Работы", match: (p) => p.startsWith("/feed") },
];

export const SAVED_LINK: NavLink = {
  href: "/saved",
  label: "Избранное",
  match: (p) => p.startsWith("/saved"),
};

export const PROFILE_LINK: NavLink = {
  href: "/profile",
  label: "Профиль",
  match: (p) => p.startsWith("/profile") || p.startsWith("/following"),
};

export const ROLE_LABELS: Record<Role, string> = {
  guest: "Гость",
  visitor: "Посетитель",
  owner: "Владелец",
  admin: "Админ",
};

export function profileLinks(role: Role): { href: string; label: string }[] {
  if (role === "guest") return [];
  const links = [
    { href: "/saved", label: "Избранное" },
    { href: "/following", label: "Мои подписки" },
  ];
  // в прототипе «своя лавка» это лавка Анны, в боевой версии ссылка строится по аккаунту
  if (role === "owner") links.unshift({ href: "/stall/anna", label: "Моя лавка" });
  if (role === "admin") links.unshift({ href: "/admin", label: "Админ-панель" });
  return links;
}