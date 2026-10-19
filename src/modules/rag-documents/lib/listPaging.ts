import type { RagDocumentListQuery } from "../types/adminRag.types";

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

/** Keeps the selected chunk only while it is still in the list. */
export function keepSelectedChunk(selectedId: string | null, chunks: { id: string }[]): string | null {
  return selectedId !== null && chunks.some((chunk) => chunk.id === selectedId) ? selectedId : null;
}
