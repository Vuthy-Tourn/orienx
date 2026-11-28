"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { useLanguage } from "@/contexts/language-context";
import { useTestFocusMode } from "@/lib/test-focus";

export function Footer() {
  const pathname = usePathname();
  const { getLocalized } = useLanguage();
  const isTestFocus = useTestFocusMode();

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname?.startsWith("/login/") ||
    pathname?.startsWith("/register/") ||
    pathname?.startsWith("/forgot-password/") ||
    pathname?.startsWith("/reset-password/") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/share") ||
    pathname?.startsWith("/admin");

  if (isAuthPage || isTestFocus) {
    return null;
  }
  return (
    <footer className="relative bg-gradient-to-b from-[#080D2B] via-[#0F1754] to-[#0A0F3D] text-white border-t border-[#1E277A]/60 overflow-hidden select-none">
      {/* Background Seamless Cambodian Skyline (Subtly Grounding the Footer) */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden opacity-12 h-72 sm:h-80 lg:h-96 z-0">
        <Image
          src="/images/cambodia-campuses-skyline-seamless.webp"
          alt="Cambodian University Campuses Backdrop"
          fill
          unoptimized
          className="object-cover object-bottom"
        />
        {/* Soft Gradient Overlay so buildings seamlessly emerge from the dark navy */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F3D] via-transparent to-[#080D2B]/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 lg:pt-18 lg:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo isLight={true} />
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              {getLocalized({
                en: "OrienX empowers Cambodian high school students, Grade 12 graduates, and young people to discover their true path through scientific career assessments, verified university programs, and transparent guidance.",
                km: "OrienX ជួយសិស្សវិទ្យាល័យកម្ពុជា សិស្សបញ្ចប់ថ្នាក់ទី១២ និងយុវជនស្វែងរកទិសដៅពិតប្រាកដតាមរយៈការវាយតម្លៃវិទ្យាសាស្ត្រ កម្មវិធីសាកលវិទ្យាល័យដែលបានផ្ទៀងផ្ទាត់ និងការណែនាំច្បាស់លាស់។",
              })}
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-[#F7CE4D] font-bold border border-white/10 shadow-xs">
                {getLocalized({ en: "Cambodia Edition 2026", km: "កំណែសម្រាប់កម្ពុជា ២០២៦" })}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-300">
                {getLocalized({ en: "Bilingual EN / ខ្មែរ", km: "ពីរភាសា ខ្មែរ / EN" })}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#F7CE4D] uppercase tracking-wider">
              {getLocalized({
                en: "Guidance Platform",
                km: "វេទិកាណែនាំ",
              })}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/majors" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  {getLocalized({ en: "Explore Majors", km: "ស្វែងរកមុខជំនាញ" })}
                </Link>
              </li>
              <li>
                <Link href="/universities" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  {getLocalized({ en: "Cambodian Universities", km: "សាកលវិទ្យាល័យកម្ពុជា" })}
                </Link>
              </li>
              <li>
                <Link href="/universities/compare" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  {getLocalized({ en: "Compare Programs", km: "ប្រៀបធៀបកម្មវិធីសិក្សា" })}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  {getLocalized({ en: "Career Pathways", km: "មាគ៌ាអាជីពការងារ" })}
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  {getLocalized({ en: "Scholarship Finder", km: "អាហារូបករណ៍" })}
                </Link>
              </li>
              <li>
                <Link href="/personality" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  {getLocalized({ en: "16 Personalities Guide", km: "មគ្គុទ្ទេសក៍បុគ្គលិកលក្ខណៈទាំង ១៦" })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Partner & Verified Institutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#F7CE4D] uppercase tracking-wider">
              {getLocalized({
                en: "Verified Institutions",
                km: "គ្រឹះស្ថានឧត្តមសិក្សា",
              })}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/universities/rupp" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  {getLocalized({ en: "Royal University of Phnom Penh (RUPP)", km: "សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ (RUPP)" })}
                </Link>
              </li>
              <li>
                <Link href="/universities/itc" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  {getLocalized({ en: "Institute of Technology (Techno)", km: "វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (តិចណូ)" })}
                </Link>
              </li>
              <li>
                <Link href="/universities/aupp" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  {getLocalized({ en: "American University of Phnom Penh (AUPP)", km: "សាកលវិទ្យាល័យអាមេរិកាំងភ្នំពេញ (AUPP)" })}
                </Link>
              </li>
              <li>
                <Link href="/universities/paragoniu" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  {getLocalized({ en: "Paragon International University", km: "សាកលវិទ្យាល័យអន្តរជាតិផារ៉ាហ្គន (Paragon.U)" })}
                </Link>
              </li>
              <li>
                <Link href="/universities/num" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  {getLocalized({ en: "National University of Management (NUM)", km: "សាកលវិទ្យាល័យជាតិគ្រប់គ្រង (NUM)" })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Integrity & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#F7CE4D] uppercase tracking-wider">
              {getLocalized({
                en: "Transparency & Ethics",
                km: "តម្លាភាព និងក្រមសីលធម៌",
              })}
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {getLocalized({
                en: "Assessment results reflect self-reported student preferences and are designed to broaden horizons, not definitively restrict opportunities. University tuition and admission requirements are sourced from official published portals.",
                km: "លទ្ធផលវាយតម្លៃឆ្លុះបញ្ចាំងពីចំណូលចិត្តផ្ទាល់ខ្លួន ដើម្បីពង្រីកឱកាសសិក្សា និងមិនកំណត់សិទ្ធិរបស់សិស្សឡើយ។ តម្លៃសិក្សា និងលក្ខខណ្ឌចូលរៀនត្រូវបានប្រមូលពីប្រភពផ្លូវការ។",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="relative z-10 bg-[#060A24]/90 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            {getLocalized({
              en: `© ${new Date().getFullYear()} OrienX Discover Your Direction and Shape Your Future.`,
              km: `© ${new Date().getFullYear()} OrienX ស្វែងរកទិសដៅរបស់អ្នក និង កំណត់អនាគតរបស់អ្នក`,
            })}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors">
              {getLocalized({ en: "About Methodology", km: "អំពីវិធីសាស្ត្រ" })}
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              {getLocalized({ en: "Terms of Guidance", km: "គោលការណ៍ណែនាំ" })}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

