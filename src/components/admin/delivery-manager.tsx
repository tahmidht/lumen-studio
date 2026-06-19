"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Link as LinkIcon,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Delivery = {
  id: string;
  type: string;
  label: string;
  url: string | null;
  status: string;
  clientEmail: string | null;
  sentAt: string | null;
  aiEmailDraft: string | null;
  notes: string | null;
  order: number;
};

type DeliveryToken = {
  id: string;
  token: string;
  passphrase: string | null;
  expiresAt: string | null;
  lastViewedAt: string | null;
  viewCount: number;
  revoked: boolean;
};

const DELIVERY_TYPES = [
  { value: "MAIN_FILM", label: "Main Film" },
  { value: "SOCIAL_CUT", label: "Social Cut" },
  { value: "RAW_FOOTAGE", label: "Raw Footage" },
  { value: "COLOR_MASTER", label: "Color Master" },
  { value: "TRAILER", label: "Trailer" },
  { value: "CUSTOM", label: "Custom" },
];

const DELIVERY_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "READY", label: "Ready" },
  { value: "SENT", label: "Sent" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "REVISED", label: "Revised" },
];

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  READY: "bg-amber-500/15 text-amber-500",
  SENT: "bg-brand/15 text-brand",
  DELIVERED: "bg-emerald-500/15 text-emerald-500",
  REVISED: "bg-violet-500/15 text-violet-400",
};

/**
 * Admin delivery manager — per-project deliverable tracking + token generation
 * + AI delivery email drafting.
 */
