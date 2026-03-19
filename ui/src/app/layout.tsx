import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: "Zeus - AI-Powered Software Development Framework",
  description: "Intelligent orchestration through hierarchical AI agents. Automate software development with structured phase-based project execution.",
  openGraph: {
    title: "Zeus - AI-Powered Software Development Framework",
    description: "Intelligent orchestration through hierarchical AI agents. Automate software development with structured phase-based project execution.",
    url: "https://your-domain.com",
    siteName: "Zeus Framework",
    images: [
      {
        url: "/landing-social.png",
        width: 1200,
        height: 630,
        alt: "Zeus - AI-Powered Software Development Framework",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeus - AI-Powered Software Development Framework",
    description: "Intelligent orchestration through hierarchical AI agents. Automate software development with structured phase-based project execution.",
    images: ["/landing.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased bg-stone-950 text-white bg-mesh-pattern`}
      >
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
