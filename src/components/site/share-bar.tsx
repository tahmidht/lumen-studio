"use client";
import { useState } from "react";
import { Link2, Check, Twitter, Facebook, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Share row: copy-link + social share buttons.
 * Uses the current page URL + the provided title.
 */
export function ShareBar({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  const enc = (s: string) => encodeURIComponent(s);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareLinks = [
    {
      label: "Share on Twitter",
      Icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
    },
    {
      label: "Share on Facebook",
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      label: "Share on LinkedIn",
      Icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="mr-1 text-xs uppercase tracking-wider text-muted-foreground">
        Share
      </span>
      <button
        onClick={copyLink}
        className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 text-xs font-medium text-muted-foreground transition-all hover:border-brand hover:text-brand"
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-brand" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
      {shareLinks.map(({ label, Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/40 text-muted-foreground transition-all hover:border-brand hover:text-brand"
        >
          <Icon className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
}
