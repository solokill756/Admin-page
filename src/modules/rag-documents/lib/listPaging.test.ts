import { describe, expect, it } from "vitest";
import { keepSelectedChunk, pageAfterDelete, sameQuery } from "./listPaging";

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

describe("keepSelectedChunk", () => {
  it("keeps a selection that is still listed", () => {
    expect(keepSelectedChunk("a", [{ id: "a" }, { id: "b" }])).toBe("a");
  });
  it("clears a selection that was filtered out", () => {
    expect(keepSelectedChunk("a", [{ id: "b" }])).toBeNull();
    expect(keepSelectedChunk(null, [{ id: "b" }])).toBeNull();
  });
});
