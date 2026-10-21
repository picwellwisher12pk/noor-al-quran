import type { Metadata } from "next";
import { Inter, Amiri, Noto_Sans_Arabic, Scheherazade_New, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/config/version";
import { ThemeProvider } from "@/context/ThemeContext";
import { BookmarksProvider } from "@/context/BookmarksContext";
import { AudioProvider } from "@/context/AudioContext";
import { ReadingPreferencesProvider } from "@/context/ReadingPreferencesContext";
import { KhatmahProvider } from "@/context/KhatmahContext";
import { DesktopWorkspaceProvider } from "@/context/DesktopWorkspaceContext";
import { DesktopShell } from "@/components/desktop/DesktopShell";

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
  title: `${APP_CONFIG.name} (${APP_CONFIG.nameArabic}) - Noble Quran Desktop Workstation`,
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
      <body className="h-screen w-screen overflow-hidden flex flex-col font-sans select-none bg-[var(--background,#0b100d)] text-[var(--foreground,#f1f5f9)]">
        <ThemeProvider>
          <BookmarksProvider>
            <AudioProvider>
              <ReadingPreferencesProvider>
                <KhatmahProvider>
                  <DesktopWorkspaceProvider>
                    <DesktopShell>{children}</DesktopShell>
                  </DesktopWorkspaceProvider>
                </KhatmahProvider>
              </ReadingPreferencesProvider>
            </AudioProvider>
          </BookmarksProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
