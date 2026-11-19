import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Noto_Sans_Khmer } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/language-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/contexts/auth-context";
import { QueryProvider } from "@/providers/query-provider";
import { Navbar } from "@/components/layout/navbar";
import { GlobalSearch } from "@/components/search/global-search";
import { FloatingAssistant } from "@/components/assistant/floating-assistant";
import { IS_STATIC_MODE } from "@/lib/app-mode";
import { Footer } from "@/components/layout/footer";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import {
  PageTransition,
  ScrollProgress,
  ScrollReveal,
  SmoothAnchors,
} from "@/components/motion/platform-motion";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  variable: "--font-khmer",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OrienX — Discover Your Direction. Shape Your Future.",
  description:
    "Cambodia's modern education and career guidance platform. Discover your interests through MBTI and RIASEC assessments, explore verified Cambodian university majors, compare tuition, and find scholarships.",
  keywords: [
    "Cambodia education",
    "Cambodian universities",
    "RUPP",
    "ITC Techno",
    "AUPP",
    "Major recommendation",
    "Career guidance Cambodia",
    "Scholarships Cambodia",
    "Grade 12 BacII guidance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="km"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${notoSansKhmer.variable}`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('futera_theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');}}catch(e){}})();`}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-[#F5F6FA] text-[#171A2C] selection:bg-[#F7CE4D] selection:text-[#111965]">
        <HeroUIProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              <QueryProvider>
                <ThemeProvider>
                  <LanguageProvider>
                    <AuthProvider>
                      <Navbar />
                      <ScrollProgress />
                      <main className="flex-1">
                        <PageTransition>{children}</PageTransition>
                      </main>
                      <Footer />
                      <ScrollReveal />
                      <SmoothAnchors />
                      <GlobalSearch />
                      {!IS_STATIC_MODE && <FloatingAssistant />}
                    </AuthProvider>
                  </LanguageProvider>
                </ThemeProvider>
              </QueryProvider>
            </ConfirmDialogProvider>
          </ToastProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
