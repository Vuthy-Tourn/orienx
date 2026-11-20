"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { getStaticMajor, listStaticCareers } from "@/lib/data/catalog";
import { DirectoryControls } from "@/components/directory/directory-controls";
import { DirectoryHeroStats } from "@/components/directory/directory-hero-stats";
import {
  Briefcase,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  Compass,
  ChevronRight,
  Cpu,
  BarChart3,
  HardHat,
  HeartPulse,
  Palette,
  Users,
  FlaskConical,
  WifiOff,
  RefreshCw,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkButton } from "@/components/ui/bookmark-button";

type SalaryTier = {
  junior: string;
  mid: string;
  senior: string;
  growthRate: string;
  growthRateKm: string;
  iconName:
    | "cpu"
    | "chart"
    | "construction"
    | "health"
    | "design"
    | "education"
    | "people"
    | "science";
  recommendedMajors: { en: string; km: string; slug: string }[];
  milestones: string[];
};

function majorLink(slug: string): { en: string; km: string; slug: string } {
  const major = getStaticMajor(slug);
  return {
    en: major?.name.en ?? slug,
    km: major?.name.km ?? slug,
    slug,
  };
}

function pendingCareer(
  iconName: SalaryTier["iconName"],
  majorSlugs: string[],
  milestones: string[]
): SalaryTier {
  return {
    junior: "—",
    mid: "—",
    senior: "—",
    growthRate: "",
    growthRateKm: "",
    iconName,
    recommendedMajors: majorSlugs.map(majorLink),
    milestones,
  };
}

