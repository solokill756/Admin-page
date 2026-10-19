import { AdminApiError } from "../../../shared/api/httpClient";

const RAG_ERROR_MESSAGES: Record<string, string> = {
  RAG_DOCUMENT_NOT_FOUND: "Document not found",
  RAG_CHUNK_NOT_FOUND: "Chunk not found",
  RAG_IMAGE_NOT_FOUND: "Image not found",
  RAG_INVALID_URL: "Invalid URL; only http and https are supported",
  RAG_INVALID_FILE: "Invalid file; a PDF is required",
  RAG_FILE_TOO_LARGE: "File is too large (max 50 MB)",
  RAG_INVALID_TAG: "Invalid tag",
  RAG_INVALID_DOMAIN: "Invalid domain",
  RAG_JOB_IN_PROGRESS: "This document is already being processed",
  RAG_TAGGING_FAILED: "Tagging failed",
  RAG_EMBEDDING_FAILED: "Chunk saved, but search indexing failed — press Retry indexing",
  VALIDATION_ERROR: "Invalid data entered",
  UNAUTHORIZED: "Session expired",
  ADMIN_ONLY: "You do not have admin privileges",
  ACCOUNT_BLOCKED: "Account has been blocked",
  NETWORK_ERROR: "Unable to connect to server",
  UNKNOWN_ERROR: "An error occurred, please try again",
};

export function messageForRagError(error: unknown, fallback: string): string {
  if (error instanceof AdminApiError) {
    return RAG_ERROR_MESSAGES[error.code] ?? fallback;
  }
  return fallback;
}
