import { describe, expect, it } from "vitest";
import { applyChunkRefresh, keepSelectedChunk, mergeSilentChunks, pageAfterDelete, sameChunkFilter, sameQuery } from "./listPaging";

describe("sameChunkFilter", () => {
  it("treats undefined and missing keys as equal", () => {
    expect(sameChunkFilter({}, { blockKind: undefined })).toBe(true);
    expect(sameChunkFilter({ isActive: false }, { isActive: false })).toBe(true);
  });
  it("detects differences", () => {
    expect(sameChunkFilter({}, { blockKind: "text" })).toBe(false);
    expect(sameChunkFilter({ isActive: false }, {})).toBe(false);
  });
});

describe("mergeSilentChunks", () => {
  const a = { id: "a", v: 1 };
  const b = { id: "b", v: 1 };
  it("returns the refreshed list when the selection is still in it", () => {
    const next = [{ id: "a", v: 2 }];
    expect(mergeSilentChunks([a, b], next, "a")).toBe(next);
  });
  it("keeps the previous copy of a selected chunk that dropped out", () => {
    expect(mergeSilentChunks([a, b], [b], "a")).toEqual([b, a]);
  });
  it("returns the refreshed list when nothing is selected or the previous copy is unknown", () => {
    expect(mergeSilentChunks([a], [b], null)).toEqual([b]);
    expect(mergeSilentChunks([b], [b], "a")).toEqual([b]);
  });
});

describe("pageAfterDelete", () => {
  it("steps back when the only item of a later page is deleted", () => {
    expect(pageAfterDelete("a", ["a"], 3)).toBe(2);
  });
  it("does not step back on page 1", () => {
    expect(pageAfterDelete("a", ["a"], 1)).toBeNull();
  });
  it("does not step back when other items remain", () => {
    expect(pageAfterDelete("a", ["a", "b"], 2)).toBeNull();
  });
  it("does not step back when the deleted document is not in the current list", () => {
    expect(pageAfterDelete("z", ["a"], 2)).toBeNull();
  });
});

describe("sameQuery", () => {
  it("compares by value regardless of key order", () => {
    expect(sameQuery({ page: 1, limit: 20 }, { limit: 20, page: 1 })).toBe(true);
  });
  it("detects differences", () => {
    expect(sameQuery({ page: 1 }, { page: 2 })).toBe(false);
    expect(sameQuery({ page: 1 }, { page: 1, search: "x" })).toBe(false);
  });
});

describe("applyChunkRefresh", () => {
  const a = { id: "a", v: 1 };
  const b = { id: "b", v: 1 };
  it("loading: takes the new list and drops a selection that is no longer listed", () => {
    expect(applyChunkRefresh("loading", [a, b], [b], "a")).toEqual({ chunks: [b], selectedId: null });
  });
  it("silent: keeps the selected chunk's previous copy so an open editor stays", () => {
    expect(applyChunkRefresh("silent", [a, b], [b], "a")).toEqual({ chunks: [b, a], selectedId: "a" });
  });
  // NB2: chunks deleted by a re-ingest leave the list, and their selection is cleared.
  it("ingest: drops chunks the re-ingest removed, including the selected one", () => {
    expect(applyChunkRefresh("ingest", [a, b], [b], "a")).toEqual({ chunks: [b], selectedId: null });
    expect(applyChunkRefresh("ingest", [a, b], [{ id: "a", v: 2 }], "a")).toEqual({
      chunks: [{ id: "a", v: 2 }],
      selectedId: "a",
    });
  });
});

describe("keepSelectedChunk", () => {
  it("keeps a selection that is still listed", () => {
    expect(keepSelectedChunk("a", [{ id: "a" }, { id: "b" }])).toBe("a");
  });
  it("clears a selection that was filtered out", () => {
    expect(keepSelectedChunk("a", [{ id: "b" }])).toBeNull();
    expect(keepSelectedChunk(null, [{ id: "b" }])).toBeNull();
  });
});