// Career salary benchmarks by experience tier (Cambodian Market 2026)
const SALARY_TIERS: Record<string, SalaryTier> = {
  "software-engineer": {
    junior: "$450 – $900",
    mid: "$950 – $1,600",
    senior: "$1,800 – $3,500+",
    growthRate: "+28% YoY Growth",
    growthRateKm: "+២៨% កំណើនប្រចាំឆ្នាំ",
    iconName: "cpu",
    recommendedMajors: [
      { en: "Software Engineering", km: "វិស្វកម្មកម្មវិធី", slug: "software-engineering" },
      { en: "Data Science & AI", km: "វិទ្យាសាស្ត្រទិន្នន័យ & AI", slug: "data-science-ai" },
    ],
    milestones: ["Junior Developer (0-2y)", "Full-Stack Engineer (3-5y)", "Technical Lead / Architect (5y+)"],
  },
  "financial-analyst": {
    junior: "$400 – $750",
    mid: "$800 – $1,400",
    senior: "$1,500 – $2,800+",
    growthRate: "+19% YoY Growth",
    growthRateKm: "+១៩% កំណើនប្រចាំឆ្នាំ",
    iconName: "chart",
    recommendedMajors: [
      { en: "Banking & Finance", km: "ធនាគារ និងហិរញ្ញវត្ថុ", slug: "banking-finance" },
      { en: "Business Administration", km: "គ្រប់គ្រងធុរកិច្ច", slug: "business-administration" },
    ],
    milestones: ["Financial Associate (0-2y)", "Senior Risk Analyst (3-5y)", "Finance Director / VP (5y+)"],
  },
  "civil-engineer": {
    junior: "$350 – $700",
    mid: "$750 – $1,300",
    senior: "$1,400 – $2,500+",
    growthRate: "+15% YoY Growth",
    growthRateKm: "+១៥% កំណើនប្រចាំឆ្នាំ",
    iconName: "construction",
    recommendedMajors: [
      { en: "Civil Engineering", km: "វិស្វកម្មសំណង់ស៊ីវិល", slug: "civil-engineering" },
    ],
    milestones: ["Site Supervisor (0-2y)", "Structural Design Engineer (3-5y)", "Project Director (5y+)"],
  },
  "data-scientist": pendingCareer(
    "chart",
    ["data-science-ai", "computer-science", "mathematics-statistics"],
    ["Junior Data Analyst", "Data Scientist", "Senior / Lead Data Scientist"]
  ),
  "cybersecurity-analyst": pendingCareer(
    "cpu",
    ["cybersecurity-networking", "information-technology", "computer-science"],
    ["Security Operations Analyst", "Cybersecurity Analyst", "Security Manager"]
  ),
  "mechanical-engineer": pendingCareer(
    "construction",
    ["mechanical-engineering", "mechatronics-robotics", "electrical-electronic-engineering"],
    ["Junior Mechanical Engineer", "Mechanical Engineer", "Engineering Manager"]
  ),
  "graphic-designer": pendingCareer(
    "design",
    ["graphic-design-multimedia", "fine-arts", "media-communications"],
    ["Junior Designer", "Graphic Designer", "Art Director"]
  ),
  "architect": pendingCareer(
    "design",
    ["architecture-urban-planning", "civil-engineering", "fine-arts"],
    ["Architectural Assistant", "Architect", "Project Architect"]
  ),
  "registered-nurse": pendingCareer(
    "health",
    ["nursing-science", "public-health", "general-medicine"],
    ["Staff Nurse", "Senior Nurse", "Nurse Manager"]
  ),
  "high-school-teacher": pendingCareer(
    "education",
    ["english-teaching-tefl", "mathematics-statistics", "physics-electronics"],
    ["Assistant Teacher", "High School Teacher", "Head of Department"]
  ),
  "marketing-manager": pendingCareer(
    "people",
    ["marketing-digital-media", "business-administration", "media-communications"],
    ["Marketing Associate", "Marketing Manager", "Marketing Director"]
  ),
  "accountant": pendingCareer(
    "chart",
    ["accounting-auditing", "banking-finance", "business-administration"],
    ["Junior Accountant", "Accountant", "Finance Manager"]
  ),
  "sales-executive": pendingCareer(
    "people",
    ["business-administration", "marketing-digital-media", "media-communications"],
    ["Sales Trainee", "Sales Executive", "Sales Supervisor"]
  ),
  "business-development-manager": pendingCareer(
    "people",
    ["business-administration", "marketing-digital-media", "international-business"],
    ["Business Development Executive", "Business Development Manager", "Head of Growth"]
  ),
  "marketing-executive": pendingCareer(
    "people",
    ["marketing-digital-media", "media-communications", "business-administration"],
    ["Marketing Assistant", "Marketing Executive", "Marketing Manager"]
  ),
  "social-media-specialist": pendingCareer(
    "design",
    ["marketing-digital-media", "media-communications", "graphic-design-multimedia"],
    ["Content Assistant", "Social Media Specialist", "Social Media Lead"]
  ),
  "human-resources-officer": pendingCareer(
    "people",
    ["human-resource-management", "business-administration", "psychology-counseling"],
    ["HR Assistant", "HR Officer", "HR Manager"]
  ),
  "logistics-coordinator": pendingCareer(
    "chart",
    ["supply-chain-logistics", "e-commerce-logistics", "business-administration"],
    ["Logistics Assistant", "Logistics Coordinator", "Logistics Manager"]
  ),
  "procurement-officer": pendingCareer(
    "chart",
    ["supply-chain-logistics", "business-administration"],
    ["Procurement Assistant", "Procurement Officer", "Procurement Manager"]
  ),
  "customer-service-officer": pendingCareer(
    "people",
    ["business-administration", "hospitality-tourism-management", "media-communications"],
    ["Customer Service Trainee", "Customer Service Officer", "Customer Service Supervisor"]
  ),
  "credit-loan-officer": pendingCareer(
    "chart",
    ["banking-finance", "business-administration", "accounting-auditing"],
    ["Loan Assistant", "Credit / Loan Officer", "Branch Manager"]
  ),
  "legal-officer": pendingCareer(
    "chart",
    ["law-jurisprudence", "public-administration"],
    ["Legal Assistant", "Legal Officer", "Legal Manager"]
  ),
  "hotel-supervisor": pendingCareer(
    "people",
    ["hospitality-tourism-management", "business-administration"],
    ["Hotel Staff", "Hotel Supervisor", "Hotel Manager"]
  ),
  "translator": pendingCareer(
    "education",
    ["english-translation-interpreting", "english-teaching-tefl"],
    ["Junior Translator", "Translator", "Senior Translator / Editor"]
  ),
  "pr-officer": pendingCareer(
    "people",
    ["media-communications", "marketing-digital-media", "english-translation-interpreting"],
    ["PR Assistant", "PR Officer", "PR Manager"]
  ),
  "research-development-officer": pendingCareer(
    "science",
    ["biology-biotechnology", "chemistry-chemical-analysis", "food-technology-engineering"],
    ["Research Assistant", "R&D Officer", "R&D Manager"]
  ),
  "administrative-assistant": pendingCareer(
    "people",
    ["business-administration", "public-administration", "accounting-auditing"],
    ["Office Assistant", "Administrative Assistant", "Office Manager"]
  ),
  "operations-manager": pendingCareer(
    "people",
    ["business-administration", "supply-chain-logistics", "public-administration"],
    ["Operations Officer", "Operations Manager", "Head of Operations"]
  ),
  "chef-fb-supervisor": pendingCareer(
    "people",
    ["culinary-arts", "hospitality-tourism-management"],
    ["Kitchen Staff", "Chef / F&B Supervisor", "Head Chef / F&B Manager"]
  ),
  "electrician": pendingCareer(
    "construction",
    ["electrical-electronic-engineering", "mechatronics-robotics"],
    ["Electrical Assistant", "Electrician", "Electrical Supervisor"]
  ),
  "quality-assurance-officer": pendingCareer(
    "science",
    ["food-technology-engineering", "chemistry-chemical-analysis", "biology-biotechnology"],
    ["QA Assistant", "QA Officer", "QA Manager"]
  ),
};

