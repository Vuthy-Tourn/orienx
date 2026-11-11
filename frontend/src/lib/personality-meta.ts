export type DimensionGroup = "EI" | "SN" | "TF" | "JP";

export const DIMENSION_TITLES: Record<
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

export interface RecommendedMajorLink {
  titleKm: string;
  titleEn: string;
  slug: string;
  reasonKm: string;
  reasonEn: string;
}

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
  overviewKm?: string;
  overviewEn?: string;
  strengthsKm?: string[];
  strengthsEn?: string[];
  growthAreasKm?: string[];
  growthAreasEn?: string[];
  learningStyleKm?: string;
  learningStyleEn?: string;
  bestFieldsKm?: string[];
  bestFieldsEn?: string[];
  careersKm?: string[];
  careersEn?: string[];
  recommendedMajors?: RecommendedMajorLink[];
}

export interface CognitiveDimensionDetail {
  dimension: string;
  code: string;
  letter: string;
  nameKm: string;
  nameEn: string;
  traitKm: string;
  traitEn: string;
  scoreLabel: string;
}

export function getCognitiveDimensions(code: string): CognitiveDimensionDetail[] {
  const upper = code.toUpperCase();
  const eOrI = upper[0] === "I" ? "I" : "E";
  const sOrN = upper[1] === "N" ? "N" : "S";
  const tOrF = upper[2] === "F" ? "F" : "T";
  const jOrP = upper[3] === "P" ? "P" : "J";

  return [
    {
      dimension: "Mind",
      code: "E vs I",
      letter: eOrI,
      nameKm: eOrI === "E" ? "Extraverted (E) • ចិត្តសង្គម" : "Introverted (I) • ចិត្តស្ងប់ស្ងាត់",
      nameEn: eOrI === "E" ? "Extraverted (E) • Mind" : "Introverted (I) • Mind",
      traitKm: eOrI === "E"
        ? "បញ្ចូលថាមពលពីបរិយាកាសខាងក្រៅ រីករាយនឹងកិច្ចការជាក្រុម និងការធ្វើសកម្មភាពសង្គមរស់រវើក។"
        : "បញ្ចូលថាមពលពីការសញ្ជឹងគិតឯកជន ចូលចិត្តការផ្តោតអារម្មណ៍ស៊ីជម្រៅ និងបរិយាកាសស្ងប់ស្ងាត់។",
      traitEn: eOrI === "E"
        ? "Draws energy from external interactions, social dynamics, and vibrant team environments."
        : "Recharges through internal reflection, deep solitary concentration, and calm settings.",
      scoreLabel: eOrI === "E" ? "Extraverted" : "Introverted",
    },
    {
      dimension: "Energy",
      code: "S vs N",
      letter: sOrN,
      nameKm: sOrN === "S" ? "Sensing (S) • ជាក់ស្តែងនិយម" : "Intuitive (N) • វិចារណញ្ញាណ",
      nameEn: sOrN === "S" ? "Observant / Sensing (S) • Energy" : "Intuitive (N) • Energy",
      traitKm: sOrN === "S"
        ? "ផ្តោតលើទិន្នន័យជាក់ស្តែង ការពិតប្រាកដនិយម និងបទពិសោធន៍ផ្ទាល់ដៃដែលមានលទ្ធផលច្បាស់។"
        : "ផ្តោតលើចក្ខុវិស័យអនាគត គំនិតច្នៃប្រឌិតអរូបី និងការស្វែងយល់ពីលទ្ធភាពថ្មីៗដែលមិនទាន់កើតមាន។",
      traitEn: sOrN === "S"
        ? "Grounds thinking in empirical evidence, verifiable facts, and step-by-step reality."
        : "Focuses on abstract concepts, patterns, future possibilities, and innovative models.",
      scoreLabel: sOrN === "S" ? "Observant" : "Intuitive",
    },
    {
      dimension: "Nature",
      code: "T vs F",
      letter: tOrF,
      nameKm: tOrF === "T" ? "Thinking (T) • តក្កវិជ្ជា" : "Feeling (F) • អារម្មណ៍ & មនុស្ស",
      nameEn: tOrF === "T" ? "Thinking (T) • Nature" : "Feeling (F) • Nature",
      traitKm: tOrF === "T"
        ? "សម្រេចចិត្តផ្អែកលើភាពត្រឹមត្រូវ តក្កវិជ្ជាសុក្រឹត គោលការណ៍យុត្តិធម៌ និងការវាយតម្លៃដោយឥតលម្អៀង។"
        : "សម្រេចចិត្តផ្អែកលើការយល់ចិត្ត តម្លៃមនុស្សធម៌ ផលប៉ះពាល់ផ្លូវចិត្ត និងសាមគ្គីភាពក្នុងសហគមន៍។",
      traitEn: tOrF === "T"
        ? "Decides through objective logic, analytical consistency, and impartial fairness."
        : "Decides through empathy, human values, emotional resonance, and harmonious consensus.",
      scoreLabel: tOrF === "T" ? "Thinking" : "Feeling",
    },
    {
      dimension: "Tactics",
      code: "J vs P",
      letter: jOrP,
      nameKm: jOrP === "J" ? "Judging (J) • រៀបចំរចនាសម្ព័ន្ធ" : "Prospecting (P) • បត់បែនតាមស្ថានភាព",
      nameEn: jOrP === "J" ? "Judging (J) • Tactics" : "Prospecting (P) • Tactics",
      traitKm: jOrP === "J"
        ? "ចូលចិត្តផែនការរៀបរយ ការកំណត់កាលវិភាគច្បាស់លាស់ និងការបំពេញការងារឱ្យរួចរាល់តាមផែនការ។"
        : "ចូលចិត្តសេរីភាព ភាពបត់បែនតាមកាលៈទេសៈ ការស្វែងរកឱកាសថ្មីៗ និងការសម្រេចចិត្តបែបសេរី។",
      traitEn: jOrP === "J"
        ? "Values structure, predictability, clear milestones, checklists, and timely closure."
        : "Values flexibility, improvisation, spontaneous adaptation, and keeping horizons open.",
      scoreLabel: jOrP === "J" ? "Judging" : "Prospecting",
    },
  ];
}

