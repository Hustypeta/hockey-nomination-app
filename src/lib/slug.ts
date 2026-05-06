export function slugify(input: string): string {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const b = slugify(base) || "zapas";
  return (async () => {
    if (!(await exists(b))) return b;
    for (let i = 2; i < 2000; i++) {
      const s = `${b}-${i}`;
      if (!(await exists(s))) return s;
    }
    return `${b}-${Date.now()}`;
  })();
}

