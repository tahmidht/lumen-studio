import { db } from "@/lib/db";
import type { SiteConfig } from "@/lib/types";
import { parseFeatureFlags } from "@/lib/feature-flags";

export type StatsItem = { label: string; value: string };

/** Default site configuration used when no row exists yet. */
export const DEFAULT_CONFIG: SiteConfig = {
  id: "default",
  siteName: "LUMEN",
  siteTagline: "Cinematography & Visual Storytelling",
  siteDescription:
    "Award-winning cinematographer crafting cinematic stories for brands, couples, and creators worldwide.",
  heroTitle: "We Paint With Light & Motion",
  heroSubtitle:
    "Cinematography · Aerial · Color — crafted frame by frame for stories worth telling.",
  heroVideoUrl: "",
  heroPosterImage: "",
  showreelUrl: "",
  aboutBio:
    "I'm a cinematographer and visual storyteller with a decade behind the lens. From intimate weddings to high-end commercial campaigns, I bring a director's eye and a colorist's patience to every frame. My kit lives on gimbal, drone, and tripod — ready to chase the light wherever the story leads.",
  aboutImage: "",
  aboutStats: [
    { label: "Years Behind the Lens", value: "10+" },
    { label: "Projects Delivered", value: "320+" },
    { label: "Awards & Features", value: "14" },
    { label: "Countries Filmed", value: "23" },
  ],
  aboutSkills: [
    "Cinematography",
    "Aerial / Drone",
    "Gimbal Operation",
    "Color Grading",
    "Lighting Design",
    "Directing",
  ],
  contactEmail: "hello@lumen.studio",
  contactPhone: "+1 (415) 555-0142",
  contactLocation: "San Francisco · Available Worldwide",
  contactLat: "",
  contactLng: "",
  socialInstagram: "https://instagram.com",
  socialYoutube: "https://youtube.com",
  socialVimeo: "https://vimeo.com",
  socialLinkedin: "https://linkedin.com",
  socialBehance: "",
  accentColor: "#E8B547",
  footerNote: "Crafted with light, motion, and obsessive attention to detail.",
  featureFlags: {
    cursorMode: "magnetic",
    cinematicLoader: true,
    magneticButtons: true,
    imageReveal: true,
    scrollProgress: true,
    backToTop: true,
    pageTransitions: true,
    heroParallax: true,
    testimonialAutoplay: true,
    faceMatchEnabled: false,
  },
  bannerEnabled: false,
  bannerProjectId: null,
  bannerEyebrow: "Featured Story",
  bannerHeadline: null,
  bannerCtaLabel: "View the case study",
  notifyInquiriesEnabled: false,
  notifyFromEmail: "",
  notifyToEmail: "",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPassword: "",
  aiEnabled: false,
  aiApiKey: "",
  aiModel: "gemini-2.5-flash",
  aiSystemPrompt: "",
};

/** Loads the single site-config row, creating it from defaults if missing. */
export async function getSiteConfig(): Promise<SiteConfig> {
  let row = await db.siteConfig.findUnique({ where: { id: "default" } });
  if (!row) {
    row = await db.siteConfig.create({
      data: {
        id: "default",
        siteName: DEFAULT_CONFIG.siteName,
        siteTagline: DEFAULT_CONFIG.siteTagline,
        siteDescription: DEFAULT_CONFIG.siteDescription,
        heroTitle: DEFAULT_CONFIG.heroTitle,
        heroSubtitle: DEFAULT_CONFIG.heroSubtitle,
        heroVideoUrl: DEFAULT_CONFIG.heroVideoUrl,
        heroPosterImage: DEFAULT_CONFIG.heroPosterImage,
        showreelUrl: DEFAULT_CONFIG.showreelUrl,
        aboutBio: DEFAULT_CONFIG.aboutBio,
        aboutImage: DEFAULT_CONFIG.aboutImage,
        aboutStats: JSON.stringify(DEFAULT_CONFIG.aboutStats),
        aboutSkills: JSON.stringify(DEFAULT_CONFIG.aboutSkills),
        contactEmail: DEFAULT_CONFIG.contactEmail,
        contactPhone: DEFAULT_CONFIG.contactPhone,
        contactLocation: DEFAULT_CONFIG.contactLocation,
        socialInstagram: DEFAULT_CONFIG.socialInstagram,
        socialYoutube: DEFAULT_CONFIG.socialYoutube,
        socialVimeo: DEFAULT_CONFIG.socialVimeo,
        socialLinkedin: DEFAULT_CONFIG.socialLinkedin,
        socialBehance: DEFAULT_CONFIG.socialBehance,
        accentColor: DEFAULT_CONFIG.accentColor,
        footerNote: DEFAULT_CONFIG.footerNote,
      },
    });
  }
  return {
    id: row.id,
    siteName: row.siteName,
    siteTagline: row.siteTagline,
    siteDescription: row.siteDescription,
    heroTitle: row.heroTitle,
    heroSubtitle: row.heroSubtitle,
    heroVideoUrl: row.heroVideoUrl ?? "",
    heroPosterImage: row.heroPosterImage ?? "",
    showreelUrl: row.showreelUrl ?? "",
    aboutBio: row.aboutBio,
    aboutImage: row.aboutImage ?? "",
    aboutStats: safeParse<StatsItem[]>(row.aboutStats, DEFAULT_CONFIG.aboutStats),
    aboutSkills: safeParse<string[]>(row.aboutSkills, DEFAULT_CONFIG.aboutSkills),
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone ?? "",
    contactLocation: row.contactLocation ?? "",
    contactLat: row.contactLat ?? "",
    contactLng: row.contactLng ?? "",
    socialInstagram: row.socialInstagram ?? "",
    socialYoutube: row.socialYoutube ?? "",
    socialVimeo: row.socialVimeo ?? "",
    socialLinkedin: row.socialLinkedin ?? "",
    socialBehance: row.socialBehance ?? "",
    accentColor: row.accentColor,
    footerNote: row.footerNote ?? "",
    featureFlags: parseFeatureFlags(row.featureFlags),
    bannerEnabled: row.bannerEnabled,
    bannerProjectId: row.bannerProjectId,
    bannerEyebrow: row.bannerEyebrow || "Featured Story",
    bannerHeadline: row.bannerHeadline,
    bannerCtaLabel: row.bannerCtaLabel || "View the case study",
    notifyInquiriesEnabled: row.notifyInquiriesEnabled,
    notifyFromEmail: row.notifyFromEmail ?? "",
    notifyToEmail: row.notifyToEmail ?? "",
    smtpHost: row.smtpHost ?? "",
    smtpPort: row.smtpPort ?? "587",
    smtpUser: row.smtpUser ?? "",
    smtpPassword: row.smtpPassword ?? "",
    aiEnabled: row.aiEnabled,
    aiApiKey: row.aiApiKey ?? "",
    aiModel: row.aiModel || "gemini-2.5-flash",
    aiSystemPrompt: row.aiSystemPrompt ?? "",
  };
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
