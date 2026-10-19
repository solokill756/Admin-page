import { describe, expect, it } from "vitest";
import type { RagChunk } from "../types/adminRag.types";
import { buildSavePatch, createDraft, draftToPatch, reindexKindFor, isDraftDirty, reconcileDraft } from "./chunkDraft";

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

  it("reconcileDraft takes the refreshed chunk when there are no edits", () => {
    const prev = chunk({ content: "old" });
    expect(reconcileDraft(createDraft(prev), chunk({ content: "retagged" }), prev).content).toBe("retagged");
    expect(reconcileDraft(null, chunk({ content: "retagged" }), prev).content).toBe("retagged");
  });
});
