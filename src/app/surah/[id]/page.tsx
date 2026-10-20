import { fetchChapter, fetchVersesByChapter } from "@/services/quranApi";
import { SurahReader } from "@/components/quran/SurahReader";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/app/loading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const chapter = await fetchChapter(resolvedParams.id);
  if (!chapter) {
    return { title: "Surah Not Found - Noor Al-Quran" };
  }
  return {
    title: `Surah ${chapter.name_simple} (${chapter.name_arabic}) - Noor Al-Quran`,
    description: `Read and listen to Surah ${chapter.name_simple} (${chapter.translated_name.name}) with authentic Uthmani script, word-by-word audio, and English translation.`,
  };
}

export default async function SurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const chapterId = Number(resolvedParams.id);

  if (isNaN(chapterId) || chapterId < 1 || chapterId > 114) {
    notFound();
  }

  const [chapter, versesData] = await Promise.all([
    fetchChapter(chapterId),
    fetchVersesByChapter(chapterId, 1, 50),
  ]);

  if (!chapter) {
    notFound();
  }

  return (
    <Suspense fallback={<Loading />}>
      <SurahReader
        chapter={chapter}
        initialVerses={versesData.verses}
        totalPages={versesData.pagination.total_pages}
      />
    </Suspense>
  );
}