const INDUSTRY_KM: Record<string, string> = {
  Technology: "បច្ចេកវិទ្យា",
  "Finance & Banking": "ហិរញ្ញវត្ថុ & ធនាគារ",
  "Engineering & Construction": "វិស្វកម្ម & សំណង់",
  "Technology & Data": "បច្ចេកវិទ្យា និងទិន្នន័យ",
  "Technology & Security": "បច្ចេកវិទ្យា និងសន្តិសុខ",
  "Engineering & Manufacturing": "វិស្វកម្ម និងការផលិត",
  "Creative & Media": "ច្នៃប្រឌិត និងមេឌា",
  "Design & Construction": "រចនា និងសំណង់",
  "Health Care": "ថែទាំសុខភាព",
  Education: "ការអប់រំ",
  "Business & Marketing": "អាជីវកម្ម និងទីផ្សារ",
  "Finance & Business": "ហិរញ្ញវត្ថុ និងអាជីវកម្ម",
  "Sales & Business Development": "ការលក់ និងអភិវឌ្ឍន៍អាជីវកម្ម",
  "Marketing & Media": "ទីផ្សារ និងមេឌា",
  "Human Resources": "ធនធានមនុស្ស",
  "Logistics & Supply Chain": "ដឹកជញ្ជូន និងខ្សែចង្វាក់ផ្គត់ផ្គង់",
  "Procurement & Supply Chain": "លទ្ធកម្ម និងខ្សែចង្វាក់ផ្គត់ផ្គង់",
  "Customer Service": "សេវាអតិថិជន",
  "Legal & Compliance": "ច្បាប់ និងការអនុលោម",
  "Hospitality & Tourism": "បដិសណ្ឋារកិច្ច និងទេសចរណ៍",
  "Translation & Languages": "ការបកប្រែ និងភាសា",
  "PR & Communications": "ទំនាក់ទំនងសាធារណៈ និងទំនាក់ទំនង",
  "Research & Development": "ការស្រាវជ្រាវ និងអភិវឌ្ឍន៍",
  Administrative: "រដ្ឋបាល",
  "Management & Operations": "ការគ្រប់គ្រង និងប្រតិបត្តិការ",
  "Food & Beverage": "អាហារ និងភេសជ្ជៈ",
  "Construction & Skilled Trades": "សំណង់ និងជាងជំនាញ",
  "Quality Assurance": "ការធានាគុណភាព",
};

const SENIORITY_LABELS = {
  junior: { en: "Junior benchmark", km: "ប្រាក់ខែយោងកម្រិតដំបូង" },
  mid: { en: "Mid-level benchmark", km: "ប្រាក់ខែយោងកម្រិតមធ្យម" },
  senior: { en: "Senior benchmark", km: "ប្រាក់ខែយោងកម្រិតជាន់ខ្ពស់" },
} as const;

function shortMilestone(value: string) {
  return value.replace(/\s*\([^)]*\)/g, "").split(" / ")[0].trim();
}

