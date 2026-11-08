/**
 * Terminology Adaptation Engine
 * Translates Classical Arabic linguistic concepts into age-appropriate,
 * engaging terminology for kids (ages 7-12), standard learners, and advanced scholars.
 */

import { LearnerAgeGroup } from "@/types/learnerProfile";
import { VerbFormNumber } from "@/data/learning/quranGrammarData";

export interface AdaptedTerm {
  label: string;
  subLabel?: string;
  helpingTip?: string;
  formulaBadge?: string;
}

/**
 * Returns age-adapted Part of Speech labels (Noun, Verb, Particle)
 */
export function getPosLabel(
  pos: "noun" | "verb" | "particle" | "pronoun" | "preposition" | "demonstrative",
  ageGroup: LearnerAgeGroup = "standard",
  isUrdu: boolean = false
): AdaptedTerm {
  if (ageGroup === "kids") {
    switch (pos) {
      case "verb":
        return {
          label: isUrdu ? "ایکشن / کام والا لفظ 🏃" : "Action Word 🏃",
          subLabel: isUrdu ? "فعل (کچھ کرنا)" : "Verb (Something happening)",
          helpingTip: isUrdu
            ? "یہ لفظ بتاتا ہے کہ کوئی کام ہوا ہے، ہو رہا ہے یا کرو!"
            : "This word shows an action: someone did it, is doing it, or is told to do it!",
        };
      case "particle":
      case "preposition":
        return {
          label: isUrdu ? "جوڑنے والا چھوٹا لفظ 🔗" : "Little Connector 🔗",
          subLabel: isUrdu ? "حرف (جیسے میں، پر، سے)" : "Connector (in, on, from)",
          helpingTip: isUrdu
            ? "یہ چھوٹا لفظ دو باتوں کو آپس میں جوڑتا ہے!"
            : "A short helping word that connects other words together!",
        };
      case "noun":
      case "pronoun":
      case "demonstrative":
      default:
        return {
          label: isUrdu ? "نام / چیز والا لفظ 🏷️" : "Naming Word 🏷️",
          subLabel: isUrdu ? "اسم (شخص، جگہ، چیز)" : "Noun (Person, Place, Thing)",
          helpingTip: isUrdu
            ? "کسی بھی شخص، جگہ یا چیز کے نام کو بتاتا ہے!"
            : "Names a person, creature, place, or wonderful thing in the Quran!",
        };
    }
  }

  if (ageGroup === "advanced") {
    switch (pos) {
      case "verb":
        return { label: "الفعل", subLabel: isUrdu ? "فعل (ماض، مضارع، أمر)" : "Verb" };
      case "particle":
      case "preposition":
        return { label: "الحرف / أداة", subLabel: isUrdu ? "حرف جر / حرف ربط" : "Particle" };
      case "noun":
      case "pronoun":
      case "demonstrative":
      default:
        return { label: "الاسم", subLabel: isUrdu ? "اسم / ضمير / إشارة" : "Noun" };
    }
  }

  // Standard
  switch (pos) {
    case "verb":
      return { label: isUrdu ? "فعل (Verb)" : "Verb (فعل)", subLabel: isUrdu ? "کام" : "Action" };
    case "particle":
    case "preposition":
      return { label: isUrdu ? "حرف (Particle)" : "Particle (حرف)", subLabel: isUrdu ? "جوڑ" : "Preposition" };
    case "noun":
    case "pronoun":
    case "demonstrative":
    default:
      return { label: isUrdu ? "اسم (Noun)" : "Noun (اسم)", subLabel: isUrdu ? "نام" : "Noun" };
  }
}

/**
 * Returns age-adapted Verb Form titles and descriptions for Forms I through X
 */
