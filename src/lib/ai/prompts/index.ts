/**
 * Prompt builders for each AI feature.
 *
 * Each builder takes typed input + returns the prompt text for Gemini.
 * Keeping them separate makes them easy to test, tweak, and reuse.
 */
import type { AiPart } from "@/lib/ai/types";

// ─── Feature 1: Project description writer ────────────────────────────────

export type ProjectDescInput = {
  title: string;
  category: string;
  client?: string | null;
  year?: number | null;
  location?: string | null;
  role?: string | null;
  excerpt?: string | null;
  tags?: string[];
};

export function buildProjectDescPrompt(input: ProjectDescInput): string {
  const tags = input.tags?.length ? input.tags.join(", ") : "none";
  return `Write a 2-3 paragraph cinematic project description for a film. Use markdown (## for section headings if helpful).

Film details:
- Title: ${input.title}
- Category: ${input.category}
- Client: ${input.client || "—"}
- Year: ${input.year ?? "—"}
- Location: ${input.location || "—"}
- Role: ${input.role || "Cinematographer"}
- Tags: ${tags}
${input.excerpt ? `- Existing excerpt (use as a starting point, don't contradict it): "${input.excerpt}"` : ""}

Requirements:
- First-person perspective (the cinematographer is writing)
- Premium, cinematic tone — sensory detail, emotion, craft
- 2-3 paragraphs, ~120-180 words total
- No emojis, no marketing fluff
- End on the emotional payoff of the film, not a sales pitch`;
}

// ─── Feature 2: Inquiry reply drafter ─────────────────────────────────────

export type InquiryReplyInput = {
  inquiryName: string;
  inquiryEmail: string;
  projectType?: string | null;
  budget?: string | null;
  eventDate?: string | null;
  message: string;
  siteName: string;
};

export function buildInquiryReplyPrompt(input: InquiryReplyInput): string {
  return `Draft a warm, professional reply to this inquiry. Output only the email body (no subject line).

Inquiry details:
- From: ${input.inquiryName} <${input.inquiryEmail}>
- Project type: ${input.projectType || "General"}
- Budget: ${input.budget || "Not specified"}
- Event date: ${input.eventDate || "Not specified"}
- Message: "${input.message}"

Requirements:
- Address them by first name
- Acknowledge their specific project type + reference something from their message
- Ask 1-2 clarifying questions about timing or creative direction
- Mention next steps (a brief call, a tailored proposal, etc.)
- Sign as "${input.siteName}"
- Keep it under 150 words
- No emojis, no headers, just plain email body text`;
}

// ─── Feature 3: Social media post generator ───────────────────────────────

export type SocialPostsInput = {
  title: string;
  category: string;
  excerpt?: string | null;
  tags?: string[];
  siteName: string;
};

export function buildSocialPostsPrompt(input: SocialPostsInput): string {
  const tags = input.tags?.length ? input.tags.join(", ") : "cinematography, filmmaking";
  return `Write 3 social media posts for this film. Output as JSON with this exact shape:
{"instagram": "...", "linkedin": "...", "twitter": "..."}

Film details:
- Title: ${input.title}
- Category: ${input.category}
- Excerpt: ${input.excerpt || "—"}
- Tags: ${tags}
- Studio: ${input.siteName}

Requirements:
- Instagram: 1-2 sentences + 5-8 relevant hashtags (including #${input.siteName.toLowerCase().replace(/\s+/g, "")})
- LinkedIn: 3-4 sentences, professional tone, focus on the craft/process
- Twitter: under 280 characters, punchy, 1-2 hashtags max
- No emojis in LinkedIn; tasteful emojis OK in Instagram + Twitter
- Output ONLY the JSON, no markdown fences`;
}

// ─── Feature 4: Image alt-text generator (vision) ─────────────────────────

export function buildAltTextPrompt(): string {
  return `Describe this image in 1-2 sentences for accessibility alt-text. Focus on:
- The main subject + what they're doing
- The setting/context (if relevant)
- Notable lighting or mood (if it's a photo)

Be concise, specific, and factual. No "image of" or "picture of" prefixes. No opinions. Example: "A cinematographer operating a gimbal rig on a commercial set at golden hour, with a crew member holding a reflector in the background."`;
}

// ─── Feature 5: Blog post outline + draft ─────────────────────────────────

export type BlogOutlineInput = {
  title: string;
  tags?: string[];
  excerpt?: string | null;
};

export function buildBlogOutlinePrompt(input: BlogOutlineInput): string {
  const tags = input.tags?.length ? input.tags.join(", ") : "cinematography";
  return `Create a blog post outline + first-section draft for a journal entry. Output as markdown.

Title: ${input.title}
Tags: ${tags}
${input.excerpt ? `Excerpt: ${input.excerpt}` : ""}

Requirements:
- Start with a 1-paragraph intro (the hook)
- Then 4-6 H2 (##) section headings, each with a 1-sentence description of what that section covers
- Under the first H2, write a 2-paragraph draft (the actual content, not a description)
- Use markdown formatting
- Tone: personal, craft-focused, first-person
- No emojis`;
}

// ─── Feature 6: Delivery email drafter ────────────────────────────────────

export type DeliveryEmailInput = {
  projectTitle: string;
  clientName?: string | null;
  clientEmail?: string | null;
  deliverableLabel: string;
  deliverableType: string;
  deliveryUrl?: string | null;
  siteName: string;
};

export function buildDeliveryEmailPrompt(input: DeliveryEmailInput): string {
  return `Write a delivery email to the client for their finished film. Output only the email body (no subject line).

Delivery details:
- Project: ${input.projectTitle}
- Client: ${input.clientName || "the client"}
- Client email: ${input.clientEmail || "—"}
- Deliverable: ${input.deliverableLabel} (${input.deliverableType})
- Download link: ${input.deliveryUrl || "[INSERT LINK HERE]"}

Requirements:
- Warm congratulations on the finished film
- Clear instructions: click the link to download, link expires in [X days]
- Mention what's included (the deliverable label + type)
- Revision policy: 1 round of minor revisions included, additional rounds billed separately
- Sign as "${input.siteName}"
- Under 200 words, plain text email body
- No emojis, no headers`;
}

// ─── Feature 7: SEO meta description generator ────────────────────────────

export type SeoMetaInput = {
  siteName: string;
  tagline: string;
  heroTitle: string;
  currentDescription?: string;
};

export function buildSeoMetaPrompt(input: SeoMetaInput): string {
  return `Write a single SEO meta description for a cinematographer portfolio website. Output ONLY the description text, no quotes, no preamble.

Site details:
- Name: ${input.siteName}
- Tagline: ${input.tagline}
- Hero title: ${input.heroTitle}
${input.currentDescription ? `- Current description (improve it, don't repeat it): ${input.currentDescription}` : ""}

Requirements:
- Exactly 150-160 characters (critical — search engines truncate at 160)
- Include "cinematographer" or "cinematography" + the site name
- Compelling, click-worthy, not clickbait
- No emojis, no quotes, no special characters`;
}

// ─── Feature 8: Testimonial reply writer ──────────────────────────────────

export type TestimonialReplyInput = {
  testimonialContent: string;
  name: string;
  role?: string | null;
  company?: string | null;
  rating: number;
  siteName: string;
};

export function buildTestimonialReplyPrompt(input: TestimonialReplyInput): string {
  return `Write a short, warm thank-you reply to this testimonial. Output only the reply text.

Testimonial details:
- From: ${input.name}${input.role ? `, ${input.role}` : ""}${input.company ? ` at ${input.company}` : ""}
- Rating: ${input.rating}/5
- Quote: "${input.testimonialContent}"

Requirements:
- 2-3 sentences
- Reference something specific from their quote
- Warm, genuine, not generic
- Sign as "${input.siteName}"
- No emojis`;
}

// ─── Helper: convert a prompt string to AiPart[] ──────────────────────────

export function textPart(text: string): AiPart[] {
  return [{ text }];
}

/** Convert a Buffer to an inline-data AiPart for vision requests. */
export function imagePart(buffer: Buffer, mimeType: string): AiPart {
  return {
    inlineData: {
      mimeType,
      data: buffer.toString("base64"),
    },
  };
}
