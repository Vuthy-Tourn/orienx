import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#101965" },
    { media: "(prefers-color-scheme: dark)", color: "#080D2B" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://orienx.vercel.app");

const OG_IMAGE_WEBP =
  "https://res.cloudinary.com/dt1mvi7gy/image/upload/v1795617518/og-image_krxic7.webp";
const OG_IMAGE_JPG =
  "https://res.cloudinary.com/dt1mvi7gy/image/upload/q_auto/v1795617518/og-image_krxic7.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OrienX — Discover Your Direction. Shape Your Future.",
    template: "%s | OrienX Cambodia",
  },
  description:
    "Cambodia's modern education and career guidance ecosystem. Discover your authentic strengths through Holland RIASEC & MBTI assessments, explore verified Cambodian university majors and tuition fees, and unlock full-ride scholarships.",
  applicationName: "OrienX",
  authors: [{ name: "OrienX Team", url: siteUrl }],
  creator: "OrienX",
  publisher: "OrienX Higher Education Platform",
  category: "Education",
  classification: "Higher Education & Career Guidance",
  keywords: [
    // English keywords
    "Cambodia education",
    "Cambodian universities",
    "RUPP Royal University of Phnom Penh",
    "ITC Institute of Technology Cambodia Techno",
    "AUPP American University of Phnom Penh",
    "CADT Cambodia Academy of Digital Technology",
    "Paragon International University",
    "National University of Management NUM",
    "Major recommendation Cambodia",
    "Career guidance Cambodia",
    "University tuition fees Cambodia",
    "Scholarships in Cambodia",
    "Grade 12 BacII guidance",
    "Holland RIASEC test Cambodia",
    "16 Personalities test Khmer",
    "MoEYS scholarships",
    // Khmer search keywords (essential for local Google ranking)
    "សាកលវិទ្យាល័យនៅកម្ពុជា",
    "រៀនជំនាញអ្វី",
    "តម្លៃសិក្សាសាកលវិទ្យាល័យ",
    "អាហារូបករណ៍",
    "តេស្តជំនាញ",
    "តេស្ត RIASEC",
    "សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ",
    "វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា",
    "ការប្រឡងបាក់ឌុប",
    "ឱកាសការងារ និងប្រាក់ខែ",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "km-KH": "/",
      "en-US": "/?lang=en",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/orienx-mark.png", type: "image/png" },
    ],
    apple: [
      { url: "/images/orienx-mark.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "OrienX — Discover Your Direction. Shape Your Future.",
    description:
      "Cambodia's modern guidance ecosystem pairing Holland RIASEC & MBTI self-discovery with verified university tuitions, BacII cutoffs, and 100% scholarships.",
    url: "/",
    siteName: "OrienX",
    locale: "km_KH",
    alternateLocale: ["en_US"],
    type: "website",
    images: [
      {
        url: OG_IMAGE_WEBP,
        secureUrl: OG_IMAGE_WEBP,
        width: 1200,
        height: 630,
        alt: "OrienX — Discover Your Direction. Shape Your Future.",
        type: "image/webp",
      },
      {
        url: OG_IMAGE_JPG,
        secureUrl: OG_IMAGE_JPG,
        width: 1200,
        height: 630,
        alt: "OrienX — Discover Your Direction. Shape Your Future.",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OrienX — Discover Your Direction. Shape Your Future.",
    description:
      "Cambodia's modern guidance ecosystem pairing Holland RIASEC & MBTI self-discovery with verified university tuitions, BacII cutoffs, and 100% scholarships.",
    images: [
      {
        url: OG_IMAGE_WEBP,
        alt: "OrienX — Discover Your Direction. Shape Your Future.",
      },
    ],
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "OrienX",
      alternateName: ["OrienX Cambodia", "Futera OrienX"],
      description:
        "Cambodia's modern higher education, university major guidance, and career intelligence ecosystem.",
      inLanguage: ["km-KH", "en-US"],
      image: OG_IMAGE_WEBP,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/majors?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      name: "OrienX",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/orienx-mark.png`,
        width: "344",
        height: "386",
      },
      image: OG_IMAGE_WEBP,
      description:
        "Comprehensive, objective education and career guidance platform for Cambodian high school students and university undergraduates.",
      areaServed: {
        "@type": "Country",
        name: "Cambodia",
      },
      knowsAbout: [
        "Higher Education in Cambodia",
        "Holland RIASEC Vocational Psychology",
        "16 Personalities MBTI Assessment",
        "Cambodian University Tuition Fees",
        "Grade 12 BacII Stream Matching",
        "National Employment Agency Labor Trends",
      ],
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#app`,
      name: "OrienX Educational Guidance & Career Recommendation System",
      applicationCategory: "EducationalApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Psychometric assessment tools (RIASEC, MBTI), Grade 12 BacII stream prerequisites check, and verified Cambodian university major matching.",
    },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
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
                      <FloatingAssistant />
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
