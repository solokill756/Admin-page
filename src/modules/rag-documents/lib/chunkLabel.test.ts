import { describe, expect, it } from "vitest";
import { chunkAriaLabel } from "./chunkLabel";

describe("chunkAriaLabel", () => {
  it("names heading, page range and kind", () => {
    expect(chunkAriaLabel({ headingPath: "Diabetes > Diet", pageFrom: 3, pageTo: 4, blockKind: "table" })).toBe(
      "Diabetes > Diet, pages 3 to 4, table chunk",
    );
  });
  it("uses a single page and falls back when there is no heading", () => {
    expect(chunkAriaLabel({ headingPath: "", pageFrom: 2, pageTo: 2, blockKind: "text" })).toBe("No heading, page 2, text chunk");
    expect(chunkAriaLabel({ headingPath: "", pageFrom: 2, pageTo: null, blockKind: "text" })).toBe("No heading, page 2, text chunk");
  });
  it("omits pages when unknown", () => {
    expect(chunkAriaLabel({ headingPath: "A", pageFrom: null, pageTo: null, blockKind: "image" })).toBe("A, image chunk");
  });
});
