import { adminRequest, adminRequestBlob } from "../../../shared/api/httpClient";
import type {
  RagChunkFilter,
  RagChunkListResponse,
  RagChunkResponse,
  RagDocumentCreateResponse,
  RagDocumentDeleteResponse,
  RagDocumentListQuery,
  RagDocumentListResponse,
  RagDocumentResponse,
  RagTaxonomyResponse,
  UpdateRagChunkPayload,
} from "../types/adminRag.types";

function toQueryString(query: object): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

const jsonBody = (payload: unknown) => JSON.stringify(payload);

export const adminRagApi = {
  listDocuments(query: RagDocumentListQuery) {
    return adminRequest<RagDocumentListResponse>(`/admin/rag/documents${toQueryString(query)}`);
  },

  getDocument(id: string) {
    return adminRequest<RagDocumentResponse>(`/admin/rag/documents/${id}`);
  },

  addUrl(url: string) {
    return adminRequest<RagDocumentCreateResponse>("/admin/rag/documents/url", {
      method: "POST",
      body: jsonBody({ url }),
    });
  },

  uploadPdf(file: File) {
    const form = new FormData();
    form.append("file", file);
    return adminRequest<RagDocumentCreateResponse>("/admin/rag/documents/upload", {
      method: "POST",
      body: form,
    });
  },

  renameDocument(id: string, title: string) {
    return adminRequest<RagDocumentResponse>(`/admin/rag/documents/${id}`, {
      method: "PATCH",
      body: jsonBody({ title }),
    });
  },

  reingest(id: string) {
    return adminRequest<RagDocumentResponse>(`/admin/rag/documents/${id}/reingest`, { method: "POST" });
  },

  deleteDocument(id: string) {
    return adminRequest<RagDocumentDeleteResponse>(`/admin/rag/documents/${id}`, { method: "DELETE" });
  },

  listChunks(documentId: string, filter: RagChunkFilter) {
    return adminRequest<RagChunkListResponse>(`/admin/rag/documents/${documentId}/chunks${toQueryString(filter)}`);
  },

  updateChunk(id: string, payload: UpdateRagChunkPayload) {
    return adminRequest<RagChunkResponse>(`/admin/rag/chunks/${id}`, {
      method: "PATCH",
      body: jsonBody(payload),
    });
  },

  retagChunk(id: string) {
    return adminRequest<RagChunkResponse>(`/admin/rag/chunks/${id}/retag`, { method: "POST" });
  },

  resolveReview(id: string) {
    return adminRequest<RagChunkResponse>(`/admin/rag/chunks/${id}/resolve-review`, { method: "POST" });
  },

  getChunkImage(id: string): Promise<Blob> {
    return adminRequestBlob(`/admin/rag/chunks/${id}/image`);
  },

  getTaxonomy() {
    return adminRequest<RagTaxonomyResponse>("/admin/rag/taxonomy");
  },
};
