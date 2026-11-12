"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HardHat,
  BrainCircuit,
  HeartHandshake,
  TrendingUp,
  FileCheck,
  ChevronRight,
  BookOpen,
  Briefcase,
  HelpCircle,
  GraduationCap,
  ShieldCheck,
  Check,
  BadgeCheck,
  Zap,
} from "lucide-react";

// =========================================================================
// 6 Holland RIASEC Framework Detailed Data (Bilingual)
// =========================================================================
const RIASEC_DIMENSIONS: Record<
  string,
  {
    code: string;
    letter: string;
    nameEn: string;
    nameKm: string;
    roleEn: string;
    roleKm: string;
    taglineEn: string;
    taglineKm: string;
    icon: any;
    color: string;
    badgeBg: string;
    strengths: { en: string; km: string }[];
    sampleMajors: { nameEn: string; nameKm: string; slug: string }[];
    sampleCareers: { en: string; km: string }[];
    sampleQuestions: { en: string; km: string }[];
  }
> = {
  R: {
    code: "R",
    letter: "Realistic",
    nameEn: "Realistic (The Practical Builder)",
    nameKm: "ជាក់ស្តែង (អ្នកអនុវត្ត និងសាងសង់)",
    roleEn: "Hands-on, physical, mechanical & tangible problem solving",
    roleKm: "ចូលចិត្តដោះស្រាយបញ្ហាជាក់ស្តែង ប្រើប្រាស់ឧបករណ៍ និងប្រព័ន្ធរូបវន្ត",
    taglineEn:
      "Realistic individuals prefer working with their hands, machinery, tools, electrical hardware, or outdoor construction systems.",
    taglineKm:
      "មនុស្សប្រភេទជាក់ស្តែងចូលចិត្តការងារអនុវត្តផ្ទាល់ដៃ ជាមួយគ្រឿងចក្រ ឧបករណ៍បច្ចេកទេស និងការដ្ឋានសំណង់។",
    icon: HardHat,
    color: "#D97706",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    strengths: [
      { en: "Spatial Reasoning & Blueprint Literacy", km: "ការយល់ដឹងអំពីលំហ និងប្លង់បច្ចេកទេស" },
      { en: "Practical Hardware Troubleshooting", km: "ការដោះស្រាយបញ្ហាឧបករណ៍បច្ចេកទេស" },
      { en: "Structural Precision & Construction", km: "ភាពច្បាស់លាស់នៃរចនាសម្ព័ន្ធរូបវន្ត" },
      { en: "Endurance in Fieldwork Environments", km: "ភាពធន់ក្នុងបរិយាកាសការងារផ្ទាល់" },
    ],
    sampleMajors: [
      { nameEn: "Civil Engineering", nameKm: "វិស្វកម្មសំណង់ស៊ីវិល", slug: "civil-engineering" },
      { nameEn: "Mechanical & Robotics Engineering", nameKm: "វិស្វកម្មមេកានិច និងរ៉ូបូត", slug: "mechanical-engineering" },
      { nameEn: "Architecture & Urban Planning", nameKm: "ស្ថាបត្យកម្ម និងនគរូបនីយវិទ្យា", slug: "architecture" },
      { nameEn: "Electrical & Energy Engineering", nameKm: "វិស្វកម្មអគ្គិសនី និងថាមពល", slug: "electrical-engineering" },
    ],
    sampleCareers: [
      { en: "Structural Civil Engineer", km: "វិស្វកររចនាសម្ព័ន្ធសំណង់" },
      { en: "Robotics Hardware Specialist", km: "អ្នកជំនាញផ្នែករឹង និងរ៉ូបូត" },
      { en: "Building Operations Manager", km: "អ្នកគ្រប់គ្រងប្រតិបត្តិការសំណង់" },
      { en: "Site Safety & Surveying Engineer", km: "វិស្វករសុវត្ថិភាព និងវាស់វែងដីធ្លី" },
    ],
    sampleQuestions: [
      { en: "I enjoy assembling electronic devices or fixing mechanical components.", km: "ខ្ញុំចូលចិត្តតម្លើងគ្រឿងអេឡិចត្រូនិក ឬជួសជុលឧបករណ៍មេកានិច។" },
      { en: "I prefer working on outdoor projects over sitting at a desk all day.", km: "ខ្ញុំចូលចិត្តធ្វើការលើគម្រោងខាងក្រៅជាជាងអង្គុយមុខកុំព្យូទ័រពេញមួយថ្ងៃ។" },
    ],
  },
  I: {
    code: "I",
    letter: "Investigative",
    nameEn: "Investigative (The Analytical Thinker)",
    nameKm: "ស្រាវជ្រាវ (អ្នកវិភាគ និងស្រាវជ្រាវស៊ីជម្រៅ)",
    roleEn: "Scientific inquiry, algorithmic logic, data models & mathematics",
    roleKm: "ចូលចិត្តការស្រាវជ្រាវបែបបញ្ញា តក្កវិជ្ជាក្បួនដោះស្រាយ និងវិទ្យាសាស្ត្រ",
    taglineEn:
      "Investigative individuals love solving complex abstract problems through intellectual curiosity, scientific research, and data analysis.",
    taglineKm:
      "មនុស្សប្រភេទស្រាវជ្រាវចូលចិត្តដោះស្រាយបញ្ហាស្មុគស្មាញតាមរយៈការស្រាវជ្រាវវិទ្យាសាស្ត្រ និងការវិភាគទិន្នន័យស៊ីជម្រៅ។",
    icon: BrainCircuit,
    color: "#2563EB",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    strengths: [
      { en: "Algorithmic Logic & Coding Formulation", km: "តក្កវិជ្ជាក្បួនដោះស្រាយ និងការសរសេរកូដ" },
      { en: "Statistical Analysis & Empirical Modeling", km: "ការវិភាគស្ថិតិ និងការបង្កើតគំរូទិន្នន័យ" },
      { en: "Complex Problem Decomposition", km: "ការបំបែកបញ្ហាស្មុគស្មាញជាផ្នែកៗ" },
      { en: "Scientific Hypothesis Testing", km: "ការធ្វើតេស្តសម្មតិកម្មបែបវិទ្យាសាស្ត្រ" },
    ],
    sampleMajors: [
      { nameEn: "Computer Science & Software Engineering", nameKm: "វិទ្យាសាស្ត្រកុំព្យូទ័រ & វិស្វកម្មសូហ្វវែរ", slug: "software-engineering" },
      { nameEn: "Data Science & Artificial Intelligence", nameKm: "វិទ្យាសាស្ត្រទិន្នន័យ និងបញ្ញាសិប្បនិម្មិត", slug: "data-science-ai" },
      { nameEn: "Cybersecurity & Network Defense", nameKm: "សន្តិសុខសាយប័រ និងប្រព័ន្ធបណ្តាញ", slug: "cybersecurity" },
      { nameEn: "Biomedical Science & Biotechnology", nameKm: "ជីវវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យាជីវៈ", slug: "biotechnology" },
    ],
    sampleCareers: [
      { en: "Full-Stack Software Engineer", km: "វិស្វករកម្មវិធី Full-Stack" },
      { en: "AI / Machine Learning Researcher", km: "អ្នកស្រាវជ្រាវបញ្ញាសិប្បនិម្មិត (AI)" },
      { en: "Data Scientist & Analytics Architect", km: "អ្នកវិទ្យាសាស្ត្រទិន្នន័យ" },
      { en: "Cyber Defense Security Analyst", km: "អ្នកវិភាគការពារសន្តិសុខសាយប័រ" },
    ],
    sampleQuestions: [
      { en: "I enjoy analyzing data to identify underlying patterns and solve puzzles.", km: "ខ្ញុំចូលចិត្តវិភាគទិន្នន័យដើម្បីស្វែងរកលំនាំ និងដោះស្រាយចំណោទស្មុគស្មាញ។" },
      { en: "I find deep satisfaction in writing code or studying mathematical models.", km: "ខ្ញុំមានការពេញចិត្តខ្លាំងពេលសរសេរកូដ ឬសិក្សាគំរូគណិតវិទ្យា។" },
    ],
  },
  A: {
    code: "A",
    letter: "Artistic",
    nameEn: "Artistic (The Creative Innovator)",
    nameKm: "សិល្បៈ (អ្នកច្នៃប្រឌិត និងនវានុវត្តន៍)",
    roleEn: "Visual expression, design architecture, storytelling & original ideas",
    roleKm: "ចូលចិត្តការបញ្ចេញគំនិតច្នៃប្រឌិត ការរចនា និងស្ថាបត្យកម្មឌីជីថល",
    taglineEn:
      "Artistic individuals thrive in unstructured environments where they can express originality, design digital experiences, and communicate visually.",
    taglineKm:
      "មនុស្សប្រភេទសិល្បៈរីកចម្រើនក្នុងបរិយាកាសច្នៃប្រឌិត ដែលអាចបញ្ចេញគំនិតដើម និងរចនាបទពិសោធន៍ឌីជីថល។",
    icon: Sparkles,
    color: "#9333EA",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    strengths: [
      { en: "Visual Aesthetics & UI/UX Product Empathy", km: "សោភ័ណភាពគំហើញរូបភាព និងការយល់ចិត្តអ្នកប្រើ UI/UX" },
      { en: "Original Concept Ideation", km: "ការបង្កើតគំនិតច្នៃប្រឌិតដើមថ្មីៗ" },
      { en: "Multimedia Narrative & Brand Storytelling", km: "ការនិទានរឿងម៉ាកសញ្ញាតាមមេឌា" },
      { en: "Creative Direction & Typography", km: "ការដឹកនាំផ្នែកច្នៃប្រឌិត និងការរចនាអក្សរ" },
    ],
    sampleMajors: [
      { nameEn: "Digital Media Design & Animation", nameKm: "ការរចនាឌីជីថលមេឌា និងគំនូរជីវចល", slug: "digital-media-design" },
      { nameEn: "UI/UX Product Architecture", nameKm: "ស្ថាបត្យកម្មផលិតផល UI/UX", slug: "ui-ux-design" },
      { nameEn: "Creative Advertising & Communications", nameKm: "ការផ្សព្វផ្សាយពាណិជ្ជកម្ម និងទំនាក់ទំនង", slug: "advertising-communications" },
      { nameEn: "Interior & Spatial Architecture", nameKm: "ការរចនាផ្ទៃក្នុង និងស្ថាបត្យកម្មលំហ", slug: "interior-design" },
    ],
    sampleCareers: [
      { en: "Lead Product / UI-UX Designer", km: "ប្រធានអ្នករចនាផលិតផល UI/UX" },
      { en: "Creative Media Director", km: "នាយកផ្នែកច្នៃប្រឌិតមេឌា" },
      { en: "3D Motion & Visual Effects Artist", km: "សិល្បករ 3D Motion និង Visual Effects" },
      { en: "Brand Identity Strategist", km: "អ្នករៀបចំយុទ្ធសាស្ត្រម៉ាកសញ្ញា" },
    ],
    sampleQuestions: [
      { en: "I love designing visually stunning interfaces, graphics, or spaces.", km: "ខ្ញុំចូលចិត្តរចនាទម្រង់បង្ហាញរូបភាព ក្រាហ្វិក ឬលំហដែលមានសោភ័ណភាព។" },
      { en: "I prefer flexible workflows where I can innovate over rigid rules.", km: "ខ្ញុំចូលចិត្តការងារដែលអាចបង្កើតថ្មីជាជាងធ្វើតាមច្បាប់តឹងរ៉ឹង។" },
    ],
  },
  S: {
    code: "S",
    letter: "Social",
    nameEn: "Social (The Empathetic Helper)",
    nameKm: "សង្គម (អ្នកជួយ និងអភិវឌ្ឍមនុស្ស)",
    roleEn: "Teaching, psychological counseling, healthcare & community growth",
    roleKm: "ចូលចិត្តការបង្រៀន ប្រឹក្សាយោបល់ សុខាភិបាល និងការជួយសហគមន៍",
    taglineEn:
      "Social individuals find purpose in guiding, teaching, treating, and counseling others to help people and communities thrive.",
    taglineKm:
      "មនុស្សប្រភេទសង្គមមានគោលបំណងច្បាស់លាស់ក្នុងការជួយ បង្រៀន ព្យាបាល និងប្រឹក្សាយោបល់ដល់មនុស្សជុំវិញខ្លួន។",
    icon: HeartHandshake,
    color: "#059669",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    strengths: [
      { en: "Empathetic Active Listening", km: "ការស្តាប់ដោយការយល់ចិត្តខ្ពស់" },
      { en: "Pedagogical Clarity & Knowledge Transfer", km: "ភាពច្បាស់លាស់ក្នុងការបង្រៀន និងផ្ទេរចំណេះដឹង" },
      { en: "Social Emotional Intelligence & Conflict Care", km: "បញ្ញាផ្លូវចិត្ត និងការសម្របសម្រួលជម្លោះ" },
      { en: "Community Advocacy & Public Relations", km: "ការតស៊ូមតិ និងការផ្សារភ្ជាប់សហគមន៍" },
    ],
    sampleMajors: [
      { nameEn: "Psychology & Behavioral Counseling", nameKm: "ចិត្តវិទ្យា និងការប្រឹក្សាយោបល់", slug: "psychology" },
      { nameEn: "Education Leadership & Teaching (TEFL)", nameKm: "ភាពជាអ្នកដឹកនាំអប់រំ និងគរុកោសល្យ", slug: "education" },
      { nameEn: "Public Health & Healthcare Administration", nameKm: "សុខភាពសាធារណៈ និងរដ្ឋបាលមន្ទីរពេទ្យ", slug: "public-health" },
      { nameEn: "International Relations & Diplomacy", nameKm: "ទំនាក់ទំនងអន្តរជាតិ និងការទូត", slug: "international-relations" },
    ],
    sampleCareers: [
      { en: "Higher Ed Vocational Counselor", km: "អ្នកប្រឹក្សាយោបល់តម្រង់ទិសអាជីព" },
      { en: "Clinical Child & Adult Psychologist", km: "ចិត្តវិទូព្យាបាលកុមារ និងមនុស្សពេញវ័យ" },
      { en: "NGO Humanitarian Program Director", km: "នាយកកម្មវិធីមនុស្សធម៌អង្គការក្រៅរដ្ឋាភិបាល" },
      { en: "Corporate People & Culture Lead", km: "ប្រធានគ្រប់គ្រងធនធានមនុស្ស និងវប្បធម៌" },
    ],
    sampleQuestions: [
      { en: "I feel energized when helping someone overcome personal or academic challenges.", km: "ខ្ញុំមានកម្លាំងចិត្តខ្លាំងពេលបានជួយអ្នកដទៃឱ្យឆ្លងផុតបញ្ហាលំបាក។" },
      { en: "I communicate ideas patiently and enjoy mentoring younger students.", km: "ខ្ញុំពូកែពន្យល់ និងចូលចិត្តណែនាំប្អូនៗជំនាន់ក្រោយ។" },
    ],
  },
  E: {
    code: "E",
    letter: "Enterprising",
    nameEn: "Enterprising (The Strategic Leader)",
    nameKm: "សហគ្រិន (អ្នកដឹកនាំយុទ្ធសាស្ត្រ និងធុរកិច្ច)",
    roleEn: "Executive leadership, startup business, negotiation & venture growth",
    roleKm: "ចូលចិត្តភាពជាអ្នកដឹកនាំ ធុរកិច្ចថ្មី ការចរចា និងការរីកចម្រើនខ្ពស់",
    taglineEn:
      "Enterprising individuals enjoy taking initiative, persuading people, managing teams, and launching commercial or technological ventures.",
    taglineKm:
      "មនុស្សប្រភេទសហគ្រិនចូលចិត្តការចាប់ផ្តើមគំនិតថ្មី ការបញ្ចុះបញ្ចូល ការដឹកនាំក្រុម និងការបង្កើតអាជីវកម្ម។",
    icon: TrendingUp,
    color: "#DC2626",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    strengths: [
      { en: "High-Stakes Persuasion & Public Pitching", km: "ការបញ្ចុះបញ្ចូល និងការធ្វើបទបង្ហាញយុទ្ធសាស្ត្រ" },
      { en: "Calculated Commercial Risk Taking", km: "ការទទួលយកហានិភ័យធុរកិច្ចដោយការគិតគូរ" },
      { en: "Executive Delegation & Operational Drive", km: "ការបែងចែកការងារ និងការជំរុញលទ្ធផល" },
      { en: "Venture Financing & Capital Strategy", km: "យុទ្ធសាស្ត្រហិរញ្ញវត្ថុ និងការស្វែងរកដើមទុន" },
    ],
    sampleMajors: [
      { nameEn: "FinTech & Investment Banking", nameKm: "បច្ចេកវិទ្យាហិរញ្ញវត្ថុ (FinTech) និងធនាគារ", slug: "fintech" },
      { nameEn: "International Business Management", nameKm: "ការគ្រប់គ្រងពាណិជ្ជកម្មអន្តរជាតិ", slug: "international-business" },
      { nameEn: "Commercial Law & Corporate Governance", nameKm: "នីតិពាណិជ្ជកម្ម និងអភិបាលកិច្ចក្រុមហ៊ុន", slug: "commercial-law" },
      { nameEn: "Entrepreneurship & Digital Marketing", nameKm: "សហគ្រិនភាព និងទីផ្សារឌីជីថល", slug: "entrepreneurship" },
    ],
    sampleCareers: [
      { en: "Tech Startup Founder / Executive", km: "ស្ថាបនិកក្រុមហ៊ុនបច្ចេកវិទ្យា / អគ្គនាយក" },
      { en: "Venture Capital & Investment Analyst", km: "អ្នកវិភាគការបណ្តាក់ទុនវិនិយោគ (VC)" },
      { en: "Commercial Real Estate & Trade Director", km: "នាយកពាណិជ្ជកម្ម និងអចលនទ្រព្យ" },
      { en: "Enterprise Growth & Partnerships Lead", km: "ប្រធានផ្នែកពង្រីកទីផ្សារ និងដៃគូពាណិជ្ជកម្ម" },
    ],
    sampleQuestions: [
      { en: "I enjoy leading projects, delegating tasks, and motivating teams to succeed.", km: "ខ្ញុំចូលចិត្តដឹកនាំគម្រោង ចាត់ចែងការងារ និងលើកទឹកចិត្តក្រុមឱ្យសម្រេចគោលដៅ។" },
      { en: "I am comfortable negotiating deals and presenting in front of large audiences.", km: "ខ្ញុំមានទំនុកចិត្តក្នុងការចរចា និងធ្វើបទបង្ហាញចំពោះមុខមនុស្សច្រើន។" },
    ],
  },
  C: {
    code: "C",
    letter: "Conventional",
    nameEn: "Conventional (The Systems Organizer)",
    nameKm: "ការិយាល័យ (អ្នករៀបចំប្រព័ន្ធ និងព័ត៌មាន)",
    roleEn: "Accounting, statutory compliance, audit precision & data governance",
    roleKm: "ចូលចិត្តភាពសុក្រឹតនៃគណនេយ្យ ច្បាប់ អនុលោមភាព និងទិន្នន័យ",
    taglineEn:
      "Conventional individuals value precision, order, financial integrity, structured routines, and data reliability.",
    taglineKm:
      "មនុស្សប្រភេទការិយាល័យឱ្យតម្លៃលើភាពសុក្រឹត លំដាប់លំដោយ ភាពស្មោះត្រង់ផ្នែកហិរញ្ញវត្ថុ និងប្រព័ន្ធទិន្នន័យ។",
    icon: FileCheck,
    color: "#475569",
    badgeBg: "bg-slate-50 text-slate-700 border-slate-200",
    strengths: [
      { en: "Financial Accounting & Statutory Audit Precision", km: "ភាពសុក្រឹតនៃគណនេយ្យ និងសវនកម្មច្បាប់" },
      { en: "Regulatory Compliance & Risk Monitoring", km: "ការត្រួតពិនិត្យអនុលោមភាព និងហានិភ័យ" },
      { en: "Relational Database Structure & Record Keeping", km: "ការរៀបចំរចនាសម្ព័ន្ធទិន្នន័យ និងកំណត់ត្រា" },
      { en: "Standard Operating Procedure Optimization", km: "ការកែលម្អនីតិវិធីប្រតិបត្តិការស្តង់ដារ (SOP)" },
    ],
    sampleMajors: [
      { nameEn: "Professional Accounting & Audit (ACCA)", nameKm: "គណនេយ្យ និងសវនកម្មវិជ្ជាជីវៈ (ACCA)", slug: "accounting-audit" },
      { nameEn: "Enterprise Information Systems (ERP)", nameKm: "ប្រព័ន្ធព័ត៌មានវិទ្យាគ្រប់គ្រងសហគ្រាស (ERP)", slug: "information-systems" },
      { nameEn: "Banking Operations & Financial Risk", nameKm: "ប្រតិបត្តិការធនាគារ និងហានិភ័យហិរញ្ញវត្ថុ", slug: "banking-finance" },
      { nameEn: "Supply Chain & Logistics Compliance", nameKm: "ខ្សែច្រវាក់ផ្គត់ផ្គង់ និងភស្តុភារកម្ម", slug: "supply-chain" },
    ],
    sampleCareers: [
      { en: "Chartered Financial Auditor", km: "សវនករហិរញ្ញវត្ថុដែលមានអាជ្ញាប័ណ្ណ" },
      { en: "Banking Compliance & Anti-Fraud Officer", km: "មន្ត្រីអនុលោមភាពធនាគារ និងប្រឆាំងការក្លែងបន្លំ" },
      { en: "ERP Enterprise Database Administrator", km: "អ្នកគ្រប់គ្រងមូលដ្ឋានទិន្នន័យសហគ្រាស ERP" },
      { en: "Corporate Tax Strategy Specialist", km: "អ្នកឯកទេសយុទ្ធសាស្ត្រពន្ធដារសាជីវកម្ម" },
    ],
    sampleQuestions: [
      { en: "I take pride in keeping records, budgets, and databases impeccably organized.", km: "ខ្ញុំមានមោទនភាពក្នុងការរៀបចំកំណត់ត្រា ថវិកា និងទិន្នន័យឱ្យមានសណ្តាប់ធ្នាប់ល្អឥតខ្ចោះ។" },
      { en: "I prefer working in structured environments with clear guidelines over ambiguity.", km: "ខ្ញុំចូលចិត្តធ្វើការក្នុងបរិយាកាសដែលមានគោលការណ៍ណែនាំច្បាស់លាស់។" },
    ],
  },
};

