"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
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
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
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
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
const BACII_GRADE_TIERS = [
  {
    grade: "Grade A",
    scoreRange: "427.500 – 500.000 pts",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    privilegesEn: [
      "100% Full-Ride MoEYS Priority State Scholarships automatically granted",
      "Pre-qualification for CADT Techo Digital Talent 100% scholarship exam",
      "Honored by Samdech Prime Minister at official national ceremony",
      "Waived entrance examination fees across multiple private institutions",
    ],
    privilegesKm: [
      "ទទួលបានអាហារូបករណ៍រដ្ឋ ១០០% អាទិភាពក្រសួងអប់រំ (MoEYS) ដោយស្វ័យប្រវត្តិ",
      "មានសិទ្ធិប្រឡងអាហារូបករណ៍ទេពកោសល្យឌីជីថលតេជោ (CADT) ១០០%",
      "ទទួលបានការលើកទឹកចិត្ត និងជួបសំណេះសំណាលផ្ទាល់ជាមួយសម្តេចនាយករដ្ឋមន្ត្រី",
      "លើកលែងថ្លៃពាក្យប្រឡងនៅគ្រឹះស្ថានឧត្តមសិក្សាឯកជនជាច្រើន",
    ],
  },
  {
    grade: "Grade B",
    scoreRange: "380.000 – 427.499 pts",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    privilegesEn: [
      "Eligible for 50%–100% MoEYS state scholarship quotas at RUPP, ITC, and RULE",
      "Priority consideration in competitive engineering and medicine concourses",
      "Institutional merit tuition discounts from 25% to 50% at private universities",
    ],
    privilegesKm: [
      "មានសិទ្ធិទទួលបានកូតាអាហារូបករណ៍រដ្ឋ ៥០% ដល់ ១០០% នៅ RUPP, ITC និង RULE",
      "អាទិភាពខ្ពស់ក្នុងការប្រឡងជ្រើសរើសចូលរៀនវិស្វកម្ម និងវេជ្ជសាស្ត្រ",
      "ទទួលបានការបញ្ចុះតម្លៃសិក្សាពី ២៥% ដល់ ៥០% នៅសាកលវិទ្យាល័យឯកជន",
    ],
  },
  {
    grade: "Grade C & D",
    scoreRange: "285.000 – 379.999 pts",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    privilegesEn: [
      "Direct qualification to sit entrance exams for all selective Cambodian public faculties",
      "Full eligibility for Bachelor Degree enrollments across all accredited Cambodian universities",
      "Provincial and female STEM priority scholarship quotas apply",
    ],
    privilegesKm: [
      "មានសិទ្ធិពេញលេញក្នុងការប្រឡងចូលគ្រប់មហាវិទ្យាល័យរដ្ឋ និងឯកជន",
      "ចុះឈ្មោះចូលរៀនថ្នាក់បរិញ្ញាបត្របានគ្រប់សាកលវិទ្យាល័យដែលទទួលស្គាល់ដោយ MoEYS",
      "មានសិទ្ធិទទួលបានកូតាអាហារូបករណ៍សម្រាប់សិស្សខេត្ត និងសិស្សនារីផ្នែក STEM",
    ],
  },
  {
    grade: "Grade E",
    scoreRange: "237.500 – 284.999 pts",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    privilegesEn: [
      "Official BACII High School Diploma awarded by MoEYS",
      "Eligible for Bachelor Degree programs at private universities and Associate Degrees at public institutes",
      "TVET Level 5 and technical vocational pathways available",
    ],
    privilegesKm: [
      "ទទួលបានសញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប) ផ្លូវការពីក្រសួងអប់រំ",
      "មានសិទ្ធិចុះឈ្មោះរៀនបរិញ្ញាបត្រនៅសាកលវិទ្យាល័យឯកជន ឬបរិញ្ញាបត្ររងនៅសាកលវិទ្យាល័យរដ្ឋ",
      "អាចបន្តការសិក្សាជំនាញបច្ចេកទេស និងវិជ្ជាជីវៈកម្រិតខ្ពស់ (TVET កម្រិត ៥)",
    ],
  },
];

