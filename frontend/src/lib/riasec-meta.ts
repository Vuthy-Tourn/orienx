import React from "react";
import {
  Wrench,
  Search,
  Palette,
  Users,
  TrendingUp,
  FileText,
  LucideIcon,
} from "lucide-react";

export interface RiasecDimensionMeta {
  code: string;
  letter: string;
  nameEn: string;
  nameKm: string;
  shortNameEn: string;
  shortNameKm: string;
  roleEn: string;
  roleKm: string;
  color: string;
  gradient: string;
  lightBg: string;
  borderClass: string;
  badgeBg: string;
  icon: LucideIcon;
  descEn: string;
  descKm: string;
  keyActivities: { en: string; km: string }[];
  workEnvironment: { en: string; km: string };
  sampleCareers: { en: string; km: string }[];
  sampleMajors: { nameEn: string; nameKm: string; slug: string }[];
  strengths: { en: string; km: string }[];
  sampleQuestions: { en: string; km: string }[];
}

export const RIASEC_DIMENSIONS: Record<string, RiasecDimensionMeta> = {
  R: {
    code: "R",
    letter: "Realistic",
    nameEn: "Realistic (Hands-on & Technical)",
    nameKm: "អនុវត្តជាក់ស្តែង & វិស្វកម្ម (Realistic)",
    shortNameEn: "Realistic",
    shortNameKm: "ជាក់ស្តែង & វិស្វកម្ម",
    roleEn: "The Practical Builder & Hardware Specialist",
    roleKm: "អ្នកអនុវត្តផ្ទាល់ដៃ វិស្វកររូបវន្ត និងបច្ចេកវិទ្យា",
    color: "#0284C7", // Sky/Blue
    gradient: "from-sky-500 to-blue-600",
    lightBg: "bg-sky-50",
    borderClass: "border-sky-200",
    badgeBg: "bg-sky-50 text-sky-800 border-sky-200",
    icon: Wrench,
    descEn: "Enjoys practical, hands-on work with tools, machinery, electronics, and physical systems.",
    descKm: "ចូលចិត្តធ្វើការជាមួយឧបករណ៍ គ្រឿងម៉ាស៊ីន សៀគ្វីអេឡិចត្រូនិក និងការដោះស្រាយបញ្ហាបច្ចេកទេសជាក់ស្តែង។",
    keyActivities: [
      { en: "Operating technical hardware & robotic tools", km: "ការបញ្ជា និងតម្លើងគ្រឿងយន្ត ឬផ្នែករឹងកុំព្យូទ័រ" },
      { en: "Building & repairing physical mechanisms", km: "ការតម្លើង និងជួសជុលឧបករណ៍បច្ចេកទេស" },
      { en: "Field engineering & tangible problem solving", km: "ការដោះស្រាយបញ្ហានៅការដ្ឋានផ្ទាល់" },
    ],
    workEnvironment: {
      en: "Laboratories, technical workshops, tech campuses, outdoor fields, and engineering sites.",
      km: "បន្ទប់ពិសោធន៍ រោងជាងវិស្វកម្ម ការដ្ឋានបច្ចេកទេស ឬបរិស្ថានដែលធ្វើការលើវត្ថុរូបវន្តពិតៗ។",
    },
    sampleCareers: [
      { en: "Software & Hardware Engineer", km: "វិស្វករផ្នែករឹង & ប្រព័ន្ធសូហ្វវែរ" },
      { en: "Civil & Structural Engineer", km: "វិស្វករសំណង់ស៊ីវិល & ហេដ្ឋារចនាសម្ព័ន្ធ" },
      { en: "Robotics & Automation Specialist", km: "អ្នកជំនាញផ្នែករ៉ូបូត និងស្វ័យប្រវត្តិកម្ម" },
      { en: "Network Infrastructure Architect", km: "ស្ថាបត្យករហេដ្ឋារចនាសម្ព័ន្ធបណ្តាញ" },
    ],
    sampleMajors: [
      { nameEn: "Computer Engineering & Robotics", nameKm: "វិស្វកម្មកុំព្យូទ័រ និងរ៉ូបូត", slug: "computer-engineering" },
      { nameEn: "Civil Engineering", nameKm: "វិស្វកម្មសំណង់ស៊ីវិល", slug: "civil-engineering" },
      { nameEn: "Electrical & Telecommunications", nameKm: "វិស្វកម្មអគ្គិសនី និងទូរគមនាគមន៍", slug: "electrical-engineering" },
    ],
    strengths: [
      { en: "Spatial Reasoning", km: "ការយល់ដឹងអំពីលំហ និងប្លង់" },
      { en: "Hardware Diagnostics", km: "ការដោះស្រាយបញ្ហាឧបករណ៍បច្ចេកទេស" },
      { en: "Tangible Execution", km: "ភាពរហ័សរហួនក្នុងការអនុវត្តផ្ទាល់" },
    ],
    sampleQuestions: [
      { en: "I enjoy assembling electronic devices or fixing mechanical components.", km: "ខ្ញុំចូលចិត្តតម្លើងគ្រឿងអេឡិចត្រូនិក ឬជួសជុលឧបករណ៍មេកានិច។" },
      { en: "I prefer working on outdoor projects over sitting at a desk all day.", km: "ខ្ញុំចូលចិត្តធ្វើការលើគម្រោងខាងក្រៅជាជាងអង្គុយមុខកុំព្យូទ័រពេញមួយថ្ងៃ។" },
    ],
  },
  I: {
    code: "I",
    letter: "Investigative",
    nameEn: "Investigative (Analytical & Scientific)",
    nameKm: "ស្រាវជ្រាវ & វិភាគទិន្នន័យ (Investigative)",
    shortNameEn: "Investigative",
    shortNameKm: "ស្រាវជ្រាវ & វិភាគ",
    roleEn: "The Deep Thinker & Analytical Researcher",
    roleKm: "អ្នកស្រាវជ្រាវវិទ្យាសាស្ត្រ និងអ្នកវិភាគបញ្ញាសិប្បនិម្មិត",
    color: "#7C3AED", // Violet/Purple
    gradient: "from-violet-500 to-purple-600",
    lightBg: "bg-purple-50",
    borderClass: "border-purple-200",
    badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
    icon: Search,
    descEn: "Enjoys intellectual inquiry, scientific exploration, algorithmic thinking, and analyzing data patterns.",
    descKm: "ចូលចិត្តការស្រាវជ្រាវ វិភាគទិន្នន័យ ក្បួនដោះស្រាយកុំព្យូទ័រ វិទ្យាសាស្ត្រ និងការដោះស្រាយបញ្ហាស្មុគស្មាញ។",
    keyActivities: [
      { en: "Developing AI algorithms & math models", km: "ការអភិវឌ្ឍក្បួនដោះស្រាយ AI និងគំរូគណិតវិទ្យា" },
      { en: "Investigating scientific data patterns", km: "ការស្រាវជ្រាវទិន្នន័យស៊ីជម្រៅដើម្បីស្វែងរកលំនាំ" },
      { en: "Hypothesis testing & root cause analysis", km: "ការធ្វើតេស្តសម្មតិកម្ម និងវិភាគរកឫសគល់បញ្ហា" },
    ],
    workEnvironment: {
      en: "R&D research centers, data tech labs, universities, and focused intellectual hubs.",
      km: "មជ្ឈមណ្ឌលស្រាវជ្រាវ R&D មន្ទីរពិសោធន៍ទិន្នន័យ និងស្ថាប័នសិក្សាស្រាវជ្រាវកម្រិតខ្ពស់។",
    },
    sampleCareers: [
      { en: "AI & Machine Learning Scientist", km: "អ្នកវិទ្យាសាស្ត្របញ្ញាសិប្បនិម្មិត (AI)" },
      { en: "Data Scientist & Analytics Architect", km: "អ្នកវិភាគ និងវិទ្យាសាស្ត្រទិន្នន័យ" },
      { en: "Cybersecurity Threat Investigator", km: "អ្នកស្រាវជ្រាវសន្តិសុខសាយប័រ" },
      { en: "Biomedical & Life Sciences Researcher", km: "អ្នកស្រាវជ្រាវជីវវិទ្យាសាស្ត្រ" },
    ],
    sampleMajors: [
      { nameEn: "Computer Science & AI", nameKm: "វិទ្យាសាស្ត្រកុំព្យូទ័រ និង AI", slug: "software-engineering" },
      { nameEn: "Data Science & Statistics", nameKm: "វិទ្យាសាស្ត្រទិន្នន័យ និងស្ថិតិ", slug: "data-science-ai" },
      { nameEn: "Cybersecurity & Info Security", nameKm: "សន្តិសុខសាយប័រ និងព័ត៌មាន", slug: "cybersecurity" },
    ],
    strengths: [
      { en: "Algorithmic Logic", km: "តក្កវិជ្ជាក្បួនដោះស្រាយ" },
      { en: "Empirical Modeling", km: "ការបង្កើតគំរូទិន្នន័យវិទ្យាសាស្ត្រ" },
      { en: "Critical Decomposition", km: "ការបំបែកបញ្ហាស្មុគស្មាញ" },
    ],
    sampleQuestions: [
      { en: "I enjoy analyzing data to identify underlying patterns and solve puzzles.", km: "ខ្ញុំចូលចិត្តវិភាគទិន្នន័យដើម្បីស្វែងរកលំនាំ និងដោះស្រាយចំណោទស្មុគស្មាញ។" },
      { en: "I find deep satisfaction in writing code or studying mathematical models.", km: "ខ្ញុំមានការពេញចិត្តខ្លាំងពេលសរសេរកូដ ឬសិក្សាគំរូគណិតវិទ្យា។" },
    ],
  },
  A: {
    code: "A",
    letter: "Artistic",
    nameEn: "Artistic (Creative & Expressive)",
    nameKm: "សិល្បៈ & ការច្នៃប្រឌិត (Artistic)",
    shortNameEn: "Artistic",
    shortNameKm: "សិល្បៈ & ច្នៃប្រឌិត",
    roleEn: "The Creative Innovator & Visual Architect",
    roleKm: "អ្នករចនាច្នៃប្រឌិត និងស្ថាបត្យករគំនិតសោភ័ណភាព",
    color: "#E11D48", // Rose/Pink
    gradient: "from-rose-500 to-pink-600",
    lightBg: "bg-rose-50",
    borderClass: "border-rose-200",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
    icon: Palette,
    descEn: "Enjoys self-expression, UI/UX design, visual storytelling, multimedia, and unstructured innovation.",
    descKm: "ចូលចិត្តការបញ្ចេញគំនិតច្នៃប្រឌិត ការរចនា UI/UX ប្រព័ន្ធផ្សព្វផ្សាយឌីជីថល និងសិល្បៈគំហើញ។",
    keyActivities: [
      { en: "Designing digital user interfaces & products", km: "ការរចនាទម្រង់កម្មវិធី UI/UX និងផលិតផលឌីជីថល" },
      { en: "Visual storytelling & multimedia content", km: "ការនិទានរឿងតាមរយៈរូបភាព វីដេអូ និងមេឌា" },
      { en: "Brand identity architecture & aesthetics", km: "ការរៀបចំអត្តសញ្ញាណម៉ាក និងសោភ័ណភាព" },
    ],
    workEnvironment: {
      en: "Design studios, creative product teams, advertising agencies, and innovative labs.",
      km: "ស្ទូឌីយោរចនា ក្រុមផលិតផលច្នៃប្រឌិត ភ្នាក់ងារផ្សាយពាណិជ្ជកម្ម និងបន្ទប់ពិសោធន៍គំនិតថ្មី។",
    },
    sampleCareers: [
      { en: "Lead UI/UX Product Designer", km: "ប្រធានអ្នករចនាផលិតផល UI/UX" },
      { en: "Creative Director & Brand Architect", km: "នាយកច្នៃប្រឌិត និងរចនាម៉ាកសញ្ញា" },
      { en: "Motion Graphics & 3D Artist", km: "សិល្បករចលនា 3D និង Motion Graphics" },
      { en: "Digital Content Producer", km: "អ្នកផលិតមាតិកាឌីជីថលកម្រិតខ្ពស់" },
    ],
    sampleMajors: [
      { nameEn: "UI/UX & Digital Product Design", nameKm: "ការរចនាផលិតផល UI/UX", slug: "ui-ux-design" },
      { nameEn: "Digital Media & Animation", nameKm: "ឌីជីថលមេឌា និងគំនូរជីវចល", slug: "digital-media-design" },
      { nameEn: "Architecture & Spatial Design", nameKm: "ស្ថាបត្យកម្ម និងការរចនាលំហ", slug: "architecture" },
    ],
    strengths: [
      { en: "Visual Empathy", km: "ការយល់ចិត្តអ្នកប្រើតាមរយៈសោភ័ណភាព" },
      { en: "Original Ideation", km: "ការបង្កើតគំនិតច្នៃប្រឌិតដើមថ្មីៗ" },
      { en: "Aesthetic Direction", km: "ការដឹកនាំសិល្បៈ និងរូបភាព" },
    ],
    sampleQuestions: [
      { en: "I love designing visually stunning interfaces, graphics, or spaces.", km: "ខ្ញុំចូលចិត្តរចនាទម្រង់បង្ហាញរូបភាព ក្រាហ្វិក ឬលំហដែលមានសោភ័ណភាព។" },
      { en: "I prefer flexible workflows where I can innovate over rigid rules.", km: "ខ្ញុំចូលចិត្តការងារដែលអាចបង្កើតថ្មីជាជាងធ្វើតាមច្បាប់តឹងរ៉ឹង។" },
    ],
  },
  S: {
    code: "S",
    letter: "Social",
    nameEn: "Social (Collaborative & Helping)",
    nameKm: "សង្គម & ទំនាក់ទំនង (Social)",
    shortNameEn: "Social",
    shortNameKm: "សង្គម & ទំនាក់ទំនង",
    roleEn: "The Empathetic Guide & People Catalyst",
    roleKm: "អ្នកជួយសង្គម អ្នកបង្រៀន និងអ្នកអភិវឌ្ឍមនុស្ស",
    color: "#059669", // Emerald/Green
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50",
    borderClass: "border-emerald-200",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: Users,
    descEn: "Enjoys teaching, communicating, counseling, mentoring others, and building community impact.",
    descKm: "ចូលចិត្តជួយអ្នកដទៃ ការបង្រៀន ការប្រឹក្សាយោបល់ និងការកសាងទំនាក់ទំនងសង្គមរឹងមាំ។",
    keyActivities: [
      { en: "Mentoring, teaching & sharing knowledge", km: "ការបង្រៀន ការណែនាំ និងការផ្ទេរចំណេះដឹង" },
      { en: "Psychological counseling & personal growth", km: "ការប្រឹក្សាយោបល់ផ្លូវចិត្ត និងអភិវឌ្ឍបុគ្គល" },
      { en: "Community organizing & public outreach", km: "ការរៀបចំសកម្មភាពសង្គម និងកិច្ចការមនុស្សធម៌" },
    ],
    workEnvironment: {
      en: "Schools, universities, health centers, NGOs, and people-first collaborative teams.",
      km: "សាលារៀន សាកលវិទ្យាល័យ អង្គការសង្គម មជ្ឈមណ្ឌលប្រឹក្សា និងស្ថាប័នផ្តោតលើសុខុមាលភាពមនុស្ស។",
    },
    sampleCareers: [
      { en: "Academic & Career Counselor", km: "អ្នកប្រឹក្សាយោបល់ការសិក្សា និងអាជីព" },
      { en: "People & Culture (HR) Leader", km: "ប្រធានធនធានមនុស្ស និងវប្បធម៌ស្ថាប័ន" },
      { en: "Clinical Psychologist & Therapist", km: "ចិត្តវិទូគ្លីនិក និងអ្នកព្យាបាលផ្លូវចិត្ត" },
      { en: "Higher Education Lecturer", km: "សាស្ត្រាចារ្យឧត្តមសិក្សា និងអ្នកស្រាវជ្រាវ" },
    ],
    sampleMajors: [
      { nameEn: "Psychology & Behavioral Science", nameKm: "ចិត្តវិទ្យា និងវិទ្យាសាស្ត្រឥរិយាបថ", slug: "psychology" },
      { nameEn: "Education Leadership & Pedagogy", nameKm: "ភាពជាអ្នកដឹកនាំអប់រំ និងគរុកោសល្យ", slug: "education" },
      { nameEn: "International Relations & Diplomacy", nameKm: "ទំនាក់ទំនងអន្តរជាតិ និងការទូត", slug: "international-relations" },
    ],
    strengths: [
      { en: "Active Empathy", km: "ការស្តាប់ និងយល់ចិត្តស៊ីជម្រៅ" },
      { en: "Pedagogical Clarity", km: "ភាពប៉ិនប្រសប់ក្នុងការបង្រៀន" },
      { en: "Relationship Building", km: "ការកសាងទំនុកចិត្ត និងទំនាក់ទំនង" },
    ],
    sampleQuestions: [
      { en: "I feel energized when helping someone overcome personal or academic challenges.", km: "ខ្ញុំមានកម្លាំងចិត្តខ្លាំងពេលបានជួយអ្នកដទៃឱ្យឆ្លងផុតបញ្ហាលំបាក។" },
      { en: "I communicate ideas patiently and enjoy mentoring younger students.", km: "ខ្ញុំពូកែពន្យល់ និងចូលចិត្តណែនាំប្អូនៗជំនាន់ក្រោយ។" },
    ],
  },
  E: {
    code: "E",
    letter: "Enterprising",
    nameEn: "Enterprising (Leadership & Persuasion)",
    nameKm: "សហគ្រិន & ភាពជាអ្នកដឹកនាំ (Enterprising)",
    shortNameEn: "Enterprising",
    shortNameKm: "សហគ្រិន & ដឹកនាំ",
    roleEn: "The Strategic Leader & Venture Founder",
    roleKm: "អ្នកដឹកនាំយុទ្ធសាស្ត្រ ស្ថាបនិកធុរកិច្ច និងអ្នកចរចា",
    color: "#D97706", // Amber/Gold
    gradient: "from-amber-500 to-orange-600",
    lightBg: "bg-amber-50",
    borderClass: "border-amber-200",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    icon: TrendingUp,
    descEn: "Enjoys leadership, motivating teams, pitching ideas, taking business risks, and driving growth.",
    descKm: "ចូលចិត្តភាពជាអ្នកដឹកនាំ ការបញ្ចុះបញ្ចូល ធុរកិច្ចថ្មី និងការបង្កើតគម្រោងដែលមានឥទ្ធិពលខ្ពស់។",
    keyActivities: [
      { en: "Pitching business initiatives & public speaking", km: "ការធ្វើបទបង្ហាញបញ្ចុះបញ្ចូល និងការចរចាធុរកិច្ច" },
      { en: "Leading teams & managing project goals", km: "ការដឹកនាំក្រុម និងការជំរុញលទ្ធផលការងារ" },
      { en: "Launching ventures & identifying market gaps", km: "ការបង្កើតគំនិតអាជីវកម្ម និងស្វែងរកឱកាសទីផ្សារ" },
    ],
    workEnvironment: {
      en: "Fast-paced tech startups, corporate boardrooms, investment firms, and venture incubators.",
      km: "ក្រុមហ៊ុនបច្ចេកវិទ្យា Startup មជ្ឈមណ្ឌលពាណិជ្ជកម្ម ស្ថាប័នវិនិយោគ និងក្រុមហ៊ុនរីកចម្រើនរហ័ស។",
    },
    sampleCareers: [
      { en: "Tech Founder & CEO", km: "ស្ថាបនិកក្រុមហ៊ុនបច្ចេកវិទ្យា (Startup Founder)" },
      { en: "Product Manager & Growth Lead", km: "អ្នកគ្រប់គ្រងផលិតផល និងយុទ្ធសាស្ត្រពង្រីកទីផ្សារ" },
      { en: "Venture Capital & Investment Analyst", km: "អ្នកវិភាគការវិនិយោគទុន (VC Analyst)" },
      { en: "Business Development Director", km: "នាយកអភិវឌ្ឍន៍ធុរកិច្ច និងដៃគូយុទ្ធសាស្ត្រ" },
    ],
    sampleMajors: [
      { nameEn: "FinTech & Financial Management", nameKm: "បច្ចេកវិទ្យាហិរញ្ញវត្ថុ (FinTech)", slug: "fintech" },
      { nameEn: "International Business Management", nameKm: "ការគ្រប់គ្រងពាណិជ្ជកម្មអន្តរជាតិ", slug: "international-business" },
      { nameEn: "Entrepreneurship & Innovation", nameKm: "សហគ្រិនភាព និងនវានុវត្តន៍", slug: "entrepreneurship" },
    ],
    strengths: [
      { en: "Persuasive Pitching", km: "ការបញ្ចុះបញ្ចូល និងការបង្ហាញយុទ្ធសាស្ត្រ" },
      { en: "Strategic Risk Taking", km: "ការទទួលយកហានិភ័យដោយការគិតគូរ" },
      { en: "Decisive Execution", km: "ភាពម៉ឺងម៉ាត់ក្នុងការសម្រេចចិត្ត" },
    ],
    sampleQuestions: [
      { en: "I enjoy leading projects, delegating tasks, and motivating teams to succeed.", km: "ខ្ញុំចូលចិត្តដឹកនាំគម្រោង ចាត់ចែងការងារ និងលើកទឹកចិត្តក្រុមឱ្យសម្រេចគោលដៅ។" },
      { en: "I am comfortable negotiating deals and presenting in front of large audiences.", km: "ខ្ញុំមានទំនុកចិត្តក្នុងការចរចា និងធ្វើបទបង្ហាញចំពោះមុខមនុស្សច្រើន។" },
    ],
  },
  C: {
    code: "C",
    letter: "Conventional",
    nameEn: "Conventional (Organized & Detail-Oriented)",
    nameKm: "រៀបចំ & ប្រព័ន្ធច្បាស់លាស់ (Conventional)",
    shortNameEn: "Conventional",
    shortNameKm: "រៀបចំ & ប្រព័ន្ធ",
    roleEn: "The Systems Architect & Data Compliance Specialist",
    roleKm: "អ្នករៀបចំប្រព័ន្ធ គណនេយ្យសុក្រឹត និងអនុលោមភាព",
    color: "#0D9488", // Teal
    gradient: "from-teal-500 to-cyan-600",
    lightBg: "bg-teal-50",
    borderClass: "border-teal-200",
    badgeBg: "bg-teal-50 text-teal-800 border-teal-200",
    icon: FileText,
    descEn: "Enjoys structured systems, organizing financial data, precise procedures, and statutory compliance.",
    descKm: "ចូលចិត្តការរៀបចំទិន្នន័យ គណនេយ្យ នីតិវិធីច្បាស់លាស់ និងការគ្រប់គ្រងឯកសារប្រព័ន្ធ។",
    keyActivities: [
      { en: "Auditing financial spreadsheets & ledger accuracy", km: "ការធ្វើសវនកម្មគណនេយ្យ និងភាពសុក្រឹតនៃទិន្នន័យ" },
      { en: "Structuring enterprise database records", km: "ការរៀបចំរចនាសម្ព័ន្ធទិន្នន័យសហគ្រាស (ERP)" },
      { en: "Optimizing standard operating procedures", km: "ការកែលម្អនីតិវិធីស្តង់ដារប្រតិបត្តិការ (SOP)" },
    ],
    workEnvironment: {
      en: "Financial institutions, audit firms, regulatory agencies, and corporate operations centers.",
      km: "គ្រឹះស្ថានធនាគារ ក្រុមហ៊ុនសវនកម្ម ស្ថាប័នគ្រប់គ្រងទិន្នន័យ និងការិយាល័យប្រតិបត្តិការ។",
    },
    sampleCareers: [
      { en: "Chartered Accountant & Auditor", km: "គណនេយ្យករ និងសវនករអាជីព (ACCA)" },
      { en: "Financial Risk & Compliance Officer", km: "មន្ត្រីគ្រប់គ្រងហានិភ័យហិរញ្ញវត្ថុ" },
      { en: "Enterprise Systems Administrator", km: "អ្នកគ្រប់គ្រងប្រព័ន្ធព័ត៌មានវិទ្យាសហគ្រាស" },
      { en: "Supply Chain & Logistics Specialist", km: "អ្នកជំនាញខ្សែច្រវាក់ផ្គត់ផ្គង់ និងភស្តុភារកម្ម" },
    ],
    sampleMajors: [
      { nameEn: "Accounting & Audit (ACCA)", nameKm: "គណនេយ្យ និងសវនកម្ម", slug: "accounting-audit" },
      { nameEn: "Banking & Financial Technology", nameKm: "ធនាគារ និងហិរញ្ញវត្ថុ", slug: "banking-finance" },
      { nameEn: "Logistics & Supply Chain", nameKm: "ភស្តុភារកម្ម និងខ្សែច្រវាក់ផ្គត់ផ្គង់", slug: "supply-chain" },
    ],
    strengths: [
      { en: "Audit Precision", km: "ភាពសុក្រឹតឥតខ្ចោះនៃទិន្នន័យ" },
      { en: "Systematic Order", km: "ការរៀបចំប្រព័ន្ធមានរបៀបរៀបរយ" },
      { en: "Procedural Compliance", km: "ការគោរពគោលការណ៍ និងច្បាប់ស្តង់ដារ" },
    ],
    sampleQuestions: [
      { en: "I take pride in keeping records, budgets, and databases impeccably organized.", km: "ខ្ញុំមានមោទនភាពក្នុងការរៀបចំកំណត់ត្រា ថវិកា និងទិន្នន័យឱ្យមានសណ្តាប់ធ្នាប់ល្អឥតខ្ចោះ។" },
      { en: "I prefer working in structured environments with clear guidelines over ambiguity.", km: "ខ្ញុំចូលចិត្តធ្វើការក្នុងបរិយាកាសដែលមានគោលការណ៍ណែនាំច្បាស់លាស់។" },
    ],
  },
};

