import { FormEvent, useRef, useState, type ChangeEvent } from "react";
import { useToast } from "../../../shared/components/ToastProvider";
import { messageForRagError } from "../lib/ragErrors";
import { validatePdfFile } from "../lib/ragStatus";
import type { RagCreateResult } from "../hooks/useRagDocuments";

type AddDocumentBarProps = {
  addUrl: (url: string) => Promise<RagCreateResult>;
  uploadPdf: (file: File) => Promise<RagCreateResult>;
  onSelect: (id: string) => void;
};

type Busy = "url" | "pdf" | null;

export function AddDocumentBar({ addUrl, uploadPdf, onSelect }: AddDocumentBarProps) {
  const { showToast } = useToast();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleResult(result: RagCreateResult) {
    if (result.created) {
      showToast("Document queued for processing", "success");
    } else {
      showToast("This document is already in the knowledge base", "success");
    }
    onSelect(result.document.id);
  }

  async function handleAddUrl(event: FormEvent) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || busy) return;

    setBusy("url");
    try {
      handleResult(await addUrl(trimmed));
      setUrl("");
    } catch (error) {
      showToast(messageForRagError(error, "Unable to add document"), "error");
    } finally {
      setBusy(null);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    const validationError = validatePdfFile(file);
    if (validationError) {
      showToast(validationError, "error");
      input.value = "";
      return;
    }

    setBusy("pdf");
    try {
      handleResult(await uploadPdf(file));
    } catch (error) {
      showToast(messageForRagError(error, "Unable to upload document"), "error");
    } finally {
      // Reset so the same file can be chosen again.
      input.value = "";
      setBusy(null);
    }
  }

  const isBusy = busy !== null;

  return (
    <div className="rag-add-bar">
      <form className="rag-add-url" onSubmit={(event) => void handleAddUrl(event)}>
        <label>
          <span>Document URL</span>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.who.int/..."
            disabled={isBusy}
          />
        </label>
        <button className="primary-button" type="submit" disabled={isBusy || url.trim() === ""}>
          {busy === "url" ? "Adding…" : "Add URL"}
        </button>
      </form>

      <div className="rag-add-upload">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          aria-label="PDF file"
          hidden
          onChange={(event) => void handleFileChange(event)}
        />
        <button className="secondary-button" type="button" disabled={isBusy} onClick={() => fileInputRef.current?.click()}>
          {busy === "pdf" ? "Uploading…" : "Upload PDF"}
        </button>
      </div>
    </div>
  );
}
