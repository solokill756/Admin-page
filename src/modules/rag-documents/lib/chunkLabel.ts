import type { RagChunk } from "../types/adminRag.types";

/** Short accessible name for a chunk card: heading path, pages and kind (not the whole content). */
export function chunkAriaLabel(chunk: Pick<RagChunk, "headingPath" | "pageFrom" | "pageTo" | "blockKind">): string {
  const parts = [chunk.headingPath || "No heading"];
  if (chunk.pageFrom !== null) {
    parts.push(
      chunk.pageTo === null || chunk.pageTo === chunk.pageFrom
        ? `page ${chunk.pageFrom}`
        : `pages ${chunk.pageFrom} to ${chunk.pageTo}`,
    );
  }
  parts.push(`${chunk.blockKind} chunk`);
  return parts.join(", ");
}
