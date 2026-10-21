import { getAbsoluteVerseIndex } from "@/utils/quranMeta";

export interface WordRootInfo {
  root: string;
  count: number;
}

// In-memory index of `0-based-verse:pos` -> { root, count }
let wordToRootIndex: Map<string, WordRootInfo> | null = null;
let fetchPromise: Promise<Map<string, WordRootInfo>> | null = null;

const ROOTS_DATA_URL = "https://raw.githubusercontent.com/AbstractThinker0/quran-roots/main/quranRoots.json";

export async function loadRootsIndex(): Promise<Map<string, WordRootInfo>> {
  if (wordToRootIndex) return wordToRootIndex;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch(ROOTS_DATA_URL);
      if (!res.ok) throw new Error("Failed to load Quran roots dataset");
      const data = await res.json();

      const index = new Map<string, WordRootInfo>();
      for (const item of Object.values(data) as any[]) {
        if (!item?.occurences) continue;
        for (const occ of item.occurences) {
          const [verseIdx, posStr] = occ.split(":");
          if (posStr) {
            const positions = posStr.split(",");
            for (const pos of positions) {
              index.set(`${verseIdx}:${pos}`, {
                root: item.name,
                count: Number(item.count) || 0,
              });
            }
          }
        }
      }
      wordToRootIndex = index;
      return index;
    } catch (e) {
      console.error("Error loading roots index:", e);
      return new Map();
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Looks up root letters and total Quran occurrences for a specific word token.
 */
export async function getWordRoot(
  chapterId: number,
  verseNumber: number,
  wordPosition: number
): Promise<WordRootInfo | null> {
  const index = await loadRootsIndex();
  // Absolute verse index is 1-based, dataset uses 0-based index
  const absIndex0 = getAbsoluteVerseIndex(chapterId, verseNumber) - 1;
  const key = `${absIndex0}:${wordPosition}`;
  return index.get(key) || null;
}
