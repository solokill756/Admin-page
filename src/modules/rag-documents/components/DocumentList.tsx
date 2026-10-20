import { FileText, Globe } from "lucide-react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { messageForRagError } from "../lib/ragErrors";
import { documentStatusLabel } from "../lib/ragStatus";
import type { RagDocument, RagDocumentListQuery, RagPagination } from "../types/adminRag.types";

type DocumentListProps = {
  documents: RagDocument[];
  pagination: RagPagination;
  query: RagDocumentListQuery;
  isLoading: boolean;
  errorCode: string | null;
  selectedId: string | null;
  retryingId: string | null;
  onSelect: (id: string) => void;
  onQueryChange: (patch: RagDocumentListQuery, resetPage?: boolean) => void;
  onRetryDocument: (id: string) => void;
  onReload: () => void;
};

const LANGUAGE_LABELS = { en: "EN", vi: "VI", mixed: "Mixed" } as const;

function sourceHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function DocumentSource({ doc }: { doc: RagDocument }) {
  if (doc.sourceType === "url" && doc.sourceUrl) {
    return (
      <span className="rag-doc-source">
        <Globe size={14} aria-hidden="true" />
        <span>{sourceHostname(doc.sourceUrl)}</span>
      </span>
    );
  }
  return (
    <span className="rag-doc-source">
      <FileText size={14} aria-hidden="true" />
      <span>{doc.originalFilename ?? "PDF file"}</span>
    </span>
  );
}

export function DocumentList({
  documents,
  pagination,
  query,
  isLoading,
  errorCode,
  selectedId,
  retryingId,
  onSelect,
  onQueryChange,
  onRetryDocument,
  onReload,
}: DocumentListProps) {
  return (
    <div className="rag-document-list">
      <div className="rag-filter-bar">
        <label className="rag-filter-search">
          <span>Search</span>
          <input
            value={query.search ?? ""}
            onChange={(event) => onQueryChange({ search: event.target.value || undefined })}
            placeholder="Title or source"
          />
        </label>

        <label>
          <span>Status</span>
          <select
            value={query.status ?? ""}
            onChange={(event) => onQueryChange({ status: (event.target.value || undefined) as RagDocumentListQuery["status"] })}
          >
            <option value="">All</option>
            <option value="pending">Queued</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="failed">Failed</option>
          </select>
        </label>

        <label>
          <span>Language</span>
          <select
            value={query.language ?? ""}
            onChange={(event) => onQueryChange({ language: (event.target.value || undefined) as RagDocumentListQuery["language"] })}
          >
            <option value="">All</option>
            <option value="en">EN</option>
            <option value="vi">VI</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
      </div>

      {isLoading ? <p className="state-copy">Loading documents...</p> : null}

      {!isLoading && errorCode ? (
        <div className="dashboard-error" role="alert">
          <strong>Failed to load documents.</strong>
          <p>{messageForRagError(new AdminApiError(errorCode, "", 0), "An error occurred, please try again")}</p>
          <button className="secondary-button" type="button" onClick={onReload}>
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !errorCode && documents.length === 0 ? <p className="state-copy">No documents found.</p> : null}

      {!isLoading && !errorCode && documents.length > 0 ? (
        <>
          <ul className="rag-doc-items">
            {documents.map((doc) => {
              const isSelected = doc.id === selectedId;
              const isActive = doc.status === "pending" || doc.status === "processing";
              return (
                <li key={doc.id} className={`rag-doc-item${isSelected ? " selected" : ""}`}>
                  <button
                    className="rag-doc-select"
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelect(doc.id)}
                  >
                    <span className="rag-doc-title">{doc.title}</span>
                    <span className="rag-doc-meta">
                      <DocumentSource doc={doc} />
                      {doc.language ? <span className="rag-doc-language">{LANGUAGE_LABELS[doc.language]}</span> : null}
                    </span>
                    <span className={`rag-doc-status rag-status-${doc.status}`}>{documentStatusLabel(doc)}</span>
                    {isActive ? (
                      <span className="progress-bar-bg rag-doc-progress" aria-hidden="true">
                        <span
                          className="progress-bar-fill"
                          style={{ display: "block", width: `${doc.status === "pending" ? 0 : (doc.latestJob?.progress ?? 0)}%` }}
                        />
                      </span>
                    ) : null}
                  </button>
                  {doc.status === "failed" ? (
                    <button
                      className="secondary-button rag-doc-retry"
                      type="button"
                      disabled={retryingId === doc.id}
                      onClick={() => onRetryDocument(doc.id)}
                    >
                      {retryingId === doc.id ? "Retrying…" : "Retry"}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="pagination-bar">
            <span>
              Page {pagination.page} of {Math.max(pagination.totalPages, 1)} · {pagination.total} documents
            </span>
            <div>
              <button
                className="secondary-button"
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => onQueryChange({ page: pagination.page - 1 }, false)}
              >
                Previous
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onQueryChange({ page: pagination.page + 1 }, false)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
