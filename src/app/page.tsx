import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { FeaturedBanner } from "@/components/site/featured-banner";
import { FeaturedWork } from "@/components/site/featured-work";
import { AwardsStrip } from "@/components/site/awards-strip";
import { ServicesSection } from "@/components/site/services-section";
import { ProcessSection } from "@/components/site/process-section";
import { ProcessGallery } from "@/components/site/process-gallery";
import { GearSection } from "@/components/site/gear-section";
import { AboutSection } from "@/components/site/about-section";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { JournalSection } from "@/components/site/journal-section";
import { ContactCTA } from "@/components/site/contact-cta";
import { JsonLd } from "@/components/site/json-ld";
import { parseJsonArray, parseBtsGallery } from "@/lib/api";
import type { Project, Service, Testimonial, Gear, BlogPost, ProcessStep } from "@/lib/types";

export const revalidate = 60;

async function getLandingData() {
  const [
    config,
    projectsRaw,
    servicesRaw,
    testimonialsRaw,
    gearRaw,
    postsRaw,
    processRows,
  ] = await Promise.all([
    getSiteConfig(),
    db.project.findMany({
      where: { published: true, featured: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 4,
    }),
    db.service.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
    db.testimonial.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
    db.gear.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    }),
    db.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    db.processStep.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const projects: Project[] = projectsRaw.map((p) => ({
    ...p,
    gallery: parseJsonArray(p.gallery),
    btsGallery: parseBtsGallery(p.btsGallery),
    tags: parseJsonArray(p.tags),
  }));
  const services: Service[] = servicesRaw.map((s) => ({
    ...s,
    features: parseJsonArray(s.features),
  }));
  const testimonials: Testimonial[] = testimonialsRaw.map((t) => ({ ...t }));
  const gear: Gear[] = gearRaw.map((g) => ({ ...g }));
  const posts: BlogPost[] = postsRaw.map((p) => ({
    ...p,
    tags: parseJsonArray(p.tags),
  }));
  const processSteps: ProcessStep[] = processRows.map((p) => ({ ...p }));

  // Featured banner project (admin-selectable "Project of the Month").
  // Falls back to the first featured project if the admin hasn't picked one
  // explicitly but has enabled the banner.
  let bannerProject: Project | null = null;
  if (config.bannerEnabled) {
    type Row = NonNullable<Awaited<ReturnType<typeof db.project.findUnique>>>;
    let bannerRow: Row | null = null;
    if (config.bannerProjectId) {
      bannerRow = await db.project.findUnique({
        where: { id: config.bannerProjectId },
      });
    }
    if (!bannerRow && projects.length > 0) {
      bannerRow = await db.project.findUnique({
        where: { id: projects[0].id },
      });
    }
    if (bannerRow && bannerRow.published) {
      bannerProject = {
        ...bannerRow,
        gallery: parseJsonArray(bannerRow.gallery),
        btsGallery: parseBtsGallery(bannerRow.btsGallery),
        tags: parseJsonArray(bannerRow.tags),
      };
    }
  }

  return { config, projects, services, testimonials, gear, posts, bannerProject, processSteps };
}

export default async function HomePage() {
  const { config, projects, services, testimonials, gear, posts, bannerProject, processSteps } =
    await getLandingData();

  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://lumen.studio";
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.siteName,
    url: base,
    description: config.siteDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.siteName,
    url: base,
    email: config.contactEmail,
    ...(config.contactPhone ? { telephone: config.contactPhone } : {}),
    ...(config.contactLocation ? { areaServed: config.contactLocation } : {}),
    sameAs: [
      config.socialInstagram,
      config.socialYoutube,
      config.socialVimeo,
      config.socialLinkedin,
      config.socialBehance,
    ].filter(Boolean),
  };

  return (
    <SiteShell config={config}>
      <JsonLd data={websiteLd} />
      <JsonLd data={orgLd} />
      <Hero config={config} />
      <Marquee />
      {bannerProject && (
        <FeaturedBanner project={bannerProject} config={config} />
      )}
      <FeaturedWork
        projects={projects}
        revealEnabled={config.featureFlags?.imageReveal ?? true}
      />
      <AwardsStrip />
      <ServicesSection services={services} />
      {processSteps.length > 0 ? (
        <ProcessGallery
          steps={processSteps}
          revealEnabled={config.featureFlags?.imageReveal ?? true}
        />
      ) : (
        <ProcessSection />
      )}
      <GearSection gear={gear} />
      <AboutSection config={config} />
      <TestimonialsSection
        testimonials={testimonials}
        autoplay={config.featureFlags?.testimonialAutoplay ?? true}
      />
      <JournalSection
        posts={posts}
        revealEnabled={config.featureFlags?.imageReveal ?? true}
      />
      <ContactCTA config={config} />
    </SiteShell>
  );
}
