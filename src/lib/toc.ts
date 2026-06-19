export type TocHeading = {
  id: string;
  text: string;
  level: number; // 2 for ##, 3 for ###
};

/**
 * Extract H2/H3 headings from a markdown string.
 * Returns an array of { id, text, level } where id is a URL-safe slug.
 */
export function extractToc(markdown: string): TocHeading[] {
  const lines = markdown.split("\n");
  const headings: TocHeading[] = [];
  for (const line of lines) {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/[*_`~]/g, "").trim();
    if (!text) continue;
    headings.push({ id: slugify(text), text, level });
  }
  return headings;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