export interface HollandArchetypeMeta {
  code: string;
  titleEn: string;
  titleKm: string;
  subtitleEn: string;
  subtitleKm: string;
  taglineEn: string;
  taglineKm: string;
  strengths: string[];
  optimalWorkEnvironmentKm: string;
  optimalWorkEnvironmentEn: string;
  targetIndustriesKm: string[];
  targetIndustriesEn: string[];
}

const KNOWN_ARCHETYPES: Record<string, Partial<HollandArchetypeMeta>> = {
  RIA: {
    titleEn: "The Technical Innovator",
    titleKm: "អ្នកច្នៃប្រឌិតបច្ចេកវិទ្យាជាក់ស្តែង",
    subtitleEn: "Hands-on builder driven by deep analytical curiosity and creative flair",
    subtitleKm: "អ្នកសាងសង់ជាក់ស្តែងដែលជំរុញដោយការស្រាវជ្រាវវិទ្យាសាស្ត្រ និងការច្នៃប្រឌិត",
    strengths: ["ការដោះស្រាយបញ្ហាបច្ចេកទេស", "ការវិភាគទិន្នន័យស៊ីជម្រៅ", "ការរចនាផលិតផលជាក់ស្តែង"],
    optimalWorkEnvironmentKm: "បន្ទប់ពិសោធន៍ R&D បច្ចេកវិទ្យា ស្ទូឌីយោផ្នែករឹង ឬក្រុមហ៊ុនវិស្វកម្មដែលមានសេរីភាពក្នុងការស្រាវជ្រាវអនុវត្តជាក់ស្តែង។",
    optimalWorkEnvironmentEn: "Technology R&D labs, hardware prototyping studios, or engineering firms with freedom to build and experiment.",
    targetIndustriesKm: ["វិស្វកម្មសូហ្វវែរ & រ៉ូបូត", "ស្ថាបត្យកម្មប្រព័ន្ធកុំព្យូទ័រ", "បច្ចេកវិទ្យាស្វ័យប្រវត្តិកម្ម"],
    targetIndustriesEn: ["Software & Robotics", "Computer Systems Architecture", "Industrial Automation"],
  },
  RIC: {
    titleEn: "The Systems Engineer",
    titleKm: "វិស្វករប្រព័ន្ធ និងហេដ្ឋារចនាសម្ព័ន្ធ",
    subtitleEn: "Practical problem solver with meticulous attention to structural order",
    subtitleKm: "អ្នកដោះស្រាយបញ្ហាបច្ចេកទេសដែលឱ្យតម្លៃលើប្រព័ន្ធ និងលំដាប់លំដោយសុក្រឹត",
    strengths: ["ការគ្រប់គ្រងផ្នែករឹង & ប្រព័ន្ធ", "ការវិភាគតក្កវិជ្ជា", "ភាពសុក្រឹតនៃនីតិវិធី"],
    optimalWorkEnvironmentKm: "មជ្ឈមណ្ឌលទិន្នន័យ ហេដ្ឋារចនាសម្ព័ន្ធបណ្តាញ ឬការដ្ឋានវិស្វកម្មដែលមានស្តង់ដារគុណភាពច្បាស់លាស់។",
    optimalWorkEnvironmentEn: "Data centers, network infrastructure hubs, or engineering sites governed by strict quality standards.",
    targetIndustriesKm: ["សន្តិសុខបណ្តាញ & សាយប័រ", "វិស្វកម្មសំណង់ស៊ីវិល", "ប្រព័ន្ធព័ត៌មានវិទ្យាសហគ្រាស"],
    targetIndustriesEn: ["Cybersecurity Infrastructure", "Civil Engineering", "Enterprise Systems"],
  },
  RIE: {
    titleEn: "The Engineering Leader",
    titleKm: "អ្នកដឹកនាំបច្ចេកទេស និងគម្រោងធំៗ",
    subtitleEn: "Technical visionary who rallies teams to build impactful physical or digital solutions",
    subtitleKm: "អ្នកជំនាញបច្ចេកវិទ្យាដែលមានភាពជាអ្នកដឹកនាំ និងចក្ខុវិស័យធុរកិច្ចរឹងមាំ",
    strengths: ["ភាពជាអ្នកដឹកនាំគម្រោងបច្ចេកវិទ្យា", "ការដោះស្រាយបញ្ហាផ្ទាល់ដៃ", "ការគ្រប់គ្រងធនធាន"],
    optimalWorkEnvironmentKm: "ក្រុមហ៊ុនបច្ចេកវិទ្យាខ្នាតធំ គម្រោងហេដ្ឋារចនាសម្ព័ន្ធ ឬការដ្ឋានវិស្វកម្មដែលទាមទារការសម្របសម្រួលក្រុម។",
    optimalWorkEnvironmentEn: "High-growth tech firms, infrastructure mega-projects, or engineering contractors requiring strong team coordination.",
    targetIndustriesKm: ["ការគ្រប់គ្រងគម្រោងវិស្វកម្ម", "ក្រុមហ៊ុនបច្ចេកវិទ្យា Tech Startup", "វិស័យថាមពល និងទូរគមនាគមន៍"],
    targetIndustriesEn: ["Engineering Project Management", "Tech Startups", "Energy & Telecom"],
  },
  IRC: {
    titleEn: "The Systems Analyst & Data Scientist",
    titleKm: "អ្នកវិភាគប្រព័ន្ធទិន្នន័យ និងក្បួនដោះស្រាយ",
    subtitleEn: "Rigorous scientific thinker who transforms chaotic data into elegant, structured solutions",
    subtitleKm: "អ្នកវិភាគស៊ីជម្រៅដែលពូកែរៀបចំទិន្នន័យស្មុគស្មាញឱ្យក្លាយជាប្រព័ន្ធច្បាស់លាស់",
    strengths: ["ការវិភាគស្ថិតិ & ក្បួនដោះស្រាយ", "ការគ្រប់គ្រងមូលដ្ឋានទិន្នន័យ", "ការស្រាវជ្រាវបែបវិទ្យាសាស្ត្រ"],
    optimalWorkEnvironmentKm: "មន្ទីរពិសោធន៍ AI ស្ថាប័នស្រាវជ្រាវហិរញ្ញវត្ថុ ឬមជ្ឈមណ្ឌលវិភាគទិន្នន័យកម្រិតខ្ពស់។",
    optimalWorkEnvironmentEn: "AI labs, quantitative financial desks, or advanced enterprise data centers.",
    targetIndustriesKm: ["បញ្ញាសិប្បនិម្មិត (AI) & ទិន្នន័យ", "បច្ចេកវិទ្យាហិរញ្ញវត្ថុ (FinTech)", "ការស្រាវជ្រាវជីវវិទ្យាសាស្ត្រ"],
    targetIndustriesEn: ["Artificial Intelligence & Big Data", "FinTech Quantitative Analytics", "Biomedical Informatics"],
  },
  IRA: {
    titleEn: "The Scientific Pioneer",
    titleKm: "អ្នកវិទ្យាសាស្ត្រ និងអ្នកច្នៃប្រឌិតទ្រឹស្តី",
    subtitleEn: "Inquisitive mind exploring uncharted frontiers of knowledge and creative synthesis",
    subtitleKm: "អ្នកស្រាវជ្រាវដែលមានការស្រមើស្រមៃច្នៃប្រឌិតខ្ពស់ក្នុងការដោះស្រាយបញ្ហាអនាគត",
    strengths: ["ការស្រាវជ្រាវដើមថ្មីៗ", "ការបង្កើតគំរូទ្រឹស្តី", "ការដោះស្រាយបញ្ហាស្មុគស្មាញ"],
    optimalWorkEnvironmentKm: "សាកលវិទ្យាល័យស្រាវជ្រាវ ស្ថាប័ននវានុវត្តន៍ ឬមន្ទីរពិសោធន៍គំនិតអនាគត។",
    optimalWorkEnvironmentEn: "Research universities, innovation think tanks, or forward-looking academic labs.",
    targetIndustriesKm: ["ការស្រាវជ្រាវបច្ចេកវិទ្យាជំនាន់ថ្មី", "វិទ្យាសាស្ត្រជីវវេជ្ជសាស្ត្រ", "ស្ថាបត្យកម្មសូហ្វវែរ"],
    targetIndustriesEn: ["Deep Tech Research", "Biomedical Sciences", "Software Architecture"],
  },
  AIR: {
    titleEn: "The Digital Media Architect",
    titleKm: "ស្ថាបត្យកររចនា និងមេឌាឌីជីថល",
    subtitleEn: "Creative creator who merges aesthetic mastery with technical tools and logical execution",
    subtitleKm: "អ្នកច្នៃប្រឌិតដែលរួមបញ្ចូលសោភ័ណភាពសិល្បៈជាមួយឧបករណ៍បច្ចេកវិទ្យាទំនើប",
    strengths: ["ការរចនា UI/UX & ក្រាហ្វិក", "ការផលិតមេឌាឌីជីថល", "ការប្រើប្រាស់ឧបករណ៍ច្នៃប្រឌិត"],
    optimalWorkEnvironmentKm: "ស្ទូឌីយោរចនា UI/UX ក្រុមហ៊ុនហ្គេម និងគំនូរជីវចល ឬស្ទូឌីយោផលិតកម្មច្នៃប្រឌិត។",
    optimalWorkEnvironmentEn: "UI/UX studios, gaming & animation houses, or digital creative production agencies.",
    targetIndustriesKm: ["ការរចនា UI/UX ផលិតផល", "គំនូរជីវចល 3D & ហ្គេម", "មេឌាឌីជីថល និងផ្សាយពាណិជ្ជកម្ម"],
    targetIndustriesEn: ["UI/UX & Product Design", "3D Animation & Game Dev", "Digital Media & Advertising"],
  },
  AIE: {
    titleEn: "The Creative Director",
    titleKm: "នាយកផ្នែកច្នៃប្រឌិត និងសហគ្រិនសិល្បៈ",
    subtitleEn: "Visionary storyteller who combines artistic genius with strategic commercial drive",
    subtitleKm: "អ្នកដឹកនាំគំនិតច្នៃប្រឌិតដែលមានចក្ខុវិស័យពាណិជ្ជកម្ម និងការបញ្ចុះបញ្ចូលខ្ពស់",
    strengths: ["ការដឹកនាំផ្នែកច្នៃប្រឌិត", "ការនិទានរឿងម៉ាកសញ្ញា", "ការធ្វើបទបង្ហាញយុទ្ធសាស្ត្រ"],
    optimalWorkEnvironmentKm: "ទីភ្នាក់ងារច្នៃប្រឌិត ក្រុមហ៊ុនផ្សាយពាណិជ្ជកម្ម ឬស្ទូឌីយោ Startup ដែលផ្តោតលើបទពិសោធន៍អ្នកប្រើប្រាស់។",
    optimalWorkEnvironmentEn: "Creative agencies, advertising powerhouses, or user-experience driven startup studios.",
    targetIndustriesKm: ["ការផ្សព្វផ្សាយពាណិជ្ជកម្ម & ម៉ាក", "ឧស្សាហកម្មភាពយន្ត & មេឌា", "ការរចនាយុទ្ធសាស្ត្រធុរកិច្ច"],
    targetIndustriesEn: ["Brand Strategy & Advertising", "Film & Digital Media Production", "Design Thinking Consulting"],
  },
  AIS: {
    titleEn: "The Human-Centered Designer",
    titleKm: "អ្នករចនាផ្តោតលើមនុស្ស និងការយល់ចិត្ត",
    subtitleEn: "Empathetic creator whose designs uplift people, educate minds, and evoke joy",
    subtitleKm: "អ្នកច្នៃប្រឌិតដែលប្រើប្រាស់សិល្បៈ និងការយល់ចិត្ត ដើម្បីជួយសង្គម និងកែលម្អជីវិតមនុស្ស",
    strengths: ["ការយល់ចិត្តអ្នកប្រើប្រាស់ (Empathy)", "ការរចនាបទពិសោធន៍ (UX)", "ការប្រាស្រ័យទាក់ទង"],
    optimalWorkEnvironmentKm: "អង្គការអប់រំ ស្ថាប័នសង្គម ឬក្រុមហ៊ុនបច្ចេកវិទ្យាដែលផ្តល់អាទិភាពលើផលប៉ះពាល់សង្គម។",
    optimalWorkEnvironmentEn: "Educational platforms, social enterprises, or tech firms prioritizing human wellbeing.",
    targetIndustriesKm: ["ការអប់រំតាមបែបបច្ចេកវិទ្យា (EdTech)", "ការរចនា UX ផ្តោតលើមនុស្ស", "ការងារទំនាក់ទំនងសហគមន៍"],
    targetIndustriesEn: ["EdTech & Instructional Design", "Human-Centered UX Design", "Community Communications"],
  },
  SIA: {
    titleEn: "The Educational & Behavioral Mentor",
    titleKm: "អ្នកប្រឹក្សាផ្លូវចិត្ត និងអភិវឌ្ឍការសិក្សា",
    subtitleEn: "Empathetic researcher dedicated to unlocking human potential through science and care",
    subtitleKm: "អ្នកណែនាំដែលរួមបញ្ចូលការយល់ចិត្ត ការស្រាវជ្រាវចិត្តវិទ្យា និងការច្នៃប្រឌិត",
    strengths: ["ការប្រឹក្សាយោបល់ផ្លូវចិត្ត", "ការវិភាគឥរិយាបថមនុស្ស", "ការបង្រៀនប្រកបដោយភាពច្នៃប្រឌិត"],
    optimalWorkEnvironmentKm: "មជ្ឈមណ្ឌលប្រឹក្សាផ្លូវចិត្ត សាកលវិទ្យាល័យ ឬស្ថាប័នអភិវឌ្ឍយុវជន។",
    optimalWorkEnvironmentEn: "Counseling centers, universities, or youth empowerment organizations.",
    targetIndustriesKm: ["ចិត្តវិទ្យា & ការប្រឹក្សាយោបល់", "ការដឹកនាំផ្នែកអប់រំ", "សុខភាពផ្លូវចិត្ត និងសង្គម"],
    targetIndustriesEn: ["Psychology & Counseling", "Educational Leadership", "Social Emotional Learning"],
  },
  SEC: {
    titleEn: "The Community Organizer & Operations Director",
    titleKm: "អ្នកដឹកនាំកិច្ចការសង្គម និងរៀបចំប្រព័ន្ធ",
    subtitleEn: "Inspiring catalyst who coordinates people and structured procedures to achieve social good",
    subtitleKm: "អ្នកសម្របសម្រួលដែលរួមបញ្ចូលភាពជាអ្នកដឹកនាំ ទំនាក់ទំនងមនុស្ស និងការគ្រប់គ្រងរៀបរយ",
    strengths: ["ការសម្របសម្រួលសហគមន៍", "ការគ្រប់គ្រងប្រតិបត្តិការ", "ការទំនាក់ទំនងសាធារណៈ"],
    optimalWorkEnvironmentKm: "អង្គការក្រៅរដ្ឋាភិបាល (NGOs) ស្ថាប័នរដ្ឋបាលសាធារណៈ ឬផ្នែកធនធានមនុស្សសហគ្រាស។",
    optimalWorkEnvironmentEn: "NGOs, public sector institutions, or corporate people operations departments.",
    targetIndustriesKm: ["ការអភិវឌ្ឍសហគមន៍ & អង្គការ", "ការគ្រប់គ្រងធនធានមនុស្ស (HR)", "រដ្ឋបាលសាធារណៈ & សុខភាព"],
    targetIndustriesEn: ["NGO & Community Development", "Human Resources & Talent Growth", "Public Administration"],
  },
  EIA: {
    titleEn: "The Venture Innovator & Tech Strategist",
    titleKm: "ស្ថាបនិកធុរកិច្ចនវានុវត្តន៍ និងអ្នកយុទ្ធសាស្ត្រ",
    subtitleEn: "Entrepreneurial mind that combines analytical rigor with commercial ambition and creative edge",
    subtitleKm: "សហគ្រិនដែលរួមបញ្ចូលការវិភាគទិន្នន័យច្បាស់លាស់ គំនិតច្នៃប្រឌិត និងការជំរុញកំណើនធុរកិច្ច",
    strengths: ["យុទ្ធសាស្ត្រធុរកិច្ចថ្មី (Startups)", "ការវិភាគទីផ្សារ & ទិន្នន័យ", "ការចរចា និងការដឹកនាំ"],
    optimalWorkEnvironmentKm: "ក្រុមហ៊ុនបច្ចេកវិទ្យា Startup មូលនិធិវិនិយោគទុន (VC) ឬផ្នែកពង្រីកធុរកិច្ចសកល។",
    optimalWorkEnvironmentEn: "Venture capital funds, high-velocity tech startups, or corporate innovation hubs.",
    targetIndustriesKm: ["បច្ចេកវិទ្យាហិរញ្ញវត្ថុ (FinTech)", "ការវិនិយោគទុន (Venture Capital)", "ការគ្រប់គ្រងផលិតផល (Product Mgmt)"],
    targetIndustriesEn: ["FinTech & Venture Capital", "Digital Product Management", "Corporate Innovation Strategy"],
  },
  EIC: {
    titleEn: "The Corporate Executive & Strategist",
    titleKm: "អ្នកដឹកនាំសាជីវកម្ម និងយុទ្ធសាស្ត្រហិរញ្ញវត្ថុ",
    subtitleEn: "Data-driven business leader who drives organizational expansion with precision and control",
    subtitleKm: "អ្នកដឹកនាំពាណិជ្ជកម្មដែលប្រើប្រាស់ទិន្នន័យ និងប្រព័ន្ធសុក្រឹតដើម្បីពង្រីកទីផ្សារ",
    strengths: ["ការគ្រប់គ្រងយុទ្ធសាស្ត្រសហគ្រាស", "ការវិភាគហានិភ័យហិរញ្ញវត្ថុ", "ភាពជាអ្នកដឹកនាំប្រតិបត្តិ"],
    optimalWorkEnvironmentKm: "ធនាគារ ស្ថាប័នហិរញ្ញវត្ថុ ឬសាជីវកម្មពហុជាតិដែលទាមទារភាពសុក្រឹតខ្ពស់។",
    optimalWorkEnvironmentEn: "Commercial banks, investment houses, or multinational corporations requiring strategic precision.",
    targetIndustriesKm: ["ធនាគារ & ហិរញ្ញវត្ថុសាជីវកម្ម", "ការប្រឹក្សាយោបល់យុទ្ធសាស្ត្រ", "ការគ្រប់គ្រងពាណិជ្ជកម្មអន្តរជាតិ"],
    targetIndustriesEn: ["Corporate Banking & Finance", "Management Consulting", "International Trade Operations"],
  },
  ESA: {
    titleEn: "The Transformational Leader",
    titleKm: "អ្នកដឹកនាំការផ្លាស់ប្តូរ និងទំនាក់ទំនង",
    subtitleEn: "Charismatic communicator who inspires people, champions vision, and builds enduring partnerships",
    subtitleKm: "អ្នកដឹកនាំដែលមានវោហារស័ព្ទ និងភាពកក់ក្តៅក្នុងការជំរុញក្រុមឱ្យសម្រេចគោលដៅរួម",
    strengths: ["ការបញ្ចុះបញ្ចូល & វោហារស័ព្ទ", "ការកសាងទំនាក់ទំនងដៃគូ", "ការលើកទឹកចិត្តក្រុមការងារ"],
    optimalWorkEnvironmentKm: "បរិយាកាសការងាររស់រវើក ផ្នែកទំនាក់ទំនងអន្តរជាតិ ទីផ្សារសាជីវកម្ម ឬអង្គការយុវជន។",
    optimalWorkEnvironmentEn: "Dynamic environments, public relations agencies, diplomatic bodies, or youth organizations.",
    targetIndustriesKm: ["ទំនាក់ទំនងសាធារណៈ & ទីផ្សារ", "ការទូត & កិច្ចការអន្តរជាតិ", "ការអភិវឌ្ឍភាពជាអ្នកដឹកនាំ"],
    targetIndustriesEn: ["Public Relations & Marketing", "Diplomacy & Global Affairs", "Executive Leadership Training"],
  },
  CIR: {
    titleEn: "The Financial Systems Architect",
    titleKm: "ស្ថាបត្យករប្រព័ន្ធហិរញ្ញវត្ថុ និងគណនេយ្យ",
    subtitleEn: "Analytical organizer who safeguards operational integrity and builds reliable data infrastructures",
    subtitleKm: "អ្នករៀបចំប្រព័ន្ធដែលរួមបញ្ចូលភាពសុក្រឹតនៃគណនេយ្យជាមួយការវិភាគបច្ចេកវិទ្យា",
    strengths: ["ការរៀបចំប្រព័ន្ធទិន្នន័យ ERP", "ភាពសុក្រឹតនៃសវនកម្ម", "ការវិភាគអនុលោមភាព"],
    optimalWorkEnvironmentKm: "ការិយាល័យសវនកម្ម ធនាគារកណ្តាល ឬផ្នែកប្រតិបត្តិការទិន្នន័យសហគ្រាស។",
    optimalWorkEnvironmentEn: "Audit firms, central banking departments, or enterprise data operations hubs.",
    targetIndustriesKm: ["សវនកម្ម & គណនេយ្យវិជ្ជាជីវៈ", "ប្រព័ន្ធព័ត៌មានវិទ្យា ERP", "ការគ្រប់គ្រងខ្សែច្រវាក់ផ្គត់ផ្គង់"],
    targetIndustriesEn: ["Professional Accounting & Audit", "Enterprise Resource Planning (ERP)", "Supply Chain Operations"],
  },
  CES: {
    titleEn: "The Operations & Compliance Director",
    titleKm: "នាយកប្រតិបត្តិការ និងអនុលោមភាពច្បាប់",
    subtitleEn: "Methodical leader who balances business goals, team cohesion, and regulatory compliance",
    subtitleKm: "អ្នកគ្រប់គ្រងប្រតិបត្តិការដែលធ្វើឱ្យស្ថាប័នដំណើរការរលូន មានរបៀបរៀបរយ និងស្របច្បាប់",
    strengths: ["ការគ្រប់គ្រងនីតិវិធី SOP", "ការគ្រប់គ្រងក្រុមការងារ", "ការត្រួតពិនិត្យអនុលោមភាព"],
    optimalWorkEnvironmentKm: "ទីស្នាក់ការកណ្តាលសាជីវកម្ម ស្ថាប័នរដ្ឋ ឬអង្គភាពគ្រប់គ្រងប្រតិបត្តិការធំៗ។",
    optimalWorkEnvironmentEn: "Corporate headquarters, regulatory oversight bodies, or large-scale operational facilities.",
    targetIndustriesKm: ["រដ្ឋបាលពាណិជ្ជកម្ម & អនុលោមភាព", "ប្រតិបត្តិការធនាគារ", "ការគ្រប់គ្រងការិយាល័យកម្រិតខ្ពស់"],
    targetIndustriesEn: ["Corporate Administration & Governance", "Banking Operations", "Office Management"],
  },
};

