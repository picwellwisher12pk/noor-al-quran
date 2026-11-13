# Noor Al-Quran (نور القرآن)

> **Version: 1.34.5**  
> An authentic, high-performance, and multi-platform Noble Quran workstation, web application, desktop app, and mobile app. Built with **Next.js 16 (React 19)**, **Tauri v2 (Rust)**, **TypeScript**, **Tailwind CSS**, and **Bun**. Powered by authentic data from the Quran Foundation (Quran.com API v4).

[![Web App Deployment](https://img.shields.io/badge/Live%20Web%20App-GitHub%20Pages-emerald?style=flat-square&logo=github)](https://picwellwisher12pk.github.io/noor-al-quran/)
[![Version](https://img.shields.io/badge/Version-1.34.5-blue?style=flat-square)](package.json)
[![Framework](https://img.shields.io/badge/Next.js-16%20(React%2019)-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Desktop & Mobile](https://img.shields.io/badge/Tauri-v2%20(Rust)-orange?style=flat-square&logo=tauri)](https://v2.tauri.app/)
[![Runtime](https://img.shields.io/badge/Runtime-Bun-f472b6?style=flat-square&logo=bun)](https://bun.sh/)
[![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

---

## 🌐 Live Web App & Downloads

- **Live Web App**: [https://picwellwisher12pk.github.io/noor-al-quran/](https://picwellwisher12pk.github.io/noor-al-quran/)
- **Native Desktop Installers**:
  - **Windows (x64)**: NSIS Installer (`.exe`) & WiX MSI (`.msi`)
  - **Linux (x64)**: Debian Package (`.deb`) & Portable (`.AppImage`)
  - **macOS**: Apple Silicon & Intel Disk Image (`.dmg`) & App Bundle (`.app`)
- **Android Mobile App**:
  - Release Universal APK (Auto-signed) & Debug APK (1-tap direct install)

*All binaries and installers are generated automatically on every push via GitHub Actions.*

---

## ✨ Features Overview

### 🎙️ Voice Recitation Verse Identifier (AI-Powered Audio & Speech Matching)
- **Recite to Find Any Verse**: Speak or recite into your microphone to identify the exact Ayah instantly.
- **Complete Authentic Corpus**: Integrated 6,236 authentic Quranic verses (`src/data/quranVersesCorpus.json`).
- **Sub-100ms Inverted Token Search**: Built with custom phonetic consonant mapping (normalizing Arabic diacritics, hamzas, and taa marbutas) and dynamic multi-ayah window matching.
- **Multi-Engine Speech Recognition**:
  - Browser Web Speech API (`ar-SA`) for zero-cost offline/client-side matching.
  - Groq Whisper Large v3 for ultra-low latency transcription.
  - Google Gemini Flash & OpenAI Whisper for cloud fallback.
- **Interactive UI**: Live audio waveform visualizer, real-time transcript preview, confidence scoring, audio recording playback, and one-tap jump directly to the verse in the Quran Reader.
- **Fast Access**: Microphone trigger in navigation headers or global hotkey `Ctrl + Shift + R`.

---

### 📖 Authentic Quran Reader & Study Workstation
- **Complete Quranic Text**: Full access to all 114 Surahs and 30 Juzs (Parts).
- **Authentic Uthmani Script**: Rendered with the Medina Mushaf standard using the Google `Amiri` Arabic font.
- **Authentic Translations**: English translation by Dr. Mustafa Khattab (*The Clear Quran*) with customizable translation toggle.
- **Interactive Word-by-Word Analysis**:
  - Click on any Arabic word token to hear its individual authentic pronunciation.
  - Transliteration and word translation directly below each token.
  - Morphological insights and grammar classification.
- **Authentic Tafsir Ibn Kathir**: Read detailed abridged commentary for any Ayah directly inside an accessible modal.
- **Surah & Ayah Navigation**: Quick jumper, Bismillah header display, previous/next Surah navigation, and Juz index.

---

### 🎧 Rich Multi-Reciter Audio Engine
- **Renowned Reciters**: Mishary Rashid Alafasy, AbdulBaset AbdulSamad, Mahmoud Khalil Al-Husary, and more.
- **Synchronized Playback**: Verse-by-verse recitation with active highlighting and smooth automatic scrolling.
- **Advanced Sticky Audio Bar**: Seekable scrubber, time display, reciter switcher, and variable playback speed (0.75x to 1.5x).
- **Memorization (Hifz) Repeat Modes**: Play once, Loop 3x, or Continuous loop for focused revision.

---

### 🎮 Quran Learning Suite & Arcade (`/learn`)
A gamified Islamic learning ecosystem designed for all ages:
- **Quran Vocabulary Flashcards**: Spaced repetition system (SuperMemo SM-2 algorithm) for mastering high-frequency Quranic words.
- **Grammar Classifier**: Interactive Arabic parts of speech analyzer (*Ism*, *Fi'l*, *Harf*).
- **Arcade Mini-Games**:
  - **Ayah Fill**: Fill-in-the-blank verse completion challenge.
  - **Match Blitz**: Fast-paced Arabic-to-English token matching.
  - **Meaning Quiz**: Multiple-choice vocabulary comprehension under the clock.
  - **Word Families**: Root-word identification and derivations.
- **Sirat Learning Journey**: Experience Points (XP), daily recitation streaks, badges, and learning milestones.
- **Personal Word Bank**: Save difficult words, track mastery status, and review tagged vocabulary.

---

### 🗓️ Islamic Hijri Calendar & Prayer Timetable (`/calendar`)
- **Accurate Hijri Dates**: Authentic lunar calendar calculations synchronized with significant Islamic dates.
- **Daily Prayer Timetable**: Astronomical calculation engine for Fajr, Dhuhr, Asr, Maghrib, and Isha based on user location.

---

### ☁️ Google Drive Cloud Backup & Synchronization
- **Multi-Device Synchronization**: Sync bookmarks, reading history, notes, and learning progress across Desktop, Mobile, and Web.
- **Privacy-First**: Direct client-to-cloud sync via personal Google Drive. Zero intermediary servers or proprietary database storage.

---

### 🎨 Adaptive Design & Scalable Typography
- **Modern Themes**:
  - **Islamic Emerald & Gold**: Deep emerald with warm gold accents.
  - **Monochrome OLED**: Minimal high-contrast pitch black and pure white.
  - **Adaptive Dark / Light Mode**: Full contrast compliance across every UI component.
- **Custom Font Scaling**: Independent controls for Arabic script (22px–52px) and translation (13px–22px).

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Language & Typing** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Native Shell** | [Tauri v2](https://v2.tauri.app/) (Rust 2021 edition) |
| **Styling & Theming** | [Tailwind CSS 4](https://tailwindcss.com/) with CSS Variables |
| **Package Manager & Runtime**| [Bun](https://bun.sh/) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) with persistent local storage |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Data Sources** | Quran Foundation API v4 (`api.quran.com`) & Aladhan Astronomical API |
| **Voice / AI Matching** | Web Speech API, Groq Whisper Large v3, Google Gemini Flash, OpenAI Whisper |

---

## 🤖 Automated CI/CD Pipelines

The project utilizes automated GitHub Actions workflows running on every push to `main` or `production`:

1. **Deploy Web App** ([`.github/workflows/deploy-web.yml`](.github/workflows/deploy-web.yml))
   - Builds the Next.js static export via Bun with `NEXT_PUBLIC_BASE_PATH=/noor-al-quran`.
   - Automatically deploys to GitHub Pages at [https://picwellwisher12pk.github.io/noor-al-quran/](https://picwellwisher12pk.github.io/noor-al-quran/).

2. **Build Desktop Apps** ([`.github/workflows/build-desktop.yml`](.github/workflows/build-desktop.yml))
   - Compiles Tauri v2 native desktop binaries across a 3-way matrix (`windows-latest`, `ubuntu-22.04`, `macos-latest`).
   - Packages Windows `.exe`/`.msi`, Linux `.deb`/`.AppImage`, and macOS `.dmg`/`.app`.
   - Caches Rust dependencies via `swatinem/rust-cache` for fast compilation.

3. **Build Android APK** ([`.github/workflows/build-android.yml`](.github/workflows/build-android.yml))
   - Sets up Java 17, Android SDK 34, and NDK 26.
   - Compiles Tauri v2 Android target (`aarch64` and universal).
   - Injects audio recording permissions and automatically signs the release APK with `zipalign` and `apksigner`.

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.2+)
- [Rust](https://www.rust-lang.org/) (v1.75+ for desktop builds)
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
Find installer binaries in `src-tauri/target/release/bundle/`.

---

## 📌 Development Standards & Policies

- **Strict Data Policy**: ZERO fabricated, fake, or mock Quranic or prayer data. All text, audio, transliterations, tafsir, and prayer schedules are authentic.
- **Single-Source Versioning**: App version is maintained exclusively in [`package.json`](package.json) and automatically synchronized across `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, and runtime metadata using:
  ```bash
  bun run version:sync
  ```
- **Theme Compatibility**: Every component is strictly dark mode and light mode ready with semantic CSS variables and high-contrast accessibility.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Text and audio assets are provided with gratitude through the Quran Foundation and Quran.com API.
