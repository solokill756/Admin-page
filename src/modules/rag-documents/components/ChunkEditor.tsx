import { useEffect, useRef, useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { useToast } from "../../../shared/components/ToastProvider";
import { adminRagApi } from "../api/adminRagApi";
import { createDraft, draftToPatch, isDraftDirty, reconcileDraft } from "../lib/chunkDraft";
import type { ChunkDraft } from "../lib/chunkDraft";
import { canProceedInBrowser, DISCARD_RETAG_MESSAGE } from "../lib/discardGuard";
import { messageForRagError } from "../lib/ragErrors";
import type { RagChunk, RagDomain, RagTagGroup, RagTaxonomy } from "../types/adminRag.types";
import { ChunkImage } from "./ChunkImage";
import { TagChips } from "./TagChips";

type ChunkEditorProps = {
  chunk: RagChunk;
  taxonomy: RagTaxonomy | null;
  onSaved: (chunk: RagChunk) => void;
  onDirtyChange: (dirty: boolean) => void;
  /** Called when the server state may differ from `chunk` (e.g. content saved but indexing failed). */
  onRefreshNeeded?: () => void;
};

const TAG_GROUPS: { group: RagTagGroup; label: string }[] = [
  { group: "conditions", label: "Conditions" },
  { group: "allergens", label: "Allergens" },
  { group: "goals", label: "Goals" },
  { group: "nutrients", label: "Nutrients" },
];

type Busy = "save" | "retag" | "review" | null;

/** Render with `key={chunk.id}` so each chunk gets its own draft. */
export function ChunkEditor({ chunk, taxonomy, onSaved, onDirtyChange, onRefreshNeeded }: ChunkEditorProps) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState<ChunkDraft>(() => createDraft(chunk));
  const [previousChunk, setPreviousChunk] = useState(chunk);
  const [busy, setBusy] = useState<Busy>(null);

  // A refreshed copy of the same chunk keeps in-progress edits (adjusting state during render).
  if (previousChunk !== chunk) {
    setPreviousChunk(chunk);
    setDraft(reconcileDraft(draft, chunk, previousChunk));
  }

  const dirty = isDraftDirty(draft, chunk);

  const onDirtyChangeRef = useRef(onDirtyChange);
  onDirtyChangeRef.current = onDirtyChange;
  useEffect(() => {
    onDirtyChangeRef.current(dirty);
  }, [dirty]);
  useEffect(() => () => onDirtyChangeRef.current(false), []);

  const domains = taxonomy?.domains ?? [];
  const domainOptions = domains.some((item) => item.key === draft.domain)
    ? domains
    : [...domains, { key: draft.domain, labelEn: draft.domain, labelVi: draft.domain, description: "" }];

  function applyServerChunk(updated: RagChunk) {
    setDraft(createDraft(updated));
    onSaved(updated);
  }

  async function save() {
    if (!dirty || busy) return;
    setBusy("save");
    try {
      const response = await adminRagApi.updateChunk(chunk.id, draftToPatch(draft, chunk));
      applyServerChunk(response.data);
      showToast("Chunk saved", "success");
    } catch (error) {
      showToast(messageForRagError(error, "Unable to save chunk"), "error");
      if (error instanceof AdminApiError && error.code === "RAG_EMBEDDING_FAILED") {
        // Content is stored; pull the saved state so the editor matches it.
        onRefreshNeeded?.();
      }
    } finally {
      setBusy(null);
    }
  }

  async function retag() {
    if (busy) return;
    if (!canProceedInBrowser(dirty, DISCARD_RETAG_MESSAGE)) return;
    setBusy("retag");
    try {
      const response = await adminRagApi.retagChunk(chunk.id);
      applyServerChunk(response.data);
      showToast("Tags updated", "success");
    } catch (error) {
      showToast(messageForRagError(error, "Unable to re-tag chunk"), "error");
    } finally {
      setBusy(null);
    }
  }

  async function markReviewed() {
    if (busy) return;
    setBusy("review");
    try {
      const response = await adminRagApi.resolveReview(chunk.id);
      // Unsaved edits (if any) are kept: only the review flag changed on the server.
      onSaved(response.data);
      showToast("Marked as reviewed", "success");
    } catch (error) {
      showToast(messageForRagError(error, "Unable to mark chunk as reviewed"), "error");
    } finally {
      setBusy(null);
    }
  }

  const isImage = chunk.blockKind === "image";

  return (
    <div className={`rag-editor${isImage ? " with-image" : ""}`}>
      {isImage ? (
        <div className="rag-editor-image">
          <ChunkImage chunkId={chunk.id} heading={chunk.headingPath} />
        </div>
      ) : null}

      <form
        className="rag-editor-form"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {chunk.isManuallyEdited ? (
          <p className="rag-editor-note">Edited by an admin · re-ingesting this document will not overwrite this chunk</p>
        ) : null}
        {chunk.tagFailed ? (
          <p className="rag-editor-note rag-editor-note-warning">
            Automatic tagging failed for this chunk — add tags manually or re-tag
          </p>
        ) : null}

        <fieldset className="rag-editor-fields" disabled={busy !== null}>
          <label className="rag-editor-field">
            <span>Content</span>
            <textarea
              rows={isImage ? 10 : 8}
              value={draft.content}
              onChange={(event) => setDraft({ ...draft, content: event.target.value })}
            />
          </label>

          <label className="rag-editor-field">
            <span>Domain</span>
            <select value={draft.domain} onChange={(event) => setDraft({ ...draft, domain: event.target.value as RagDomain })}>
              {domainOptions.map((item) => (
                <option key={item.key} value={item.key} title={item.labelVi}>
                  {item.labelEn}
                </option>
              ))}
            </select>
          </label>

          {TAG_GROUPS.map(({ group, label }) => (
            <TagChips
              key={group}
              group={label}
              items={taxonomy?.groups[group] ?? []}
              value={draft.tags[group]}
              onChange={(next) => setDraft({ ...draft, tags: { ...draft.tags, [group]: next } })}
            />
          ))}

          <div className="rag-editor-radios" role="radiogroup" aria-label="Chunk state">
            <label className="rag-check">
              <input
                type="radio"
                name={`active-${chunk.id}`}
                checked={draft.isActive}
                onChange={() => setDraft({ ...draft, isActive: true })}
              />
              Used in RAG
            </label>
            <label className="rag-check">
              <input
                type="radio"
                name={`active-${chunk.id}`}
                checked={!draft.isActive}
                onChange={() => setDraft({ ...draft, isActive: false })}
              />
              Disabled
            </label>
          </div>
        </fieldset>

        <div className="rag-editor-actions">
          <button className="primary-button rag-editor-save" type="submit" disabled={!dirty || busy !== null}>
            {busy === "save" ? "Saving..." : "Save"}
          </button>
          <button className="secondary-button" type="button" disabled={busy !== null} onClick={() => void retag()}>
            {busy === "retag" ? "Re-tagging..." : "Re-tag with Jev"}
          </button>
          {chunk.needsReview ? (
            <button className="secondary-button" type="button" disabled={busy !== null} onClick={() => void markReviewed()}>
              {busy === "review" ? "Updating..." : "Mark reviewed"}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
