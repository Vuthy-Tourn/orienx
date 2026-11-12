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
  ArrowLeftRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import ScrollStack, { ScrollStackItem } from "@/components/ui/scroll-stack";
import Folder from "@/components/react-bits/folder";

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

// 4 Scientific Pillars with specific data, unique proof, and visual widgets
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
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
    glowBorder: "hover:border-amber-400 hover:shadow-amber-500/10",
    proofEn: "John Holland's 6 dimensions • 30 localized question items",
    proofKm: "ទ្រឹស្តីចិត្តវិទ្យា ៦ វិមាត្រ • សំណួរ ៣០ សម្រិតសម្រាំងសម្រាប់កម្ពុជា",
    folderLabelEn: "01 • Holland RIASEC",
    folderLabelKm: "០១ • ចំណាប់អារម្មណ៍ RIASEC",
    folderDocsEn: [
      { title: "6 RIASEC Work Domains", description: "Realistic, Investigative, Artistic, Social, Enterprising, and Conventional." },
      { title: "30 Localized Test Items", description: "Psychometric question battery built specifically for Cambodian students." },
      { title: "Score Weight: 30%", description: "Foundation for vocational interest alignment to prevent major dropouts." }
    ],
    folderDocsKm: [
      { title: "វិមាត្រការងារទាំង ៦ នៃ RIASEC", description: "Realistic, Investigative, Artistic, Social, Enterprising, Conventional។" },
      { title: "សំណួរ ៣០ សម្រិតសម្រាំង", description: "កម្រងសំណួរស្រាវជ្រាវចិត្តវិទ្យាជាក់ស្តែងក្នុងបរិបទកម្ពុជា។" },
      { title: "ទម្ងន់ពិន្ទុ ៣០%", description: "មូលដ្ឋានគ្រឹះកំណត់ចំណាប់អារម្មណ៍សិក្សា និងអាជីព។" }
    ],
    widgetType: "riasec-chips" as const,
    chips: [
      { code: "R", nameEn: "Realistic", nameKm: "ជាក់ស្តែង", bg: "bg-amber-50 text-amber-800 border-amber-200" },
      { code: "I", nameEn: "Investigative", nameKm: "ស្រាវជ្រាវ", bg: "bg-indigo-50 text-indigo-800 border-indigo-200" },
      { code: "A", nameEn: "Artistic", nameKm: "សិល្បៈ", bg: "bg-pink-50 text-pink-800 border-pink-200" },
      { code: "S", nameEn: "Social", nameKm: "សង្គម", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
      { code: "E", nameEn: "Enterprising", nameKm: "សហគ្រិន", bg: "bg-blue-50 text-blue-800 border-blue-200" },
      { code: "C", nameEn: "Conventional", nameKm: "ការិយាល័យ", bg: "bg-slate-50 text-slate-800 border-slate-200" },
    ],
  },
  {
    number: "02",
    weight: "25%",
    titleEn: "16-Personality Cognitive Temperaments",
    titleKm: "វិមាត្របុគ្គលិកលក្ខណៈ 16P & ការគិត",
    descEn: "Evaluates Myers-Briggs cognitive functions to understand study endurance, stress resilience, and natural teamwork dynamics across analytical and creative fields.",
    descKm: "វាយតម្លៃលើមុខងារនៃការគិត ៤ ក្រុមធំៗ ដើម្បីយល់ដឹងពីភាពធន់ក្នុងការសិក្សា របៀបដោះស្រាយបញ្ហា និងការសហការក្នុងក្រុមការងារ។",
    icon: BrainCircuit,
    color: "#2563EB",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80",
    glowBorder: "hover:border-blue-400 hover:shadow-blue-500/10",
    proofEn: "4 cognitive temperament clusters • Myers-Briggs validated",
    proofKm: "មុខងារនៃការគិត ៤ ក្រុមធំៗ • ផ្ទៀងផ្ទាត់តាមស្តង់ដារ Myers-Briggs",
    folderLabelEn: "02 • 16-Personality",
    folderLabelKm: "០២ • បុគ្គលិកលក្ខណៈ ១៦",
    folderDocsEn: [
      { title: "4 Cognitive Clusters", description: "Analysts (NT), Diplomats (NF), Sentinels (SJ), and Explorers (SP)." },
      { title: "Study Endurance & Teams", description: "Evaluates cognitive stamina, burnout resistance, and collaboration." },
      { title: "Score Weight: 25%", description: "Aligns university learning methodology with your natural mindset." }
    ],
    folderDocsKm: [
      { title: "ក្រុមបុគ្គលិកលក្ខណៈ ៤ ធំៗ", description: "អ្នកវិភាគ (NT), អ្នកការទូត (NF), អ្នកការពារ (SJ), អ្នករុករក (SP)។" },
      { title: "ភាពធន់ក្នុងការសិក្សា", description: "វាយតម្លៃលើភាពធន់នឹងសម្ពាធ និងការសហការក្នុងក្រុមការងារ។" },
      { title: "ទម្ងន់ពិន្ទុ ២៥%", description: "កំណត់ភាពស័ក្តិសមជាមួយបរិយាកាស និងវិធីសាស្ត្ររៀន។" }
    ],
    widgetType: "16p-quadrants" as const,
    quadrants: [
      { nameEn: "Analysts", nameKm: "អ្នកវិភាគ", types: "INTJ • INTP • ENTJ • ENTP", tagColor: "bg-indigo-50 text-indigo-700 border-indigo-100" },
      { nameEn: "Diplomats", nameKm: "អ្នកការទូត", types: "INFJ • INFP • ENFJ • ENFP", tagColor: "bg-emerald-50 text-emerald-700 border-emerald-100" },
      { nameEn: "Sentinels", nameKm: "អ្នកការពារ", types: "ISTJ • ISFJ • ESTJ • ESFJ", tagColor: "bg-blue-50 text-blue-700 border-blue-100" },
      { nameEn: "Explorers", nameKm: "អ្នករុករក", types: "ISTP • ISFP • ESTP • ESFP", tagColor: "bg-amber-50 text-amber-700 border-amber-100" },
    ],
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
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    glowBorder: "hover:border-emerald-400 hover:shadow-emerald-500/10",
    proofEn: "Cross-checked with RUPP, ITC Techno & CADT entrance cutoffs",
    proofKm: "ផ្ទៀងផ្ទាត់ផ្ទាល់ជាមួយលក្ខខណ្ឌពិន្ទុ និងមុខវិជ្ជារបស់ RUPP, ITC និង CADT",
    folderLabelEn: "03 • BACII Stream",
    folderLabelKm: "០៣ • សញ្ញាបត្របាក់ឌុប",
    folderDocsEn: [
      { title: "Science vs Social Track", description: "Grade 12 national exam track alignment for Cambodian higher ed." },
      { title: "Entrance Cutoff Matrix", description: "Prerequisite verification for RUPP, ITC Techno, CADT, and NUM." },
      { title: "Score Weight: 25%", description: "Ensures mandatory prerequisite eligibility before admission." }
    ],
    folderDocsKm: [
      { title: "ថ្នាក់វិទ្យាសាស្ត្រ ឬសង្គម", description: "ផ្ទៀងផ្ទាត់ភាពត្រូវគ្នានៃទិសដៅសិក្សាថ្នាក់ទី១២ ជាមួយជំនាញ។" },
      { title: "លក្ខខណ្ឌចូលរៀនផ្លូវការ", description: "ផ្ទៀងផ្ទាត់ពិន្ទុកាត់ និងលក្ខខណ្ឌតម្រូវ RUPP, ITC និង CADT។" },
      { title: "ទម្ងន់ពិន្ទុ ២៥%", description: "ការពារកុំឱ្យខុសលក្ខខណ្ឌចុះឈ្មោះចូលរៀនផ្លូវការ។" }
    ],
    widgetType: "stream-validator" as const,
    streams: [
      { labelEn: "Science Stream", labelKm: "ថ្នាក់វិទ្យាសាស្ត្រពិត", targetEn: "STEM, Tech, Medicine & Engineering", targetKm: "វិស្វកម្ម, បច្ចេកវិទ្យា, វិទ្យាសាស្ត្រសុខាភិបាល", badge: "Math + Physics" },
      { labelEn: "Social Stream", labelKm: "ថ្នាក់វិទ្យាសាស្ត្រសង្គម", targetEn: "Law, Business, Humanities & Diplomacy", targetKm: "នីតិសាស្ត្រ, សេដ្ឋកិច្ច, ទំនាក់ទំនងអន្តរជាតិ", badge: "Literature + Social" },
    ],
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
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80",
    glowBorder: "hover:border-purple-400 hover:shadow-purple-500/10",
    proofEn: "Official data from National Employment Agency (NEA) & MoEYS",
    proofKm: "ទិន្នន័យផ្លូវការពីទីភ្នាក់ងារជាតិមុខរបរ និងការងារ (NEA) និង MoEYS",
    folderLabelEn: "04 • NEA Market",
    folderLabelKm: "០៤ • ទីផ្សារការងារ NEA",
    folderDocsEn: [
      { title: "NEA Salary Benchmarks", description: "Verified entry-level ($600) to senior compensation ($2,400+)." },
      { title: "High-Growth Sectors", description: "Software, Cyber, Fintech, and Data Science demand tracking." },
      { title: "Score Weight: 20%", description: "Prevents degree mismatch with Cambodian labor market reality." }
    ],
    folderDocsKm: [
      { title: "ទិន្នន័យប្រាក់ខែជាក់ស្តែង NEA", description: "កម្រិតប្រាក់ខែផ្លូវការពី $600 (កម្រិតដំបូង) ដល់ $2,400+ (កម្រិតខ្ពស់)។" },
      { title: "វិស័យកំណើនខ្ពស់", description: "តាមដានតម្រូវការផ្នែកបច្ចេកវិទ្យា ហិរញ្ញវត្ថុ និងវិស្វកម្ម។" },
      { title: "ទម្ងន់ពិន្ទុ ២០%", description: "ធានាថាមុខជំនាញដែលរៀនមានទីផ្សារការងារពិតប្រាកដ។" }
    ],
    widgetType: "nea-market" as const,
    marketData: [
      { sectorEn: "High-Growth Sectors", sectorKm: "វិស័យកំណើនខ្ពស់", fields: "AI, Cyber, FinTech, Data Science", badge: "High Demand", salary: "$600 – $2,400+" },
      { sectorEn: "Stable Demand Sectors", sectorKm: "វិស័យស្ថិរភាព", fields: "Corporate Law, Banking, Supply Chain", badge: "Steady ROI", salary: "$500 – $1,800+" },
    ],
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
  const [activePillarIdx, setActivePillarIdx] = useState(0);

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

  // GSAP Orchestration with ScrollTrigger + Pinned Horizontal Scroll
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Hero Elements Swift Stagger
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

      // 3. 4-Pillar Scientific Formula Bar + Staggered Cards Scroll Animation
      const formulaTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".gsap-pillars-section",
          start: "top 85%",
          once: true,
        },
      });

      formulaTimeline
        .fromTo(
          ".gsap-formula-bar",
          { y: 24, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
        )
        .fromTo(
          ".gsap-formula-seg",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.65, stagger: 0.1, ease: "power2.out" },
          "-=0.25"
        )
        .fromTo(
          ".gsap-pillar-folder",
          { y: 35, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.12,
            duration: 0.7,
            ease: "back.out(1.4)",
          },
          "-=0.3"
        )
        .fromTo(
          ".gsap-pillar-inspector",
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.2"
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

      // 5. FAQ Section ScrollTrigger
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
        <section className="gsap-pillars-section space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111965]/10 text-[#111965] text-xs font-black uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-[#111965]" />
              <span>{language === "km" ? "វិធីសាស្ត្រវិទ្យាសាស្ត្រ ៤ សសរស្ដម្ភ" : "The 4-Pillar Scientific Formula"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#111965] tracking-tight">
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

          {/* Interactive 100% Mathematical Precision Formula Bar */}
          <div className="gsap-formula-bar max-w-4xl mx-auto p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#111965]">
                <BrainCircuit className="w-4 h-4 text-[#111965]" />
                <span className="text-sm font-black">
                  {language === "km" ? "រូបមន្តផ្គូផ្គង ១០០% បែបវិទ្យាសាស្ត្រ" : "The 100% Scientific Equation"}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs font-black text-slate-500">
                <span className="text-amber-600">30%</span> + <span className="text-blue-600">25%</span> + <span className="text-emerald-600">25%</span> + <span className="text-purple-600">20%</span> = <span className="text-[#111965] font-black">100% Precision</span>
              </div>
            </div>

            {/* Multi-segment Animated Progress Track */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex p-1 gap-1.5 shadow-inner">
              <div
                className="gsap-formula-seg h-full bg-amber-500 rounded-full relative group cursor-pointer transition-transform hover:scale-y-110"
                style={{ flex: 30 }}
              >
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0F3D] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30">
                  30% Holland RIASEC Interests
                </div>
              </div>
              <div
                className="gsap-formula-seg h-full bg-blue-600 rounded-full relative group cursor-pointer transition-transform hover:scale-y-110"
                style={{ flex: 25 }}
              >
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0F3D] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30">
                  25% 16-Personality Cognitive Style
                </div>
              </div>
              <div
                className="gsap-formula-seg h-full bg-emerald-500 rounded-full relative group cursor-pointer transition-transform hover:scale-y-110"
                style={{ flex: 25 }}
              >
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0F3D] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30">
                  25% BACII Stream Prerequisite
                </div>
              </div>
              <div
                className="gsap-formula-seg h-full bg-purple-600 rounded-full relative group cursor-pointer transition-transform hover:scale-y-110"
                style={{ flex: 20 }}
              >
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0F3D] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30">
                  20% Cambodian Labor Market (NEA)
                </div>
              </div>
            </div>

            {/* Legend Labels */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-bold">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span>30% RIASEC</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                <span>25% 16-Personality</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>25% BACII Stream</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 flex-shrink-0" />
                <span>20% NEA Market</span>
              </div>
            </div>
          </div>

          {/* Interactive 4-Pillar Research Folders Showcase */}
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Quick Dossier Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SCIENTIFIC_PILLARS.map((p, idx) => {
                const Icon = p.icon;
                const isActive = activePillarIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePillarIdx(idx)}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "shadow-md text-white scale-105"
                        : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
                    }`}
                    style={isActive ? { backgroundColor: p.color } : {}}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{language === "km" ? p.folderLabelKm : p.folderLabelEn}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {p.weight}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 4 Interactive Folders */}
            <div className="gsap-pillars-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {SCIENTIFIC_PILLARS.map((p, idx) => {
                const PillarIcon = p.icon;
                const isSelected = activePillarIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActivePillarIdx(idx)}
                    className={`gsap-pillar-folder relative flex flex-col justify-between p-5 rounded-3xl transition-all duration-300 cursor-pointer overflow-visible ${
                      isSelected
                        ? "bg-white shadow-xl ring-2 shadow-slate-200/80 scale-[1.02]"
                        : "bg-white/70 hover:bg-white border border-slate-200/80 hover:shadow-md"
                    }`}
                    style={isSelected ? { borderColor: p.color } : {}}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs"
                          style={{ backgroundColor: p.color }}
                        >
                          <PillarIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Pillar {p.number}
                        </span>
                      </div>
                      <span
                        className="text-[11px] font-black px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${p.color}15`, color: p.color }}
                      >
                        {p.weight}
                      </span>
                    </div>

                    {/* Interactive 3D Folder Canvas */}
                    <div className="py-4 my-2 flex items-center justify-center overflow-visible">
                      <Folder
                        items={language === "km" ? p.folderDocsKm : p.folderDocsEn}
                        label={language === "km" ? p.folderLabelKm : p.folderLabelEn}
                        color={p.color}
                        size={1.12}
                        defaultOpen={idx === 0}
                        open={isSelected}
                        onOpenChange={(open) => {
                          if (open) setActivePillarIdx(idx);
                        }}
                        openOn="click"
                        draggable={true}
                        zoomOnClick={true}
                        layout="spread"
                        variant="solid"
                      />
                    </div>

                    {/* Footer Info & Inspect Button */}
                    <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-[#111965] line-clamp-1">
                        {language === "km" ? p.titleKm : p.titleEn}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0"
                        style={{
                          backgroundColor: isSelected ? `${p.color}20` : "#f1f5f9",
                          color: isSelected ? p.color : "#64748b",
                        }}
                      >
                        {isSelected
                          ? language === "km" ? "បើកឯកសារ" : "Open Dossier"
                          : language === "km" ? "ពិនិត្យ" : "Inspect"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Synchronized Active Dossier Deep-Dive Inspector */}
            {(() => {
              const activePillar = SCIENTIFIC_PILLARS[activePillarIdx] || SCIENTIFIC_PILLARS[0];
              const ActiveIcon = activePillar.icon;
              return (
                <div
                  className="gsap-pillar-inspector p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 transition-all duration-300"
                  style={{ borderLeftWidth: "6px", borderLeftColor: activePillar.color }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                        style={{ backgroundColor: activePillar.color }}
                      >
                        <ActiveIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: `${activePillar.color}15`, color: activePillar.color }}
                          >
                            Pillar {activePillar.number} • {activePillar.weight} Precision
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-[#111965] tracking-tight mt-0.5">
                          {language === "km" ? activePillar.titleKm : activePillar.titleEn}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{language === "km" ? activePillar.proofKm : activePillar.proofEn}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium max-w-4xl">
                    {language === "km" ? activePillar.descKm : activePillar.descEn}
                  </p>

                  {/* Micro-Widgets Inside Active Dossier */}
                  {activePillar.widgetType === "riasec-chips" && activePillar.chips && (
                    <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>{language === "km" ? "វិមាត្រទាំង ៦ នៃ RIASEC ក្នុងបរិបទកម្ពុជា:" : "6 Core RIASEC Dimensions (Cambodian Context):"}</span>
                        <span className="text-amber-700 font-mono text-[11px] font-bold">30 Localized Items</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {activePillar.chips.map((chip, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded-xl border text-center transition-transform hover:scale-105 cursor-default ${chip.bg}`}
                          >
                            <span className="font-mono text-sm font-black block">{chip.code}</span>
                            <span className="text-xs font-bold truncate block">
                              {language === "km" ? chip.nameKm : chip.nameEn}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePillar.widgetType === "16p-quadrants" && activePillar.quadrants && (
                    <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>{language === "km" ? "ក្រុមបុគ្គលិកលក្ខណៈ ៤ ធំៗ & របៀបគិត:" : "4 Cognitive Clusters & Study Endurance:"}</span>
                        <span className="text-blue-700 font-mono text-[11px] font-bold">16 Types</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {activePillar.quadrants.map((quad, i) => (
                          <div key={i} className={`p-2.5 rounded-xl border ${quad.tagColor}`}>
                            <span className="text-xs font-black block">
                              {language === "km" ? quad.nameKm : quad.nameEn}
                            </span>
                            <span className="text-[11px] text-slate-600 block truncate font-mono mt-0.5">
                              {quad.types}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePillar.widgetType === "stream-validator" && activePillar.streams && (
                    <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>{language === "km" ? "ការផ្ទៀងផ្ទាត់ថ្នាក់វិទ្យាល័យ និងពិន្ទុកាត់:" : "BACII Stream Prerequisites & Cambodian Campus Cutoffs:"}</span>
                        <span className="text-emerald-700 font-mono text-[11px] font-bold">MoEYS Aligned</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activePillar.streams.map((stream, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs">
                            <div>
                              <span className="font-bold text-[#111965] block">
                                {language === "km" ? stream.labelKm : stream.labelEn}
                              </span>
                              <span className="text-slate-500 text-[11px]">
                                {language === "km" ? stream.targetKm : stream.targetEn}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex-shrink-0">
                              {stream.badge}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePillar.widgetType === "nea-market" && activePillar.marketData && (
                    <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>{language === "km" ? "ទិន្នន័យទីផ្សារការងារផ្លូវការពី NEA:" : "National Employment Agency (NEA) Salary & Demand Benchmarks:"}</span>
                        <span className="text-purple-700 font-mono text-[11px] font-bold">Verified NEA</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activePillar.marketData.map((data, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs">
                            <div>
                              <span className="font-bold text-[#111965] block">
                                {language === "km" ? data.sectorKm : data.sectorEn}
                              </span>
                              <span className="text-slate-500 text-[11px]">{data.fields}</span>
                            </div>
                            <span className="font-mono text-purple-700 font-black text-xs px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200/70 flex-shrink-0">
                              {data.salary}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </section>

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
      </div>

      {/* ========================================================= */}
      {/* 5. INTERACTIVE 3D SCROLL STACK (REACT-BITS) */}
      {/* ========================================================= */}
      <section className="w-full relative my-16 lg:my-28 select-none">
        <div className="w-full space-y-10 relative z-20">
          {/* Section Header */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
                <span>{language === "km" ? "មាគ៌ា ៥ ជំហានច្បាស់លាស់" : "The 5-Step Pathway"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111965] tracking-tight">
                {t("aboutPage.whyTitle", "How Futera Works for You")}
              </h2>
              <p className="text-sm sm:text-base text-[#68708A] font-medium leading-relaxed">
                {language === "km"
                  ? "ពីការធ្វើតេស្តស្វែងយល់ពីខ្លួនឯង រហូតដល់ការទទួលបានអាហារូបករណ៍ និងការចុះឈ្មោះចូលរៀនដោយទំនុកចិត្ត។"
                  : "A guided journey from authentic self-discovery to confident university enrollment."}
              </p>
            </div>
          </div>

          {/* React-Bits ScrollStack with Window Scroll Binding */}
          <div className="w-full">
            <ScrollStack
              useWindowScroll={true}
              stackPosition="110px"
              itemStackDistance={36}
              itemDistance={380}
              itemScale={0.035}
              baseScale={0.86}
              dimAmount={0.12}
              blurAmount={0}
              tiltAmount={0}
              rotationAmount={0}
              holdDistance={260}
              smoothScroll={false}
              className="w-full max-w-5xl mx-auto"
            >
              {/* Card 01: Self-Discovery Diagnostics */}
              <ScrollStackItem itemClassName="min-h-[460px] md:h-[450px] flex flex-col justify-between p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl">
                {/* Top Tab Strip (Visually exposed when stacked) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      01
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {language === "km" ? "ការធ្វើតេស្តវិភាគបុគ្គលិកលក្ខណៈ" : "Diagnostics & Discovery"}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-indigo-600">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Holland RIASEC & 16P</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 pt-4">
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] tracking-tight leading-snug">
                        {language === "km"
                          ? "១. ធ្វើតេស្តស្វែងយល់ពីខ្លួនឯងតាមបែបវិទ្យាសាស្ត្រ"
                          : "1. Validated Self-Discovery Assessment"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed font-medium">
                        {language === "km"
                          ? "ចំណាយពេលត្រឹម ១០ នាទីដើម្បីស្វែងយល់ពីចំណាប់អារម្មណ៍អាជីព និងបុគ្គលិកលក្ខណៈ ផ្អែកលើស្តង់ដារវិទ្យាសាស្ត្រ RIASEC និង 16P សម្រាប់សិស្សកម្ពុជា។"
                          : "Take a 10-minute validated interest and cognitive evaluation localized specifically for Cambodian students. Uncover your natural thinking style and academic motivation without guesswork."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {[
                        language === "km" ? "សំណួរ ៣០ សម្រិតសម្រាំងជាភាសាខ្មែរ និងអង់គ្លេស" : "30 localized question items in Khmer & English",
                        language === "km" ? "វិភាគចំណាប់អារម្មណ៍ RIASEC និងបុគ្គលិកលក្ខណៈ 16P" : "Validated 6-dimensional vocational psychology",
                        language === "km" ? "ទទួលបានលទ្ធផលភ្លាមៗដោយឥតគិតថ្លៃ" : "100% free with instant personalized archetype"
                      ].map((txt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Preview Box */}
                  <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-[#F8FAFD] border border-slate-200/80 rounded-2xl p-5 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-[#111965]">
                          {language === "km" ? "លទ្ធផលតេស្តវិជ្ជាជីវៈ" : "Vocational Alignment"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                        {language === "km" ? "ផ្ទៀងផ្ទាត់" : "Verified"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>{language === "km" ? "ស្រាវជ្រាវ (Investigative)" : "Investigative (I)"}</span>
                          <span className="font-mono text-indigo-600 font-bold">92%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: "92%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>{language === "km" ? "សិល្បៈ (Artistic)" : "Artistic (A)"}</span>
                          <span className="font-mono text-amber-600 font-bold">78%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "78%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>{language === "km" ? "សង្គម (Social)" : "Social (S)"}</span>
                          <span className="font-mono text-emerald-600 font-bold">65%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-2.5">
                      <BrainCircuit className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div className="text-[11px]">
                        <span className="font-bold text-[#111965] block">The Visionary Architect (INTJ)</span>
                        <span className="text-[#68708A] text-[10px]">
                          {language === "km" ? "សមត្ថភាពវិភាគ និងរៀបចំយុទ្ធសាស្ត្រ" : "Analytical & Systems Alignment"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              {/* Card 02: 4-Pillar Algorithmic Matching */}
              <ScrollStackItem itemClassName="min-h-[460px] md:h-[450px] flex flex-col justify-between p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl">
                {/* Top Tab Strip (Visually exposed when stacked) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                      02
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {language === "km" ? "ការផ្គូផ្គងជំនាញឆ្លាតវៃ" : "Algorithmic Alignment"}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
                    <Target className="w-3.5 h-3.5" />
                    <span>4-Pillar Transparent Engine</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 pt-4">
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] tracking-tight leading-snug">
                        {language === "km"
                          ? "២. វិធីសាស្ត្រផ្គូផ្គងជំនាញ ៤ សសរស្ដម្ភ"
                          : "2. 4-Pillar Algorithmic Matching"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed font-medium">
                        {language === "km"
                          ? "ក្បួនដោះស្រាយគណនាភាពស័ក្តិសម ដោយថ្លឹងថ្លែងរវាងចំណាប់អារម្មណ៍ផ្ទាល់ខ្លួន ថ្នាក់វិទ្យាល័យវិទ្យាសាស្ត្រ/សង្គម បុគ្គលិកលក្ខណៈ និងតម្រូវការទីផ្សារការងារកម្ពុជា។"
                          : "Our engine calculates your genuine academic fit by synthesizing interests (30%), BACII stream (25%), cognitive traits (25%), and real Cambodian economic demand (20%)."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {[
                        language === "km" ? "គណនាទម្ងន់ច្បាស់លាស់ គ្មានការទស្សន៍ទាយលម្អៀង" : "Mathematical formula without black-box guessing",
                        language === "km" ? "ពិនិត្យភាពត្រូវគ្នារវាងថ្នាក់វិទ្យាសាស្ត្រ/សង្គម និងជំនាញ" : "BACII Science vs. Social stream prerequisite check",
                        language === "km" ? "បង្ហាញពិន្ទុភាពស័ក្តិសមសម្រាប់រាល់ជំនាញ" : "Ranked compatibility scores across all programs"
                      ].map((txt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Preview Box */}
                  <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-[#F8FAFD] border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-[#111965]">
                          {language === "km" ? "រូបមន្តផ្គូផ្គង ៤ សសរស្ដម្ភ" : "Alignment Formula"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        100% Weight
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { label: language === "km" ? "ចំណាប់អារម្មណ៍ RIASEC" : "RIASEC Interests", pct: "30%", color: "bg-amber-500" },
                        { label: language === "km" ? "ថ្នាក់វិទ្យាសាស្ត្រ/សង្គម" : "BACII Stream Prereq", pct: "25%", color: "bg-blue-600" },
                        { label: language === "km" ? "បុគ្គលិកលក្ខណៈ 16P" : "16P Cognitive Style", pct: "25%", color: "bg-indigo-600" },
                        { label: language === "km" ? "តម្រូវការទីផ្សារការងារ NEA" : "Cambodia Market Demand", pct: "20%", color: "bg-emerald-600" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-white border border-slate-100">
                          <span className="font-semibold text-slate-700">{item.label}</span>
                          <span className="font-mono font-bold text-[#111965]">{item.pct}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">Top Match:</span>
                      <span className="font-bold text-[#111965]">CADT • Computer Science & AI</span>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              {/* Card 03: Verified Registrar Tuition */}
              <ScrollStackItem itemClassName="min-h-[460px] md:h-[450px] flex flex-col justify-between p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl">
                {/* Top Tab Strip (Visually exposed when stacked) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      03
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {language === "km" ? "សុចរិតភាពទិន្នន័យតម្លៃ" : "Data Integrity & Tuition"}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>MoEYS & Registrar Portals</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 pt-4">
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] tracking-tight leading-snug">
                        {language === "km"
                          ? "៣. ផ្ទៀងផ្ទាត់សាកលវិទ្យាល័យ និងតម្លៃពិត"
                          : "3. Verified Campus & Real Tuition Data"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed font-medium">
                        {language === "km"
                          ? "ប្រៀបធៀបតម្លៃសិក្សា ៤ ឆ្នាំពេញ និងលក្ខខណ្ឌចូលរៀនផ្លូវការដែលផ្ទៀងផ្ទាត់ផ្ទាល់ពីក្រសួងអប់រំ MoEYS និងការិយាល័យចុះឈ្មោះរបស់សាកលវិទ្យាល័យកំពូលៗ។"
                          : "Directly cross-referenced against official university registrar fee schedules and MoEYS accreditation standards. Compare 4-year total investment costs, laboratory accreditations, and entry cutoffs."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {[
                        language === "km" ? "តម្លៃពិតប្រាកដ គ្មានថ្លៃលាក់បាំង ៤ ឆ្នាំពេញ" : "$0 hidden fees — official 4-year tuition schedules",
                        language === "km" ? "ផ្ទៀងផ្ទាត់ការទទួលស្គាល់ពី MoEYS និងមន្ទីរពិសោធន៍" : "MoEYS accreditation & certified laboratory facilities",
                        language === "km" ? "លក្ខខណ្ឌពិន្ទុ និងនិទ្ទេសបាក់ឌុបជាក់លាក់" : "Grade cutoffs & entry requirements clearly stated"
                      ].map((txt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Preview Box */}
                  <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-[#F8FAFD] border border-slate-200/80 rounded-2xl p-5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-[#111965]">
                          {language === "km" ? "កាលវិភាគតម្លៃសិក្សាពិត" : "Verified Campus Tuition"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        2026 Ready
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { name: "RUPP (State)", fee: "$500 - $800 / yr", tag: "State Quota", bg: "bg-blue-50 text-blue-700" },
                        { name: "ITC Techno", fee: "$650 - $900 / yr", tag: "Certified Labs", bg: "bg-amber-50 text-amber-700" },
                        { name: "CADT (Tech)", fee: "$1,200 - $1,800 / yr", tag: "Techo Grants", bg: "bg-indigo-50 text-indigo-700" },
                      ].map((uni, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-[#111965] block">{uni.name}</span>
                            <span className="text-slate-500 font-mono text-[10px]">{uni.fee}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${uni.bg}`}>
                            {uni.tag}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === "km" ? "ផ្ទៀងផ្ទាត់ដោយការិយាល័យចុះឈ្មោះ" : "Cross-referenced with Official Registrar"}</span>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              {/* Card 04: Scholarship & Financial Aid Tracker */}
              <ScrollStackItem itemClassName="min-h-[460px] md:h-[450px] flex flex-col justify-between p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl">
                {/* Top Tab Strip (Visually exposed when stacked) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                      04
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {language === "km" ? "ឱកាសអាហារូបករណ៍រដ្ឋ" : "Financial Support & Grants"}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-purple-600">
                    <Award className="w-3.5 h-3.5" />
                    <span>State & Techo Grants</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 pt-4">
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] tracking-tight leading-snug">
                        {language === "km"
                          ? "៤. តាមដានអាហារូបករណ៍រដ្ឋ និងគ្រឹះស្ថាន"
                          : "4. Full-Ride State & Institutional Aid"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed font-medium">
                        {language === "km"
                          ? "ស្វែងរកអាហារូបករណ៍រដ្ឋ ១០០% អាហារូបករណ៍តេជោឌីជីថល CADT និងជំនួយហិរញ្ញវត្ថុផ្លូវការ មុនពេលផុតកំណត់កាលបរិច្ឆេទដាក់ពាក្យ។"
                          : "Identify 100% full-ride state scholarships, CADT Techo Digital Talent awards, and verified institutional grants before deadlines expire. Receive exam guides and checklists."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {[
                        language === "km" ? "ប្រមូលផ្តុំអាហារូបករណ៍ ១០០% និងអាហារូបករណ៍បច្ចេកវិទ្យា" : "100% full-ride state & tech scholarships tracked",
                        language === "km" ? "ការដាស់តឿនកាលបរិច្ឆេទ និងបញ្ជីឯកសារចាំបាច់" : "Real-time deadline countdown & eligibility checks",
                        language === "km" ? "ការណែនាំពីវិញ្ញាសាប្រឡង និងការសម្ភាស" : "Exam preparation guides & past paper tips"
                      ].map((txt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Preview Box */}
                  <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-[#F8FAFD] border border-slate-200/80 rounded-2xl p-5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-[#111965]">
                          {language === "km" ? "អាហារូបករណ៍កំពុងបើក" : "Active Scholarships"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
                        Live Radar
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111965]">MoEYS National Priority</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            100% Full-Ride
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">Grade A/B Priority • 4-Year Full Coverage</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111965]">CADT Techo Digital Talent</span>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Tuition + Stipend
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">National Exam Required • Monthly Living Support</p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-center justify-between text-[11px] text-amber-800 font-medium">
                      <span>{language === "km" ? "៣ កម្មវិធីជិតផុតកំណត់:" : "3 Deadlines Closing Soon:"}</span>
                      <span className="font-bold text-amber-900">14 Days Left</span>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              {/* Card 05: Confident Career Roadmap */}
              <ScrollStackItem itemClassName="min-h-[460px] md:h-[450px] flex flex-col justify-between p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl">
                {/* Top Tab Strip (Visually exposed when stacked) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                      05
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {language === "km" ? "ទំនុកចិត្តអនាគត និងគ្រួសារ" : "Future Ready & Family Roadmap"}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>NEA Salary Benchmarks</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 pt-4">
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] tracking-tight leading-snug">
                        {language === "km"
                          ? "៥. កំណត់ទិសដៅអាជីព និងពិភាក្សាជាមួយគ្រួសារ"
                          : "5. NEA Salary Realities & Family Alignment"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed font-medium">
                        {language === "km"
                          ? "ស្វែងយល់ពីកម្រិតប្រាក់បៀវត្សរ៍ជាក់ស្តែងពីទីភ្នាក់ងារជាតិមុខរបរ និងការងារ (NEA) និន្នាការទីផ្សារ ៥ ឆ្នាំទៅមុខ និងទាញយករបាយការណ៍ដើម្បីពិភាក្សាជាមួយគ្រួសារ។"
                          : "Review authentic Cambodian salary benchmarks from the National Employment Agency (NEA), 5-year job market forecasts, and generate an executive summary report to share with parents and counselors."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {[
                        language === "km" ? "ទិន្នន័យប្រាក់បៀវត្សរ៍ផ្លូវការពីទីភ្នាក់ងារជាតិ NEA" : "Cambodian NEA official salary range benchmarks",
                        language === "km" ? "ការព្យាករណ៍តម្រូវការទីផ្សារការងាររយៈពេល ៥ ឆ្នាំ" : "5-year sector growth forecasts (AI, Fintech, Engineering)",
                        language === "km" ? "ទាញយករបាយការណ៍សង្ខេបសម្រាប់ពិភាក្សាជាមួយឪពុកម្តាយ" : "One-click shareable diagnostic PDF report for parents"
                      ].map((txt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Preview Box */}
                  <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-[#F8FAFD] border border-slate-200/80 rounded-2xl p-5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-[#111965]">
                          {language === "km" ? "ទិន្នន័យប្រាក់បៀវត្សរ៍ NEA" : "NEA Salary Benchmarks"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                        Official NEA
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="p-2 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-[#111965] block">Software / AI Engineer</span>
                          <span className="text-slate-500 text-[10px]">High Demand Sector</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">$600 - $2,400+</span>
                      </div>

                      <div className="p-2 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-[#111965] block">Data Science & Analytics</span>
                          <span className="text-slate-500 text-[10px]">Rapid Growth Sector</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">$550 - $2,100+</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#111965] to-[#1A2580] text-white flex items-center justify-between text-[11px]">
                      <span className="font-semibold">{language === "km" ? "របាយការណ៍សង្ខេបសម្រាប់គ្រួសារ:" : "Parent Diagnostic Summary:"}</span>
                      <span className="font-mono text-amber-300 font-bold">PDF Ready</span>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            </ScrollStack>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. METHODOLOGY & DATA INTEGRITY FAQ */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
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
