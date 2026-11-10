/**
 * Tafseer Text Parser & Formatter
 * Formats Quranic Tafseer (Ibn Kathir, Bayan-ul-Quran, Fi Zilal, Tazkir, etc.)
 * with authentic Urdu/Arabic typography, line height, paragraph spacing, and citation badges.
 */

export function parseAndFormatTafsir(rawText: string, isUrdu = false): string {
  if (!rawText || typeof rawText !== "string") {
    return "";
  }

  let text = rawText.trim();

  // 1. Detect and format leading titles / headings (e.g. ** الحمد اللہ کی تفسیر ** or الحمد اللہ کی تفسیر ٭٭ or سورہ فاتحہ کے نام:)
  // Case A: Starting with ** ... ** or ٭٭ ... ٭٭
  text = text.replace(
    /^(\*{2}|٭{1,2})\s*([^<*٭\n]+?)\s*(\*{2}|٭{1,2})/g,
    '<div class="tafsir-heading-box"><h3 class="tafsir-heading">$2</h3></div>'
  );

  // Case B: Starting with title followed by ٭٭ or ** or :<div
  text = text.replace(
    /^([^<٭\*\n]{4,60}?)(?:\s*٭{1,2}|\s*\*{2}|:\s*(?=<div|<p))/,
    '<div class="tafsir-heading-box"><h3 class="tafsir-heading">$1</h3></div>'
  );

  // 2. Parse inline markdown bold: **bold text**
  text = text.replace(/\*\*([^*\n]+?)\*\*/g, '<strong class="tafsir-strong">$1</strong>');

  // 3. Highlight Arabic Quranic tokens in quotes: «...»
  text = text.replace(
    /«([^»\n]+?)»/g,
    '<span class="tafsir-arabic" dir="rtl">«$1»</span>'
  );

  // 4. Style citations like [تفسیر ابن جریر: 125/1] or [صفحہ نمبر 26] or [125/1]
  text = text.replace(
    /\[([^\]\n]{2,40})\]/g,
    '<span class="tafsir-citation" dir="auto">[$1]</span>'
  );

  // 5. If the raw text does not contain HTML <p> tags, convert newlines into <p> tags
  if (!text.includes("<p") && !text.includes("<div")) {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    text = paragraphs
      .map((p) => `<p class="tafsir-paragraph">${p.replace(/\n/g, "<br />")}</p>`)
      .join("");
  } else {
    // If it contains existing <p> tags, ensure they have proper class and spacing
    text = text.replace(/<p([^>]*)>/g, '<p class="tafsir-paragraph"$1>');
  }

  return text;
}

