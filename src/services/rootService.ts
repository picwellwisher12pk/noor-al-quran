import { getAbsoluteVerseIndex } from "@/utils/quranMeta";

export interface WordRootInfo {
  root: string;
  count: number;
}

// In-memory index of `0-based-verse:pos` -> { root, count }
let wordToRootIndex: Map<string, WordRootInfo> | null = null;
let rootDetailsIndex: Map<string, WordRootInfo> | null = null;
let fetchPromise: Promise<{ wordMap: Map<string, WordRootInfo>; rootMap: Map<string, WordRootInfo> }> | null = null;

const ROOTS_DATA_URL = "https://raw.githubusercontent.com/AbstractThinker0/quran-roots/main/quranRoots.json";

export async function loadRootsIndex(): Promise<{
  wordMap: Map<string, WordRootInfo>;
  rootMap: Map<string, WordRootInfo>;
}> {
  if (wordToRootIndex && rootDetailsIndex) {
    return { wordMap: wordToRootIndex, rootMap: rootDetailsIndex };
  }
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch(ROOTS_DATA_URL);
      if (!res.ok) throw new Error("Failed to load Quran roots dataset");
      const data = await res.json();

      const wordMap = new Map<string, WordRootInfo>();
      const rootMap = new Map<string, WordRootInfo>();

      for (const item of Object.values(data) as any[]) {
        if (!item?.name) continue;
        const count = Number(item.count) || 0;
        const rootName = item.name.trim();

        rootMap.set(rootName, { root: rootName, count });

        if (item.occurences) {
          for (const occ of item.occurences) {
            const [verseIdx, posStr] = occ.split(":");
            if (posStr) {
              const positions = posStr.split(",");
              for (const pos of positions) {
                wordMap.set(`${verseIdx}:${pos}`, {
                  root: rootName,
                  count,
                });
              }
            }
          }
        }
      }

      wordToRootIndex = wordMap;
      rootDetailsIndex = rootMap;
      return { wordMap, rootMap };
    } catch (e) {
      console.error("Error loading roots index:", e);
      return { wordMap: new Map(), rootMap: new Map() };
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
  const { wordMap } = await loadRootsIndex();
  // Absolute verse index is 1-based, dataset uses 0-based index
  const absIndex0 = getAbsoluteVerseIndex(chapterId, verseNumber) - 1;
  const key = `${absIndex0}:${wordPosition}`;
  return wordMap.get(key) || null;
}

/**
 * Looks up root count by Arabic root string directly.
 */
export async function getRootByName(rootName: string): Promise<WordRootInfo | null> {
  const { rootMap } = await loadRootsIndex();
  const clean = rootName.replace(/[\s\-]/g, "");
  return rootMap.get(clean) || null;
}
