export interface BilingualSpeech {
  en: string;
  km: string;
}

const PERSONALITY_DIMENSION_HINTS: Record<string, BilingualSpeech> = {
  EI: {
    en: "Think about where you naturally recharge your energy. ⚡",
    km: "គិតពីកន្លែងដែលធ្វើឱ្យអ្នកមានថាមពលឡើងវិញដោយធម្មជាតិ។ ⚡",
  },
  SN: {
    en: "Do you prefer concrete details or big-picture ideas? 🔍",
    km: "តើអ្នកចូលចិត្តព័ត៌មានលម្អិតជាក់ស្តែង ឬគំនិតទូលំទូលាយ? 🔍",
  },
  TF: {
    en: "Think about how you make tough decisions day to day. 🧠",
    km: "គិតពីរបៀបដែលអ្នកធ្វើការសម្រេចចិត្តសំខាន់ៗប្រចាំថ្ងៃ។ 🧠",
  },
  JP: {
    en: "Do you thrive on structure or spontaneous flexibility? 📅",
    km: "តើអ្នកចូលចិត្តផែនការច្បាស់លាស់ ឬភាពបត់បែន? 📅",
  },
};

const RIASEC_CATEGORY_HINTS: Record<string, BilingualSpeech> = {
  R: {
    en: "Picture yourself doing hands-on, practical work here! 🛠️",
    km: "ស្រមៃថាអ្នកកំពុងធ្វើការងារបច្ចេកទេស ឬការងារផ្ទាល់ដៃនេះ! 🛠️",
  },
  I: {
    en: "Curious about investigating, analyzing, and solving puzzles? 🔬",
    km: "តើអ្នកចូលចិត្តស្រាវជ្រាវ វិភាគ និងដោះស្រាយបញ្ហាស្មុគស្មាញទេ? 🔬",
  },
  A: {
    en: "Think about expressing ideas creatively and originally! 🎨",
    km: "គិតពីការបង្កើតគំនិតថ្មីៗ និងការច្នៃប្រឌិតដោយសេរី! 🎨",
  },
  S: {
    en: "How does teaching, guiding, or supporting others feel to you? 🤝",
    km: "តើការជួយ បង្រៀន ឬណែនាំអ្នកដទៃធ្វើឱ្យអ្នកមានអារម្មណ៍យ៉ាងណា? 🤝",
  },
  E: {
    en: "Imagine leading a team, pitching ideas, or driving goals! 🚀",
    km: "ស្រមៃថាអ្នកកំពុងដឹកនាំក្រុម ឬជំរុញគម្រោងឱ្យជោគជ័យ! 🚀",
  },
  C: {
    en: "Do structured systems, accuracy, and clear data appeal to you? 📊",
    km: "តើការរៀបចំទិន្នន័យឱ្យមានរបៀបរៀបរយ និងច្បាស់លាស់ត្រូវនឹងអ្នកទេ? 📊",
  },
};

export function getPersonalityMascotSpeech({
  scaleLevel,
  dimension,
  currentIndex,
  totalCount,
}: {
  scaleLevel: number | null;
  dimension?: string;
  currentIndex: number;
  totalCount: number;
}): BilingualSpeech {
  if (scaleLevel !== null) {
    if (scaleLevel === 1) {
      return {
        km: "យល់ស្របខ្លាំង! ច្បាស់លាស់ណាស់ 🚀✨",
        en: "Strongly Agree! Crystal clear 🚀✨",
      };
    }
    if (scaleLevel === 2) {
      return {
        km: "យល់ស្រប! ត្រូវនឹងចិត្តអ្នក ✨",
        en: "Agree! True to who you are ✨",
      };
    }
    if (scaleLevel === 3) {
      return {
        km: "កណ្តាល! ថ្លឹងថ្លែងយ៉ាងម៉ត់ចត់ ⚖️",
        en: "Neutral! Balanced reflection ⚖️",
      };
    }
    if (scaleLevel === 4) {
      return {
        km: "មិនសូវយល់ស្របទេ! យល់ច្បាស់ហើយ 💡",
        en: "Disagree! Understood 💡",
      };
    }
    return {
      km: "មិនយល់ស្របដាច់ខាត! ដឹងច្បាស់ពីខ្លួនឯង 🛑",
      en: "Strongly Disagree! Clear boundaries 🛑",
    };
  }

  if (currentIndex === 0) {
    return {
      km: "សូមអានសំណើខាងក្រោម រួចជ្រើសរើសកម្រិតដែលត្រូវនឹងចិត្តអ្នក 🌟",
      en: "Read the statement and pick the option that best describes you 🌟",
    };
  }

  if (currentIndex === Math.floor(totalCount / 2)) {
    return {
      km: "ដល់ពាក់កណ្តាលផ្លូវហើយ! បន្តទៅមុខទៀត ⚡",
      en: "Halfway there! Keep the momentum going ⚡",
    };
  }

  if (currentIndex === totalCount - 1) {
    return {
      km: "សំណើចុងក្រោយហើយ! តោះបញ្ចប់ដើម្បីមើលលទ្ធផល 🚀",
      en: "Final statement! Answer to unlock your personality type 🚀",
    };
  }

  if (dimension && PERSONALITY_DIMENSION_HINTS[dimension]) {
    return PERSONALITY_DIMENSION_HINTS[dimension];
  }

  return {
    km: `សំណួរទី ${currentIndex + 1} នៃ ${totalCount} • ឆ្លើយតាមចិត្តគិតពិតប្រាកដ 💡`,
    en: `Q${currentIndex + 1} of ${totalCount} • Trust what feels most natural to you 💡`,
  };
}

