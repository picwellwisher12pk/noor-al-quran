import type { Metadata } from "next";
import { Amiri, Inter } from "next/font/google";
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
    <html lang="en" className={`${inter.variable} ${amiri.variable} dark theme-emerald`}>
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
