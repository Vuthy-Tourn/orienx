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
  strengthsKm?: string[];
  strengthsEn?: string[];
  learningStyleKm?: string;
  learningStyleEn?: string;
  bestFieldsKm?: string[];
  bestFieldsEn?: string[];
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
    strengthsKm: ["ការគិតយុទ្ធសាស្ត្រ", "ការវិភាគប្រព័ន្ធស្មុគស្មាញ", "ការតាំងចិត្តខ្ពស់"],
    strengthsEn: ["Strategic Planning", "Complex System Analysis", "High Determination"],
    learningStyleKm: "ចូលចិត្តការស្រាវជ្រាវឯករាជ្យ គំរូទ្រឹស្តីស៊ីជម្រៅ និងការរៀបចំផែនការអនាគត។",
    learningStyleEn: "Prefers autonomous research, deep theoretical frameworks, and strategic planning.",
    bestFieldsKm: ["វិទ្យាសាស្ត្រកុំព្យូទ័រ & AI", "ស្ថាបត្យកម្ម", "វិស្វកម្មប្រព័ន្ធ"],
    bestFieldsEn: ["Computer Science & AI", "Architecture", "Systems Engineering"],
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
    strengthsKm: ["ការគិតតក្កវិជ្ជា", "ភាពច្នៃប្រឌិតស្វែងយល់", "ការដោះស្រាយបញ្ហាគំនិត"],
    strengthsEn: ["Logical Thinking", "Intellectual Curiosity", "Conceptual Problem Solving"],
    learningStyleKm: "រៀនបានល្អតាមរយៈការពិសោធន៍ គំនិតអរូបី និងការស្រាវជ្រាវដោយសេរីភាព។",
    learningStyleEn: "Learns best through experimentation, abstract ideas, and open-ended research.",
    bestFieldsKm: ["វិទ្យាសាស្ត្រទិន្នន័យ & AI", "រូបវិទ្យា & គណិតវិទ្យា", "ទស្សនវិជ្ជា"],
    bestFieldsEn: ["Data Science & AI", "Physics & Mathematics", "Philosophy"],
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
    strengthsKm: ["ភាពជាអ្នកដឹកនាំ", "ការសម្រេចចិត្តម៉ឺងម៉ាត់", "ការគ្រប់គ្រងស្ថាប័ន"],
    strengthsEn: ["Decisive Leadership", "Strategic Organization", "Institutional Execution"],
    learningStyleKm: "រៀនតាមរយៈការអនុវត្តផ្ទាល់ បញ្ហាប្រឈមធំៗ និងការដឹកនាំគម្រោងជាក់ស្តែង។",
    learningStyleEn: "Learns through hands-on leadership challenges, executive case studies, and team direction.",
    bestFieldsKm: ["គ្រប់គ្រងពាណិជ្ជកម្ម", "សេដ្ឋកិច្ច & ហិរញ្ញវត្ថុ", "នីតិសាស្ត្រ"],
    bestFieldsEn: ["Business Administration", "Economics & Finance", "Law"],
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
    strengthsKm: ["ការជជែកដេញដោល", "ការបង្កើតគំនិតថ្មីៗ", "ការសម្របសម្រួលបត់បែន"],
    strengthsEn: ["Vigorous Debate", "Ideation & Innovation", "Versatile Adaptability"],
    learningStyleKm: "ចូលចិត្តបរិយាកាសសិក្សាដែលមានការពិភាក្សាផ្លាស់ប្តូរ និងការបង្កើតដំណោះស្រាយមិនធ្លាប់មាន។",
    learningStyleEn: "Thrives in brainstorming forums, debates, and rapid multidisciplinary problem-solving.",
    bestFieldsKm: ["សហគ្រិនភាព & នវានុវត្តន៍", "ច្បាប់ & តស៊ូមតិ", "ទីផ្សារយុទ្ធសាស្ត្រ"],
    bestFieldsEn: ["Entrepreneurship & Innovation", "Law & Advocacy", "Strategic Marketing"],
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
    strengthsKm: ["ការយល់ចិត្តមនុស្ស", "ចក្ខុវិស័យយូរអង្វែង", "ការប្តេជ្ញាចិត្តលើគុណធម៌"],
    strengthsEn: ["Deep Empathy", "Long-Range Vision", "Principled Dedication"],
    learningStyleKm: "ចូលចិត្តការសិក្សាដែលមានគោលបំណងច្បាស់លាស់សម្រាប់សង្គម និងការឆ្លុះបញ្ចាំងគំនិតស្ងប់ស្ងាត់។",
    learningStyleEn: "Values purposeful, mission-driven education with quiet reflective depth.",
    bestFieldsKm: ["ចិត្តវិទ្យា", "ទំនាក់ទំនងអន្តរជាតិ", "ការអប់រំ"],
    bestFieldsEn: ["Psychology", "International Relations", "Education"],
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
    strengthsKm: ["ការច្នៃប្រឌិតសិល្បៈ", "ការយល់ចិត្តអ្នកដទៃ", "ភាពស្មោះត្រង់លើតម្លៃជីវិត"],
    strengthsEn: ["Creative Writing & Arts", "Profound Empathy", "Authentic Value Alignment"],
    learningStyleKm: "រៀនបានល្អនៅពេលមានសេរីភាពបញ្ចេញមតិផ្ទាល់ខ្លួន តាមរយៈការសរសេរ និងសិល្បៈ។",
    learningStyleEn: "Excels in creative, flexible learning environments through storytelling and artistic expression.",
    bestFieldsKm: ["អក្សរសាស្ត្រ & និពន្ធ", "រចនាក្រាហ្វិក & មេឌៀ", "ការងារសង្គម"],
    bestFieldsEn: ["Literature & Writing", "Graphic Design & Digital Media", "Social Work"],
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
    strengthsKm: ["ការលើកទឹកចិត្តក្រុម", "ការទំនាក់ទំនងសាធារណៈ", "ការកសាងសាមគ្គីភាព"],
    strengthsEn: ["Team Empowerment", "Public Communication", "Community Building"],
    learningStyleKm: "ចូលចិត្តការរៀនជាក្រុម កិច្ចការសហការ និងការចែករំលែកបទពិសោធន៍ផ្ទាល់មាត់។",
    learningStyleEn: "Thrives in participatory seminars, team collaborations, and peer-to-peer mentoring.",
    bestFieldsKm: ["ទំនាក់ទំនងសាធារណៈ & PR", "ការគ្រប់គ្រងធនធានមនុស្ស", "ការទូតអន្តរជាតិ"],
    bestFieldsEn: ["Public Relations", "Human Resource Management", "Diplomacy"],
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
    strengthsKm: ["ការបង្កើតគំនិតស្រស់ស្រាយ", "ភាពរួសរាយទាក់ទាញ", "ការលើកទឹកចិត្ត"],
    strengthsEn: ["Boundless Ideation", "Magnetic Sociability", "Inspirational Energy"],
    learningStyleKm: "រៀនតាមរយៈការពិភាក្សាច្នៃប្រឌិត ការស្រាវជ្រាវបែបស្វែងរក និងការបង្កើតគម្រោងថ្មីៗ។",
    learningStyleEn: "Learns best through dynamic workshops, visual exploration, and creative storytelling.",
    bestFieldsKm: ["សារព័ត៌មាន & មេឌៀ", "ទីផ្សារច្នៃប្រឌិត", "ការគ្រប់គ្រងព្រឹត្តិការណ៍"],
    bestFieldsEn: ["Journalism & Media", "Creative Marketing", "Event Management"],
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
    strengthsKm: ["ការរៀបចំផែនការលម្អិត", "ការគោរពវិន័យ", "ភាពស្មោះត្រង់ & ទំនុកចិត្ត"],
    strengthsEn: ["Systematic Precision", "Dependable Discipline", "Integrity & Reliability"],
    learningStyleKm: "ចូលចិត្តការរៀនដែលមានរចនាសម្ព័ន្ធមួយជំហានៗ ការណែនាំច្បាស់ និងទិន្នន័យជាក់ស្តែង។",
    learningStyleEn: "Excels in structured coursework with sequential steps, clear rubrics, and empirical data.",
    bestFieldsKm: ["គណនេយ្យ & សវនកម្ម", "វិស្វកម្មស៊ីវិល", "វិទ្យាសាស្ត្រកុំព្យូទ័រ"],
    bestFieldsEn: ["Accounting & Auditing", "Civil Engineering", "Computer Science"],
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
    strengthsKm: ["ការយកចិត្តទុកដាក់លម្អិត", "ការគាំទ្រសមាជិក", "ភាពអត់ធ្មត់ខ្ពស់"],
    strengthsEn: ["Meticulous Care", "Patient Support", "Loyal Reliability"],
    learningStyleKm: "រៀនបានល្អបំផុតក្នុងបរិយាកាសស្ងប់ស្ងាត់ មានការគាំទ្រ និងការអនុវត្តជាក់ស្តែងជួយអ្នកដទៃ។",
    learningStyleEn: "Thrives in supportive, quiet settings with clear practical examples and service-oriented applications.",
    bestFieldsKm: ["វេជ្ជសាស្ត្រ & ថែទាំ", "គរុកោសល្យ (បង្រៀន)", "បណ្ណារក្ស & រដ្ឋបាល"],
    bestFieldsEn: ["Nursing & Healthcare", "Education & Teaching", "Administration"],
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
    strengthsKm: ["ការរៀបចំផែនការ និងការគ្រប់គ្រង", "វិន័យការងាររឹងមាំ", "ការសម្រេចការងារទាន់ពេលវេលា"],
    strengthsEn: ["Strategic Organization", "Strong Work Ethic", "Decisive Execution"],
    learningStyleKm: "កម្មវិធីសិក្សាមានរចនាសម្ព័ន្ធច្បាស់លាស់ កាលវិភាគម៉ត់ចត់ និងការគ្រប់គ្រងគម្រោងជាក់ស្តែង។",
    learningStyleEn: "Structured curricula, clear sequential milestones, and concrete project management.",
    bestFieldsKm: ["ការគ្រប់គ្រងគម្រោង & ធុរកិច្ច", "ធនាគារ និងហិរញ្ញវត្ថុ", "ខ្សែចង្វាក់ផ្គត់ផ្គង់ & វិស្វកម្ម"],
    bestFieldsEn: ["Project Management & Business", "Banking & Finance", "Supply Chain & Civil Engineering"],
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
    strengthsKm: ["ការកសាងទំនាក់ទំនងសង្គម", "ការយកចិត្តទុកដាក់", "ភាពជាដៃគូសហការ"],
    strengthsEn: ["Interpersonal Warmth", "Organizational Harmony", "Community Care"],
    learningStyleKm: "ចូលចិត្តការរៀនសហការជាក្រុម ការពិភាក្សាផ្ទាល់ និងការទទួលបានការលើកទឹកចិត្តជាប្រចាំ។",
    learningStyleEn: "Enjoys collaborative group projects, interactive classroom discussions, and positive reinforcement.",
    bestFieldsKm: ["បដិសណ្ឋារកិច្ច & ទេសចរណ៍", "គ្រប់គ្រងធនធានមនុស្ស", "គិលានុបដ្ឋាក & សុខភាព"],
    bestFieldsEn: ["Hospitality & Tourism", "Human Resources", "Nursing & Public Health"],
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
    strengthsKm: ["ការអនុវត្តបច្ចេកទេសផ្ទាល់ដៃ", "ការដោះស្រាយបញ្ហាបន្ទាន់", "ការគិតបែបវិស្វកម្ម"],
    strengthsEn: ["Hands-On Mastery", "Crisis Problem Solving", "Mechanical Aptitude"],
    learningStyleKm: "រៀនបានលឿនបំផុតតាមរយៈការពិសោធន៍ផ្ទាល់ដៃ ការរុះរើឧបករណ៍ និងការអនុវត្តក្នុងមន្ទីរពិសោធន៍។",
    learningStyleEn: "Learns fastest by doing, disassembling mechanics, lab experimentation, and tactile troubleshooting.",
    bestFieldsKm: ["វិស្វកម្មមេកានិក & អគ្គិសនី", "វិទ្យាសាស្ត្រកុំព្យូទ័រ & Hardware", "ស្ថាបត្យកម្ម"],
    bestFieldsEn: ["Mechanical & Electrical Engineering", "Computer Science & Hardware", "Architecture"],
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
    strengthsKm: ["សោភ័ណភាពសិល្បៈ", "ការបើកចិត្តទូលាយ", "ភាពរសើបនឹងបរិយាកាស"],
    strengthsEn: ["Aesthetic Sensitivity", "Open-Minded Flexibility", "Artistic Authenticity"],
    learningStyleKm: "ចូលចិត្តការរៀនតាមរយៈរូបភាព សោភ័ណភាព និងការបង្កើតស្នាដៃជាក់ស្តែងដោយឯករាជ្យ។",
    learningStyleEn: "Thrives in visual, studio-based learning with freedom for personal creative expression.",
    bestFieldsKm: ["វិចិត្រសិល្បៈ & រចនា", "រចនាម៉ូដ & តុបតែង", "គំនូរជីវចល & ហ្គេម"],
    bestFieldsEn: ["Fine Arts & Design", "Fashion & Interior Design", "Animation & Game Art"],
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
    strengthsKm: ["ការឆ្លើយតបរហ័ស", "ភាពក្លាហានប្រថុយប្រជែង", "ការចរចា និងបញ្ចុះបញ្ចូល"],
    strengthsEn: ["Real-Time Reaction", "Calculated Risk-Taking", "Persuasive Negotiation"],
    learningStyleKm: "រៀនបានល្អតាមរយៈសកម្មភាពរស់រវើក ការប្រកួតប្រជែង និងការអនុវត្តផ្ទាល់ក្នុងទីផ្សារ។",
    learningStyleEn: "Learns through fast-paced activities, real-world simulations, and competitive execution.",
    bestFieldsKm: ["សហគ្រិនភាព & អាជីវកម្ម", "ទីផ្សារ & ការលក់", "កីឡា & ការគ្រប់គ្រង"],
    bestFieldsEn: ["Entrepreneurship & Business", "Marketing & Sales", "Sports Management"],
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
    strengthsKm: ["ការកម្សាន្ត និងសម្តែង", "ការទាក់ទាញចំណាប់អារម្មណ៍", "ភាពរួសរាយរាក់ទាក់"],
    strengthsEn: ["Engaging Performance", "Charismatic Presence", "Warm Social Agility"],
    learningStyleKm: "ចូលចិត្តការរៀនបែបកម្សាន្ត ការសម្តែងតួ និងសកម្មភាពដែលមានការចូលរួមច្រើនពីមិត្តភក្តិ។",
    learningStyleEn: "Thrives in interactive, performance-based learning with vibrant peer engagement.",
    bestFieldsKm: ["សិល្បៈសម្តែង & តន្ត្រី", "ទំនាក់ទំនង & ប្រព័ន្ធផ្សព្វផ្សាយ", "បដិសណ្ឋារកិច្ច"],
    bestFieldsEn: ["Performing Arts & Music", "Media Communications", "Hospitality & Events"],
  },
};

