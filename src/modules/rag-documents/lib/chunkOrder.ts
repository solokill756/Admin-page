import type { RagChunk } from "../types/adminRag.types";

const KIND_RANK: Record<RagChunk["blockKind"], number> = { text: 0, table: 1, image: 2 };

/** pageFrom ascending (nulls last), then headingPath, then blockKind text < table < image. */
export function compareChunks(a: RagChunk, b: RagChunk): number {
  if (a.pageFrom !== b.pageFrom) {
    if (a.pageFrom === null) return 1;
    if (b.pageFrom === null) return -1;
    return a.pageFrom - b.pageFrom;
  }
  if (a.headingPath !== b.headingPath) {
    return a.headingPath < b.headingPath ? -1 : 1;
  }
  return KIND_RANK[a.blockKind] - KIND_RANK[b.blockKind];
}

export function sortChunks(chunks: RagChunk[]): RagChunk[] {
  return [...chunks].sort(compareChunks);
}
