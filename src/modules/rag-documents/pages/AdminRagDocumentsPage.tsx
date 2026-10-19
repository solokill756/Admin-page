import { useState } from "react";
import { useToast } from "../../../shared/components/ToastProvider";
import { AddDocumentBar } from "../components/AddDocumentBar";
import { DocumentList } from "../components/DocumentList";
import { useRagDocuments } from "../hooks/useRagDocuments";
import { messageForRagError } from "../lib/ragErrors";

type DocumentDetailColumnProps = {
  selectedId: string | null;
};

// Seam for Task 3: replace the body with the document detail + chunk list, driven by `selectedId`.
function DocumentDetailColumn(_props: DocumentDetailColumnProps) {
  return <p className="state-copy">Select a document to see its chunks.</p>;
}

export function AdminRagDocumentsPage() {
  const { showToast } = useToast();
  const rag = useRagDocuments();
  const [retryingId, setRetryingId] = useState<string | null>(null);

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
          <DocumentDetailColumn selectedId={rag.selectedId} />
        </div>
      </div>
    </section>
  );
}
