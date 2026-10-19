import { FileText, Image as ImageIcon, Table2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { sortChunks } from "../lib/chunkOrder";
import { messageForRagError } from "../lib/ragErrors";
import type { RagChunk, RagChunkFilter, RagTagGroup, RagTaxonomy } from "../types/adminRag.types";

type ChunkListProps = {
  chunks: RagChunk[];
  filter: RagChunkFilter;
  isLoading: boolean;
  errorCode: string | null;
  taxonomy: RagTaxonomy | null;
  selectedChunkId: string | null;
  onSelect: (chunkId: string) => void;
  onFilterChange: (filter: RagChunkFilter) => void;
  onReload: () => void;
  /** Task 4 seam: rendered directly under the selected chunk card (the in-place editor). */
  renderEditor?: (chunk: RagChunk) => ReactNode;
};

const TAG_GROUPS: RagTagGroup[] = ["conditions", "allergens", "goals", "nutrients"];

const KIND_OPTIONS: { value: RagChunk["blockKind"] | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "text", label: "Text" },
  { value: "table", label: "Table" },
  { value: "image", label: "Image" },
];

const KIND_ICONS = { text: FileText, table: Table2, image: ImageIcon } as const;

function pageLabel(chunk: RagChunk): string | null {
  if (chunk.pageFrom === null) return null;
  if (chunk.pageTo === null || chunk.pageTo === chunk.pageFrom) return `p. ${chunk.pageFrom}`;
  return `p. ${chunk.pageFrom}–${chunk.pageTo}`;
}

function tagLabel(taxonomy: RagTaxonomy | null, group: RagTagGroup, key: string): string {
  return taxonomy?.groups[group]?.find((item) => item.key === key)?.labelEn ?? key;
}

function ChunkCard({
  chunk,
  taxonomy,
  isSelected,
  onSelect,
}: {
  chunk: RagChunk;
  taxonomy: RagTaxonomy | null;
  isSelected: boolean;
  onSelect: (chunkId: string) => void;
}) {
  const KindIcon = KIND_ICONS[chunk.blockKind];
  const page = pageLabel(chunk);
  const domainLabel = taxonomy?.domains.find((item) => item.key === chunk.domain)?.labelEn ?? chunk.domain;

  return (
    <button
      className={`rag-chunk-card${isSelected ? " selected" : ""}${chunk.isActive ? "" : " inactive"}`}
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(chunk.id)}
    >
      <span className="rag-chunk-head">
        <KindIcon size={15} aria-label={chunk.blockKind} />
        <span className="rag-chunk-heading">{chunk.headingPath || "—"}</span>
        {page ? <span className="rag-chunk-page">{page}</span> : null}
      </span>

      <span className="rag-chunk-chips">
        <span className="rag-chip rag-chip-domain">{domainLabel}</span>
        {TAG_GROUPS.flatMap((group) =>
          chunk.tags[group].map((key) => (
            <span key={`${group}:${key}`} className="rag-chip">
              {tagLabel(taxonomy, group, key)}
            </span>
          )),
        )}
      </span>

      <span className="rag-chunk-content">{chunk.content}</span>

      {chunk.isManuallyEdited || chunk.needsReview || !chunk.isActive || chunk.tagFailed ? (
        <span className="rag-chunk-badges">
          {chunk.isManuallyEdited ? <span className="rag-badge rag-badge-edited">Edited</span> : null}
          {chunk.needsReview ? <span className="rag-badge rag-badge-review">Needs review</span> : null}
          {!chunk.isActive ? <span className="rag-badge rag-badge-inactive">Inactive</span> : null}
          {chunk.tagFailed ? <span className="rag-badge rag-badge-failed">Tagging failed</span> : null}
        </span>
      ) : null}
    </button>
  );
}

export function ChunkList({
  chunks,
  filter,
  isLoading,
  errorCode,
  taxonomy,
  selectedChunkId,
  onSelect,
  onFilterChange,
  onReload,
  renderEditor,
}: ChunkListProps) {
  const sorted = useMemo(() => sortChunks(chunks), [chunks]);

  return (
    <div className="rag-chunk-list">
      <div className="rag-chunk-filters">
        <div className="rag-segmented" role="group" aria-label="Chunk type">
          {KIND_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              className={filter.blockKind === option.value ? "active" : ""}
              aria-pressed={filter.blockKind === option.value}
              onClick={() => onFilterChange({ ...filter, blockKind: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="rag-check">
          <input
            type="checkbox"
            checked={filter.needsReview === true}
            onChange={(event) => onFilterChange({ ...filter, needsReview: event.target.checked ? true : undefined })}
          />
          Needs review
        </label>
        <label className="rag-check">
          <input
            type="checkbox"
            checked={filter.isActive === false}
            onChange={(event) => onFilterChange({ ...filter, isActive: event.target.checked ? false : undefined })}
          />
          Inactive only
        </label>
      </div>

      {isLoading ? <p className="state-copy">Loading chunks...</p> : null}

      {!isLoading && errorCode ? (
        <div className="dashboard-error" role="alert">
          <strong>Failed to load chunks.</strong>
          <p>{messageForRagError(new AdminApiError(errorCode, "", 0), "An error occurred, please try again")}</p>
          <button className="secondary-button" type="button" onClick={onReload}>
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !errorCode && sorted.length === 0 ? <p className="state-copy">No chunks found.</p> : null}

      {!isLoading && !errorCode && sorted.length > 0 ? (
        <ul className="rag-chunk-items">
          {sorted.map((chunk) => {
            const isSelected = chunk.id === selectedChunkId;
            return (
              <li key={chunk.id}>
                <ChunkCard chunk={chunk} taxonomy={taxonomy} isSelected={isSelected} onSelect={onSelect} />
                {isSelected && renderEditor ? renderEditor(chunk) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
