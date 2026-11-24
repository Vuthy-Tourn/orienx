"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/contexts/language-context";
import { STATIC_UNIVERSITIES } from "@/lib/data/catalog";
import { FaqSection, FaqItem } from "@/components/home/faq-section";
import { CtaBanner } from "@/components/home/cta-banner";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  School,
  Building2,
  Check,
  ChevronRight,
  HelpCircle,
  Briefcase,
  DollarSign,
  BookOpen,
  Award,
  Layers,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Clock,
  Compass,
  Stethoscope,
  FileText,
  Binary,
  Scale,
  Microscope,
  Lightbulb,
  TrendingUp,
  Coins,
  ChevronDown,
} from "lucide-react";

// =========================================================================
// Data: Cambodian Subjects
// =========================================================================
interface SubjectOption {
  id: string;
  labelEn: string;
  labelKm: string;
  stream: "science" | "social" | "both";
  iconTag: string;
}

const AVAILABLE_SUBJECTS: SubjectOption[] = [
  { id: "math", labelEn: "Advanced Mathematics", labelKm: "គណិតវិទ្យា (Math)", stream: "both", iconTag: "STEM" },
  { id: "physics", labelEn: "Physics", labelKm: "រូបវិទ្យា (Physics)", stream: "science", iconTag: "Science" },
  { id: "chemistry", labelEn: "Chemistry", labelKm: "គីមីវិទ្យា (Chemistry)", stream: "science", iconTag: "Science" },
  { id: "biology", labelEn: "Biology", labelKm: "ជីវវិទ្យា (Biology)", stream: "science", iconTag: "Science" },
  { id: "informatics", labelEn: "Informatics & Computing", labelKm: "ព័ត៌មានវិទ្យា (Informatics)", stream: "both", iconTag: "Tech" },
  { id: "english", labelEn: "English Language", labelKm: "ភាសាអង់គ្លេស (English)", stream: "both", iconTag: "Language" },
  { id: "khmer", labelEn: "Khmer Literature", labelKm: "អក្សរសាស្ត្រខ្មែរ (Literature)", stream: "social", iconTag: "Humanities" },
  { id: "economics", labelEn: "Economics & Business", labelKm: "សេដ្ឋកិច្ច (Economics)", stream: "social", iconTag: "Business" },
  { id: "history", labelEn: "History & Heritage", labelKm: "ប្រវត្តិវិទ្យា (History)", stream: "social", iconTag: "Humanities" },
  { id: "geography", labelEn: "Geography & Earth", labelKm: "ភូមិវិទ្យា (Geography)", stream: "social", iconTag: "Social" },
];

// =========================================================================
// Data: Stream Profiles
// =========================================================================
const STREAM_PROFILES = {
  science: {
    key: "science",
    nameEn: "Science Stream (ថ្នាក់វិទ្យាសាស្ត្រពិត)",
    nameKm: "ថ្នាក់វិទ្យាសាស្ត្រពិត (Science Stream)",
    shortDescEn: "Advanced Math, Physics, Chemistry, Biology & Computing",
    shortDescKm: "គណិតវិទ្យាកម្រិតខ្ពស់ រូបវិទ្យា គីមីវិទ្យា ជីវវិទ្យា និងព័ត៌មានវិទ្យា",
    accentColor: "#2563EB",
    coreSubjectsEn: ["Advanced Math", "Physics", "Chemistry", "Biology"],
    coreSubjectsKm: ["គណិតវិទ្យា", "រូបវិទ្យា", "គីមីវិទ្យា", "ជីវវិទ្យា"],
    keyEntranceExamsEn: [
      "ITC Concours d'Entrée (Engineering)",
      "CADT Techo Digital Talent Exam",
      "UHS National Medical Concours (Medicine)",
      "RUPP Computer Science Entrance Test",
    ],
    keyEntranceExamsKm: [
      "ការប្រឡងចូលវិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (ITC)",
      "ការប្រឡងអាហារូបករណ៍ទេពកោសល្យឌីជីថលតេជោ (CADT)",
      "ការប្រឡងចូលសាកលវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល (UHS)",
      "ការប្រឡងចូលដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រកុំព្យូទ័រ (RUPP)",
    ],
    topMajors: [
      { nameEn: "Software Engineering & Computer Science", nameKm: "វិស្វកម្មសូហ្វវែរ & វិទ្យាសាស្ត្រកុំព្យូទ័រ", slug: "software-engineering", univ: "CADT, ITC, RUPP" },
      { nameEn: "Data Science & Artificial Intelligence", nameKm: "វិទ្យាសាស្ត្រទិន្នន័យ និងបញ្ញាសិប្បនិម្មិត", slug: "data-science-ai", univ: "CADT, Paragon IU" },
      { nameEn: "Civil & Construction Engineering", nameKm: "វិស្វកម្មសំណង់ស៊ីវិល", slug: "civil-engineering", univ: "ITC, RUPP" },
      { nameEn: "Medicine, Pharmacy & Dentistry", nameKm: "វេជ្ជសាស្ត្រ ឱសថសាស្ត្រ & ទន្តសាស្ត្រ", slug: "medicine", univ: "UHS, UP" },
      { nameEn: "Robotics & Automation Engineering", nameKm: "វិស្វកម្មរ៉ូបូត និងស្វ័យប្រវត្តិកម្ម", slug: "robotics-engineering", univ: "ITC, CADT" },
    ],
    prerequisiteNotesEn:
      "Mandatory for Engineering (ITC), Medicine (UHS), and top-tier Computer Science. Students possess strong foundations in mathematical proofs and physics calculations.",
    prerequisiteNotesKm:
      "លក្ខខណ្ឌកាតព្វកិច្ចសម្រាប់វិស្វកម្ម (ITC) វេជ្ជសាស្ត្រ (UHS) និងវិទ្យាសាស្ត្រកុំព្យូទ័រជាន់ខ្ពស់។ សិស្សមានមូលដ្ឋានរឹងមាំលើរូបមន្តគណិតវិទ្យា និងរូបវិទ្យា។",
  },
  social: {
    key: "social",
    nameEn: "Social Science Stream (ថ្នាក់វិទ្យាសាស្ត្រសង្គម)",
    nameKm: "ថ្នាក់វិទ្យាសាស្ត្រសង្គម (Social Science Stream)",
    shortDescEn: "Khmer Literature, History, Geography, Morality & Economics",
    shortDescKm: "អក្សរសាស្ត្រខ្មែរ ប្រវត្តិវិទ្យា ភូមិវិទ្យា សីលធម៌ និងសេដ្ឋកិច្ច",
    accentColor: "#059669",
    coreSubjectsEn: ["Khmer Literature", "History", "Geography", "Morality & Economics"],
    coreSubjectsKm: ["អក្សរសាស្ត្រខ្មែរ", "ប្រវត្តិវិទ្យា", "ភូមិវិទ្យា", "សីលធម៌-ពលរដ្ឋ & សេដ្ឋកិច្ច"],
    keyEntranceExamsEn: [
      "RULE Law & Public Administration Concours",
      "IISPP International Relations (RUPP) Exam",
      "DMC Media & Journalism Entrance Test",
      "NUM International Business & FinTech Track",
    ],
    keyEntranceExamsKm: [
      "ការប្រឡងចូលសាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ (RULE)",
      "ការប្រឡងចូលវិទ្យាស្ថានសិក្សាអន្តរជាតិ (IISPP / RUPP)",
      "ការប្រឡងចូលដេប៉ាតឺម៉ង់ប្រព័ន្ធផ្សព្វផ្សាយ (DMC / RUPP)",
      "ការប្រឡងជ្រើសរើសថ្នាក់អន្តរជាតិ (NUM)",
    ],
    topMajors: [
      { nameEn: "Law & Jurisprudence (Public & Private)", nameKm: "នីតិសាស្ត្រ និងច្បាប់", slug: "law", univ: "RULE, Royal Academy" },
      { nameEn: "International Relations & Diplomacy", nameKm: "ទំនាក់ទំនងអន្តរជាតិ និងការទូត", slug: "international-relations", univ: "IISPP, RUPP, Paragon IU" },
      { nameEn: "Media, Journalism & Digital Communications", nameKm: "ប្រព័ន្ធផ្សព្វផ្សាយ និងសារគមនាគមន៍", slug: "media-communications", univ: "DMC (RUPP), AUPP" },
      { nameEn: "Banking, Finance & FinTech", nameKm: "ធនាគារ ហិរញ្ញវត្ថុ & បច្ចេកវិទ្យាហិរញ្ញវត្ថុ", slug: "banking-finance", univ: "NUM, CamEd, RULE" },
      { nameEn: "Tourism Management & Hospitality", nameKm: "គ្រប់គ្រងទេសចរណ៍ និងបដិសណ្ឋារកិច្ច", slug: "tourism-hospitality", univ: "RUPP, NUM" },
    ],
    prerequisiteNotesEn:
      "Ideal for Law, International Relations, Business, and Communications. Social stream students can enter business and media directly without science entrance exams.",
    prerequisiteNotesKm:
      "ស័ក្តិសមបំផុតសម្រាប់ច្បាប់ ទំនាក់ទំនងអន្តរជាតិ គ្រប់គ្រងអាជីវកម្ម និងសារព័ត៌មាន។ សិស្សអាចចូលរៀនជំនាញពាណិជ្ជកម្មដោយផ្ទាល់ដោយមិនបាច់ប្រឡងមុខវិជ្ជាវិទ្យាសាស្ត្រ។",
  },
};