export function DeliveryManager({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [tokens, setTokens] = useState<DeliveryToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [emailModal, setEmailModal] = useState<{ delivery: Delivery; email: string } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // New deliverable form state
  const [newType, setNewType] = useState("MAIN_FILM");
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, tRes] = await Promise.all([
        fetch(`/api/deliveries?projectId=${projectId}`),
        fetch(`/api/delivery-tokens?projectId=${projectId}`),
      ]);
      const dJson = await dRes.json();
      const tJson = await tRes.json();
      if (dJson.ok) setDeliveries(dJson.data);
      if (tJson.ok) setTokens(tJson.data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function createDelivery() {
    if (!newLabel.trim()) {
      toast.error("Label is required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          type: newType,
          label: newLabel,
          url: newUrl,
          clientEmail: newEmail,
          status: "PENDING",
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      toast.success("Deliverable added");
      setNewLabel("");
      setNewUrl("");
      setNewEmail("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setCreating(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/deliveries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      toast.success(`Marked as ${status}`);
      await load();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function deleteDelivery(id: string) {
    if (!confirm("Delete this deliverable?")) return;
    try {
      const res = await fetch(`/api/deliveries/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      toast.success("Deleted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function createToken() {
    try {
      const res = await fetch("/api/delivery-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      toast.success("Delivery link created");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function toggleToken(id: string, revoked: boolean) {
    try {
      const res = await fetch(`/api/delivery-tokens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revoked }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      toast.success(revoked ? "Link revoked" : "Link re-enabled");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function deleteToken(id: string) {
    if (!confirm("Delete this delivery link? Clients using it will lose access.")) return;
    try {
      const res = await fetch(`/api/delivery-tokens/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      toast.success("Link deleted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function draftEmail(delivery: Delivery) {
    setEmailLoading(true);
    setEmailModal({ delivery, email: delivery.aiEmailDraft || "" });
    try {
      const res = await fetch(`/api/deliveries/${delivery.id}/draft-email`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      setEmailModal({ delivery, email: json.data.email });
      toast.success("Email draft generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setEmailLoading(false);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard");
  }

  const deliveryUrl = (token: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/deliver/${token}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Deliverables */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Deliverables</h3>
            <p className="text-xs text-muted-foreground">
              Track what's been delivered to this client.
            </p>
          </div>
        </div>

        {/* Existing deliveries */}
        {deliveries.length > 0 && (
          <div className="mb-4 space-y-2">
            {deliveries.map((d) => (
              <Card key={d.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{d.label}</p>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", STATUS_STYLE[d.status] || STATUS_STYLE.PENDING)}>
                      {d.status}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {d.type.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </div>
                  {d.url && (
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline">
                      <ExternalLink className="h-3 w-3" />
                      {d.url.length > 50 ? d.url.slice(0, 50) + "…" : d.url}
                    </a>
                  )}
                  {d.sentAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sent {new Date(d.sentAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Status dropdown */}
                <Select value={d.status} onValueChange={(v) => updateStatus(d.id, v)}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="text-xs">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* AI email */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => draftEmail(d)}
                  className="h-8 border-brand/40 text-brand hover:bg-brand/5"
                >
                  <Sparkles className="h-3 w-3" />
                  Email
                </Button>

                <button
                  onClick={() => deleteDelivery(d.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </Card>
            ))}
          </div>
        )}

        {/* New deliverable form */}
        <Card className="p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Add deliverable
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-sm">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Label</Label>
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Cinematic Main Film (4K)"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">URL (Google Drive, Vimeo, etc.)</Label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://drive.google.com/…"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Client email (optional)</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="client@email.com"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <Button
            onClick={createDelivery}
            disabled={creating || !newLabel.trim()}
            className="mt-3 h-9 bg-brand text-black hover:bg-brand/90"
            size="sm"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </Button>
        </Card>
      </div>

      {/* Delivery links (tokens) */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Client delivery links</h3>
            <p className="text-xs text-muted-foreground">
              Shareable pages where clients download their films. No account needed — just the link.
            </p>
          </div>
          <Button onClick={createToken} size="sm" className="bg-brand text-black hover:bg-brand/90">
            <Plus className="h-4 w-4" />
            New link
          </Button>
        </div>

        {tokens.length === 0 ? (
          <Card className="border-dashed py-8 text-center">
            <LinkIcon className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No delivery links yet. Create one to share a download page with your client.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {tokens.map((t) => (
              <Card key={t.id} className={cn("p-4", t.revoked && "opacity-60")}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="truncate font-mono text-xs text-brand">
                        {deliveryUrl(t.token)}
                      </code>
                      {t.revoked && (
                        <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-400">
                          Revoked
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{t.viewCount} view{t.viewCount === 1 ? "" : "s"}</span>
                      {t.lastViewedAt && (
                        <span>
                          Last viewed {new Date(t.lastViewedAt).toLocaleDateString()}
                        </span>
                      )}
                      {t.expiresAt && (
                        <span>
                          Expires {new Date(t.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(deliveryUrl(t.token), t.id)}
                    className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-brand"
                    title="Copy link"
                  >
                    {copied === t.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <a
                    href={deliveryUrl(t.token)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-brand"
                    title="Open"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleToken(t.id, !t.revoked)}
                    className="h-7 text-xs"
                  >
                    {t.revoked ? "Enable" : "Revoke"}
                  </Button>
                  <button
                    onClick={() => deleteToken(t.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* AI email draft modal */}
      <AnimatePresence>
        {emailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => !emailLoading && setEmailModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold">Delivery email draft</h3>
                    <p className="text-xs text-muted-foreground">For: {emailModal.delivery.label}</p>
                  </div>
                </div>
                <button
                  onClick={() => !emailLoading && setEmailModal(null)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-5">
                {emailLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-brand" />
                    <span className="ml-2 text-sm text-muted-foreground">Generating email…</span>
                  </div>
                ) : (
                  <>
                    <Textarea
                      value={emailModal.email}
                      onChange={(e) =>
                        setEmailModal((m) => (m ? { ...m, email: e.target.value } : m))
                      }
                      rows={14}
                      className="font-mono text-xs"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Review + edit the draft. When ready, copy it into your mail client.
                    </p>
                  </>
                )}
              </div>

              {!emailLoading && (
                <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEmailModal(null)}
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const delivery = emailModal.delivery;
                      const subject = encodeURIComponent(`Your films are ready — ${delivery.label}`);
                      const body = encodeURIComponent(emailModal.email);
                      const to = delivery.clientEmail || "";
                      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
                    }}
                    className="border-brand/40 text-brand"
                  >
                    <Mail className="h-4 w-4" />
                    Open in Mail
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(emailModal.email, "email")}
                    className="bg-brand text-black hover:bg-brand/90"
                  >
                    {copied === "email" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy email
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
