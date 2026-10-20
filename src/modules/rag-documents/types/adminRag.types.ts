// Mirrors nutrition-coach-server: src/admin/rag-documents/dto/rag-responses.ts and src/rag-ingest/rag-taxonomy.ts

export type RagTagGroup = "conditions" | "allergens" | "goals" | "nutrients";
export type RagDomain = "guidelines" | "conditions" | "safety";
export type RagTags = Record<RagTagGroup, string[]>;
export type RagTaxonomyItem = { key: string; labelEn: string; labelVi: string; description: string };

export type RagJob = {
  id: string;
  status: "pending" | "running" | "done" | "failed";
  stage: string | null;
  progress: number;
  errorMessage: string | null;
  warnings: string[];
  startedAt: string | null;
  finishedAt: string | null;
};

export type RagDocument = {
  id: string;
  sourceType: "url" | "pdf";
  sourceUrl: string | null;
  originalFilename: string | null;
  title: string;
  language: "en" | "vi" | "mixed" | null;
  status: "pending" | "processing" | "ready" | "failed";
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
  latestJob: RagJob | null;
};

export type RagChunk = {
  id: string;
  documentId: string;
  headingPath: string;
  pageFrom: number | null;
  pageTo: number | null;
  blockKind: "text" | "table" | "image";
  language: "en" | "vi" | null;
  domain: RagDomain;
  tags: RagTags;
  tagScores: Record<string, number>;
  tagger: string | null;
  tagFailed: boolean;
  content: string;
  hasImage: boolean;
  isActive: boolean;
  isManuallyEdited: boolean;
  needsReview: boolean;
  updatedAt: string;
};

export type RagTaxonomy = {
  domains: RagTaxonomyItem[];
  groups: Record<RagTagGroup, RagTaxonomyItem[]>;
};

export type RagDocumentListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: RagDocument["status"];
  language?: "en" | "vi" | "mixed";
};

export type RagChunkFilter = {
  blockKind?: RagChunk["blockKind"];
  needsReview?: boolean;
  isActive?: boolean;
};

export type UpdateRagChunkPayload = {
  content?: string;
  domain?: RagDomain;
  tags?: RagTags;
  isActive?: boolean;
};

export type RagPagination = { page: number; limit: number; total: number; totalPages: number };

export type RagDocumentResponse = { success: true; data: RagDocument };
export type RagDocumentCreateResponse = { success: true; data: RagDocument; created: boolean };
export type RagDocumentListResponse = { success: true; data: RagDocument[]; pagination: RagPagination };
export type RagDocumentDeleteResponse = { success: true; message: string };
export type RagChunkResponse = { success: true; data: RagChunk };
export type RagChunkListResponse = { success: true; data: RagChunk[] };
export type RagTaxonomyResponse = { success: true; data: RagTaxonomy };
