import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { getSiteConfig } from "@/lib/settings";
import { logActivity } from "@/lib/activity";

/** GET /api/config — public site config */
export async function GET() {
  try {
    const config = await getSiteConfig();
    return ok(config);
  } catch (err) {
    return serverError("Failed to load config", err);
  }
}

/** PUT /api/config — admin update */
export async function PUT(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    const current = await db.siteConfig.findUnique({ where: { id: "default" } });
    if (!current) return fail("Config not found", 404);

    const updated = await db.siteConfig.update({
      where: { id: "default" },
      data: {
        ...(body.siteName !== undefined && { siteName: body.siteName }),
        ...(body.siteTagline !== undefined && { siteTagline: body.siteTagline }),
        ...(body.siteDescription !== undefined && {
          siteDescription: body.siteDescription,
        }),
        ...(body.heroTitle !== undefined && { heroTitle: body.heroTitle }),
        ...(body.heroSubtitle !== undefined && {
          heroSubtitle: body.heroSubtitle,
        }),
        ...(body.heroVideoUrl !== undefined && {
          heroVideoUrl: body.heroVideoUrl || null,
        }),
        ...(body.heroPosterImage !== undefined && {
          heroPosterImage: body.heroPosterImage || null,
        }),
        ...(body.showreelUrl !== undefined && {
          showreelUrl: body.showreelUrl || null,
        }),
        ...(body.aboutBio !== undefined && { aboutBio: body.aboutBio }),
        ...(body.aboutImage !== undefined && {
          aboutImage: body.aboutImage || null,
        }),
        ...(body.aboutStats !== undefined && {
          aboutStats: JSON.stringify(body.aboutStats || []),
        }),
        ...(body.aboutSkills !== undefined && {
          aboutSkills: JSON.stringify(body.aboutSkills || []),
        }),
        ...(body.contactEmail !== undefined && { contactEmail: body.contactEmail }),
        ...(body.contactPhone !== undefined && {
          contactPhone: body.contactPhone || null,
        }),
        ...(body.contactLocation !== undefined && {
          contactLocation: body.contactLocation || null,
        }),
        ...(body.socialInstagram !== undefined && {
          socialInstagram: body.socialInstagram || null,
        }),
        ...(body.socialYoutube !== undefined && {
          socialYoutube: body.socialYoutube || null,
        }),
        ...(body.socialVimeo !== undefined && {
          socialVimeo: body.socialVimeo || null,
        }),
        ...(body.socialLinkedin !== undefined && {
          socialLinkedin: body.socialLinkedin || null,
        }),
        ...(body.socialBehance !== undefined && {
          socialBehance: body.socialBehance || null,
        }),
        ...(body.accentColor !== undefined && { accentColor: body.accentColor }),
        ...(body.footerNote !== undefined && { footerNote: body.footerNote }),
        ...(body.featureFlags !== undefined && {
          featureFlags: JSON.stringify(body.featureFlags),
        }),
        ...(body.bannerEnabled !== undefined && { bannerEnabled: !!body.bannerEnabled }),
        ...(body.bannerProjectId !== undefined && {
          bannerProjectId: body.bannerProjectId || null,
        }),
        ...(body.bannerEyebrow !== undefined && {
          bannerEyebrow: body.bannerEyebrow || "Featured Story",
        }),
        ...(body.bannerHeadline !== undefined && {
          bannerHeadline: body.bannerHeadline || null,
        }),
        ...(body.bannerCtaLabel !== undefined && {
          bannerCtaLabel: body.bannerCtaLabel || "View the case study",
        }),
        ...(body.notifyInquiriesEnabled !== undefined && {
          notifyInquiriesEnabled: !!body.notifyInquiriesEnabled,
        }),
        ...(body.notifyFromEmail !== undefined && {
          notifyFromEmail: body.notifyFromEmail || null,
        }),
        ...(body.notifyToEmail !== undefined && {
          notifyToEmail: body.notifyToEmail || null,
        }),
        ...(body.smtpHost !== undefined && {
          smtpHost: body.smtpHost || null,
        }),
        ...(body.smtpPort !== undefined && {
          smtpPort: body.smtpPort || null,
        }),
        ...(body.smtpUser !== undefined && {
          smtpUser: body.smtpUser || null,
        }),
        ...(body.smtpPassword !== undefined && {
          smtpPassword: body.smtpPassword || null,
        }),
        ...(body.aiEnabled !== undefined && { aiEnabled: !!body.aiEnabled }),
        ...(body.aiApiKey !== undefined && {
          aiApiKey: body.aiApiKey || null,
        }),
        ...(body.aiModel !== undefined && {
          aiModel: body.aiModel || "gemini-2.5-flash",
        }),
        ...(body.aiSystemPrompt !== undefined && {
          aiSystemPrompt: body.aiSystemPrompt || null,
        }),
      },
    });
    await logActivity({
      action: "config",
      entity: "config",
      label: null,
      entityId: null,
      summary: `Updated site configuration`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update config", err);
  }
}
