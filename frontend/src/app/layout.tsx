import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Khmer } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/language-context";
import { AuthProvider } from "@/contexts/auth-context";
import { QueryProvider } from "@/providers/query-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

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
    <html lang="km" className={`${plusJakarta.variable} ${notoSansKhmer.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#F5F6FA] text-[#171A2C] selection:bg-[#F7CE4D] selection:text-[#111965]">
        <QueryProvider>
          <LanguageProvider>
            <AuthProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </AuthProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
