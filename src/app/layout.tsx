import type { Metadata, Viewport } from "next";
import {
  Inter,
  Amiri,
  Amiri_Quran,
  Noto_Naskh_Arabic,
  Scheherazade_New,
  Lateef,
  Noto_Sans_Arabic,
  Cairo,
  Noto_Nastaliq_Urdu,
} from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/config/version";
import { AppProviders } from "@/context/AppProviders";
import { DesktopShell } from "@/components/desktop/DesktopShell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  // themeColor is set dynamically by ThemeContext to match current theme
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1218" },
  ],
  interactiveWidget: "resizes-content",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const amiriQuran = Amiri_Quran({
  variable: "--font-amiri-quran",
  subsets: ["arabic"],
  weight: ["400"],
  display: "swap",
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh-arabic",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const lateef = Lateef({
  variable: "--font-lateef",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const scheherazade = Scheherazade_New({
  variable: "--font-scheherazade",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} (${APP_CONFIG.nameArabic}) - Noble Quran Workstation & Mobile App`,
  description: APP_CONFIG.description,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_CONFIG.name,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = [
    inter.variable,
    amiri.variable,
    amiriQuran.variable,
    notoNaskhArabic.variable,
    scheherazade.variable,
    lateef.variable,
    notoSansArabic.variable,
    cairo.variable,
    notoNastaliqUrdu.variable,
  ].join(" ");

  return (
    <html
      lang="en"
      className={fontVars}
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        {/* Anti-FOUC: read theme from localStorage before first paint */}
        <script
          id="theme-initializer"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var s=localStorage.getItem('naq_theme_style')||'hadith';
              var m=localStorage.getItem('naq_theme_mode');
              if(!m||m==='system'||!['dark','light'].includes(m)){
                m=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
              }
              var r=document.documentElement;
              r.classList.add('theme-'+s,m);
              r.dataset.theme=s+'-'+m;
              r.dataset.themeStyle=s;
              r.dataset.mode=m;
            }catch(e){
              document.documentElement.classList.add('theme-hadith','dark');
            }}())`,
          }}
        />
      </head>
      <body className="h-dvh w-screen overflow-hidden flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] overscroll-none">
        <AppProviders>
          <DesktopShell>{children}</DesktopShell>
        </AppProviders>
      </body>
    </html>
  );
}
