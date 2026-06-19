/** Centralised domain constants for the LUMEN platform. */

export const PROJECT_CATEGORIES = [
  "FILM",
  "WEDDING",
  "COMMERCIAL",
  "DOCUMENTARY",
  "MUSIC_VIDEO",
  "EVENT",
  "TRAVEL",
  "BRAND",
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const GEAR_CATEGORIES = [
  "CAMERA",
  "LENS",
  "GIMBAL",
  "DRONE",
  "AUDIO",
  "LIGHT",
  "ACCESSORY",
] as const;
export type GearCategory = (typeof GEAR_CATEGORIES)[number];

export const INQUIRY_STATUS = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUS)[number];

export const PROJECT_TYPES = [
  "Wedding Film",
  "Commercial",
  "Documentary",
  "Music Video",
  "Event Coverage",
  "Brand Film",
  "Real Estate",
  "Short Film",
  "Other",
] as const;

export const BUDGET_RANGES = [
  "Under $1,000",
  "$1,000 - $3,000",
  "$3,000 - $7,000",
  "$7,000 - $15,000",
  "$15,000+",
  "Not sure yet",
] as const;

/** Human-readable label for a project category. */
export function categoryLabel(c: string): string {
  const map: Record<string, string> = {
    FILM: "Film",
    WEDDING: "Wedding",
    COMMERCIAL: "Commercial",
    DOCUMENTARY: "Documentary",
    MUSIC_VIDEO: "Music Video",
    EVENT: "Event",
    TRAVEL: "Travel",
    BRAND: "Brand",
  };
  return map[c] ?? c;
}

export function gearCategoryLabel(c: string): string {
  const map: Record<string, string> = {
    CAMERA: "Cameras",
    LENS: "Lenses",
    GIMBAL: "Gimbals & Stabilizers",
    DRONE: "Aerial / Drones",
    AUDIO: "Audio",
    LIGHT: "Lighting",
    ACCESSORY: "Accessories",
  };
  return map[c] ?? c;
}

export function statusLabel(s: string): string {
  const map: Record<string, string> = {
    NEW: "New",
    READ: "Read",
    REPLIED: "Replied",
    ARCHIVED: "Archived",
  };
  return map[s] ?? s;
}
