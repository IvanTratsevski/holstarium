export function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const baseLikes = (ref: string) => hash(ref) % 37;
export const baseFollowers = (slug: string) => 8 + (hash(slug) % 140);