/**
 * Generate a complete Holland Archetype profile for ANY 3-letter combination.
 */
export function getHollandArchetype(hollandCode: string): HollandArchetypeMeta {
  const code = (hollandCode || "RIA").toUpperCase().slice(0, 3);
  const known = KNOWN_ARCHETYPES[code];

  const primary = RIASEC_DIMENSIONS[code[0]] || RIASEC_DIMENSIONS.R;
  const secondary = RIASEC_DIMENSIONS[code[1]] || RIASEC_DIMENSIONS.I;
  const tertiary = RIASEC_DIMENSIONS[code[2]] || RIASEC_DIMENSIONS.A;

  if (known && known.titleEn && known.titleKm) {
    return {
      code,
      titleEn: known.titleEn,
      titleKm: known.titleKm,
      subtitleEn: known.subtitleEn || `${primary.shortNameEn} • ${secondary.shortNameEn} • ${tertiary.shortNameEn}`,
      subtitleKm: known.subtitleKm || `${primary.shortNameKm} • ${secondary.shortNameKm} • ${tertiary.shortNameKm}`,
      taglineEn: `${primary.roleEn} supported by ${secondary.shortNameEn} thinking and ${tertiary.shortNameEn} capabilities.`,
      taglineKm: `${primary.roleKm} គួបផ្សំនឹងភាពប៉ិនប្រសប់ផ្នែក ${secondary.shortNameKm} និងសមត្ថភាព ${tertiary.shortNameKm}។`,
      strengths: known.strengths || [
        primary.strengths[0]?.km || "ការអនុវត្តជាក់ស្តែង",
        secondary.strengths[0]?.km || "ការវិភាគស៊ីជម្រៅ",
        tertiary.strengths[0]?.km || "ការច្នៃប្រឌិត",
      ],
      optimalWorkEnvironmentKm: known.optimalWorkEnvironmentKm || primary.workEnvironment.km,
      optimalWorkEnvironmentEn: known.optimalWorkEnvironmentEn || primary.workEnvironment.en,
      targetIndustriesKm: known.targetIndustriesKm || [
        primary.sampleCareers[0]?.km || "បច្ចេកវិទ្យា & វិស្វកម្ម",
        secondary.sampleCareers[0]?.km || "ទិន្នន័យ & ស្រាវជ្រាវ",
        tertiary.sampleCareers[0]?.km || "ការច្នៃប្រឌិត & ដឹកនាំ",
      ],
      targetIndustriesEn: known.targetIndustriesEn || [
        primary.sampleCareers[0]?.en || "Engineering & Tech",
        secondary.sampleCareers[0]?.en || "Data & Research",
        tertiary.sampleCareers[0]?.en || "Leadership & Innovation",
      ],
    };
  }

  // Dynamic synthesizer for permutations not in explicit dictionary
  const titleEn = `The ${primary.shortNameEn}-${secondary.shortNameEn} Specialist`;
  const titleKm = `អ្នកជំនាញ ${primary.shortNameKm} & ${secondary.shortNameKm}`;

  return {
    code,
    titleEn,
    titleKm,
    subtitleEn: `${primary.shortNameEn} • ${secondary.shortNameEn} • ${tertiary.shortNameEn}`,
    subtitleKm: `${primary.shortNameKm} • ${secondary.shortNameKm} • ${tertiary.shortNameKm}`,
    taglineEn: `A dynamic blend of ${primary.shortNameEn} execution, ${secondary.shortNameEn} strategy, and ${tertiary.shortNameEn} balance.`,
    taglineKm: `ការរួមបញ្ចូលគ្នារវាង ${primary.shortNameKm} ការគិតបែប ${secondary.shortNameKm} និងតុល្យភាពនៃ ${tertiary.shortNameKm}។`,
    strengths: [
      primary.strengths[0]?.km || "ភាពជាអ្នកអនុវត្ត",
      secondary.strengths[0]?.km || "ការវិភាគទិន្នន័យ",
      tertiary.strengths[0]?.km || "ការសម្រេចចិត្តប្រកបដោយប្រសិទ្ធភាព",
    ],
    optimalWorkEnvironmentKm: primary.workEnvironment.km,
    optimalWorkEnvironmentEn: primary.workEnvironment.en,
    targetIndustriesKm: [
      primary.sampleCareers[0]?.km || "វិស្វកម្ម & បច្ចេកវិទ្យា",
      secondary.sampleCareers[0]?.km || "ការស្រាវជ្រាវ & ទិន្នន័យ",
      tertiary.sampleCareers[0]?.km || "ការអភិវឌ្ឍយុទ្ធសាស្ត្រ",
    ],
    targetIndustriesEn: [
      primary.sampleCareers[0]?.en || "Engineering & Technology",
      secondary.sampleCareers[0]?.en || "Research & Data Systems",
      tertiary.sampleCareers[0]?.en || "Strategic Operations",
    ],
  };
}

/**
 * Returns dynamic spelled-out names (e.g. "Realistic • Investigative • Artistic"
 * or "សង្គម • សហគ្រិន • រៀបចំប្រព័ន្ធ") based on actual code letters.
 */
export function getHollandSpelledOut(
  code: string,
  lang: "km" | "en" = "en"
): string {
  if (!code) return "";
  const letters = code.toUpperCase().split("").slice(0, 3);
  return letters
    .map((l) => {
      const meta = RIASEC_DIMENSIONS[l];
      if (!meta) return l;
      return lang === "km" ? meta.shortNameKm : meta.shortNameEn;
    })
    .join(" • ");
}

