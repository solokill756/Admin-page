import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { adminRagApi } from "../api/adminRagApi";
import { pageAfterDelete, sameQuery } from "../lib/listPaging";
import { hasActiveIngest } from "../lib/ragStatus";
import type { RagDocument, RagDocumentListQuery, RagPagination } from "../types/adminRag.types";

const POLL_INTERVAL_MS = 3000;
const SEARCH_DEBOUNCE_MS = 350;

const DEFAULT_QUERY: RagDocumentListQuery & { page: number; limit: number } = {
  page: 1,
  limit: 20,
};

export type RagCreateResult = { created: boolean; document: RagDocument };

export function useRagDocuments() {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [pagination, setPagination] = useState<RagPagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [query, setQuery] = useState<RagDocumentListQuery>(DEFAULT_QUERY);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Bumped after each poll attempt so the polling effect re-arms even when the data did not change.
  const [pollTick, setPollTick] = useState(0);

  const effectiveQuery = useMemo(() => ({ ...DEFAULT_QUERY, ...query }), [query]);
  const [debouncedQuery, setDebouncedQuery] = useState(effectiveQuery);

  useEffect(() => {
    const handle = window.setTimeout(
      () => setDebouncedQuery((current) => (sameQuery(current, effectiveQuery) ? current : effectiveQuery)),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(handle);
  }, [effectiveQuery]);

  // Only the response of the most recently started request may update state.
  const latestRequestId = useRef(0);
  const debouncedQueryRef = useRef(debouncedQuery);
  debouncedQueryRef.current = debouncedQuery;

  const load = useCallback(async (listQuery: RagDocumentListQuery, showLoading: boolean) => {
    const requestId = ++latestRequestId.current;
    if (showLoading) {
      setIsLoading(true);
      setErrorCode(null);
    }
    try {
      const response = await adminRagApi.listDocuments(listQuery);
      if (requestId !== latestRequestId.current) return;
      setDocuments(response.data);
      setPagination(response.pagination);
      setErrorCode(null);
      setIsLoading(false);
    } catch (error) {
      if (requestId !== latestRequestId.current) return;
      if (showLoading) {
        setDocuments([]);
        setErrorCode(error instanceof AdminApiError ? error.code : "UNKNOWN_ERROR");
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(debouncedQuery, true);
  }, [debouncedQuery, load]);

  useEffect(() => {
    if (!hasActiveIngest(documents)) return;
    const handle = window.setTimeout(() => {
      void load(debouncedQuery, false).finally(() => setPollTick((tick) => tick + 1));
    }, POLL_INTERVAL_MS);
    return () => window.clearTimeout(handle);
  }, [documents, debouncedQuery, pollTick, load]);

  useEffect(
    () => () => {
      // Invalidate any in-flight request so nothing updates state after unmount.
      latestRequestId.current += 1;
    },
    [],
  );

  const updateQuery = useCallback((patch: RagDocumentListQuery, resetPage = true) => {
    setQuery((current) => ({
      ...current,
      ...patch,
      page: resetPage ? 1 : patch.page ?? current.page,
    }));
  }, []);

  const listStateRef = useRef({ documents, pagination });
  listStateRef.current = { documents, pagination };

  const refresh = useCallback(() => load(debouncedQueryRef.current, false), [load]);
  const reload = useCallback(() => load(debouncedQueryRef.current, true), [load]);

  const addUrl = useCallback(
    async (url: string): Promise<RagCreateResult> => {
      const response = await adminRagApi.addUrl(url);
      await refresh();
      return { created: response.created, document: response.data };
    },
    [refresh],
  );

  const uploadPdf = useCallback(
    async (file: File): Promise<RagCreateResult> => {
      const response = await adminRagApi.uploadPdf(file);
      await refresh();
      return { created: response.created, document: response.data };
    },
    [refresh],
  );

  const reingest = useCallback(
    async (id: string, onUpdated?: (document: RagDocument) => void) => {
      const response = await adminRagApi.reingest(id);
      onUpdated?.(response.data);
      await refresh();
    },
    [refresh],
  );

  const renameDocument = useCallback(
    async (id: string, title: string, onUpdated?: (document: RagDocument) => void) => {
      const response = await adminRagApi.renameDocument(id, title);
      onUpdated?.(response.data);
      await refresh();
    },
    [refresh],
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      await adminRagApi.deleteDocument(id);
      setSelectedId((current) => (current === id ? null : current));
      const { documents: shown, pagination: currentPagination } = listStateRef.current;
      // Drop the row immediately so it cannot be clicked while the list reloads.
      setDocuments((current) => current.filter((doc) => doc.id !== id));
      const previousPage = pageAfterDelete(
        id,
        shown.map((doc) => doc.id),
        currentPagination.page,
      );
      if (previousPage !== null) {
        // Step back and load right away instead of waiting for the search debounce.
        const nextQuery = { ...debouncedQueryRef.current, page: previousPage };
        setQuery((current) => ({ ...current, page: previousPage }));
        setDebouncedQuery(nextQuery);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  return {
    documents,
    pagination,
    query: effectiveQuery,
    isLoading,
    errorCode,
    selectedId,
    setSelectedId,
    updateQuery,
    addUrl,
    uploadPdf,
    reingest,
    deleteDocument,
    renameDocument,
    refresh,
    reload,
  };
}
