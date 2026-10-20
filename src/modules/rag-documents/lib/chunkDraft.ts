import type { RagChunk, RagDomain, RagTagGroup, RagTags, UpdateRagChunkPayload } from "../types/adminRag.types";

export type ChunkDraft = {
  chunkId: string;
  content: string;
  domain: RagDomain;
  tags: RagTags;
  isActive: boolean;
};

const TAG_GROUPS: RagTagGroup[] = ["conditions", "allergens", "goals", "nutrients"];

function cloneTags(tags: RagTags): RagTags {
  return {
    conditions: [...(tags.conditions ?? [])],
    allergens: [...(tags.allergens ?? [])],
    goals: [...(tags.goals ?? [])],
    nutrients: [...(tags.nutrients ?? [])],
  };
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const set = new Set(a);
  return set.size === new Set(b).size && b.every((value) => set.has(value));
}

function tagsEqual(a: RagTags, b: RagTags): boolean {
  return TAG_GROUPS.every((group) => sameSet(a[group] ?? [], b[group] ?? []));
}

export function createDraft(chunk: RagChunk): ChunkDraft {
  return {
    chunkId: chunk.id,
    content: chunk.content,
    domain: chunk.domain,
    tags: cloneTags(chunk.tags),
    isActive: chunk.isActive,
  };
}

export function isDraftDirty(draft: ChunkDraft, chunk: RagChunk): boolean {
  return (
    draft.content !== chunk.content ||
    draft.domain !== chunk.domain ||
    draft.isActive !== chunk.isActive ||
    !tagsEqual(draft.tags, chunk.tags)
  );
}

/** Only changed fields. The backend replaces the whole tags object, so tags are always sent in full. */
export function draftToPatch(draft: ChunkDraft, chunk: RagChunk): UpdateRagChunkPayload {
  const patch: UpdateRagChunkPayload = {};
  if (draft.content !== chunk.content) patch.content = draft.content;
  if (draft.domain !== chunk.domain) patch.domain = draft.domain;
  if (!tagsEqual(draft.tags, chunk.tags)) patch.tags = cloneTags(draft.tags);
  if (draft.isActive !== chunk.isActive) patch.isActive = draft.isActive;
  return patch;
}

/** What must be re-sent to re-embed a chunk whose save stored the data but failed to index it. */
export type ReindexPending = "content" | "activate" | null;

/** The backend re-embeds when the patch has `content` (even unchanged) or `isActive: true`. */
export function reindexKindFor(patch: UpdateRagChunkPayload): Exclude<ReindexPending, null> {
  return patch.content !== undefined ? "content" : "activate";
}

export function buildSavePatch(draft: ChunkDraft, chunk: RagChunk, reindexPending: ReindexPending): UpdateRagChunkPayload {
  const patch = draftToPatch(draft, chunk);
  if (reindexPending === "content") return { ...patch, content: draft.content };
  if (reindexPending === "activate") return { ...patch, isActive: true };
  return patch;
}

/** An "activate" retry must not override a Disabled choice: any pending reindex is dropped while the draft is disabled. */
export function reindexForDraft(pending: ReindexPending, draft: ChunkDraft): ReindexPending {
  return draft.isActive ? pending : null;
}

/** Unsaved edits or a pending reindex both need the discard prompt / beforeunload warning. */
export function isEditorDirty(dirty: boolean, pending: ReindexPending): boolean {
  return dirty || pending !== null;
}

export function isContentEmpty(draft: ChunkDraft): boolean {
  return draft.content.trim() === "";
}

export function canSaveDraft(draft: ChunkDraft, dirty: boolean, pending: ReindexPending): boolean {
  return isEditorDirty(dirty, pending) && !isContentEmpty(draft);
}

/** Keeps in-progress edits across a list refresh; otherwise adopts the refreshed chunk. */
export function reconcileDraft(draft: ChunkDraft | null, refreshed: RagChunk, previous: RagChunk): ChunkDraft {
  if (draft && isDraftDirty(draft, previous)) {
    return draft;
  }
  return createDraft(refreshed);
}
