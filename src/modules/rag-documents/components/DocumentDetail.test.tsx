import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ToastProvider } from "../../../shared/components/ToastProvider";
import type { RagDocument } from "../types/adminRag.types";
import { DocumentDetail } from "./DocumentDetail";

function doc(overrides: Partial<RagDocument> = {}): RagDocument {
  return {
    id: "doc-1",
    sourceType: "pdf",
    sourceUrl: null,
    originalFilename: "guide.pdf",
    title: "Guide",
    language: "en",
    status: "ready",
    chunkCount: 12,
    createdAt: "now",
    updatedAt: "now",
    latestJob: null,
    ...overrides,
  };
}

function render(document: RagDocument): string {
  const noop = async () => {};
  return renderToStaticMarkup(
    <ToastProvider>
      <DocumentDetail document={document} onRename={noop} onReingest={noop} onDelete={noop} />
    </ToastProvider>,
  );
}

const count = (html: string, text: string) => html.split(text).length - 1;

describe("DocumentDetail", () => {
  it("shows the chunk count once for a ready document", () => {
    expect(count(render(doc()), "12 chunks")).toBe(1);
  });

  it("still shows the chunk count while a document is processing", () => {
    expect(count(render(doc({ status: "processing" })), "12 chunks")).toBe(1);
  });
});
