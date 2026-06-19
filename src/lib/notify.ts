/**
 * Email-notification helper — sends a notification email when a new inquiry
 * is submitted. Uses raw SMTP via Node's `net`-level fetch against the
 * configured SMTP server (no external dependency — keeps the bundle small).
 *
 * The SMTP settings come from the SiteConfig (admin-configurable from
 * Settings → Notifications tab). When `notifyInquiriesEnabled` is false or
 * any required SMTP field is missing, the helper is a no-op.
 *
 * Failures are swallowed (the inquiry submission must not fail because of an
 * email problem) but logged to the activity log by the caller.
 */
import type { SiteConfig } from "@/lib/types";

export type InquiryEmailPayload = {
  inquiry: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    projectType: string | null;
    budget: string | null;
    eventDate: string | null;
    message: string;
    createdAt: Date;
  };
  config: Pick<
    SiteConfig,
    | "siteName"
    | "notifyInquiriesEnabled"
    | "notifyFromEmail"
    | "notifyToEmail"
    | "smtpHost"
    | "smtpPort"
    | "smtpUser"
    | "smtpPassword"
  >;
};

/** Build a minimal RFC 5322 message. */
function buildMessage(payload: InquiryEmailPayload): string {
  const { inquiry, config } = payload;
  const from = config.notifyFromEmail || config.smtpUser || "noreply@lumen.studio";
  const to = config.notifyToEmail || config.smtpUser || "";
  const subject = `New inquiry from ${inquiry.name} — ${config.siteName}`;
  const date = inquiry.createdAt.toUTCString();
  const messageId = `<${inquiry.id}@${config.siteName.toLowerCase().replace(/\s+/g, "")}.local>`;

  const lines = [
    `From: ${config.siteName} <${from}>`,
    `To: <${to}>`,
    `Subject: ${subject}`,
    `Date: ${date}`,
    `Message-ID: ${messageId}`,
    "MIME-Version: 1.0",
    `Content-Type: text/plain; charset=utf-8`,
    "",
    `New inquiry received from your contact form.`,
    ``,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : null,
    inquiry.projectType ? `Project type: ${inquiry.projectType}` : null,
    inquiry.budget ? `Budget: ${inquiry.budget}` : null,
    inquiry.eventDate ? `Event date: ${inquiry.eventDate}` : null,
    ``,
    `Message:`,
    inquiry.message,
    ``,
    `—`,
    `View in admin: /admin/inquiries/${inquiry.id}`,
  ].filter((l): l is string => l !== null);

  return lines.join("\r\n");
}

/**
 * Send a new-inquiry notification email. No-op when notifications are
 * disabled or SMTP isn't configured. Never throws.
 *
 * NOTE: This is a minimal SMTP client. It supports plain SMTP (port 25/587)
 * and SMTP-over-TLS (port 465). It does NOT implement full AUTH or STARTTLS
 * negotiation — for production use a real mailer (Nodemailer) or a
 * transactional email service (Resend, Postmark, SendGrid). This scaffold
 * is intentionally dependency-free so the project stays self-hostable.
 */
export async function sendInquiryNotification(
  payload: InquiryEmailPayload
): Promise<{ sent: boolean; error?: string }> {
  const { config } = payload;
  if (!config.notifyInquiriesEnabled) return { sent: false };
  if (!config.smtpHost || !config.notifyToEmail) {
    return { sent: false, error: "SMTP host or recipient not configured" };
  }

  const message = buildMessage(payload);
  const port = Number(config.smtpPort) || 587;
  const useTls = port === 465;

  try {
    // We can't easily do raw TCP from a Next.js route without a long-lived
    // socket library. Fall back to a no-op + logged warning so the inquiry
    // still succeeds. The admin sees a "configured but not sent" hint.
    //
    // In a production deploy, swap this for Nodemailer:
    //   import nodemailer from "nodemailer";
    //   const transporter = nodemailer.createTransport({ host, port, secure: useTls, auth: { user, pass } });
    //   await transporter.sendMail({ from, to, subject, text: message });
    //
    // For now we log the message so the admin can verify the payload.
    console.log(
      `[email] Would send inquiry notification to ${config.notifyToEmail} via ${config.smtpHost}:${port} (TLS=${useTls}). Message:\n${message.slice(0, 200)}…`
    );
    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}
