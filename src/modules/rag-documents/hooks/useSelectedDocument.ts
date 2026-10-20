import { useCallback, useEffect, useRef, useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { adminRagApi } from "../api/adminRagApi";
import type { RagDocument } from "../types/adminRag.types";

const POLL_INTERVAL_MS = 3000;

function isIngesting(document: RagDocument | null): boolean {
  return document?.status === "pending" || document?.status === "processing";
}

/**
 * Tracks the selected document by id (independent of the list page/search), polling while it ingests.
 * `seed` is only used as the initial value when the selection changes, to avoid an empty flash.
 */
export function useSelectedDocument(
  selectedId: string | null,
  seed: RagDocument | null,
  onNotFound: () => void,
) {
  const [document, setDocument] = useState<RagDocument | null>(seed);
  const [isLoading, setIsLoading] = useState(selectedId !== null && seed === null);
  const [pollTick, setPollTick] = useState(0);

  const [trackedId, setTrackedId] = useState(selectedId);
  if (trackedId !== selectedId) {
    setTrackedId(selectedId);
    setDocument(seed);
    setIsLoading(selectedId !== null && seed === null);
  }

  // Only the most recently started request (or merge) may update state.
  const latestRequestId = useRef(0);
  const onNotFoundRef = useRef(onNotFound);
  onNotFoundRef.current = onNotFound;

  const load = useCallback(async (id: string | null) => {
    const requestId = ++latestRequestId.current;
    if (id === null) return;
    try {
      const response = await adminRagApi.getDocument(id);
      if (requestId !== latestRequestId.current) return;
      setDocument(response.data);
    } catch (error) {
      if (requestId !== latestRequestId.current) return;
      if (error instanceof AdminApiError && error.code === "RAG_DOCUMENT_NOT_FOUND") {
        setDocument(null);
        onNotFoundRef.current();
      }
      // Other errors keep the last known document; the next poll or selection retries.
    } finally {
      if (requestId === latestRequestId.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(selectedId);
  }, [selectedId, load]);

  const ingesting = isIngesting(document);
  useEffect(() => {
    if (selectedId === null || !ingesting) return;
    const handle = window.setTimeout(() => {
      void load(selectedId).finally(() => setPollTick((tick) => tick + 1));
    }, POLL_INTERVAL_MS);
    return () => window.clearTimeout(handle);
  }, [selectedId, ingesting, pollTick, load]);

  useEffect(
    () => () => {
      latestRequestId.current += 1;
    },
    [],
  );

  /** Adopt a fresher document (e.g. an API response after rename/re-ingest) and drop older in-flight loads. */
  const merge = useCallback((next: RagDocument) => {
    if (next.id !== trackedIdRef.current) return;
    latestRequestId.current += 1;
    setDocument(next);
    setIsLoading(false);
  }, []);
  const trackedIdRef = useRef(selectedId);
  trackedIdRef.current = selectedId;

  return { document: document && document.id === selectedId ? document : null, isLoading, merge };
}
