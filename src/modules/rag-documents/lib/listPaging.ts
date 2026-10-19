import type { RagChunkFilter, RagDocumentListQuery } from "../types/adminRag.types";

/** Page to step back to after deleting `deletedId`, or null when no step-back is needed. */
export function pageAfterDelete(deletedId: string, shownIds: string[], page: number): number | null {
  if (page > 1 && shownIds.length === 1 && shownIds[0] === deletedId) {
    return page - 1;
  }
  return null;
}

export function sameQuery(a: RagDocumentListQuery, b: RagDocumentListQuery): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof RagDocumentListQuery>;
  return [...keys].every((key) => a[key] === b[key]);
}

/** Compares chunk filters by value (undefined and missing keys are equal). */
export function sameChunkFilter(a: RagChunkFilter, b: RagChunkFilter): boolean {
  return a.blockKind === b.blockKind && a.needsReview === b.needsReview && a.isActive === b.isActive;
}

/**
 * For silent refreshes: if the refreshed list no longer contains the selected chunk,
 * keep its previous copy so an open editor does not unmount.
 */
export function mergeSilentChunks<T extends { id: string }>(previous: T[], next: T[], selectedId: string | null): T[] {
  if (selectedId === null || next.some((chunk) => chunk.id === selectedId)) return next;
  const kept = previous.find((chunk) => chunk.id === selectedId);
  return kept ? [...next, kept] : next;
}

/** Keeps the selected chunk only while it is still in the list. */
export function keepSelectedChunk(selectedId: string | null, chunks: { id: string }[]): string | null {
  return selectedId !== null && chunks.some((chunk) => chunk.id === selectedId) ? selectedId : null;
}
