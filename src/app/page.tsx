"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { APP_CONFIG } from "@/config/version";
import { isTauri as checkIsTauri } from "@/utils/platform";
import {
  Sparkles,
  Download,
  Laptop,
  Smartphone,
  Globe,
  Terminal,
  Monitor,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Mic,
  BookOpen,
  Volume2,
  ScrollText,
  Gamepad2,
  CalendarDays,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface DownloadAsset {
  name: string;
  type: string;
  url: string;
  recommended?: boolean;
  desc: string;
  size?: string;
}

interface PlatformDetail {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  version: string;
  systemReqs: string;
  badge: string;
  primaryAsset: DownloadAsset;
  secondaryAssets: DownloadAsset[];
  features: string[];
  installGuide: string;
}

const PLATFORM_DETAILS: PlatformDetail[] = [
  {
    id: "windows",
    name: "Windows",
    icon: Laptop,
    tagline: "Desktop App for Windows 10 & 11",
    version: `v${APP_CONFIG.version}`,
    systemReqs: "Windows 10 or 11 (PC / Laptop)",
    badge: "Recommended Desktop",
    primaryAsset: {
      name: "Windows Setup (.exe)",
      type: "Installer",
      url: `${APP_CONFIG.releasesUrl}/latest/download/Noor-Al-Quran_x64-setup.exe`,
      recommended: true,
      desc: "Standard 1-click Windows installer with automatic updates and Start Menu shortcut.",
    },
    secondaryAssets: [
      {
        name: "Enterprise MSI Package (.msi)",
        type: "MSI",
        url: `${APP_CONFIG.releasesUrl}/latest/download/Noor-Al-Quran_x64_en-US.msi`,
        desc: "Windows Installer package suitable for managed office or school computers.",
      },
    ],
    features: [
      "Modern distraction-free window with easy minimize, maximize, and close controls",
      "Quick keyboard shortcuts: Ctrl+K to search any Surah or verse, Ctrl+Shift+R to recite",
      "Clear, authentic Medina calligraphy fonts with customizable text sizes",
      "Built-in update notification so you always have the latest improvements",
      "Full offline support for reading and listening without an internet connection",
    ],
    installGuide:
      "Download the Windows setup file (.exe) and open it. If Windows SmartScreen shows a prompt on first launch, simply click 'More info' and then 'Run anyway' to complete the quick installation.",
  },
  {
    id: "android",
    name: "Android",
    icon: Smartphone,
    tagline: "Mobile App for Android Phones & Tablets",
    version: `v${APP_CONFIG.version}`,
    systemReqs: "Android 7.0 or newer",
    badge: "Mobile App",
    primaryAsset: {
      name: "Android App Package (.apk)",
      type: "APK",
      url: `${APP_CONFIG.releasesUrl}/latest/download/noor-al-quran-universal-release.apk`,
      recommended: true,
      desc: "Official mobile app package optimized for all modern Android phones and tablets.",
    },
    secondaryAssets: [
      {
        name: "Direct Install APK (.apk)",
        type: "Direct APK",
        url: `${APP_CONFIG.releasesUrl}/latest/download/noor-al-quran-debug.apk`,
        desc: "Fast direct installation package for quick setup on any Android device.",
      },
      {
        name: "Mobile Web Shortcut",
        type: "Web App",
        url: "https://picwellwisher12pk.github.io/noor-al-quran/app/",
        desc: "Open in Chrome on your phone and tap 'Install' or 'Add to Home Screen'.",
      },
    ],
    features: [
      "Designed specifically for phone screens with touch navigation and smooth scrolling",
      "Floating audio player that stays easily accessible at the bottom of the screen",
      "Background recitation so you can continue listening during travel or with the screen off",
      "Designed to fit all screen types including notched and edge-to-edge displays",
      "Practice Quranic vocabulary flashcards and mini-games wherever you go",
    ],
    installGuide:
      "Download the APK file directly to your phone. Tap the download notification to install. If your phone asks for permission to install apps from your browser, tap 'Settings' and allow it.",
  },
  {
    id: "macos",
    name: "macOS",
    icon: Monitor,
    tagline: "Desktop App for Mac Computers",
    version: `v${APP_CONFIG.version}`,
    systemReqs: "macOS 11.0 (Big Sur) or newer",
    badge: "Mac App",
    primaryAsset: {
      name: "Mac Disk Image (.dmg)",
      type: "DMG",
      url: `${APP_CONFIG.releasesUrl}/latest/download/Noor-Al-Quran.dmg`,
      recommended: true,
      desc: "Standard Mac installation disk image compatible with both Apple Silicon and Intel Macs.",
    },
    secondaryAssets: [],
    features: [
      "Native Mac window styling and keyboard shortcuts",
      "Ultra-crisp Retina display text rendering for beautiful Arabic calligraphy",
      "Automatic matching of your Mac's Dark and Light appearance",
      "Extremely light on battery and memory",
      "Complete offline access for daily reading and study",
    ],
    installGuide:
      "Open the downloaded .dmg file and drag the Noor Al-Quran icon into your Applications folder. On first launch, right-click (or Control-click) the app icon and select 'Open'.",
  },
  {
    id: "linux",
    name: "Linux",
    icon: Terminal,
    tagline: "Desktop App for Linux Computers",
    version: `v${APP_CONFIG.version}`,
    systemReqs: "Ubuntu, Debian, Fedora, Arch, Mint, and others",
    badge: "Linux App",
    primaryAsset: {
      name: "Portable AppImage (.AppImage)",
      type: "AppImage",
      url: `${APP_CONFIG.releasesUrl}/latest/download/noor-al-quran_amd64.AppImage`,
      recommended: true,
      desc: "Single-file portable app that runs immediately without requiring installation.",
    },
    secondaryAssets: [
      {
        name: "Debian / Ubuntu Package (.deb)",
        type: "DEB",
        url: `${APP_CONFIG.releasesUrl}/latest/download/noor-al-quran_amd64.deb`,
        desc: "Installs cleanly into your system application launcher on Ubuntu and Debian.",
      },
    ],
    features: [
      "Super-fast startup and minimal system memory usage",
      "Smooth, high-framerate reading and scrolling",
      "Completely standalone with zero telemetry or tracking",
      "Full offline support for text, translations, and audio",
    ],
    installGuide:
      "For AppImage: Right-click the file, go to Properties > Permissions, check 'Allow executing file as program', and double-click to run. For DEB: double-click to install via your Software Center.",
  },
  {
    id: "web",
    name: "Web Browser",
    icon: Globe,
    tagline: "Instant Access in Any Web Browser",
    version: `v${APP_CONFIG.version}`,
    systemReqs: "Any modern web browser (Chrome, Safari, Firefox, Edge)",
    badge: "Zero Install",
    primaryAsset: {
      name: "Open Web Version",
      type: "Web",
      url: "https://picwellwisher12pk.github.io/noor-al-quran/app/",
      recommended: true,
      desc: "Full-featured web edition hosted on global cloud servers with zero setup required.",
    },
    secondaryAssets: [],
    features: [
      "Start reading right now without installing anything on your device",
      "Offline caching so you can continue reading even if your internet disconnects",
      "Automatically adjusts from mobile phones to large desktop screens",
      "Can be saved to your device home screen as a standalone app",
    ],
    installGuide:
      "Simply open the web link in your browser. You can bookmark the page or click 'Install' in your browser address bar to add an icon to your desktop or phone home screen.",
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Authentic Medina Mushaf Quran Text",
    noor: true,
    others: "Often simplified fonts",
    desc: "Authentic Medina standard script rendered with classical calligraphy typefaces.",
  },
  {
    feature: "Smart Voice Search (Recite to Find Ayah)",
    noor: true,
    others: "Not available",
    desc: "Recite into your microphone to find any verse instantly from the entire Quran.",
  },
  {
    feature: "Interactive Word Meaning & Grammar Guide",
    noor: true,
    others: "Paid or limited",
    desc: "Click any word to see its translation, grammar type, root letters, and pronunciation.",
  },
  {
    feature: "Dual Audio: Arabic Followed by Translation",
    noor: true,
    others: "Arabic only",
    desc: "Optionally plays verse-by-verse translation immediately after the Arabic recitation.",
  },
  {
    feature: "Continuous Smooth Reading & Sajdah Guidance",
    noor: true,
    others: "Manual page buttons",
    desc: "Smooth reading without interruption, with clear prostration indicators and rules.",
  },
  {
    feature: "Quran Vocabulary Games & Flashcards",
    noor: true,
    others: "Not available",
    desc: "Fun mini-games and spaced practice flashcards to learn common Quranic words.",
  },
  {
    feature: "Completely Free, No Ads, No Subscriptions",
    noor: true,
    others: "Often filled with banner ads",
    desc: "100% free and open-source for the sake of Allah, with zero commercial advertising.",
  },
  {
    feature: "Native Apps for Phones, Laptops & Desktops",
    noor: true,
    others: "Web only or heavy apps",
    desc: "Fast, battery-friendly native apps for Windows, Android, Mac, Linux, and Web.",
  },
];

const FAQS = [
  {
    q: "Is Noor Al-Quran completely free to use?",
    a: "Yes, 100% free and open-source. There are no advertisements, no subscriptions, no locked features, and no tracking of your reading habits.",
  },
  {
    q: "How does the Voice Search feature work?",
    a: "When you tap the microphone and recite an Ayah, the app analyzes the spoken Arabic and quickly identifies the exact Surah and verse number within a fraction of a second, even if your recitation varies in speed.",
  },
  {
    q: "Can I use Noor Al-Quran without an internet connection?",
    a: "Yes! The desktop and Android apps store the Quran text, translations, and vocabulary locally on your device. You can also download audio recitations using the in-app Download Manager for offline listening.",
  },
  {
    q: "Where does the Quranic text and audio come from?",
    a: "All Quranic verses, word-by-word data, English and Urdu translations, and reciter audio recordings are provided through authentic data from the Quran Foundation (Quran.com API). Prayer timetable calculations use verified astronomical formulas.",
  },
  {
    q: "How do I update the application on my computer?",
    a: "On Windows, Mac, and Linux, the app automatically checks for official updates when opened. If a new version is available, a friendly notification banner will appear with a one-click button to update.",
  },
];

export default function MarketingHomePage() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("windows");
  const [detectedOs, setDetectedOs] = useState<string>("windows");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [platforms, setPlatforms] = useState<PlatformDetail[]>(PLATFORM_DETAILS);

  // Auto-launch the Quran reader workstation if running inside the native Tauri desktop app
  useEffect(() => {
    if (checkIsTauri()) {
      router.replace("/app");
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes("android")) {
      setDetectedOs("android");
      setSelectedPlatform("android");
    } else if (ua.includes("mac os") || ua.includes("macintosh")) {
      setDetectedOs("macos");
      setSelectedPlatform("macos");
    } else if (ua.includes("linux")) {
      setDetectedOs("linux");
      setSelectedPlatform("linux");
    } else if (ua.includes("win")) {
      setDetectedOs("windows");
      setSelectedPlatform("windows");
    } else if (ua.includes("iphone") || ua.includes("ipad")) {
      setDetectedOs("web");
      setSelectedPlatform("web");
    }
  }, []);

  // Dynamically resolve release assets from GitHub Releases API for 100% reliable direct download links
  useEffect(() => {
    let isMounted = true;
    async function loadReleaseAssets() {
      try {
        const repo = APP_CONFIG.githubRepo || "picwellwisher12pk/noor-al-quran";
        const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
          headers: { Accept: "application/vnd.github.v3+json" },
        });
        if (!res.ok) return;
        const release = await res.json();
        const tag = release.tag_name || `v${APP_CONFIG.version}`;
        const assets: Array<{ name: string; browser_download_url: string; size: number }> =
          Array.isArray(release.assets) ? release.assets : [];

        if (!isMounted || assets.length === 0) return;

        const formatSize = (bytes?: number) => {
          if (!bytes || bytes <= 0) return undefined;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
          return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        };

        const findAsset = (predicate: (name: string) => boolean) =>
          assets.find((a) => predicate(a.name.toLowerCase()));

        // Windows: prefer setup / x64-setup .exe, then any .exe (excluding signatures/zips)
        const winSetup =
          findAsset((n) => n.endsWith(".exe") && (n.includes("setup") || n.includes("x64"))) ||
          findAsset((n) => n.endsWith(".exe"));
        const winMsi =
          findAsset((n) => n.endsWith(".msi") && !n.endsWith(".zip")) ||
          findAsset((n) => n.endsWith(".msi"));

        // Android: prefer universal-release.apk or signed.apk or release.apk
        const apkUniversal =
          findAsset((n) => n.endsWith(".apk") && (n.includes("universal") || n.includes("signed") || n.includes("release"))) ||
          findAsset((n) => n.endsWith(".apk") && !n.includes("debug"));
        const apkDebug =
          findAsset((n) => n.endsWith(".apk") && n.includes("debug")) ||
          findAsset((n) => n.endsWith(".apk") && n !== apkUniversal?.name.toLowerCase());

        // macOS: .dmg
        const macDmg = findAsset((n) => n.endsWith(".dmg"));

        // Linux: .AppImage and .deb
        const linuxAppImage = findAsset((n) => n.endsWith(".appimage") && !n.includes(".tar.gz"));
        const linuxDeb = findAsset((n) => n.endsWith(".deb"));

        setPlatforms((prev) =>
          prev.map((platform) => {
            const updated: PlatformDetail = {
              ...platform,
              version: tag,
              primaryAsset: { ...platform.primaryAsset },
              secondaryAssets: platform.secondaryAssets.map((s) => ({ ...s })),
            };

            if (platform.id === "windows") {
              if (winSetup) {
                updated.primaryAsset.url = winSetup.browser_download_url;
                updated.primaryAsset.size = formatSize(winSetup.size);
              }
              if (winMsi) {
                updated.secondaryAssets = updated.secondaryAssets.map((sec) =>
                  sec.type === "MSI"
                    ? { ...sec, url: winMsi.browser_download_url, size: formatSize(winMsi.size) }
                    : sec
                );
              }
            } else if (platform.id === "android") {
              if (apkUniversal) {
                updated.primaryAsset.url = apkUniversal.browser_download_url;
                updated.primaryAsset.size = formatSize(apkUniversal.size);
              }
              if (apkDebug) {
                updated.secondaryAssets = updated.secondaryAssets.map((sec) =>
                  sec.type === "Direct APK"
                    ? { ...sec, url: apkDebug.browser_download_url, size: formatSize(apkDebug.size) }
                    : sec
                );
              }
            } else if (platform.id === "macos") {
              if (macDmg) {
                updated.primaryAsset.url = macDmg.browser_download_url;
                updated.primaryAsset.size = formatSize(macDmg.size);
              }
            } else if (platform.id === "linux") {
              if (linuxAppImage) {
                updated.primaryAsset.url = linuxAppImage.browser_download_url;
                updated.primaryAsset.size = formatSize(linuxAppImage.size);
              }
              if (linuxDeb) {
                updated.secondaryAssets = updated.secondaryAssets.map((sec) =>
                  sec.type === "DEB"
                    ? { ...sec, url: linuxDeb.browser_download_url, size: formatSize(linuxDeb.size) }
                    : sec
                );
              }
            }
            return updated;
          })
        );
      } catch (err) {
        console.warn("[Download] Could not dynamically load latest release assets:", err);
      }
    }

    loadReleaseAssets();
    return () => {
      isMounted = false;
    };
  }, []);

  const activePlatform =
    platforms.find((p) => p.id === selectedPlatform) || platforms[0];
  const ActivePlatformIcon = activePlatform.icon;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 space-y-10 sm:space-y-14">
      {/* ─────────────────────────────────────────────────────────────
          1. Hero Header & Quick Launch
      ───────────────────────────────────────────────────────────── */}
      <div className="relative text-center space-y-4 sm:space-y-6 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          Noor Al-Quran • The Noble Quran Workstation &amp; Learning Hub
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--foreground)] max-w-4xl mx-auto leading-tight">
          A Beautiful, Modern Way to{" "}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">
            Read, Listen &amp; Understand
          </span>{" "}
          the Quran
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
          Authentic Uthmani Medina script with instant voice recitation search, interactive word meanings, dual-reciter audio, and engaging vocabulary learning games.
        </p>

        {/* Quick Direct Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/app"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/30 flex items-center gap-2 active:scale-95"
          >
            <BookOpen className="h-4 w-4" />
            Launch Web Quran App
          </Link>

          <a
            href={activePlatform.primaryAsset.url}
            target={activePlatform.id === "web" ? "_self" : "_blank"}
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] font-semibold text-sm transition-colors flex items-center gap-2 active:scale-95 shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            Download for {activePlatform.name} ({activePlatform.primaryAsset.type}{activePlatform.primaryAsset.size ? ` • ${activePlatform.primaryAsset.size}` : ""})
          </a>

          <a
            href={APP_CONFIG.releasesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm transition-colors flex items-center gap-1.5"
          >
            All Releases <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Trust & Policy Metrics */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> 100% Free &amp; Open Source
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Zero Advertisements
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Verified Authentic Sources
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Zap className="h-4 w-4 text-amber-500" /> Works Completely Offline
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Multi-Platform Download Matrix
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            Download for Your Device
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xl mx-auto">
            Select your device below to download the app or start reading immediately in your browser.
          </p>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm max-w-full overflow-x-auto gap-1">
            {platforms.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPlatform === p.id;
              const isDetected = detectedOs === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{p.name}</span>
                  {isDetected && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      Your Device
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Platform Card */}
        <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <ActivePlatformIcon className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                    {activePlatform.name}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-[var(--muted-foreground)]">
                    {activePlatform.version}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                  {activePlatform.tagline}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right text-xs text-[var(--muted-foreground)]">
              <p className="font-semibold text-[var(--foreground)]">Compatibility:</p>
              <p>{activePlatform.systemReqs}</p>
            </div>
          </div>

          {/* Download Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Recommended Asset */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 via-[var(--surface-card)] to-[var(--surface-sunken)] border border-emerald-500/30 p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Main Download ({activePlatform.primaryAsset.type})
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                    Recommended
                  </span>
                </div>
                <h4 className="font-bold text-base text-[var(--foreground)]">
                  {activePlatform.primaryAsset.name}
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {activePlatform.primaryAsset.desc}
                </p>
              </div>

              <a
                href={activePlatform.primaryAsset.url}
                target={activePlatform.id === "web" ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md active:scale-98"
              >
                <Download className="h-4 w-4" />
                {activePlatform.id === "web"
                  ? "Launch Web Version"
                  : `Download for ${activePlatform.name}${activePlatform.primaryAsset.size ? ` (${activePlatform.primaryAsset.size})` : ""}`}
              </a>
            </div>

            {/* Secondary Assets (if any) */}
            {activePlatform.secondaryAssets.length > 0 ? (
              <div className="space-y-3">
                {activePlatform.secondaryAssets.map((asset, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-4 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[var(--muted-foreground)]">
                          {asset.type}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-[var(--foreground)] mt-0.5">
                        {asset.name}
                      </h4>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed mt-1">
                        {asset.desc}
                      </p>
                    </div>

                    <a
                      href={asset.url}
                      target={asset.type === "Web App" ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-raised)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] text-xs font-medium transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-emerald-500" />
                      Get {asset.name.split(" ")[0]} {asset.size ? `(${asset.size})` : ""}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 space-y-2 flex flex-col justify-center">
                <h4 className="font-semibold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Self-Contained &amp; Easy Setup
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Everything you need is included in one convenient download. No additional components or setup tools are needed.
                </p>
              </div>
            )}
          </div>

          {/* Key Features for this platform */}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              {activePlatform.name} Highlights:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--foreground)]">
              {activePlatform.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-none" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-xs space-y-1">
            <span className="font-semibold text-[var(--foreground)] flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
              Quick Setup Note:
            </span>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {activePlatform.installGuide}
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. Detailed Feature Tour
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3 w-3" /> Explore App Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            Built for Daily Recitation, Understanding &amp; Learning
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xl mx-auto">
            Everything you need for meaningful engagement with the Holy Quran in one unified experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Feature 1 */}
          <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-[var(--foreground)]">
              Smart Voice Recitation Search
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Simply recite or speak any verse into your microphone. The app identifies the exact Surah and Ayah in less than a second, letting you jump straight to reading.
            </p>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Instant Arabic Voice Matching
            </div>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-[var(--foreground)]">
              Interactive Word Guide &amp; Tafseer
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Click on any Arabic word to reveal its direct English or Urdu translation, root letters, grammar role, authentic audio pronunciation, and detailed Ibn Kathir commentary.
            </p>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
              Word-by-Word Analysis • Commentary
            </div>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Volume2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-[var(--foreground)]">
              Dual Reciter &amp; Translation Audio
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Listen to world-renowned reciters like Mishary Alafasy, AbdulBaset, and Husary. You can even choose to hear the translation read immediately after each Arabic verse.
            </p>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Renowned Reciters • Verse Loop Modes
            </div>
          </div>

          {/* Feature 4 */}
          <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <ScrollText className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-[var(--foreground)]">
              Smooth Reading &amp; Sajdah Rules
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Read continuously without interruptions or manual page buttons. Clear indicators highlight Sajdah (prostration) verses with helpful rules on how to perform them.
            </p>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              Uninterrupted Reading • Prostration Guide
            </div>
          </div>

          {/* Feature 5 */}
          <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-[var(--foreground)]">
              Vocabulary Arcade &amp; Flashcards
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Learn the most frequent Quranic words through interactive flashcards and 4 engaging mini-games: verse completion, word matching, meaning quizzes, and word families.
            </p>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              Practice Cards • Mini-Games • Streaks
            </div>
          </div>

          {/* Feature 6 */}
          <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-[var(--foreground)]">
              Prayer Times &amp; Sunnah Goals
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Stay on track with accurate prayer times for your location, Islamic Hijri dates, daily reading streaks, and Sunnah-aligned Khatmah completion targets.
            </p>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              Accurate Prayer Times • Reading Habits
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. Authenticity & Comparison Table
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            Why Choose Noor Al-Quran?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xl mx-auto">
            Built with strict adherence to authentic Islamic sources, zero ads, and user privacy.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[var(--card-border)] bg-[var(--surface-raised)] shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[var(--surface-sunken)] border-b border-[var(--border-subtle)] text-[var(--foreground)]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Capability</th>
                <th className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">Noor Al-Quran</th>
                <th className="py-3.5 px-4 font-semibold text-[var(--muted-foreground)]">Conventional Apps</th>
                <th className="py-3.5 px-4 font-semibold text-[var(--muted-foreground)]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-[var(--surface-card)]/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-[var(--foreground)]">{row.feature}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-none" /> Included
                  </td>
                  <td className="py-3 px-4 text-[var(--muted-foreground)]">{row.others}</td>
                  <td className="py-3 px-4 text-xs text-[var(--muted-foreground)]">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. Frequently Asked Questions
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
            Answers to common questions about downloads, installation, and data sources.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[var(--surface-raised)] border border-[var(--card-border)] overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-emerald-500 flex-none" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)] flex-none" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border-subtle)] bg-[var(--surface-sunken)]/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. Final Call to Action
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-10 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          Begin Your Quran Study Journey Today
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
          Install Noor Al-Quran on your favorite computer or mobile device, or jump directly into the online web reader.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/app"
            className="px-6 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Launch Web Quran App
          </Link>
          <a
            href={activePlatform.primaryAsset.url}
            target={activePlatform.id === "web" ? "_self" : "_blank"}
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-500/40 font-semibold text-xs sm:text-sm transition-colors"
          >
            Download for {activePlatform.name}
          </a>
        </div>
      </div>
    </div>
  );
}