// Top Holland 3-Letter Code Combinations in Cambodia
const HOLLAND_COMBINATIONS = [
  {
    code: "IAS",
    titleEn: "Software & AI Architect",
    titleKm: "ស្ថាបត្យករសូហ្វវែរ និង AI",
    descEn: "Combines deep algorithmic logic (I) with creative product architecture (A) and team collaboration (S).",
    descKm: "រួមបញ្ចូលតក្កវិជ្ជាក្បួនដោះស្រាយ (I) ជាមួយការរចនាផលិតផល (A) និងការងារក្រុម (S)។",
    color: "#2563EB",
  },
  {
    code: "RIE",
    titleEn: "Civil & Infrastructure Engineer",
    titleKm: "វិស្វករសំណង់ និងហេដ្ឋារចនាសម្ព័ន្ធ",
    descEn: "Hands-on construction precision (R) coupled with analytical math (I) and project leadership (E).",
    descKm: "ការអនុវត្តសំណង់ជាក់ស្តែង (R) គួបផ្សំជាមួយគណិតវិទ្យាវិភាគ (I) និងការដឹកនាំគម្រោង (E)។",
    color: "#D97706",
  },
  {
    code: "ESC",
    titleEn: "FinTech & Corporate Executive",
    titleKm: "នាយកប្រតិបត្តិហិរញ្ញវត្ថុ និងធុរកិច្ច",
    descEn: "Strategic venture leadership (E) paired with empathetic negotiation (S) and accounting rigor (C).",
    descKm: "ភាពជាអ្នកដឹកនាំធុរកិច្ច (E) គួបផ្សំជាមួយការចរចា (S) និងភាពម៉ត់ចត់ផ្នែកគណនេយ្យ (C)។",
    color: "#DC2626",
  },
  {
    code: "SAE",
    titleEn: "Education & Human Development",
    titleKm: "ការអភិវឌ្ឍធនធានមនុស្ស និងអប់រំ",
    descEn: "People-first empathy (S) supported by creative storytelling (A) and strategic community advocacy (E).",
    descKm: "ការយកចិត្តទុកដាក់លើមនុស្ស (S) គាំទ្រដោយការច្នៃប្រឌិត (A) និងការតស៊ូមតិសហគមន៍ (E)។",
    color: "#059669",
  },
];

