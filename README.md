# Noor Al-Quran (نور القرآن)

> **Version: 1.40.0**  
> An authentic, high-performance, and multi-platform Noble Quran workstation, web application, desktop app, and mobile app. Built with **Next.js 16 (React 19)**, **Tauri v2 (Rust)**, **TypeScript**, **Tailwind CSS 4**, and **Bun**. Powered by authentic data from the Quran Foundation (Quran.com API v4).

[![Web App Deployment](https://img.shields.io/badge/Live%20Web%20App-GitHub%20Pages-emerald?style=flat-square&logo=github)](https://picwellwisher12pk.github.io/noor-al-quran/)
[![Version](https://img.shields.io/badge/Version-1.40.0-blue?style=flat-square)](package.json)
[![Framework](https://img.shields.io/badge/Next.js-16%20(React%2019)-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Desktop & Mobile](https://img.shields.io/badge/Tauri-v2%20(Rust)-orange?style=flat-square&logo=tauri)](https://v2.tauri.app/)
[![Runtime](https://img.shields.io/badge/Runtime-Bun-f472b6?style=flat-square&logo=bun)](https://bun.sh/)
[![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

---

## 🌐 Live Web App & Multi-Platform Downloads

Access Noor Al-Quran instantly in your browser or download native installers for your operating system:

- **Live Web Application**: [https://picwellwisher12pk.github.io/noor-al-quran/](https://picwellwisher12pk.github.io/noor-al-quran/)
- **Marketing & Downloads Hub**: [https://picwellwisher12pk.github.io/noor-al-quran/download/](https://picwellwisher12pk.github.io/noor-al-quran/download/)
- **Native Desktop Installers**:
  - **🪟 Windows (x64 / ARM64)**: [NSIS Installer (`.exe`)](https://github.com/picwellwisher12pk/noor-al-quran/releases/latest/download/Noor-Al-Quran_x64-setup.exe) & [WiX MSI (`.msi`)](https://github.com/picwellwisher12pk/noor-al-quran/releases/latest/download/Noor-Al-Quran_x64_en-US.msi)
  - **🐧 Linux (x64)**: [Standalone Portable (`.AppImage`)](https://github.com/picwellwisher12pk/noor-al-quran/releases/latest/download/noor-al-quran_amd64.AppImage) & [Debian Package (`.deb`)](https://github.com/picwellwisher12pk/noor-al-quran/releases/latest/download/noor-al-quran_amd64.deb)
  - **🍎 macOS (Universal)**: [Apple Silicon & Intel Disk Image (`.dmg`)](https://github.com/picwellwisher12pk/noor-al-quran/releases/latest/download/Noor-Al-Quran.dmg)
- **🤖 Android Mobile App**:
  - [Universal Release APK (Auto-signed)](https://github.com/picwellwisher12pk/noor-al-quran/releases/latest/download/noor-al-quran-universal-release.apk) & [Direct Debug APK](https://github.com/picwellwisher12pk/noor-al-quran/releases/latest/download/noor-al-quran-debug.apk)
- **All Releases & Checksums**: [GitHub Releases](https://github.com/picwellwisher12pk/noor-al-quran/releases)

*All native desktop binaries and Android APK packages are compiled and signed automatically on every release via GitHub Actions.*

---

## ✨ Features Overview

### 🎙️ Voice Recitation Verse Identifier (AI-Powered Audio & Speech Matching)
- **Recite to Find Any Verse**: Recite or speak any Quranic Ayah into your microphone to identify its exact Surah and verse number within milliseconds.
- **Complete Authentic Corpus**: Inverted index spanning all 6,236 authentic Quranic verses (`src/data/quranVersesCorpus.json`).
- **Sub-100ms Inverted Token Search**: Custom phonetic Arabic consonant mapping with automatic diacritic stripping, hamza normalization, and sliding multi-ayah window matching.
- **Multi-Engine Speech Recognition**:
  - Browser Web Speech API (`ar-SA`) for client-side zero-cost matching.
  - Groq Whisper Large v3 for ultra-low latency cloud transcription.
  - Google Gemini Flash & OpenAI Whisper for fallback speech matching.
- **Interactive Studio UI**: Real-time audio waveform visualizer, transcript preview, confidence scoring, playback review, and 1-tap navigation directly to the verse in the Quran Reader.
- **Fast Hotkey Access**: Global shortcut `Ctrl + Shift + R` or microphone trigger in headers.

---

### 📖 Authentic Quran Reader & Continuous Workstation
- **Complete Quranic Text**: Full access to all 114 Surahs and 30 Juzs (Parts).
- **Medina Mushaf Standard**: Authentic Uthmani script rendered using Medina Mushaf standards with 8 classical and modern Arabic calligraphy typefaces (Amiri, Amiri Quran, Noto Naskh, Lateef, Scheherazade New, Cairo, Noto Sans Arabic, Noto Nastaliq Urdu).
- **Tri-lingual Directory Cards**: Chapter cards display Arabic, Urdu, and English names and translations for seamless navigation.
- **Infinite Verse Auto-Loading & Eager Preloading**:
  - Progressive infinite streaming: verses load automatically as you scroll or as recitation advances.
  - Eliminates manual "Load More" button clicks with concurrent API fetching and background pre-buffering.
- **Authentic Sajdah (Prostration) Indications**:
  - Authentic Sajdah symbols and badges on obligatory and recommended Sajdah verses.
  - Jurisprudence guidance rules explaining the conditions and Sunnah of Tilawah Sajdah.
- **Tajweed Waqf Rules Guidance**:
  - Dedicated reference modal detailing Quranic stopping signs (compulsory, prohibited, preferred, permissible).
- **Multilingual Translations**: English translation by Dr. Mustafa Khattab (*The Clear Quran*), Saheeh International, and Urdu translations by Fateh Muhammad Jalandhari and Tahir-ul-Qadri.

---

### 🔍 Interactive Linguistic Inspector & Word Morphology Breakdown
- **Interactive Word Inspection**: Click any Arabic word token in continuous or compact reading mode to inspect its detailed grammatical breakdown.
- **Morphological Analysis**:
  - Parts of speech classification (*Ism*, *Fi'l*, *Harf*).
  - Arabic root letters and grammatical lemma.
  - Authentic word-by-word transliteration and English/Urdu translations.
  - Authentic audio token pronunciation on click.
- **Comparative Scholar Translations**: Side-by-side translation comparison from multiple world-renowned Islamic scholars.
- **Authentic Tafsir Ibn Kathir**: Comprehensive abridged commentary with custom font scaling and Arabic formatting.
- **Verse & Word-Level Notes & Tadabbur**: Write personal reflections and notes linked to specific verses or words with persistent local storage.

---

### 🎧 High-Fidelity Multi-Reciter Studio & Dual Audio Engine
- **Renowned Reciters**: Mishary Rashid Alafasy, AbdulBaset AbdulSamad, Mahmoud Khalil Al-Husary, Abu Bakr Al-Shatri, and more.
- **Dual Audio Engine with Sequential Translation**:
  - Individual ultra-thin seekbars and separate audio players for Arabic Recitation and Translation recitation.
  - **Sequential Playback Queue**: Automatically plays the English or Urdu translation audio immediately following the Arabic recitation for verse-by-verse comprehension.
- **Synchronized Playback**: Verse-by-verse recitation with active highlighting and smooth automatic scrolling.
- **Hifz Memorization Repeat Loops**: Single Ayah, Loop 3x, or Continuous looping for focused Quranic revision.
- **Proactive Next-Verse Audio Preloading**: Background audio pre-buffering for zero playback lag between verses.

---

### 📱 Mobile UX Redesign & Ergonomic Touch Navigation
- **Unified Mobile Header**: Compact header displaying active Surah badge, quick search, recitation identifier trigger, and dark/light mode toggle.
- **Distraction-Free Reading Canvas**: Full-width verses with safe-area insets respecting mobile notches and status bars.
- **Floating Active Ayah Dock**: Sticky bottom controller displaying current Ayah, playback state, and instant inspector access.
- **Touch-Optimized Drawers**: Bottom sheets and side drawers for quick Surah, Juz, and linguistic exploration.
- **Progressive Web App (PWA)**: Installable to the home screen on iOS and Android with offline caching.

---

### 🖥️ Native Desktop Shell & Workstation Architecture (Tauri v2 & Rust)
- **Cross-Platform Native Binaries**: Lightweight, memory-efficient desktop applications for Windows, Linux, and macOS.
- **Custom Frameless Title Bar**: Window title bar with OS drag regions and native minimize, maximize/restore, and close buttons.
- **Desktop Activity Bar & Explorer**: Collapsible left sidebar for quick navigation between Reader, Learn Arcade, and Calendar.
- **Draggable Live Floating Settings**: Repositionable live settings panel for adjusting font sizes and themes in real-time.
- **In-App Automated Update Checker**: Background release checker with a notification banner when a new version is released.

---

### 🎮 Gamified Quran Learning Suite & Arcade (`/learn`)
- **Spaced Repetition System (SM-2 Algorithm)**: Flashcards designed to master the top 70% of Quranic vocabulary.
- **Sirat Al-Noor Skill Journey**: 5-stage learning progression featuring Experience Points (XP), daily streaks, milestones, and learner avatars.
- **Arcade Mini-Games**:
  - **Ayah Fill**: Fill-in-the-blank verse completion challenge.
  - **Match Blitz**: Rapid Arabic-to-English token matching under the clock.
  - **Meaning Quiz**: Multiple-choice vocabulary comprehension.
  - **Word Families**: Root-word identification and morphological derivations.
- **Grammar & Verbs Studio**: Interactive 10 Verb Forms (*Sarf*), *I'rab* cases, and grammatical part-of-speech classifier.
- **Personal Word Bank & SRS Review Vault**: Review due flashcards and practice tagged difficult vocabulary.

---

### 🗓️ Islamic Hijri Calendar & Astronomical Prayer Times (`/calendar`)
- **Accurate Hijri Dates**: Authentic lunar calendar calculations synchronized with significant Islamic dates.
- **Astronomical Prayer Timetable**: Geolocation-based calculation engine for Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha.
- **Sunnah Khatmah Goal Tracker**: Khatmah planning with 7-day Sunnah minimum pacing guidance to prevent rushed reading.
- **Reading Activity Heatmap**: Daily reading minute tracker with consistency streak counter.

---

### 🎨 8 Calligraphy Fonts & Modern OKLCH Themes
- **8 Medina Mushaf Typefaces**: Amiri, Amiri Quran, Noto Naskh, Lateef, Scheherazade New, Cairo, Noto Sans Arabic, Noto Nastaliq Urdu.
- **Semantic OKLCH Color Tokens**:
  - Islamic Emerald & Gold
  - Monochrome OLED (pure pitch black & white)
  - Hadith Classical Theme
- **100% Dark & Light Mode Ready**: High contrast, WCAG-compliant styling across every component.

---

### 📥 Offline Download Manager
- **Complete Surah & Audio Downloads**: Download full Surahs, translations, and audio recitation packs for completely offline use.
- **Real-Time Storage Estimation**: Live byte counters and progress metrics for downloaded assets.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Language & Typing** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Native Shell** | [Tauri v2](https://v2.tauri.app/) (Rust 2021 edition) |
| **Styling & Theming** | [Tailwind CSS 4](https://tailwindcss.com/) with OKLCH CSS Variables |
| **Package Manager & Runtime**| [Bun](https://bun.sh/) (v1.2+) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) with persistent local storage |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Data Sources** | Quran Foundation API v4 (`api.quran.com`) & Aladhan Astronomical API |
| **Voice / AI Matching** | Web Speech API, Groq Whisper Large v3, Google Gemini Flash, OpenAI Whisper |

---

## 🤖 Automated CI/CD Pipelines

The project utilizes automated GitHub Actions workflows running on every push and tag release:

1. **Deploy Web App** ([`.github/workflows/deploy-web.yml`](.github/workflows/deploy-web.yml))
   - Static Next.js export compiled via Bun with `output: "export"`.
   - Automatically deployed to GitHub Pages at [https://picwellwisher12pk.github.io/noor-al-quran/](https://picwellwisher12pk.github.io/noor-al-quran/).

2. **Build Desktop Apps** ([`.github/workflows/build-desktop.yml`](.github/workflows/build-desktop.yml))
   - Matrix builds across `windows-latest`, `ubuntu-22.04`, and `macos-latest`.
   - Packages Windows `.exe`/`.msi`, Linux `.deb`/`.AppImage`, and macOS `.dmg`.

3. **Build Android APK** ([`.github/workflows/build-android.yml`](.github/workflows/build-android.yml))
   - Compiles Tauri v2 Android target (`aarch64` and universal).
   - Injects audio recording permissions and automatically signs release APKs with `zipalign` and `apksigner`.

4. **Release Automation** ([`.github/workflows/release.yml`](.github/workflows/release.yml) & `scripts/release.ts`)
   - Unified multi-target release pipeline orchestrating Web, Desktop, and Mobile builds.

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.2+)
- [Rust](https://www.rust-lang.org/) (v1.75+ for native desktop compilation)
- C++ build tools (Visual Studio on Windows, `build-essential` on Linux, Xcode on macOS)

### Installation
```bash
bun install
```

### Development Server (Web)
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Native Desktop Development (Tauri)
```bash
bun run tauri:dev
```

### Production Web Build
```bash
bun run build
```

### Production Desktop Build
```bash
bun run tauri:build
```
Installer packages are generated in `src-tauri/target/release/bundle/`.

---

## 📌 Development Standards & Policies

- **Strict Data Policy**: ZERO fabricated, fake, or mock Quranic or prayer data. All text, audio, transliterations, tafsir, and prayer schedules are authentic.
- **Single-Source Versioning**: App version is maintained exclusively in [`package.json`](package.json) and automatically synchronized across `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `updater/latest.json`, and runtime metadata using:
  ```bash
  bun run version:sync
  ```
- **Theme Compatibility**: Every component is strictly dark mode and light mode ready with semantic CSS variables and high-contrast accessibility.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Quranic text, word-by-word data, and audio recitations are provided with gratitude through the Quran Foundation and Quran.com API.
