"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import {
  STATIC_CAREERS,
  STATIC_MAJORS,
  STATIC_UNIVERSITIES,
} from "@/lib/data/catalog";
import { FaqSection, FaqItem } from "@/components/home/faq-section";
import { CtaBanner } from "@/components/home/cta-banner";
import {
  Compass,
  Sparkles,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Check,
  ShieldCheck,
  BookOpen,
  Briefcase,
  HelpCircle,
  Award,
  ChevronRight,
  Zap,
  Sliders,
  FileCheck,
  Share2,
  Users,
  Clock,
  Target,
  Building2,
  Coins,
  Scale,
  Microscope,
  Lightbulb,
  BrainCircuit,
  X,
  AlertTriangle,
} from "lucide-react";

// =========================================================================
// 4 Diagnostic Engines Data
// =========================================================================
const ENGINES = [
  {
    id: "riasec",
    number: "01",
    heroTitleEn: "RIASEC Interests",
    heroTitleKm: "ចំណាប់អារម្មណ៍ RIASEC",
    titleEn: "Holland RIASEC Vocational Test",
    titleKm: "តេស្តចំណាប់អារម្មណ៍អាជីព Holland RIASEC",
    taglineEn: "Vocational Psychology Standard (John Holland)",
    taglineKm: "ចិត្តវិទ្យាវិជ្ជាជីវៈស្តង់ដារអន្តរជាតិ",
    descEn:
      "Measures 6 foundational vocational dimensions (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) to identify your authentic affinity for real day-to-day work tasks.",
    descKm:
      "វាស់វែងចំណាប់អារម្មណ៍ការងារ ៦ វិមាត្រ (ជាក់ស្តែង, ស្រាវជ្រាវ, សិល្បៈ, សង្គម, ភាពជាអ្នកដឹកនាំ, ការិយាល័យ) ដើម្បីស្វែងរកការងារដែលអ្នកចូលចិត្តធ្វើពីធម្មជាតិ។",
    metricsEn: "18 activities • About 4 min • Free",
    metricsKm: "១៨ សកម្មភាព • ប្រហែល ៤ នាទី • ឥតគិតថ្លៃ",
    icon: Compass,
    color: "#D97706",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    primaryLink: "/riasec",
    testLink: "/assessments/riasec/test",
    linkTextEn: "Explore RIASEC Details",
    linkTextKm: "ស្វែងយល់លម្អិតអំពី RIASEC",
    startTextEn: "Start RIASEC Test",
    startTextKm: "ធ្វើតេស្ត RIASEC",
    featuresEn: [
      "Identifies your 3-letter Holland code (e.g. IAS, RIE)",
      `Connects to ${STATIC_MAJORS.length} Cambodian university majors in the directory`,
      "Helps you compare pathways before choosing a major",
    ],
    featuresKm: [
      "កំណត់កូដហូឡង់ ៣ តួអក្សរផ្ទាល់ខ្លួន (ឧទាហរណ៍៖ IAS, RIE)",
      `ភ្ជាប់ទៅកាន់ជំនាញសាកលវិទ្យាល័យកម្ពុជា ${STATIC_MAJORS.length} ក្នុងបញ្ជី`,
      "ជួយអ្នកប្រៀបធៀបផ្លូវសិក្សាមុនពេលជ្រើសរើសជំនាញ",
    ],
  },
  {
    id: "personality",
    number: "02",
    heroTitleEn: "16-Personality",
    heroTitleKm: "បុគ្គលិកលក្ខណៈ ១៦",
    titleEn: "16 Personalities (MBTI Cognitive Style)",
    titleKm: "បុគ្គលិកលក្ខណៈទាំង ១៦ & របៀបគិត",
    taglineEn: "Cognitive Temperament Framework",
    taglineKm: "រចនាប័ទ្មនៃការគិត & ភាពធន់ក្នុងការសិក្សា",
    descEn:
      "Assesses your cognitive information-processing style across 4 temperaments (Analysts, Diplomats, Sentinels, Explorers) to understand study endurance, stress resilience, and team dynamics.",
    descKm:
      "វាយតម្លៃលើមុខងារនៃការគិត ៤ ក្រុមធំៗ (អ្នកវិភាគ, អ្នកការទូត, អ្នកការពារ, អ្នករុករក) ដើម្បីយល់ដឹងពីភាពធន់ក្នុងការរៀនសូត្រ ការដោះស្រាយសម្ពាធ និងការធ្វើការជាក្រុម។",
    metricsEn: "12 statements • About 3 min • Free",
    metricsKm: "១២ សំណើ • ប្រហែល ៣ នាទី • ឥតគិតថ្លៃ",
    icon: Sparkles,
    color: "#2563EB",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    primaryLink: "/personality",
    testLink: "/assessments/personality/test",
    linkTextEn: "Explore 16 Personalities",
    linkTextKm: "ស្វែងយល់បុគ្គលិកលក្ខណៈ",
    startTextEn: "Start Personality Test",
    startTextKm: "ធ្វើតេស្តបុគ្គលិកលក្ខណៈ",
    featuresEn: [
      "Explains all 16 personality types",
      "Shows how you learn, communicate, and work in teams",
      "Highlights strengths and growth areas",
    ],
    featuresKm: [
      "ពន្យល់បុគ្គលិកលក្ខណៈទាំង ១៦ ប្រភេទ",
      "បង្ហាញពីរបៀបរៀន ប្រាស្រ័យទាក់ទង និងធ្វើការជាក្រុម",
      "បង្ហាញចំណុចខ្លាំង និងចំណុចដែលគួរអភិវឌ្ឍ",
    ],
  },
  {
    id: "bacii",
    number: "03",
    heroTitleEn: "BACII Stream",
    heroTitleKm: "ថ្នាក់បាក់ឌុប",
    titleEn: "BACII Stream & Academic Prerequisites",
    titleKm: "ភាពត្រូវគ្នានៃថ្នាក់បាក់ឌុប & លក្ខខណ្ឌសាកលវិទ្យាល័យ",
    taglineEn: "MoEYS & University Admission Criteria",
    taglineKm: "លក្ខខណ្ឌតម្រូវផ្លូវការនៃក្រសួងអប់រំ និងសាកលវិទ្យាល័យ",
    descEn:
      "Compare your Grade 12 stream, strongest subjects, and tuition budget with common admission expectations for Cambodian university majors.",
    descKm:
      "ប្រៀបធៀបថ្នាក់បាក់ឌុប មុខវិជ្ជាពូកែ និងថវិកាសិក្សារបស់អ្នក ជាមួយលក្ខខណ្ឌចូលរៀនទូទៅនៃជំនាញសាកលវិទ្យាល័យកម្ពុជា។",
    metricsEn: "3 inputs • Instant results • Free",
    metricsKm: "៣ ចំណុច • លទ្ធផលភ្លាមៗ • ឥតគិតថ្លៃ",
    icon: GraduationCap,
    color: "#059669",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    primaryLink: "/bacii",
    testLink: "/bacii",
    linkTextEn: "Explore BACII Prerequisites",
    linkTextKm: "ស្វែងយល់លក្ខខណ្ឌបាក់ឌុប",
    startTextEn: "Set Academic Preferences",
    startTextKm: "កំណត់ចំណូលចិត្តសិក្សា",
    featuresEn: [
      "Checks Science vs. Social stream alignment",
      "Shows tuition context for matching pathways",
      "Highlights prerequisite subjects for popular majors",
    ],
    featuresKm: [
      "ពិនិត្យភាពត្រូវគ្នារវាងថ្នាក់វិទ្យាសាស្ត្រ និងសង្គម",
      "បង្ហាញព័ត៌មានថ្លៃសិក្សាសម្រាប់ផ្លូវសិក្សាដែលត្រូវគ្នា",
      "បង្ហាញមុខវិជ្ជាតម្រូវការសម្រាប់ជំនាញពេញនិយម",
    ],
  },
  {
    id: "labor",
    number: "04",
    heroTitleEn: "Labor Market",
    heroTitleKm: "ទីផ្សារការងារ",
    titleEn: "Cambodian Labor Market & Salary Realities",
    titleKm: "តម្រូវការទីផ្សារការងារ & ប្រាក់ខែជាក់ស្តែងនៅកម្ពុជា",
    taglineEn: "Cambodian Career & Salary Context",
    taglineKm: "បរិបទអាជីព និងប្រាក់ខែនៅកម្ពុជា",
    descEn:
      "Connects majors to career profiles, skills, related majors, and salary ranges where verified. Missing salary data is shown clearly instead of guessed.",
    descKm:
      "ភ្ជាប់ជំនាញសិក្សាទៅកាន់ទម្រង់អាជីព ជំនាញ ជំនាញពាក់ព័ន្ធ និងកម្រិតប្រាក់ខែដែលបានផ្ទៀងផ្ទាត់។ ទិន្នន័យដែលមិនទាន់មានត្រូវបង្ហាញយ៉ាងច្បាស់ មិនមែនប៉ាន់ស្មានទេ។",
    metricsEn: `${STATIC_CAREERS.length} careers • Salary context where verified`,
    metricsKm: `${STATIC_CAREERS.length} អាជីព • ប្រាក់ខែដែលបានផ្ទៀងផ្ទាត់`,
    icon: TrendingUp,
    color: "#9333EA",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    primaryLink: "/careers",
    testLink: "/careers",
    linkTextEn: "Explore Cambodian Salaries",
    linkTextKm: "ពិនិត្យប្រាក់ខែ និងទីផ្សារការងារ",
    startTextEn: "View Labor Data",
    startTextKm: "មើលទិន្នន័យការងារ",
    featuresEn: [
      "Salary ranges shown only where verified",
      "Skills, related majors, and career paths",
      "Missing data is marked instead of guessed",
    ],
    featuresKm: [
      "បង្ហាញកម្រិតប្រាក់ខែតែនៅកន្លែងដែលបានផ្ទៀងផ្ទាត់",
      "ជំនាញ ជំនាញសិក្សាពាក់ព័ន្ធ និងផ្លូវអាជីព",
      "ទិន្នន័យដែលខ្វះត្រូវបានសម្គាល់ មិនមែនប៉ាន់ស្មាន",
    ],
  },
];

