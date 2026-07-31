import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InterviewVerse AI — Adaptive Interview Practice",
    template: "%s | InterviewVerse AI",
  },
  description:
    "AI-powered adaptive interview platform. Practice technical, behavioral, and HR interviews personalized to your resume and experience level. Get real-time scoring and actionable improvement reports.",
  keywords: [
    "AI interview",
    "mock interview",
    "interview practice",
    "technical interview",
    "behavioral interview",
    "resume analysis",
    "interview preparation",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable}`}
      >
        <body className="min-h-screen font-sans">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
