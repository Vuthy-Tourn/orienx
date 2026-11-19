export type GreetingLanguage = "en" | "km";

export function isGreetingMessage(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .replace(/[!?.,;:()[\]{}"']/g, " ")
    .replace(/\b(tara|orienx|assistant)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return [
    "hi",
    "hello",
    "hey",
    "yo",
    "hi there",
    "hello there",
    "good morning",
    "good afternoon",
    "good evening",
    "how are you",
    "thanks",
    "thank you",
    "thank you so much",
    "ok",
    "okay",
    "សួស្តី",
    "ជំរាបសួរ",
    "ជម្រាបសួរ",
    "អរគុណ",
    "អរគុណច្រើន",
    "សុខសប្បាយទេ",
  ].includes(normalized);
}

export function greetingAnswer(language: GreetingLanguage): string {
  return language === "km"
    ? "សួស្តី! ខ្ញុំអាចជួយរកជំនាញ សាកលវិទ្យាល័យ ថ្លៃសិក្សា អាហារូបករណ៍ និងលទ្ធផលតេស្តរបស់អ្នក។ តើអ្នកចង់ស្វែងយល់អំពីអ្វី?"
    : "Hi! I can help with majors, universities, tuition, scholarships, and your saved test results. What would you like to explore?";
}
