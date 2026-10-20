# Noor Al-Quran (نور القرآن)

> **Version: 1.0.0**  
> A modern, accessible, and authentic Noble Quran web application built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Bun. Powered by authentic data from the Quran Foundation (Quran.com API v4).

---

## ✨ Features

- **📖 Authentic Quran Reader**
  - Full access to all 114 Surahs and 30 Juzs (Parts).
  - Authentic Uthmani script (Medina Mushaf) rendered with the Google `Amiri` Arabic font.
  - Authentic English translation by Dr. Mustafa Khattab (*The Clear Quran*).
  - Surah navigation (Previous / Next Surah, Ayah selector, Bismillah display).

- **🎧 Rich Audio Recitation**
  - Multi-reciter playback (Mishary Rashid Alafasy, AbdulBaset AbdulSamad, Mahmoud Khalil Al-Husary, and more).
  - Verse-by-verse recitation with active highlighting and automatic scrolling.
  - Sticky bottom audio player with scrubber, time display, and playback speed control (0.75x to 1.5x).
  - Memorization (Hifz) repeat modes: Play once, Loop 3x, or Continuous loop.

- **🔍 Interactive Word-by-Word Analysis**
  - Click on any Arabic word to hear its authentic pronunciation.
  - Hover or view transliteration and word translation directly below each token.
  - Can be toggled on/off in display preferences.

- **📜 Authentic Tafsir Ibn Kathir**
  - Read detailed abridged Tafsir Ibn Kathir for any Ayah directly inside an accessible in-app modal.

- **🔎 Real-Time Search**
  - Instant live keyword and translation search across the entire Noble Quran.
  - Click any search result to jump directly to the Ayah in reader view.

- **🔖 Bookmarks & Reading History**
  - Save favorite verses to local storage with one click.
  - Auto-tracked "Continue Where You Left Off" reading position.
  - Manage and clear bookmarks with app-based modal confirmations.

- **🎨 Multi-Theme Design & Scalable Typography**
  - **Modern Emerald & Gold**: Deep Islamic emerald with warm gold accents.
  - **Monochrome OLED**: Minimal high-contrast pitch black and pure white.
  - Dark / Light mode toggle.
  - Custom font scaling: Independent sliders for Arabic script (22px–52px) and English translation (13px–22px).

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS
- **Package Manager / Runtime**: Bun
- **Icons**: Lucide React
- **API Source**: Quran Foundation API v4 (`https://api.quran.com/api/v4/`)
- **Strict Data Policy**: 100% authentic live Quran text, audio, and tafsir. Zero mock, dummy, or fabricated data.
- **Single-Source Versioning**: App version is maintained in `package.json` (`v1.0.0`) and referenced dynamically across the UI through `src/config/version.ts`.

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.2+) or Node.js (v20+)

### Installation
```bash
bun install
```

### Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
bun run build
bun run start
```
