/** Shared application-level types (DB-agnostic) used across UI & API layers. */
import type { StatsItem } from "@/lib/settings";
import type { FeatureFlags } from "@/lib/feature-flags";

export type SiteConfig = {
  id: string;
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroVideoUrl: string;
  heroPosterImage: string;
  showreelUrl: string;
  aboutBio: string;
  aboutImage: string;
  aboutStats: StatsItem[];
  aboutSkills: string[];
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  contactLat: string;
  contactLng: string;
  socialInstagram: string;
  socialYoutube: string;
  socialVimeo: string;
  socialLinkedin: string;
  socialBehance: string;
  accentColor: string;
  footerNote: string;
  featureFlags: FeatureFlags;
  bannerEnabled: boolean;
  bannerProjectId: string | null;
  bannerEyebrow: string;
  bannerHeadline: string | null;
  bannerCtaLabel: string;
  notifyInquiriesEnabled: boolean;
  notifyFromEmail: string;
  notifyToEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  aiEnabled: boolean;
  aiApiKey: string;
  aiModel: string;
  aiSystemPrompt: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string;
  client: string | null;
  year: number | null;
  location: string | null;
  role: string | null;
  description: string;
  excerpt: string | null;
  thumbnail: string | null;
  thumbnailAlt: string | null;
  posterImage: string | null;
  videoUrl: string | null;
  gallery: string[];
  btsGallery: BtsPhoto[];
  tags: string[];
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BtsPhoto = {
  image: string;
  alt: string;
  caption?: string;
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  features: string[];
  priceFrom: string | null;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  avatar: string | null;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Gear = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  description: string | null;
  image: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  coverImageAlt: string | null;
  tags: string[];
  author: string | null;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Inquiry = {
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
  updatedAt: Date;
};

export type DashboardStats = {
  projects: number;
  services: number;
  testimonials: number;
  gear: number;
  posts: number;
  inquiries: number;
  newInquiries: number;
  featuredProjects: number;
};

export type Award = {
  id: string;
  label: string;
  year: string;
  note: string | null;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Subscriber = {
  id: string;
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ActivityLog = {
  id: string;
  action: string;
  entity: string;
  label: string | null;
  entityId: string | null;
  summary: string;
  actor: string | null;
  createdAt: Date;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProcessStep = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  imageAlt: string | null;
  phase: string | null;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AiUsage = {
  id: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  actor: string | null;
  success: boolean;
  error: string | null;
  createdAt: Date;
};

export type DeliveryType =
  | "MAIN_FILM"
  | "SOCIAL_CUT"
  | "RAW_FOOTAGE"
  | "COLOR_MASTER"
  | "TRAILER"
  | "CUSTOM";

export type DeliveryStatus =
  | "PENDING"
  | "READY"
  | "SENT"
  | "DELIVERED"
  | "REVISED";

export type ProjectDelivery = {
  id: string;
  projectId: string;
  type: string;
  label: string;
  url: string | null;
  status: string;
  clientEmail: string | null;
  sentAt: Date | null;
  aiEmailDraft: string | null;
  notes: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DeliveryToken = {
  id: string;
  projectId: string;
  token: string;
  passphrase: string | null;
  expiresAt: Date | null;
  lastViewedAt: Date | null;
  viewCount: number;
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PhotoBatch = {
  id: string;
  projectId: string | null;
  title: string;
  photoCount: number;
  faceCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PhotoBatchItem = {
  id: string;
  batchId: string;
  url: string;
  storageKey: string;
  width: number | null;
  height: number | null;
  faceCount: number;
  processed: boolean;
  createdAt: Date;
};

export type PhotoFace = {
  id: string;
  photoId: string;
  batchId: string;
  descriptor: string;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
};

export type PhotoBatchToken = {
  id: string;
  batchId: string;
  token: string;
  passphrase: string | null;
  expiresAt: Date | null;
  lastViewedAt: Date | null;
  viewCount: number;
  matchCount: number;
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
};