export default function RiasecDetailPage() {
  const { language } = useLanguage();
  const [activeCode, setActiveCode] = useState<string>("I");

  const current = RIASEC_DIMENSIONS[activeCode] || RIASEC_DIMENSIONS["I"];
  const CurrentIcon = current.icon;

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden border-b border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-black uppercase tracking-wider shadow-2xs">
            <Compass className="w-4 h-4 text-amber-600" />
            <span>
              {language === "km"
                ? "ទ្រឹស្តីចិត្តវិទ្យាអាជីព JOHN HOLLAND"
                : "John Holland's Vocational Psychology Standard"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#111965] tracking-tight leading-tight">
            {language === "km" ? (
              <>
                ស្វែងយល់ពីចំណាប់អារម្មណ៍អាជីព <br className="hidden sm:inline" />
                <span className="text-amber-600">Holland RIASEC</span> ទាំង ៦ វិមាត្រ
              </>
            ) : (
              <>
                Discover Your Authentic <br className="hidden sm:inline" />
                <span className="text-amber-600">Holland RIASEC</span> Vocational Profile
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium">
            {language === "km"
              ? "តេស្ត Holland RIASEC គឺជាស្តង់ដារសកលលេខ ១ ក្នុងការតម្រង់ទិសអាជីព។ Futera បានសម្រិតសម្រាំងសំណួរចំនួន ៣០ ឱ្យស្របតាមបរិបទកម្ពុជា ដើម្បីជួយសិស្សស្វែងរកជំនាញសាកលវិទ្យាល័យដែលត្រូវនឹងចំណង់ចំណូលចិត្តពិតប្រាកដ។"
              : "The Holland RIASEC diagnostic is the world's most validated vocational guidance assessment. Futera localizes all 30 questions for Cambodian higher education, measuring your natural affinity across 6 work personality dimensions."}
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === "km" ? "៣០ សំណួរជាក់ស្តែង" : "30 Localized Items"}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === "km" ? "រយៈពេល ១០–១២ នាទី" : "10–12 Minutes"}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === "km" ? "ឥតគិតថ្លៃ ១០០%" : "100% Free for Students"}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>{language === "km" ? "ផ្គូផ្គង ១២០+ ជំនាញកម្ពុជា" : "120+ Cambodian Majors"}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/assessments/riasec"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#111965] hover:bg-[#1A2580] text-white text-sm font-black transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{language === "km" ? "ចាប់ផ្តើមធ្វើតេស្ត RIASEC" : "Start Free RIASEC Assessment"}</span>
              <ArrowRight className="w-4 h-4 text-[#F7CE4D]" />
            </Link>
            <a
              href="#dimensions-explorer"
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors text-center"
            >
              {language === "km" ? "ស្វែងយល់វិមាត្រទាំង ៦" : "Explore 6 Dimensions"}
            </a>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE 6-DIMENSION EXPLORER */}
      <section id="dimensions-explorer" className="py-16 lg:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111965]/10 text-[#111965] text-xs font-black uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>{language === "km" ? "ស្វែងយល់តាមវិមាត្រនីមួយៗ" : "Interactive Dimension Explorer"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
            {language === "km"
              ? "តើអ្នកស្ថិតក្នុងក្រុមបុគ្គលិកលក្ខណៈការងារមួយណា?"
              : "Which Vocational Archetype Best Represents You?"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            {language === "km"
              ? "ចុចលើអក្សរនីមួយៗនៃ R-I-A-S-E-C ដើម្បីពិនិត្យមើលចំណុចខ្លាំង ការងារត្រូវគ្នានៅកម្ពុជា និងសំណួរតេស្តគំរូ៖"
              : "Select any of the 6 letters below to inspect its cognitive strengths, verified Cambodian university majors, career paths, and sample questions."}
          </p>
        </div>

        {/* 6 Dimension Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(RIASEC_DIMENSIONS).map(([code, info]) => {
            const isSelected = activeCode === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setActiveCode(code)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden ${
                  isSelected
                    ? "bg-[#111965] text-white border-[#111965] shadow-lg ring-2 ring-[#111965]/20 scale-[1.02]"
                    : "bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black font-mono px-2 py-0.5 rounded-lg ${
                      isSelected
                        ? "bg-white/20 text-[#F7CE4D]"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {code}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: info.color }}
                  />
                </div>
                <div className="text-sm font-black mt-2 truncate">
                  {language === "km" ? info.nameKm.split(" ")[0] : info.letter}
                </div>
                <div
                  className={`text-[10px] mt-0.5 line-clamp-1 ${
                    isSelected ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {language === "km" ? info.roleKm : info.roleEn}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Showcase Card for Active Dimension */}
        <div
          className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 transition-all duration-300"
          style={{ borderLeftWidth: "6px", borderLeftColor: current.color }}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                style={{ backgroundColor: current.color }}
              >
                <CurrentIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md font-mono"
                    style={{ backgroundColor: `${current.color}15`, color: current.color }}
                  >
                    Dimension Code {current.code}
                  </span>
                  <span className="text-xs font-bold text-slate-400">• John Holland Standard</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#111965] tracking-tight mt-0.5">
                  {language === "km" ? current.nameKm : current.nameEn}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80">
              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === "km" ? "សុពលភាពវិទ្យាសាស្ត្រកម្រិតខ្ពស់" : "Validated Psychometric Profile"}</span>
            </div>
          </div>

          {/* Philosophy / Tagline */}
          <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            {language === "km" ? current.taglineKm : current.taglineEn}
          </p>

          {/* 3 Detail Columns: Strengths, Majors, Careers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {/* 1. Core Cognitive Strengths */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-[#111965] uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4 text-slate-500" />
                <span>{language === "km" ? "ចំណុចខ្លាំងនៃការគិតស្នូល" : "Core Cognitive Strengths"}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {current.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium leading-snug">
                      {language === "km" ? str.km : str.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Aligned Cambodian University Majors */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-[#111965] uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-slate-500" />
                <span>{language === "km" ? "ជំនាញសាកលវិទ្យាល័យដែលត្រូវគ្នា" : "Matching Cambodian Majors"}</span>
              </div>
              <div className="space-y-1.5">
                {current.sampleMajors.map((m, idx) => (
                  <Link
                    key={idx}
                    href={`/majors/${m.slug}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/90 transition-colors text-xs font-bold text-[#111965] group"
                  >
                    <span className="truncate">{language === "km" ? m.nameKm : m.nameEn}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#111965] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Target Career Roles */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-[#111965] uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-slate-500" />
                <span>{language === "km" ? "អាជីពការងារគោលដៅនៅកម្ពុជា" : "Target Career Roles"}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {current.sampleCareers.map((car, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: current.color }}
                    />
                    <span className="font-medium leading-snug">
                      {language === "km" ? car.km : car.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sample Questions Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
            <span className="font-black text-amber-900 uppercase tracking-wider block">
              {language === "km" ? "សំណួរគំរូជាក់ស្តែងក្នុងតេស្ត:" : "Sample Diagnostic Question Items:"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-950 font-medium">
              {current.sampleQuestions.map((q, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/80 border border-amber-200/50 flex items-start gap-2">
                  <span className="font-mono font-bold text-amber-600">0{idx + 1}.</span>
                  <span>{language === "km" ? q.km : q.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOLLAND CODE COMBINATIONS */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              {language === "km" ? "កូដ ៣ តួអក្សរ HOLLAND" : "The Holland 3-Letter Code"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
              {language === "km" ? "របៀបដែលកូដ RIASEC បង្ហាញពីអនាគតរបស់អ្នក" : "How Your Top 3 Codes Shape Your Major"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              {language === "km"
                ? "មនុស្សម្នាក់ៗមិនមែនមានតែវិមាត្រ ១ នោះទេ។ តេស្តនឹងគណនាកូដ ៣ តួអក្សរចម្បងរបស់អ្នក (ឧទាហរណ៍៖ IAS, RIE) ដើម្បីផ្គូផ្គងជាមួយមុខជំនាញជាក់លាក់។"
                : "No student fits into just one box. The assessment generates your top 3-letter Holland Code (e.g. IAS, RIE) to create an exact mathematical fingerprint for major matching."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOLLAND_COMBINATIONS.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#F8FAFD] border border-slate-200/80 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-lg font-black font-mono px-3 py-1 rounded-xl text-white shadow-xs"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.code}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Archetype {idx + 1}</span>
                </div>
                <h4 className="text-base font-black text-[#111965]">
                  {language === "km" ? item.titleKm : item.titleEn}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {language === "km" ? item.descKm : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA BANNER */}
      <section className="py-16 lg:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-linear-to-r from-[#111965] to-[#1A2580] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-black text-[#F7CE4D] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{language === "km" ? "ធ្វើតេស្តឥតគិតថ្លៃ" : "Free Assessment"}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === "km"
                ? "ត្រៀមខ្លួនស្វែងរកកូដ RIASEC របស់អ្នកហើយឬនៅ?"
                : "Ready to Discover Your RIASEC Code?"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {language === "km"
                ? "ចំណាយពេលត្រឹមតែ ១០ នាទី ដើម្បីឆ្លើយសំណួរ ៣០ ហើយទទួលបានរបាយការណ៍វិភាគលម្អិត និងជំនាញដែលត្រូវគ្នា ១០០%។"
                : "Takes only 10 minutes. Get an instant, comprehensive breakdown of your top vocational dimensions and matching Cambodian majors."}
            </p>
          </div>

          <Link
            href="/dashboard/assessments/riasec"
            className="px-6 py-4 rounded-2xl bg-[#F7CE4D] hover:bg-[#F5C430] text-[#111965] text-sm font-black transition-transform active:scale-95 shadow-lg shrink-0 flex items-center gap-2"
          >
            <span>{language === "km" ? "ចាប់ផ្តើមធ្វើតេស្តភ្លាមៗ" : "Take Assessment Now"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