// =========================================================================
// Comparison Table Data: OrienX vs Generic Online Quizzes (Clean & Concise)
// =========================================================================
interface ComparisonRow {
  featureEn: string;
  featureKm: string;
  orienxEn: string;
  orienxKm: string;
  genericEn: string;
  genericKm: string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    featureEn: "Scientific Methodology",
    featureKm: "វិធីសាស្ត្របែបវិទ្យាសាស្ត្រ",
    orienxEn: "4-pillar guidance framework: interests, personality, BACII context, and career profiles.",
    orienxKm: "ក្របខ័ណ្ឌណែនាំ ៤ ជំហាន៖ ចំណាប់អារម្មណ៍ បុគ្គលិកលក្ខណៈ បរិបទបាក់ឌុប និងទម្រង់អាជីព។",
    genericEn: "Single 5-question pop quiz based on superficial hobbies and random guessing.",
    genericKm: "កម្រងសំណួរកម្សាន្ត ៥ សំណួរទាយតាមចំណង់ចំណូលចិត្តបណ្តោះអាសន្ន។",
  },
  {
    featureEn: "Cambodian Context Localization",
    featureKm: "ការផ្សារភ្ជាប់បរិបទកម្ពុជា",
    orienxEn: "Built around Cambodian majors, universities, tuition context, and admission pathways.",
    orienxKm: "បង្កើតឡើងសម្រាប់ជំនាញ សាកលវិទ្យាល័យ ថ្លៃសិក្សា និងផ្លូវចូលរៀននៅកម្ពុជា។",
    genericEn: "Generic foreign systems completely irrelevant to Cambodian degrees and colleges.",
    genericKm: "ប្រើប្រព័ន្ធបរទេស មិនត្រូវនឹងសាកលវិទ្យាល័យ និងជំនាញនៅស្រុកខ្មែរឡើយ។",
  },
  {
    featureEn: "Financial & Tuition Prerequisite",
    featureKm: "ការផ្ទៀងផ្ទាត់តម្លៃសិក្សា",
    orienxEn: "Shows tuition where verified and marks missing figures instead of guessing.",
    orienxKm: "បង្ហាញថ្លៃសិក្សាដែលបានផ្ទៀងផ្ទាត់ និងសម្គាល់ទិន្នន័យដែលមិនទាន់មាន។",
    genericEn: "Zero budget checks; often recommends unaffordable programs leading to dropouts.",
    genericKm: "គ្មានការពិនិត្យថវិកា ណែនាំសាលាដែលលើសពីលទ្ធភាពហិរញ្ញវត្ថុគ្រួសារ។",
  },
  {
    featureEn: "BACII High School Stream Check",
    featureKm: "ការផ្ទៀងផ្ទាត់ថ្នាក់បាក់ឌុប",
    orienxEn: "Uses your Grade 12 stream and strongest subjects to highlight likely prerequisites.",
    orienxKm: "ប្រើថ្នាក់បាក់ឌុប និងមុខវិជ្ជាពូកែរបស់អ្នក ដើម្បីបង្ហាញលក្ខខណ្ឌដែលអាចត្រូវការ។",
    genericEn: "Ignores Grade 12 tracks, risking entrance exam disqualification.",
    genericKm: "មិនគិតពីថ្នាក់រៀន នាំឱ្យខុសលក្ខខណ្ឌ និងធ្លាក់ការប្រឡងជ្រើសរើសចូលរៀន។",
  },
  {
    featureEn: "Career & Salary Context",
    featureKm: "បរិបទអាជីព & ប្រាក់ខែ",
    orienxEn: "Connects majors to career profiles and salary context where verified.",
    orienxKm: "ភ្ជាប់ជំនាញសិក្សាទៅទម្រង់អាជីព និងកម្រិតប្រាក់ខែដែលបានផ្ទៀងផ្ទាត់។",
    genericEn: "Zero local employment insights or exaggerated Western wage estimates.",
    genericKm: "គ្មានទិន្នន័យទីផ្សារការងារ ឬដាក់ប្រាក់ខែបរទេសដែលមិនពិតនៅកម្ពុជា។",
  },
  {
    featureEn: "Parent & Counselor Sharing",
    featureKm: "ការចែករំលែកជាមួយអាណាព្យាបាល",
    orienxEn: "Exportable counselor-grade PDF report with clear evidence to discuss with family.",
    orienxKm: "របាយការណ៍ PDF វិភាគច្បាស់លាស់ អាចទាញយកពិភាក្សាជាមួយឪពុកម្តាយ ឬគ្រូ។",
    genericEn: "Simple screenshot or buzzfeed-style summary line with zero proof.",
    genericKm: "គ្រាន់តែជាពាក្យសង្ខេបមួយឃ្លា ឬរូបភាពកម្សាន្ត គ្មានទិន្នន័យបញ្ជាក់។",
  },
];

