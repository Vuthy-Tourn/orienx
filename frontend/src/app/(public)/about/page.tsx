"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Award,
  Building2,
  HeartHandshake,
  TrendingUp,
  HardHat,
  ChevronDown,
  FileCheck,
  Check,
  Briefcase,
  BadgeCheck,
  Target,
  School,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";

// =========================================================================
// 6 Holland RIASEC Framework Reference Data (Localized)
// =========================================================================
const RIASEC_DEEP_DATA: Record<
  string,
  {
    code: string;
    nameEn: string;
    nameKm: string;
    roleEn: string;
    roleKm: string;
    taglineEn: string;
    taglineKm: string;
    icon: any;
    themeColor: string;
    badgeBg: string;
    accentGlow: string;
    borderActive: string;
    strengths: { en: string; km: string }[];
    sampleMajors: { name: string; slug: string }[];
    sampleCareers: { en: string; km: string }[];
  }
> = {
  R: {
    code: "R",
    nameEn: "Realistic",
    nameKm: "ជាក់ស្តែង",
    roleEn: "The Practical Builder",
    roleKm: "អ្នកអនុវត្ត និងសាងសង់ជាក់ស្តែង",
    taglineEn: "Hands-on problem solving with tools, infrastructure, mechanics, and physical systems.",
    taglineKm: "ការដោះស្រាយបញ្ហាជាក់ស្តែងលើឧបករណ៍ រចនាសម្ព័ន្ធ មេកានិច និងប្រព័ន្ធរូបវន្ត។",
    icon: HardHat,
    themeColor: "#D97706",
    badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    accentGlow: "rgba(217, 119, 6, 0.15)",
    borderActive: "border-amber-500",
    strengths: [
      { en: "Spatial Reasoning", km: "ការយល់ដឹងអំពីលំហ" },
      { en: "Practical Troubleshooting", km: "ការដោះស្រាយបញ្ហាជាក់ស្តែង" },
      { en: "Physical Precision", km: "ភាពច្បាស់លាស់នៃរូបវន្ត" },
      { en: "Mechanical Aptitude", km: "ជំនាញមេកានិច និងវិស្វកម្ម" },
    ],
    sampleMajors: [
      { name: "Civil Engineering", slug: "civil-engineering" },
      { name: "Architecture", slug: "architecture" },
      { name: "Information Technology", slug: "information-technology" },
    ],
    sampleCareers: [
      { en: "Structural Civil Engineer", km: "វិស្វករសំណង់ស៊ីវិល" },
      { en: "BIM Specialist", km: "អ្នកឯកទេសគំរូព័ត៌មានអគារ (BIM)" },
      { en: "Network Infrastructure Lead", km: "ប្រធានគ្រប់គ្រងបណ្តាញហេដ្ឋារចនាសម្ព័ន្ធ" },
    ],
  },
  I: {
    code: "I",
    nameEn: "Investigative",
    nameKm: "ស្រាវជ្រាវ",
    roleEn: "The Analytical Thinker",
    roleKm: "អ្នកវិភាគ និងគិតស៊ីជម្រៅ",
    taglineEn: "Intellectual inquiry, algorithmic modeling, data science, and scientific discovery.",
    taglineKm: "ការស្រាវជ្រាវបែបបញ្ញា គំរូក្បួនដោះស្រាយ វិទ្យាសាស្ត្រទិន្នន័យ និងការស្វែងយល់វិទ្យាសាស្ត្រ។",
    icon: BrainCircuit,
    themeColor: "#2563EB",
    badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    accentGlow: "rgba(37, 99, 235, 0.15)",
    borderActive: "border-blue-500",
    strengths: [
      { en: "Algorithmic Logic", km: "តក្កវិជ្ជាក្បួនដោះស្រាយ" },
      { en: "Data Analysis & Modeling", km: "ការវិភាគ និងបង្កើតគំរូទិន្នន័យ" },
      { en: "Complex Problem Decomposition", km: "ការបំបែកបញ្ហាស្មុគស្មាញ" },
      { en: "Hypothesis Testing", km: "ការពិសោធន៍ និងតេស្តសម្មតិកម្ម" },
    ],
    sampleMajors: [
      { name: "Software Engineering & Computer Science", slug: "software-engineering" },
      { name: "Data Science & AI", slug: "data-science-ai" },
      { name: "Cybersecurity", slug: "cybersecurity" },
    ],
    sampleCareers: [
      { en: "Full-Stack Software Engineer", km: "វិស្វករកម្មវិធី Full-Stack" },
      { en: "AI/ML Research Scientist", km: "អ្នកវិទ្យាសាស្ត្រស្រាវជ្រាវ AI/ML" },
      { en: "Cyber Defense Analyst", km: "អ្នកវិភាគសន្តិសុខតាមប្រព័ន្ធអ៊ីនធឺណិត" },
    ],
  },
  A: {
    code: "A",
    nameEn: "Artistic",
    nameKm: "សិល្បៈ",
    roleEn: "The Creative Innovator",
    roleKm: "អ្នកច្នៃប្រឌិត និងការរចនា",
    taglineEn: "Creative intuition, digital product experience, aesthetic composition, and visual storytelling.",
    taglineKm: "ការច្នៃប្រឌិតសោភ័ណភាព បទពិសោធន៍ផលិតផលឌីជីថល UI/UX និងការរៀបចំរឿងរ៉ាវ។",
    icon: Sparkles,
    themeColor: "#9333EA",
    badgeBg: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    accentGlow: "rgba(147, 51, 234, 0.15)",
    borderActive: "border-purple-500",
    strengths: [
      { en: "Visual Aesthetics & UI/UX", km: "សោភ័ណភាពរូបភាព និង UI/UX" },
      { en: "User Empathy & Experience", km: "ការយល់ចិត្តអ្នកប្រើប្រាស់" },
      { en: "Conceptual Ideation", km: "ការបង្កើតគំនិតច្នៃប្រឌិតថ្មីៗ" },
      { en: "Brand Storytelling", km: "ការនិទានរឿងម៉ាកសញ្ញា" },
    ],
    sampleMajors: [
      { name: "Digital Marketing & Media", slug: "digital-marketing" },
      { name: "Architecture & Urban Design", slug: "architecture" },
    ],
    sampleCareers: [
      { en: "UI/UX Product Designer", km: "អ្នករចនាបទពិសោធន៍ផលិតផល UI/UX" },
      { en: "Creative Brand Director", km: "នាយកច្នៃប្រឌិតម៉ាកសញ្ញា" },
      { en: "Digital Multimedia Producer", km: "អ្នកផលិតប្រព័ន្ធផ្សព្វផ្សាយឌីជីថល" },
    ],
  },
  S: {
    code: "S",
    nameEn: "Social",
    nameKm: "សង្គម",
    roleEn: "The Empathetic Helper",
    roleKm: "អ្នកជួយ និងអភិវឌ្ឍមនុស្ស",
    taglineEn: "Interpersonal communication, educational guidance, community development, and collaborative mentorship.",
    taglineKm: "ទំនាក់ទំនងរវាងមនុស្ស ការអប់រំ ការអភិវឌ្ឍសហគមន៍ និងការតម្រង់ទិសប្រកបដោយការយល់ចិត្ត។",
    icon: HeartHandshake,
    themeColor: "#059669",
    badgeBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    accentGlow: "rgba(5, 150, 105, 0.15)",
    borderActive: "border-emerald-500",
    strengths: [
      { en: "Interpersonal Communication", km: "ទំនាក់ទំនងរវាងបុគ្គល" },
      { en: "Active Listening & Empathy", km: "ការស្តាប់ និងការយល់ចិត្តយ៉ាងស៊ីជម្រៅ" },
      { en: "Mentorship & Coaching", km: "ការបណ្តុះបណ្តាល និងតម្រង់ទិស" },
      { en: "Community Engagement", km: "ការកសាង និងជំរុញសហគមន៍" },
    ],
    sampleMajors: [
      { name: "International Relations", slug: "international-relations" },
      { name: "Education & Psychology", slug: "social-sciences" },
    ],
    sampleCareers: [
      { en: "Diplomatic Affairs Officer", km: "មន្ត្រីកិច្ចការការទូត" },
      { en: "Educational Guidance Counselor", km: "ទីប្រឹក្សាតម្រង់ទិសការអប់រំ" },
      { en: "NGO Program Development Lead", km: "ប្រធានអភិវឌ្ឍន៍កម្មវិធីអង្គការសង្គម" },
    ],
  },
  E: {
    code: "E",
    nameEn: "Enterprising",
    nameKm: "សហគ្រិន",
    roleEn: "The Strategic Leader",
    roleKm: "អ្នកដឹកនាំ និងយុទ្ធសាស្ត្រ",
    taglineEn: "Organizational leadership, entrepreneurial venture building, high-stakes negotiation, and growth.",
    taglineKm: "ការដឹកនាំស្ថាប័ន ការបង្កើតអាជីវកម្មថ្មីៗ ការចរចាពាណិជ្ជកម្ម និងការពង្រីកកំណើន។",
    icon: Award,
    themeColor: "#EA580C",
    badgeBg: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    accentGlow: "rgba(234, 88, 12, 0.15)",
    borderActive: "border-orange-500",
    strengths: [
      { en: "Strategic Persuasion", km: "ការបញ្ចុះបញ្ចូលបែបយុទ្ធសាស្ត្រ" },
      { en: "Risk Calculation & Management", km: "ការគ្រប់គ្រង និងវាយតម្លៃហានិភ័យ" },
      { en: "Executive Decision Making", km: "ការធ្វើសេចក្តីសម្រេចចិត្តថ្នាក់ដឹកនាំ" },
      { en: "Venture Leadership", km: "ភាពជាអ្នកដឹកនាំអាជីវកម្ម" },
    ],
    sampleMajors: [
      { name: "Business Administration & Management", slug: "business-administration" },
      { name: "Banking & Finance", slug: "banking-finance" },
    ],
    sampleCareers: [
      { en: "Tech Product Manager", km: "ប្រធានគ្រប់គ្រងផលិតផលបច្ចេកវិទ្យា" },
      { en: "Management Consultant", km: "ទីប្រឹក្សាគ្រប់គ្រងយុទ្ធសាស្ត្រ" },
      { en: "Startup Founder & CEO", km: "ស្ថាបនិក និងអគ្គនាយកអាជីវកម្ម" },
    ],
  },
  C: {
    code: "C",
    nameEn: "Conventional",
    nameKm: "ការិយាល័យ",
    roleEn: "The Systems Organizer",
    roleKm: "អ្នករៀបរយ និងប្រព័ន្ធទិន្នន័យ",
    taglineEn: "Methodical accuracy, regulatory compliance, financial audit, and institutional data workflows.",
    taglineKm: "ភាពត្រឹមត្រូវនៃទិន្នន័យ ការអនុលោមតាមច្បាប់ សវនកម្មហិរញ្ញវត្ថុ និងលំហូរការងាររៀបរយ។",
    icon: FileCheck,
    themeColor: "#475569",
    badgeBg: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    accentGlow: "rgba(71, 85, 105, 0.15)",
    borderActive: "border-slate-500",
    strengths: [
      { en: "Data Integrity & Precision", km: "ភាពត្រឹមត្រូវ និងសុចរិតភាពទិន្នន័យ" },
      { en: "Quality Assurance & Compliance", km: "ការធានាគុណភាព និងការអនុលោមច្បាប់" },
      { en: "Financial Workflow Rigor", km: "ភាពហ្មត់ចត់នៃលំហូរហិរញ្ញវត្ថុ" },
      { en: "Systematic Organization", km: "ការរៀបចំប្រព័ន្ធច្បាស់លាស់" },
    ],
    sampleMajors: [
      { name: "Banking & Finance", slug: "banking-finance" },
      { name: "Law & Public Policy", slug: "law" },
    ],
    sampleCareers: [
      { en: "Financial Compliance Auditor", km: "សវនករអនុលោមភាពហិរញ្ញវត្ថុ" },
      { en: "Credit Risk Analyst", km: "អ្នកវិភាគហានិភ័យឥណទាន" },
      { en: "Legal Policy Consultant", km: "ទីប្រឹក្សាគោលនយោបាយច្បាប់" },
    ],
  },
};

