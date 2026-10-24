import { describe, expect, it } from "vitest";
import type { RagChunk } from "../types/adminRag.types";
import {
  applyStoredPatch,
  buildSavePatch,
  canSaveDraft,
  createDraft,
  deriveEditorState,
  draftToPatch,
  isContentEmpty,
  isDraftDirty,
  isEditorDirty,
  reconcileDraft,
  reindexForDraft,
  reindexKindFor,
} from "./chunkDraft";

function chunk(overrides: Partial<RagChunk> = {}): RagChunk {
  return {
    id: "chunk-1",
    documentId: "doc-1",
    headingPath: "Intro",
    pageFrom: null,
    pageTo: null,
    blockKind: "text",
    language: "en",
    domain: "guidelines",
    tags: { conditions: [], allergens: [], goals: [], nutrients: [] },
    tagScores: {},
    tagger: null,
    tagFailed: false,
    content: "a",
    hasImage: false,
    isActive: true,
    isManuallyEdited: false,
    needsReview: false,
    updatedAt: "now",
    ...overrides,
  };
}

describe("chunkDraft", () => {
  it("draftToPatch includes only changed fields", () => {
    const c = chunk({ content: "a", tags: { conditions: ["diabetes"], allergens: [], goals: [], nutrients: [] } });
    const d = { ...createDraft(c), isActive: false };
    expect(draftToPatch(d, c)).toEqual({ isActive: false });
  });

  it("draftToPatch sends the full tags object when any group changed", () => {
    const c = chunk({ tags: { conditions: ["diabetes"], allergens: ["eggs"], goals: [], nutrients: ["sodium"] } });
    const d = createDraft(c);
    d.tags = { ...d.tags, goals: ["weight_loss"] };
    expect(draftToPatch(d, c)).toEqual({
      tags: { conditions: ["diabetes"], allergens: ["eggs"], goals: ["weight_loss"], nutrients: ["sodium"] },
    });
  });

  it("draftToPatch includes content and domain when changed", () => {
    const c = chunk();
    const d = { ...createDraft(c), content: "b", domain: "safety" as const };
    expect(draftToPatch(d, c)).toEqual({ content: "b", domain: "safety" });
  });

  it("isDraftDirty ignores tag order", () => {
    const c = chunk({ tags: { conditions: ["diabetes", "hypertension"], allergens: [], goals: [], nutrients: [] } });
    expect(
      isDraftDirty({ ...createDraft(c), tags: { ...c.tags, conditions: ["hypertension", "diabetes"] } }, c),
    ).toBe(false);
    expect(isDraftDirty({ ...createDraft(c), content: "changed" }, c)).toBe(true);
  });

  it("reconcileDraft keeps unsaved edits when the chunk list refreshes", () => {
    const prev = chunk({ content: "old" });
    const draft = { ...createDraft(prev), content: "typing…" };
    expect(reconcileDraft(draft, chunk({ content: "old", updatedAt: "later" }), prev).content).toBe("typing…");
  });

  it("reindexKindFor picks content when the failed patch had content, else activate", () => {
    expect(reindexKindFor({ content: "x", isActive: true })).toBe("content");
    expect(reindexKindFor({ isActive: true })).toBe("activate");
  });

  it("buildSavePatch is the plain patch when nothing is pending", () => {
    const c = chunk();
    expect(buildSavePatch({ ...createDraft(c), domain: "safety" }, c, null)).toEqual({ domain: "safety" });
  });

  it("buildSavePatch forces unchanged content for a pending content reindex", () => {
    const c = chunk({ content: "saved" });
    expect(buildSavePatch(createDraft(c), c, "content")).toEqual({ content: "saved" });
  });

  it("buildSavePatch forces isActive true for a pending activation reindex", () => {
    const c = chunk({ isActive: true });
    expect(buildSavePatch(createDraft(c), c, "activate")).toEqual({ isActive: true });
    expect(buildSavePatch({ ...createDraft(c), domain: "safety" }, c, "activate")).toEqual({ domain: "safety", isActive: true });
  });

  it("tolerates a chunk whose tags lack a group", () => {
    const c = chunk({ tags: { conditions: ["diabetes"] } as unknown as RagChunk["tags"] });
    const d = createDraft(c);
    expect(d.tags).toEqual({ conditions: ["diabetes"], allergens: [], goals: [], nutrients: [] });
    expect(isDraftDirty(d, c)).toBe(false);
    expect(draftToPatch({ ...d, content: "b" }, c)).toEqual({ content: "b" });
  });

  it("reindexForDraft drops a pending reindex while the draft is Disabled", () => {
    const c = chunk();
    expect(reindexForDraft("activate", { ...createDraft(c), isActive: false })).toBeNull();
    expect(reindexForDraft("activate", createDraft(c))).toBe("activate");
    expect(reindexForDraft(null, createDraft(c))).toBeNull();
  });

  it("isEditorDirty counts a pending reindex as dirty", () => {
    expect(isEditorDirty(false, "content")).toBe(true);
    expect(isEditorDirty(true, null)).toBe(true);
    expect(isEditorDirty(false, null)).toBe(false);
  });

  it("canSaveDraft is false for empty or whitespace content, even with a pending reindex", () => {
    const c = chunk();
    const empty = { ...createDraft(c), content: "  \n" };
    expect(isContentEmpty(empty)).toBe(true);
    expect(canSaveDraft(empty, true, null)).toBe(false);
    expect(canSaveDraft(empty, false, "content")).toBe(false);
    expect(canSaveDraft({ ...createDraft(c), content: "b" }, true, null)).toBe(true);
    expect(canSaveDraft(createDraft(c), false, null)).toBe(false);
  });

  it("reconcileDraft takes the refreshed chunk when there are no edits", () => {
    const prev = chunk({ content: "old" });
    expect(reconcileDraft(createDraft(prev), chunk({ content: "retagged" }), prev).content).toBe("retagged");
    expect(reconcileDraft(null, chunk({ content: "retagged" }), prev).content).toBe("retagged");
  });

  it("applyStoredPatch adopts the fields a save stored even though indexing failed", () => {
    const c = chunk({ isActive: false, domain: "guidelines" });
    const stored = applyStoredPatch(c, { isActive: true, domain: "safety", tags: { ...c.tags, goals: ["weight_loss"] } });
    expect(stored).toEqual({ ...c, isActive: true, domain: "safety", tags: { ...c.tags, goals: ["weight_loss"] } });
    expect(c.isActive).toBe(false);
  });

  // NB1: re-enable under "Inactive only" fails to index, then choose Disabled — the server chunk is active, so Disabled must be savable.
  it("a Disabled choice after a failed re-enable is savable as isActive false", () => {
    const stored = applyStoredPatch(chunk({ isActive: false }), { isActive: true });
    const disabled = { ...createDraft(stored), isActive: false };
    const state = deriveEditorState(disabled, stored, "activate");
    expect(state.saveEnabled).toBe(true);
    expect(buildSavePatch(disabled, stored, state.pending)).toEqual({ isActive: false });
  });

  // NB3: toggling Disabled and back without saving keeps "Retry indexing".
  it("deriveEditorState hides a pending activation while Disabled and restores it when re-enabled", () => {
    const stored = chunk({ isActive: true });
    const active = createDraft(stored);
    expect(deriveEditorState({ ...active, isActive: false }, stored, "activate").pending).toBeNull();
    expect(deriveEditorState(active, stored, "activate")).toEqual({
      dirty: false,
      pending: "activate",
      guardDirty: true,
      saveEnabled: true,
    });
  });

  it("deriveEditorState is clean with no edits and nothing pending", () => {
    const c = chunk();
    expect(deriveEditorState(createDraft(c), c, null)).toEqual({
      dirty: false,
      pending: null,
      guardDirty: false,
      saveEnabled: false,
    });
  });
});