export const ARCHETYPE_META: Record<string, ArchetypeMetaItem> = {
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
    overviewKm: "INTJ គឺជាមនុស្សដែលមានសមត្ថភាពវិភាគខ្ពស់បំផុត និងមានចក្ខុវិស័យយូរអង្វែង។ ពួកគេចូលចិត្តបង្កើតប្រព័ន្ធស្មុគស្មាញ ដោះស្រាយបញ្ហាដែលមានលក្ខណៈជាយុទ្ធសាស្ត្រ និងស្រាវជ្រាវទ្រឹស្តីស៊ីជម្រៅដើម្បីកែលម្អប្រសិទ្ធភាពការងារ។",
    overviewEn: "INTJs are highly analytical strategists with visionary foresight. They naturally build complex conceptual architectures, optimize systems, and relentlessly pursue intellectual mastery.",
    strengthsKm: ["ការគិតយុទ្ធសាស្ត្រ និងចក្ខុវិស័យវែងឆ្ងាយ", "ការវិភាគប្រព័ន្ធស្មុគស្មាញ", "ការតាំងចិត្ត និងភាពឯករាជ្យខ្ពស់", "ការដោះស្រាយបញ្ហាបច្ចេកវិទ្យា"],
    strengthsEn: ["Strategic Foresight", "Complex Systems Analysis", "High Determination & Autonomy", "Innovative Technical Problem Solving"],
    growthAreasKm: ["អាចមានភាពតឹងតែងជ្រុលចំពោះកំហុសអ្នកដទៃ", "មិនសូវអត់ធ្មត់នឹងការងារដែលគ្មានប្រសិទ្ធភាព", "ពិបាកបង្ហាញអារម្មណ៍ និងការយល់ចិត្ត"],
    growthAreasEn: ["Can be overly critical of inefficiency", "Impatience with unstructured processes", "Tendency to neglect emotional resonance"],
    learningStyleKm: "ចូលចិត្តការស្រាវជ្រាវឯករាជ្យ គំរូទ្រឹស្តីស៊ីជម្រៅ និងការរៀបចំផែនការអនាគត។",
    learningStyleEn: "Prefers autonomous research, deep theoretical frameworks, and strategic planning.",
    bestFieldsKm: ["វិទ្យាសាស្ត្រកុំព្យូទ័រ & AI", "ស្ថាបត្យកម្ម", "វិស្វកម្មប្រព័ន្ធ"],
    bestFieldsEn: ["Computer Science & AI", "Architecture", "Systems Engineering"],
    careersKm: ["ស្ថាបត្យករកម្មវិធីកុំព្យូទ័រ", "អ្នកស្រាវជ្រាវ AI", "អ្នកប្រឹក្សាយុទ្ធសាស្ត្រសាជីវកម្ម", "វិស្វករប្រព័ន្ធទិន្នន័យ"],
    careersEn: ["Software Architect", "AI Research Scientist", "Corporate Strategy Consultant", "Systems Engineer"],
    recommendedMajors: [
      {
        slug: "software-engineering",
        titleKm: "វិស្វកម្មសូហ្វវែរ (Software Engineering)",
        titleEn: "Software Engineering & Computer Science",
        reasonKm: "ត្រូវគ្នានឹងសមត្ថភាពគិតបែបស្ថាបត្យកម្ម និងការបង្កើតប្រព័ន្ធកូដទ្រង់ទ្រាយធំ។",
        reasonEn: "Aligns with architectural mindset and large-scale software systems design.",
      },
      {
        slug: "data-science-ai",
        titleKm: "វិទ្យាសាស្ត្រទិន្នន័យ និងបញ្ញាសិប្បនិម្មិត",
        titleEn: "Data Science & Artificial Intelligence",
        reasonKm: "ទាមទារការវិភាគទិន្នន័យស្មុគស្មាញ និងការបង្កើតក្បួនដោះស្រាយទស្សន៍ទាយ។",
        reasonEn: "Requires deep analytical rigor and predictive algorithm design.",
      },
      {
        slug: "architecture",
        titleKm: "ស្ថាបត្យកម្ម និងនគរូបនីយកម្ម",
        titleEn: "Architecture & Urban Design",
        reasonKm: "បញ្ចូលរវាងការស្រមើស្រមៃច្នៃប្រឌិត និងផែនការរៀបរយជាក់ស្តែង។",
        reasonEn: "Bridges visionary imagination with precise functional design.",
      },
    ],
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
    overviewKm: "INTP គឺជាអ្នកបង្កើតគំនិតដ៏ប៉ិនប្រសប់ដែលចូលចិត្តស្វែងយល់ពីរបៀបដែលពិភពលោកដំណើរការ។ ពួកគេមិនដែលបញ្ឈប់ការចោទសួរ និងការស្រាវជ្រាវគំរូអរូបីដើម្បីបង្កើតរបកគំហើញថ្មីៗ។",
    overviewEn: "INTPs are innovative thinkers with an unquenchable thirst for knowledge. They constantly analyze abstract patterns and devise non-traditional solutions to challenging dilemmas.",
    strengthsKm: ["ការគិតតក្កវិជ្ជាសុក្រឹត", "ភាពច្នៃប្រឌិតស្វែងយល់ឥតដែនកំណត់", "ការដោះស្រាយបញ្ហាគំនិតពិបាកៗ", "ការបើកចិត្តទូលាយចំពោះទស្សនៈថ្មី"],
    strengthsEn: ["Rigorous Logical Analysis", "Limitless Intellectual Curiosity", "Abstract Problem Solving", "Objective Open-Mindedness"],
    growthAreasKm: ["ងាយធ្លាក់ក្នុងការគិតច្រើនជ្រុល (Overthinking)", "ពិបាកបន្តការងាររដ្ឋបាលលម្អិតឱ្យចប់", "អាចមើលរំលងទិដ្ឋភាពអារម្មណ៍សង្គម"],
    growthAreasEn: ["Prone to overthinking and analysis paralysis", "Struggles with repetitive follow-through", "May overlook social conventions"],
    learningStyleKm: "រៀនបានល្អតាមរយៈការពិសោធន៍ គំនិតអរូបី និងការស្រាវជ្រាវដោយសេរីភាព។",
    learningStyleEn: "Learns best through experimentation, abstract ideas, and open-ended research.",
    bestFieldsKm: ["វិទ្យាសាស្ត្រទិន្នន័យ & AI", "រូបវិទ្យា & គណិតវិទ្យា", "ទស្សនវិជ្ជា"],
    bestFieldsEn: ["Data Science & AI", "Physics & Mathematics", "Philosophy"],
    careersKm: ["អ្នកវិភាគក្បួនដោះស្រាយ AI", "វិស្វករស្រាវជ្រាវកូដ", "អ្នកជំនាញសន្តិសុខតាមប្រព័ន្ធអ៊ីនធឺណិត", "គណិតវិទូ"],
    careersEn: ["AI Algorithm Researcher", "Backend Research Engineer", "Cybersecurity Analyst", "Quantitative Analyst"],
    recommendedMajors: [
      {
        slug: "data-science-ai",
        titleKm: "វិទ្យាសាស្ត្រទិន្នន័យ និងបញ្ញាសិប្បនិម្មិត",
        titleEn: "Data Science & Artificial Intelligence",
        reasonKm: "ការពិសោធន៍លើគំរូទិន្នន័យធំៗ និងម៉ូដែល Machine Learning ស័ក្តិសមនឹងចិត្តវិភាគ។",
        reasonEn: "Allows unconstrained experimentation with machine learning models.",
      },
      {
        slug: "cybersecurity",
        titleKm: "សន្តិសុខតាមប្រព័ន្ធអ៊ីនធឺណិត",
        titleEn: "Cybersecurity & Information Assurance",
        reasonKm: "ការវិភាគចំណុចខ្សោយនៃប្រព័ន្ធ និងការបង្កើតយន្តការការពារទាមទារតក្កវិជ្ជាខ្ពស់។",
        reasonEn: "Dissecting attack vectors and system security appeals to logical intuition.",
      },
      {
        slug: "software-engineering",
        titleKm: "វិស្វកម្មសូហ្វវែរ",
        titleEn: "Software Engineering & Computer Science",
        reasonKm: "ការសរសេរកូដផ្តល់ឱកាសបង្កើតឧបករណ៍ថ្មីៗពីគំនិតអរូបី។",
        reasonEn: "Provides a playground to turn conceptual logic into reality.",
      },
    ],
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
    overviewKm: "ENTJ គឺជាអ្នកដឹកនាំពីកំណើតដែលពោរពេញដោយថាមពលនិងការតាំងចិត្តខ្ពស់។ ពួកគេមើលឃើញឧបសគ្គជាឱកាសដើម្បីកសាងយុទ្ធសាស្ត្រជ័យជម្នះ និងដឹកនាំស្ថាប័នឆ្ពោះទៅកាន់ការរីកចម្រើន។",
    overviewEn: "ENTJs are strategic commanders with charismatic authority. They transform challenges into clear action paths, mobilize people efficiently, and build resilient organizations.",
    strengthsKm: ["ភាពជាអ្នកដឹកនាំម៉ឺងម៉ាត់", "ការសម្រេចចិត្តរហ័ស និងច្បាស់លាស់", "ការរៀបចំយុទ្ធសាស្ត្រស្ថាប័ន", "ការជំរុញឱ្យសម្រេចលទ្ធផល"],
    strengthsEn: ["Decisive Leadership", "Fast & Clear Decision-Making", "Organizational Strategy", "Relentless Execution"],
    growthAreasKm: ["អាចមានអាកប្បកិរិយារឹងត្អឹងជ្រុលចំពោះអ្នកដទៃ", "មិនសូវអត់ធ្មត់នឹងភាពយឺតយ៉ាវ", "ពិបាកទទួលយកអារម្មណ៍ងាយរងគ្រោះ"],
    growthAreasEn: ["Can be perceived as domineering or harsh", "Impatience with slow deliberation", "Low tolerance for subjective arguments"],
    learningStyleKm: "រៀនតាមរយៈការអនុវត្តផ្ទាល់ បញ្ហាប្រឈមធំៗ និងការដឹកនាំគម្រោងជាក់ស្តែង។",
    learningStyleEn: "Learns through hands-on leadership challenges, executive case studies, and team direction.",
    bestFieldsKm: ["គ្រប់គ្រងពាណិជ្ជកម្ម", "សេដ្ឋកិច្ច & ហិរញ្ញវត្ថុ", "នីតិសាស្ត្រ"],
    bestFieldsEn: ["Business Administration", "Economics & Finance", "Law"],
    careersKm: ["នាយកប្រតិបត្តិក្រុមហ៊ុន (CEO)", "អ្នកគ្រប់គ្រងយុទ្ធសាស្ត្រវិនិយោគ", "មេធាវីសាជីវកម្ម", "នាយកគម្រោងធំៗ"],
    careersEn: ["Chief Executive Officer", "Investment Strategy Director", "Corporate Attorney", "Executive Director"],
    recommendedMajors: [
      {
        slug: "business-administration",
        titleKm: "គ្រប់គ្រងពាណិជ្ជកម្ម",
        titleEn: "Business Administration & Management",
        reasonKm: "បណ្តុះបណ្តាលភាពជាអ្នកដឹកនាំ ការគ្រប់គ្រងហិរញ្ញវត្ថុ និងយុទ្ធសាស្ត្រទីផ្សារ។",
        reasonEn: "Develops institutional leadership, financial governance, and market strategy.",
      },
      {
        slug: "law",
        titleKm: "នីតិសាស្ត្រ (ច្បាប់)",
        titleEn: "Law & Legal Studies",
        reasonKm: "ការជជែកតស៊ូមតិ ការវិភាគច្បាប់ និងយុទ្ធសាស្ត្រចរចាស័ក្តិសមនឹងភាពម៉ឺងម៉ាត់។",
        reasonEn: "Harnesses rigorous advocacy, contract mastery, and strategic dispute resolution.",
      },
      {
        slug: "banking-finance",
        titleKm: "ធនាគារ និងហិរញ្ញវត្ថុ",
        titleEn: "Banking & Finance",
        reasonKm: "ការចាត់ចែងទុន ការវិនិយោគ និងការវិភាគហានិភ័យសេដ្ឋកិច្ច។",
        reasonEn: "Focuses on capital deployment, quantitative models, and corporate valuation.",
      },
    ],
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
    overviewKm: "ENTP គឺជាអ្នកច្នៃប្រឌិតស្វាហាប់ដែលតែងតែស្វែងរកវិធីថ្មីៗដើម្បីផ្លាស់ប្តូរផ្នត់គំនិតចាស់។ ពួកគេរីករាយនឹងការជជែកដេញដោលបញ្ញា ការបង្កើតគំនិតធុរកិច្ច និងការដោះស្រាយបញ្ហាតាមរបៀបប្លែកៗ។",
    overviewEn: "ENTPs are dynamic ideators who love challenging the status quo. With razor-sharp wit and intellectual versatility, they discover breakthrough angles that others overlook.",
    strengthsKm: ["ការបង្កើតគំនិតនវានុវត្តន៍រហ័ស", "ការជជែកដេញដោលបញ្ញា", "ភាពបត់បែនឆ្លើយតបគ្រប់ស្ថានភាព", "ការបញ្ចុះបញ្ចូល និងទំនាក់ទំនង"],
    strengthsEn: ["Rapid Innovation & Ideation", "Intellectual Sparring", "Versatile Adaptability", "Charismatic Persuasion"],
    growthAreasKm: ["ពិបាកផ្តោតលើការអនុវត្តគម្រោងរហូតដល់ចប់", "ចូលចិត្តជជែកដេញដោលហួសហេតុ", "ងាយធុញទ្រាន់នឹងការងាររដ្ឋបាល"],
    growthAreasEn: ["Difficulty following through on routine details", "Can argue for the sake of arguing", "Easily distracted by new shiny ideas"],
    learningStyleKm: "ចូលចិត្តបរិយាកាសសិក្សាដែលមានការពិភាក្សាផ្លាស់ប្តូរ និងការបង្កើតដំណោះស្រាយមិនធ្លាប់មាន។",
    learningStyleEn: "Thrives in brainstorming forums, debates, and rapid multidisciplinary problem-solving.",
    bestFieldsKm: ["សហគ្រិនភាព & នវានុវត្តន៍", "ច្បាប់ & តស៊ូមតិ", "ទីផ្សារយុទ្ធសាស្ត្រ"],
    bestFieldsEn: ["Entrepreneurship & Innovation", "Law & Advocacy", "Strategic Marketing"],
    careersKm: ["ស្ថាបនិកក្រុមហ៊ុនបច្ចេកវិទ្យា (Startup)", "អ្នកប្រឹក្សាយុទ្ធសាស្ត្រនវានុវត្តន៍", "មេធាវីតស៊ូមតិ", "ប្រធានគ្រប់គ្រងផលិតផល"],
    careersEn: ["Startup Founder", "Innovation Strategist", "Litigation Lawyer", "Product Growth Manager"],
    recommendedMajors: [
      {
        slug: "business-administration",
        titleKm: "គ្រប់គ្រងពាណិជ្ជកម្ម & សហគ្រិនភាព",
        titleEn: "Business Administration & Entrepreneurship",
        reasonKm: "ផ្តល់មូលដ្ឋានគ្រឹះក្នុងការបង្កើតអាជីវកម្ម និងការចរចាទីផ្សារ។",
        reasonEn: "Teaches venture creation, market disruption, and venture negotiation.",
      },
      {
        slug: "digital-marketing",
        titleKm: "ទីផ្សារឌីជីថល និងប្រព័ន្ធផ្សព្វផ្សាយ",
        titleEn: "Digital Marketing & Brand Strategy",
        reasonKm: "ទាមទារភាពច្នៃប្រឌិតរហ័ស ការចាប់យកនិន្នាការថ្មី និងការទាក់ទាញអ្នកប្រើប្រាស់។",
        reasonEn: "Requires constant creativity, trend hijacking, and audience persuasion.",
      },
      {
        slug: "law",
        titleKm: "នីតិសាស្ត្រ",
        titleEn: "Law & Jurisprudence",
        reasonKm: "ស័ក្តិសមនឹងអ្នកចូលចិត្តជជែកដេញដោល និងការស្វែងរកទឡ្ហីករណ៍ច្បាប់។",
        reasonEn: "Harnesses natural talent for argument, critical reasoning, and negotiation.",
      },
    ],
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
    overviewKm: "INFJ គឺជាបុគ្គលិកលក្ខណៈកម្របំផុតមួយ ដែលរួមបញ្ចូលគ្នារវាងការយល់ចិត្តមនុស្សយ៉ាងស៊ីជម្រៅ និងការរៀបចំផែនការជាក់ស្តែង។ ពួកគេចង់ឱ្យជីវិត និងការងារមានអត្ថន័យជ្រាលជ្រៅសម្រាប់សង្គម។",
    overviewEn: "INFJs are rare, principled idealists guided by deep empathy and strong moral clarity. They strive to make meaningful contributions to societal welfare and individual growth.",
    strengthsKm: ["ការយល់ចិត្ត និងវិចារណញ្ញាណមនុស្ស", "ចក្ខុវិស័យវែងឆ្ងាយសម្រាប់សង្គម", "ការប្តេជ្ញាចិត្តលើគុណធម៌", "សមត្ថភាពសរសេរ និងបំផុសគំនិត"],
    strengthsEn: ["Profound Human Empathy", "Long-Range Social Vision", "Principled Integrity", "Inspiring Communication"],
    growthAreasKm: ["ងាយអស់ថាមពលផ្លូវចិត្ត (Burnout)", "ប្រកាន់ខ្ជាប់ភាពល្អឥតខ្ចោះជ្រុល (Perfectionism)", "ពិបាកបើកចំហទទួលជំនួយពីអ្នកដទៃ"],
    growthAreasEn: ["Prone to emotional burnout", "Perfectionistic standards that cause paralysis", "Guardedness about personal struggles"],
    learningStyleKm: "ចូលចិត្តការសិក្សាដែលមានគោលបំណងច្បាស់លាស់សម្រាប់សង្គម និងការឆ្លុះបញ្ចាំងគំនិតស្ងប់ស្ងាត់។",
    learningStyleEn: "Values purposeful, mission-driven education with quiet reflective depth.",
    bestFieldsKm: ["ចិត្តវិទ្យា", "ទំនាក់ទំនងអន្តរជាតិ", "ការអប់រំ"],
    bestFieldsEn: ["Psychology", "International Relations", "Education"],
    careersKm: ["អ្នកប្រឹក្សាយោបល់ផ្លូវចិត្ត", "អ្នកការទូតអន្តរជាតិ", "អ្នកគ្រប់គ្រងអង្គការសង្គម (NGO)", "សាស្ត្រាចារ្យទស្សនវិជ្ជា"],
    careersEn: ["Counseling Psychologist", "Diplomat", "Non-Profit Executive", "Ethics & Social Researcher"],
    recommendedMajors: [
      {
        slug: "international-relations",
        titleKm: "ទំនាក់ទំនងអន្តរជាតិ",
        titleEn: "International Relations & Diplomacy",
        reasonKm: "ត្រូវគ្នានឹងបំណងប្រាថ្នាកសាងសន្តិភាព សហប្រតិបត្តិការ និងសិទ្ធិមនុស្ស។",
        reasonEn: "Aligns with passions for peacebuilding, cultural diplomacy, and global equity.",
      },
      {
        slug: "law",
        titleKm: "នីតិសាស្ត្រ និងសិទ្ធិមនុស្ស",
        titleEn: "Law & Human Rights",
        reasonKm: "ការការពារយុត្តិធម៌សង្គម និងការជួយជនងាយរងគ្រោះតាមផ្លូវច្បាប់។",
        reasonEn: "Offers legal avenues to champion social justice and protect the vulnerable.",
      },
      {
        slug: "business-administration",
        titleKm: "គ្រប់គ្រងអង្គការ និងធុរកិច្ចសង្គម",
        titleEn: "Business & Social Enterprise Management",
        reasonKm: "បណ្តុះបណ្តាលការដឹកនាំសហគ្រាសសង្គមប្រកបដោយចីរភាព។",
        reasonEn: "Prepares for running impactful, mission-first social ventures.",
      },
    ],
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
    overviewKm: "INFP គឺជាមនុស្សដែលមានចិត្តស្មោះត្រង់នឹងឧត្តមគតិផ្ទាល់ខ្លួន។ ពួកគេមានអារម្មណ៍រសើបចំពោះសិល្បៈ អក្សរសាស្ត្រ និងសេចក្តីល្អក្នុងមនុស្ស។ ពួកគេតែងតែស្វែងរកអត្តសញ្ញាណពិត និងគោលបំណងក្នុងជីវិត។",
    overviewEn: "INFPs are poetic, compassionate visionaries who uphold personal authenticity. Guided by strong inner values, they explore creative and empathic avenues to bring light to the world.",
    strengthsKm: ["ការច្នៃប្រឌិតសិល្បៈ និងការតែងនិពន្ធ", "ការយល់ចិត្តអ្នកដទៃយ៉ាងស៊ីជម្រៅ", "ភាពស្មោះត្រង់លើតម្លៃជីវិត", "ការបើកចិត្តទូលាយ"],
    strengthsEn: ["Artistic & Narrative Creativity", "Profound Empathy", "Authentic Value Alignment", "Deep Open-Mindedness"],
    growthAreasKm: ["ងាយអន់ចិត្តពេលរងការរិះគន់", "ពិបាកក្នុងការរៀបចំផែនការជាក់ស្តែង", "មានទំនោរគេចវេះពីជម្លោះចាំបាច់"],
    growthAreasEn: ["Takes critical feedback very personally", "Struggles with rigid practical timelines", "Avoids necessary confrontation"],
    learningStyleKm: "រៀនបានល្អនៅពេលមានសេរីភាពបញ្ចេញមតិផ្ទាល់ខ្លួន តាមរយៈការសរសេរ និងសិល្បៈ។",
    learningStyleEn: "Excels in creative, flexible learning environments through storytelling and artistic expression.",
    bestFieldsKm: ["អក្សរសាស្ត្រ & និពន្ធ", "រចនាក្រាហ្វិក & មេឌៀ", "ការងារសង្គម"],
    bestFieldsEn: ["Literature & Writing", "Graphic Design & Digital Media", "Social Work"],
    careersKm: ["អ្នកនិពន្ធ & អ្នកបង្កើតមាតិកា", "អ្នករចនា UI/UX", "អ្នកចិត្តវិទ្យាប្រឹក្សាយោបល់", "អ្នកស្រាវជ្រាវវប្បធម៌"],
    careersEn: ["Author / Creative Copywriter", "UI/UX Designer", "Counselor / Art Therapist", "Cultural Heritage Officer"],
    recommendedMajors: [
      {
        slug: "digital-marketing",
        titleKm: "ទីផ្សារឌីជីថល & ការបង្កើតមាតិកា",
        titleEn: "Digital Marketing & Content Creation",
        reasonKm: "ការនិពន្ធរឿង និងការបញ្ជូនសារមានឥទ្ធិពលតាមរយៈបណ្តាញសង្គម។",
        reasonEn: "Translates storytelling and visual resonance into engaging campaigns.",
      },
      {
        slug: "architecture",
        titleKm: "ស្ថាបត្យកម្ម និងរចនាសោភ័ណភាព",
        titleEn: "Architecture & Spatial Aesthetics",
        reasonKm: "ការរួមបញ្ចូលគ្នារវាងសោភ័ណភាពសិល្បៈ និងការរចនាលំហសម្រាប់មនុស្ស។",
        reasonEn: "Combines artistic vision with empathetic, human-centered spaces.",
      },
      {
        slug: "international-relations",
        titleKm: "ទំនាក់ទំនងអន្តរជាតិ & ការទូតវប្បធម៌",
        titleEn: "International Relations & Cultural Exchange",
        reasonKm: "ការយល់ដឹងពីភាពចម្រុះនៃវប្បធម៌ និងការជួយសង្គ្រោះសហគមន៍។",
        reasonEn: "Focuses on intercultural dialogue, human advocacy, and education equity.",
      },
    ],
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
    overviewKm: "ENFJ គឺជាអ្នកដឹកនាំប្រកបដោយមេត្តាធម៌ និងមានឥទ្ធិពលខ្ពស់ក្នុងការប្រមូលផ្តុំកម្លាំងមនុស្ស។ ពួកគេយកចិត្តទុកដាក់ស្មោះត្រង់លើការរីកចម្រើនរបស់សមាជិកក្រុម និងតែងតែបំផុសគំនិតឱ្យអ្នកដទៃសម្រេចក្តីស្រមៃ។",
    overviewEn: "ENFJs are inspiring communicators who bring people together around shared noble goals. Their natural charisma, warmth, and keen emotional intelligence elevate everyone around them.",
    strengthsKm: ["ការលើកទឹកចិត្ត និងជំរុញក្រុម", "ការទំនាក់ទំនងសាធារណៈដ៏មានមន្តស្នេហ៍", "ការកសាងសាមគ្គីភាព និងបណ្តាញ", "ភាពជាអ្នកដឹកនាំដែលយកចិត្តទុកដាក់"],
    strengthsEn: ["Inspiring Team Mentorship", "Charismatic Public Speaking", "Community Consensus Building", "Empathetic Servant Leadership"],
    growthAreasKm: ["ទទួលបន្ទុកបញ្ហាអ្នកដទៃច្រើនពេករហូតភ្លេចខ្លួន", "ងាយរងសម្ពាធពីការរំពឹងទុករបស់សង្គម", "ពិបាកបដិសេធសំណើជួយ"],
    growthAreasEn: ["Overextending oneself for others", "Overly sensitive to public approval", "Struggles with setting healthy boundaries"],
    learningStyleKm: "ចូលចិត្តការរៀនជាក្រុម កិច្ចការសហការ និងការចែករំលែកបទពិសោធន៍ផ្ទាល់មាត់។",
    learningStyleEn: "Thrives in participatory seminars, team collaborations, and peer-to-peer mentoring.",
    bestFieldsKm: ["ទំនាក់ទំនងសាធារណៈ & PR", "ការគ្រប់គ្រងធនធានមនុស្ស", "ការទូតអន្តរជាតិ"],
    bestFieldsEn: ["Public Relations", "Human Resource Management", "Diplomacy"],
    careersKm: ["នាយកគ្រប់គ្រងធនធានមនុស្ស (HR Director)", "អ្នកការទូតសាធារណៈ", "អ្នកគ្រប់គ្រងទំនាក់ទំនង PR", "អ្នកបណ្តុះបណ្តាលភាពជាអ្នកដឹកនាំ"],
    careersEn: ["HR Director / Talent Leader", "Public Diplomat", "PR & Corporate Communications Lead", "Executive Leadership Coach"],
    recommendedMajors: [
      {
        slug: "international-relations",
        titleKm: "ទំនាក់ទំនងអន្តរជាតិ & ការទូត",
        titleEn: "International Relations & Diplomacy",
        reasonKm: "ការកសាងកិច្ចសហប្រតិបត្តិការរវាងប្រទេស និងស្ថាប័នអន្តរជាតិ។",
        reasonEn: "Excels in multilateral negotiation, coalition building, and global policy.",
      },
      {
        slug: "business-administration",
        titleKm: "គ្រប់គ្រងធនធានមនុស្ស & ស្ថាប័ន",
        titleEn: "Business Administration & HR",
        reasonKm: "ការគ្រប់គ្រង និងអភិវឌ្ឍសមត្ថភាពបុគ្គលិកក្នុងស្ថាប័នធំៗ។",
        reasonEn: "Empowers organizational talent and fosters thriving workplace cultures.",
      },
      {
        slug: "digital-marketing",
        titleKm: "ទំនាក់ទំនងសារធារណៈ & ទីផ្សារ",
        titleEn: "Public Relations & Marketing",
        reasonKm: "ការផ្សព្វផ្សាយសារបំផុសគំនិត និងការកសាងកេរ្តិ៍ឈ្មោះម៉ាកសញ្ញា។",
        reasonEn: "Crafts authentic narratives that connect emotionally with broad audiences.",
      },
    ],
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
    overviewKm: "ENFP គឺជាមនុស្សដែលពោរពេញដោយក្តីរំភើប និងការច្នៃប្រឌិត។ ពួកគេមានភាពទាក់ទាញក្នុងទំនាក់ទំនងសង្គម ពូកែបង្កើតបរិយាកាសរីករាយ និងតែងតែមានគំនិតថ្មីៗដែលមិនចេះរីងស្ងួត។",
    overviewEn: "ENFPs are enthusiastic free spirits brimming with contagious energy and creative curiosity. They forge genuine human connections and see a world of endless possibilities.",
    strengthsKm: ["ការបង្កើតគំនិតច្នៃប្រឌិតឥតដែនកំណត់", "ភាពរួសរាយរាក់ទាក់ទាក់ទាញចិត្ត", "ការលើកទឹកចិត្ត និងបង្កើតបរិយាកាសវិជ្ជមាន", "ការយល់ចិត្ត និងការប្រាស្រ័យទាក់ទង"],
    strengthsEn: ["Boundless Creative Ideation", "Magnetic Interpersonal Warmth", "Infectious Enthusiasm", "Empathetic Storytelling"],
    growthAreasKm: ["ងាយធុញទ្រាន់នឹងការងាររដ្ឋបាលលម្អិត", "ពិបាកផ្តោតលើគម្រោងតែមួយឱ្យចប់សព្វគ្រប់", "ឆាប់ផ្លាស់ប្តូរអារម្មណ៍ និងការសម្រេចចិត្ត"],
    growthAreasEn: ["Distaste for routine paperwork", "Difficulty bringing ambitious projects across the finish line", "Overthinking interpersonal feedback"],
    learningStyleKm: "រៀនតាមរយៈការពិភាក្សាច្នៃប្រឌិត ការស្រាវជ្រាវបែបស្វែងរក និងការបង្កើតគម្រោងថ្មីៗ។",
    learningStyleEn: "Learns best through dynamic workshops, visual exploration, and creative storytelling.",
    bestFieldsKm: ["សារព័ត៌មាន & មេឌៀ", "ទីផ្សារច្នៃប្រឌិត", "ការគ្រប់គ្រងព្រឹត្តិការណ៍"],
    bestFieldsEn: ["Journalism & Media", "Creative Marketing", "Event Management"],
    careersKm: ["អ្នកដឹកនាំទីផ្សារច្នៃប្រឌិត (Creative Director)", "អ្នកបង្កើតមាតិកាឌីជីថល", "អ្នករៀបចំព្រឹត្តិការណ៍ធំៗ", "អ្នកប្រឹក្សាការប្រាស្រ័យទាក់ទង"],
    careersEn: ["Creative Director", "Digital Content Creator", "Experiential Event Producer", "Communications Consultant"],
    recommendedMajors: [
      {
        slug: "digital-marketing",
        titleKm: "ទីផ្សារឌីជីថល & ប្រព័ន្ធផ្សព្វផ្សាយ",
        titleEn: "Digital Marketing & Media Strategy",
        reasonKm: "ការបង្កើតយុទ្ធនាការច្នៃប្រឌិតដែលទាក់ទាញចំណាប់អារម្មណ៍សាធារណៈជន។",
        reasonEn: "Channel endless creativity into viral digital campaigns and multimedia storytelling.",
      },
      {
        slug: "business-administration",
        titleKm: "គ្រប់គ្រងពាណិជ្ជកម្ម & សហគ្រិនភាព",
        titleEn: "Business Administration & Innovation",
        reasonKm: "ការបង្កើតគម្រោងថ្មីៗ និងការប្រាស្រ័យទាក់ទងដៃគូធុរកិច្ច។",
        reasonEn: "Turns vibrant ideas into feasible business models and team projects.",
      },
      {
        slug: "international-relations",
        titleKm: "ទំនាក់ទំនងអន្តរជាតិ",
        titleEn: "International Relations & Cultural Exchange",
        reasonKm: "ការតភ្ជាប់មនុស្សពីវប្បធម៌ចម្រុះ និងការរៀបចំកិច្ចសហការអន្តរជាតិ។",
        reasonEn: "Leverages interpersonal charisma for cross-border cooperation.",
      },
    ],
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
    overviewKm: "ISTJ គឺជាសសរទ្រូងនៃភាពជឿជាក់និងវិន័យ។ ពួកគេគោរពពេលវេលា ប្រកាន់ខ្ជាប់ច្បាប់ និងអនុវត្តភារកិច្ចដោយការប្រុងប្រយ័ត្នខ្ពស់បំផុត។ ការងារដែលពួកគេទទួលខុសត្រូវតែងតែមានភាពសុក្រឹតនិងទាន់ពេលវេលា។",
    overviewEn: "ISTJs are dependable pillars of integrity, order, and practical precision. They respect rules, honor commitments, and execute workflows with meticulous accuracy.",
    strengthsKm: ["ការរៀបចំផែនការលម្អិត និងច្បាស់លាស់", "វិន័យ និងការទទួលខុសត្រូវខ្ពស់បំផុត", "ភាពស្មោះត្រង់ និងទំនុកចិត្ត", "ការវិភាគទិន្នន័យជាក់ស្តែង"],
    strengthsEn: ["Systematic Precision & Organization", "Unmatched Reliability & Integrity", "Devotion to Quality Standards", "Fact-Based Analytical Rigor"],
    growthAreasKm: ["ពិបាកសម្របខ្លួននឹងការផ្លាស់ប្តូរភ្លាមៗ", "អាចមានភាពតឹងតែងជ្រុលចំពោះការអនុវត្តច្បាប់", "ស្ទាក់ស្ទើរក្នុងការសាកល្បងវិធីសាស្ត្រថ្មីដែលគ្មានទិន្នន័យបញ្ជាក់"],
    growthAreasEn: ["Resistance to sudden operational changes", "Inflexible adherence to formal procedures", "Skeptical of unproven conceptual ideas"],
    learningStyleKm: "ចូលចិត្តការរៀនដែលមានរចនាសម្ព័ន្ធមួយជំហានៗ ការណែនាំច្បាស់ និងទិន្នន័យជាក់ស្តែង។",
    learningStyleEn: "Excels in structured coursework with sequential steps, clear rubrics, and empirical data.",
    bestFieldsKm: ["គណនេយ្យ & សវនកម្ម", "វិស្វកម្មស៊ីវិល", "វិទ្យាសាស្ត្រកុំព្យូទ័រ"],
    bestFieldsEn: ["Accounting & Auditing", "Civil Engineering", "Computer Science"],
    careersKm: ["សវនករ & គណនេយ្យករ", "វិស្វករសំណង់ស៊ីវិល", "អ្នកគ្រប់គ្រងទិន្នន័យធនាគារ", "មន្ត្រីត្រួតពិនិត្យគុណភាព (QA)"],
    careersEn: ["Certified Public Accountant / Auditor", "Civil & Structural Engineer", "Banking Risk Analyst", "Software QA Engineer"],
    recommendedMajors: [
      {
        slug: "banking-finance",
        titleKm: "ធនាគារ ហិរញ្ញវត្ថុ & គណនេយ្យ",
        titleEn: "Banking, Finance & Accounting",
        reasonKm: "ទាមទារភាពសុក្រឹតនៃតួលេខ ការត្រួតពិនិត្យច្បាប់ហិរញ្ញវត្ថុ និងទំនុកចិត្តខ្ពស់។",
        reasonEn: "Rewards precision, regulatory compliance, and fiscal accountability.",
      },
      {
        slug: "civil-engineering",
        titleKm: "វិស្វកម្មសំណង់ស៊ីវិល",
        titleEn: "Civil Engineering & Structural Design",
        reasonKm: "ការគណនាបន្ទុកសំណង់ ស្តង់ដារសុវត្ថិភាព និងការអនុវត្តគម្រោងមួយជំហានៗ។",
        reasonEn: "Applies physics, safety standards, and rigorous sequential blueprints.",
      },
      {
        slug: "software-engineering",
        titleKm: "វិស្វកម្មសូហ្វវែរ & ប្រព័ន្ធទិន្នន័យ",
        titleEn: "Software Engineering & Database Architecture",
        reasonKm: "ការសរសេរកូដដែលមានរចនាសម្ព័ន្ធច្បាស់ និងការគ្រប់គ្រងមូលដ្ឋានទិន្នន័យ។",
        reasonEn: "Structured codebases, reliable database schemas, and unit testing.",
      },
    ],
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
    overviewKm: "ISFJ គឺជាមនុស្សដែលមានចិត្តសប្បុរស ស្មោះត្រង់ និងយកចិត្តទុកដាក់ខ្ពស់បំផុតចំពោះមនុស្សជុំវិញខ្លួន។ ពួកគេធ្វើការយ៉ាងស្ងៀមស្ងាត់នៅពីក្រោយឆាកដើម្បីធានាថាមនុស្សគ្រប់គ្នាមានសុវត្ថិភាពនិងភាពកក់ក្តៅ។",
    overviewEn: "ISFJs are compassionate, practical protectors known for patient devotion. They bring steady calm to their teams, quietly managing practical logistics while caring for people.",
    strengthsKm: ["ការយកចិត្តទុកដាក់លម្អិតលើមនុស្ស និងការងារ", "ភាពស្មោះត្រង់ និងការលះបង់ខ្ពស់", "ការគ្រប់គ្រងការងារជាក់ស្តែងប្រកបដោយរបៀបរៀបរយ", "ភាពអត់ធ្មត់"],
    strengthsEn: ["Meticulous Attention to Detail", "Steadfast Loyalty & Dedication", "Practical Support & Organization", "Patient Listening"],
    growthAreasKm: ["ពិបាកក្នុងការនិយាយបដិសេធ (Say No)", "ផ្ទុកទុក្ខកង្វល់ និងអារម្មណ៍តានតឹងម្នាក់ឯង", "ស្ទាក់ស្ទើរក្នុងការផ្លាស់ប្តូរទម្លាប់ចាស់"],
    growthAreasEn: ["Struggles to say 'no' to demands", "Internalizes stress and avoids expressing burden", "Hesitant toward change"],
    learningStyleKm: "រៀនបានល្អបំផុតក្នុងបរិយាកាសស្ងប់ស្ងាត់ មានការគាំទ្រ និងការអនុវត្តជាក់ស្តែងជួយអ្នកដទៃ។",
    learningStyleEn: "Thrives in supportive, quiet settings with clear practical examples and service-oriented applications.",
    bestFieldsKm: ["វេជ្ជសាស្ត្រ & ថែទាំ", "គរុកោសល្យ (បង្រៀន)", "បណ្ណារក្ស & រដ្ឋបាល"],
    bestFieldsEn: ["Nursing & Healthcare", "Education & Teaching", "Administration"],
    careersKm: ["គិលានុបដ្ឋាក & វេជ្ជបណ្ឌិត", "អ្នកគ្រប់គ្រងរដ្ឋបាលជាន់ខ្ពស់", "គ្រូបង្រៀន", "អ្នកប្រឹក្សាអតិថិជនធនាគារ"],
    careersEn: ["Nurse / Healthcare Professional", "Senior Office Administrator", "Educator", "Customer Relationship Specialist"],
    recommendedMajors: [
      {
        slug: "banking-finance",
        titleKm: "ធនាគារ និងសេវាអតិថិជនហិរញ្ញវត្ថុ",
        titleEn: "Banking & Customer Financial Advisory",
        reasonKm: "ការជួយអតិថិជនរៀបចំផែនការហិរញ្ញវត្ថុដោយយកចិត្តទុកដាក់ និងស្មោះត្រង់។",
        reasonEn: "Combines fiscal dependability with personalized customer advisory.",
      },
      {
        slug: "business-administration",
        titleKm: "គ្រប់គ្រងរដ្ឋបាល និងប្រតិបត្តិការ",
        titleEn: "Business Administration & Operations",
        reasonKm: "ការរៀបចំឯកសារ សម្របសម្រួលបុគ្គលិក និងថែរក្សាសណ្តាប់ធ្នាប់ការិយាល័យ។",
        reasonEn: "Manages logistical smoothness, office cohesion, and operational support.",
      },
      {
        slug: "law",
        titleKm: "នីតិសាស្ត្រ និងសិទ្ធិបុគ្គល",
        titleEn: "Law & Family Advocacy",
        reasonKm: "ការការពារសិទ្ធិ និងផលប្រយោជន៍ស្របច្បាប់ជូនពលរដ្ឋដោយយុត្តិធម៌។",
        reasonEn: "Protects individual rights and brings fairness to community disputes.",
      },
    ],
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
    overviewKm: "ESTJ គឺជាអ្នកដឹកនាំជាក់ស្តែងនិយមដែលពូកែរៀបចំរបៀបរៀបរយ។ ពួកគេប្រកាន់ខ្ជាប់នូវភាពស្មោះត្រង់ វិន័យម៉ឺងម៉ាត់ និងការគ្រប់គ្រងគម្រោងឱ្យចេញជាផ្លែផ្កាជាក់ស្តែង។ ពួកគេដឹកនាំដោយធ្វើជាគំរូ។",
    overviewEn: "ESTJs are pragmatic leaders who excel at mobilizing resources, streamlining operations, and holding teams to rigorous standards. They stand for order, hard work, and clear execution.",
    strengthsKm: ["ការរៀបចំផែនការ និងការគ្រប់គ្រងស្ថាប័ន", "វិន័យការងាររឹងមាំ និងភាពស្មោះត្រង់", "ការសម្រេចការងារទាន់ពេលវេលា និងតាមគោលដៅ", "ភាពជាអ្នកដឹកនាំជាក់ស្តែង"],
    strengthsEn: ["Operational Organization & Management", "Unwavering Work Ethic & Integrity", "On-Time Milestone Execution", "Practical Team Leadership"],
    growthAreasKm: ["អាចមានភាពរឹងរូសចំពោះវិធីសាស្ត្រផ្ទាល់ខ្លួន", "ពិបាកសម្របសម្រួលជាមួយគំនិតដែលមិនមានក្នុងបទបញ្ជា", "មិនសូវអត់ធ្មត់នឹងភាពមិនរៀបរយរបស់អ្នកដទៃ"],
    growthAreasEn: ["Inflexibility with non-traditional workflows", "Struggles to validate emotional considerations", "Can be overly critical of perceived disorder"],
    learningStyleKm: "កម្មវិធីសិក្សាមានរចនាសម្ព័ន្ធច្បាស់លាស់ កាលវិភាគម៉ត់ចត់ និងការគ្រប់គ្រងគម្រោងជាក់ស្តែង។",
    learningStyleEn: "Structured curricula, clear sequential milestones, and concrete project management.",
    bestFieldsKm: ["ការគ្រប់គ្រងគម្រោង & ធុរកិច្ច", "ធនាគារ និងហិរញ្ញវត្ថុ", "ខ្សែចង្វាក់ផ្គត់ផ្គង់ & វិស្វកម្ម"],
    bestFieldsEn: ["Project Management & Business", "Banking & Finance", "Supply Chain & Civil Engineering"],
    careersKm: ["នាយកគ្រប់គ្រងគម្រោងធំៗ", "នាយកសាខាធនាគារ", "វិស្វករគ្រប់គ្រងការដ្ឋានសំណង់", "នាយកប្រតិបត្តិការ (COO)"],
    careersEn: ["Executive Project Manager", "Commercial Bank Branch Director", "Construction Site Director", "Chief Operating Officer"],
    recommendedMajors: [
      {
        slug: "business-administration",
        titleKm: "គ្រប់គ្រងពាណិជ្ជកម្ម & ប្រតិបត្តិការ",
        titleEn: "Business Administration & Operations Management",
        reasonKm: "ការគ្រប់គ្រងស្ថាប័ន ធនធានមនុស្ស និងថវិកាឱ្យមានប្រសិទ្ធភាពអតិបរមា។",
        reasonEn: "Directly leverages executive talent for organizational leadership and budget control.",
      },
      {
        slug: "banking-finance",
        titleKm: "ធនាគារ និងហិរញ្ញវត្ថុ",
        titleEn: "Banking & Financial Management",
        reasonKm: "ការវិភាគហិរញ្ញវត្ថុ ឥណទាន និងការគ្រប់គ្រងហានិភ័យធនាគារ។",
        reasonEn: "Demands rigorous fiscal oversight, regulatory compliance, and risk control.",
      },
      {
        slug: "civil-engineering",
        titleKm: "វិស្វកម្មសំណង់ស៊ីវិល & គ្រប់គ្រងគម្រោង",
        titleEn: "Civil Engineering & Project Management",
        reasonKm: "ការដឹកនាំការដ្ឋានសំណង់ជាក់ស្តែង និងការធានាគុណភាពតាមកាលវិភាគ។",
        reasonEn: "Requires hands-on timeline execution and concrete engineering leadership.",
      },
    ],
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
    overviewKm: "ESFJ គឺជាមនុស្សដែលមានប្រជាប្រិយភាព និងរួសរាយរាក់ទាក់បំផុត។ ពួកគេយកចិត្តទុកដាក់ខ្ពស់លើសុខុមាលភាពរបស់មនុស្សគ្រប់រូប និងពូកែរៀបចំព្រឹត្តិការណ៍សង្គមឱ្យមានភាពកក់ក្តៅនិងសប្បាយរីករាយ។",
    overviewEn: "ESFJs are attentive, warm-hearted community builders. They harmonize social environments, coordinate hospitality, and ensure everyone feels welcomed and valued.",
    strengthsKm: ["ការកសាងទំនាក់ទំនងសង្គមដ៏កក់ក្តៅ", "ការយកចិត្តទុកដាក់លើសេចក្តីត្រូវការរបស់អ្នកដទៃ", "ភាពស្មោះត្រង់ និងការសហការល្អ", "ការគ្រប់គ្រងព្រឹត្តិការណ៍"],
    strengthsEn: ["Warm Social Interpersonal Dynamics", "Generous Attentiveness to Others", "Loyal Team Collaboration", "Event & Community Logistics"],
    growthAreasKm: ["ងាយរងសម្ពាធពីការវិនិច្ឆ័យរបស់អ្នកដទៃ", "ពិបាកនិយាយការពិតដែលនាំឱ្យប៉ះពាល់អារម្មណ៍", "អាចព្រួយបារម្ភជ្រុលអំពីឋានៈសង្គម"],
    growthAreasEn: ["Vulnerable to criticism and social disapproval", "Avoids difficult confrontations to keep superficial peace", "Overthinking social expectations"],
    learningStyleKm: "ចូលចិត្តការរៀនសហការជាក្រុម ការពិភាក្សាផ្ទាល់ និងការទទួលបានការលើកទឹកចិត្តជាប្រចាំ។",
    learningStyleEn: "Enjoys collaborative group projects, interactive classroom discussions, and positive reinforcement.",
    bestFieldsKm: ["បដិសណ្ឋារកិច្ច & ទេសចរណ៍", "គ្រប់គ្រងធនធានមនុស្ស", "គិលានុបដ្ឋាក & សុខភាព"],
    bestFieldsEn: ["Hospitality & Tourism", "Human Resources", "Nursing & Public Health"],
    careersKm: ["អ្នកគ្រប់គ្រងបដិសណ្ឋារកិច្ច & សណ្ឋាគារ", "អ្នកគ្រប់គ្រងទំនាក់ទំនងធនធានមនុស្ស", "អ្នករៀបចំព្រឹត្តិការណ៍សាជីវកម្ម", "អ្នកសម្របសម្រួលសហគមន៍"],
    careersEn: ["Hospitality & Resort Manager", "Human Resources Coordinator", "Corporate Events Director", "Community Relations Manager"],
    recommendedMajors: [
      {
        slug: "business-administration",
        titleKm: "គ្រប់គ្រងធនធានមនុស្ស & បដិសណ្ឋារកិច្ច",
        titleEn: "Business Administration & Hospitality",
        reasonKm: "ការថែរក្សាបុគ្គលិក និងការផ្តល់សេវាកម្មកម្រិតខ្ពស់ជូនអតិថិជន។",
        reasonEn: "Excels in people management, customer service excellence, and corporate hospitality.",
      },
      {
        slug: "digital-marketing",
        titleKm: "ទំនាក់ទំនងសាធារណៈ & ទីផ្សារ",
        titleEn: "Public Relations & Event Marketing",
        reasonKm: "ការរៀបចំយុទ្ធនាការទាក់ទាញមនុស្ស និងការផ្សព្វផ្សាយវិជ្ជមាន។",
        reasonEn: "Connects brands with communities through engaging events and campaigns.",
      },
      {
        slug: "international-relations",
        titleKm: "ទំនាក់ទំនងអន្តរជាតិ & កិច្ចការសង្គម",
        titleEn: "International Relations & Protocol",
        reasonKm: "ការសម្របសម្រួលពិធីការ និងការទទួលភ្ញៀវអន្តរជាតិ។",
        reasonEn: "Ideal for diplomatic protocol, delegate relations, and intercultural hospitality.",
      },
    ],
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
    overviewKm: "ISTP គឺជាអ្នកជំនាញបច្ចេកវិទ្យាផ្ទាល់ដៃដែលចូលចិត្តស្វែងយល់ពីរបៀបដែលម៉ាស៊ីន និងឧបករណ៍ដំណើរការ។ ពួកគេមានភាពស្ងប់ស្ងាត់ក្នុងគ្រាអាសន្ន និងពូកែដោះស្រាយបញ្ហាបច្ចេកទេសភ្លាមៗ។",
    overviewEn: "ISTPs are hands-on troubleshooters who dissect mechanics, software, and tools with fearless agility. Calm under crisis, they find practical, elegant solutions to tactile challenges.",
    strengthsKm: ["ការអនុវត្តបច្ចេកទេសផ្ទាល់ដៃយ៉ាងជំនាញ", "ភាពស្ងប់ស្ងាត់ និងការដោះស្រាយបញ្ហាបន្ទាន់", "ការគិតបែបវិស្វកម្មជាក់ស្តែង", "ភាពបត់បែនឆ្លើយតបរហ័ស"],
    strengthsEn: ["Mastery of Technical Tools & Hardware", "Crisis Composure & Troubleshooting", "Pragmatic Engineering Mindset", "Adaptable Agility"],
    growthAreasKm: ["ងាយធុញទ្រាន់នឹងការប្តេជ្ញាចិត្តរយៈពេលវែង", "មិនសូវចូលចិត្តច្បាប់ និងបទបញ្ជាតឹងរ៉ឹង", "ពិបាកបង្ហាញអារម្មណ៍ក្នុងទំនាក់ទំនងផ្ទាល់ខ្លួន"],
    growthAreasEn: ["Easily bored by long-term commitments", "Aversion to rigid bureaucratic protocols", "Can appear emotionally distant or detached"],
    learningStyleKm: "រៀនបានលឿនបំផុតតាមរយៈការពិសោធន៍ផ្ទាល់ដៃ ការរុះរើឧបករណ៍ និងការអនុវត្តក្នុងមន្ទីរពិសោធន៍។",
    learningStyleEn: "Learns fastest by doing, disassembling mechanics, lab experimentation, and tactile troubleshooting.",
    bestFieldsKm: ["វិស្វកម្មមេកានិក & អគ្គិសនី", "វិទ្យាសាស្ត្រកុំព្យូទ័រ & Hardware", "ស្ថាបត្យកម្ម"],
    bestFieldsEn: ["Mechanical & Electrical Engineering", "Computer Science & Hardware", "Architecture"],
    careersKm: ["វិស្វករសូហ្វវែរ & Hardware", "អ្នកជំនាញសន្តិសុខប្រព័ន្ធបច្ចេកវិទ្យា", "វិស្វករមេកានិក", "អ្នកវិភាគទិន្នន័យបច្ចេកទេស"],
    careersEn: ["Embedded Systems / DevOps Engineer", "Cybersecurity Specialist", "Mechanical & Robotics Engineer", "Technical Troubleshooter"],
    recommendedMajors: [
      {
        slug: "cybersecurity",
        titleKm: "សន្តិសុខតាមប្រព័ន្ធអ៊ីនធឺណិត (Cybersecurity)",
        titleEn: "Cybersecurity & Forensic Engineering",
        reasonKm: "ការរុករកចន្លោះប្រហោងប្រព័ន្ធ និងការកម្ចាត់មេរោគជាក់ស្តែង។",
        reasonEn: "Hands-on vulnerability probing, network forensics, and live incident response.",
      },
      {
        slug: "software-engineering",
        titleKm: "វិស្វកម្មសូហ្វវែរ & ប្រព័ន្ធកុំព្យូទ័រ",
        titleEn: "Software Engineering & Systems Programming",
        reasonKm: "ការសរសេរកូដគ្រប់គ្រងប្រព័ន្ធ Hardware និង Cloud Infrastructure។",
        reasonEn: "Building robust low-level tools, APIs, and automated infrastructure.",
      },
      {
        slug: "civil-engineering",
        titleKm: "វិស្វកម្មសំណង់ស៊ីវិល",
        titleEn: "Civil Engineering & Site Operations",
        reasonKm: "ការដោះស្រាយបញ្ហាបច្ចេកទេសសំណង់ជាក់ស្តែងនៅការដ្ឋានផ្ទាល់។",
        reasonEn: "Translates structural mechanics and heavy machinery into real projects.",
      },
    ],
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
    overviewKm: "ISFP គឺជាសិល្បករពិតប្រាកដដែលបង្ហាញពីអារម្មណ៍ និងទស្សនៈតាមរយៈការបង្កើតស្នាដៃ។ ពួកគេរស់នៅក្នុងបច្ចុប្បន្នភាព មានភាពរសើបនឹងសោភ័ណភាព និងចូលចិត្តស្វែងរកបទពិសោធន៍រស់រវើក។",
    overviewEn: "ISFPs are gentle artists and aesthetic explorers who express authentic emotion through creative crafts. Open-minded and spontaneous, they live intensely in the present moment.",
    strengthsKm: ["សោភ័ណភាពសិល្បៈ និងការរចនាទាក់ទាញ", "ការបើកចិត្តទូលាយ និងភាពបត់បែន", "ការយល់ចិត្ត និងភាពស្មោះត្រង់", "ការកត់សម្គាល់បរិយាកាសជុំវិញ"],
    strengthsEn: ["Refined Aesthetic & Visual Taste", "Spontaneous Adaptability", "Warm Empathic Authenticity", "Keen Sensory Environmental Awareness"],
    growthAreasKm: ["ពិបាកក្នុងការរៀបចំផែនការអនាគតយូរអង្វែង", "ងាយរងសម្ពាធពីការប្រកួតប្រជែងតឹងតែង", "ជៀសវាងការប្រឈមមុខដាក់គ្នា"],
    growthAreasEn: ["Aversion to long-term rigid plans", "High stress in hyper-competitive environments", "Conflict-avoidant nature"],
    learningStyleKm: "ចូលចិត្តការរៀនតាមរយៈរូបភាព សោភ័ណភាព និងការបង្កើតស្នាដៃជាក់ស្តែងដោយឯករាជ្យ។",
    learningStyleEn: "Thrives in visual, studio-based learning with freedom for personal creative expression.",
    bestFieldsKm: ["វិចិត្រសិល្បៈ & រចនា", "រចនាម៉ូដ & តុបតែង", "គំនូរជីវចល & ហ្គេម"],
    bestFieldsEn: ["Fine Arts & Design", "Fashion & Interior Design", "Animation & Game Art"],
    careersKm: ["អ្នករចនា UI/UX", "ស្ថាបត្យកររចនាលំហ", "អ្នកថតរូប & ផលិតវីដេអូ", "អ្នករចនាម៉ូដ"],
    careersEn: ["UI/UX Product Designer", "Interior & Spatial Architect", "Visual Multimedia Director", "Fashion & Brand Designer"],
    recommendedMajors: [
      {
        slug: "architecture",
        titleKm: "ស្ថាបត្យកម្ម និងរចនាមហាផ្ទៃ",
        titleEn: "Architecture & Interior Design",
        reasonKm: "ការរួមបញ្ចូលគ្នារវាងការរចនាសោភ័ណភាព និងការរស់នៅប្រកបដោយភាពកក់ក្តៅ។",
        reasonEn: "Fuses tactile material aesthetics with functional, evocative living spaces.",
      },
      {
        slug: "digital-marketing",
        titleKm: "ទីផ្សារឌីជីថល និងរចនាមេឌៀ",
        titleEn: "Digital Marketing & Creative Visual Media",
        reasonKm: "ការរចនារូបភាព វីដេអូ និងការបង្កើតមាតិកាដែលទាក់ទាញភ្នែក។",
        reasonEn: "Translates visual taste into compelling brand identity and digital media.",
      },
      {
        slug: "software-engineering",
        titleKm: "វិស្វកម្មសូហ្វវែរ (Frontend & UI)",
        titleEn: "Frontend Development & Creative Tech",
        reasonKm: "ការប្រែក្លាយគំនូរព្រាង UI ឱ្យទៅជាគេហទំព័រ និងកម្មវិធីទូរស័ព្ទស្រស់ស្អាត។",
        reasonEn: "Brings beautiful, responsive interactive interfaces to life in web and mobile apps.",
      },
    ],
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
    overviewKm: "ESTP គឺជាមនុស្សដែលពោរពេញដោយថាមពលសកម្មភាព។ ពួកគេមិនចូលចិត្តអង្គុយស្តាប់ទ្រឹស្តីយូរទេ តែចូលចិត្តចុះធ្វើផ្ទាល់ដៃ ឆ្លៀតឱកាស និងចរចាដោះស្រាយបញ្ហាជាក់ស្តែងនៅនឹងមុខ។",
    overviewEn: "ESTPs are vibrant action-oriented dynamos who thrive on real-time challenges. Perceptive and bold, they navigate fast-moving markets, negotiate deals, and produce results.",
    strengthsKm: ["ការឆ្លើយតបរហ័សចំពោះបញ្ហាបន្ទាន់", "ភាពក្លាហានក្នុងការប្រថុយប្រជែងធុរកិច្ច", "ការចរចា និងការបញ្ចុះបញ្ចូលដ៏មានឥទ្ធិពល", "ការសង្កេតបរិយាកាសជាក់ស្តែង"],
    strengthsEn: ["Lightning-Fast Crisis Reaction", "Calculated Commercial Risk-Taking", "Persuasive Negotiation", "Acute Real-Time Observation"],
    growthAreasKm: ["អាចមានភាពមិនអត់ធ្មត់នឹងទ្រឹស្តីអរូបី", "ងាយធ្វើការសម្រេចចិត្តប្រថុយប្រជែងហួសហេតុ", "មិនសូវចូលចិត្តច្បាប់ទម្លាប់តឹងរ៉ឹង"],
    growthAreasEn: ["Impatience with abstract theory", "Tendency toward excessive risk-taking", "Resistance to structured routines"],
    learningStyleKm: "រៀនបានល្អតាមរយៈសកម្មភាពរស់រវើក ការប្រកួតប្រជែង និងការអនុវត្តផ្ទាល់ក្នុងទីផ្សារ។",
    learningStyleEn: "Learns through fast-paced activities, real-world simulations, and competitive execution.",
    bestFieldsKm: ["សហគ្រិនភាព & អាជីវកម្ម", "ទីផ្សារ & ការលក់", "កីឡា & ការគ្រប់គ្រង"],
    bestFieldsEn: ["Entrepreneurship & Business", "Marketing & Sales", "Sports Management"],
    careersKm: ["សហគ្រិនស្ថាបនិកអាជីវកម្ម", "នាយកផ្នែកលក់យុទ្ធសាស្ត្រ", "អ្នកជួញដូរហិរញ្ញវត្ថុ (Financial Trader)", "អ្នកគ្រប់គ្រងការអភិវឌ្ឍន៍ធុរកិច្ច"],
    careersEn: ["Serial Entrepreneur", "Strategic Sales Director", "Capital Markets Trader", "Business Development Executive"],
    recommendedMajors: [
      {
        slug: "business-administration",
        titleKm: "គ្រប់គ្រងពាណិជ្ជកម្ម & សហគ្រិនភាព",
        titleEn: "Business Administration & Venture Management",
        reasonKm: "ការចាប់ផ្តើមអាជីវកម្ម ការចរចាពាណិជ្ជកម្ម និងការរកប្រាក់ចំណេញ។",
        reasonEn: "Master fast-paced startup creation, competitive strategy, and deal closing.",
      },
      {
        slug: "banking-finance",
        titleKm: "ធនាគារ ហិរញ្ញវត្ថុ & ការវិនិយោគ",
        titleEn: "Banking, Finance & Investment Markets",
        reasonKm: "ទីផ្សារទុន ការជួញដូរភាគហ៊ុន និងការវិភាគឱកាសវិនិយោគរហ័ស។",
        reasonEn: "Thrives in high-stakes trading floors and dynamic investment portfolios.",
      },
      {
        slug: "digital-marketing",
        titleKm: "ទីផ្សារឌីជីថល & ការលក់យុទ្ធសាស្ត្រ",
        titleEn: "Digital Marketing & Commercial Growth",
        reasonKm: "ការចាប់យកចំណាប់អារម្មណ៍អតិថិជន និងការជំរុញការលក់ភ្លាមៗ។",
        reasonEn: "Drives rapid customer acquisition, growth hacking, and high-impact campaigns.",
      },
    ],
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
    overviewKm: "ESFP គឺជាអ្នកបង្កើតភាពរីករាយពីកំណើត។ ពួកគេចូលចិត្តស្ថិតនៅកណ្តាលចំណាប់អារម្មណ៍ បង្កើតសំណើច និងចែករំលែកបទពិសោធន៍ល្អៗជាមួយមនុស្សគ្រប់គ្នា។ ពួកគេធ្វើឱ្យពិភពលោកមានភាពរស់រវើក។",
    overviewEn: "ESFPs are magnetic, spontaneous entertainers who illuminate any room. With unbridled zest for life, they bring people together through vibrant shared experiences.",
    strengthsKm: ["ការកម្សាន្ត និងការសម្តែងទាក់ទាញ", "ភាពរួសរាយរាក់ទាក់ និងមន្តស្នេហ៍សង្គម", "ការបង្កើតបរិយាកាសរីករាយ", "ការយល់ចិត្ត និងភាពកក់ក្តៅ"],
    strengthsEn: ["Charismatic Stage & Media Presence", "Warm Sociability & Magnetism", "Uplifting Atmosphere Creation", "Practical Generosity"],
    growthAreasKm: ["ងាយធុញទ្រាន់នឹងការវិភាគទិន្នន័យស្មុគស្មាញ", "ជៀសវាងទំនួលខុសត្រូវរដ្ឋបាលយូរអង្វែង", "ងាយធ្វើការចំណាយតាមអារម្មណ៍រំភើប"],
    growthAreasEn: ["Distaste for tedious paperwork and theory", "Avoids long-term administrative duties", "Impulsive emotional decision-making"],
    learningStyleKm: "ចូលចិត្តការរៀនបែបកម្សាន្ត ការសម្តែងតួ និងសកម្មភាពដែលមានការចូលរួមច្រើនពីមិត្តភក្តិ។",
    learningStyleEn: "Thrives in interactive, performance-based learning with vibrant peer engagement.",
    bestFieldsKm: ["សិល្បៈសម្តែង & តន្ត្រី", "ទំនាក់ទំនង & ប្រព័ន្ធផ្សព្វផ្សាយ", "បដិសណ្ឋារកិច្ច"],
    bestFieldsEn: ["Performing Arts & Music", "Media Communications", "Hospitality & Events"],
    careersKm: ["ពិធីករ & អ្នកបង្កើតមាតិកាវីដេអូ", "អ្នកគ្រប់គ្រងព្រឹត្តិការណ៍ និងកម្សាន្ត", "អ្នកទំនាក់ទំនងសាធារណៈ", "អ្នកគ្រប់គ្រងបដិសណ្ឋារកិច្ច"],
    careersEn: ["Media Host / Creator", "Entertainment & Event Producer", "Public Relations Specialist", "Hospitality Manager"],
    recommendedMajors: [
      {
        slug: "digital-marketing",
        titleKm: "ទីផ្សារឌីជីថល & ប្រព័ន្ធផ្សព្វផ្សាយកម្សាន្ត",
        titleEn: "Digital Marketing & Entertainment Media",
        reasonKm: "ការសម្តែង ការបង្កើតវីដេអូ និងការទាក់ទាញអ្នកទស្សនារាប់ម៉ឺននាក់។",
        reasonEn: "Shine on video platforms, live broadcasting, and social media storytelling.",
      },
      {
        slug: "business-administration",
        titleKm: "គ្រប់គ្រងបដិសណ្ឋារកិច្ច & ទេសចរណ៍",
        titleEn: "Hospitality, Tourism & Event Management",
        reasonKm: "ការរៀបចំកម្មវិធីកម្សាន្ត និងការធ្វើឱ្យភ្ញៀវទទួលបានបទពិសោធន៍មិនអាចបំភ្លេចបាន។",
        reasonEn: "Delivers unforgettable event and resort experiences with boundless energy.",
      },
      {
        slug: "international-relations",
        titleKm: "ទំនាក់ទំនងអន្តរជាតិ & ការទូតវប្បធម៌",
        titleEn: "International Communications & Cultural Protocol",
        reasonKm: "ការតភ្ជាប់ទំនាក់ទំនង និងការផ្សព្វផ្សាយសិល្បៈវប្បធម៌។",
        reasonEn: "Bridges global audiences through vibrant cultural outreach and festival promotion.",
      },
    ],
  },
};
