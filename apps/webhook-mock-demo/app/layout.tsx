import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Production Signals Mock - Relay Testing",
  description: "Test Relay webhooks with production-ready events from Sentry, Vercel, Dynatrace, Azure DevOps, Typeform, Vanta, CrowdStrike, PostHog, Logflare & more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-[hsl(var(--background))]">{children}</body>
    </html>
  );
}
