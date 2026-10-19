import { useRef, useState } from "react";
import { useToast } from "../../../shared/components/ToastProvider";
import { AddDocumentBar } from "../components/AddDocumentBar";
import { ChunkList } from "../components/ChunkList";
import { DocumentDetail } from "../components/DocumentDetail";
import { DocumentList } from "../components/DocumentList";
import { useRagChunks } from "../hooks/useRagChunks";
import { useRagDocuments } from "../hooks/useRagDocuments";
import { useRagTaxonomy } from "../hooks/useRagTaxonomy";
import { messageForRagError } from "../lib/ragErrors";
import type { RagDocument } from "../types/adminRag.types";

export function AdminRagDocumentsPage() {
  const { showToast } = useToast();
  const rag = useRagDocuments();
  const { taxonomy } = useRagTaxonomy();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Keep showing the selected document if it moves off the currently listed page.
  const lastSelectedDocument = useRef<RagDocument | null>(null);
  const listed = rag.documents.find((doc) => doc.id === rag.selectedId) ?? null;
  if (listed) lastSelectedDocument.current = listed;
  const selectedDocument =
    listed ?? (lastSelectedDocument.current?.id === rag.selectedId ? lastSelectedDocument.current : null);

  const chunks = useRagChunks(selectedDocument?.id ?? null, selectedDocument?.status);

  async function handleRetry(id: string) {
    setRetryingId(id);
    try {
      await rag.reingest(id);
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
          <AddDocumentBar addUrl={rag.addUrl} uploadPdf={rag.uploadPdf} onSelect={rag.setSelectedId} />
          <DocumentList
            documents={rag.documents}
            pagination={rag.pagination}
            query={rag.query}
            isLoading={rag.isLoading}
            errorCode={rag.errorCode}
            selectedId={rag.selectedId}
            retryingId={retryingId}
            onSelect={rag.setSelectedId}
            onQueryChange={rag.updateQuery}
            onRetryDocument={(id) => void handleRetry(id)}
            onReload={() => void rag.reload()}
          />
        </div>
        <div className="rag-detail-column">
          <DocumentDetail
            document={selectedDocument}
            onRename={rag.renameDocument}
            onReingest={rag.reingest}
            onDelete={rag.deleteDocument}
          />
          {selectedDocument ? (
            <ChunkList
              chunks={chunks.chunks}
              filter={chunks.filter}
              isLoading={chunks.isLoading}
              errorCode={chunks.errorCode}
              taxonomy={taxonomy}
              selectedChunkId={chunks.selectedChunkId}
              onSelect={chunks.setSelectedChunkId}
              onFilterChange={chunks.setFilter}
              onReload={() => void chunks.reload()}
              // Task 4: pass renderEditor={(chunk) => <ChunkEditor ... />} here.
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
