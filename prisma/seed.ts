/**
 * LUMEN — Database seed script.
 * Run with: bun run db:seed
 *
 * Idempotent: safe to run multiple times. Creates an admin user, default
 * site config, and a full set of premium sample content.
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient();

const ADMIN_EMAIL = "admin@lumen.studio";
const ADMIN_PASSWORD = "admin123";

async function main() {
  console.log("→ Seeding LUMEN database…");

  // 1. Admin user — fresh deploys force a password change on first login
  const existingUser = await db.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });
  if (!existingUser) {
    await db.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: "Studio Admin",
        passwordHash: hashPassword(ADMIN_PASSWORD),
        role: "ADMIN",
        // Force the first-run setup wizard on a fresh deploy.
        mustChangePassword: true,
      },
    });
    console.log(`  ✓ Created admin user (${ADMIN_EMAIL} / ${ADMIN_PASSWORD}) — mustChangePassword=true`);
  } else {
    // Preserve the existing mustChangePassword flag — do not clobber it.
    console.log("  • Admin user already exists, skipping");
  }

  // 2. Site config — upsert with update to ensure heroPosterImage is set on existing configs
  await db.siteConfig.upsert({
    where: { id: "default" },
    update: {
      heroPosterImage: "/images/hero-poster.png",
      aboutImage: "/images/about.png",
    },
    create: {
      id: "default",
      siteName: "LUMEN",
      siteTagline: "Cinematography & Visual Storytelling",
      siteDescription:
        "Award-winning cinematographer crafting cinematic stories for brands, couples, and creators worldwide. Cinematography, aerial, and color — frame by frame.",
      heroTitle: "We Paint With Light & Motion",
      heroSubtitle:
        "Cinematography · Aerial · Color — crafted frame by frame for stories worth telling.",
      heroPosterImage: "/images/hero-poster.png",
      showreelUrl: "https://vimeo.com/76979871",
      aboutBio:
        "I'm a cinematographer and visual storyteller with a decade behind the lens. From intimate weddings to high-end commercial campaigns, I bring a director's eye and a colorist's patience to every frame. My kit lives on gimbal, drone, and tripod — ready to chase the light wherever the story leads.",
      aboutImage: "/images/about.png",
      aboutStats: JSON.stringify([
        { label: "Years Behind the Lens", value: "10+" },
        { label: "Projects Delivered", value: "320+" },
        { label: "Awards & Features", value: "14" },
        { label: "Countries Filmed", value: "23" },
      ]),
      aboutSkills: JSON.stringify([
        "Cinematography",
        "Aerial / Drone",
        "Gimbal Operation",
        "Color Grading",
        "Lighting Design",
        "Directing",
      ]),
      contactEmail: "hello@lumen.studio",
      contactPhone: "+1 (415) 555-0142",
      contactLocation: "San Francisco · Available Worldwide",
      socialInstagram: "https://instagram.com",
      socialYoutube: "https://youtube.com",
      socialVimeo: "https://vimeo.com",
      socialLinkedin: "https://linkedin.com",
      accentColor: "#E8B547",
      footerNote:
        "Crafted with light, motion, and obsessive attention to detail.",
    },
  });
  console.log("  ✓ Site config");

  // 3. Projects
  const projects = [
    {
      title: "Echoes of the Valley",
      slug: "echoes-of-the-valley",
      category: "TRAVEL",
      client: "Wanderlight Films",
      year: 2024,
      location: "Dolomites, Italy",
      role: "Director of Photography",
      description:
        "A sweeping aerial travel film tracing the spine of the Dolomites at first light. Shot over five mornings with a cinema drone and a gimbal-mounted Alexa Mini, the piece pairs vast scale with intimate ground-level moments of mountain life.",
      excerpt:
        "Five mornings. One valley. A love letter to the Dolomites shot at first light.",
      thumbnail: "/images/project-travel.png",
      thumbnailAlt:
        "Aerial cinematic view of the Dolomites mountain range at sunrise with golden light",
      gallery: [
        "/images/project-travel.png",
        "/images/project-wedding.png",
        "/images/project-documentary.png",
      ],
      featured: true,
      order: 0,
    },
    {
      title: "Vows at Golden Hour",
      slug: "vows-at-golden-hour",
      category: "WEDDING",
      client: "Maya & Arjun",
      year: 2024,
      location: "Big Sur, California",
      role: "Lead Cinematographer",
      description:
        "An intimate wedding film capturing Maya and Arjun's cliffside ceremony. Backlit by the Pacific sunset, every frame was designed to feel timeless — anamorphic glass, shallow depth of field, and a warm grade that lets the light do the talking.",
      excerpt:
        "A cliffside ceremony backlit by the Pacific — designed to feel timeless.",
      thumbnail: "/images/project-wedding.png",
      featured: true,
      order: 1,
    },
    {
      title: "Maison Noir",
      slug: "maison-noir",
      category: "COMMERCIAL",
      client: "Maison Noir Parfums",
      year: 2024,
      location: "Studio, Paris",
      role: "Cinematographer & Colorist",
      description:
        "A luxury fragrance spot built around water, glass, and controlled shadows. Shot on a motion-control rig with macro lenses, the commercial leans into texture and reflection — every splash choreographed, every highlight graded by hand.",
      excerpt:
        "A luxury fragrance spot built around water, glass, and controlled shadows.",
      thumbnail: "/images/project-commercial.png",
      featured: true,
      order: 2,
    },
    {
      title: "The Maker's Hands",
      slug: "the-makers-hands",
      category: "DOCUMENTARY",
      client: "Independent",
      year: 2023,
      location: "Kyoto, Japan",
      role: "Director & Cinematographer",
      description:
        "A short documentary following a third-generation craftsman in his Kyoto workshop. Shot almost entirely in available light with a single warm window shaft, the film is a meditation on patience, mastery, and the quiet dignity of making things by hand.",
      excerpt:
        "A meditation on patience, mastery, and the dignity of making by hand.",
      thumbnail: "/images/project-documentary.png",
      featured: true,
      order: 3,
    },
    {
      title: "Neon Pulse",
      slug: "neon-pulse",
      category: "MUSIC_VIDEO",
      client: "Velvet Static",
      year: 2024,
      location: "Brooklyn, NY",
      role: "Cinematographer",
      description:
        "A high-energy music video shot in a haze-filled warehouse with practical neon rigs. Magenta and amber washes, anamorphic flares, and handheld energy match the track's pulse beat for beat.",
      excerpt:
        "Haze, neon, and anamorphic flares matched to the track beat for beat.",
      thumbnail: "/images/project-music.png",
      featured: false,
      order: 4,
    },
    {
      title: "Concrete & Light",
      slug: "concrete-and-light",
      category: "BRAND",
      client: "Studio Arc Architects",
      year: 2023,
      location: "Copenhagen, Denmark",
      role: "Cinematographer",
      description:
        "A brand film for a Scandinavian architecture studio. Long lens compressions, deliberate camera moves, and a cool-warm grade highlight the interplay of concrete mass and natural light in their flagship space.",
      excerpt:
        "A brand film exploring the interplay of concrete mass and natural light.",
      thumbnail: "/images/project-brand.png",
      featured: false,
      order: 5,
    },
    {
      title: "Hands High",
      slug: "hands-high",
      category: "EVENT",
      client: "Pulse Festival",
      year: 2024,
      location: "Lisbon, Portugal",
      role: "Lead Cameraman",
      description:
        "Festival aftermovie coverage with a five-camera crew. Crane, drone, and gimbal rigs captured the scale and intimacy of a 40,000-person crowd across two nights.",
      excerpt:
        "Two nights, five cameras, 40,000 people — scale and intimacy in one cut.",
      thumbnail: "/images/project-event.png",
      featured: false,
      order: 6,
    },
  ];
  for (const p of projects) {
    const data = {
      ...p,
      gallery: JSON.stringify((p as { gallery?: string[] }).gallery ?? []),
      tags: JSON.stringify((p as { tags?: string[] }).tags ?? []),
    };
    const exists = await db.project.findUnique({ where: { slug: p.slug } });
    if (exists) {
      await db.project.update({ where: { slug: p.slug }, data });
    } else {
      await db.project.create({ data });
    }
  }
  console.log(`  ✓ ${projects.length} projects`);

  // 4. Services
  const services = [
    {
      title: "Cinematography",
      slug: "cinematography",
      description:
        "Director-of-photography level camera work for films, commercials, and brand content. Cinema-grade cameras, prime glass, and a story-first approach to every shot.",
      icon: "Camera",
      features: ["Cinema cameras (ARRI/RED)", "Prime & zoom lens kits", "Shotlisting & storyboards", "On-set directing"],
      priceFrom: "$2,500/day",
      order: 0,
    },
    {
      title: "Aerial & Drone",
      slug: "aerial-drone",
      description:
        "Licensed aerial cinematography with cinema drones. From sweeping landscapes to tight architectural reveals — all shot in 5K+ RAW for maximum grading flexibility.",
      icon: "Plane",
      features: ["Licensed pilot", "DJI Inspire / Mavic 3 Pro", "5.1K RAW capture", "Indoor FPV available"],
      priceFrom: "$1,200/day",
      order: 1,
    },
    {
      title: "Gimbal & Stabilized",
      slug: "gimbal-stabilized",
      description:
        "Smooth, repeatable gimbal moves for narrative and commercial work. Handheld energy when you want it, buttery stability when you need it.",
      icon: "Video",
      features: ["DJI Ronin 2 / RS4 Pro", "Buggy & cable cam rigs", "Vehicle mounts", "Operator + AC"],
      priceFrom: "$900/day",
      order: 2,
    },
    {
      title: "Color Grading",
      slug: "color-grading",
      description:
        "Signature color grading that gives every frame its emotional weight. DaVinci Resolve studio, calibrated reference monitor, and a colorist's patience.",
      icon: "Palette",
      features: ["DaVinci Resolve Studio", "Calibrated grading suite", "Look development", "HDR delivery"],
      priceFrom: "$600/project",
      order: 3,
    },
    {
      title: "Full Production",
      slug: "full-production",
      description:
        "End-to-end production — concept to final delivery. I assemble the crew, location, gear, and post team so you get one point of contact and a finished film.",
      icon: "Clapperboard",
      features: ["Concept & treatment", "Crew & location mgmt", "Shoot + edit + color", "Multi-format delivery"],
      priceFrom: "$7,500/project",
      order: 4,
    },
    {
      title: "Live Event Coverage",
      slug: "live-event-coverage",
      description:
        "Multi-camera coverage for conferences, festivals, and performances. Same-day edits available for social-first delivery.",
      icon: "Sparkles",
      features: ["Multi-cam crews", "Live switching optional", "Same-day social cuts", "Drone permitted venues"],
      priceFrom: "$3,000/event",
      order: 5,
    },
  ];
  for (const s of services) {
    const exists = await db.service.findUnique({ where: { slug: s.slug } });
    const data = {
      ...s,
      features: JSON.stringify(s.features),
      published: true,
    };
    if (exists) {
      await db.service.update({ where: { slug: s.slug }, data });
    } else {
      await db.service.create({ data });
    }
  }
  console.log(`  ✓ ${services.length} services`);

  // 5. Testimonials
  const testimonials = [
    { name: "Maya Chen", role: "Bride", company: "Vows at Golden Hour", content: "Watching our film for the first time, we both cried. Every frame felt like a memory we didn't know we had. The light, the pacing, the music — flawless.", rating: 5, order: 0 },
    { name: "Daniel Okonkwo", role: "Creative Director", company: "Maison Noir", content: "We've worked with DP's across three continents. This was on another level — technically flawless and visually poetic. The grade alone won us a Cannes Lions shortlist.", rating: 5, order: 1 },
    { name: "Sofia Rinaldi", role: "Producer", company: "Wanderlight Films", content: "Five 4am call times, zero complaints, every shot usable. Professional, calm, and genuinely talented. Already booked for the next two films.", rating: 5, order: 2 },
    { name: "James Hartley", role: "Founder", company: "Studio Arc", content: "Our brand film became our best sales tool. Clients reference specific shots in meetings. That's the power of cinematography that understands architecture.", rating: 5, order: 3 },
    { name: "Aisha Rahman", role: "Festival Director", company: "Pulse Festival", content: "40,000 people, two nights, one crew that never missed a beat. The aftermovie broke our engagement records. Worth every cent.", rating: 5, order: 4 },
    { name: "Tom Becker", role: "Artist Manager", company: "Velvet Static", content: "The video looks like a million dollars on a fraction of that budget. Energy, texture, attitude — exactly what the track needed.", rating: 5, order: 5 },
  ];
  for (const t of testimonials) {
    const exists = await db.testimonial.findFirst({ where: { name: t.name, content: t.content } });
    if (!exists) {
      await db.testimonial.create({ data: { ...t, published: true } });
    }
  }
  console.log(`  ✓ ${testimonials.length} testimonials`);

  // 6. Gear
  const gear = [
    { name: "ARRI Alexa Mini LF", category: "CAMERA", brand: "ARRI", description: "Large-format cinema camera. The gold standard for dynamic range and skin tones.", order: 0 },
    { name: "RED Komodo 6K", category: "CAMERA", brand: "RED", description: "Compact 6K global-shutter body for gimbal and drone work.", order: 1 },
    { name: "Sony FX3", category: "CAMERA", brand: "Sony", description: "Low-light monster for run-and-gun and event coverage.", order: 2 },
    { name: "Cooke S4/i Prime Set", category: "LENS", brand: "Cooke", description: "25/32/50/75/100mm — the Cooke look, sharp yet flattering.", order: 3 },
    { name: "Sigma FF Zoom 24-35mm", category: "LENS", brand: "Sigma", description: "T2.2 full-frame zoom for fast environments.", order: 4 },
    { name: "DJI Ronin 2", category: "GIMBAL", brand: "DJI", description: "Cinema-grade stabilizer for Alexa/RED payloads.", order: 5 },
    { name: "DJI RS 4 Pro", category: "GIMBAL", brand: "DJI", description: "Lightweight gimbal for FX3/Komodo and run-and-gun.", order: 6 },
    { name: "DJI Inspire 3", category: "DRONE", brand: "DJI", description: "8K cinema drone with full-frame sensor and DL mounts.", order: 7 },
    { name: "DJI Mavic 3 Pro Cine", category: "DRONE", brand: "DJI", description: "Triple-camera compact drone for travel and quick shots.", order: 8 },
    { name: "Sennheiser MKH 416", category: "AUDIO", brand: "Sennheiser", description: "Industry-standard shotgun mic for dialogue and atmos.", order: 9 },
    { name: "Sound Devices MixPre-6 II", category: "AUDIO", brand: "Sound Devices", description: "Field recorder + USB interface for clean multi-channel capture.", order: 10 },
    { name: "Aputure 600x Pro", category: "LIGHT", brand: "Aputure", description: "Bi-color 600W point source — the workhorse daylight/tungsten key.", order: 11 },
    { name: "Aputure Nova P600c", category: "LIGHT", brand: "Aputure", description: "RGBWW panel for full-color creative washes.", order: 12 },
    { name: "Easyrig Vario 5", category: "ACCESSORY", brand: "Easyrig", description: "Body support for long handheld/gimbal operating days.", order: 13 },
  ];
  for (const g of gear) {
    const exists = await db.gear.findFirst({ where: { name: g.name } });
    if (!exists) {
      await db.gear.create({ data: g });
    }
  }
  console.log(`  ✓ ${gear.length} gear items`);

  // 7. Blog posts
  const posts = [
    {
      title: "Chasing First Light in the Dolomites",
      slug: "chasing-first-light-dolomites",
      excerpt: "Five 4am call times, frozen fingers, and one unforgettable valley. Here's how we shot Echoes of the Valley.",
      content: `# Chasing First Light\n\nThere's a window — maybe twelve minutes — when the sun crests the ridge and the valley fills with a light you can almost hold. We chased it for five straight mornings.\n\n## The plan\n\nWe pre-scouted four peaks using topographic maps and a sun-position app. Each morning was a different reveal: ridge, lake, village, pasture.\n\n## The kit\n\n- ARRI Alexa Mini LF on a Ronin 2\n- DJI Inspire 3 for the aerials\n- A thermos of very strong coffee\n\n## What I learned\n\nThe light doesn't wait. Neither should you. Prep everything the night before, sleep in your layers, and roll the second the horizon glows.`,
      coverImage: "/images/project-travel.png",
      coverImageAlt: "Aerial drone view of the Dolomites mountain range at first light with golden rim lighting",
      tags: JSON.stringify(["Field Notes", "Aerial", "Travel"]),
      author: "Studio Admin",
    },
    {
      title: "The Quiet Art of Available Light",
      slug: "quiet-art-of-available-light",
      excerpt: "Why a single window shaft beat every light we brought to the Kyoto workshop — and what it taught me about restraint.",
      content: `# The Quiet Art of Available Light\n\nWe flew to Kyoto with two flight cases of lighting. We used almost none of it.\n\n## The setup\n\nThe workshop had one north-facing window. Around 2pm, a single warm shaft cut across the bench. It was perfect.\n\n## The lesson\n\nLighting isn't about adding. It's about *choosing*. When the room gives you a gift, take it. Turn off the LEDs. Push the ISO. Let the shadow do the work.\n\n## Grading notes\n\nI protected the highlights in-camera and pushed the shadows toward a warm teal in the grade. The result feels like memory — soft, golden, a little wistful.`,
      coverImage: "/images/project-documentary.png",
      coverImageAlt: "Craftsman working with hands in a dim workshop lit by a single warm window shaft",
      tags: JSON.stringify(["Craft", "Lighting", "Documentary"]),
      author: "Studio Admin",
    },
    {
      title: "Why Anamorphic Still Matters in 2024",
      slug: "why-anamorphic-still-matters",
      excerpt: "Oval bokeh, horizontal flares, and that squeeze — a practical case for shooting anamorphic on modern sensors.",
      content: `# Why Anamorphic Still Matters\n\nSensors keep getting wider, flatter, sharper. So why reach for a 60-year-old optical design?\n\n## The look\n\nAnamorphic glass gives you oval bokeh, horizontal flares, and a characteristic breathing on focus pulls. None of it is "accurate". All of it is *cinematic*.\n\n## The practical bit\n\nOn a wedding film, anamorphic flares turn a sunset into a memory. On a commercial, the oval bokeh reads as premium. On a music video, the breathing sells emotion.\n\n## The trade-offs\n\nHeavier kits, trickier focus, slower stops. Worth it — when the story calls for romance, scale, or attitude.`,
      coverImage: "/images/project-wedding.png",
      coverImageAlt: "Wedding couple silhouetted against golden hour backlight with anamorphic lens flare",
      tags: JSON.stringify(["Craft", "Gear", "Cinematography"]),
      author: "Studio Admin",
    },
  ];
  for (const p of posts) {
    const exists = await db.blogPost.findUnique({ where: { slug: p.slug } });
    if (exists) {
      await db.blogPost.update({
        where: { slug: p.slug },
        data: { ...p, published: true, publishedAt: new Date() },
      });
    } else {
      await db.blogPost.create({
        data: { ...p, published: true, publishedAt: new Date() },
      });
    }
  }
  console.log(`  ✓ ${posts.length} blog posts`);

  // FAQ entries (admin-managed, shown on /services + /about)
  const faqs = [
    {
      question: "How far in advance should I book?",
      answer:
        "Wedding dates typically book 6–12 months ahead; commercial campaigns 4–8 weeks. Get in touch as early as you can — last-minute slots do open up, but the calendar fills fast in peak season.",
      category: "Booking",
    },
    {
      question: "Do you travel for shoots?",
      answer:
        "Yes — worldwide. I'm based in San Francisco but I've filmed in 23 countries. Travel and shipping are billed at cost and laid out clearly in every quote.",
      category: "Logistics",
    },
    {
      question: "What's included in a typical deliverable?",
      answer:
        "A cinematic main film (3–6 minutes), a 60-second social cut, all raw footage on a drive, and a color-graded master. Commercial packages add revisions, alternate cuts, and broadcast-ready exports.",
      category: "Deliverables",
    },
    {
      question: "Can we request specific music or a voiceover?",
      answer:
        "Absolutely. I license music through Musicbed and Artlist, and work with a roster of voice artists. Custom scores are available for an additional fee.",
      category: "Deliverables",
    },
    {
      question: "What gear do you shoot on?",
      answer:
        "Primary bodies are a RED Komodo and a Sony FX6, with DJI Ronin gimbals and an Inspire 3 drone. The full kit list is on the Gear page — every project is right-tooled, not over-tooled.",
      category: "Gear",
    },
    {
      question: "How does payment work?",
      answer:
        "A 30% retainer secures the date; the balance is due on final delivery. Commercial jobs are invoiced 50/50 (booking + delivery). All terms are spelled out in the contract.",
      category: "Booking",
    },
  ];
  for (const f of faqs) {
    const existing = await db.faq.findFirst({ where: { question: f.question } });
    if (existing) {
      await db.faq.update({ where: { id: existing.id }, data: { ...f, published: true } });
    } else {
      await db.faq.create({ data: { ...f, published: true } });
    }
  }
  console.log(`  ✓ ${faqs.length} FAQ entries`);

  // Behind-the-Scenes process steps (admin-managed, shown on /about)
  const processSteps = [
    {
      title: "Discovery & Vision",
      description:
        "We sit down — coffee or Zoom — and dig into the story you want to tell. Audience, mood, must-have moments, the feeling people should walk away with. I translate that into a creative direction and shot plan before a single frame is exposed.",
      phase: "Pre-production",
      order: 0,
    },
    {
      title: "Scout & Plan",
      description:
        "Location scouting (in person when possible), shotlists, gear selection, crew calls. I map every detail so the shoot day flows like clockwork — and leave room for the magic that only happens when you're prepared.",
      phase: "Pre-production",
      order: 1,
    },
    {
      title: "Shoot Day",
      description:
        "On set with cinema cameras, gimbals, drones and purpose-built lighting. Calm, prepared, ready to chase the light. I direct when needed and disappear into the background when the moment is yours.",
      phase: "Production",
      order: 2,
    },
    {
      title: "Edit & Sound",
      description:
        "Story-first editing. Pacing, sound design, music licensing — every cut earns its place. You see a first cut within two weeks, with structured revisions baked into the process.",
      phase: "Post-production",
      order: 3,
    },
    {
      title: "Color Grade",
      description:
        "The signature step. A custom color grade gives every frame its emotional weight — warm and golden for a wedding, cold and contrasty for a brand film, somewhere in between for a documentary.",
      phase: "Post-production",
      order: 4,
    },
    {
      title: "Delivery",
      description:
        "Final masters in every format you need — cinema 4K, broadcast, socials. Raw footage on a drive. A project archive you can revisit years later. Done.",
      phase: "Delivery",
      order: 5,
    },
  ];
  for (const s of processSteps) {
    const existing = await db.processStep.findFirst({ where: { title: s.title } });
    if (existing) {
      await db.processStep.update({
        where: { id: existing.id },
        data: { ...s, published: true },
      });
    } else {
      await db.processStep.create({ data: { ...s, published: true } });
    }
  }
  console.log(`  ✓ ${processSteps.length} process steps`);

  console.log("\n✅ Seed complete.");
  console.log(`   Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