export function getVerbFormLabel(
  formNumber: VerbFormNumber,
  ageGroup: LearnerAgeGroup = "standard",
  isUrdu: boolean = false
): { title: string; meaning: string; badge: string; helpingTip?: string } {
  if (ageGroup === "kids") {
    switch (formNumber) {
      case 1:
        return {
          title: isUrdu ? "آسان ۳ حروفی کام (فارم ۱)" : "Basic 3-Letter Action (Form 1)",
          meaning: isUrdu ? "سب سے آسان اور سادہ کام، جیسے 'خلق' (اس نے بنایا)۔" : "The simplest action, like 'He created' or 'He knew'.",
          badge: isUrdu ? "بنیادی سانچہ" : "Base Word",
          helpingTip: isUrdu
            ? "یہ سب سے عام لفظ ہے جس میں صرف ۳ سیدھے حروف ہوتے ہیں۔"
            : "This is the most common kind of action word with just 3 clean root letters!",
        };
      case 2:
        return {
          title: isUrdu ? "سپر ایکشن: زیادہ زور یا آہستہ آہستہ! ⚡ (فارم ۲)" : "Super Action: Extra Strong or Step-by-Step! ⚡ (Form 2)",
          meaning: isUrdu ? "درمیان میں جھٹکے (تشدید) کے ساتھ، جیسے 'علّم' (خوب سکھایا) یا 'نزّل' (آہستہ آہستہ اتارا)۔" : "Doubled middle sound! Means doing something with extra power or teaching step-by-step.",
          badge: isUrdu ? "زور دار ایکشن" : "Super Power",
          helpingTip: isUrdu
            ? "درمیانی حرف پر تشدید دیکھیں: یہ کام کو مضبوط یا لگاتار بنا دیتا ہے!"
            : "Look for the double sound (Shaddah) in the middle — it powers up the word!",
        };
      case 3:
        return {
          title: isUrdu ? "مل کر یا مقابلے میں کوشش کرنا! 🤝 (فارم ۳)" : "Teamwork or Struggling Hard! 🤝 (Form 3)",
          meaning: isUrdu ? "الف کی لمبی آواز کے ساتھ، جیسے 'جاہدوا' (سخت جدوجہد کی)۔" : "Long 'aa' sound! Means two sides interacting or working really hard together.",
          badge: isUrdu ? "باہمی جدوجہد" : "Striving Together",
          helpingTip: isUrdu ? "الف لمبا کر کے بولیں، اس میں محنت اور مقابلے کا احساس ہے۔" : "Stretching the first vowel means striving or interacting with someone else!",
        };
      case 4:
        return {
          title: isUrdu ? "جادوئی سبب: کام کروانا یا بھیجنا! ✨ (فارم ۴)" : "The Magic Causer: Making it Happen! ✨ (Form 4)",
          meaning: isUrdu ? "شروع میں 'اَ' کے ساتھ، جیسے 'أنزلنا' (ہم نے اتارا)۔" : "Starts with 'A'! Means causing something to happen completely, like 'We sent down'.",
          badge: isUrdu ? "کام کروانا" : "Causing Action",
          helpingTip: isUrdu ? "شروع کا الف بتاتا ہے کہ کسی نے دوسرے پر کام واقع کیا۔" : "The front Hamzah means causing something to happen decisively!",
        };
      case 5:
        return {
          title: isUrdu ? "خود سیکھنا اور گہرائی سے سوچنا! 🧠 (فارم ۵)" : "Deep Thinker: Thinking or Doing it Yourself! 🧠 (Form 5)",
          meaning: isUrdu ? "شروع میں 'ت'، جیسے 'یتدبرون' (غور و فکر کرتے ہیں) اور 'توکّل' (بھروسہ کیا)۔" : "Starts with 'Ta-'! Means absorbing the action yourself, reflecting, or trusting deeply.",
          badge: isUrdu ? "خود سوچنا" : "Self-Reflection",
          helpingTip: isUrdu ? "ت کے ساتھ شروع ہونے کا مطلب ہے کہ بندہ خود اپنے دل سے کام کر رہا ہے۔" : "When 'Ta-' is in front, the person is putting their whole heart into the action!",
        };
      case 6:
        return {
          title: isUrdu ? "سب کا آپس میں مل کر کام کرنا! 👥 (فارم ۶)" : "Mutual Friends: Doing it Together! 👥 (Form 6)",
          meaning: isUrdu ? "جیسے 'تعاونوا' (ایک دوسرے کی آپس میں مدد کرو)۔" : "Two or more people doing the exact same good thing for each other!",
          badge: isUrdu ? "آپس کی مدد" : "Mutual Action",
          helpingTip: isUrdu ? "دونوں طرف سے مل کر کام ہونے کو ظاہر کرتا ہے۔" : "Both sides are helping and sharing the action together!",
        };
      case 7:
        return {
          title: isUrdu ? "خود بخود ہو جانا! 🌊 (فارم ۷)" : "The Yielding Word: Splitting or Turning! 🌊 (Form 7)",
          meaning: isUrdu ? "شروع میں 'اِن'، جیسے 'انشقّت' (آسمان خود پھٹ گیا)۔" : "Starts with 'In-'! The thing splitting, breaking, or turning without fighting back.",
          badge: isUrdu ? "اثر قبول کرنا" : "Yielding",
        };
      case 8:
        return {
          title: isUrdu ? "اپنے فائدے کی سچی کوشش! 🎯 (فارم ۸)" : "Heart's Quest: Choosing the Good Path! 🎯 (Form 8)",
          meaning: isUrdu ? "درمیان میں 'ت'، جیسے 'اہتدىٰ' (اس نے خود سیدھا راستہ چن لیا)۔" : "Has 'Ta' inside! Means making an earnest personal choice to get guidance or follow.",
          badge: isUrdu ? "سچی جستجو" : "Earnest Pursuit",
        };
      case 9:
        return {
          title: isUrdu ? "روشن رنگوں کی تبدیلی! 🎨 (فارم ۹)" : "Super Colors: Turning Bright White or Dark! 🎨 (Form 9)",
          meaning: isUrdu ? "جیسے چہروں کا سفید یا چمکدار ہونا۔" : "Special word for faces turning gleaming white with happiness!",
          badge: isUrdu ? "رنگوں کا چمکنا" : "Luminous Colors",
        };
      case 10:
        return {
          title: isUrdu ? "مدد مانگنے والا ہیرو: دعا اور التجا! 🤲 (فارم ۱۰)" : "The Helper Seeker: Asking & Requesting! 🤲 (Form 10)",
          meaning: isUrdu ? "شروع میں 'است'، جیسے 'استغفروا' (معافی مانگو) اور 'نستعین' (ہم مدد مانگتے ہیں)۔" : "Starts with 'Ista-'! It means asking Allah for something amazing like forgiveness or help!",
          badge: isUrdu ? "دعا و طلب" : "Seeking Help",
          helpingTip: isUrdu ? "جہاں بھی 'است' دیکھیں، سمجھ جائیں کہ کوئی پیاری دعا یا مدد مانگی جا رہی ہے!" : "Whenever you spot 'Ista-' at the front, someone is asking for help or forgiveness!",
        };
    }
  }

  if (ageGroup === "advanced") {
    switch (formNumber) {
      case 1: return { title: "الثلاثي المجرد (فَعَلَ)", meaning: "الأصل والأساس المجرد من الزوائد", badge: "مجرد" };
      case 2: return { title: "باب التفعيل (فَعَّلَ)", meaning: "للتكثير والمبالغة والتعدية والتدريج", badge: "تفعيل" };
      case 3: return { title: "باب المفاعلة (فَاعَلَ)", meaning: "للمشاركة والمغالبة والموالاة", badge: "مفاعلة" };
      case 4: return { title: "باب الإفعال (أَفْعَلَ)", meaning: "للتعدية والهمزة والنزول الدفعي", badge: "إفعال" };
      case 5: return { title: "باب التفعّل (تَفَعَّلَ)", meaning: "لمطاوعة التفعيل والتكلف والتدبر", badge: "تفعّل" };
      case 6: return { title: "باب التفاعل (تَفَاعَلَ)", meaning: "للمشاركة بين اثنين فأكثر والتظاهر", badge: "تفاعل" };
      case 7: return { title: "باب الانفعال (اِنْفَعَلَ)", meaning: "لمطاوعة الثلاثي ولا يكون إلا لازماً", badge: "انفعال" };
      case 8: return { title: "باب الافتعال (اِفْتَعَلَ)", meaning: "للاتخاذ والاجتهاد والطلب", badge: "افتعال" };
      case 9: return { title: "باب الافعلال (اِفْعَلَّ)", meaning: "لقوة اللون والعيوب", badge: "افعلال" };
      case 10: return { title: "باب الاستفعال (اِسْتَفْعَلَ)", meaning: "للطلب والتحول والاعتقاد", badge: "استفعال" };
    }
  }

  // Standard
  switch (formNumber) {
    case 1: return { title: isUrdu ? "ثلاثی مجرد (Form I)" : "Form I: Basic Triliteral", meaning: isUrdu ? "بنیادی مفہوم" : "Base Root Meaning", badge: "Form I" };
    case 2: return { title: isUrdu ? "باب التفعیل (Form II)" : "Form II: Intensive / Gradual", meaning: isUrdu ? "مبالغہ اور تدریج" : "Intensification & Gradual Action", badge: "Form II" };
    case 3: return { title: isUrdu ? "باب المفاعلہ (Form III)" : "Form III: Associative / Striving", meaning: isUrdu ? "باہمی کوشش" : "Mutual Effort & Striving", badge: "Form III" };
    case 4: return { title: isUrdu ? "باب الإفعال (Form IV)" : "Form IV: Causative Transitive", meaning: isUrdu ? "تعدیہ اور سبب بننا" : "Causation & Decisive Action", badge: "Form IV" };
    case 5: return { title: isUrdu ? "باب التفعّل (Form V)" : "Form V: Reflexive / Contemplative", meaning: isUrdu ? "تدبر اور خود سیکھنا" : "Self-Contemplation & Gradual Growth", badge: "Form V" };
    case 6: return { title: isUrdu ? "باب التفاعل (Form VI)" : "Form VI: Mutual Reciprocity", meaning: isUrdu ? "باہمی اشتراک" : "Reciprocal Action Between Parties", badge: "Form VI" };
    case 7: return { title: isUrdu ? "باب الانفعال (Form VII)" : "Form VII: Involuntary Reflexive", meaning: isUrdu ? "اثر قبول کرنا" : "Yielding & Passive Transformation", badge: "Form VII" };
    case 8: return { title: isUrdu ? "باب الافتعال (Form VIII)" : "Form VIII: Earnest Pursuit", meaning: isUrdu ? "اہتمام اور کوشش" : "Deliberate Effort & Acquisition", badge: "Form VIII" };
    case 9: return { title: isUrdu ? "باب الافعلال (Form IX)" : "Form IX: Colors & Physical States", meaning: isUrdu ? "رنگوں کی شدت" : "Intense Colors & Physical States", badge: "Form IX" };
    case 10: return { title: isUrdu ? "باب الاستفعال (Form X)" : "Form X: Seeking / Requesting", meaning: isUrdu ? "طلب اور دعا" : "Seeking & Requesting (Talab)", badge: "Form X" };
  }
}

