import { describe, expect, it } from "vitest";
import type { RagDocument, RagJob } from "../types/adminRag.types";
import { documentStatusLabel, hasActiveIngest, validatePdfFile } from "./ragStatus";

function job(overrides: Partial<RagJob> = {}): RagJob {
  return {
    id: "job-1",
    status: "running",
    stage: null,
    progress: 0,
    errorMessage: null,
    warnings: [],
    startedAt: null,
    finishedAt: null,
    ...overrides,
  };
}

function doc(overrides: Partial<RagDocument> = {}): RagDocument {
  return {
    id: "doc-1",
    sourceType: "url",
    sourceUrl: "https://example.com",
    originalFilename: null,
    title: "Doc",
    language: "en",
    status: "ready",
    chunkCount: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    latestJob: null,
    ...overrides,
  };
}

describe("ragStatus", () => {
  it("hasActiveIngest is true only for pending/processing", () => {
    expect(hasActiveIngest([doc({ status: "ready" }), doc({ status: "failed" })])).toBe(false);
    expect(hasActiveIngest([doc({ status: "ready" }), doc({ status: "processing" })])).toBe(true);
    expect(hasActiveIngest([doc({ status: "pending" })])).toBe(true);
    expect(hasActiveIngest([])).toBe(false);
  });

  it("documentStatusLabel", () => {
    expect(documentStatusLabel(doc({ status: "pending" }))).toBe("Queued");
    expect(documentStatusLabel(doc({ status: "processing", latestJob: job({ stage: "tagging", progress: 62 }) })))
      .toBe("Processing · tagging 62%");
    expect(documentStatusLabel(doc({ status: "ready", chunkCount: 14 }))).toBe("Ready · 14 chunks");
    expect(
      documentStatusLabel(
        doc({ status: "failed", latestJob: job({ errorMessage: "Could not download the page (blocked or not found)" }) }),
      ),
    ).toBe("Failed: Could not download the page (blocked or not found)");
    expect(documentStatusLabel(doc({ status: "failed" }))).toBe("Failed");
  });

  it("validatePdfFile", () => {
    expect(validatePdfFile({ name: "a.pdf", type: "application/pdf", size: 1000 })).toBeNull();
    expect(validatePdfFile({ name: "A.PDF", type: "", size: 1000 })).toBeNull();
    expect(validatePdfFile({ name: "a.docx", type: "application/msword", size: 1000 })).toMatch(/PDF/);
    expect(validatePdfFile({ name: "a.pdf", type: "application/pdf", size: 51 * 1024 * 1024 })).toMatch(/50 MB/);
  });
});
