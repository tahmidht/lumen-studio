"use client";
import { useState } from "react";
import { Save, Loader2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export function ChangePasswordForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword) {
      toast.error("Fill in current and new passwords.");
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match.");
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
      if (!json.ok) throw new Error(json.error || "Failed to change password");
      toast.success("Password updated successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const strength = passwordStrength(form.newPassword);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold">Change password</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Use a strong, unique password. You'll stay signed in on this device.
          </p>
          <form onSubmit={save} className="mt-6 space-y-5">
            <Field label="Current password">
              <PasswordInput
                value={form.currentPassword}
                onChange={(v) => setForm({ ...form, currentPassword: v })}
                show={show}
                onToggle={() => setShow((s) => !s)}
                placeholder="Enter current password"
              />
            </Field>
            <Field label="New password">
              <PasswordInput
                value={form.newPassword}
                onChange={(v) => setForm({ ...form, newPassword: v })}
                show={show}
                onToggle={() => setShow((s) => !s)}
                placeholder="At least 8 characters"
              />
              {form.newPassword && (
                <div className="mt-2 space-y-1.5">
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
                  <p className="text-xs text-muted-foreground">
                    {strength.label}
                  </p>
                </div>
              )}
            </Field>
            <Field label="Confirm new password">
              <PasswordInput
                value={form.confirmPassword}
                onChange={(v) => setForm({ ...form, confirmPassword: v })}
                show={show}
                onToggle={() => setShow((s) => !s)}
                placeholder="Re-enter new password"
              />
              {form.confirmPassword &&
                form.confirmPassword !== form.newPassword && (
                  <p className="mt-1.5 text-xs text-destructive">
                    Passwords do not match
                  </p>
                )}
            </Field>
            <Button
              type="submit"
              disabled={saving}
              className="bg-brand text-black hover:bg-brand/90"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Update Password
            </Button>
          </form>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="border-brand/20 bg-brand/5 p-5">
          <ShieldCheck className="h-6 w-6 text-brand" />
          <h4 className="mt-3 font-display text-sm font-semibold">
            Security tips
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <li>• Use 12+ characters with mixed case, numbers, symbols</li>
            <li>• Never reuse passwords across services</li>
            <li>• Consider a password manager</li>
            <li>• Change immediately if you suspect a breach</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}) {
  return (
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
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function passwordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}