/**
 * Returns age-adapted Case Ending (I'rab) explanations
 */
export function getCaseEndingExplanation(
  caseType: "raf" | "nasb" | "jarr",
  ageGroup: LearnerAgeGroup = "standard",
  isUrdu: boolean = false
): AdaptedTerm {
  if (ageGroup === "kids") {
    switch (caseType) {
      case "raf":
        return {
          label: isUrdu ? "ہیرو فاعل: کام کرنے والا! 🦸‍♂️ (پیش)" : "The Doer Hero! 🦸‍♂️ (Ends with Pesh)",
          subLabel: isUrdu ? "پیش (ضمہ) بتاتا ہے کہ یہ اصل ہیرو ہے جس نے کام کیا" : "Ends with Pesh (Dhammah) — Who did the action!",
          helpingTip: isUrdu ? "جب بھی پیش دیکھیں، پوچھیں: 'یہ کام کس نے کیا؟'" : "When you see Pesh (Dhammah), ask: 'Who is the hero doing this?'",
          formulaBadge: isUrdu ? "کام کرنے والا = پیش (ضمہ)" : "Doer Hero = Pesh (ـُ)",
        };
      case "nasb":
        return {
          label: isUrdu ? "کیا ہوا؟ / نشانہ! 🎯 (زبر)" : "What Happened? / The Target 🎯 (Ends with Zabar)",
          subLabel: isUrdu ? "زبر (فتحہ) بتاتا ہے کہ کام کس چیز پر ہوا یا کہاں ہوا" : "Ends with Zabar (Fathah) — Details & What was done!",
          helpingTip: isUrdu ? "زبر بتاتا ہے: کیا؟ کس کو؟ کہاں؟ یا کب؟" : "Zabar tells us the details: What? Whom? Where? or How?",
          formulaBadge: isUrdu ? "تفصیل یا نشانہ = زبر (فتحہ)" : "Detail Target = Zabar (ـَ)",
        };
      case "jarr":
        return {
          label: isUrdu ? "ملکیت یا پتا بتانے والا! 🧲 (زیر)" : "Belonging & Location 🧲 (Ends with Zer)",
          subLabel: isUrdu ? "زیر (کسرہ) بتاتا ہے کہ یہ کس کی چیز ہے یا کس جگہ ہے" : "Ends with Zer (Kasrah) — After small connector words or showing belonging!",
          helpingTip: isUrdu ? "چھوٹے لفظ (جیسے 'فی' یا 'من') کے بعد آنے والے پر زیر آتی ہے!" : "Comes after little connectors like 'in', 'from', or shows ownership!",
          formulaBadge: isUrdu ? "تعلق یا پتا = زیر (کسرہ)" : "Belonging = Zer (ـِ)",
        };
    }
  }

  if (ageGroup === "advanced") {
    switch (caseType) {
      case "raf":
        return {
          label: "حالة الرفع (الضمة والواو والألف)",
          subLabel: isUrdu ? "علامتِ فاعلیت ومبتدأ" : "Nominative Case (Subject/Doer)",
          formulaBadge: "فاعل / مبتدأ = مرفوع",
        };
      case "nasb":
        return {
          label: "حالة النصب (الفتحة والياء)",
          subLabel: isUrdu ? "علامتِ مفعولیت وتفصیل" : "Accusative Case (Object/Details)",
          formulaBadge: "مفعول به / حال = منصوب",
        };
      case "jarr":
        return {
          label: "حالة الجر (الكسرة والياء)",
          subLabel: isUrdu ? "علامتِ اضافت وحروفِ جارہ" : "Genitive Case (Possessive/Prepositional)",
          formulaBadge: "مضاف إليه / مجرور = مجرور",
        };
    }
  }

  // Standard
  switch (caseType) {
    case "raf":
      return {
        label: isUrdu ? "حالتِ رفع (Doer / پیش)" : "Raf' (The Doer / Dhammah)",
        subLabel: isUrdu ? "فاعل اور مبتدا (پیش والا)" : "Subject and Doer of action",
        formulaBadge: "Doer (Fā'il) = Marfū' (ـُ)",
      };
    case "nasb":
      return {
        label: isUrdu ? "حالتِ نصب (Object / زبر)" : "Nasb (Object & Details / Fathah)",
        subLabel: isUrdu ? "مفعول اور تفصیل (زبر والا)" : "Direct object and circumstances",
        formulaBadge: "Object (Maf'ūl) = Mansūb (ـَ)",
      };
    case "jarr":
      return {
        label: isUrdu ? "حالتِ جر (Preposition / زیر)" : "Jarr (After Preposition & Possession / Kasrah)",
        subLabel: isUrdu ? "حرفِ جر کے بعد اور مضاف الیہ (زیر والا)" : "After prepositions & possessor",
        formulaBadge: "Possessed / Preposition = Majrūr (ـِ)",
      };
  }
}