// =========================================================================
// Main Component
// =========================================================================
export default function PublicBaciiGuidePage() {
  const { language } = useLanguage();
  const isKm = language === "km";

  // Interactive Stream Prerequisite Simulator state
  const [selectedStream, setSelectedStream] = useState<"science" | "social">("science");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["math", "physics"]);
  const [selectedBudget, setSelectedBudget] = useState<number>(1000);

  // Toggle subject selection in simulator
  const toggleSubject = (id: string) => {
    if (selectedSubjects.includes(id)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== id));
      }
    } else {
      if (selectedSubjects.length < 4) {
        setSelectedSubjects([...selectedSubjects, id]);
      }
    }
  };

  // Determine eligible recommendations based on selections
  const simulatedMatches = useMemo(() => {
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
          fitReasonEn: "Perfect Science stream subject alignment for algorithm formulation and logic.",
          fitReasonKm: "ត្រូវគ្នាល្អឥតខ្ចោះជាមួយថ្នាក់វិទ្យាសាស្ត្រសម្រាប់ការសរសេរកូដ និងតក្កវិជ្ជា។",
          universitiesEn: "CADT, ITC, RUPP, Paragon IU",
          universitiesKm: "CADT, ITC, RUPP, Paragon IU",
          typicalFee: "$600 – $2,500/yr",
        });
        matches.push({
          majorEn: "Data Science & Artificial Intelligence",
          majorKm: "វិទ្យាសាស្ត្រទិន្នន័យ & បញ្ញាសិប្បនិម្មិត",
          slug: "data-science-ai",
          fitLevel: "high",
          fitReasonEn: "Advanced Math is mandatory for statistical data modeling and machine learning.",
          fitReasonKm: "គណិតវិទ្យាកម្រិតខ្ពស់ជាកាតព្វកិច្ចសម្រាប់ការវិភាគទិន្នន័យ និង AI។",
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
          fitReasonEn: "Requires strong Physics and Calculus for ITC Concours entrance.",
          fitReasonKm: "ទាមទាររូបវិទ្យា និងគណិតវិទ្យារឹងមាំសម្រាប់ការប្រឡងចូល ITC Techno។",
          universitiesEn: "ITC Techno, RUPP",
          universitiesKm: "វិទ្យាស្ថានតិចណូ (ITC), RUPP",
          typicalFee: "$500 – $800/yr",
        });
      }

      if (hasBiology || hasChemistry) {
        matches.push({
          majorEn: "General Medicine & Pharmacy",
          majorKm: "វេជ្ជសាស្ត្រទូទៅ និងឱសថសាស្ត្រ",
          slug: "medicine",
          fitLevel: "high",
          fitReasonEn: "High Biology & Chemistry scores mandatory for UHS entrance concours.",
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
          fitReasonEn: "Deep textual comprehension and Khmer literature align with statutory law.",
          fitReasonKm: "ការយល់ដឹងភាសាស៊ីជម្រៅ និងអក្សរសាស្ត្រត្រូវគ្នានឹងការសិក្សាច្បាប់។",
          universitiesEn: "RULE (Royal Univ. of Law & Economics)",
          universitiesKm: "សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច (RULE)",
          typicalFee: "$500 – $800/yr",
        });
        matches.push({
          majorEn: "International Relations & Diplomacy",
          majorKm: "ទំនាក់ទំនងអន្តរជាតិ & ការទូត",
          slug: "international-relations",
          fitLevel: "high",
          fitReasonEn: "Geopolitics, history, and foreign language fluency fit diplomatic studies.",
          fitReasonKm: "ភូមិសាស្ត្រនយោបាយ ប្រវត្តិវិទ្យា និងភាសាបរទេសត្រូវគ្នានឹងកិច្ចការទូត។",
          universitiesEn: "IISPP (RUPP), Paragon IU",
          universitiesKm: "វិទ្យាស្ថានសិក្សាអន្តរជាតិ (IISPP / RUPP), Paragon IU",
          typicalFee: "$750 – $2,500/yr",
        });
      }

      if (hasEconomics || hasEnglish || hasMath) {
        matches.push({
          majorEn: "Banking, Finance & Accounting",
          majorKm: "ធនាគារ ហិរញ្ញវត្ថុ & គណនេយ្យ",
          slug: "banking-finance",
          fitLevel: "high",
          fitReasonEn: "Direct alignment with Cambodian commercial banking and corporate accounting.",
          fitReasonKm: "ត្រូវគ្នាដោយផ្ទាល់ជាមួយទីផ្សារធនាគារពាណិជ្ជកម្ម និងគណនេយ្យនៅកម្ពុជា។",
          universitiesEn: "NUM, CamEd, RULE",
          universitiesKm: "NUM, CamEd Business School, RULE",
          typicalFee: "$600 – $2,400/yr",
        });
      }

      // Cross-stream warning note
      matches.push({
        majorEn: "Computer Science (Bridging Track)",
        majorKm: "វិទ្យាសាស្ត្រកុំព្យូទ័រ (វគ្គបំប៉នគណិតវិទ្យា)",
        slug: "software-engineering",
        fitLevel: "bridge-needed",
        fitReasonEn: "Possible at select private universities, but requires supplementary math courses.",
        fitReasonKm: "អាចចូលរៀនបាននៅសាកលវិទ្យាល័យឯកជនមួយចំនួន ប៉ុន្តែត្រូវរៀនបំប៉នគណិតវិទ្យាបន្ថែម។",
        universitiesEn: "Select Private Universities",
        universitiesKm: "សាកលវិទ្យាល័យឯកជនមួយចំនួន",
        typicalFee: "$1,200 – $2,200/yr",
      });
    }

    return matches;
  }, [selectedStream, selectedSubjects, selectedBudget]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-[#F7CE4D]/30">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0e144a] via-[#111965] to-[#18237c] text-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#F7CE4D]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Super Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-emerald-300 shadow-sm">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>
                {isKm
                  ? "លក្ខខណ្ឌតម្រូវសាកលវិទ្យាល័យ & ថ្នាក់បាក់ឌុបជាតិ"
                  : "MoEYS & University Prerequisite Validator"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.15]">
              {isKm ? (
                <>
                  ផ្ទៀងផ្ទាត់ថ្នាក់បាក់ឌុប <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7CE4D] to-amber-300">
                    & លក្ខខណ្ឌតម្រូវសាកលវិទ្យាល័យ
                  </span>
                </>
              ) : (
                <>
                  BACII High School Stream <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7CE4D] to-amber-300">
                    & University Prerequisite Validator
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed font-normal">
              {isKm
                ? "ផ្ទៀងផ្ទាត់ភាពត្រូវគ្នារវាងថ្នាក់វិទ្យាសាស្ត្រពិត ឬវិទ្យាសាស្ត្រសង្គម មុខវិជ្ជាពូកែ និងកម្រិតថវិកាសិក្សា ជាមួយលក្ខខណ្ឌចូលរៀនផ្លូវការនៃសាកលវិទ្យាល័យជាង ៥០ នៅកម្ពុជា ដើម្បីជៀសវាងការជ្រើសរើសខុសជំនាញ។"
                : "Cross-validate your Grade 12 National Exam track (Science vs. Social stream), strongest subjects, and tuition budget against admission criteria across 50+ Cambodian universities to prevent costly major dropouts."}
            </p>

            {/* Key Metrics Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 pb-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-[#F7CE4D]">2 Streams</div>
                <div className="text-xs text-slate-300 mt-0.5">{isKm ? "វិទ្យាសាស្ត្រ & សង្គម" : "Science & Social"}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-white">10 Subjects</div>
                <div className="text-xs text-slate-300 mt-0.5">{isKm ? "មុខវិជ្ជាស្នូលវិភាគ" : "Core Subjects"}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-400">50+ Univs</div>
                <div className="text-xs text-slate-300 mt-0.5">{isKm ? "សាកលវិទ្យាល័យកម្ពុជា" : "Cambodian Inst."}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-blue-400">MoEYS</div>
                <div className="text-xs text-slate-300 mt-0.5">{isKm ? "ស្តង់ដារក្រសួងអប់រំ" : "Official Criteria"}</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/dashboard/assessments/preferences"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F7CE4D] to-amber-400 text-[#111965] font-bold shadow-lg shadow-amber-400/20 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isKm ? "ចាប់ផ្តើមបំពេញចំណូលចិត្ត (៥ នាទី)" : "Start Preference Diagnostic (5 Mins)"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/majors"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium border border-white/20 transition-all"
              >
                <BookOpen className="w-4 h-4 text-slate-300" />
                <span>{isKm ? "ស្វែងរកជំនាញសាកលវិទ្យាល័យ" : "Explore Cambodian Majors"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: SCIENCE STREAM VS SOCIAL STREAM COMPARISON
          ========================================================================= */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <Layers className="w-3.5 h-3.5" />
            <span>{isKm ? "ការប្រៀបធៀបថ្នាក់បាក់ឌុបទាំងពីរ" : "High School Stream Comparison"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
            {isKm
              ? "ថ្នាក់វិទ្យាសាស្ត្រពិត ទល់នឹង ថ្នាក់វិទ្យាសាស្ត្រសង្គម"
              : "Science Stream vs. Social Science Stream"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {isKm
              ? "ស្វែងយល់ពីភាពខុសគ្នានៃមុខវិជ្ជាស្នូល ការប្រឡងប្រជែងចូលរៀន និងឱកាសជំនាញដែលបើកទូលាយសម្រាប់ថ្នាក់នីមួយៗ។"
              : "Understand how your Grade 12 stream directly governs which university majors and competitive entrance exams you qualify for."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SCIENCE STREAM CARD */}
          <div className="rounded-2xl border-2 border-blue-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full pointer-events-none" />
            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2">
                    STEM Pathway • ថ្នាក់វិទ្យាសាស្ត្រពិត
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#111965]">
                    {STREAM_PROFILES.science.nameEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {isKm ? STREAM_PROFILES.science.shortDescKm : STREAM_PROFILES.science.shortDescEn}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>

              {/* Core Subjects */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "មុខវិជ្ជាស្នូលប្រឡងបាក់ឌុប" : "Core BACII Subjects"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(isKm ? STREAM_PROFILES.science.coreSubjectsKm : STREAM_PROFILES.science.coreSubjectsEn).map((sub, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200/60">
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
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                  {(isKm ? STREAM_PROFILES.science.keyEntranceExamsKm : STREAM_PROFILES.science.keyEntranceExamsEn).map((exam, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{exam}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample High-Fit Majors */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "ជំនាញសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុត" : "Direct University Majors Unlocked"}
                </div>
                <div className="space-y-2">
                  {STREAM_PROFILES.science.topMajors.map((m, idx) => (
                    <Link
                      key={idx}
                      href={`/majors/${m.slug}`}
                      className="block p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                          {isKm ? m.nameKm : m.nameEn}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">Univ: {m.univ}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL SCIENCE STREAM CARD */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none" />
            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                    Humanities & Business • ថ្នាក់វិទ្យាសាស្ត្រសង្គម
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#111965]">
                    {STREAM_PROFILES.social.nameEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {isKm ? STREAM_PROFILES.social.shortDescKm : STREAM_PROFILES.social.shortDescEn}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              {/* Core Subjects */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "មុខវិជ្ជាស្នូលប្រឡងបាក់ឌុប" : "Core BACII Subjects"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(isKm ? STREAM_PROFILES.social.coreSubjectsKm : STREAM_PROFILES.social.coreSubjectsEn).map((sub, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/60">
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
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                  {(isKm ? STREAM_PROFILES.social.keyEntranceExamsKm : STREAM_PROFILES.social.keyEntranceExamsEn).map((exam, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{exam}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample High-Fit Majors */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "ជំនាញសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុត" : "Direct University Majors Unlocked"}
                </div>
                <div className="space-y-2">
                  {STREAM_PROFILES.social.topMajors.map((m, idx) => (
                    <Link
                      key={idx}
                      href={`/majors/${m.slug}`}
                      className="block p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-emerald-700">
                          {isKm ? m.nameKm : m.nameEn}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">Univ: {m.univ}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: INTERACTIVE PREREQUISITE SIMULATOR WIDGET
          ========================================================================= */}
      <section className="py-16 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>{isKm ? "សាកល្បងផ្ទៀងផ្ទាត់ដោយផ្ទាល់" : "Live Prerequisite Simulator"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
              {isKm
                ? "ឧបករណ៍ពិសោធន៍លក្ខខណ្ឌតម្រូវសាកលវិទ្យាល័យ"
                : "Test Your Stream & Subject Compatibility"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {isKm
                ? "ជ្រើសរើសថ្នាក់បាក់ឌុប និងមុខវិជ្ជាដែលអ្នកពូកែ ដើម្បីមើលជំនាញដែលត្រូវគ្នាភ្លាមៗ។"
                : "Select your BACII stream and strongest high school subjects to see instantaneous admission compatibility."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT CONTROL PANEL (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              {/* Step 1: Stream Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>1. {isKm ? "ជ្រើសរើសថ្នាក់បាក់ឌុបរបស់អ្នក" : "Select Your BACII Track"}</span>
                  <span className="text-[#2563EB] text-[11px] font-semibold">{selectedStream.toUpperCase()}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStream("science")}
                    className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center gap-1 transition-all ${
                      selectedStream === "science"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>🔬 {isKm ? "ថ្នាក់វិទ្យាសាស្ត្រ" : "Science Stream"}</span>
                    <span className="text-[10px] font-normal opacity-85">STEM Track</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStream("social")}
                    className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center gap-1 transition-all ${
                      selectedStream === "social"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>📚 {isKm ? "ថ្នាក់សង្គម" : "Social Stream"}</span>
                    <span className="text-[10px] font-normal opacity-85">Humanities Track</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Strongest Subjects */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>2. {isKm ? "ជ្រើសរើសមុខវិជ្ជាពូកែ (១ ដល់ ៤)" : "Select Strongest Subjects (1-4)"}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {selectedSubjects.length}/4
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SUBJECTS.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleSubject(sub.id)}
                        className={`text-left p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-[#111965] text-white border-[#111965] shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
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
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>3. {isKm ? "ថវិកាសិក្សាប្រចាំឆ្នាំ (USD)" : "Annual Tuition Budget"}</span>
                  <span className="text-sm font-extrabold text-[#111965]">${selectedBudget} / yr</span>
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
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>$400 (State State)</span>
                  <span>$2,000 (Private)</span>
                  <span>$5,000+ (Dual)</span>
                </div>
              </div>

              {/* Diagnostic Link */}
              <div className="pt-2">
                <Link
                  href="/dashboard/assessments/preferences"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#111965] to-[#18237c] text-white text-xs sm:text-sm font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#F7CE4D]" />
                  <span>{isKm ? "រក្សាទុក និងគណនាចំណូលចិត្តពេញលេញ" : "Lock in & Save Preferences"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* RIGHT RESULTS PANEL (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-[#111965] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>
                    {isKm
                      ? `ជំនាញត្រូវគ្នានឹងលក្ខខណ្ឌសិក្សា (${simulatedMatches.length})`
                      : `Admission-Compatible Majors (${simulatedMatches.length})`}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedStream === "science" ? "Science Stream Active" : "Social Stream Active"}
                </span>
              </div>

              <div className="space-y-3">
                {simulatedMatches.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-extrabold text-[#111965]">
                            {isKm ? item.majorKm : item.majorEn}
                          </h4>
                          {item.fitLevel === "high" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {isKm ? "ត្រូវគ្នា ១០០%" : "100% Eligible"}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {isKm ? "ទាមទាររៀនបំប៉ន" : "Bridge Math Needed"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {isKm ? item.fitReasonKm : item.fitReasonEn}
                        </p>
                      </div>
                      <Link
                        href={`/majors/${item.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0 self-start sm:self-center"
                      >
                        <span>{isKm ? "មើលលម្អិត" : "Details"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isKm ? item.universitiesKm : item.universitiesEn}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700 font-bold">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.typicalFee}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{isKm ? "តារាងតម្លៃសិក្សាជាក់ស្តែងនៅកម្ពុជា" : "Cambodian Tuition Benchmarks"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
            {isKm ? "តម្លាភាពតម្លៃសិក្សានៅសាកលវិទ្យាល័យ" : "Verified 4-Year Tuition Realities"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {isKm
              ? "តម្លៃសិក្សានៅកម្ពុជាខុសគ្នាពី ៥០០ ដុល្លារ រហូតដល់ ៩,០០០ ដុល្លារក្នុងមួយឆ្នាំ។ ពិនិត្យថវិកាពិតប្រាកដមុននឹងសម្រេចចិត្តចុះឈ្មោះ។"
              : "Compare real annual tuition fees across public state, specialized technology, and international institutions before applying."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TUITION_BENCHMARKS.map((t, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow space-y-5"
            >
              <div className="space-y-1">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${t.tagBg}`}>
                  {isKm ? t.tierKm : t.tierEn}
                </span>
                <div className="text-2xl font-black text-[#111965] pt-1">{t.rangeUsd}</div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isKm ? t.descKm : t.descEn}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isKm ? "ស្ថាប័នតំណាង" : "Representative Institutions"}
                </div>
                <div className="space-y-1">
                  {t.universities.map((u, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
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
      <section className="py-16 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
              <Award className="w-3.5 h-3.5" />
              <span>{isKm ? "កម្រិតនិទ្ទេសបាក់ឌុប & អត្ថប្រយោជន៍" : "MoEYS Grade Cutoffs & Honors"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
              {isKm ? "អត្ថប្រយោជន៍អាហារូបករណ៍តាមនិទ្ទេសបាក់ឌុប" : "What Your BACII Grade Unlocks"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {isKm
                ? "ស្វែងយល់ពីសិទ្ធិទទួលបានអាហារូបករណ៍រដ្ឋ ១០០% និងលក្ខខណ្ឌចូលរៀនតាមកម្រិតពិន្ទុជាក់ស្តែង។"
                : "Official MoEYS state scholarship quotas and university entrance privileges corresponding to each BACII grade tier."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BACII_GRADE_TIERS.map((tier, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${tier.badgeColor}`}>
                      {tier.grade}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">{tier.scoreRange}</span>
                  </div>
                  <div className="pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      {isKm ? "អត្ថប្រយោជន៍ផ្លូវការ" : "Official Privileges"}
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {(isKm ? tier.privilegesKm : tier.privilegesEn).map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    href="/scholarships"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <span>{isKm ? "ពិនិត្យអាហារូបករណ៍" : "View Scholarships"}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FREQUENTLY ASKED QUESTIONS
          ========================================================================= */}
      <section className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>{isKm ? "សំណួរដែលសួរញឹកញាប់" : "Prerequisites FAQ"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
            {isKm ? "ចម្ងល់អំពីថ្នាក់បាក់ឌុប និងសាកលវិទ្យាល័យ" : "Common Questions About BACII Streams"}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-2">
            <h3 className="text-base font-bold text-[#111965]">
              {isKm
                ? "តើខ្ញុំអាចរៀនផ្នែក IT ឬវិទ្យាសាស្ត្រកុំព្យូទ័របានទេ ប្រសិនបើខ្ញុំរៀនថ្នាក់សង្គម?"
                : "Can I study Computer Science or IT if I graduated from the Social Science Stream?"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isKm
                ? "អាចបាន! សាកលវិទ្យាល័យរដ្ឋដូចជា ITC និង RUPP តម្រូវឱ្យប្រឡងគណិតវិទ្យាកម្រិតខ្ពស់ ប៉ុន្តែសាកលវិទ្យាល័យឯកជនជាច្រើនអនុញ្ញាតឱ្យសិស្សថ្នាក់សង្គមចុះឈ្មោះចូលរៀនបាន ដោយគ្រាន់តែតម្រូវឱ្យរៀនវគ្គបំប៉នគណិតវិទ្យា និងមូលដ្ឋានកូដនៅឆ្នាំទីមួយ។"
                : "Yes! While public institutions like ITC and CADT strictly test advanced calculus and physics in their entrance concourses, several accredited private universities accept Social Stream students with mandatory foundation-year bridging math classes."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-2">
            <h3 className="text-base font-bold text-[#111965]">
              {isKm
                ? "តើប្រព័ន្ធ Futera ពិចារណាលើលទ្ធភាពហិរញ្ញវត្ថុគ្រួសារខ្ញុំយ៉ាងដូចម្តេច?"
                : "How does Futera factor in my family's financial situation?"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isKm
                ? "នៅក្នុងតេស្តចំណូលចិត្តសិក្សា អ្នកអាចកំណត់កម្រិតថវិកាប្រចាំឆ្នាំ ($៥០០ ដល់ $៥,០០០+)។ ប្រព័ន្ធ AI នឹងមិនណែនាំសាកលវិទ្យាល័យដែលលើសពីលទ្ធភាពរបស់អ្នកឡើយ លើកលែងតែកម្មវិធីនោះមានអាហារូបករណ៍ ១០០% ត្រូវគ្នានឹងនិទ្ទេសរបស់អ្នក។"
                : "In the Academic Preferences assessment, you specify your annual tuition budget ($400 to $5,000+). Our matching algorithm will never recommend out-of-budget programs unless you qualify for 100% full-ride state scholarships (MoEYS or CADT)."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-2">
            <h3 className="text-base font-bold text-[#111965]">
              {isKm
                ? "តើទម្ងន់នៃតេស្តចំណូលចិត្តសិក្សាមានប៉ុន្មានភាគរយក្នុងរូបមន្តផ្គូផ្គង?"
                : "What weight does this prerequisite test carry in the AI matching formula?"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isKm
                ? "តេស្តចំណូលចិត្ត និងថ្នាក់បាក់ឌុបមានទម្ងន់ ២៥% នៅក្នុងរូបមន្តវិទ្យាសាស្ត្រ ១០០% របស់ Futera (៣០% RIASEC + ២៥% បុគ្គលិកលក្ខណៈ + ២៥% ថ្នាក់បាក់ឌុប + ២០% ទីផ្សារការងារ NEA)។"
                : "The BACII Stream and Academic Preferences test represents 25% of Futera's 4-Pillar Scientific Formula (30% RIASEC + 25% 16-Personality + 25% BACII Prerequisites + 20% Cambodian Labor Demand)."}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: BOTTOM CONVERSION CTA BANNER
          ========================================================================= */}
      <section className="py-16 bg-[#111965] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isKm ? "ផ្ទៀងផ្ទាត់ដោយឥតគិតថ្លៃ ១០០%" : "100% Free For All Cambodian Students"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {isKm ? (
              <>
                ផ្ទៀងផ្ទាត់លក្ខខណ្ឌសិក្សា និងថវិការបស់អ្នកឥឡូវនេះ
              </>
            ) : (
              <>
                Validate Your High School Stream & Budget Today
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            {isKm
              ? "ចំណាយពេលត្រឹមតែ ៥ នាទីដើម្បីកំណត់មុខវិជ្ជាពូកែ ថវិកាសិក្សា និងទីតាំង ដើម្បីឱ្យប្រព័ន្ធ AI ផ្គូផ្គងសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុត។"
              : "Spend 5 minutes setting your strongest subjects, tuition budget, and campus location to unlock high-precision university recommendations."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard/assessments/preferences"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#F7CE4D] to-amber-400 text-[#111965] text-sm sm:text-base font-extrabold shadow-lg shadow-amber-400/20 hover:brightness-105 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isKm ? "ចាប់ផ្តើមបំពេញចំណូលចិត្ត (៥ នាទី)" : "Start Preference Diagnostic (5 Mins)"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/assessments"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm sm:text-base font-medium border border-white/20 transition-all"
            >
              <span>{isKm ? "មើលតេស្តវាយតម្លៃទាំងអស់" : "View All Assessments"}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
