import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "LUMEN — Cinematography & Visual Storytelling",
    template: "%s · LUMEN",
  },
  description:
    "Award-winning cinematographer crafting cinematic stories for brands, couples, and creators worldwide. Cinematography, aerial, and color — frame by frame.",
  keywords: [
    "cinematographer",
    "videographer",
    "wedding film",
    "commercial",
    "drone",
    "gimbal",
    "color grading",
    "portfolio",
  ],
  authors: [{ name: "LUMEN Studio" }],
  openGraph: {
    title: "LUMEN — Cinematography & Visual Storytelling",
    description:
      "Award-winning cinematographer crafting cinematic stories for brands, couples, and creators worldwide.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMEN — Cinematography & Visual Storytelling",
    description:
      "Award-winning cinematographer crafting cinematic stories for brands, couples, and creators worldwide.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: "bg-card border-border text-foreground",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