/**
 * Returns age-adapted Compound (Murakkab) explanations
 */
export function getCompoundExplanation(
  compoundType: "idafah" | "tawsifi",
  ageGroup: LearnerAgeGroup = "standard",
  isUrdu: boolean = false
): AdaptedTerm {
  if (ageGroup === "kids") {
    switch (compoundType) {
      case "idafah":
        return {
          label: isUrdu ? "ملکیت کی جوڑی ('X of Y') 📦" : "Belonging Pair ('X of Y') 📦",
          subLabel: isUrdu ? "جیسے: 'کتابُ اللہ' (اللہ کی کتاب)" : "Like: 'Book of Allah' or 'Lord of the Worlds'",
          helpingTip: isUrdu
            ? "پہلے لفظ پر 'ال' نہیں ہوتا، اور دوسرے لفظ کے نیچے زیر ہوتی ہے!"
            : "First word has no 'Al', and the second word has Zer (Kasrah)!",
          formulaBadge: isUrdu ? "چیز + مالک = ملکیت کی جوڑی" : "Thing + Owner = Belonging Pair",
        };
      case "tawsifi":
        return {
          label: isUrdu ? "جڑواں خوبی والی جوڑی 👯" : "Twin Description Pair 👯",
          subLabel: isUrdu ? "جیسے: 'الصراط المستقیم' (سیدھا راستہ)" : "Like: 'The Straight Path' (Noun + Match Quality)",
          helpingTip: isUrdu
            ? "دونوں لفظ جڑواں بھائیوں جیسے ہوتے ہیں: دونوں پر 'ال' اور دونوں کے اعراب ایک جیسے!"
            : "Both words look like twins: both have 'Al' and the exact same ending sound!",
          formulaBadge: isUrdu ? "نام + اس کی خوبی = جڑواں جوڑی" : "Word + Matching Quality = Twin Pair",
        };
    }
  }

  if (ageGroup === "advanced") {
    switch (compoundType) {
      case "idafah":
        return {
          label: "المركب الإضافي (المضاف والمضاف إليه)",
          subLabel: isUrdu ? "تجريد المضاف من التنوين وال التعريف وجر المضاف إليه" : "Possessive Construct",
          formulaBadge: "مضاف (بدون ال) + مضاف إليه (مجرور)",
        };
      case "tawsifi":
        return {
          label: "المركب التوصيفي (النعت والمنعوت)",
          subLabel: isUrdu ? "تطابق النعت للمنعوت في الإعراب والتعريف والتذكير والعدد" : "Adjective Phrase",
          formulaBadge: "موصوف + صفة (تطابق تام)",
        };
    }
  }

  // Standard
  switch (compoundType) {
    case "idafah":
      return {
        label: isUrdu ? "مرکب اضافی (Possessive Idafah)" : "Murakkab Idāfi (Possessive Pair)",
        subLabel: isUrdu ? "مضاف اور مضاف الیہ (X of Y)" : "Possessed and Possessor",
        formulaBadge: "Mudāf (No Al) + Mudāf Ilayh (Majrūr)",
      };
    case "tawsifi":
      return {
        label: isUrdu ? "مرکب توصیفی (Adjective Phrase)" : "Murakkab Tawsīfi (Description Phrase)",
        subLabel: isUrdu ? "موصوف اور صفت (خوبی کی مطابقت)" : "Noun and matching Adjective",
        formulaBadge: "Mawsūf + Sifah (4-Way Match)",
      };
  }
}

