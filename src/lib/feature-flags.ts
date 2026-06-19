/**
 * Site-wide feature flags — admin-toggleable premium UX features.
 * Stored as JSON in the SiteConfig.featureFlags column.
 *
 * Each flag defaults to ON (true) so the full premium experience ships
 * out of the box; the admin can turn any off from the Settings → Features tab.
 */

export type CursorMode = "magnetic" | "default" | "none";

export type FeatureFlags = {
  /** Custom cinematic cursor (dot + ring). "none" disables entirely. */
  cursorMode: CursorMode;
  /** First-load aperture reveal loader. */
  cinematicLoader: boolean;
  /** Magnetic pull on primary CTA buttons. */
  magneticButtons: boolean;
  /** Clip-path wipe-in reveal on project/journal/about images. */
  imageReveal: boolean;
  /** Thin scroll-progress bar at the navbar bottom. */
  scrollProgress: boolean;
  /** Floating back-to-top button on long pages. */
  backToTop: boolean;
  /** Fade+rise transition between public routes. */
  pageTransitions: boolean;
  /** Hero parallax (background drifts slower than content on scroll). */
  heroParallax: boolean;
  /** Testimonial carousel auto-advances every 6s. Off = manual nav only. */
  testimonialAutoplay: boolean;
  /** Face-match photo delivery (browser-side face detection). Off by default — enable on self-hosted. */
  faceMatchEnabled: boolean;
};

/** Sensible defaults — everything ON for the full premium experience. */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
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
};

/** Parse a stored feature-flags JSON string, falling back to defaults. */
export function parseFeatureFlags(raw: string | null | undefined): FeatureFlags {
  if (!raw) return { ...DEFAULT_FEATURE_FLAGS };
  try {
    const parsed = JSON.parse(raw) as Partial<FeatureFlags>;
    return { ...DEFAULT_FEATURE_FLAGS, ...parsed };
  } catch {
    return { ...DEFAULT_FEATURE_FLAGS };
  }
}

/** Human-readable labels + descriptions for the admin UI. */
export const FEATURE_FLAG_META: {
  key: keyof FeatureFlags;
  label: string;
  description: string;
}[] = [
  {
    key: "cinematicLoader",
    label: "Cinematic loader",
    description: "Aperture-reveal animation on first load of each session.",
  },
  {
    key: "magneticButtons",
    label: "Magnetic buttons",
    description: "Primary CTAs subtly follow the cursor on hover.",
  },
  {
    key: "imageReveal",
    label: "Image reveal animations",
    description: "Clip-path wipe-in entrance for project, journal & about images.",
  },
  {
    key: "scrollProgress",
    label: "Scroll-progress bar",
    description: "Thin brand bar under the navbar that fills as you scroll.",
  },
  {
    key: "backToTop",
    label: "Back-to-top button",
    description: "Floating button that appears after scrolling on public pages.",
  },
  {
    key: "pageTransitions",
    label: "Page transitions",
    description: "Fade + rise animation between public route changes.",
  },
  {
    key: "heroParallax",
    label: "Hero parallax",
    description: "Hero background drifts at a different rate than the content.",
  },
  {
    key: "testimonialAutoplay",
    label: "Testimonial autoplay",
    description: "The testimonials carousel auto-advances every 6 seconds.",
  },
  {
    key: "faceMatchEnabled",
    label: "Face-match photo delivery",
    description: "Upload event photo batches + let clients find their photos via selfie. Browser-side face detection — no server cost. Off by default.",
  },
];

/**
 * Quick-select presets that set multiple flags at once. Each preset is a
 * full FeatureFlags object the admin can apply with one click from the
 * Features tab. Useful for onboarding or switching the site's "feel".
 */
export type FeaturePreset = {
  id: string;
  name: string;
  description: string;
  flags: FeatureFlags;
};

export const FEATURE_PRESETS: FeaturePreset[] = [
  {
    id: "maximum",
    name: "Maximum impact",
    description: "Every premium effect on — the full cinematic experience.",
    flags: {
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
  },
  {
    id: "minimal",
    name: "Minimal / performant",
    description: "Fewer animations — faster perceived load, calmer feel.",
    flags: {
      cursorMode: "default",
      cinematicLoader: false,
      magneticButtons: false,
      imageReveal: false,
      scrollProgress: true,
      backToTop: true,
      pageTransitions: false,
      heroParallax: false,
      testimonialAutoplay: false,
      faceMatchEnabled: false,
    },
  },
  {
    id: "accessibility",
    name: "Accessibility-first",
    description: "Native cursor, no auto-motion — respects reduced-motion users.",
    flags: {
      cursorMode: "none",
      cinematicLoader: false,
      magneticButtons: false,
      imageReveal: false,
      scrollProgress: false,
      backToTop: true,
      pageTransitions: false,
      heroParallax: false,
      testimonialAutoplay: false,
      faceMatchEnabled: false,
    },
  },
];

