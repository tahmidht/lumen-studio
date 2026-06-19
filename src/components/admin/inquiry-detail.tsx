"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Phone, Calendar, DollarSign, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INQUIRY_STATUS, statusLabel } from "@/lib/constants";
import { DeleteButton } from "@/components/admin/delete-button";
import { AIAssistButton } from "@/components/admin/ai-assist-button";

export function InquiryDetail({
  inquiry,
}: {
  inquiry: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    projectType: string | null;
    budget: string | null;
    eventDate: string | null;
    message: string;
    status: string;
    starred: boolean;
    createdAt: Date;
  };
}) {
  const router = useRouter();
  const [status, setStatus] = useState(inquiry.status);
  const [reply, setReply] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  async function saveStatus(s: string) {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      setStatus(s);
      toast.success("Status updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Message</h2>
            <span className="text-xs text-muted-foreground">
              {new Date(inquiry.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {inquiry.message}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Reply</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Draft your reply, then open your mail client to send.
          </p>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={6}
            placeholder="Hi [name], thanks for reaching out…"
            className="mt-3"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <AIAssistButton
              endpoint="/api/ai/inquiry-reply"
              payload={{
                inquiryName: inquiry.name,
                inquiryEmail: inquiry.email,
                projectType: inquiry.projectType,
                budget: inquiry.budget,
                eventDate: inquiry.eventDate,
                message: inquiry.message,
                siteName: "LUMEN",
              }}
              onResult={(data) => setReply(data.text)}
              label="Draft reply"
              size="sm"
            />
            <a
              href={`mailto:${inquiry.email}?subject=Re: Your project inquiry&body=${encodeURIComponent(reply)}`}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
            >
              <Mail className="h-4 w-4" /> Open in Mail
            </a>
            <Button
              variant="outline"
              onClick={async () => {
                await saveStatus("REPLIED");
              }}
            >
              Mark as Replied
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Contact
          </h3>
          <div className="space-y-3 text-sm">
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={inquiry.email} />
            {inquiry.phone && (
              <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={inquiry.phone} />
            )}
            {inquiry.projectType && (
              <Row icon={<Tag className="h-4 w-4" />} label="Project" value={inquiry.projectType} />
            )}
            {inquiry.budget && (
              <Row icon={<DollarSign className="h-4 w-4" />} label="Budget" value={inquiry.budget} />
            )}
            {inquiry.eventDate && (
              <Row icon={<Calendar className="h-4 w-4" />} label="Date" value={inquiry.eventDate} />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </h3>
          <Select value={status} onValueChange={saveStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INQUIRY_STATUS.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {savingStatus && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <DeleteButton endpoint={`/api/inquiries/${inquiry.id}`} redirectTo="/admin/inquiries" label="Delete inquiry" />
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-brand">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm">{value}</p>
      </div>
    </div>
  );
}
