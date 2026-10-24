import { ExternalLink, FileText, Pencil } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../../shared/components/ToastProvider";
import { messageForRagError } from "../lib/ragErrors";
import { documentStatusLabel } from "../lib/ragStatus";
import type { RagDocument } from "../types/adminRag.types";

type DocumentDetailProps = {
  document: RagDocument | null;
  isLoading?: boolean;
  onRename: (id: string, title: string) => Promise<void>;
  onReingest: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  /** Return false to stop the delete dialog from opening (e.g. unsaved edits the admin chose to keep). */
  onBeforeDelete?: () => boolean;
};

const LANGUAGE_LABELS = { en: "EN", vi: "VI", mixed: "Mixed" } as const;

function TitleEditor({ document, onRename }: { document: RagDocument; onRename: DocumentDetailProps["onRename"] }) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState<string | null>(null);

  async function save() {
    const next = (draft ?? "").trim();
    setDraft(null);
    if (!next || next === document.title) return;
    try {
      await onRename(document.id, next);
    } catch (error) {
      showToast(messageForRagError(error, "Unable to rename document"), "error");
    }
  }

  if (draft === null) {
    return (
      <div className="rag-detail-title">
        <h3>{document.title}</h3>
        <button
          className="icon-button"
          type="button"
          aria-label="Edit title"
          title="Edit title"
          onClick={() => setDraft(document.title)}
        >
          <Pencil size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <input
      className="rag-title-input"
      aria-label="Document title"
      autoFocus
      value={draft}
      maxLength={500}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          void save();
        } else if (event.key === "Escape") {
          setDraft(null);
        }
      }}
      onBlur={() => setDraft(null)}
    />
  );
}

export function DocumentDetail({ document, isLoading = false, onRename, onReingest, onDelete, onBeforeDelete }: DocumentDetailProps) {
  const { showToast } = useToast();
  const [isReingesting, setIsReingesting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!document && isLoading) {
    return <p className="state-copy">Loading document...</p>;
  }
  if (!document) {
    return <p className="state-copy">Select a document to see its chunks.</p>;
  }

  const warnings = document.latestJob?.warnings ?? [];

  async function handleReingest(id: string) {
    setIsReingesting(true);
    try {
      await onReingest(id);
      showToast("Re-ingest started", "success");
    } catch (error) {
      showToast(messageForRagError(error, "Unable to re-ingest document"), "error");
    } finally {
      setIsReingesting(false);
    }
  }

  async function handleDelete(id: string) {
    setIsDeleting(true);
    try {
      await onDelete(id);
      setIsConfirmingDelete(false);
      showToast("Document deleted", "success");
    } catch (error) {
      showToast(messageForRagError(error, "Unable to delete document"), "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="rag-detail">
      <TitleEditor key={document.id} document={document} onRename={onRename} />

      <div className="rag-detail-meta">
        {document.sourceType === "url" && document.sourceUrl ? (
          <a href={document.sourceUrl} target="_blank" rel="noopener noreferrer" className="rag-doc-source">
            <ExternalLink size={14} aria-hidden="true" />
            <span>{document.sourceUrl}</span>
          </a>
        ) : (
          <span className="rag-doc-source">
            <FileText size={14} aria-hidden="true" />
            <span>{document.originalFilename ?? "PDF file"}</span>
          </span>
        )}
        {document.language ? <span className="rag-doc-language">{LANGUAGE_LABELS[document.language]}</span> : null}
        {/* The Ready status label already includes the count. */}
        {document.status === "ready" ? null : <span>{document.chunkCount} chunks</span>}
        <span className={`rag-doc-status rag-status-${document.status}`}>{documentStatusLabel(document)}</span>
      </div>

      {warnings.length > 0 ? (
        <div className="rag-warnings" role="status">
          <strong>Ingest warnings</strong>
          <ul>
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rag-detail-actions">
        <button
          className="secondary-button"
          type="button"
          disabled={isReingesting}
          onClick={() => void handleReingest(document.id)}
        >
          {isReingesting ? "Re-ingesting…" : "Re-ingest"}
        </button>
        <button className="danger-button" type="button" onClick={() => {
            if (onBeforeDelete && !onBeforeDelete()) return;
            setIsConfirmingDelete(true);
          }}>
          Delete
        </button>
      </div>

      {isConfirmingDelete ? (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-rag-document-title">
            <h2 id="delete-rag-document-title">Delete &quot;{document.title}&quot;?</h2>
            <p>All its chunks and images will be removed from the knowledge base.</p>
            <div className="modal-actions">
              <button className="secondary-button" type="button" disabled={isDeleting} onClick={() => setIsConfirmingDelete(false)}>
                Cancel
              </button>
              <button className="danger-button" type="button" disabled={isDeleting} onClick={() => void handleDelete(document.id)}>
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
