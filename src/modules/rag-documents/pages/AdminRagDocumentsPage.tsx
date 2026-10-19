import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../../../shared/components/ToastProvider";
import { AddDocumentBar } from "../components/AddDocumentBar";
import { ChunkEditor } from "../components/ChunkEditor";
import { ChunkList } from "../components/ChunkList";
import { DocumentDetail } from "../components/DocumentDetail";
import { DocumentList } from "../components/DocumentList";
import { useRagChunks } from "../hooks/useRagChunks";
import { useRagDocuments } from "../hooks/useRagDocuments";
import { useRagTaxonomy } from "../hooks/useRagTaxonomy";
import { useSelectedDocument } from "../hooks/useSelectedDocument";
import { canProceedInBrowser } from "../lib/discardGuard";
import { sameChunkFilter } from "../lib/listPaging";
import { messageForRagError } from "../lib/ragErrors";
import type { RagChunkFilter } from "../types/adminRag.types";

export function AdminRagDocumentsPage() {
  const { showToast } = useToast();
  const rag = useRagDocuments();
  const { taxonomy, errorCode: taxonomyErrorCode, retry: retryTaxonomy } = useRagTaxonomy();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // The selected document is tracked by id so it stays fresh when it leaves the listed page.
  const { setSelectedId, refresh: refreshList } = rag;
  const handleSelectedNotFound = useCallback(() => {
    setSelectedId(null);
    void refreshList();
  }, [setSelectedId, refreshList]);
  const seed = rag.documents.find((doc) => doc.id === rag.selectedId) ?? null;
  const selected = useSelectedDocument(rag.selectedId, seed, handleSelectedNotFound);
  const selectedDocument = selected.document;

  const chunks = useRagChunks(rag.selectedId, selectedDocument?.status);

  // Unsaved-changes guard: every selection change goes through `guarded`, so the confirm lives in one place.
  const dirtyRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);
  const handleDirtyChange = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
    setIsDirty(dirty);
  }, []);

  // Reload / tab close while editing (sidebar navigation cannot be blocked with BrowserRouter).
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
  // `isNoop` skips both the prompt and the action when the "change" re-selects the current item.
  function guarded<A extends unknown[]>(action: (...args: A) => void, isNoop?: (...args: A) => boolean) {
    return (...args: A) => {
      if (isNoop?.(...args)) return;
      if (canProceedInBrowser(dirtyRef.current)) action(...args);
    };
  }
  const selectDocument = guarded(
    (id: string) => rag.setSelectedId(id),
    (id) => id === rag.selectedId,
  );
  const { setSelectedChunkId, setFilter, refresh: refreshChunks, replaceChunk } = chunks;

  async function handleRetry(id: string) {
    setRetryingId(id);
    try {
      await rag.reingest(id, selected.merge);
    } catch (error) {
      showToast(messageForRagError(error, "Unable to retry document"), "error");
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <section className="foods-page rag-page">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Retrieval</p>
          <h2>Knowledge base</h2>
          <span>Add sources for the nutrition assistant, then review and edit the chunks it retrieves from.</span>
        </div>
      </div>

      <div className="rag-layout">
        <div className="rag-list-column">
          <AddDocumentBar addUrl={rag.addUrl} uploadPdf={rag.uploadPdf} onSelect={selectDocument} />
          <DocumentList
            documents={rag.documents}
            pagination={rag.pagination}
            query={rag.query}
            isLoading={rag.isLoading}
            errorCode={rag.errorCode}
            selectedId={rag.selectedId}
            retryingId={retryingId}
            onSelect={selectDocument}
            onQueryChange={rag.updateQuery}
            onRetryDocument={(id) => void handleRetry(id)}
            onReload={() => void rag.reload()}
          />
        </div>
        <div className="rag-detail-column">
          <DocumentDetail
            document={selectedDocument}
            isLoading={selected.isLoading}
            onRename={(id, title) => rag.renameDocument(id, title, selected.merge)}
            onReingest={(id) => rag.reingest(id, selected.merge)}
            onDelete={rag.deleteDocument}
            onBeforeDelete={() => canProceedInBrowser(dirtyRef.current)}
          />
          {rag.selectedId && taxonomyErrorCode ? (
            <div className="rag-warnings" role="status">
              <strong>Tag options failed to load.</strong>
              <p>The editor has no domain or tag choices until they load.</p>
              <button className="secondary-button" type="button" onClick={retryTaxonomy}>
                Retry
              </button>
            </div>
          ) : null}
          {rag.selectedId ? (
            <ChunkList
              chunks={chunks.chunks}
              filter={chunks.filter}
              isLoading={chunks.isLoading}
              errorCode={chunks.errorCode}
              taxonomy={taxonomy}
              selectedChunkId={chunks.selectedChunkId}
              onSelect={guarded(setSelectedChunkId, (chunkId) => chunkId === chunks.selectedChunkId)}
              onFilterChange={guarded(
                (next: RagChunkFilter) => setFilter(next),
                (next) => sameChunkFilter(next, chunks.filter),
              )}
              onReload={() => void chunks.reload()}
              renderEditor={(chunk) => (
                <ChunkEditor
                  key={chunk.id}
                  chunk={chunk}
                  taxonomy={taxonomy}
                  onSaved={replaceChunk}
                  onDirtyChange={handleDirtyChange}
                  onRefreshNeeded={() => void refreshChunks()}
                />
              )}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
