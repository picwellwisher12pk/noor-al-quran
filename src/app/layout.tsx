import type { Metadata } from "next";
import { Inter, Amiri, Noto_Sans_Arabic, Scheherazade_New, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/config/version";
import { ThemeProvider } from "@/context/ThemeContext";
import { BookmarksProvider } from "@/context/BookmarksContext";
import { AudioProvider } from "@/context/AudioContext";
import { ReadingPreferencesProvider } from "@/context/ReadingPreferencesContext";
import { KhatmahProvider } from "@/context/KhatmahContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AudioPlayerBar } from "@/components/audio/AudioPlayerBar";

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
  title: `${APP_CONFIG.name} (${APP_CONFIG.nameArabic}) - Authentic Noble Quran Reader`,
  description: APP_CONFIG.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${amiri.variable} ${notoSansArabic.variable} ${scheherazade.variable} ${notoNastaliqUrdu.variable} dark theme-hadith`}
    >
      <body className="min-h-screen flex flex-col font-sans">
        <ThemeProvider>
          <BookmarksProvider>
            <AudioProvider>
              <ReadingPreferencesProvider>
                <KhatmahProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <AudioPlayerBar />
                  <Footer />
                </KhatmahProvider>
              </ReadingPreferencesProvider>
            </AudioProvider>
          </BookmarksProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
