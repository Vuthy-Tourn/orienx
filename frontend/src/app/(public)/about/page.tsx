"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function AboutPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F2FA] text-[#111965] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Futera Mission & Methodology</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111965]">
            {language === "km"
              ? "អំពីវេទិកាតម្រង់ទិស Futera"
              : "About Futera Education & Career Guidance"}
          </h1>
          <p className="text-sm sm:text-base text-[#68708A] max-w-2xl mx-auto leading-relaxed">
            {language === "km"
              ? "បេសកកម្មរបស់យើងគឺជួយសិស្សានុសិស្សកម្ពុជាឱ្យស្វែងយល់ពីខ្លួនឯង ជ្រើសរើសជំនាញសិក្សាដែលត្រូវនឹងនិស្ស័យ និងធ្វើការសម្រេចចិត្តដោយផ្អែកលើទិន្នន័យជាក់ស្តែង។"
              : "Futera is dedicated to helping Cambodian high school students, Grade 12 graduates, and young people discover their true direction through scientific assessments and verified university programs."}
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#111965] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111965]">
              {language === "km" ? "១. វិធីសាស្ត្រវិទ្យាសាស្ត្រ" : "1. Scientific Foundations"}
            </h3>
            <p className="text-xs text-[#68708A] leading-relaxed">
              {language === "km"
                ? "ផ្អែកលើទ្រឹស្តីចំណាប់អារម្មណ៍អាជីព RIASEC (Holland Code) និង ៤ វិមាត្រនៃបុគ្គលិកលក្ខណៈ ដោយមិនមែនជាការទស្សន៍ទាយរវើរវាយ។"
                : "Anchored in Holland's RIASEC career interest framework and cognitive preference dimensions, tested for explainable career alignment."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111965]">
              {language === "km" ? "២. ទិន្នន័យផ្ទៀងផ្ទាត់ផ្លូវការ" : "2. Verified Institutional Data"}
            </h3>
            <p className="text-xs text-[#68708A] leading-relaxed">
              {language === "km"
                ? "ព័ត៌មានតម្លៃសិក្សា និងលក្ខខណ្ឌចូលរៀនត្រូវបានប្រមូលពីការិយាល័យចុះឈ្មោះផ្លូវការ និង MoEYS ដោយមិនបង្កើតទិន្នន័យក្លែងក្លាយ។"
                : "Tuition fee ranges and entry requirements are cross-referenced with official university admissions notices and partner databases."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111965]">
              {language === "km" ? "៣. តម្លាភាព និងភាពយល់បាន" : "3. Explainable Rationale"}
            </h3>
            <p className="text-xs text-[#68708A] leading-relaxed">
              {language === "km"
                ? "រាល់អនុសាសន៍មានរបាយការណ៍ពន្យល់ពីមូលហេតុច្បាស់លាស់ ជួយឱ្យសិស្ស និងអាណាព្យាបាលយល់ដឹងពីហេតុផលនៅពីក្រោយពិន្ទុ។"
                : "No black-box guesses. Students receive a transparent scoring breakdown explaining how their strengths directly connect to each major."}
            </p>
          </div>
        </div>

        {/* Ethical Transparency Note */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-3">
          <h3 className="text-base font-bold text-[#111965]">
            {language === "km" ? "ការប្តេជ្ញាចិត្តចំពោះក្រមសីលធម៌នៃការតម្រង់ទិស" : "Ethical Guidance & Data Integrity Commitment"}
          </h3>
          <p className="text-xs text-[#68708A] leading-relaxed">
            Futera assessments represent self-reported preferences and are designed to inspire exploration and informed reflection, not to rigidly dictate a student's destiny. We strongly encourage students to discuss their Futera recommendations with high school teachers, university counselors, and family members.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/assessments/personality"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B]"
            >
              <span>{language === "km" ? "សាកល្បងធ្វើតេស្តដោយខ្លួនឯង" : "Experience the Assessments"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

