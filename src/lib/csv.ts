/**
 * Client-side CSV export helper.
 * Builds a CSV string from an array of row objects, triggers a download
 * via a Blob URL. Column order follows the keys of the first row.
 */

/** Escape a value for CSV (wrap in quotes if it contains commas/quotes/newlines). */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Convert an array of objects to a CSV string. */
export function toCSV(rows: Record<string, unknown>[], columns?: string[]): string {
  if (rows.length === 0) return "";
  const cols = columns ?? Object.keys(rows[0]);
  const header = cols.map(csvCell).join(",");
  const body = rows
    .map((r) => cols.map((c) => csvCell(r[c])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

/** Trigger a browser download of the given CSV string. */
export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Convenience: build + download in one call. */
export function exportCSV(
  filename: string,
  rows: Record<string, unknown>[],
  columns?: string[]
): void {
  downloadCSV(filename, toCSV(rows, columns));
}