// =========================================================================
// Main Component
// =========================================================================
export default function PublicAssessmentsHubPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isKm = language === "km";

  // Tailored Assessments FAQ items
  const assessmentsFaqs = useMemo<FaqItem[]>(() => {
    return [
      {
        id: "faq-free-access",
        question: isKm
          ? "តើឧបករណ៍ណែនាំទាំង ៤ នេះឥតគិតថ្លៃសម្រាប់សិស្សកម្ពុជាឬទេ?"
          : "Are all 4 guidance tools free for Cambodian students?",
        answer: isKm
          ? "បាទ/ចាស! សិស្ស និងអាណាព្យាបាលកម្ពុជាអាចប្រើឧបករណ៍ទាំង ៤ (RIASEC, បុគ្គលិកលក្ខណៈ ១៦, ព័ត៌មានថ្នាក់បាក់ឌុប និងទម្រង់អាជីព) ដោយឥតគិតថ្លៃ។"
          : "Yes. Cambodian students and parents can use all four tools (RIASEC, 16 Personalities, BACII context, and career profiles) without a fee.",
      },
      {
        id: "faq-conflicting-results",
        question: isKm
          ? "ចុះប្រសិនបើតេស្ត RIASEC និងបុគ្គលិកលក្ខណៈផ្តល់លទ្ធផលមិនដូចគ្នា?"
          : "What if my RIASEC score and 16-Personality suggest different fields?",
        answer: isKm
          ? "តេស្ត RIASEC វាស់កិច្ចការ និងមុខវិជ្ជាដែលអ្នកចូលចិត្តធ្វើ ចំណែកតេស្តបុគ្គលិកលក្ខណៈវាស់របៀបដែលអ្នកគិត ទំនាក់ទំនង និងដោះស្រាយសម្ពាធ។ នៅពេលលទ្ធផលខុសគ្នា សូមអានផ្នែកដែលត្រួតគ្នា ហើយប្រៀបធៀបជំនាញដែលទាក់ទងនឹងចំណាប់អារម្មណ៍ និងរបៀបធ្វើការរបស់អ្នក។"
          : "RIASEC measures the work tasks and subjects you naturally enjoy, while the personality result shows how you think, communicate, and handle study stress. When they point in different directions, compare the overlapping majors and read the details for each path instead of treating either result as a fixed label.",
      },
      {
        id: "faq-cambodia-matching-engine",
        question: isKm
          ? "តើ OrienX ភ្ជាប់ពិន្ទុតេស្តទៅកាន់សាកលវិទ្យាល័យកម្ពុជា និងទីផ្សារការងារដោយរបៀបណា?"
          : "How does OrienX match my scores to Cambodian universities and real job market data?",
        answer: isKm
          ? `OrienX ភ្ជាប់លទ្ធផលទៅកាន់ជំនាញសាកលវិទ្យាល័យកម្ពុជា ${STATIC_MAJORS.length} ក្នុងបញ្ជី សាកលវិទ្យាល័យ ${STATIC_UNIVERSITIES.length} និងទម្រង់អាជីព ${STATIC_CAREERS.length}។ ទិន្នន័យថ្លៃសិក្សា និងប្រាក់ខែត្រូវបង្ហាញតែនៅកន្លែងដែលបានផ្ទៀងផ្ទាត់។`
          : `OrienX connects results to ${STATIC_MAJORS.length} Cambodian majors, ${STATIC_UNIVERSITIES.length} universities, and ${STATIC_CAREERS.length} career profiles. Tuition and salary data are shown only where verified.`,
      },
      {
        id: "faq-share-with-parents",
        question: isKm
          ? "តើខ្ញុំអាចទាញយករបាយការណ៍ចែករំលែកជាមួយឪពុកម្តាយ ឬលោកគ្រូអ្នកគ្រូបានទេ?"
          : "Can I download and share my diagnostic report with my parents or high school counselor?",
        answer: isKm
          ? "បាទ/ចាស! បន្ទាប់ពីបញ្ចប់តេស្ត អ្នកអាចទាញយករបាយការណ៍ PDF ដែលមានពិន្ទុ ចំណុចខ្លាំង ជំនាញដែលត្រូវគ្នា និងជំហានបន្ទាប់ ដើម្បីពិភាក្សាជាមួយគ្រួសារ ឬគ្រូប្រឹក្សា។"
          : "Yes. After finishing a test, you can export a PDF report with your scores, strengths, matching majors, and suggested next steps to discuss with family or a counselor.",
      },
      {
        id: "faq-total-duration",
        question: isKm
          ? "តើត្រូវចំណាយពេលប៉ុន្មានដើម្បីប្រើឧបករណ៍ទាំង ៤ នេះ?"
          : "How long does it take to use all 4 guidance tools?",
        answer: isKm
          ? "ប្រហែល ១០ នាទីសម្រាប់ការណែនាំទាំងមូល៖ RIASEC (~៤ នាទី) បុគ្គលិកលក្ខណៈ (~៣ នាទី) និងកម្មវិធីពិសោធន៍ថ្នាក់បាក់ឌុប (លទ្ធផលភ្លាមៗ)។ អ្នកអាចធ្វើម្តងមួយៗ ហើយចម្លើយនឹងត្រូវរក្សាទុកលើឧបករណ៍របស់អ្នក។"
          : "About 10 minutes in total: RIASEC (~4 mins), 16 Personalities (~3 mins), and the BACII simulator (instant results). You can use them one at a time, and your answers are saved on your device.",
      },
    ];
  }, [isKm]);

  // Register GSAP ScrollTrigger animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Hero sequence
      gsap.fromTo(
        ".gsap-assess-hero-anim",
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
        ".gsap-assess-visualizer-card",
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

      // Section 1: The 4 Diagnostic Engines
      gsap.fromTo(
        ".gsap-engine-card",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-engines-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Section 2: 4-Step Student Journey
      gsap.fromTo(
        ".gsap-step-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-steps-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Section 3: Comparison Matrix
      gsap.fromTo(
        ".gsap-compare-table",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-compare-container",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFD] dark:bg-[#070B1E] text-[#111965] dark:text-slate-100 selection:bg-[#F7CE4D] selection:text-[#111965] transition-colors duration-300">
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
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: concise value proposition + primary actions */}
            <div className="space-y-6 text-left lg:col-span-7">
              <div className="gsap-assess-hero-anim inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  {isKm
                    ? "ប្រព័ន្ធណែនាំ ៤ វិមាត្រសម្រាប់កម្ពុជា"
                    : "Cambodia's 4-Pillar Guidance System"}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className={`gsap-assess-hero-anim text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-[2.7rem] xl:text-[3.4rem] ${
                  isKm ? "leading-[1.45] sm:leading-[1.3]" : "leading-[1.08]"
                }`}>
                  {isKm ? (
                    <>
                      ស្វែងយល់ខ្លួនឯងតាមវិទ្យាសាស្ត្រ
                      <br className="hidden sm:inline" />
                      <span className="text-[#F7CE4D]"> & ផ្គូផ្គងជំនាញដោយ AI</span>
                    </>
                  ) : (
                    <>
                      Scientific Self-Discovery
                      <br className="hidden sm:inline" />
                      <span className="text-[#F7CE4D]"> & Major Matching</span>
                    </>
                  )}
                </h1>
                <p className="gsap-assess-hero-anim max-w-[46ch] text-[15px] font-normal leading-relaxed text-slate-300/90 sm:text-base">
                  {isKm
                    ? "ឧបករណ៍ណែនាំ ៤ ប្រភេទ ផ្តល់ផ្លូវច្បាស់លាស់មួយទៅកាន់ជំនាញ និងសាកលវិទ្យាល័យដែលស័ក្តិសមនឹងអ្នក។"
                    : "Four evidence-based guidance tools, one clearer path to a Cambodian major and university that fit you."}
                </p>
              </div>

              <div className="gsap-assess-hero-anim flex flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href="/assessments/riasec/test"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7CE4D] px-6 py-3.5 text-sm font-black text-[#111965] shadow-[0_4px_24px_rgba(247,206,77,0.28)] transition-all hover:bg-[#E5BD3B] hover:shadow-[0_6px_28px_rgba(247,206,77,0.4)] active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4 text-[#111965]" />
                  <span>{isKm ? "ចាប់ផ្តើមវាយតម្លៃឥតគិតថ្លៃ" : "Start free assessment"}</span>
                  <ArrowRight className="h-4 w-4 text-[#111965]" />
                </Link>

                {user && (
                  <Link
                    href="/dashboard/recommendations"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-400/40 bg-purple-500/15 px-5 py-3.5 text-sm font-black text-purple-200 transition-all hover:bg-purple-500/25 hover:border-purple-300 active:scale-[0.98]"
                  >
                    <BrainCircuit className="h-4 w-4 text-purple-300" />
                    <span>{isKm ? "មើលលទ្ធផលផ្គូផ្គង" : "View My Matches"}</span>
                  </Link>
                )}

                <Link
                  href="#engines"
                  className="group inline-flex items-center justify-center gap-1.5 rounded-lg px-1 py-2 text-[13px] font-bold text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7CE4D]/50"
                >
                  <span>{isKm ? "ស្វែងយល់ពីម៉ាស៊ីនទាំង ៤" : "Explore the 4 engines"}</span>
                  <ChevronRight className="h-4 w-4 text-[#F7CE4D] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="gsap-assess-hero-anim flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/10 pt-4 text-[11px] font-medium text-white/45">
                <span>
                  {isKm
                    ? `ជំនាញ ${STATIC_MAJORS.length}`
                    : `${STATIC_MAJORS.length} majors`}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/25" />
                <span>
                  {isKm
                    ? `សាកលវិទ្យាល័យ ${STATIC_UNIVERSITIES.length}`
                    : `${STATIC_UNIVERSITIES.length} universities`}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/25" />
                <span>{isKm ? "ឥតគិតថ្លៃ ១០០%" : "100% free"}</span>
              </div>
            </div>

            {/* Right Column: compact four-pillar overview */}
            <div className="gsap-assess-visualizer-card lg:col-span-5">
              <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-5 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-6">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#F7CE4D]/10 blur-3xl"
                />

                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/50">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {isKm ? "ម៉ាស៊ីនផ្គូផ្គងផ្ទាល់" : "Live matching engine"}
                    </span>
                    <span className="rounded-full border border-[#F7CE4D]/25 bg-[#F7CE4D]/10 px-2.5 py-1 text-[10px] font-extrabold text-[#F7CE4D]">
                      {isKm ? "ឥតគិតថ្លៃ" : "100% FREE"}
                    </span>
                  </div>

                  <div className="mt-4 flex h-1.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
                    {ENGINES.map((engine) => (
                      <span
                        key={engine.id}
                        className="rounded-full"
                        style={{
                          flexGrow: 1,
                          flexBasis: 0,
                          backgroundColor: engine.color,
                        }}
                      />
                    ))}
                  </div>

                  <div className="mt-3 divide-y divide-white/[0.06]">
                    {ENGINES.map((engine) => {
                      const Icon = engine.icon;
                      return (
                        <div key={engine.id} className="flex items-center gap-3 py-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
                            <Icon className="h-4 w-4" style={{ color: engine.color }} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-white/90">
                            {isKm ? engine.heroTitleKm : engine.heroTitleEn}
                          </span>
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3.5">
                    <span className="text-[10.5px] font-medium text-white/40">
                      {isKm ? "ប្រហែល ១០ នាទីសរុប" : "About 10 min total"}
                    </span>
                    <Link
                      href="#engines"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F7CE4D] transition-colors hover:text-[#FFE28A]"
                    >
                      <span>{isKm ? "មើលរបៀបផ្គូផ្គង" : "See how it works"}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: THE 4 DIAGNOSTIC ENGINES CARDS (BENTO SHOWCASE)
          ========================================================================= */}
      <section id="engines" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111965]/5 dark:bg-white/10 border border-[#111965]/10 dark:border-white/15 text-[12px] font-bold text-[#111965] dark:text-blue-300 tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5 text-[#F7CE4D]" />
            <span>{isKm ? "មូលដ្ឋានណែនាំទាំង ៤ របស់ OrienX" : "The 4 Guidance Pillars"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111965] dark:text-white tracking-tight">
            {isKm ? "តេស្តវិភាគលម្អិតសម្រាប់សិស្សកម្ពុជា" : "Dedicated Diagnostic Engines"}
          </h2>
          <p className="text-xs sm:text-sm text-[#68708A] dark:text-slate-300 leading-relaxed">
            {isKm
              ? "តេស្តនីមួយៗឆ្លុះបញ្ចាំងពីវិមាត្រសំខាន់ៗដែលចាំបាច់ក្នុងការជ្រើសរើសជំនាញសិក្សា។ ចុចលើតេស្តនីមួយៗដើម្បីស្វែងយល់លម្អិត។"
              : "Each test addresses a distinct diagnostic dimension to ensure a holistic, highly realistic academic and career trajectory."}
          </p>
        </div>

        <div className="gsap-engines-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
          {ENGINES.map((engine) => {
            const Icon = engine.icon;
            return (
              <div
                key={engine.id}
                className="gsap-engine-card rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B112C] p-6 sm:p-8 shadow-2xs hover:shadow-[0_8px_20px_-16px_rgba(17,25,101,0.22)] dark:hover:shadow-[0_8px_20px_-16px_rgba(0,0,0,0.45)] transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group"
              >
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                          PILLAR {engine.number}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${engine.badgeClass}`}>
                          {isKm ? "វិមាត្រសំខាន់" : "Core pillar"}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#111965] dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                        {isKm ? engine.titleKm : engine.titleEn}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {isKm ? engine.taglineKm : engine.taglineEn}
                      </p>
                    </div>

                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white transition-transform group-hover:scale-105"
                      style={{ backgroundColor: engine.color }}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {isKm ? engine.descKm : engine.descEn}
                  </p>

                  {/* Metrics Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{isKm ? engine.metricsKm : engine.metricsEn}</span>
                  </div>

                  {/* Key Features List */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-white/10">
                    {(isKm ? engine.featuresKm : engine.featuresEn).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={engine.primaryLink}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    <span>{isKm ? engine.linkTextKm : engine.linkTextEn}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  </Link>
                  {engine.id !== "bacii" && (
                    <Link
                      href={engine.testLink}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#111965] dark:bg-blue-600 hover:bg-[#18237c] dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-black shadow-xs transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D]" />
                      <span>{isKm ? engine.startTextKm : engine.startTextEn}</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: STEP-BY-STEP ASSESSMENT JOURNEY
          ========================================================================= */}
      <section className="py-16 bg-white dark:bg-[#090D26] border-y border-[#E6E8F0] dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40">
              <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isKm ? "ដំណើរការវាយតម្លៃជា ៤ ជំហាន" : "The 4-Step Student Journey"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111965] dark:text-white tracking-tight">
              {isKm ? "របៀបដែល OrienX ដំណើរការ" : "How the Assessment Pathway Works"}
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A] dark:text-slate-300 leading-relaxed">
              {isKm
                ? "ចំណាយពេលប្រហែល ១០ នាទីដើម្បីទទួលបានទិសដៅសិក្សា និងអាជីពកាន់តែច្បាស់។"
                : "A short, transparent path from self-discovery to a clearer study shortlist."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 gsap-steps-grid">
            <div className="bg-[#FAFBFD] dark:bg-[#0B112C] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xs space-y-3 relative flex flex-col justify-between gsap-step-card">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/25">
                  1
                </div>
                <h3 className="text-base font-extrabold text-[#111965] dark:text-white">
                  {isKm ? "១. តេស្ត RIASEC" : "1. Holland RIASEC"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {isKm
                    ? "ឆ្លើយ ១៨ សកម្មភាពជាក់ស្តែងដើម្បីស្វែងរកចំណាប់អារម្មណ៍ការងារពីធម្មជាតិ ៦ វិមាត្រ។"
                    : "Complete 18 activity items to measure your natural affinity for practical, analytical, or social tasks."}
                </p>
              </div>
              <div className="text-[12px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2.5 py-1 rounded-xl inline-block mt-3 self-start">
                ~4 Mins • 18 Activities
              </div>
            </div>

            <div className="bg-[#FAFBFD] dark:bg-[#0B112C] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xs space-y-3 relative flex flex-col justify-between gsap-step-card">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-600/25">
                  2
                </div>
                <h3 className="text-base font-extrabold text-[#111965] dark:text-white">
                  {isKm ? "២. តេស្តបុគ្គលិកលក្ខណៈ" : "2. 16 Personalities"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {isKm
                    ? "ស្វែងយល់ពីរចនាប័ទ្មនៃការគិត ភាពធន់នឹងសម្ពាធ និងរបៀបធ្វើការងារជាក្រុម។"
                    : "Explore how you think, communicate, and work in teams across four preference pairs."}
                </p>
              </div>
              <div className="text-[12px] font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 px-2.5 py-1 rounded-xl inline-block mt-3 self-start">
                ~3 Mins • 12 Statements
              </div>
            </div>

            <div className="bg-[#FAFBFD] dark:bg-[#0B112C] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xs space-y-3 relative flex flex-col justify-between gsap-step-card">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-emerald-600/25">
                  3
                </div>
                <h3 className="text-base font-extrabold text-[#111965] dark:text-white">
                  {isKm ? "៣. ចំណូលចិត្ត & ថ្នាក់បាក់ឌុប" : "3. Academic Stream"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {isKm
                    ? "កំណត់មុខវិជ្ជាពូកែ ថ្នាក់វិទ្យាសាស្ត្រ ឬសង្គម និងថវិកាសិក្សា។"
                    : "Choose your Grade 12 stream, strongest subjects, and annual tuition budget."}
                </p>
              </div>
              <div className="text-[12px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-xl inline-block mt-3 self-start">
                Instant • 3 Inputs
              </div>
            </div>

            <div className="bg-[#FAFBFD] dark:bg-[#0B112C] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xs space-y-3 relative flex flex-col justify-between gsap-step-card">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-purple-600/25">
                  4
                </div>
                <h3 className="text-base font-extrabold text-[#111965] dark:text-white">
                  {isKm ? "៤. លទ្ធផលផ្ទាល់ខ្លួន" : "4. Your Results"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {isKm
                    ? "ទទួលបានពិន្ទុត្រូវគ្នា ជំនាញពាក់ព័ន្ធ និងជម្រើសអាជីព ដែលអាចទាញយក ឬចែករំលែកបាន។"
                    : "Receive transparent match scores, related majors, and career ideas you can export or share."}
                </p>
              </div>
              <div className="text-[12px] font-bold text-purple-800 dark:text-purple-300 bg-purple-200 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800/40 px-2.5 py-1 rounded-xl inline-block mt-3 self-start">
                Instant Results
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: COMPARISON MATRIX: ORIENX VS GENERIC QUIZZES
          ========================================================================= */}
      <section className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 gsap-compare-container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/80 dark:border-blue-800/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{isKm ? "ភាពខុសគ្នាពីតេស្តទូទៅ" : "OrienX vs. Generic Online Quizzes"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965] dark:text-white tracking-tight">
            {isKm ? "ហេតុអ្វីសិស្ស និងអាណាព្យាបាលជឿទុកចិត្តលើ OrienX" : "Why OrienX Outperforms Generic Quizzes"}
          </h2>
          <p className="text-xs sm:text-sm text-[#68708A] dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
            {isKm
              ? "ការប្រៀបធៀបរវាងការវិភាគបែបវិទ្យាសាស្ត្រក្នុងបរិបទកម្ពុជា និងការទាយបែបកម្សាន្ត។"
              : "How multi-factor algorithmic rigor eliminates major dropouts and unrealistic university choices."}
          </p>
        </div>

        {/* Clean, Highly Readable Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0B1128] shadow-xs gsap-compare-table">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-5 sm:px-6 w-1/4">
                  {isKm ? "លក្ខណៈវិនិច្ឆ័យ" : "Criteria"}
                </th>
                <th className="py-4 px-5 sm:px-6 w-5/12 bg-blue-50/60 dark:bg-blue-500/10 text-blue-900 dark:text-blue-300 border-x border-blue-100 dark:border-blue-500/20">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D] shrink-0" />
                    <span>OrienX Assessment Ecosystem</span>
                  </div>
                </th>
                <th className="py-4 px-5 sm:px-6 w-1/3 text-slate-400 dark:text-slate-500 font-bold">
                  {isKm ? "តេស្តអនឡាញទូទៅ" : "Generic Online Quizzes"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs sm:text-sm">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/50 dark:hover:bg-white/[0.015] transition-colors"
                >
                  {/* Criterion Title */}
                  <td className="py-4 px-5 sm:px-6 font-bold text-slate-900 dark:text-white align-top">
                    {isKm ? row.featureKm : row.featureEn}
                  </td>

                  {/* OrienX: Clean checkmark + direct punchy sentence */}
                  <td className="py-4 px-5 sm:px-6 bg-blue-50/30 dark:bg-blue-500/[0.03] text-slate-800 dark:text-slate-200 border-x border-blue-100/80 dark:border-blue-500/15 align-top">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-medium leading-relaxed">
                        {isKm ? row.orienxKm : row.orienxEn}
                      </span>
                    </div>
                  </td>

                  {/* Generic: Clean direct contrast */}
                  <td className="py-4 px-5 sm:px-6 text-slate-500 dark:text-slate-400 align-top leading-relaxed font-normal">
                    {isKm ? row.genericKm : row.genericEn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FAQ ACCORDION (SHARED HOME COMPONENT)
          ========================================================================= */}
      <FaqSection
        id="assessments-faq"
        eyebrow={isKm ? "ចម្ងល់ទូទៅអំពីតេស្តវាយតម្លៃ" : "Diagnostic Assessments FAQ"}
        title={isKm ? "សំណួរដែលសិស្ស និងអាណាព្យាបាលសួរញឹកញាប់" : "Frequently Asked Questions"}
        subtitle={
          isKm
            ? "ស្វែងយល់បន្ថែមអំពីវិធីសាស្ត្រវិទ្យាសាស្ត្រ ការរួមបញ្ចូលទិន្នន័យ និងរបៀបដែលការវាយតម្លៃជួយសិស្សជ្រើសរើសជំនាញ។"
            : "Learn how the 4-pillar methodology eliminates guesswork, connects to Cambodian colleges, and secures your future."
        }
        items={assessmentsFaqs}
      />

      {/* =========================================================================
          SECTION 5: BOTTOM CONVERSION CTA BANNER (SHARED HOME COMPONENT)
          ========================================================================= */}
      <CtaBanner
        eyebrow={isKm ? "ឥតគិតថ្លៃ ១០០% សម្រាប់សិស្ស-និស្សិតកម្ពុជា" : "100% Free For All Cambodian Students"}
        title={
          isKm
            ? "ត្រៀមខ្លួនស្វែងរកជំនាញ និងសាកលវិទ្យាល័យដែលត្រូវគ្នានឹងអ្នកហើយឬនៅ?"
            : "Ready to Discover Your True Major & Career Path?"
        }
        subtitle={
          isKm
            ? "ចាប់ផ្តើមធ្វើតេស្ត Holland RIASEC ជាជំហានដំបូង រួចបន្តទៅកាន់បុគ្គលិកលក្ខណៈទាំង ១៦ និងលក្ខខណ្ឌសិក្សា ដើម្បីទទួលបានលទ្ធផលផ្គូផ្គងភ្លាមៗ។"
            : "Begin with the short Holland RIASEC assessment, then explore 16 Personalities and your BACII stream context."
        }
        primaryButtonText={isKm ? "ចាប់ផ្តើមតេស្ត RIASEC (ប្រហែល ៤ នាទី)" : "Start Free RIASEC (About 4 Mins)"}
        primaryButtonHref="/assessments/riasec/test"
        secondaryButtonText={isKm ? "ស្វែងរកជំនាញសាកលវិទ្យាល័យ" : "Explore University Majors"}
        secondaryButtonHref="/majors"
        mascotSpeech={isKm ? "តោះស្វែងរកអនាគតជាមួយគ្នា! 🚀" : "Let's discover your future! 🚀"}
        badges={[
          {
            icon: <Clock className="w-4 h-4 text-[#F7CE4D] shrink-0" />,
            label: isKm ? "ប្រហែល ១០ នាទីសរុប" : "About 10 Min Total",
          },
          {
            icon: <Target className="w-4 h-4 text-emerald-400 shrink-0" />,
            label: isKm ? "ក្របខ័ណ្ឌណែនាំ ៤ ជំហាន" : "4 Guidance Pillars",
          },
          {
            icon: <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />,
            label: isKm
              ? `ជំនាញ ${STATIC_MAJORS.length} ក្នុងបញ្ជី`
              : `${STATIC_MAJORS.length} Majors in the Directory`,
          },
        ]}
        trustText={
          isKm
            ? "ផ្អែកលើក្របខ័ណ្ឌ Holland RIASEC, បុគ្គលិកលក្ខណៈ ១៦ ប្រភេទ, បរិបទបាក់ឌុប និងទម្រង់អាជីពកម្ពុជា"
            : "Built on Holland's RIASEC framework, 16 personality styles, BACII context, and Cambodian career profiles"
        }
      />
    </div>
  );
}