const RIASEC_MAP: Record<string, { titleEn: string; titleKm: string; desc: string; descKm: string; color: string }> = {
  R: { titleEn: "Realistic", titleKm: "ជាក់ស្តែង (អនុវត្ត)", desc: "Hands-on problem solvers who work with physical objects, tools, and construction.", descKm: "អ្នកដោះស្រាយបញ្ហាជាក់ស្តែង ដែលធ្វើការជាមួយវត្ថុ ឧបករណ៍ និងសំណង់។", color: "bg-amber-50 text-amber-900 border-amber-200" },
  I: { titleEn: "Investigative", titleKm: "ស្រាវជ្រាវ (វិភាគ)", desc: "Analytical thinkers who excel at logic, programming, algorithms, and research.", descKm: "អ្នកគិតវិភាគ ពូកែផ្នែកតក្កវិជ្ជា កម្មវិធី ក្បួនដោះស្រាយ និងការស្រាវជ្រាវ។", color: "bg-blue-50 text-blue-900 border-blue-200" },
  A: { titleEn: "Artistic", titleKm: "សិល្បៈ (ច្នៃប្រឌិត)", desc: "Expressive creators focused on UX/UI design, media production, and innovation.", descKm: "អ្នកបង្កើតច្នៃប្រឌិត ផ្តោតលើ UX/UI ផលិតកម្មមេឌៀ និងនវានុវត្តន៍។", color: "bg-purple-50 text-purple-900 border-purple-200" },
  S: { titleEn: "Social", titleKm: "សង្គម (ជួយអ្នកដទៃ)", desc: "Empathetic communicators who thrive in education, mentoring, and counseling.", descKm: "អ្នកទំនាក់ទំនងដែលយល់ចិត្ត ពូកែផ្នែកអប់រំ ណែនាំ និងការប្រឹក្សា។", color: "bg-emerald-50 text-emerald-900 border-emerald-200" },
  E: { titleEn: "Enterprising", titleKm: "សហគ្រិន (ដឹកនាំ)", desc: "Persuasive decision makers drawn to management, leadership, and entrepreneurship.", descKm: "អ្នកសម្រេចចិត្តដែលមានឥទ្ធិពល ទាក់ទាញផ្នែកគ្រប់គ្រង ដឹកនាំ និងសហគ្រិនភាព។", color: "bg-orange-50 text-orange-900 border-orange-200" },
  C: { titleEn: "Conventional", titleKm: "ការិយាល័យ (រៀបរយ)", desc: "Organized detail specialists skilled in finance, compliance, and administration.", descKm: "អ្នករៀបចំលម្អិត ពូកែផ្នែកហិរញ្ញវត្ថុ ការអនុលោម និងរដ្ឋបាល។", color: "bg-slate-50 text-slate-900 border-slate-200" },
};

