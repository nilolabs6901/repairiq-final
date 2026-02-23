import { Message, DiagnosisResult, CacheEntry } from '@/types';

const CACHE_KEY = 'repairiq_diagnosis_cache';
const CACHE_TTL_DAYS = 30;

// Simple hash function (djb2) for browser compatibility
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  // Convert to hex and pad to ensure consistent length
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// Stop words to filter out for keyword extraction
const STOP_WORDS = new Set([
  'the', 'is', 'a', 'an', 'and', 'or', 'but', 'my', 'it', 'not', 'working',
  'to', 'for', 'of', 'in', 'on', 'with', 'this', 'that', 'have', 'has',
  'been', 'be', 'are', 'was', 'were', 'will', 'would', 'could', 'should',
  'can', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'they', 'we',
  'its', 'their', 'our', 'your', 'me', 'him', 'her', 'them', 'us',
  'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'any',
  'some', 'no', 'none', 'just', 'only', 'very', 'also', 'too', 'so',
  'than', 'then', 'now', 'here', 'there', 'about', 'after', 'before',
  'because', 'if', 'else', 'while', 'until', 'as', 'at', 'by', 'from',
  'into', 'through', 'during', 'against', 'between', 'under', 'over',
  'again', 'further', 'once', 'same', 'other', 'each', 'both', 'few',
  'more', 'most', 'such', 'own', 'out', 'up', 'down', 'off', 'still',
  'help', 'please', 'need', 'want', 'problem', 'issue', 'broken', 'fix',
  'repair', 'doesnt', "doesn't", 'wont', "won't", 'cant', "can't",
]);

// Extract meaningful keywords from text
export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 30); // Limit to 30 keywords
}

// Generate a cache key from messages
export function generateCacheKey(messages: Message[]): string {
  // Extract all user message content
  const userContent = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ');

  // Extract keywords
  const keywords = extractKeywords(userContent);

  // Sort for consistency
  const normalized = keywords.sort().join('|');

  // Generate hash using browser-compatible function
  return simpleHash(normalized);
}

// Get cache from localStorage (server-side will need Redis)
export function getCache(): Record<string, CacheEntry> {
  if (typeof window === 'undefined') return {};

  try {
    const data = localStorage.getItem(CACHE_KEY);
    if (!data) return {};

    const cache = JSON.parse(data) as Record<string, CacheEntry>;

    // Clean expired entries
    const now = new Date();
    const ttlMs = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
    const validCache: Record<string, CacheEntry> = {};

    for (const [key, entry] of Object.entries(cache)) {
      const createdAt = new Date(entry.createdAt);
      if (now.getTime() - createdAt.getTime() < ttlMs) {
        validCache[key] = entry;
      }
    }

    // Save cleaned cache if different
    if (Object.keys(validCache).length !== Object.keys(cache).length) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(validCache));
    }

    return validCache;
  } catch {
    return {};
  }
}

// Get cached diagnosis for similar messages
export function getCachedDiagnosis(messages: Message[]): { result: DiagnosisResult; hitCount: number } | null {
  const cache = getCache();
  const key = generateCacheKey(messages);

  // Direct key match
  if (cache[key]) {
    const entry = cache[key];
    // Increment hit count
    entry.hitCount++;
    saveToCache(key, entry);
    return { result: entry.result, hitCount: entry.hitCount };
  }

  // Try similarity matching
  const inputKeywords = extractKeywords(
    messages.filter(m => m.role === 'user').map(m => m.content).join(' ')
  );

  for (const [cacheKey, entry] of Object.entries(cache)) {
    const similarity = calculateSimilarity(inputKeywords, entry.keywords);
    if (similarity > 0.7) { // 70% similarity threshold
      entry.hitCount++;
      saveToCache(cacheKey, entry);
      return { result: entry.result, hitCount: entry.hitCount };
    }
  }

  return null;
}

// Calculate Jaccard similarity between keyword sets
function calculateSimilarity(keywords1: string[], keywords2: string[]): number {
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);

  // Count intersection using Array.from for compatibility
  const intersection = Array.from(set1).filter(x => set2.has(x)).length;
  const union = new Set(keywords1.concat(keywords2)).size;

  if (union === 0) return 0;
  return intersection / union;
}

// Save to cache
function saveToCache(key: string, entry: CacheEntry): void {
  if (typeof window === 'undefined') return;

  try {
    const cache = getCache();
    cache[key] = entry;

    // Limit cache size to 100 entries
    const entries = Object.entries(cache);
    if (entries.length > 100) {
      // Remove oldest entries
      entries.sort((a, b) =>
        new Date(a[1].createdAt).getTime() - new Date(b[1].createdAt).getTime()
      );
      const toKeep = entries.slice(-100);
      const newCache = Object.fromEntries(toKeep);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
    } else {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch {
    // Ignore storage errors
  }
}

// Cache a new diagnosis
export function cacheDiagnosis(messages: Message[], result: DiagnosisResult): void {
  const key = generateCacheKey(messages);
  const keywords = extractKeywords(
    messages.filter(m => m.role === 'user').map(m => m.content).join(' ')
  );

  const entry: CacheEntry = {
    key,
    keywords,
    result,
    createdAt: new Date(),
    hitCount: 0,
  };

  saveToCache(key, entry);
}

// Get cache statistics
export function getCacheStats(): {
  totalEntries: number;
  totalHits: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
} {
  const cache = getCache();
  const entries = Object.values(cache);

  if (entries.length === 0) {
    return {
      totalEntries: 0,
      totalHits: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }

  const dates = entries.map(e => new Date(e.createdAt));
  const hits = entries.reduce((sum, e) => sum + e.hitCount, 0);

  return {
    totalEntries: entries.length,
    totalHits: hits,
    oldestEntry: new Date(Math.min(...dates.map(d => d.getTime()))),
    newestEntry: new Date(Math.max(...dates.map(d => d.getTime()))),
  };
}

// Clear the cache
export function clearCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}
