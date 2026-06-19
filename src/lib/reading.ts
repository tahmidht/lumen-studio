/**
 * Estimate reading time for a markdown string.
 * Strips markdown syntax, counts words, divides by 200 wpm (average adult).
 * Returns minutes (minimum 1).
 */
export function readingTime(markdown: string): number {
  // strip markdown: headings, emphasis, links, images, code blocks, lists
  const text = markdown
    .replace(/^#+\s+/gm, "") // headings
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[[^\]]*\]\([^)]*\)/g, "$1") // links → text
    .replace(/[*_`~]/g, "") // emphasis / code
    .replace(/^\s*[-*+]\s+/gm, "") // list bullets
    .replace(/^\s*\d+\.\s+/gm, "") // numbered lists
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]*`/g, "") // inline code
    .replace(/>\s+/gm, "") // blockquotes
    .replace(/\n+/g, " ")
    .trim();

  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
}

/** Format reading time as "X min read". */
export function readingTimeLabel(markdown: string): string {
  return `${readingTime(markdown)} min read`;
}
