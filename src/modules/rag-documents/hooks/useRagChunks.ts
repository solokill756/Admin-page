import { useCallback, useEffect, useRef, useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { adminRagApi } from "../api/adminRagApi";
import { keepSelectedChunk } from "../lib/listPaging";
import type { RagChunk, RagChunkFilter, RagDocument } from "../types/adminRag.types";

const EMPTY_FILTER: RagChunkFilter = {};

export function useRagChunks(documentId: string | null, documentStatus?: RagDocument["status"]) {
  const [chunks, setChunks] = useState<RagChunk[]>([]);
  const [filter, setFilter] = useState<RagChunkFilter>(EMPTY_FILTER);
  const [isLoading, setIsLoading] = useState(documentId !== null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(null);

  // Switching document resets filter and selection (adjusting state during render, not in an effect).
  const [trackedDocumentId, setTrackedDocumentId] = useState(documentId);
  if (trackedDocumentId !== documentId) {
    setTrackedDocumentId(documentId);
    setFilter(EMPTY_FILTER);
    setSelectedChunkId(null);
    setChunks([]);
    setIsLoading(documentId !== null);
    setErrorCode(null);
  }

  // Only the response of the most recently started request may update state.
  const latestRequestId = useRef(0);

  const load = useCallback(async (id: string | null, chunkFilter: RagChunkFilter, showLoading: boolean) => {
    const requestId = ++latestRequestId.current;
    if (id === null) return;
    if (showLoading) {
      setIsLoading(true);
      setErrorCode(null);
    }
    try {
      const response = await adminRagApi.listChunks(id, chunkFilter);
      if (requestId !== latestRequestId.current) return;
      setChunks(response.data);
      // A filter change (or refresh) may remove the selected chunk; drop the stale selection.
      setSelectedChunkId((current) => keepSelectedChunk(current, response.data));
      setErrorCode(null);
      setIsLoading(false);
    } catch (error) {
      if (requestId !== latestRequestId.current) return;
      if (showLoading) {
        setChunks([]);
        setErrorCode(error instanceof AdminApiError ? error.code : "UNKNOWN_ERROR");
      }
      setIsLoading(false);
    }
  }, []);

  const filterRef = useRef(filter);
  filterRef.current = filter;
  const documentIdRef = useRef(documentId);
  documentIdRef.current = documentId;

  useEffect(() => {
    void load(documentId, filter, true);
  }, [documentId, filter, load]);

  // Reload silently when the selected document finishes ingesting (status -> ready).
  const previousStatus = useRef<{ id: string | null; status?: RagDocument["status"] }>({ id: documentId, status: documentStatus });
  useEffect(() => {
    const previous = previousStatus.current;
    previousStatus.current = { id: documentId, status: documentStatus };
    if (documentId !== null && previous.id === documentId && previous.status !== undefined && previous.status !== "ready" && documentStatus === "ready") {
      void load(documentId, filterRef.current, false);
    }
  }, [documentId, documentStatus, load]);

  useEffect(
    () => () => {
      // Invalidate any in-flight request so nothing updates state after unmount.
      latestRequestId.current += 1;
    },
    [],
  );

  const refresh = useCallback(() => load(documentIdRef.current, filterRef.current, false), [load]);

  const reload = useCallback(() => load(documentIdRef.current, filterRef.current, true), [load]);

  const replaceChunk = useCallback((chunk: RagChunk) => {
    setChunks((current) => current.map((item) => (item.id === chunk.id ? chunk : item)));
  }, []);

  return { chunks, filter, isLoading, errorCode, selectedChunkId, setFilter, setSelectedChunkId, replaceChunk, refresh, reload };
}
