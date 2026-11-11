"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { FuteraMascot } from "@/components/brand/futera-mascot";
import { AssessmentStage, AssessmentStepItem } from "@/components/assessments/assessment-stage";
import { AssessmentViewSwitcher } from "@/components/assessments/assessment-view-switcher";
import {
  ArrowRight,
  Sparkles,
  RotateCcw,
  Compass,
  Crown,
  CheckCircle2,
  GraduationCap,
  Brain,
  Target,
  Zap,
  Building2,
  ChevronDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type DimensionGroup = "EI" | "SN" | "TF" | "JP";

const DIMENSION_TITLES: Record<
  DimensionGroup,
  {
    code: string;
    nameEn: string;
    nameKm: string;
    tipEn: string;
    tipKm: string;
  }
> = {
  EI: {
    code: "E vs I",
    nameEn: "Mind: Extraversion (E) vs Introversion (I)",
    nameKm: "ចិត្ត / ថាមពលសង្គម៖ Extraversion (E) vs Introversion (I)",
    tipEn: "Where do you naturally recharge your mental energy?",
    tipKm: "តើអ្នកបញ្ចូលថាមពលដោយវិធីណា ក្នុងក្រុម ឬដោយស្ងប់ស្ងាត់?",
  },
  SN: {
    code: "S vs N",
    nameEn: "Energy: Sensing (S) vs Intuition (N)",
    nameKm: "ការទទួលព័ត៌មាន៖ Sensing (S) vs Intuition (N)",
    tipEn: "Do you focus on practical facts or imaginative big ideas?",
    tipKm: "តើអ្នកផ្តោតលើការអនុវត្តជាក់ស្តែង ឬគំនិតច្នៃប្រឌិតអនាគត?",
  },
  TF: {
    code: "T vs F",
    nameEn: "Nature: Thinking (T) vs Feeling (F)",
    nameKm: "ការសម្រេចចិត្ត៖ Thinking (T) vs Feeling (F)",
    tipEn: "What guides your choices: objective logic or human empathy?",
    tipKm: "តើអ្វីដឹកនាំការសម្រេចចិត្ត៖ តក្កវិជ្ជាសុក្រឹត ឬអារម្មណ៍មនុស្ស?",
  },
  JP: {
    code: "J vs P",
    nameEn: "Tactics: Judging (J) vs Prospecting (P)",
    nameKm: "យុទ្ធសាស្ត្រជីវិត៖ Judging (J) vs Prospecting (P)",
    tipEn: "Do you prefer structured plans or flexible adaptability?",
    tipKm: "តើអ្នកចូលចិត្តផែនការរៀបរយ ឬសេរីភាពបត់បែនតាមស្ថានភាព?",
  },
};

export interface RoleMeta {
  id: "analysts" | "diplomats" | "sentinels" | "explorers";
  nameEn: string;
  nameKm: string;
  color: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  cardBorder: string;
  descriptionEn: string;
  descriptionKm: string;
  types: string[];
}

export const ROLES_META: RoleMeta[] = [
  {
    id: "analysts",
    nameEn: "Analysts",
    nameKm: "អ្នកវិភាគ",
    color: "#88619A",
    gradient: "from-[#88619A] via-[#754E86] to-[#452755]",
    badgeBg: "bg-[#88619A]/15 text-[#88619A] border-[#88619A]/30",
    badgeText: "text-[#88619A]",
    cardBorder: "border-[#88619A]/40 hover:border-[#88619A]",
    descriptionEn: "Intuitive (N) & Thinking (T) • Known for strategic rationality and relentless intellectual curiosity.",
    descriptionKm: "ប្រភេទ Intuitive (N) & Thinking (T) • ផ្តោតលើតក្កវិជ្ជា យុទ្ធសាស្ត្រច្បាស់ និងការស្រាវជ្រាវបញ្ញាឥតឈប់ឈរ។",
    types: ["INTJ", "INTP", "ENTJ", "ENTP"],
  },
  {
    id: "diplomats",
    nameEn: "Diplomats",
    nameKm: "អ្នកការទូត",
    color: "#33A474",
    gradient: "from-[#33A474] via-[#2A8F64] to-[#175A3E]",
    badgeBg: "bg-[#33A474]/15 text-[#33A474] border-[#33A474]/30",
    badgeText: "text-[#33A474]",
    cardBorder: "border-[#33A474]/40 hover:border-[#33A474]",
    descriptionEn: "Intuitive (N) & Feeling (F) • Known for deep empathy, inspiring idealism, and cooperative harmony.",
    descriptionKm: "ប្រភេទ Intuitive (N) & Feeling (F) • ផ្តោតលើការយល់ចិត្តស៊ីជម្រៅ ឧត្តមគតិបំផុស និងសាមគ្គីភាពក្នុងសង្គម។",
    types: ["INFJ", "INFP", "ENFJ", "ENFP"],
  },
  {
    id: "sentinels",
    nameEn: "Sentinels",
    nameKm: "អ្នកការពារ និងរក្សាប្រព័ន្ធ",
    color: "#4298B4",
    gradient: "from-[#4298B4] via-[#35839C] to-[#1E5769]",
    badgeBg: "bg-[#4298B4]/15 text-[#4298B4] border-[#4298B4]/30",
    badgeText: "text-[#4298B4]",
    cardBorder: "border-[#4298B4]/40 hover:border-[#4298B4]",
    descriptionEn: "Observant (S) & Judging (J) • Known for practicality, meticulous order, reliability, and civic stability.",
    descriptionKm: "ប្រភេទ Observant (S) & Judging (J) • ផ្តោតលើភាពជាក់ស្តែង របៀបរៀបរយ ទំនុកចិត្តខ្ពស់ និងស្ថិរភាព។",
    types: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  },
  {
    id: "explorers",
    nameEn: "Explorers",
    nameKm: "អ្នករុករក",
    color: "#E4A43C",
    gradient: "from-[#E4A43C] via-[#C98B29] to-[#8C5811]",
    badgeBg: "bg-[#E4A43C]/15 text-[#E4A43C] border-[#E4A43C]/30",
    badgeText: "text-[#E4A43C]",
    cardBorder: "border-[#E4A43C]/40 hover:border-[#E4A43C]",
    descriptionEn: "Observant (S) & Prospecting (P) • Known for spontaneity, versatile agility, and hands-on resourcefulness.",
    descriptionKm: "ប្រភេទ Observant (S) & Prospecting (P) • ផ្តោតលើភាពបត់បែន ភាពស្វាហាប់ និងការដោះស្រាយបញ្ហាជាក់ស្តែងផ្ទាល់ដៃ។",
    types: ["ISTP", "ISFP", "ESTP", "ESFP"],
  },
];

export interface ArchetypeMetaItem {
  role: "analysts" | "diplomats" | "sentinels" | "explorers";
  roleNameEn: string;
  roleNameKm: string;
  roleColor: string;
  gradient: string;
  nameKm: string;
  nameEn: string;
  taglineKm: string;
  taglineEn: string;
}

const ARCHETYPE_META: Record<string, ArchetypeMetaItem> = {
  // --- 1. ANALYSTS (_NT_) --- Signature Color: Purple (#88619A)
  INTJ: {
    role: "analysts",
    roleNameEn: "Analysts",
    roleNameKm: "អ្នកវិភាគ",
    roleColor: "#88619A",
    gradient: "from-[#88619A] via-[#754E86] to-[#452755]",
    nameKm: "The Architect • ស្ថាបត្យករយុទ្ធសាស្ត្រ",
    nameEn: "The Architect • Strategic Thinker",
    taglineKm: "អ្នកយុទ្ធសាស្ត្រស៊ីជម្រៅ ពោរពេញដោយការស្រមើស្រមៃ និងមានផែនការច្បាស់លាស់សម្រាប់គ្រប់រឿង។",
    taglineEn: "Imaginative and strategic thinkers, with a plan for everything.",
  },
  INTP: {
    role: "analysts",
    roleNameEn: "Analysts",
    roleNameKm: "អ្នកវិភាគ",
    roleColor: "#88619A",
    gradient: "from-[#88619A] via-[#754E86] to-[#452755]",
    nameKm: "The Logician • អ្នកតក្កវិជ្ជានវានុវត្តន៍",
    nameEn: "The Logician • Innovative Inventor",
    taglineKm: "អ្នកច្នៃប្រឌិតនវានុវត្តន៍ ស្រេកឃ្លានចំណេះដឹង និងចូលចិត្តវិភាគប្រព័ន្ធស្មុគស្មាញ។",
    taglineEn: "Innovative inventors with an unquenchable thirst for knowledge.",
  },
  ENTJ: {
    role: "analysts",
    roleNameEn: "Analysts",
    roleNameKm: "អ្នកវិភាគ",
    roleColor: "#88619A",
    gradient: "from-[#88619A] via-[#754E86] to-[#452755]",
    nameKm: "The Commander • អ្នកដឹកនាំចក្ខុវិស័យ",
    nameEn: "The Commander • Bold Visionary",
    taglineKm: "មានភាពជាអ្នកដឹកនាំក្លាហាន ចក្ខុវិស័យយុទ្ធសាស្ត្រច្បាស់ និងការសម្រេចចិត្តរហ័ស។",
    taglineEn: "Bold, imaginative, and strong-willed leaders, finding a way or making one.",
  },
  ENTP: {
    role: "analysts",
    roleNameEn: "Analysts",
    roleNameKm: "អ្នកវិភាគ",
    roleColor: "#88619A",
    gradient: "from-[#88619A] via-[#754E86] to-[#452755]",
    nameKm: "The Debater • អ្នកបង្កើតគំនិត និងដេញដោល",
    nameEn: "The Debater • Curious Thinker",
    taglineKm: "ឆ្លាតវៃ រហ័សរហួន ចូលចិត្តបញ្ហាប្រឈមបញ្ញា និងស្វែងរកគំនិតច្នៃប្រឌិតថ្មីៗ។",
    taglineEn: "Smart and curious thinkers who cannot resist an intellectual challenge.",
  },

  // --- 2. DIPLOMATS (_NF_) --- Signature Color: Green (#33A474)
  INFJ: {
    role: "diplomats",
    roleNameEn: "Diplomats",
    roleNameKm: "អ្នកការទូត",
    roleColor: "#33A474",
    gradient: "from-[#33A474] via-[#2A8F64] to-[#175A3E]",
    nameKm: "The Advocate • អ្នកតស៊ូមតិ និងទស្សនវិទូស្ងប់ស្ងាត់",
    nameEn: "The Advocate • Inspiring Idealist",
    taglineKm: "ស្ងប់ស្ងាត់តែមានឥទ្ធិពលបំផុសគំនិតខ្ពស់ ប្រកាន់ខ្ជាប់នូវគោលការណ៍គុណធម៌ និងឧត្តមគតិ។",
    taglineEn: "Quiet and mystical, yet very inspiring and tireless idealists.",
  },
  INFP: {
    role: "diplomats",
    roleNameEn: "Diplomats",
    roleNameKm: "អ្នកការទូត",
    roleColor: "#33A474",
    gradient: "from-[#33A474] via-[#2A8F64] to-[#175A3E]",
    nameKm: "The Mediator • អ្នកផ្សះផ្សា និងឧត្តមគតិនិយម",
    nameEn: "The Mediator • Poetic Altruist",
    taglineKm: "ចិត្តល្អ សុភាពរាបសា មានគំនិតច្នៃប្រឌិតសិល្បៈ និងតែងតែចង់ជួយសង្គមឱ្យកាន់តែប្រសើរ។",
    taglineEn: "Poetic, kind and altruistic people, always eager to help a good cause.",
  },
  ENFJ: {
    role: "diplomats",
    roleNameEn: "Diplomats",
    roleNameKm: "អ្នកការទូត",
    roleColor: "#33A474",
    gradient: "from-[#33A474] via-[#2A8F64] to-[#175A3E]",
    nameKm: "The Protagonist • អ្នកដឹកនាំលើកទឹកចិត្ត",
    nameEn: "The Protagonist • Charismatic Leader",
    taglineKm: "មានមន្តស្នេហ៍ក្នុងការប្រាស្រ័យទាក់ទង ពូកែលើកទឹកចិត្ត និងជំរុញឱ្យអ្នកដទៃអភិវឌ្ឍសមត្ថភាព។",
    taglineEn: "Charismatic and inspiring leaders, able to mesmerize their listeners.",
  },
  ENFP: {
    role: "diplomats",
    roleNameEn: "Diplomats",
    roleNameKm: "អ្នកការទូត",
    roleColor: "#33A474",
    gradient: "from-[#33A474] via-[#2A8F64] to-[#175A3E]",
    nameKm: "The Campaigner • អ្នកចលនានវានុវត្តន៍ និងសេរីភាព",
    nameEn: "The Campaigner • Creative Free Spirit",
    taglineKm: "ស្វាហាប់ ច្នៃប្រឌិតខ្ពស់ មានភាពស្និទ្ធស្នាល និងតែងតែនាំមកនូវស្នាមញញឹមដល់មនុស្សជុំវិញ។",
    taglineEn: "Enthusiastic, creative and sociable free spirits, who can always find a reason to smile.",
  },

  // --- 3. SENTINELS (_S_J) --- Signature Color: Blue (#4298B4)
  ISTJ: {
    role: "sentinels",
    roleNameEn: "Sentinels",
    roleNameKm: "អ្នកការពារ និងរក្សាប្រព័ន្ធ",
    roleColor: "#4298B4",
    gradient: "from-[#4298B4] via-[#35839C] to-[#1E5769]",
    nameKm: "The Logistician • អ្នកអនុវត្តប្រព័ន្ធ និងវិន័យ",
    nameEn: "The Logistician • Responsible Realist",
    taglineKm: "ផ្តោតលើភាពជាក់លាក់ ការទទួលខុសត្រូវខ្ពស់ និងការប្រកាន់ខ្ជាប់នូវគោលការណ៍ត្រឹមត្រូវ។",
    taglineEn: "Practical and fact-minded individuals, whose reliability cannot be doubted.",
  },
  ISFJ: {
    role: "sentinels",
    roleNameEn: "Sentinels",
    roleNameKm: "អ្នកការពារ និងរក្សាប្រព័ន្ធ",
    roleColor: "#4298B4",
    gradient: "from-[#4298B4] via-[#35839C] to-[#1E5769]",
    nameKm: "The Defender • អ្នកការពារ និងគាំទ្រយ៉ាងស្មោះស្ម័គ្រ",
    nameEn: "The Defender • Dedicated Protector",
    taglineKm: "មានចិត្តកក់ក្តៅ លះបង់ខ្ពស់ យកចិត្តទុកដាក់ និងតែងតែត្រៀមខ្លួនការពារជួយអ្នកដទៃ។",
    taglineEn: "Very dedicated and warm protectors, always ready to defend their loved ones.",
  },
  ESTJ: {
    role: "sentinels",
    roleNameEn: "Sentinels",
    roleNameKm: "អ្នកការពារ និងរក្សាប្រព័ន្ធ",
    roleColor: "#4298B4",
    gradient: "from-[#4298B4] via-[#35839C] to-[#1E5769]",
    nameKm: "The Executive • អ្នករៀបចំ និងដឹកនាំយុទ្ធសាស្ត្រ",
    nameEn: "The Executive • Dedicated Organizer",
    taglineKm: "អ្នកពូកែរៀបចំរចនាសម្ព័ន្ធ មានភាពជាអ្នកដឹកនាំជាក់ស្តែង និងការសម្រេចចិត្តប្រកបដោយការទទួលខុសត្រូវខ្ពស់។",
    taglineEn: "Excellent administrators, unsurpassed at managing things or people.",
  },
  ESFJ: {
    role: "sentinels",
    roleNameEn: "Sentinels",
    roleNameKm: "អ្នកការពារ និងរក្សាប្រព័ន្ធ",
    roleColor: "#4298B4",
    gradient: "from-[#4298B4] via-[#35839C] to-[#1E5769]",
    nameKm: "The Consul • អ្នកសម្របសម្រួល និងយកចិត្តទុកដាក់ខ្ពស់",
    nameEn: "The Consul • Caring Provider",
    taglineKm: "រួសរាយរាក់ទាក់ ចិត្តល្អ ពូកែបង្កើតទំនាក់ទំនង និងតែងតែចង់ជួយសម្របសម្រួលអ្នកដទៃ។",
    taglineEn: "Extraordinarily caring, social and popular people, always eager to help.",
  },

  // --- 4. EXPLORERS (_S_P) --- Signature Color: Amber (#E4A43C)
  ISTP: {
    role: "explorers",
    roleNameEn: "Explorers",
    roleNameKm: "អ្នករុករក",
    roleColor: "#E4A43C",
    gradient: "from-[#E4A43C] via-[#C98B29] to-[#8C5811]",
    nameKm: "The Virtuoso • អ្នកអនុវត្តបច្ចេកទេស និងពិសោធន៍ជាក់ស្តែង",
    nameEn: "The Virtuoso • Practical Experimenter",
    taglineKm: "ក្លាហាន ពូកែដោះស្រាយបញ្ហាបច្ចេកទេសជាក់ស្តែង និងជាអ្នកជំនាញឧបករណ៍ និងយន្តការ។",
    taglineEn: "Bold and practical experimenters, masters of all kinds of tools.",
  },
  ISFP: {
    role: "explorers",
    roleNameEn: "Explorers",
    roleNameKm: "អ្នករុករក",
    roleColor: "#E4A43C",
    gradient: "from-[#E4A43C] via-[#C98B29] to-[#8C5811]",
    nameKm: "The Adventurer • អ្នកសិល្បៈច្នៃប្រឌិត",
    nameEn: "The Adventurer • Artistic Explorer",
    taglineKm: "មានភាពបត់បែនខ្ពស់ ស្រឡាញ់សិល្បៈ និងតែងតែត្រៀមខ្លួនស្វែងរកបទពិសោធន៍ថ្មីៗជានិច្ច។",
    taglineEn: "Flexible and charming artists, always ready to explore and experience something new.",
  },
  ESTP: {
    role: "explorers",
    roleNameEn: "Explorers",
    roleNameKm: "អ្នករុករក",
    roleColor: "#E4A43C",
    gradient: "from-[#E4A43C] via-[#C98B29] to-[#8C5811]",
    nameKm: "The Entrepreneur • សហគ្រិនស្វាហាប់ និងរហ័សរហួន",
    nameEn: "The Entrepreneur • Energetic Dynamo",
    taglineKm: "ឆ្លាតវៃ ស្វាហាប់ សង្កេតបានរហ័ស និងរីករាយក្នុងការប្រថុយប្រជែងដោះស្រាយបញ្ហាភ្លាមៗ។",
    taglineEn: "Smart, energetic and very perceptive people, who truly enjoy living on the edge.",
  },
  ESFP: {
    role: "explorers",
    roleNameEn: "Explorers",
    roleNameKm: "អ្នករុករក",
    roleColor: "#E4A43C",
    gradient: "from-[#E4A43C] via-[#C98B29] to-[#8C5811]",
    nameKm: "The Entertainer • អ្នកកម្សាន្ត និងបង្កើតភាពរស់រវើក",
    nameEn: "The Entertainer • Spontaneous Performer",
    taglineKm: "ស្វាហាប់ រស់រវើក ពោរពេញដោយភាពរីករាយ និងតែងតែធ្វើឱ្យបរិយាកាសជុំវិញមានភាពកក់ក្តៅ។",
    taglineEn: "Spontaneous, energetic and enthusiastic people – life is never boring around them.",
  },
};

export default function PersonalityAssessmentPage() {
  const { t, getLocalized } = useLanguage();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"form" | "results" | "guide">("form");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { scaleLevel: number; selectedOptionId: string }>
  >({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const DRAFT_STORAGE_KEY = "futera_personality_draft_v1";

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers && Object.keys(parsed.answers).length > 0) {
          setAnswers(parsed.answers);
          if (typeof parsed.currentIndex === "number") {
            setCurrentIndex(parsed.currentIndex);
          }
          setActiveTab("form");
        }
      }
    } catch (e) {
      console.error("Failed to load Personality draft", e);
    }
  }, []);

  // Auto-save draft whenever answers or currentIndex change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ answers, currentIndex, updatedAt: Date.now() })
        );
      } catch (e) {
        console.error("Failed to save Personality draft", e);
      }
    }
  }, [answers, currentIndex]);

  // 1. Fetch questions
  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ["personality-questions"],
    queryFn: async () => apiFetch<any[]>("/assessments/personality/questions"),
  });

  // 2. Fetch latest result if exists
  const { data: latestResult, isLoading: loadingLatest } = useQuery({
    queryKey: ["latest-personality"],
    queryFn: async () => apiFetch<any>("/assessments/personality/latest"),
  });

  // 3. Fetch recommended majors and universities for results view
  const { data: recommendations, isLoading: loadingRecs } = useQuery({
    queryKey: ["recommended-majors"],
    queryFn: async () => apiFetch<any[]>("/recommendations/majors"),
    enabled: activeTab === "results",
  });

  // Sort recommendations by personality fit score for the Personality Results view
  const personalityRecs = React.useMemo(() => {
    if (!recommendations) return [];
    return [...recommendations].sort((a, b) => {
      const pDiff = (b.personality_match_score || 0) - (a.personality_match_score || 0);
      if (Math.abs(pDiff) > 0.5) return pDiff;
      return (b.match_score || 0) - (a.match_score || 0);
    });
  }, [recommendations]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(DRAFT_STORAGE_KEY) : null;
    let hasDraft = false;
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        hasDraft = parsed.answers && Object.keys(parsed.answers).length > 0;
      }
    } catch {}

    if (latestResult && Object.keys(answers).length === 0 && !hasDraft) {
      setActiveTab("results");
    }
  }, [latestResult]);

  // 4. Submit mutation
  const { mutate: submitAssessment, isPending: submitting } = useMutation({
    mutationFn: async (payload: Array<{ question_id: string; selected_option_id: string }>) => {
      return apiFetch("/assessments/personality/submit", {
        method: "POST",
        body: JSON.stringify({ answers: payload }),
      });
    },
    onSuccess: () => {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["latest-personality"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-majors"] });
      setActiveTab("results");
    },
  });

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setAnswers({});
    setCurrentIndex(0);
  };

  const handleScaleChange = (question: any, scaleLevel: number) => {
    const optA = question.options[0];
    const optB = question.options[1];
    // 5-point scale (Official 16Personalities direction: Left = Agree -> Right = Disagree)
    // Level 1 (Strongly Agree), Level 2 (Agree), Level 3 (Neutral) -> Option A (Agree trait)
    // Level 4 (Disagree), Level 5 (Strongly Disagree) -> Option B (Disagree trait)
    const chosenOptionId = scaleLevel >= 4 ? optB?.id : optA?.id;

    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        scaleLevel,
        selectedOptionId: chosenOptionId,
      },
    }));

    if (timerRef.current) clearTimeout(timerRef.current);
    if (questions && currentIndex < questions.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 550);
    }
  };

  const handleSubmit = () => {
    if (!questions) return;
    const formatted = Object.entries(answers).map(([qid, val]) => ({
      question_id: qid,
      selected_option_id: val.selectedOptionId,
    }));

    if (formatted.length < questions.length) {
      alert(t("personalityAssessment.answerAllAlert") || "Please answer all questions before submitting.");
      return;
    }
    submitAssessment(formatted);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setActiveTab("form");
  };

  const handleQuickPrefill = () => {
    if (!questions) return;
    const prefill: Record<string, { scaleLevel: number; selectedOptionId: string }> = {};
    questions.forEach((q, idx) => {
      const level = idx % 2 === 0 ? 1 : 5;
      const optId = level >= 4 ? q.options[1]?.id : q.options[0]?.id;
      prefill[q.id] = { scaleLevel: level, selectedOptionId: optId };
    });
    setAnswers(prefill);
  };

  if (loadingQuestions || loadingLatest) {
    return (
      <div className="py-24 text-center text-sm text-[#68708A] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-[#111965] border-t-transparent animate-spin" />
        <span className="font-semibold">Loading assessment questions...</span>
      </div>
    );
  }

  // ========================================================
  // RESULTS VIEW (16Personalities Gold Standard Experience)
  // ========================================================
  if (activeTab === "results" && latestResult) {
    const pType = latestResult.personality_type || "INTJ";
    const arch = ARCHETYPE_META[pType] || ARCHETYPE_META["INTJ"];

    const traitsKm = latestResult.traits_summary_km || {};
    const strengths = traitsKm.strengths || ["ការគិតបែបយុទ្ធសាស្ត្រ", "ការវិភាគស៊ីជម្រៅ", "ភាពស្មោះត្រង់នឹងគោលការណ៍"];
    const learningStyle = traitsKm.learning_style || "ការរៀនតាមរយៈទ្រឹស្តីស៊ីជម្រៅ និងការអនុវត្តគម្រោងជាក់ស្តែង";
    const bestFields = traitsKm.best_fields || ["វិស្វកម្មសូហ្វវែរ & STEM", "ស្ថាបត្យកម្មប្រព័ន្ធ", "ទិន្នន័យ និងបញ្ញាសិប្បនិម្មិត"];

    // Dominant polarities
    const isE = latestResult.extraversion_score >= 50;
    const isN = latestResult.intuition_score >= 50;
    const isT = latestResult.thinking_score >= 50;
    const isJ = latestResult.judging_score >= 50;

    return (
      <div className="max-w-4xl mx-auto space-y-7 animate-in fade-in pb-16 select-none">
        {/* Top Breadcrumb & Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#68708A] mb-1">
              <Link href="/dashboard" className="hover:text-[#111965]">
                {t("personalityAssessment.dashboard")}
              </Link>
              <span>/</span>
              <span className="text-[#111965]">
                {t("personalityAssessment.breadcrumb")}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#111965] tracking-tight">
              {t("personalityAssessment.title")}
            </h1>
          </div>

          {/* View Switcher */}
          <AssessmentViewSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
            questionsLabel={t("personalityAssessment.questionsTab") || "ធ្វើតេស្ត"}
            profileLabel={`${pType} Profile`}
            profileIcon={Crown}
            guideLabel={t("personalityAssessment.guideTab") || "មគ្គុទ្ទេសក៍ទាំង ១៦"}
            hasResult={!!latestResult}
          />
        </div>

        {/* 1. HERO BANNER — PLATFORM COLORS (Futera Deep Navy & Gold) */}
        <div className="p-6 sm:p-9 rounded-3xl bg-gradient-to-r from-[#111965] via-[#1A2580] to-[#0D134E] text-white shadow-xl relative overflow-hidden border border-[#111965]/40">
          {/* Ambient Platform Brand Glows */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#F7CE4D]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3.5 max-w-xl">
              {/* Role Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-white/10 backdrop-blur-md text-[#F7CE4D] border border-white/20 uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D]" />
                <span>
                  {arch.roleNameEn.toUpperCase()} • {arch.roleNameKm}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-4xl sm:text-6xl font-black text-[#F7CE4D] tracking-tight drop-shadow-md">
                  {pType}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                  {getLocalized({ km: arch.nameKm, en: arch.nameEn })}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-lg font-medium">
                {getLocalized({ km: arch.taglineKm, en: arch.taglineEn })}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20 backdrop-blur-sm shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#F7CE4D]" />
                  <span>{t("personalityAssessment.retake") || "ធ្វើតេស្តឡើងវិញ"}</span>
                </button>
              </div>
            </div>

            {/* MBTI Official Character Avatar + Celebrating Mascot Tara */}
            <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 self-center sm:self-auto relative pt-4 sm:pt-0">
              <div className="relative flex items-center justify-center">
                {/* Soft ambient golden backlight behind character */}
                <div className="absolute inset-0 bg-[#F7CE4D]/25 rounded-full blur-2xl transform scale-125 pointer-events-none" />
                <Image
                  src={`/images/personality-types/${pType.toLowerCase()}.svg`}
                  alt={`${pType} Character`}
                  width={150}
                  height={190}
                  className="relative z-10 w-28 h-36 sm:w-36 sm:h-46 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] transition-transform hover:scale-105"
                  priority
                />
              </div>
              <FuteraMascot
                variant="full-jumping"
                emotion="congratulation"
                showSpeech={true}
                size={155}
                speechText={getLocalized({
                  km: `អបអរសាទរ! អ្នកជាប្រភេទ ${pType}! 🏆`,
                  en: `Congratulations! You are ${pType}! 🏆`,
                })}
              />
            </div>
          </div>
        </div>

        {/* 2. KEY INSIGHTS BENTO CONTAINER (Strengths, Learning Style, Best Fields) */}
        <div className="rounded-3xl bg-white border border-[#E6E8F0] shadow-xs p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#E6E8F0]">
          {/* Key Strengths */}
          <div className="space-y-2.5 md:pr-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Target className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wide">
                ចំណុចខ្លាំងចម្បង (Strengths)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {strengths.map((s: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50/80 text-emerald-800 border border-emerald-100"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{s}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Learning Style */}
          <div className="space-y-2.5 pt-5 md:pt-0 md:px-4">
            <div className="flex items-center gap-2 text-blue-700">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <GraduationCap className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wide">
                រចនាប័ទ្មសិក្សា (Learning Style)
              </span>
            </div>
            <p className="text-xs text-[#171A2C] leading-relaxed font-medium pt-1">
              {learningStyle}
            </p>
          </div>

          {/* Ideal Academic Fields */}
          <div className="space-y-2.5 pt-5 md:pt-0 md:pl-4">
            <div className="flex items-center gap-2 text-purple-700">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Brain className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wide">
                វិស័យសិក្សាសាកសម (Best Fields)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {bestFields.map((f: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50/80 text-purple-800 border border-purple-100"
                >
                  <Zap className="w-3 h-3 text-purple-600 shrink-0" />
                  <span>{f}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. THE 4 PREFERENCE DIMENSIONS (Clean 2x2 Grid) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E8F0] pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-black text-[#111965]">
                {t("personalityAssessment.dimensionBreakdown") || "ពិន្ទុវិមាត្រទាំង ៤ (The 4 Preference Dimensions)"}
              </h3>
              <p className="text-xs text-[#68708A]">
                កម្រិតទំនោរចិត្តរវាងប៉ូលផ្ទុយគ្នានីមួយៗនៃការទទួលព័ត៌មាន ការសម្រេចចិត្ត និងការប្រាស្រ័យទាក់ទង
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#68708A] bg-[#F0F2FA] px-2.5 py-1 rounded-lg self-start sm:self-auto">
              NERIS Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dimension 1: MIND (E vs I) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFD] border border-[#E6E8F0] hover:border-sky-300 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#111965]">
                      ចិត្ត & ថាមពល (Mind)
                    </h4>
                    <p className="text-[11px] text-[#68708A]">Extraverted vs Introverted</p>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-black text-white shrink-0"
                    style={{ backgroundColor: isE ? "#0284C7" : "#88619A" }}
                  >
                    {isE ? "Extraverted (E)" : "Introverted (I)"} • {Math.max(latestResult.extraversion_score, latestResult.introversion_score)}%
                  </span>
                </div>

                {/* Spectrum Rail */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className={isE ? "text-[#0284C7]" : "text-slate-400"}>
                      Extraverted (E) • {latestResult.extraversion_score}%
                    </span>
                    <span className={!isE ? "text-[#88619A]" : "text-slate-400"}>
                      Introverted (I) • {latestResult.introversion_score}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 flex overflow-hidden p-0.5 relative">
                    <div
                      style={{ width: `${latestResult.extraversion_score}%` }}
                      className="bg-gradient-to-r from-sky-400 to-[#0284C7] rounded-l-full h-full transition-all duration-500"
                    />
                    <div
                      style={{ width: `${latestResult.introversion_score}%` }}
                      className="bg-gradient-to-r from-[#A855F7] to-[#88619A] rounded-r-full h-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#4A5568] leading-relaxed pt-2 border-t border-slate-200/60">
                {isE
                  ? "អ្នកទទួលបានថាមពលពីការធ្វើការងារជាក្រុម ការពិភាក្សាផ្លាស់ប្តូរគំនិត និងបរិស្ថានសង្គមរស់រវើក។"
                  : "អ្នកបញ្ចូលថាមពលនៅកន្លែងស្ងប់ស្ងាត់ និងការផ្តោតអារម្មណ៍ស៊ីជម្រៅតែម្នាក់ឯង។"}
              </p>
            </div>

            {/* Dimension 2: ENERGY (S vs N) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFD] border border-[#E6E8F0] hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#111965]">
                      ការទទួលព័ត៌មាន (Energy)
                    </h4>
                    <p className="text-[11px] text-[#68708A]">Observant vs Intuitive</p>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-black text-white shrink-0"
                    style={{ backgroundColor: !isN ? "#0284C7" : "#059669" }}
                  >
                    {!isN ? "Observant (S)" : "Intuitive (N)"} • {Math.max(latestResult.sensing_score, latestResult.intuition_score)}%
                  </span>
                </div>

                {/* Spectrum Rail */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className={!isN ? "text-[#0284C7]" : "text-slate-400"}>
                      Observant (S) • {latestResult.sensing_score}%
                    </span>
                    <span className={isN ? "text-[#059669]" : "text-slate-400"}>
                      Intuitive (N) • {latestResult.intuition_score}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 flex overflow-hidden p-0.5 relative">
                    <div
                      style={{ width: `${latestResult.sensing_score}%` }}
                      className="bg-gradient-to-r from-sky-400 to-[#0284C7] rounded-l-full h-full transition-all duration-500"
                    />
                    <div
                      style={{ width: `${latestResult.intuition_score}%` }}
                      className="bg-gradient-to-r from-emerald-400 to-[#059669] rounded-r-full h-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#4A5568] leading-relaxed pt-2 border-t border-slate-200/60">
                {isN
                  ? "អ្នកចាប់អារម្មណ៍លើគំនិតច្នៃប្រឌិតថ្មីៗ ចក្ខុវិស័យអនាគត ទ្រឹស្តីទូលំទូលាយ និងការស្រាវជ្រាវគំនិតប្លែកៗ។"
                  : "អ្នកផ្តោតលើទិន្នន័យជាក់ស្តែង ការអនុវត្តជាក់លាក់ និងបទពិសោធន៍ផ្ទាល់ដៃដែលផ្តល់លទ្ធផលប្រាកដ។"}
              </p>
            </div>

            {/* Dimension 3: NATURE (T vs F) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFD] border border-[#E6E8F0] hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#111965]">
                      ការសម្រេចចិត្ត (Nature)
                    </h4>
                    <p className="text-[11px] text-[#68708A]">Thinking vs Feeling</p>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-black text-white shrink-0"
                    style={{ backgroundColor: isT ? "#4F46E5" : "#F43F5E" }}
                  >
                    {isT ? "Thinking (T)" : "Feeling (F)"} • {Math.max(latestResult.thinking_score, latestResult.feeling_score)}%
                  </span>
                </div>

                {/* Spectrum Rail */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className={isT ? "text-[#4F46E5]" : "text-slate-400"}>
                      Thinking (T) • {latestResult.thinking_score}%
                    </span>
                    <span className={!isT ? "text-[#F43F5E]" : "text-slate-400"}>
                      Feeling (F) • {latestResult.feeling_score}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 flex overflow-hidden p-0.5 relative">
                    <div
                      style={{ width: `${latestResult.thinking_score}%` }}
                      className="bg-gradient-to-r from-indigo-400 to-[#4F46E5] rounded-l-full h-full transition-all duration-500"
                    />
                    <div
                      style={{ width: `${latestResult.feeling_score}%` }}
                      className="bg-gradient-to-r from-rose-400 to-[#F43F5E] rounded-r-full h-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#4A5568] leading-relaxed pt-2 border-t border-slate-200/60">
                {isT
                  ? "អ្នកធ្វើការសម្រេចចិត្តដោយផ្អែកលើតក្កវិជ្ជាសុក្រឹត ការវិភាគមិនលំអៀង និងគោលការណ៍យុត្តិធម៌។"
                  : "អ្នកផ្តល់អាទិភាពលើតម្លៃមនុស្ស ភាពសុខដុមរមនា និងផលប៉ះពាល់ដល់អារម្មណ៍អ្នកដទៃ។"}
              </p>
            </div>

            {/* Dimension 4: TACTICS (J vs P) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFD] border border-[#E6E8F0] hover:border-teal-300 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#111965]">
                      យុទ្ធសាស្ត្រជីវិត (Tactics)
                    </h4>
                    <p className="text-[11px] text-[#68708A]">Judging vs Prospecting</p>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-black text-white shrink-0"
                    style={{ backgroundColor: isJ ? "#0D9488" : "#E4A43C" }}
                  >
                    {isJ ? "Judging (J)" : "Prospecting (P)"} • {Math.max(latestResult.judging_score, latestResult.perceiving_score)}%
                  </span>
                </div>

                {/* Spectrum Rail */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className={isJ ? "text-[#0D9488]" : "text-slate-400"}>
                      Judging (J) • {latestResult.judging_score}%
                    </span>
                    <span className={!isJ ? "text-[#E4A43C]" : "text-slate-400"}>
                      Prospecting (P) • {latestResult.perceiving_score}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 flex overflow-hidden p-0.5 relative">
                    <div
                      style={{ width: `${latestResult.judging_score}%` }}
                      className="bg-gradient-to-r from-teal-400 to-[#0D9488] rounded-l-full h-full transition-all duration-500"
                    />
                    <div
                      style={{ width: `${latestResult.perceiving_score}%` }}
                      className="bg-gradient-to-r from-amber-400 to-[#E4A43C] rounded-r-full h-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#4A5568] leading-relaxed pt-2 border-t border-slate-200/60">
                {isJ
                  ? "អ្នកចូលចិត្តផែនការច្បាស់លាស់ កាលវិភាគរៀបរយ និងការសម្រេចកិច្ចការទាន់ពេលវេលា។"
                  : "អ្នកចូលចិត្តភាពបត់បែន រក្សាជម្រើសបើកទូលាយ និងអាចសម្របតាមស្ថានភាពផ្លាស់ប្តូរភ្លាមៗ។"}
              </p>
            </div>
          </div>
        </div>

        {/* 4. RECOMMENDED MAJORS & UNIVERSITIES FOR THIS MBTI */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E8F0] pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{t("personalityAssessment.mbtiMatchesBadge", "អនុសាសន៍ AI ផ្អែកលើបុគ្គលិកលក្ខណៈ")}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#111965]">
                {t("personalityAssessment.recommendedMajorsTitle", `មុខជំនាញ និងសាកលវិទ្យាល័យដែលសាកសមនឹង ${pType}`)}
              </h3>
              <p className="text-xs text-[#68708A]">
                {t("personalityAssessment.recommendedMajorsSubtitle", `ជំនាញ និងគ្រឹះស្ថានឧត្តមសិក្សាដែលត្រូវគ្នានឹងទម្រង់ការគិត និងការសម្រេចចិត្តបែប ${pType} របស់អ្នក`)}
              </p>
            </div>

            <Link
              href="/dashboard/recommendations"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs self-start sm:self-auto cursor-pointer whitespace-nowrap"
            >
              <span>{t("personalityAssessment.viewAllRecommendations", "មើលអនុសាសន៍ទាំងអស់")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-[#E6E8F0] space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : personalityRecs && personalityRecs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personalityRecs.slice(0, 3).map((rec: any, idx: number) => {
                const major = rec.major || {};
                const exp = rec.explanation || {};
                const unis = major.offering_universities || [];
                const fitScore = Math.round(rec.personality_match_score || rec.match_score || 0);

                return (
                  <div
                    key={rec.id || `rec-${idx}`}
                    className="p-4 sm:p-5 rounded-2xl border border-[#E6E8F0] bg-gradient-to-b from-white to-[#FAFBFD] hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3.5"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg text-xs font-black bg-[#111965] text-[#F7CE4D] flex items-center justify-center shadow-2xs">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-[#68708A] tracking-wide">
                            {major.category}
                          </span>
                          {major.is_stem && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-sky-50 text-sky-700 border border-sky-200">
                              STEM
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                            {fitScore}% Fit
                          </span>
                        </div>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-[#111965] leading-snug">
                        {getLocalized(major.name)}
                      </h4>

                      {/* Rationale snippet */}
                      <p className="text-[11px] text-[#4A5568] line-clamp-2 leading-relaxed bg-[#F8FAFD] p-2.5 rounded-xl border border-[#E6E8F0]/70 min-h-[46px] flex items-center">
                        {getLocalized({ km: exp.personality_reason_km, en: exp.personality_reason_en }) ||
                          getLocalized({ km: exp.fit_summary_km, en: exp.fit_summary_en }) ||
                          getLocalized({
                            km: `ទម្រង់បុគ្គលិកលក្ខណៈ ${pType} របស់អ្នកស័ក្តិសមយ៉ាងល្អជាមួយនឹងជំនាញ ${getLocalized(major.name)}។`,
                            en: `Your ${pType} cognitive orientation aligns exceptionally well with ${getLocalized(major.name)}.`,
                          })}
                      </p>
                    </div>

                    {/* Offering Universities */}
                    <div className="pt-2 border-t border-[#E6E8F0] space-y-2">
                      <div className="text-[11px] font-bold text-[#68708A] flex items-center justify-between gap-2">
                        <span>{t("personalityAssessment.offeringInstitutions", "គ្រឹះស្ថានបណ្តុះបណ្តាល:")}</span>
                        {unis.length > 0 ? (
                          <span className="font-semibold text-slate-500">
                            {unis.length} {t("recommendationsPage.institutions", "កន្លែង")}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/70 font-medium">
                            {t("personalityAssessment.verifyingInstitutions", "កំពុងផ្ទៀងផ្ទាត់")}
                          </span>
                        )}
                      </div>

                      {unis.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
                          {unis.slice(0, 3).map((u: any) => (
                            <Link
                              key={u.university_id}
                              href={`/universities/${u.university_slug}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#F0F2FA] text-[#111965] hover:bg-[#111965] hover:text-white transition-colors"
                              title={getLocalized(u.university_name)}
                            >
                              <Building2 className="w-2.5 h-2.5 opacity-60" />
                              <span>{getLocalized(u.university_acronym) || u.university_slug.toUpperCase()}</span>
                              {u.tuition_annual_usd ? (
                                <span className="text-[9px] opacity-75 font-normal">
                                  (${Math.round(u.tuition_annual_usd)})
                                </span>
                              ) : null}
                            </Link>
                          ))}
                          {unis.length > 3 && (
                            <span className="text-[10px] font-semibold text-[#68708A]">
                              +{unis.length - 3} {t("recommendationsPage.more", "ទៀត")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#68708A] bg-[#FAFBFD] px-2.5 py-1.5 rounded-lg border border-dashed border-[#E6E8F0] flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-[#68708A]/70 flex-shrink-0" />
                          <span className="truncate">{t("personalityAssessment.verifyingCampusesDesc", "ទិន្នន័យគ្រឹះស្ថានកំពុងត្រូវបានប្រមូល និងផ្ទៀងផ្ទាត់")}</span>
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#E6E8F0]/50">
                        <Link
                          href={`/majors/${major.slug}`}
                          className="text-xs font-bold text-[#68708A] hover:text-[#111965] transition-colors"
                        >
                          {t("recommendationsPage.details", "ព័ត៌មានលម្អិត")}
                        </Link>

                        <Link
                          href={`/universities?major=${major.slug}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs"
                        >
                          <span>{t("recommendationsPage.universities", "សាកលវិទ្យាល័យ")}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-[#68708A]">
              មិនទាន់មានអនុសាសន៍នៅឡើយទេ
            </div>
          )}
        </div>

        {/* 5. EXPLORE 16 PERSONALITIES QUICK-BANNER (Replaces heavy doc on personal result page) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#111965] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-5 h-5 text-[#F7CE4D]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-[#111965]">
                {t("personalityAssessment.exploreGuideTitle", "ចង់ស្វែងយល់ពីបុគ្គលិកលក្ខណៈទាំង ១៦ ផ្សេងទៀត?")}
              </h4>
              <p className="text-xs text-[#68708A]">
                {t("personalityAssessment.exploreGuideDesc", "ប្រៀបធៀបប្រភេទបុគ្គលិកលក្ខណៈទាំង ១៦ នៅក្នុងមគ្គុទ្ទេសក៍ពេញលេញ")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#111965] hover:bg-[#1A2580] text-white shadow-2xs transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <span>{t("personalityAssessment.openGuideBtn", "បើកមគ្គុទ្ទេសក៍ទាំង ១៦")}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F7CE4D]" />
          </button>
        </div>

        {/* 6. NEXT STEP CTA CARD */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#F0F2FA] to-[#E8EBF8] border border-[#111965]/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-extrabold text-[#111965]">
              {t("personalityAssessment.nextStepTitle", "ជំហានបន្ទាប់៖ ធ្វើតេស្តចំណាប់អារម្មណ៍អាជីព RIASEC")}
            </h4>
            <p className="text-xs text-[#68708A]">
              {t("personalityAssessment.nextStepDesc", `អនុសាសន៍ដំបូងផ្អែកលើបុគ្គលិកលក្ខណៈ ${pType} របស់អ្នកបានគណនារួចរាល់! ធ្វើតេស្ត RIASEC ដើម្បីបង្កើនភាពសុក្រឹតបន្ថែមទៀត។`)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/dashboard/recommendations"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs text-[#111965] bg-white border border-[#E6E8F0] hover:bg-[#F0F2FA] shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{t("personalityAssessment.viewAllRecommendations", "មើលអនុសាសន៍")}</span>
            </Link>
            <Link
              href="/dashboard/assessments/riasec"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-black text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{t("personalityAssessment.takeRiasecTest", "ធ្វើតេស្ត RIASEC")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW MODE: DEDICATED 16 PERSONALITIES FRAMEWORK GUIDE
  // ========================================================
  if (activeTab === "guide") {
    return (
      <div className="max-w-5xl mx-auto space-y-7 animate-in fade-in pb-16 select-none">
        {/* Top Breadcrumb & Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#68708A] mb-1">
              <Link href="/dashboard" className="hover:text-[#111965]">
                {t("personalityAssessment.dashboard")}
              </Link>
              <span>/</span>
              <span className="text-[#111965]">
                {t("personalityAssessment.guideTab", "មគ្គុទ្ទេសក៍ទាំង ១៦")}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#111965] tracking-tight">
              {getLocalized({
                km: "មគ្គុទ្ទេសក៍បុគ្គលិកលក្ខណៈទាំង ១៦ (The 16 Personalities)",
                en: "The 16 Personalities Framework & Archetypes",
              })}
            </h1>
          </div>

          {/* View Switcher */}
          <AssessmentViewSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
            questionsLabel={t("personalityAssessment.questionsTab") || "ធ្វើតេស្ត"}
            profileLabel={`${latestResult?.personality_type || "INTJ"} Profile`}
            profileIcon={Crown}
            guideLabel={t("personalityAssessment.guideTab") || "មគ្គុទ្ទេសក៍ទាំង ១៦"}
            hasResult={!!latestResult}
          />
        </div>

        {/* Guide Content Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111965] via-[#1A2580] to-[#0D134E] text-white shadow-xl relative overflow-hidden border border-[#111965]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/10 backdrop-blur-md text-[#F7CE4D] border border-white/20 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-[#F7CE4D]" />
              <span>NERIS Standard Archetypes</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {getLocalized({
                km: "ស្វែងយល់ពីបុគ្គលិកលក្ខណៈទាំង ១៦ និងតួនាទីទាំង ៤",
                en: "Explore All 16 Personalities Across 4 Role Groups",
              })}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {getLocalized({
                km: "បែងចែកជា ៤ ក្រុមតួនាទីធំៗ៖ អ្នកវិភាគ (Analysts), អ្នកការទូត (Diplomats), អ្នកការពារ (Sentinels), និងអ្នករុករក (Explorers)។",
                en: "Divided into 4 major role groups: Analysts, Diplomats, Sentinels, and Explorers.",
              })}
            </p>
          </div>

          {latestResult && (
            <button
              type="button"
              onClick={() => setActiveTab("results")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#F7CE4D] hover:bg-[#E5BD3B] text-[#111965] shadow-xs cursor-pointer transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Crown className="w-4 h-4 text-[#111965]" />
              <span>{getLocalized({ km: `ត្រឡប់ទៅលទ្ធផល ${latestResult.personality_type}`, en: `Back to My ${latestResult.personality_type} Result` })}</span>
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-2">
            {["all", "analysts", "diplomats", "sentinels", "explorers"].map((tab) => {
              const isActive = roleFilter === tab;
              const roleObj = ROLES_META.find((r) => r.id === tab);

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRoleFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#111965] text-white shadow-2xs"
                      : "bg-white text-[#68708A] hover:bg-[#E6E8F0] hover:text-[#111965] border border-[#E6E8F0]"
                  }`}
                >
                  {tab === "all" ? "All 16 Types (ទាំងអស់)" : roleObj?.nameEn || tab}
                </button>
              );
            })}
          </div>
          <span className="text-xs font-bold text-[#68708A] whitespace-nowrap hidden sm:inline">
            16 Archetypes
          </span>
        </div>

        {/* 16 Types Grid with Official Characters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(ARCHETYPE_META)
            .filter(([_, meta]) => roleFilter === "all" || meta.role === roleFilter)
            .map(([code, meta]) => {
              const isCurrentUser = code === latestResult?.personality_type;
              const roleData = ROLES_META.find((r) => r.id === meta.role);

              return (
                <div
                  key={code}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative ${
                    isCurrentUser
                      ? "bg-gradient-to-b from-amber-50/70 to-white border-amber-300 ring-2 ring-amber-400/50 shadow-md"
                      : "bg-white border-[#E6E8F0] hover:border-slate-300 hover:shadow-2xs"
                  }`}
                >
                  {isCurrentUser && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black bg-[#F7CE4D] text-[#111965] shadow-xs flex items-center gap-1 z-10">
                      <Sparkles className="w-2.5 h-2.5 text-[#111965]" />
                      <span>Your MBTI</span>
                    </span>
                  )}

                  {/* Character Illustration */}
                  <div className="w-full h-32 flex items-center justify-center p-2 bg-slate-50/80 rounded-xl border border-slate-100/80">
                    <Image
                      src={`/images/personality-types/${code.toLowerCase()}.svg`}
                      alt={`${code} Character`}
                      width={110}
                      height={120}
                      className="h-full w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-lg font-black tracking-tight"
                        style={{ color: meta.roleColor }}
                      >
                        {code}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border"
                        style={{
                          backgroundColor: `${meta.roleColor}15`,
                          color: meta.roleColor,
                          borderColor: `${meta.roleColor}30`,
                        }}
                      >
                        {roleData?.nameEn}
                      </span>
                    </div>

                    <h5 className="text-xs font-black text-[#111965] leading-snug">
                      {meta.nameKm.split("•")[1]?.trim() || meta.nameEn}
                    </h5>

                    <p className="text-[11px] text-[#68708A] line-clamp-3 leading-relaxed">
                      {meta.taglineKm}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span>{meta.roleNameKm}</span>
                    <span className="font-mono text-[9px] opacity-75">{code}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // ========================================================
  // QUESTIONNAIRE RUNNER: SHARED ASSESSMENTSTAGE COMPONENT
  // ========================================================
  if (!questions || questions.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-[#68708A]">
        No questions available.
      </div>
    );
  }

  const currentQ = questions[currentIndex] || questions[0];
  const currentAnswer = currentQ ? answers[currentQ.id] : null;

  // Format questions for shared AssessmentStage component
  const formattedQuestions: AssessmentStepItem[] = questions.map((q: any) => {
    const dimGroup = (q.dimension || q.category || "EI") as DimensionGroup;
    const dim = DIMENSION_TITLES[dimGroup];

    return {
      id: q.id,
      promptKm: q.prompt_km,
      promptEn: q.prompt_en,
      statementKm: "",
      statementEn: "",
      dimensionCode: dim?.code || dimGroup,
      dimensionNameKm: dim?.nameKm || dimGroup,
      dimensionNameEn: dim?.nameEn || dimGroup,
    };
  });

  return (
    <div className="pb-16">
      <AssessmentStage
        breadcrumbText={`${t("personalityAssessment.dashboard")} / ${t("personalityAssessment.breadcrumb")}`}
        pageTitle={t("personalityAssessment.title")}
        headerAction={
          <AssessmentViewSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
            questionsLabel={t("personalityAssessment.questionsTab") || "ធ្វើតេស្ត"}
            profileLabel={`${latestResult?.personality_type || "INTJ"} Profile`}
            profileIcon={Crown}
            guideLabel={t("personalityAssessment.guideTab") || "មគ្គុទ្ទេសក៍ទាំង ១៦"}
            hasResult={!!latestResult}
          />
        }
        questions={formattedQuestions}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        answers={answers}
        onAnswer={(qId, level) => {
          const targetQ = questions.find((q: any) => q.id === qId);
          if (targetQ) handleScaleChange(targetQ, level);
        }}
        scaleType="5-point"
        leftAnchorKm="យល់ស្រប"
        leftAnchorEn="Agree"
        rightAnchorKm="មិនយល់ស្រប"
        rightAnchorEn="Disagree"
        mascotSpeech={
          currentAnswer?.scaleLevel !== undefined && currentAnswer?.scaleLevel !== null
            ? currentAnswer.scaleLevel === 1
              ? getLocalized({
                  km: "យល់ស្របខ្លាំង! ច្បាស់លាស់ណាស់ 🚀✨",
                  en: "Strongly Agree! Crystal clear 🚀✨",
                })
              : currentAnswer.scaleLevel === 2
              ? getLocalized({
                  km: "យល់ស្រប! ត្រូវនឹងចិត្តអ្នក ✨",
                  en: "Agree! True to who you are ✨",
                })
              : currentAnswer.scaleLevel === 3
              ? getLocalized({
                  km: "កណ្តាល! ថ្លឹងថ្លែងយ៉ាងម៉ត់ចត់ ⚖️",
                  en: "Neutral! Balanced reflection ⚖️",
                })
              : currentAnswer.scaleLevel === 4
              ? getLocalized({
                  km: "មិនសូវយល់ស្របទេ! យល់ច្បាស់ហើយ 💡",
                  en: "Disagree! Understood 💡",
                })
              : getLocalized({
                  km: "មិនយល់ស្របដាច់ខាត! ដឹងច្បាស់ពីខ្លួនឯង 🛑",
                  en: "Strongly Disagree! Clear boundaries 🛑",
                })
            : currentIndex === 0
            ? getLocalized({
                km: "សូមអានសំណើខាងក្រោម រួចជ្រើសរើសកម្រិតដែលត្រូវនឹងចិត្តអ្នក 🌟",
                en: "Read the statement below and pick the option that describes you 🌟",
              })
            : currentIndex === Math.floor(questions.length / 2)
            ? getLocalized({
                km: "ដល់ពាក់កណ្តាលផ្លូវហើយ! លឿនមែន ⚡",
                en: "Halfway mark! Fast & steady ⚡",
              })
            : currentIndex === questions.length - 1
            ? getLocalized({
                km: "សំណួរចុងក្រោយបង្អស់! តោះបញ្ចប់ 🚀",
                en: "Final question! Let's wrap this up 🚀",
              })
            : getLocalized({
                km: `សំណួរទី ${currentIndex + 1}/${questions.length} • ជ្រើសរើសដោយស្មោះត្រង់ ✨`,
                en: `Statement ${currentIndex + 1}/${questions.length} • Choose honestly ✨`,
              })
        }
        mascotScaleLevel={currentAnswer?.scaleLevel ?? null}
        onPrefill={handleQuickPrefill}
        onSubmit={handleSubmit}
        onClearDraft={handleClearDraft}
        isSubmitting={submitting}
        submitButtonText={t("personalityAssessment.complete")}
      />
    </div>
  );
}
