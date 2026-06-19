"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Eye, EyeOff, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SetupWizardForm({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const { update } = useSession();
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword) {
      toast.error("Fill in both passwords.");
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      toast.error("New password must be different from the current one.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");

      // Update session to regenerate cookie client-side
      await update();

      toast.success("Password updated — welcome to your studio.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }


  const strength = passwordStrength(form.newPassword);

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-lg border border-brand/20 bg-brand/5 p-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" />
          Signed in as <span className="font-medium text-foreground">{defaultEmail}</span>
        </p>
      </div>

      <PasswordField
        label="Current password"
        value={form.currentPassword}
        onChange={(v) => setForm({ ...form, currentPassword: v })}
        show={show}
        onToggle={() => setShow((s) => !s)}
        placeholder="The default password"
      />
      <PasswordField
        label="New password"
        value={form.newPassword}
        onChange={(v) => setForm({ ...form, newPassword: v })}
        show={show}
        onToggle={() => setShow((s) => !s)}
        placeholder="At least 8 characters"
      />
      {form.newPassword && (
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < strength.score
                  ? strength.score <= 1
                    ? "bg-red-500"
                    : strength.score <= 2
                    ? "bg-amber-500"
                    : "bg-brand"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      )}
      <PasswordField
        label="Confirm new password"
        value={form.confirmPassword}
        onChange={(v) => setForm({ ...form, confirmPassword: v })}
        show={show}
        onToggle={() => setShow((s) => !s)}
        placeholder="Re-enter new password"
      />
      {form.confirmPassword && form.confirmPassword !== form.newPassword && (
        <p className="text-xs text-destructive">Passwords do not match</p>
      )}

      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-brand text-black hover:bg-brand/90"
      >
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Set Password & Continue
      </Button>
    </form>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function passwordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return { score, label: ["Too weak", "Weak", "Fair", "Good", "Strong"][score] };
}