// =========================================================================
// Data: Cambodian Tuition Fee Benchmarks
// =========================================================================
const TUITION_BENCHMARKS = [
  {
    tierEn: "Public State Universities",
    tierKm: "សាកលវិទ្យាល័យរដ្ឋ",
    rangeUsd: "$500 – $900 / year",
    descEn: "Subsidized by the Royal Government of Cambodia. High entry competition, prestigious heritage, state scholarships.",
    descKm: "ឧបត្ថម្ភធនដោយរាជរដ្ឋាភិបាលកម្ពុជា។ ការប្រកួតប្រជែងខ្ពស់ តម្លៃសមរម្យ និងមានកូតាអាហារូបករណ៍រដ្ឋច្រើន។",
    universities: ["RUPP (Royal Univ. of Phnom Penh)", "ITC (Techno)", "RULE (Law & Econ)", "NUM (Management)"],
    tagBg: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    tierEn: "Specialized Digital Academies",
    tierKm: "វិទ្យាស្ថានបច្ចេកវិទ្យាឯកទេស",
    rangeUsd: "$1,200 – $2,800 / year",
    descEn: "Heavy emphasis on Cambodia's digital transformation, hands-on software labs, industry internships, CADT Techo Talent.",
    descKm: "ផ្តោតលើបរិវត្តកម្មឌីជីថល ពិសោធន៍សរសេរកូដផ្ទាល់ដៃ និងមានអាហារូបករណ៍ទេពកោសល្យឌីជីថលតេជោ។",
    universities: ["CADT (Cambodia Academy of Digital Tech)", "Paragon International University", "NIPTICT"],
    tagBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    tierEn: "International & Dual-Degree",
    tierKm: "សាកលវិទ្យាល័យស្តង់ដារអន្តរជាតិ",
    rangeUsd: "$2,500 – $9,000 / year",
    descEn: "100% English medium of instruction, US/UK accredited dual degree programs, international faculty exchange.",
    descKm: "បង្រៀនជាភាសាអង់គ្លេស ១០០% កម្មវិធីសញ្ញាបត្រពីរជាមួយសហរដ្ឋអាមេរិក/អឺរ៉ុប និងសាស្រ្តាចារ្យអន្តរជាតិ។",
    universities: ["AUPP (American Univ. of Phnom Penh)", "CamEd Business School", "Paragon IU"],
    tagBg: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

// =========================================================================
// Data: MoEYS BACII Grade Cutoffs & Privileges
// =========================================================================
const PILL_INK_DARK: Record<string, string> = {
  "#B45309": "#FCD34D",
  "#1D4ED8": "#93C5FD",
  "#047857": "#6EE7B7",
  "#7E22CE": "#D8B4FE",
};

const BACII_GRADE_TIERS = [
  {
    grade: "Grade A",
    accent: "#F59E0B",
    pillInk: "#B45309",
    summaryEn: "Top band",
    summaryKm: "កម្រិតកំពូល",
    notesEn: [
      "Eligible to apply to every bachelor's programme.",
      "Strong position for competitive majors and state scholarship quotas.",
      "Each university still sets its own cutoff and conditions.",
    ],
    notesKm: [
      "មានសិទ្ធិដាក់ពាក្យចូលរៀនគ្រប់កម្មវិធីបរិញ្ញាបត្រ។",
      "ទីតាំងល្អសម្រាប់ជំនាញប្រកួតប្រជែង និងកូតាអាហារូបករណ៍រដ្ឋ។",
      "សាកលវិទ្យាល័យនីមួយៗកំណត់លក្ខខណ្ឌដោយខ្លួនឯង។",
    ],
  },
  {
    grade: "Grade B",
    accent: "#2563EB",
    pillInk: "#1D4ED8",
    summaryEn: "Upper band",
    summaryKm: "កម្រិតខ្ពស់",
    notesEn: [
      "Eligible to apply to bachelor's programmes, including competitive faculties.",
      "Scholarship quotas are competitive — verify each university's requirement.",
      "Some programmes may ask for higher scores or an entrance exam.",
    ],
    notesKm: [
      "មានសិទ្ធិដាក់ពាក្យគ្រប់កម្មវិធីបរិញ្ញាបត្រ រួមទាំងមហាវិទ្យាល័យប្រកួតប្រជែង។",
      "កូតាអាហារូបករណ៍មានការប្រកួតប្រជែង — ត្រូវផ្ទៀងផ្ទាត់តាមសាកលវិទ្យាល័យ។",
      "កម្មវិធីខ្លះអាចត្រូវការពិន្ទុខ្ពស់ ឬការប្រឡងចូលបន្ថែម។",
    ],
  },
  {
    grade: "Grade C & D",
    accent: "#10B981",
    pillInk: "#047857",
    summaryEn: "Passing band",
    summaryKm: "កម្រិតជាប់",
    notesEn: [
      "Qualifies for the BACII diploma and bachelor's applications.",
      "Selective programmes may require higher scores or extra exams.",
      "Check each university's admission notice before applying.",
    ],
    notesKm: [
      "ទទួលបានសញ្ញាបត្របាក់ឌុប និងមានសិទ្ធិដាក់ពាក្យបរិញ្ញាបត្រ។",
      "កម្មវិធីជ្រើសរើសអាចត្រូវការពិន្ទុខ្ពស់ ឬការប្រឡងបន្ថែម។",
      "ពិនិត្យសេចក្តីជូនដំណឹងចូលរៀនរបស់សាកលវិទ្យាល័យនីមួយៗ។",
    ],
  },
  {
    grade: "Grade E",
    accent: "#9333EA",
    pillInk: "#7E22CE",
    summaryEn: "Base band",
    summaryKm: "កម្រិតមូលដ្ឋាន",
    notesEn: [
      "BACII diploma awarded — the base requirement for higher education.",
      "Consider foundation years, associate degrees, or TVET pathways.",
      "Private universities often accept this band; confirm with each.",
    ],
    notesKm: [
      "ទទួលបានសញ្ញាបត្របាក់ឌុប — ជាលក្ខខណ្ឌមូលដ្ឋានសម្រាប់ការសិក្សាខ្ពស់។",
      "អាចពិចារណាឆ្នាំមូលដ្ឋាន បរិញ្ញាបត្ររង ឬផ្លូវបច្ចេកទេស TVET។",
      "សាកលវិទ្យាល័យឯកជនជាច្រើនទទួលកម្រិតនេះ — ត្រូវផ្ទៀងផ្ទាត់ជាមួយសាលា។",
    ],
  },
];

// Presets for the Interactive Simulator
const SIMULATOR_PRESETS = [
  {
    id: "tech-lead",
    labelEn: "Software & AI Engineer",
    labelKm: "វិស្វករសូហ្វវែរ & AI",
    stream: "science" as const,
    subjects: ["math", "informatics", "physics"],
    budget: 1500,
    icon: Binary,
  },
  {
    id: "doctor",
    labelEn: "Doctor & Pharmacist",
    labelKm: "វេជ្ជបណ្ឌិត & ឱសថការី",
    stream: "science" as const,
    subjects: ["biology", "chemistry", "math"],
    budget: 2500,
    icon: Stethoscope,
  },
  {
    id: "lawyer-diplomat",
    labelEn: "Corporate Lawyer & Diplomat",
    labelKm: "មេធាវី & អ្នកការទូត",
    stream: "social" as const,
    subjects: ["khmer", "english", "history"],
    budget: 800,
    icon: Scale,
  },
  {
    id: "fintech-banker",
    labelEn: "FinTech & Investment",
    labelKm: "ហិរញ្ញវត្ថុ & ធនាគារ FinTech",
    stream: "social" as const,
    subjects: ["economics", "math", "english"],
    budget: 1200,
    icon: TrendingUp,
  },
];

// =========================================================================
// Main Component
// =========================================================================
export default function PublicBaciiGuidePage() {
  const { language } = useLanguage();
  const isKm = language === "km";

  // Hero Quick Preview State
  const [heroStream, setHeroStream] = useState<"science" | "social">("science");

  // Interactive Stream Prerequisite Simulator state
  const [selectedStream, setSelectedStream] = useState<"science" | "social">("science");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["math", "physics"]);
  const [selectedBudget, setSelectedBudget] = useState<number>(1000);

  // Apply a quick preset to the simulator
  const applyPreset = (preset: (typeof SIMULATOR_PRESETS)[0]) => {
    setSelectedStream(preset.stream);
    setSelectedSubjects(preset.subjects);
    setSelectedBudget(preset.budget);
  };

  // Toggle subject selection in simulator. Zero subjects is valid.
  const toggleSubject = (id: string) => {
    setSelectedSubjects((current) => {
      if (current.includes(id)) {
        return current.filter((subjectId) => subjectId !== id);
      }
      if (current.length < 4) {
        return [...current, id];
      }
      return current;
    });
  };

  // Determine eligible recommendations based on selections
  const simulatedMatches = useMemo(() => {
    if (selectedSubjects.length === 0) return [];

    const isScience = selectedStream === "science";
    const hasMath = selectedSubjects.includes("math");
    const hasInformatics = selectedSubjects.includes("informatics");
    const hasPhysics = selectedSubjects.includes("physics");
    const hasChemistry = selectedSubjects.includes("chemistry");
    const hasBiology = selectedSubjects.includes("biology");
    const hasEnglish = selectedSubjects.includes("english");
    const hasKhmer = selectedSubjects.includes("khmer");
    const hasEconomics = selectedSubjects.includes("economics");
    const hasHistory = selectedSubjects.includes("history");
    const hasGeography = selectedSubjects.includes("geography");

    const matches: {
      majorEn: string;
      majorKm: string;
      slug: string;
      fitLevel: "high" | "moderate" | "bridge-needed";
      fitReasonEn: string;
      fitReasonKm: string;
      universitiesEn: string;
      universitiesKm: string;
      typicalFee: string;
    }[] = [];

    if (isScience) {
      if (hasMath || hasInformatics) {
        matches.push({
          majorEn: "Software Engineering & Computer Science",
          majorKm: "វិស្វកម្មសូហ្វវែរ & វិទ្យាសាស្ត្រកុំព្យូទ័រ",
          slug: "software-engineering",
          fitLevel: "high",
          fitReasonEn: "Perfect Science stream subject alignment for algorithm formulation, software architecture, and logic.",
          fitReasonKm: "ត្រូវគ្នាល្អឥតខ្ចោះជាមួយថ្នាក់វិទ្យាសាស្ត្រសម្រាប់ការសរសេរកូដ តក្កវិជ្ជា និងស្ថាបត្យកម្មប្រព័ន្ធ។",
          universitiesEn: "CADT, ITC, RUPP, Paragon IU",
          universitiesKm: "CADT, ITC, RUPP, Paragon IU",
          typicalFee: "$600 – $2,500/yr",
        });
        matches.push({
          majorEn: "Data Science & Artificial Intelligence",
          majorKm: "វិទ្យាសាស្ត្រទិន្នន័យ & បញ្ញាសិប្បនិម្មិត",
          slug: "data-science-ai",
          fitLevel: "high",
          fitReasonEn: "Advanced Math is mandatory for statistical data modeling, vector calculus, and machine learning algorithms.",
          fitReasonKm: "គណិតវិទ្យាកម្រិតខ្ពស់ជាកាតព្វកិច្ចសម្រាប់ការវិភាគទិន្នន័យ គំរូស្ថិតិ និង AI។",
          universitiesEn: "CADT, Paragon IU",
          universitiesKm: "CADT, Paragon IU",
          typicalFee: "$1,200 – $2,800/yr",
        });
      }

      if (hasPhysics || hasMath) {
        matches.push({
          majorEn: "Civil & Construction Engineering",
          majorKm: "វិស្វកម្មសំណង់ស៊ីវិល",
          slug: "civil-engineering",
          fitLevel: "high",
          fitReasonEn: "Requires strong Physics and Calculus foundations for ITC Concours entrance.",
          fitReasonKm: "ទាមទាររូបវិទ្យា និងគណិតវិទ្យារឹងមាំសម្រាប់ការប្រឡងចូល ITC Techno។",
          universitiesEn: "ITC Techno, RUPP",
          universitiesKm: "វិទ្យាស្ថានតិចណូ (ITC), RUPP",
          typicalFee: "$500 – $800/yr",
        });
      }

      if (hasBiology || hasChemistry) {
        matches.push({
          majorEn: "General Medicine, Pharmacy & Dentistry",
          majorKm: "វេជ្ជសាស្ត្រទូទៅ ឱសថសាស្ត្រ & ទន្តសាស្ត្រ",
          slug: "medicine",
          fitLevel: "high",
          fitReasonEn: "High Biology & Chemistry scores mandatory for UHS national medical entrance concours.",
          fitReasonKm: "ពិន្ទុជីវវិទ្យា និងគីមីវិទ្យាខ្ពស់ជាកាតព្វកិច្ចសម្រាប់ការប្រឡងចូលសាលាក្រហម (UHS)។",
          universitiesEn: "UHS, University of Puthisastra",
          universitiesKm: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល (UHS), UP",
          typicalFee: "$1,200 – $4,500/yr",
        });
      }
    } else {
      // Social Stream
      if (hasKhmer || hasHistory || hasEnglish) {
        matches.push({
          majorEn: "Law & Public Jurisprudence",
          majorKm: "នីតិសាស្ត្រ និងរដ្ឋបាលសាធារណៈ",
          slug: "law",
          fitLevel: "high",
          fitReasonEn: "Deep textual comprehension, ethics, and Khmer literature align with statutory law and constitutional analysis.",
          fitReasonKm: "ការយល់ដឹងភាសាស៊ីជម្រៅ សីលធម៌ និងអក្សរសាស្ត្រត្រូវគ្នានឹងការសិក្សាច្បាប់ និងរដ្ឋបាលសាធារណៈ។",
          universitiesEn: "RULE (Royal Univ. of Law & Economics)",
          universitiesKm: "សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច (RULE)",
          typicalFee: "$500 – $800/yr",
        });
        matches.push({
          majorEn: "International Relations & Diplomacy",
          majorKm: "ទំនាក់ទំនងអន្តរជាតិ & ការទូត",
          slug: "international-relations",
          fitLevel: "high",
          fitReasonEn: "Geopolitics, world history, and foreign language fluency fit diplomatic service and policy analysis.",
          fitReasonKm: "ភូមិសាស្ត្រនយោបាយ ប្រវត្តិវិទ្យា និងភាសាបរទេសត្រូវគ្នានឹងកិច្ចការទូត និងវិទ្យាសាស្ត្រនយោបាយ។",
          universitiesEn: "IISPP (RUPP), Paragon IU",
          universitiesKm: "វិទ្យាស្ថានសិក្សាអន្តរជាតិ (IISPP / RUPP), Paragon IU",
          typicalFee: "$750 – $2,500/yr",
        });
      }

      if (hasEconomics || hasEnglish || hasMath) {
        matches.push({
          majorEn: "Banking, Finance & FinTech",
          majorKm: "ធនាគារ ហិរញ្ញវត្ថុ & បច្ចេកវិទ្យាហិរញ្ញវត្ថុ",
          slug: "banking-finance",
          fitLevel: "high",
          fitReasonEn: "Direct alignment with commercial banking, investment portfolios, and corporate accounting in Cambodia.",
          fitReasonKm: "ត្រូវគ្នាដោយផ្ទាល់ជាមួយទីផ្សារធនាគារពាណិជ្ជកម្ម វិនិយោគ និងគណនេយ្យនៅកម្ពុជា។",
          universitiesEn: "NUM, CamEd Business School, RULE",
          universitiesKm: "NUM, CamEd Business School, RULE",
          typicalFee: "$600 – $2,400/yr",
        });
      }

      // Cross-stream warning note
      matches.push({
        majorEn: "Computer Science (Math Bridging Track)",
        majorKm: "វិទ្យាសាស្ត្រកុំព្យូទ័រ (វគ្គបំប៉នគណិតវិទ្យា)",
        slug: "software-engineering",
        fitLevel: "bridge-needed",
        fitReasonEn: "Accessible at select private universities, but requires supplementary foundation-year math courses.",
        fitReasonKm: "អាចចូលរៀនបាននៅសាកលវិទ្យាល័យឯកជនមួយចំនួន ប៉ុន្តែត្រូវរៀនបំប៉នគណិតវិទ្យាបន្ថែមនៅឆ្នាំទីមួយ។",
        universitiesEn: "CADT (Foundation), Private Universities",
        universitiesKm: "CADT (វគ្គត្រៀម), សាកលវិទ្យាល័យឯកជន",
        typicalFee: "$1,200 – $2,500/yr",
      });
    }

    return matches;
  }, [selectedStream, selectedSubjects, selectedBudget]);

  // Tailored BACII-specific FAQ items
  const baciiFaqs = useMemo<FaqItem[]>(() => {
    return [
      {
        id: "faq-social-to-tech",
        question: isKm
          ? "តើខ្ញុំអាចរៀនផ្នែក IT ឬវិទ្យាសាស្ត្រកុំព្យូទ័របានទេ ប្រសិនបើខ្ញុំរៀនថ្នាក់សង្គម?"
          : "Can I study Computer Science or IT if I graduated from the Social Science Stream?",
        answer: isKm
          ? "អាចបាន! សាកលវិទ្យាល័យរដ្ឋដូចជា ITC និង RUPP ដេប៉ាតឺម៉ង់ IT តម្រូវឱ្យប្រឡងគណិតវិទ្យាវិទ្យាសាស្ត្រ ប៉ុន្តែសាកលវិទ្យាល័យឯកជន និងវិទ្យាស្ថានបច្ចេកវិទ្យាមួយចំនួន (ដូចជា CADT ក្នុងវគ្គត្រៀម ឬ Paragon IU) អនុញ្ញាតឱ្យសិស្សថ្នាក់សង្គមចូលរៀនបាន ដោយតម្រូវឱ្យរៀនវគ្គបំប៉នគណិតវិទ្យា និងមូលដ្ឋានកូដនៅឆ្នាំទីមួយ (Foundation Year)។"
          : "Yes! While selective public institutions like ITC and CADT strictly test advanced calculus and physics in their competitive entrance concourses, several accredited universities accept Social Stream students with mandatory foundation-year bridging math classes.",
      },
      {
        id: "faq-concours-meaning",
        question: isKm
          ? "តើអ្វីទៅជា 'ការប្រឡងប្រជែងចូលរៀន (Concourse)' ហើយសាកលវិទ្យាល័យណាខ្លះដែលតម្រូវ?"
          : "What is an Entrance Concourse (ការប្រឡងប្រជែង) and which Cambodian universities require it?",
        answer: isKm
          ? "ការប្រឡងប្រជែង (Concours d'Entrée) គឺជាការប្រឡងជ្រើសរើសសមត្ថភាពបន្ថែមបន្ទាប់ពីជាប់បាក់ឌុប ដើម្បីចូលរៀននៅមហាវិទ្យាល័យរដ្ឋល្បីៗដែលមានការប្រកួតប្រជែងខ្ពស់ ដូចជា វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (ITC), សាកលវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល (UHS), វិទ្យាស្ថានបច្ចេកវិទ្យាឌីជីថលកម្ពុជា (CADT), និងដេប៉ាតឺម៉ង់ព័ត៌មានវិទ្យា/ភាសាបរទេសនៅ RUPP។"
          : "An Entrance Concourse is a competitive post-BACII examination required by top selective state and specialized institutions in Cambodia (such as ITC Techno, UHS Medical School, CADT Digital Talent, and RUPP CS/IFL). Admission is determined by exam ranking rather than high school grades alone.",
      },
      {
        id: "faq-moeys-scholarships",
        question: isKm
          ? "តើអាហារូបករណ៍រដ្ឋ MoEYS ដំណើរការយ៉ាងដូចម្តេច ហើយនិទ្ទេសណាខ្លះមានសិទ្ធិ?"
          : "How do MoEYS State Scholarships work and which BACII grades qualify?",
        answer: isKm
          ? "និទ្ទេស A មានឱកាសខ្ពស់ក្នុងការប្រកួតប្រជែងសម្រាប់អាហារូបករណ៍រដ្ឋ ប៉ុន្តែក្រសួងអប់រំ និងសាកលវិទ្យាល័យនីមួយៗប្រកាសកូតា និងលក្ខខណ្ឌដោយឡែកពីគ្នា។ សិស្សគ្រប់និទ្ទេសគួរផ្ទៀងផ្ទាត់សេចក្តីជូនដំណឹងផ្លូវការមុនពេលដាក់ពាក្យ។"
          : "Grade A students are often competitive for state scholarships, but MoEYS and each university announce their own quotas and conditions. Students of every grade should verify the current official notice before applying.",
      },
      {
        id: "faq-budget-factoring",
        question: isKm
          ? "តើប្រព័ន្ធ OrienX ពិចារណាលើលទ្ធភាពហិរញ្ញវត្ថុគ្រួសារខ្ញុំយ៉ាងដូចម្តេច?"
          : "How does OrienX factor in my family's financial situation?",
        answer: isKm
          ? "ឧបករណ៍នេះប្រើថវិការបស់អ្នកដើម្បីបង្ហាញបរិបទថ្លៃសិក្សាប្រចាំឆ្នាំ។ វាមិនមែនជាការធានាអាហារូបករណ៍ទេ។ សូមផ្ទៀងផ្ទាត់ថ្លៃសិក្សា និងលក្ខខណ្ឌអាហារូបករណ៍ជាមួយសាកលវិទ្យាល័យនីមួយៗ។"
          : "The simulator uses your budget to frame typical annual tuition context. It does not guarantee a scholarship. Always verify current fees and scholarship conditions with each university.",
      },
      {
        id: "faq-matching-weight",
        question: isKm
          ? "តើខ្ញុំគួរប្រើឧបករណ៍ពិសោធន៍លក្ខខណ្ឌនេះយ៉ាងដូចម្តេច?"
          : "How should I use this prerequisite simulator?",
        answer: isKm
          ? "ចាត់ទុកវាជាឧបករណ៍ណែនាំ មិនមែនជាពិន្ទុចូលរៀនផ្លូវការទេ។ វាជួយអ្នកប្រៀបធៀបថ្នាក់ មុខវិជ្ជាពូកែ និងថវិកាជាមួយបរិបទផ្លូវសិក្សាទូទៅ។ ការសម្រេចចិត្តចូលរៀនជាកម្មសិទ្ធិរបស់សាកលវិទ្យាល័យនីមួយៗ។"
          : "Treat it as a guidance tool, not a formal admission score. It helps you compare your stream, subjects, and budget with common pathway context. Final admission decisions belong to each university.",
      },
    ];
  }, [isKm]);

  // Register GSAP ScrollTrigger animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Hero sequence
      gsap.fromTo(
        ".gsap-bacii-hero-anim",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".gsap-bacii-inspector-card",
        { opacity: 0, scale: 0.95, y: 35 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.0,
          delay: 0.2,
          ease: "power3.out",
        }
      );

      // Section 1: Prerequisite Matrix Cards
      gsap.fromTo(
        ".gsap-bacii-matrix-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-bacii-matrix-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Section 3: BACII grade tiers
      gsap.fromTo(
        ".gsap-bacii-tiers-head",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-bacii-tiers-head",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        ".gsap-bacii-tier-card",
        { opacity: 0, y: 36, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-bacii-tier-grid",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      // Section 2: Simulator & Benchmarks
      gsap.fromTo(
        ".gsap-bacii-honors-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-bacii-honors-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-[#111965] selection:bg-[#F7CE4D] selection:text-[#111965] pb-24">
      {/* =========================================================================
          HERO SECTION (SPLIT 2-COLUMN WITH SEAMLESS SKYLINE BACKDROP)
          ========================================================================= */}
      <section className="hero-screen relative w-full overflow-hidden bg-gradient-to-b from-[#080D2B] via-[#0F1754] to-[#0A0F36] text-white border-b border-white/10 py-12 sm:py-16 lg:py-20 select-none">
        {/* Subtle Ambient Illumination */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(247,206,77,0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/4 right-1/6 w-[400px] h-[400px] rounded-full bg-[#1B6EF3]/12 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/6 w-[400px] h-[400px] rounded-full bg-[#F7CE4D]/10 blur-[120px] pointer-events-none" />

        {/* Seamless Cambodian Campuses Skyline Backdrop */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden h-[380px] sm:h-[450px] lg:h-[500px] z-0"
          style={{
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 100%)",
            maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 100%)",
          }}
        >
          <Image
            src="/images/cambodia-campuses-skyline-seamless.webp"
            alt="Cambodian University Campuses Backdrop"
            fill
            unoptimized
            priority
            className="object-cover object-bottom opacity-15 sm:opacity-20"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Subtitle, Trust Badges & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Category / Verified Pill */}
              <div className="gsap-bacii-hero-anim inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30 backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>
                  {isKm
                    ? "ស្តង់ដារក្រសួងអប់រំ MoEYS & លក្ខខណ្ឌតម្រូវសាកលវិទ្យាល័យ"
                    : "MoEYS Grade 12 National Exam & Higher Ed Prerequisite Engine"}
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h1 className="gsap-bacii-hero-anim text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {isKm ? (
                    <>
                      ផ្ទៀងផ្ទាត់ថ្នាក់បាក់ឌុប <br className="hidden sm:inline" />
                      <span className="text-[#F7CE4D]">& លក្ខខណ្ឌតម្រូវសាកលវិទ្យាល័យ</span>
                    </>
                  ) : (
                    <>
                      Verify Your BACII Stream <br className="hidden sm:inline" />
                      <span className="text-[#F7CE4D]">& University Prerequisites</span>
                    </>
                  )}
                </h1>
                <p className="gsap-bacii-hero-anim text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed pt-1">
                  {isKm
                    ? "ផ្ទៀងផ្ទាត់ភាពត្រូវគ្នារវាងថ្នាក់វិទ្យាសាស្ត្រពិត ឬវិទ្យាសាស្ត្រសង្គម មុខវិជ្ជាពូកែ និងកម្រិតថវិកាសិក្សា ជាមួយលក្ខខណ្ឌចូលរៀនផ្លូវការនៃសាកលវិទ្យាល័យជាង ៥០ នៅកម្ពុជា ដើម្បីជៀសវាងការជ្រើសរើសខុសជំនាញ។"
                    : "Compare your Grade 12 track, strongest subjects, and tuition budget with common admission context for Cambodian university majors."}
                </p>
              </div>

              {/* Action CTAs */}
              <div className="gsap-bacii-hero-anim pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/assessments"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-[0_4px_24px_rgba(247,206,77,0.3)] hover:shadow-[0_6px_28px_rgba(247,206,77,0.45)] transition-all active:scale-98 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#111965]" />
                  <span>
                    {isKm
                      ? "រកមើលការវាយតម្លៃឥតគិតថ្លៃ"
                      : "Explore Free Assessments"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#111965]" />
                </Link>

                <a
                  href="#stream-comparison"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md shadow-sm transition-all text-center cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#F7CE4D]" />
                  <span>{isKm ? "ប្រៀបធៀបថ្នាក់ទាំងពីរ" : "Compare Streams"}</span>
                </a>
              </div>

              {/* Trust & Localized Metrics */}
              <div className="gsap-bacii-hero-anim pt-4 border-t border-white/10 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                  <span>{isKm ? "២ ថ្នាក់ (វិទ្យាសាស្ត្រ & សង្គម)" : "2 Tracks (Science & Social)"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                  <span>{isKm ? "១០ មុខវិជ្ជាស្នូលបាក់ឌុប" : "10 Core Exam Subjects"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                  <span>
                    {isKm
                      ? `សាកលវិទ្យាល័យកម្ពុជា ${STATIC_UNIVERSITIES.length}`
                      : `${STATIC_UNIVERSITIES.length} Cambodian Institutions`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                  <span>{isKm ? "ឥតគិតថ្លៃ ១០០%" : "100% Free for Students"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Hero Stream Quick-Inspector Card */}
            <div className="gsap-bacii-inspector-card lg:col-span-5">
              <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] space-y-5">
                {/* Card Header & Stream Switcher */}
                <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    <Compass className="w-4 h-4 text-[#F7CE4D]" />
                    <span>{isKm ? "មើលទិដ្ឋភាពថ្នាក់បាក់ឌុប" : "Quick Stream Inspector"}</span>
                  </div>
                  <div className="flex bg-black/30 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setHeroStream("science")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        heroStream === "science"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {isKm ? "វិទ្យាសាស្ត្រ" : "Science"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroStream("social")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        heroStream === "social"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {isKm ? "សង្គម" : "Social"}
                    </button>
                  </div>
                </div>

                {/* Dynamic Stream Content */}
                {heroStream === "science" ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[12.5px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-1">
                          STEM Track • ថ្នាក់វិទ្យាសាស្ត្រពិត
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          {STREAM_PROFILES.science.nameEn}
                        </h3>
                      </div>
                      <span className="text-2xl">🔬</span>
                    </div>

                    {/* Entrance Concourses */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                        <span>{isKm ? "ការប្រឡងប្រជែងចូលរៀនស្នូល" : "Major Competitive Entrance Concourses"}</span>
                        <span className="text-[12.5px] text-blue-300 font-mono">MoEYS</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-200">
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">ITC Techno Concours</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">CADT Techo Talent Exam</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">UHS Medical Concours</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">RUPP CS Entrance Test</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Majors Unlocked */}
                    <div className="space-y-1.5">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-slate-300">
                        {isKm ? "ជំនាញបើកទូលាយដោយផ្ទាល់" : "Direct Unlocked Pathways"}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
                          Software & AI
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
                          Civil Engineering
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
                          Medicine & Pharmacy
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
                          Robotics
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[12.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
                          Humanities & Business • ថ្នាក់វិទ្យាសាស្ត្រសង្គម
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          {STREAM_PROFILES.social.nameEn}
                        </h3>
                      </div>
                      <span className="text-2xl">📚</span>
                    </div>

                    {/* Entrance Concourses */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                        <span>{isKm ? "ការប្រឡងប្រជែងចូលរៀនស្នូល" : "Major Competitive Entrance Concourses"}</span>
                        <span className="text-[12.5px] text-emerald-300 font-mono">MoEYS</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-200">
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">RULE Law Concours</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">IISPP International Relations</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">DMC Media & Journalism</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">NUM FinTech Track</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Majors Unlocked */}
                    <div className="space-y-1.5">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-slate-300">
                        {isKm ? "ជំនាញបើកទូលាយដោយផ្ទាល់" : "Direct Unlocked Pathways"}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                          Law & Jurisprudence
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                          International Relations
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                          FinTech & Banking
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                          Digital Media
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Jump to Interactive Simulator below */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {isKm ? "ចង់សាកល្បងមុខវិជ្ជាជាក់លាក់របស់អ្នក?" : "Want to test your exact subjects?"}
                  </span>
                  <a
                    href="#live-simulator"
                    className="text-[#F7CE4D] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isKm ? "តេស្តក្នុងម៉ាស៊ីនពិសោធន៍" : "Try Simulator"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: SCIENCE STREAM VS SOCIAL STREAM COMPARISON (BENTO SHOWCASE)
          ========================================================================= */}
      <section id="stream-comparison" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111965]/5 border border-[#111965]/10 text-[12px] font-bold text-[#111965] tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5 text-[#F7CE4D]" />
            <span>{isKm ? "ការប្រៀបធៀបថ្នាក់បាក់ឌុបទាំងពីរ" : "High School Stream Comparison"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
            {isKm
              ? "ថ្នាក់វិទ្យាសាស្ត្រពិត ទល់នឹង ថ្នាក់វិទ្យាសាស្ត្រសង្គម"
              : "Science Stream vs. Social Science Stream"}
          </h2>
          <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
            {isKm
              ? "ស្វែងយល់ពីភាពខុសគ្នានៃមុខវិជ្ជាស្នូល ការប្រឡងប្រជែងចូលរៀន និងឱកាសជំនាញដែលបើកទូលាយសម្រាប់ថ្នាក់នីមួយៗ។"
              : "Understand how your Grade 12 stream directly governs which university majors and competitive entrance exams you qualify for."}
          </p>
        </div>

        <div className="gsap-bacii-matrix-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SCIENCE STREAM CARD */}
          <div className="gsap-bacii-matrix-card rounded-3xl border-2 border-blue-200 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(37,99,235,0.06)] hover:shadow-[0_8px_20px_-16px_rgba(17,25,101,0.22)] transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full pointer-events-none" />
            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 mb-2 border border-blue-200">
                    STEM Pathway • ថ្នាក់វិទ្យាសាស្ត្រពិត
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#111965]">
                    {STREAM_PROFILES.science.nameEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                    {isKm ? STREAM_PROFILES.science.shortDescKm : STREAM_PROFILES.science.shortDescEn}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                  <Microscope className="w-7 h-7" />
                </div>
              </div>

              {/* Core Subjects */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "មុខវិជ្ជាស្នូលប្រឡងបាក់ឌុប" : "Core BACII Subjects"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(isKm ? STREAM_PROFILES.science.coreSubjectsKm : STREAM_PROFILES.science.coreSubjectsEn).map((sub, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Entrance Exams */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "ការប្រឡងប្រជែងចូលរៀនស្នូល" : "Major Competitive Entrance Concourses"}
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {(isKm ? STREAM_PROFILES.science.keyEntranceExamsKm : STREAM_PROFILES.science.keyEntranceExamsEn).map((exam, idx) => (
                    <li key={idx} className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{exam}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample High-Fit Majors */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "ជំនាញសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុត" : "Direct University Majors Unlocked"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STREAM_PROFILES.science.topMajors.map((m, idx) => (
                    <Link
                      key={idx}
                      href={`/majors/${m.slug}`}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all group block"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate pr-1">
                          {isKm ? m.nameKm : m.nameEn}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <span className="text-[12.5px] text-slate-500 font-semibold mt-0.5 block truncate">Univ: {m.univ}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL SCIENCE STREAM CARD */}
          <div className="gsap-bacii-matrix-card rounded-3xl border-2 border-emerald-200 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(5,150,105,0.06)] hover:shadow-[0_8px_20px_-16px_rgba(17,25,101,0.22)] transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full pointer-events-none" />
            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 mb-2 border border-emerald-200">
                    Humanities & Business • ថ្នាក់វិទ្យាសាស្ត្រសង្គម
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#111965]">
                    {STREAM_PROFILES.social.nameEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                    {isKm ? STREAM_PROFILES.social.shortDescKm : STREAM_PROFILES.social.shortDescEn}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25">
                  <Scale className="w-7 h-7" />
                </div>
              </div>

              {/* Core Subjects */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "មុខវិជ្ជាស្នូលប្រឡងបាក់ឌុប" : "Core BACII Subjects"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(isKm ? STREAM_PROFILES.social.coreSubjectsKm : STREAM_PROFILES.social.coreSubjectsEn).map((sub, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Entrance Exams */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "ការប្រឡងប្រជែងចូលរៀនស្នូល" : "Major Competitive Entrance Concourses"}
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {(isKm ? STREAM_PROFILES.social.keyEntranceExamsKm : STREAM_PROFILES.social.keyEntranceExamsEn).map((exam, idx) => (
                    <li key={idx} className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{exam}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample High-Fit Majors */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "ជំនាញសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុត" : "Direct University Majors Unlocked"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STREAM_PROFILES.social.topMajors.map((m, idx) => (
                    <Link
                      key={idx}
                      href={`/majors/${m.slug}`}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all group block"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate pr-1">
                          {isKm ? m.nameKm : m.nameEn}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <span className="text-[12.5px] text-slate-500 font-semibold mt-0.5 block truncate">Univ: {m.univ}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Social to Tech Bridge Callout */}
        <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-indigo-200/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#111965] text-[#F7CE4D] flex items-center justify-center shrink-0 shadow-md">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-black text-[#111965]">
                {isKm
                  ? "តើអ្នករៀនថ្នាក់សង្គមអាចប្តូរមករៀនបច្ចេកវិទ្យា (IT & Software) បានទេ?"
                  : "Can a Social Science Student Pivot to Computer Science in Cambodia?"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {isKm
                  ? "បានយ៉ាងពិតប្រាកដ! សាកលវិទ្យាល័យឯកជន និងវិទ្យាស្ថានបច្ចេកវិទ្យាឈានមុខ (ដូចជា CADT និង Paragon IU) មានវគ្គបំប៉នគណិតវិទ្យា និងមូលដ្ឋានសរសេរកូដនៅឆ្នាំទីមួយ ដើម្បីជួយសិស្សថ្នាក់សង្គមដែលមានបំណងប្រាថ្នារៀន IT ទទួលបានជោគជ័យ។"
                  : "Absolutely! Leading private universities and digital academies (such as CADT Foundation Year and Paragon IU) offer specialized bridging calculus and coding foundation classes to help motivated Social stream students excel in tech careers."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: INTERACTIVE PREREQUISITE SIMULATOR WIDGET
          ========================================================================= */}
      <section id="live-simulator" className="py-16 bg-white border-y border-[#E6E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>{isKm ? "សាកល្បងផ្ទៀងផ្ទាត់ដោយផ្ទាល់" : "Live Prerequisite Simulator"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
              {isKm
                ? "ឧបករណ៍ពិសោធន៍លក្ខខណ្ឌតម្រូវសាកលវិទ្យាល័យ"
                : "Test Your Stream & Subject Compatibility"}
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
              {isKm
                ? "ជ្រើសរើសថ្នាក់បាក់ឌុប មុខវិជ្ជាពូកែ និងថវិកាសិក្សា ដើម្បីមើលជំនាញសាកលវិទ្យាល័យដែលត្រូវគ្នានឹងលក្ខខណ្ឌភ្លាមៗ។"
                : "Select your BACII stream, strongest subjects, and tuition budget to see instantaneous university admission compatibility."}
            </p>

            {/* Quick Presets Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider pr-1">
                {isKm ? "ជម្រើសរហ័ស:" : "Quick Presets:"}
              </span>
              {SIMULATOR_PRESETS.map((preset) => {
                const PresetIcon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    <PresetIcon className="h-3.5 w-3.5 text-[#111965]" />
                    <span>{isKm ? preset.labelKm : preset.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT CONTROL PANEL (5 cols) */}
            <div className="lg:col-span-5 bg-[#FAFBFD] rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              {/* Step 1: Stream Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>1. {isKm ? "ជ្រើសរើសថ្នាក់បាក់ឌុបរបស់អ្នក" : "Select Your BACII Track"}</span>
                  <span className="text-[#2563EB] text-[12px] font-bold">{selectedStream.toUpperCase()} STREAM</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedStream("science")}
                    className={`py-3.5 px-3 rounded-2xl border text-xs sm:text-sm font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedStream === "science"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Microscope className="h-4 w-4" />
                      {isKm ? "ថ្នាក់វិទ្យាសាស្ត្រ" : "Science Stream"}
                    </span>
                    <span className="text-[12.5px] font-semibold opacity-85">STEM Track</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStream("social")}
                    className={`py-3.5 px-3 rounded-2xl border text-xs sm:text-sm font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedStream === "social"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      {isKm ? "ថ្នាក់សង្គម" : "Social Stream"}
                    </span>
                    <span className="text-[12.5px] font-semibold opacity-85">Humanities Track</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Strongest Subjects */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                  <span>
                    2.{" "}
                    {isKm ? "ជ្រើសរើសមុខវិជ្ជាពូកែ" : "Select Strongest Subjects"}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    {selectedSubjects.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSubjects([])}
                        className="normal-case rounded-full px-2 py-0.5 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#111965]"
                      >
                        {isKm ? "សម្អាត" : "Clear"}
                      </button>
                    )}
                    <span className="text-xs text-blue-600 font-bold">
                      {selectedSubjects.length}/4 {isKm ? "បានរើស" : "selected"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SUBJECTS.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleSubject(sub.id)}
                        aria-pressed={isSelected}
                        disabled={!isSelected && selectedSubjects.length >= 4}
                        className={`text-left p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-[#111965] text-white border-[#111965] shadow-xs cursor-pointer"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        }`}
                      >
                        <span className="truncate pr-1">{isKm ? sub.labelKm : sub.labelEn}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#F7CE4D] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Tuition Budget Slider */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500">
                  <span>3. {isKm ? "ថវិកាសិក្សាប្រចាំឆ្នាំ (USD)" : "Annual Tuition Budget"}</span>
                  <span className="text-base font-black text-[#111965]">${selectedBudget} / yr</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="5000"
                  step="100"
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(Number(e.target.value))}
                  className="w-full accent-[#111965] h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[12px] text-slate-500 font-bold">
                  <span>$400 (State Univ)</span>
                  <span>$1,500 (Digital Tech)</span>
                  <span>$5,000+ (Dual)</span>
                </div>
              </div>


            </div>

            {/* RIGHT RESULTS PANEL (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-black text-[#111965] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>
                    {isKm
                      ? `ជំនាញត្រូវគ្នានឹងលក្ខខណ្ឌសិក្សា (${simulatedMatches.length})`
                      : `Admission-Compatible Majors (${simulatedMatches.length})`}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {selectedStream === "science" ? "Science Stream Active" : "Social Stream Active"}
                </span>
              </div>

              <div className="space-y-3.5">
                {simulatedMatches.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F2FA] text-[#111965]">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#111965]">
                        {selectedSubjects.length === 0
                          ? isKm
                            ? "ជ្រើសរើសមុខវិជ្ជាពូកែរបស់អ្នក"
                            : "Choose your strongest subjects"
                          : isKm
                            ? "មិនទាន់ឃើញជំនាញដែលត្រូវគ្នាទេ"
                            : "No direct match yet"}
                      </h4>
                      <p className="mx-auto max-w-sm text-xs leading-relaxed text-[#68708A]">
                        {selectedSubjects.length === 0
                          ? isKm
                            ? "ជ្រើសរើសរហូតដល់ ៤ មុខវិជ្ជា ដើម្បីមើលជំនាញសាកលវិទ្យាល័យដែលត្រូវគ្នា។"
                            : "Select up to 4 subjects to see compatible university majors."
                          : isKm
                            ? "សាកល្បងបន្ថែមគណិតវិទ្យា រូបវិទ្យា ឬមុខវិជ្ជាផ្សេងទៀត ដើម្បីមើលជម្រើសបន្ថែម។"
                            : "Try adding Math, Physics, or another subject to see more pathways."}
                      </p>
                    </div>
                    {selectedSubjects.length === 0 && (
                      <button
                        type="button"
                        onClick={() => applyPreset(SIMULATOR_PRESETS[0])}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 py-2 text-xs font-bold text-[#111965] transition-colors hover:border-[#111965]/25 hover:bg-white"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[#D4A017]" />
                        {isKm ? "សាកល្បងជម្រើសគំរូ" : "Try a sample preset"}
                      </button>
                    )}
                  </div>
                ) : (
                  simulatedMatches.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-[0_8px_20px_-16px_rgba(17,25,101,0.22)] hover:border-blue-300 transition-all space-y-3.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-extrabold text-[#111965]">
                            {isKm ? item.majorKm : item.majorEn}
                          </h4>
                          {item.fitLevel === "high" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[12.5px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{isKm ? "ត្រូវគ្នាខ្លាំង" : "Strong match"}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[12.5px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>{isKm ? "ទាមទាររៀនបំប៉ន" : "Bridge Math Needed"}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                          {isKm ? item.fitReasonKm : item.fitReasonEn}
                        </p>
                      </div>
                      <Link
                        href={`/majors/${item.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-800 shrink-0 self-start sm:self-center"
                      >
                        <span>{isKm ? "មើលលម្អិត" : "Details"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <School className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isKm ? item.universitiesKm : item.universitiesEn}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700 font-black">
                        <Coins className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.typicalFee}</span>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: CAMBODIAN TUITION FEE BENCHMARKS
          ========================================================================= */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>{isKm ? "តារាងតម្លៃសិក្សាជាក់ស្តែងនៅកម្ពុជា" : "Cambodian Tuition Benchmarks"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
            {isKm ? "តម្លាភាពតម្លៃសិក្សានៅសាកលវិទ្យាល័យ" : "Verified 4-Year Tuition Realities"}
          </h2>
          <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
            {isKm
              ? "តម្លៃសិក្សានៅកម្ពុជាខុសគ្នាពី ៥០០ ដុល្លារ រហូតដល់ ៩,០០០ ដុល្លារក្នុងមួយឆ្នាំ។ ពិនិត្យថវិកាពិតប្រាកដមុននឹងសម្រេចចិត្តចុះឈ្មោះ។"
              : "Compare real annual tuition fees across public state, specialized technology, and international institutions before applying."}
          </p>
        </div>

        <div className="gsap-bacii-honors-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {TUITION_BENCHMARKS.map((t, idx) => (
            <div
              key={idx}
              className="gsap-bacii-honors-card rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs hover:shadow-[0_8px_20px_-16px_rgba(17,25,101,0.22)] transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${t.tagBg}`}>
                  {isKm ? t.tierKm : t.tierEn}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#111965]">{t.rangeUsd}</div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {isKm ? t.descKm : t.descEn}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "ស្ថាប័នតំណាង" : "Representative Institutions"}
                </div>
                <div className="space-y-1.5">
                  {t.universities.map((u, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span>{u}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: MoEYS BACII GRADE CUTOFFS & PRIVILEGES
          ========================================================================= */}
      <section className="py-16 bg-[#FAFBFD] dark:bg-[#0B0F19] border-y border-[#E6E8F0] dark:border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="gsap-bacii-tiers-head text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>{isKm ? "កម្រិតនិទ្ទេសបាក់ឌុប & អត្ថប្រយោជន៍" : "MoEYS Grade Cutoffs & Honors"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
              {isKm ? "អត្ថប្រយោជន៍អាហារូបករណ៍តាមនិទ្ទេសបាក់ឌុប" : "What Your BACII Grade Unlocks"}
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
              {isKm
                ? "អត្ថន័យទូទៅនៃនិទ្ទេសបាក់ឌុបសម្រាប់ការដាក់ពាក្យចូលរៀន។ សាកលវិទ្យាល័យនីមួយៗកំណត់លក្ខខណ្ឌដោយខ្លួនឯង។"
                : "What each BACII grade generally means for university applications. Every institution sets its own cutoffs and conditions."}
            </p>
          </div>

          <div className="gsap-bacii-tier-grid mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
            {BACII_GRADE_TIERS.map((tier, idx) => {
              return (
                <div
                  key={idx}
                  className="gsap-bacii-tier-card relative flex flex-col [--card:#FFFFFF] [--card-band:#F1F4FA] [--card-pill:#E7ECF5] [--card-ink:#111965] [--card-body:#3D4560] [--card-muted:#5A6482] [--card-faint:#7A829B] [--card-line:rgba(17,25,101,0.12)] [--card-shadow:0_20px_40px_rgba(17,25,101,0.10)] dark:[--card:#141A26] dark:[--card-band:#1B2231] dark:[--card-pill:#232B3C] dark:[--card-ink:#F8FAFC] dark:[--card-body:#CBD5E1] dark:[--card-muted:#94A3B8] dark:[--card-faint:#7C8AA3] dark:[--card-line:rgba(255,255,255,0.10)] dark:[--card-shadow:0_26px_46px_rgba(0,0,0,0.5)]"
                >
                  {/*
                    Silhouette = two card-coloured surfaces. The notch is a gap
                    between them, so it shows the page through it (works in light
                    and dark themes, with no page-coloured overlay).
                  */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{ filter: "drop-shadow(var(--card-shadow))" }}
                  >
                    {/* shoulder: the tall left part of the top edge */}
                    <div
                      className="absolute left-0 top-0 h-[92px] w-[calc(100%-136px)] rounded-tl-[28px] rounded-tr-[40px] bg-[var(--card)]"
                      style={{
                        backgroundImage: `radial-gradient(140% 160% at 0% 0%, ${tier.accent}2B 0%, transparent 58%)`,
                      }}
                    >
                      <span
                        className="absolute -right-3 top-[44px] h-3 w-3"
                        style={{
                          background:
                            "radial-gradient(circle at 100% 0%, transparent 12px, var(--card) 12px)",
                        }}
                      />
                    </div>
                    {/* body: starts at the ledge, under the whole width */}
                    <div className="absolute inset-x-0 bottom-0 top-[56px] rounded-[28px] bg-[var(--card)]" />
                  </div>

                  {/* Band tag in the top-right notch */}
                  <div
                    className="absolute right-2.5 top-3 z-20 flex h-8 items-center rounded-full border px-2 sm:px-3"
                    style={
                      {
                        backgroundColor: `${tier.accent}14`,
                        borderColor: `${tier.accent}3D`,
                        "--pill-ink": tier.pillInk,
                        "--pill-ink-dark": PILL_INK_DARK[tier.pillInk] ?? "#E2E8F0",
                      } as React.CSSProperties
                    }
                  >
                    <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--pill-ink)] dark:text-[var(--pill-ink-dark)] sm:text-[10px] sm:tracking-[0.1em]">
                      {isKm ? tier.summaryKm : tier.summaryEn}
                    </span>
                  </div>

                  <div className="relative flex flex-1 flex-col">
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-[26px] font-extrabold leading-[1.08] tracking-[-0.02em] text-[var(--card-ink)] sm:text-[30px]">
                        {tier.grade}
                      </h3>

                      <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--card-faint)]">
                        {isKm ? "អត្ថន័យសម្រាប់ការដាក់ពាក្យ" : "What this means"}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {(isKm ? tier.notesKm : tier.notesEn).map((n, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[14px] leading-[1.55] text-[var(--card-body)]"
                          >
                            <Check
                              className="mt-0.5 h-4 w-4 shrink-0"
                              style={{ color: tier.accent }}
                            />
                            <span>{n}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto rounded-b-[28px] border-t border-[var(--card-line)] bg-[var(--card-band)] p-4">
                      <Link
                        href="/scholarships"
                        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#F7CE4D] to-[#FFE49A] px-4 py-2.5 text-[12.5px] font-bold text-[#0A0F2C] shadow-[0_0_26px_rgba(247,206,77,0.4)] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7CE4D]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0C10]"
                      >
                        <span>{isKm ? "ពិនិត្យអាហារូបករណ៍តាមសាលា" : "See what each university offers"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FREQUENTLY ASKED QUESTIONS (SHARED HOME COMPONENT)
          ========================================================================= */}
      <FaqSection
        id="bacii-faq"
        eyebrow={isKm ? "ការណែនាំ & សំណួរទាក់ទងនឹងបាក់ឌុប" : "BACII & Admission Guidance"}
        title={isKm ? "សំណួរដែលសួរញឹកញាប់អំពីថ្នាក់បាក់ឌុប" : "Frequently Asked Questions About BACII"}
        subtitle={
          isKm
            ? "ស្វែងយល់បន្ថែមអំពីភាពខុសគ្នានៃថ្នាក់បាក់ឌុប ការប្រឡងប្រជែងចូលរៀន និងអាហារូបករណ៍រដ្ឋ។"
            : "Learn how high school streams govern university admissions, entrance exams, and MoEYS state scholarship quotas."
        }
        items={baciiFaqs}
      />

      {/* =========================================================================
          SECTION 6: BOTTOM CONVERSION CTA BANNER (SHARED HOME COMPONENT)
          ========================================================================= */}
      <CtaBanner
        eyebrow={isKm ? "ឥតគិតថ្លៃ ១០០% សម្រាប់សិស្សវិទ្យាល័យ & និស្សិត" : "100% Free For All Cambodian Students"}
        title={
          isKm
            ? "ត្រៀមខ្លួនផ្ទៀងផ្ទាត់ថ្នាក់បាក់ឌុប និងលក្ខខណ្ឌសាកលវិទ្យាល័យហើយឬនៅ?"
            : "Ready to Validate Your High School Stream & Admission Path?"
        }
        subtitle={
          isKm
            ? "ចំណាយពេលត្រឹមតែ ៥ នាទីដើម្បីកំណត់មុខវិជ្ជាពូកែ ថវិកាសិក្សា និងទីតាំង ដើម្បីឱ្យប្រព័ន្ធ AI ផ្គូផ្គងសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុត។"
            : "Spend only 5 minutes setting your strongest subjects, tuition budget, and campus preferences to unlock high-precision university recommendations."
        }
        primaryButtonText={
          isKm ? "រកមើលការវាយតម្លៃឥតគិតថ្លៃ" : "Explore Free Assessments"
        }
        primaryButtonHref="/assessments"
        secondaryButtonText={isKm ? "មើលតេស្តវាយតម្លៃទាំងអស់" : "View All Assessments"}
        secondaryButtonHref="/assessments"
        mascotSpeech={isKm ? "តោះស្វែងរកសាកលវិទ្យាល័យដែលត្រូវនឹងថ្នាក់របស់អ្នក! 🎓" : "Let's find the best university for your stream! 🎓"}
        badges={[
          {
            icon: <Clock className="w-4 h-4 text-[#F7CE4D] shrink-0" />,
            label: isKm ? "តេស្តត្រឹម ៥ នាទី" : "5-Min Diagnostic",
          },
          {
            icon: <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />,
            label: isKm
              ? `សាកលវិទ្យាល័យកម្ពុជា ${STATIC_UNIVERSITIES.length}`
              : `${STATIC_UNIVERSITIES.length} Cambodian Univs`,
          },
          {
            icon: <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />,
            label: isKm ? "ស្តង់ដារក្រសួងអប់រំ MoEYS" : "MoEYS Criteria",
          },
        ]}
        trustText={
          isKm
            ? "ផ្ទៀងផ្ទាត់តាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS) និងទិន្នន័យថ្លៃសិក្សាផ្លូវការ"
            : "Validated according to official MoEYS standards and verified tuition data"
        }
      />
    </div>
  );
}