export function getRiasecMascotSpeech({
  rating,
  category,
  currentIndex,
  totalCount,
}: {
  rating: number | null;
  category?: string;
  currentIndex: number;
  totalCount: number;
}): BilingualSpeech {
  if (rating !== null) {
    if (rating === 5) {
      return {
        km: "អស្ចារ្យណាស់! នេះជាចំណូលចិត្ត និងទេពកោសល្យពិតរបស់អ្នក! 🚀✨",
        en: "Awesome! This sounds like a natural calling for you! 🚀✨",
      };
    }
    if (rating === 4) {
      return {
        km: "ល្អណាស់! សកម្មភាពនេះពិតជាគួរឱ្យចាប់អារម្មណ៍! 💡",
        en: "Great! This activity sparks real interest! 💡",
      };
    }
    if (rating === 3) {
      return {
        km: "ធម្មតា! រក្សាជម្រើសបើកទូលាយជានិច្ច ⚖️",
        en: "Neutral! Keeping an open mind is helpful ⚖️",
      };
    }
    if (rating === 2) {
      return {
        km: "មិនអីទេ! យើងនឹងផ្តោតលើអ្វីដែលអ្នកស្រឡាញ់ពិតប្រាកដ 🎯",
        en: "No worries! We'll focus on what excites you most 🎯",
      };
    }
    return {
      km: "យល់ហើយ! ការដឹងពីអ្វីដែលមិនចូលចិត្តក៏សំខាន់ដូចគ្នា 🛡️",
      en: "Got it! Knowing what you dislike is just as valuable 🛡️",
    };
  }

  if (currentIndex === 0) {
    return {
      km: "សួស្តី! តោះស្វែងរកអាជីព និងជំនាញសាកសមបំផុតជាមួយគ្នា 👋",
      en: "Hi! Let's find the career & major matches that fit you best 👋",
    };
  }

  if (currentIndex === Math.floor(totalCount / 2)) {
    return {
      km: "ដល់ពាក់កណ្តាលផ្លូវហើយ! លឿន និងសុក្រឹតមែន ⚡",
      en: "Halfway mark! Fast & steady ⚡",
    };
  }

  if (currentIndex === totalCount - 1) {
    return {
      km: "សកម្មភាពចុងក្រោយបង្អស់! តោះបញ្ចប់ដើម្បីគណនា Holland Code 🚀",
      en: "Final activity! Complete it to reveal your Holland Code 🚀",
    };
  }

  if (category && RIASEC_CATEGORY_HINTS[category]) {
    return RIASEC_CATEGORY_HINTS[category];
  }

  return {
    km: `សំណួរទី ${currentIndex + 1} នៃ ${totalCount} • តើអ្នកមានអារម្មណ៍យ៉ាងណាចំពោះសកម្មភាពនេះ? 🤔`,
    en: `Q${currentIndex + 1} of ${totalCount} • How would you feel doing this activity? 🤔`,
  };
}
