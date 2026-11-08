/**
 * Learner Profile & Age-Adaptive Terminology Types
 * Supports kids (ages 7-12), standard learners (teens/adults), and advanced traditional students.
 */

export type LearnerAgeGroup = "kids" | "standard" | "advanced";

export type LearnerAvatarId = "explorer" | "crescent" | "star" | "scholar" | "gem";

export interface LearnerAvatarInfo {
  id: LearnerAvatarId;
  labelEn: string;
  labelUr: string;
  emoji: string;
}

export const LEARNER_AVATARS: LearnerAvatarInfo[] = [
  { id: "explorer", labelEn: "Junior Explorer", labelUr: "ننھا سیاح", emoji: "🧒" },
  { id: "star", labelEn: "Radiant Star", labelUr: "روشن ستارہ", emoji: "⭐" },
  { id: "crescent", labelEn: "Golden Crescent", labelUr: "سنہری ہلال", emoji: "🌙" },
  { id: "scholar", labelEn: "Seeker of Knowledge", labelUr: "طالبِ علم", emoji: "📚" },
  { id: "gem", labelEn: "Barakah Gem", labelUr: "برکت ہیرا", emoji: "💎" },
];

export interface LearnerProfile {
  ageGroup: LearnerAgeGroup;
  nickname: string;
  avatarId: LearnerAvatarId;
}

export const DEFAULT_LEARNER_PROFILE: LearnerProfile = {
  ageGroup: "standard",
  nickname: "",
  avatarId: "crescent",
};

export interface AgeTierMeta {
  id: LearnerAgeGroup;
  titleEn: string;
  titleUr: string;
  ageLabelEn: string;
  ageLabelUr: string;
  descEn: string;
  descUr: string;
  iconEmoji: string;
  badgeColor: string;
}

export const AGE_TIER_META: Record<LearnerAgeGroup, AgeTierMeta> = {
  kids: {
    id: "kids",
    titleEn: "Junior Explorer",
    titleUr: "جونیئر ایکسپلورر (بچے)",
    ageLabelEn: "Ages 7–12",
    ageLabelUr: "عمر ۷ تا ۱۲ سال",
    descEn: "Easy terms, fun characters like 'Doer Hero' and 'Action Words', with helpful hints.",
    descUr: "آسان ترین الفاظ جیسے 'کام والے لفظ' اور 'ہیرو فاعل'، رہنمائی اور مددگار اشاروں کے ساتھ۔",
    iconEmoji: "🧒",
    badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  standard: {
    id: "standard",
    titleEn: "Standard Learner",
    titleUr: "عام طالبِ علم",
    ageLabelEn: "Ages 13+",
    ageLabelUr: "عمر ۱۳ سال اور زائد",
    descEn: "Clear modern language with standard terms and Arabic in brackets.",
    descUr: "آسان جدید زبان، مناسب اصطلاحات اور قوسین میں عربی الفاظ۔",
    iconEmoji: "🎓",
    badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  },
  advanced: {
    id: "advanced",
    titleEn: "Traditional Scholar",
    titleUr: "روایتی عالم و طالبِ علم",
    ageLabelEn: "Advanced",
    ageLabelUr: "اعلیٰ درجے کا",
    descEn: "Formal classical Nahw and Sarf terminology for serious students.",
    descUr: "علم النحو اور صرف کی اصل کلاسیکی اصطلاحات اور گرامر قوانین۔",
    iconEmoji: "📖",
    badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  },
};