// Conversational Tara mascot advice tips
const TARA_ADVICE_TIPS = [
  {
    km: "ជ្រើសរើសជំនាញសិក្សា ត្រូវផ្អែកលើចំណុចខ្លាំងពិតប្រាកដ និងតម្រូវការទីផ្សារ មិនមែនគ្រាន់តែតាមមិត្តភក្តិឡើយ!",
    en: "Choose your university major based on your authentic analytical strengths and market demand, not peer pressure!",
  },
  {
    km: "តម្លៃសិក្សានៅសាកលវិទ្យាល័យរដ្ឋ និងឯកជនខុសគ្នាខ្លាំង។ ពិនិត្យថ្លៃសិក្សា ៤ ឆ្នាំពេញ មុននឹងសម្រេចចិត្តចុះឈ្មោះ!",
    en: "Tuition fees vary significantly between public state and private universities. Check the full 4-year cost before enrolling!",
  },
  {
    km: "និស្សិតកម្ពុជាជាច្រើនមិនដឹងថាខ្លួនឯងមានសិទ្ធិទទួលបានអាហារូបករណ៍ ១០០% ទេ! ពិនិត្យបញ្ជីអាហារូបករណ៍រដ្ឋ MoEYS និង CADT ឥឡូវនេះ!",
    en: "Many Cambodian students qualify for 100% full-ride scholarships without realizing it! Check our verified scholarship tracker!",
  },
];