export default function CareersPage() {
  const { t, getLocalized, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "title">("default");
  const [seniorityLevel, setSeniorityLevel] = useState<"junior" | "mid" | "senior">("junior");
  const [selectedRiasec, setSelectedRiasec] = useState<string | null>(null);

  const industryOptions = useMemo(() => {
    const allCareers = listStaticCareers();
    const counts = new Map<string, number>();
    for (const career of allCareers) {
      counts.set(career.industry, (counts.get(career.industry) ?? 0) + 1);
    }
    const industries = Array.from(counts.entries())
      .map(([industry, count]) => ({
        value: industry,
        label: language === "km" ? INDUSTRY_KM[industry] || industry : industry,
        description:
          language === "km"
            ? `${count} អាជីព`
            : `${count} ${count === 1 ? "career" : "careers"}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, language));

    return [
      {
        value: "",
        label: t("careersDirectory.allIndustries"),
        description:
          language === "km"
            ? `${allCareers.length} អាជីព`
            : `Show all ${allCareers.length} careers`,
      },
      ...industries,
    ];
  }, [language, t]);

  const careers = listStaticCareers({
    search: searchTerm,
    industry: industryFilter || undefined,
  });
  const isLoading = false;
  const isError = false;
  const isFetching = false;
  const refetch = () => {};

  const filteredCareers = useMemo(() => {
    if (!careers) return [];
    const list = selectedRiasec
      ? careers.filter((c) => c.riasec_code?.includes(selectedRiasec))
      : [...careers];
    if (sortBy === "title") {
      list.sort((a, b) => getLocalized(a.title).localeCompare(getLocalized(b.title)));
    }
    return list;
  }, [careers, selectedRiasec, sortBy, getLocalized]);

  const hasActiveFilters = Boolean(searchTerm || industryFilter || selectedRiasec);

  const resetFilters = () => {
    setSearchTerm("");
    setIndustryFilter("");
    setSelectedRiasec(null);
  };

  const renderIcon = (name: SalaryTier["iconName"]) => {
    switch (name) {
      case "cpu":
        return <Cpu className="h-3.5 w-3.5" />;
      case "chart":
        return <BarChart3 className="h-3.5 w-3.5" />;
      case "construction":
        return <HardHat className="h-3.5 w-3.5" />;
      case "health":
        return <HeartPulse className="h-3.5 w-3.5" />;
      case "design":
        return <Palette className="h-3.5 w-3.5" />;
      case "education":
        return <GraduationCap className="h-3.5 w-3.5" />;
      case "people":
        return <Users className="h-3.5 w-3.5" />;
      case "science":
        return <FlaskConical className="h-3.5 w-3.5" />;
      default:
        return <Briefcase className="h-3.5 w-3.5" />;
    }
  };

  const statsSource = careers || [];
  const industryCount = new Set(statsSource.map((c) => c.industry)).size;
  const entrySalaries = Object.values(SALARY_TIERS)
    .map((tier) => {
      const match = tier.junior.match(/\d+/);
      return match ? Number(match[0]) : 0;
    })
    .filter((value) => value > 0);
  const minSalary = entrySalaries.length ? Math.min(...entrySalaries) : null;
  const heroStats = [
    {
      label: language === "km" ? "អាជីព" : "Careers",
      value: careers ? String(statsSource.length) : "—",
    },
    {
      label: language === "km" ? "វិស័យ" : "Industries",
      value: careers ? String(industryCount) : "—",
    },
    {
      label: language === "km" ? "ប្រាក់ខែចាប់ផ្តើម" : "Entry salary",
      value: minSalary ? `$${minSalary}` : "—",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Hero */}
      <section className="border-b border-[#E6E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-9 sm:px-6 sm:pt-11 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#111965]/15 bg-[#111965]/5 px-3 py-1 text-[12px] font-bold text-[#111965]">
              <Briefcase className="h-3.5 w-3.5" />
              {t("careersDirectory.badge")}
            </span>

            <h1 className="mt-3.5 text-[2rem] font-extrabold leading-[1.12] tracking-[-0.025em] text-[#111965] sm:text-[2.5rem]">
              {t("careersDirectory.title")}
            </h1>

            <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-[#68708A] sm:text-[16px]">
              {t("careersDirectory.subtitle")}
            </p>
          </div>
        </div>

        <DirectoryHeroStats stats={heroStats} />
      </section>

      {/* One control surface: search, filtering, sorting. */}
      <DirectoryControls
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t("careersDirectory.searchPlaceholder")}
        clearSearchLabel={language === "km" ? "សម្អាតការស្វែងរក" : "Clear search"}
        selects={[
          {
            key: "industry",
            value: industryFilter,
            onChange: setIndustryFilter,
            options: industryOptions,
            label: language === "km" ? "វិស័យ" : "Industry",
            className: "md:w-[248px]",
            searchable: true,
          },
        ]}
        sort={{
          value: sortBy,
          onChange: (value) => setSortBy(value as typeof sortBy),
          options: [
            { value: "default", label: language === "km" ? "លំដាប់ដើម" : "Featured order" },
            { value: "title", label: language === "km" ? "ឈ្មោះ A–Z" : "Name A–Z" },
          ],
          label: language === "km" ? "តម្រៀបតាម" : "Sort by",
        }}
        extra={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              aria-label={language === "km" ? "សម្អាតតម្រងទាំងអស់" : "Clear all filters"}
              title={language === "km" ? "សម្អាតតម្រងទាំងអស់" : "Clear all filters"}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[#E6E8F0] bg-white px-2.5 text-xs font-bold text-[#68708A] transition-colors hover:border-slate-300 hover:text-[#171A2C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30 sm:px-3"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {language === "km" ? "សម្អាត" : "Clear"}
              </span>
            </button>
          ) : undefined
        }
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Interactive Seniority & Salary Barometer */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E8F0] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-[#111965]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#111965]">
                  {language === "km" ? "រង្វាស់ប្រាក់ខែយោងកម្ពុជា ២០២៦" : "Cambodia 2026 Salary Benchmark Barometer"}
                </h3>
                <p className="text-xs text-[#68708A]">
                  {language === "km" ? "ការប៉ាន់ស្មានប្រាក់ខែប្រចាំខែ ផ្អែកលើការជួលក្នុងវិស័យបច្ចេកវិទ្យា ហិរញ្ញវត្ថុ និងវិស្វកម្មក្នុងស្រុក" : "Monthly compensation estimates based on local tech, finance, and engineering hiring"}
                </p>
              </div>
            </div>

            {/* Seniority Selector */}
            <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSeniorityLevel("junior")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  seniorityLevel === "junior" ? "bg-white text-[#111965] shadow-xs" : "text-[#68708A]"
                }`}
              >
                {language === "km" ? "កម្រិតដំបូង (០-២ ឆ្នាំ)" : "Junior (0-2 Years)"}
              </button>
              <button
                type="button"
                onClick={() => setSeniorityLevel("mid")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  seniorityLevel === "mid" ? "bg-white text-[#111965] shadow-xs" : "text-[#68708A]"
                }`}
              >
                {language === "km" ? "កម្រិតមធ្យម (៣-៥ ឆ្នាំ)" : "Mid-Level (3-5 Years)"}
              </button>
              <button
                type="button"
                onClick={() => setSeniorityLevel("senior")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  seniorityLevel === "senior" ? "bg-white text-[#111965] shadow-xs" : "text-[#68708A]"
                }`}
              >
                {language === "km" ? "កម្រិតជាន់ខ្ពស់ / អ្នកដឹកនាំ (៥ ឆ្នាំ+)" : "Senior / Lead (5+ Years)"}
              </button>
            </div>
          </div>

          {/* Quick Sector Comparison Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E6E8F0] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#68708A]">
                <span>{language === "km" ? "វិស្វកម្មសូហ្វវែរ & AI" : "Software & AI Engineering"}</span>
                <span className="text-blue-700 font-extrabold">{language === "km" ? "+២៨% តម្រូវការ" : "+28% Demand"}</span>
              </div>
              <div className="whitespace-nowrap text-xl font-black text-[#111965]">
                {seniorityLevel === "junior" ? "$450 – $900" : seniorityLevel === "mid" ? "$950 – $1,600" : "$1,800 – $3,500+"}
                <span className="ml-1 whitespace-nowrap text-xs font-normal text-[#68708A]">{language === "km" ? "/ ខែ" : "/ month"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E6E8F0] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#68708A]">
                <span>{language === "km" ? "ធនាគារ & វិភាគហិរញ្ញវត្ថុ" : "Banking & Financial Analysis"}</span>
                <span className="text-emerald-700 font-extrabold">{language === "km" ? "+១៩% តម្រូវការ" : "+19% Demand"}</span>
              </div>
              <div className="whitespace-nowrap text-xl font-black text-[#111965]">
                {seniorityLevel === "junior" ? "$400 – $750" : seniorityLevel === "mid" ? "$800 – $1,400" : "$1,500 – $2,800+"}
                <span className="ml-1 whitespace-nowrap text-xs font-normal text-[#68708A]">{language === "km" ? "/ ខែ" : "/ month"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E6E8F0] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#68708A]">
                <span>{language === "km" ? "វិស្វកម្មសំណង់ស៊ីវិល & ហេដ្ឋារចនាសម្ព័ន្ធ" : "Civil & Infrastructure Engineering"}</span>
                <span className="text-amber-700 font-extrabold">{language === "km" ? "+១៥% តម្រូវការ" : "+15% Demand"}</span>
              </div>
              <div className="whitespace-nowrap text-xl font-black text-[#111965]">
                {seniorityLevel === "junior" ? "$350 – $700" : seniorityLevel === "mid" ? "$750 – $1,300" : "$1,400 – $2,500+"}
                <span className="ml-1 whitespace-nowrap text-xs font-normal text-[#68708A]">{language === "km" ? "/ ខែ" : "/ month"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Result count */}
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-[#68708A]" aria-live="polite">
            <span className="font-bold tabular-nums text-[#111965]">
              {filteredCareers.length}
            </span>{" "}
            {language === "km" ? "អាជីព" : filteredCareers.length === 1 ? "career" : "careers"}
          </p>
        </div>

        {/* Careers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-[#E6E8F0] p-6 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-3xl bg-white border border-rose-200/80 p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <WifiOff className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-[#111965]">
                {language === "km" ? "មិនអាចទាញយកទិន្នន័យអាជីពការងារបានឡើយ" : "Unable to Load Career Pathways"}
              </h3>
              <p className="text-xs sm:text-sm text-[#68708A] max-w-md mx-auto leading-relaxed">
                {language === "km"
                  ? "ប្រព័ន្ធមិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើទិន្នន័យបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ឬចុចព្យាយាមម្តងទៀត។"
                  : "We couldn't connect to the labor market directory server. Please check your internet connection or try again."}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                <span>{language === "km" ? "ព្យាយាមម្តងទៀត" : "Try Again"}</span>
              </button>
            </div>
          </div>
        ) : filteredCareers && filteredCareers.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {filteredCareers.map((c) => {
              const meta = SALARY_TIERS[c.slug] || {
                junior: "$350 – $700",
                mid: "$750 – $1,300",
                senior: "$1,400 – $2,500+",
                growthRate: "+15% YoY",
                growthRateKm: "+១៥% កំណើនប្រចាំឆ្នាំ",
                iconName: "cpu" as const,
                recommendedMajors: [],
                milestones: ["Junior", "Specialist", "Director"],
              };

              // Display salary according to current seniorityLevel
              const activeSalary =
                seniorityLevel === "junior"
                  ? meta.junior
                  : seniorityLevel === "mid"
                  ? meta.mid
                  : meta.senior;
              const growthShort =
                language === "km"
                  ? meta.growthRateKm.split(" ")[0]
                  : `${meta.growthRate.split(" ")[0]} YoY`;
              const industry =
                language === "km"
                  ? INDUSTRY_KM[c.industry] || c.industry
                  : c.industry;

              return (
                <article
                  key={c.id}
                  className="group relative flex flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-[#E6E8F0] transition-all duration-300 hover:ring-[#111965]/25 hover:shadow-[0_26px_60px_-34px_rgba(17,25,101,0.45)] motion-reduce:transition-none"
                >
                  {/* Industry + demand + save */}
                  <div className="flex items-center justify-between gap-3 px-5 pt-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0F2FA] text-[#111965]">
                        {renderIcon(meta.iconName)}
                      </span>
                      <span
                        className={`line-clamp-2 leading-tight text-[#68708A] sm:line-clamp-1 ${
                          language === "km"
                            ? "text-[11px] font-semibold"
                            : "text-[10px] font-bold uppercase tracking-[0.12em]"
                        }`}
                        title={industry}
                      >
                        {industry}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {meta.growthRate ? (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"
                          title={language === "km" ? meta.growthRateKm : meta.growthRate}
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="sm:hidden">
                            {meta.growthRate.split(" ")[0]}
                          </span>
                          <span className="hidden sm:inline">{growthShort}</span>
                        </span>
                      ) : null}
                      <BookmarkButton entityType="career" entityId={c.id} />
                    </div>
                  </div>

                  {/* Role + summary */}
                  <div className="px-5 pt-3.5">
                    <h3
                      className={`line-clamp-2 text-[19px] font-extrabold tracking-[-0.015em] text-[#111965] transition-colors group-hover:text-[#1E277A] ${
                        language === "km" ? "leading-[1.5]" : "leading-[1.28]"
                      }`}
                    >
                      <Link
                        href={`/careers/${c.slug}`}
                        className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
                      >
                        {getLocalized(c.title)}
                      </Link>
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#68708A]">
                      <span>
                        <span className="font-bold text-[#111965]">
                          {language === "km" ? "រីស៊ីស" : "RIASEC"}
                        </span>{" "}
                        {c.riasec_code}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span>
                        <span className="font-bold text-[#111965]">
                          {language === "km" ? "អប្បបរមា" : "Min."}
                        </span>{" "}
                        {language === "km"
                          ? "បរិញ្ញាបត្រ"
                          : c.education_level || "Bachelor"}
                      </span>
                    </div>
                  </div>

                  <p
                    className={`px-5 pt-3 min-h-[64px] line-clamp-3 text-[12.5px] text-[#68708A] ${
                      language === "km" ? "leading-[1.7]" : "leading-[1.65]"
                    }`}
                  >
                    {getLocalized(c.description)}
                  </p>

                  {/* Live salary benchmark */}
                  <div className="mx-5 mt-4 rounded-xl bg-[#F0F2FA] px-4 py-3">
                    <div className="flex items-start justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#68708A]">
                      <span>{SENIORITY_LABELS[seniorityLevel][language]}</span>
                      <span className="shrink-0">
                        {language === "km" ? "ដុល្លារ / ខែ" : "USD / month"}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[22px] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-[#111965]">
                      {activeSalary}
                    </div>
                  </div>

                  {/* Path + degree links */}
                  <div className="mt-4 space-y-3 border-t border-[#E6E8F0] px-5 py-3.5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#68708A]">
                        {language === "km" ? "ផ្លូវអាជីពធម្មតា" : "Typical career path"}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-1 gap-y-1 text-[11.5px] font-semibold text-[#111965]">
                        {meta.milestones.map((m, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1">
                            {idx > 0 && (
                              <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
                            )}
                            <span title={m}>{shortMilestone(m)}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {meta.recommendedMajors.length > 0 && (
                      <div>
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#68708A]">
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span>{t("careersDirectory.degreePathways")}</span>
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          {meta.recommendedMajors.map((m, idx) => (
                            <span key={m.slug} className="inline-flex items-center gap-2">
                              <Link
                                href={`/majors/${m.slug}`}
                                className="text-[11.5px] font-semibold text-[#111965] underline-offset-2 transition-colors hover:text-[#1E277A] hover:underline"
                              >
                                {language === "km" ? m.km : m.en}
                              </Link>
                              {idx < meta.recommendedMajors.length - 1 && (
                                <span className="text-slate-300">·</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#E6E8F0] px-5 py-3">
                    <span className="text-[11px] font-medium text-[#68708A]">
                      {language === "km" ? "ទីផ្សារកម្ពុជា" : "Cambodia Market"}
                    </span>
                    <Link
                      href={`/careers/${c.slug}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F7CE4D] px-3.5 text-[12px] font-extrabold text-[#111965] transition-colors hover:bg-[#E5BD3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30 focus-visible:ring-offset-2"
                    >
                      <span>{t("careersDirectory.viewProfile")}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center rounded-3xl bg-white border border-[#E6E8F0] p-8 space-y-4">
            <div className="relative w-24 h-24 mx-auto opacity-80">
              <Image
                src="/images/think.webp"
                alt="No careers found"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-bold text-[#111965]">
              {t("careersDirectory.notFound")}
            </h3>
            <p className="text-xs text-[#68708A] max-w-md mx-auto">
              {language === "km"
                ? "សូមជ្រើសរើស “គ្រប់វិស័យ” ឬសម្អាតពាក្យស្វែងរក ដើម្បីមើលអាជីពទាំងអស់នៅកម្ពុជា។"
                : "Try choosing \"All Industries\" or clearing your search term to see the complete list of career opportunities in Cambodia."}
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors"
            >
              {t("careersDirectory.resetFilters")}
            </button>
          </div>
        )}

        {/* Informative Holland RIASEC Guide Card with Interactive Filter Selection */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#111965] to-[#1E277A] text-white shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F7CE4D] text-xs font-bold">
                <Compass className="w-3.5 h-3.5" />
                <span>{language === "km" ? "ក្របខ័ណ្ឌវិជ្ជាជីវៈ Holland RIASEC" : "Holland RIASEC Vocational Framework"}</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                {language === "km" ? "តើភាពស៊ីសង្វាក់អាជីពដំណើរការយ៉ាងណានៅ OrienX" : "How Career Compatibility Works in OrienX"}
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {language === "km" ? "ចុចលើកូដខាងក្រោម ដើម្បីតម្រងអាជីពដែលត្រូវនឹងរបៀបធ្វើការនេះ:" : "Click any code below to filter careers matching that psychological work style:"}
              </p>
            </div>

            <Link
              href="/assessments/riasec/test"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-md shrink-0 self-start sm:self-auto"
            >
              <span>{language === "km" ? "ធ្វើតេស្ត RIASEC" : "Take RIASEC Test"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
            {Object.entries(RIASEC_MAP).map(([key, info]) => {
              const isSelected = selectedRiasec === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedRiasec(isSelected ? null : key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-[#F7CE4D] text-[#111965] border-[#F7CE4D] shadow-md font-bold"
                      : "bg-white/10 hover:bg-white/15 text-white border-white/10"
                  }`}
                >
                  <div className="text-sm font-extrabold">{key}</div>
                  <div className="text-xs font-bold mt-0.5">
                    {language === "km" ? info.titleKm.split(" ")[0] : info.titleEn}
                  </div>
                  <div className="text-[12.5px] opacity-80 line-clamp-2 mt-1">
                    {language === "km" ? info.descKm : info.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
