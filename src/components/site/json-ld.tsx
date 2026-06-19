/**
 * Injects a JSON-LD structured-data <script> into the page head/server output.
 * Used for SEO rich results (CreativeWork for projects, BlogPosting for posts).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify is safe here — the object is built from trusted DB data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