// 4 Scientific Pillars
const SCIENTIFIC_PILLARS = [
  {
    number: "01",
    weight: "30%",
    titleEn: "Holland RIASEC Vocational Interests",
    titleKm: "ចំណាប់អារម្មណ៍អាជីព Holland RIASEC",
    descEn: "Anchored in John Holland's validated 6-dimensional vocational psychology, measuring how your authentic natural interests align with genuine day-to-day work tasks.",
    descKm: "ផ្អែកលើទ្រឹស្តីចិត្តវិទ្យាអាជីព ៦ វិមាត្ររបស់លោក John Holland ដែលឆ្លុះបញ្ចាំងពីចំណាប់អារម្មណ៍ពិតប្រាកដ និងការចូលចិត្តការងារប្រចាំថ្ងៃ។",
    icon: Compass,
    color: "#D97706",
    badgeBg: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  {
    number: "02",
    weight: "25%",
    titleEn: "16-Personality Cognitive Temperaments",
    titleKm: "វិមាត្របុគ្គលិកលក្ខណៈ 16P & ការគិត",
    descEn: "Evaluates Myers-Briggs cognitive functions (Analysts, Diplomats, Sentinels, Explorers) to understand study endurance, stress resilience, and team dynamics.",
    descKm: "វាយតម្លៃលើមុខងារនៃការគិត ៤ ក្រុមធំៗ ដើម្បីយល់ដឹងពីភាពធន់ក្នុងការសិក្សា របៀបដោះស្រាយបញ្ហា និងការសហការក្នុងក្រុមការងារ។",
    icon: BrainCircuit,
    color: "#2563EB",
    badgeBg: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  {
    number: "03",
    weight: "25%",
    titleEn: "High School Academic Stream Alignment",
    titleKm: "ភាពត្រូវគ្នានៃកម្មវិធីសិក្សាវិទ្យាល័យ",
    descEn: "Cross-validates your Grade 12 BACII track (Science stream vs. Social stream) against mandatory prerequisite subjects for selective Cambodian university programs.",
    descKm: "ផ្ទៀងផ្ទាត់ភាពត្រូវគ្នារវាងថ្នាក់វិទ្យាសាស្ត្រពិត ឬវិទ្យាសាស្ត្រសង្គម ជាមួយលក្ខខណ្ឌតម្រូវជាកាតព្វកិច្ចនៃមុខវិជ្ជាស្នូលរបស់សាកលវិទ្យាល័យ។",
    icon: GraduationCap,
    color: "#059669",
    badgeBg: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  {
    number: "04",
    weight: "20%",
    titleEn: "Cambodian Labor Market Reality",
    titleKm: "តម្រូវការទីផ្សារការងារជាក់ស្តែងនៅកម្ពុជា",
    descEn: "Incorporates data from the National Employment Agency (NEA) and tech/business growth trends to ensure your chosen major leads to viable, well-compensated employment.",
    descKm: "រួមបញ្ចូលទិន្នន័យពីទីភ្នាក់ងារជាតិមុខរបរ និងការងារ (NEA) និងនិន្នាការរីកចម្រើននៃវិស័យបច្ចេកវិទ្យា និងធុរកិច្ច ដើម្បីធានាឱកាសការងារពិតប្រាកដ។",
    icon: TrendingUp,
    color: "#9333EA",
    badgeBg: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  },
];

// FAQ items
const FAQ_ITEMS = [
  {
    qEn: "How does Futera ensure Cambodian university tuition fees are accurate?",
    qKm: "តើ Futera ធានាភាពត្រឹមត្រូវនៃតម្លៃសិក្សានៅសាកលវិទ្យាល័យដោយរបៀបណា?",
    aEn: "We cross-reference every fee schedule directly with official published admission notices from the Ministry of Education, Youth and Sport (MoEYS) and university registrar offices (RUPP, ITC, CADT, AUPP, Paragon IU, and NUM). Any outdated figure is flagged as pending until re-verified.",
    aKm: "យើងផ្ទៀងផ្ទាត់កាលវិភាគតម្លៃសិក្សាទាំងអស់ដោយផ្ទាល់ជាមួយសេចក្តីជូនដំណឹងផ្លូវការរបស់ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS) និងការិយាល័យចុះឈ្មោះរបស់សាកលវិទ្យាល័យ (RUPP, ITC, CADT, AUPP, Paragon IU, និង NUM)។ ទិន្នន័យចាស់ៗត្រូវបានត្រួតពិនិត្យឡើងវិញជានិច្ច។",
  },
  {
    qEn: "Does Futera accept payment to recommend specific universities?",
    qKm: "តើ Futera ទទួលប្រាក់ដើម្បីណែនាំសាកលវិទ្យាល័យណាមួយជាពិសេសឬទេ?",
    aEn: "No, never. Futera operates with strict editorial independence. We do not accept paid placements, sponsored rankings, or promotional sponsorships that influence student recommendations. Recommendations are 100% driven by scientific algorithm fit.",
    aKm: "ដាច់ខាតមិនមានឡើយ! Futera ប្រកាន់ខ្ជាប់នូវភាពឯករាជ្យ និងក្រមសីលធម៌វិជ្ជាជីវៈខ្ពស់បំផុត។ យើងមិនទទួលប្រាក់ឧបត្ថម្ភដើម្បីតម្លើងចំណាត់ថ្នាក់សាកលវិទ្យាល័យណាមួយឡើយ។ ការណែនាំទាំងអស់កើតចេញពីការគណនាបែបវិទ្យាសាស្ត្រសុទ្ធសាធ។",
  },
  {
    qEn: "How can Grade 12 students, teachers, and parents use Futera together?",
    qKm: "តើសិស្សានុសិស្ស លោកគ្រូអ្នកគ្រូ និងអាណាព្យាបាលអាចប្រើប្រាស់ Futera រួមគ្នាដូចម្តេច?",
    aEn: "Futera generates clear, comprehensive diagnostic reports designed to be shared. We encourage students to sit down with high school counselors and parents to review major suitability, 4-year financial budgets, and scholarship opportunities collaboratively.",
    aKm: "Futera បង្កើតរបាយការណ៍លទ្ធផលយ៉ាងច្បាស់លាស់សម្រាប់ចែករំលែក។ យើងលើកទឹកចិត្តឱ្យសិស្សពិភាក្សាជាមួយលោកគ្រូអ្នកគ្រូតម្រង់ទិស និងឪពុកម្តាយ ដើម្បីពិនិត្យមើលភាពត្រូវគ្នានៃជំនាញ ថវិកាសិក្សា ៤ ឆ្នាំ និងឱកាសអាហារូបករណ៍រួមគ្នា។",
  },
  {
    qEn: "Is Futera completely free for Cambodian students?",
    qKm: "តើសិស្សានុសិស្សកម្ពុជាអាចប្រើប្រាស់ Futera ដោយឥតគិតថ្លៃពិតប្រាកដមែនទេ?",
    aEn: "Yes, 100% free. All core assessments, personalized recommendations, Cambodian major guides, and university tuition comparison dashboards are freely accessible to every student across all 25 provinces.",
    aKm: "បាទ/ចាស! ឥតគិតថ្លៃ ១០០%។ ការធ្វើតេស្តស្វែងយល់ពីខ្លួនឯង ការណែនាំជំនាញផ្ទាល់ខ្លួន មគ្គុទ្ទេសក៍ជំនាញសិក្សា និងការប្រៀបធៀបតម្លៃសិក្សាសាកលវិទ្យាល័យ គឺបើកចំហសម្រាប់សិស្សានុសិស្សទាំងអស់នៅគ្រប់ខេត្តក្រុងទូទាំងកម្ពុជា។",
  },
];

export default function AboutPage() {
  const { t, language } = useLanguage();
  const [selectedRiasecCode, setSelectedRiasecCode] = useState<string>("I");
  const [taraTipIndex, setTaraTipIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const mascotImgRef = useRef<HTMLDivElement>(null);

  const activeRiasec = RIASEC_DEEP_DATA[selectedRiasecCode] || RIASEC_DEEP_DATA["I"];
  const RiasecIcon = activeRiasec.icon;

  const cycleTaraTip = () => {
    setTaraTipIndex((prev) => (prev + 1) % TARA_ADVICE_TIPS.length);
    if (mascotImgRef.current) {
      gsap.fromTo(
        mascotImgRef.current,
        { scale: 0.9, y: 5 },
        { scale: 1, y: 0, duration: 0.45, ease: "back.out(2)" }
      );
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  // GSAP Orchestration with ScrollTrigger
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Hero Elements Swift Stagger (Explicit fromTo to avoid React 19 StrictMode 0->0 capture)
      gsap.fromTo(
        ".gsap-hero-anim",
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.65,
          ease: "power2.out",
        }
      );

      gsap.fromTo(
        ".gsap-hero-mascot-card",
        { scale: 0.94, y: 24, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.75,
          delay: 0.12,
          ease: "back.out(1.5)",
        }
      );

      // Subtle floating mascot breathing loop
      gsap.to(".gsap-mascot-float", {
        y: -10,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 2. Bento Stat Cards ScrollTrigger Reveal
      gsap.fromTo(
        ".gsap-stat-card",
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-stats-grid",
            start: "top 92%",
            once: true,
          },
        }
      );

      // 3. 4-Pillar Scientific Cards ScrollTrigger
      gsap.fromTo(
        ".gsap-pillar-card",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-pillars-grid",
            start: "top 90%",
            once: true,
          },
        }
      );

      // 4. RIASEC Visualizer ScrollTrigger
      gsap.fromTo(
        ".gsap-riasec-showcase",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-riasec-showcase",
            start: "top 90%",
            once: true,
          },
        }
      );

      // 5. 3-Step Pathway ScrollTrigger
      gsap.fromTo(
        ".gsap-step-card",
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.65,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: ".gsap-steps-grid",
            start: "top 90%",
            once: true,
          },
        }
      );

      // Connecting line progress fill
      gsap.fromTo(
        ".gsap-pathway-line",
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 1.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-steps-grid",
            start: "top 90%",
            once: true,
          },
        }
      );

      // 6. FAQ Section ScrollTrigger
      gsap.fromTo(
        ".gsap-faq-container",
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-faq-container",
            start: "top 90%",
            once: true,
          },
        }
      );

      // 7. Ethical Commitment Card ScrollTrigger
      gsap.fromTo(
        ".gsap-commitment-card",
        { scale: 0.97, y: 25, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-commitment-card",
            start: "top 92%",
            once: true,
          },
        }
      );

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F8FAFD] text-[#111965] selection:bg-[#F7CE4D] selection:text-[#111965] pb-28"
    >
      {/* ========================================================= */}
      {/* 1. SIGNATURE FUTERA NAVY HERO WITH SEAMLESS SKYLINE MASK */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#080D2B] via-[#0F1754] to-[#0A0F36] text-white pt-24 pb-32 sm:pb-36 lg:pb-40 px-4 sm:px-6 lg:px-8 select-none">
        {/* Subtle Starlight / Dot Grid Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 [background-image:radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_80%)]" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#F7CE4D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-32 w-[550px] h-[550px] bg-[#33A474]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 left-1/3 w-[450px] h-[260px] bg-[#88619A]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Seamless Cambodian University Campuses Backdrop (Zero hard cuts) */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden opacity-15 h-64 sm:h-72 lg:h-80 z-0"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
          }}
        >
          <Image
            src="/images/cambodia-campuses-skyline-seamless.webp"
            alt="Cambodian University Campuses Backdrop"
            fill
            unoptimized
            className="object-cover object-bottom"
          />
        </div>

        {/* Soft atmospheric fade at bottom of hero into page canvas */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0A0F36] to-transparent pointer-events-none z-1" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="gsap-hero-anim inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#F7CE4D] text-xs font-black border border-white/20 shadow-xs uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-[#F7CE4D]" />
                <span>{t("aboutPage.heroBadge", "Empowering Cambodian Higher Education")}</span>
              </div>

              {/* Headline */}
              <h1 className="gsap-hero-anim text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.18] drop-shadow-md">
                {language === "km" ? (
                  <>
                    ជួយសិស្សានុសិស្សកម្ពុជាឱ្យស្វែងយល់ពីខ្លួនឯង និងកំណត់{" "}
                    <span className="text-[#F7CE4D] drop-shadow-sm">អនាគត</span>
                  </>
                ) : (
                  <>
                    Empowering Cambodian Students to Shape Their{" "}
                    <span className="text-[#F7CE4D] drop-shadow-sm">Future</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="gsap-hero-anim text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                {t(
                  "aboutPage.heroSubtitle",
                  "Futera bridges high school graduation and higher education with scientific assessments, authentic tuition fees, and transparent career pathways."
                )}
              </p>

              {/* Key Trust Micro-Badges */}
              <div className="gsap-hero-anim flex flex-wrap items-center justify-center lg:justify-start gap-3.5 text-xs font-bold text-slate-200 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Free For Students</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F7CE4D]" />
                  <span>Verified MoEYS Data</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
                  <span>RIASEC + MBTI Scientific Engine</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="gsap-hero-anim pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                <Link
                  href="/dashboard/assessments/personality"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-xl hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#111965]" />
                  <span>{t("aboutPage.startAssessment", "Start Free Assessment")}</span>
                  <ArrowRight className="w-4 h-4 text-[#111965]" />
                </Link>

                <Link
                  href="/majors"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md active:scale-95 transition-colors duration-200 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-[#F7CE4D]" />
                  <span>{t("aboutPage.exploreMajorsBtn", "Explore University Majors")}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Holographic Interactive Tara Mascot Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                className="gsap-hero-mascot-card relative p-6 sm:p-8 rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-2xl max-w-sm w-full space-y-4 text-center overflow-hidden cursor-pointer select-none"
                onClick={cycleTaraTip}
                title="Click Tara for guidance advice!"
              >
                <BorderBeam size={220} duration={9} delay={0} borderWidth={1.5} />

                {/* Ambient Golden Radial Glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#F7CE4D]/20 rounded-full blur-2xl pointer-events-none" />

                {/* Floating Tara Mascot */}
                <div
                  ref={mascotImgRef}
                  className="gsap-mascot-float relative w-36 h-36 sm:w-44 sm:h-44 mx-auto"
                >
                  <Image
                    src="/images/welcome-hd.webp"
                    alt="Tara Futera Mascot"
                    fill
                    sizes="(max-width: 768px) 144px, 176px"
                    className="object-contain drop-shadow-xl"
                    priority
                  />
                </div>

                {/* Interactive Conversational Speech Bubble */}
                <div className="space-y-2 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7CE4D] text-[#111965] text-xs font-black shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tara Guidance Tip (Click to Rotate)</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed p-4 rounded-2xl bg-[#080D2B]/80 border border-white/15 backdrop-blur-md min-h-[76px] flex items-center justify-center shadow-inner">
                    "{language === "km" ? TARA_ADVICE_TIPS[taraTipIndex].km : TARA_ADVICE_TIPS[taraTipIndex].en}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. ELEVATED BENTO PLATFORM METRICS */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20 space-y-16">
        <div className="gsap-stats-grid grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Majors */}
          <div className="gsap-stat-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F2FA] text-[#111965] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 text-[#111965]" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
                <NumberTicker value={50} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm font-black text-[#171A2C]">
                {t("aboutPage.statMajors", "Curated Cambodian Majors")}
              </div>
              <div className="text-[11px] text-[#68708A] leading-relaxed">
                STEM, AI, Business, & Creative Curricula
              </div>
            </div>
          </div>

          {/* Card 2: Universities */}
          <div className="gsap-stat-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9E6] text-[#B45309] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-6 h-6 text-[#B45309]" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
                <NumberTicker value={6} suffix=" Campuses" />
              </div>
              <div className="text-xs sm:text-sm font-black text-[#171A2C]">
                {t("aboutPage.statUniversities", "Verified Universities")}
              </div>
              <div className="text-[11px] text-[#68708A] leading-relaxed">
                RUPP, ITC, CADT, AUPP, Paragon, NUM
              </div>
            </div>
          </div>

          {/* Card 3: 100% Tuition Accuracy */}
          <div className="gsap-stat-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                <NumberTicker value={100} suffix="%" />
              </div>
              <div className="text-xs sm:text-sm font-black text-[#171A2C]">
                {t("aboutPage.statTuition", "Verified Tuition Data")}
              </div>
              <div className="text-[11px] text-[#68708A] leading-relaxed">
                Cross-referenced with MoEYS admission notices
              </div>
            </div>
          </div>

          {/* Card 4: Scientific Engine */}
          <div className="gsap-stat-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-900 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform duration-200">
              <BrainCircuit className="w-6 h-6 text-purple-800" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
                4 Pillars
              </div>
              <div className="text-xs sm:text-sm font-black text-[#171A2C]">
                {t("aboutPage.statScience", "Scientific Matching Engine")}
              </div>
              <div className="text-[11px] text-[#68708A] leading-relaxed">
                RIASEC + MBTI + Academics + Labor Market
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. THE 4-PILLAR SCIENTIFIC MATCHING ENGINE BREAKDOWN */}
        {/* ========================================================= */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111965]/10 text-[#111965] text-xs font-black uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-[#111965]" />
              <span>{language === "km" ? "វិធីសាស្ត្រវិទ្យាសាស្ត្រ ៤ សសរស្ដម្ភ" : "The 4-Pillar Scientific Formula"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
              {language === "km"
                ? "ហេតុអ្វីបានជា Futera អាចផ្គូផ្គងជំនាញសិក្សាបានត្រឹមត្រូវ?"
                : "Why Generic Quizzes Fail — And How Futera Solves It"}
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed max-w-2xl mx-auto font-medium">
              {language === "km"
                ? "Futera មិនគ្រាន់តែសួរសំណួរទូទៅពីរបីហើយទស្សន៍ទាយនោះទេ។ យើងរួមបញ្ចូល ៤ វិមាត្រវិទ្យាសាស្ត្រផ្សេងៗគ្នា ដើម្បីគណនាភាពស័ក្តិសមបំផុតជាមួយបរិបទកម្ពុជា។"
                : "Most online quizzes ask 5 generic questions and guess. Futera combines 4 distinct scientific dimensions to calculate your genuine academic and career fit with mathematical clarity."}
            </p>
          </div>

          <div className="gsap-pillars-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {SCIENTIFIC_PILLARS.map((p, idx) => {
              const PillarIcon = p.icon;
              return (
                <div
                  key={idx}
                  className="gsap-pillar-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-200 space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform duration-200"
                        style={{ backgroundColor: `${p.color}15`, color: p.color }}
                      >
                        <PillarIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black text-[#68708A] uppercase tracking-wider block">
                          Pillar {p.number}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-[#111965]">
                          {language === "km" ? p.titleKm : p.titleEn}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-xl text-xs font-black border ${p.badgeBg}`}
                    >
                      Weight: {p.weight}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed font-medium">
                    {language === "km" ? p.descKm : p.descEn}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs font-black text-[#111965]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {language === "km"
                        ? "ផ្ទៀងផ្ទាត់សម្រាប់បរិបទនិស្សិតកម្ពុជា"
                        : "Scientifically Validated for Cambodian Higher Ed"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. INTERACTIVE HOLLAND RIASEC 6-DIMENSION VISUALIZER */}
        {/* ========================================================= */}
        <div className="gsap-riasec-showcase p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F2FA] text-[#111965] text-xs font-black">
                <Compass className="w-3.5 h-3.5 text-[#111965]" />
                <span>
                  {language === "km"
                    ? "ឧបករណ៍ស្វែងយល់វិមាត្រចិត្តវិទ្យាអាជីព"
                    : "Interactive RIASEC Psychological Explorer"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111965] tracking-tight">
                {language === "km"
                  ? "ស្វែងយល់ពីវិមាត្រអាជីពទាំង ៦ នៃ Holland RIASEC"
                  : "Explore the Holland RIASEC Vocational Dimensions"}
              </h2>
              <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
                {language === "km"
                  ? "ចុចលើវិមាត្រណាមួយដើម្បីពិនិត្យមើលចំណុចខ្លាំង ជំនាញសិក្សានៅកម្ពុជាដែលត្រូវគ្នា និងអាជីពការងារគោលដៅ៖"
                  : "Click any of the 6 core vocational work styles to inspect its cognitive profile, matching Cambodian majors, and career outcomes:"}
              </p>
            </div>

            <Link
              href="/dashboard/assessments/personality"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-xs hover:shadow-md transition-all duration-200 self-start md:self-auto cursor-pointer"
            >
              <span>{language === "km" ? "ធ្វើតេស្តស្វែងយល់ពីខ្លួនឯង" : "Take Free Assessment"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 6 RIASEC Segmented Selector Dock */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(RIASEC_DEEP_DATA).map(([code, info]) => {
              const isSelected = selectedRiasecCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedRiasecCode(code)}
                  className={`relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? "bg-[#111965] text-white border-[#111965] shadow-lg ring-2 ring-[#111965]/20 scale-[1.02]"
                      : "bg-[#F8FAFD] text-[#171A2C] border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-lg ${
                        isSelected
                          ? "bg-white/20 text-[#F7CE4D]"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {code}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: info.themeColor }}
                    />
                  </div>

                  <div className="text-sm font-black mt-2.5 truncate">
                    {language === "km" ? info.nameKm : info.nameEn}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 line-clamp-1 ${
                      isSelected ? "text-slate-300" : "text-[#68708A]"
                    }`}
                  >
                    {language === "km" ? info.roleKm : info.roleEn}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Dimension Details Card (Elevated Showcase) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F8FAFD] border-2 border-slate-200 space-y-6 relative overflow-hidden transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs flex-shrink-0"
                  style={{ color: activeRiasec.themeColor }}
                >
                  <RiasecIcon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#68708A] uppercase tracking-wider block">
                    RIASEC Profile • Dimension Code {selectedRiasecCode}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#111965]">
                    {language === "km"
                      ? `${activeRiasec.nameKm} (${activeRiasec.roleKm})`
                      : `${activeRiasec.nameEn} (${activeRiasec.roleEn})`}
                  </h3>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${activeRiasec.badgeBg} self-start sm:self-auto`}
              >
                <BadgeCheck className="w-4 h-4" />
                <span>Vocational Psychology Standard</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#171A2C] font-semibold leading-relaxed bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              {language === "km" ? activeRiasec.taglineKm : activeRiasec.taglineEn}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* 1. Core Cognitive Strengths */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <span className="text-[11px] font-black text-[#111965] uppercase tracking-wider block">
                  {language === "km" ? "ចំណុចខ្លាំងនៃការគិតស្នូល" : "Core Cognitive Strengths"}
                </span>
                <ul className="space-y-1.5 text-xs text-[#171A2C]">
                  {activeRiasec.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 stroke-[3]" />
                      <span className="font-medium">
                        {language === "km" ? str.km : str.en}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. Aligned Cambodian Majors */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <span className="text-[11px] font-black text-[#111965] uppercase tracking-wider block">
                  {language === "km" ? "ជំនាញសិក្សានៅកម្ពុជាដែលត្រូវគ្នា" : "Aligned Cambodian Majors"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeRiasec.sampleMajors.map((m) => (
                    <Link
                      key={m.slug}
                      href={`/majors/${m.slug}`}
                      className="px-3 py-1.5 rounded-xl bg-[#F0F2FA] text-xs font-bold text-[#111965] hover:bg-[#E2E6F5] hover:translate-x-0.5 transition-all duration-150 inline-flex items-center gap-1 shadow-2xs"
                    >
                      <span>{m.name}</span>
                      <ArrowRight className="w-3 h-3 text-[#111965]" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* 3. Target Career Roles */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <span className="text-[11px] font-black text-[#111965] uppercase tracking-wider block">
                  {language === "km" ? "អាជីពការងារគោលដៅ" : "Target Career Roles"}
                </span>
                <ul className="space-y-1.5 text-xs text-[#171A2C]">
                  {activeRiasec.sampleCareers.map((car, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-[#B45309] flex-shrink-0" />
                      <span className="font-medium">
                        {language === "km" ? car.km : car.en}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. STEP-BY-STEP PATHWAY ("HOW FUTERA WORKS FOR YOU") */}
        {/* ========================================================= */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F2FA] text-[#111965] text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-[#111965]" />
              <span>{language === "km" ? "មាគ៌ា ៣ ជំហានច្បាស់លាស់" : "Step-by-Step Pathway"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111965] tracking-tight">
              {t("aboutPage.whyTitle", "How Futera Works for You")}
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A]">
              {language === "km"
                ? "ពីការស្វែងយល់ពីខ្លួនឯង រហូតដល់ការចុះឈ្មោះចូលរៀននៅសាកលវិទ្យាល័យដោយទំនុកចិត្ត។"
                : "From authentic self-discovery to confident enrollment in your dream university program."}
            </p>
          </div>

          <div className="relative">
            {/* Animated Connecting Line on Desktop */}
            <div className="hidden md:block absolute top-12 left-16 right-16 h-1 bg-slate-100 z-0">
              <div className="gsap-pathway-line h-full w-full bg-gradient-to-r from-[#111965] via-[#F7CE4D] to-[#111965]" />
            </div>

            <div className="gsap-steps-grid grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Step 1 */}
              <div className="gsap-step-card p-6 sm:p-7 rounded-3xl bg-[#F8FAFD] border border-slate-200/80 shadow-2xs hover:shadow-lg transition-all duration-200 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#111965] text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform duration-200">
                  01
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#111965]">
                  {t("aboutPage.step1Title", "1. Self-Discovery Diagnostics")}
                </h3>
                <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
                  {t(
                    "aboutPage.step1Desc",
                    "Complete the RIASEC interest assessment and 16-personality cognitive test designed specifically for Cambodian students."
                  )}
                </p>
              </div>

              {/* Step 2 */}
              <div className="gsap-step-card p-6 sm:p-7 rounded-3xl bg-[#F8FAFD] border border-slate-200/80 shadow-2xs hover:shadow-lg transition-all duration-200 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#111965] text-[#F7CE4D] flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform duration-200">
                  02
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#111965]">
                  {t("aboutPage.step2Title", "2. 4-Pillar Algorithmic Matching")}
                </h3>
                <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
                  {t(
                    "aboutPage.step2Desc",
                    "Our engine integrates your interests (30%), academics (25%), cognitive style (25%), and Cambodian market demand (20%)."
                  )}
                </p>
              </div>

              {/* Step 3 */}
              <div className="gsap-step-card p-6 sm:p-7 rounded-3xl bg-[#F8FAFD] border border-slate-200/80 shadow-2xs hover:shadow-lg transition-all duration-200 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#111965] text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform duration-200">
                  03
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#111965]">
                  {t("aboutPage.step3Title", "3. Verified University Enrollment")}
                </h3>
                <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
                  {t(
                    "aboutPage.step3Desc",
                    "Compare verified 4-year tuition fees, admission requirements, and 100% full-tuition scholarship opportunities across Cambodia."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. METHODOLOGY & DATA INTEGRITY FAQ */}
        {/* ========================================================= */}
        <div className="gsap-faq-container space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-[#111965] tracking-tight">
              {language === "km"
                ? "សំណួរញឹកញាប់អំពីទិន្នន័យ និងតម្លាភាព"
                : "Data Authenticity & Ethical FAQ"}
            </h3>
            <p className="text-xs sm:text-sm text-[#68708A]">
              {language === "km"
                ? "តម្លាភាពពេញលេញអំពីរបៀបដែលយើងផ្ទៀងផ្ទាត់តម្លៃសិក្សានៅសាកលវិទ្យាល័យកម្ពុជា និងការណែនាំដោយមិនលម្អៀង។"
                : "Full transparency on how we verify Cambodian university fees and ensure unbiased student guidance."}
            </p>
          </div>

          <div className="space-y-3.5 max-w-3xl mx-auto">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#111965] cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span>{language === "km" ? faq.qKm : faq.qEn}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180 text-[#111965]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#68708A] leading-relaxed border-t border-slate-100 bg-[#F8FAFD]">
                      {language === "km" ? faq.aKm : faq.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 7. ETHICAL TRANSPARENCY & DATA INTEGRITY COMMITMENT */}
        {/* ========================================================= */}
        <div className="gsap-commitment-card p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#080D2B] via-[#0F1754] to-[#111965] text-white shadow-2xl space-y-6 border border-white/10 relative overflow-hidden">
          <BorderBeam size={300} duration={12} delay={0} borderWidth={1.5} />

          <div className="flex items-center gap-2 text-xs font-black text-[#F7CE4D] uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4 text-[#F7CE4D]" />
            <span>Ethical Guidance Commitment</span>
          </div>

          <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            {t("aboutPage.commitment", "Our Promise to Cambodian Students & Families")}
          </h3>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl font-medium">
            {language === "km"
              ? "ការធ្វើតេស្តនៅលើ Futera ត្រូវបានរចនាឡើងដើម្បីជំរុញការស្វែងយល់ និងការពិចារណាដោយផ្អែកលើព័ត៌មានជាក់ស្តែង មិនមែនជាការបង្ខិតបង្ខំវាសនាជីវិតរបស់សិស្សឡើយ។ យើងលើកទឹកចិត្តយ៉ាងមុតមាំឱ្យសិស្សានុសិស្សយកលទ្ធផលណែនាំរបស់ Futera ទៅពិភាក្សាជាមួយលោកគ្រូអ្នកគ្រូវិទ្យាល័យ ទីប្រឹក្សាអាជីព និងសមាជិកគ្រួសារ ដើម្បីធ្វើការសម្រេចចិត្តរួមគ្នាប្រកបដោយទំនុកចិត្ត។"
              : "Futera assessments represent self-reported preferences and are designed to inspire exploration and informed reflection, not to rigidly dictate a student's destiny. We strongly encourage students to discuss their Futera recommendations with high school teachers, university counselors, and family members to make confident, well-rounded decisions."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Link
              href="/dashboard/assessments/personality"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
            >
              <span>{t("aboutPage.tryAssessments", "Start Your Journey")}</span>
              <ArrowRight className="w-4 h-4 text-[#111965]" />
            </Link>

            <Link
              href="/universities"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md active:scale-95 transition-colors duration-200 cursor-pointer"
            >
              <School className="w-4 h-4 text-[#F7CE4D]" />
              <span>Explore Verified Universities</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
