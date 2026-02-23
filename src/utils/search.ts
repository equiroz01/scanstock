/**
 * Normalizes text for search by removing accents and converting to lowercase
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
    .trim();
}

/**
 * Checks if a text matches a search query (accent and case insensitive)
 */
export function matchesSearch(text: string | null | undefined, query: string): boolean {
  if (!text) return false;
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  return normalizedText.includes(normalizedQuery);
}

/**
 * Highlights matching text portions (returns array of segments)
 */
export function getHighlightedSegments(
  text: string,
  query: string
): { text: string; highlight: boolean }[] {
  if (!query.trim()) {
    return [{ text, highlight: false }];
  }

  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  const index = normalizedText.indexOf(normalizedQuery);

  if (index === -1) {
    return [{ text, highlight: false }];
  }

  const segments: { text: string; highlight: boolean }[] = [];

  if (index > 0) {
    segments.push({ text: text.slice(0, index), highlight: false });
  }

  segments.push({
    text: text.slice(index, index + query.length),
    highlight: true,
  });

  if (index + query.length < text.length) {
    segments.push({
      text: text.slice(index + query.length),
      highlight: false,
    });
  }

  return segments;
}
