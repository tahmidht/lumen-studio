"use client";
/**
 * Lightweight video embedder. Supports YouTube, Vimeo, and direct mp4/webm.
 */
export function VideoEmbed({ url }: { url: string }) {
  const embed = getEmbedUrl(url);
  const isDirect = /\.(mp4|webm)$/i.test(url);

  if (isDirect) {
    return (
      <video
        src={url}
        controls
        playsInline
        className="aspect-video w-full bg-black"
      />
    );
  }

  if (embed) {
    return (
      <div className="relative aspect-video w-full">
        <iframe
          src={embed}
          title="Video player"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // fallback: link
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex aspect-video w-full items-center justify-center bg-card text-brand"
    >
      Open video →
    </a>
  );
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}
