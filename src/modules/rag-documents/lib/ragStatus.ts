import type { RagDocument } from "../types/adminRag.types";

export const MAX_PDF_BYTES = 50 * 1024 * 1024;

export function hasActiveIngest(docs: RagDocument[]): boolean {
  return docs.some((doc) => doc.status === "pending" || doc.status === "processing");
}

export function documentStatusLabel(doc: RagDocument): string {
  switch (doc.status) {
    case "pending":
      return "Queued";
    case "processing": {
      const job = doc.latestJob;
      const detail = job ? [job.stage, `${job.progress}%`].filter(Boolean).join(" ") : "";
      return detail ? `Processing · ${detail}` : "Processing";
    }
    case "ready":
      return `Ready · ${doc.chunkCount} chunks`;
    case "failed": {
      const message = doc.latestJob?.errorMessage;
      return message ? `Failed: ${message}` : "Failed";
    }
  }
}

export function validatePdfFile(file: { name: string; type: string; size: number }): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return "Only PDF files are supported";
  }
  if (file.size > MAX_PDF_BYTES) {
    return "File is too large (max 50 MB)";
  }
  return null;
}
