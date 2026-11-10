import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/layout/logo";

export function Footer() {
  return (
    <footer className="bg-[#111965] text-white border-t border-[#1E277A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo isLight={true} />
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              OrienX helps Cambodian high school students, Grade 12 graduates, and young people discover their true direction through scientific assessments, verified Cambodian university programs, and transparent guidance.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 text-white font-medium">
                Cambodia Edition 2026
              </span>
              <span>•</span>
              <span>Bilingual EN / ខ្មែរ</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F7CE4D] uppercase tracking-wider">
              Guidance Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/majors" className="hover:text-white transition-colors">
                  Explore Majors
                </Link>
              </li>
              <li>
                <Link href="/universities" className="hover:text-white transition-colors">
                  Cambodian Universities
                </Link>
              </li>
              <li>
                <Link href="/universities/compare" className="hover:text-white transition-colors">
                  Compare Programs
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  Career Pathways
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-white transition-colors">
                  Scholarship Finder
                </Link>
              </li>
            </ul>
          </div>

          {/* Partner & Verified Institutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F7CE4D] uppercase tracking-wider">
              Verified Institutions
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/universities/rupp" className="hover:text-white transition-colors">
                  Royal University of Phnom Penh
                </Link>
              </li>
              <li>
                <Link href="/universities/itc" className="hover:text-white transition-colors">
                  Institute of Technology (Techno)
                </Link>
              </li>
              <li>
                <Link href="/universities/aupp" className="hover:text-white transition-colors">
                  American University of Phnom Penh
                </Link>
              </li>
              <li>
                <Link href="/universities/paragoniu" className="hover:text-white transition-colors">
                  Paragon International University
                </Link>
              </li>
              <li>
                <Link href="/universities/num" className="hover:text-white transition-colors">
                  National University of Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Integrity & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F7CE4D] uppercase tracking-wider">
              Transparency & Ethics
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assessment results reflect self-reported student preferences and are designed to broaden horizons, not definitively restrict opportunities. University tuition and admission requirements are sourced from official published portals.
            </p>
            <div className="text-xs text-slate-400">
              Support: <span className="text-white">guidance@futera.edu.kh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cambodian University Campuses Landmark Skyline (Full-Width Panorama) */}
      <div className="w-full relative overflow-hidden select-none bg-[#111965]">
        <Image
          src="/images/cambodia-campuses-skyline.webp"
          alt="Cambodian University Campuses - RUPP, Western University, CADT Innovation Center, ITC"
          width={2048}
          height={594}
          priority={true}
          unoptimized={true}
          className="w-full h-auto object-cover object-bottom"
        />
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-[#0D144F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Futera Platform. Discover Your Direction. Shape Your Future.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors">
              About Methodology
            </Link>
            <Link href="/about#privacy" className="hover:text-white transition-colors">
              Data Privacy
            </Link>
            <Link href="/about#terms" className="hover:text-white transition-colors">
              Terms of Guidance
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

