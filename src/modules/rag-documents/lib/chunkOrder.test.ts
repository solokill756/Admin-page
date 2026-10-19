import { describe, expect, it } from "vitest";
import type { RagChunk } from "../types/adminRag.types";
import { sortChunks } from "./chunkOrder";

function chunk(id: string, overrides: Partial<RagChunk> = {}): RagChunk {
  return {
    id,
    documentId: "doc-1",
    headingPath: "",
    pageFrom: null,
    pageTo: null,
    blockKind: "text",
    language: "en",
    domain: "guidelines",
    tags: { conditions: [], allergens: [], goals: [], nutrients: [] },
    tagScores: {},
    tagger: null,
    tagFailed: false,
    content: "",
    hasImage: false,
    isActive: true,
    isManuallyEdited: false,
    needsReview: false,
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const ids = (chunks: RagChunk[]) => chunks.map((c) => c.id);

describe("sortChunks", () => {
  it("orders by pageFrom ascending with nulls last", () => {
    const sorted = sortChunks([chunk("n"), chunk("p5", { pageFrom: 5 }), chunk("p2", { pageFrom: 2 })]);
    expect(ids(sorted)).toEqual(["p2", "p5", "n"]);
  });

  it("breaks page ties by headingPath", () => {
    const sorted = sortChunks([chunk("b", { pageFrom: 1, headingPath: "B" }), chunk("a", { pageFrom: 1, headingPath: "A" })]);
    expect(ids(sorted)).toEqual(["a", "b"]);
  });

  it("breaks heading ties by blockKind text < table < image", () => {
    const sorted = sortChunks([
      chunk("image", { blockKind: "image" }),
      chunk("table", { blockKind: "table" }),
      chunk("text", { blockKind: "text" }),
    ]);
    expect(ids(sorted)).toEqual(["text", "table", "image"]);
  });

  it("does not mutate the input", () => {
    const input = [chunk("b", { pageFrom: 2 }), chunk("a", { pageFrom: 1 })];
    sortChunks(input);
    expect(ids(input)).toEqual(["b", "a"]);
  });
});
