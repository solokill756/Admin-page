import { X } from "lucide-react";
import { useId } from "react";
import type { RagTaxonomyItem } from "../types/adminRag.types";

type TagChipsProps = {
  group: string;
  items: RagTaxonomyItem[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export function TagChips({ group, items, value, onChange, disabled = false }: TagChipsProps) {
  const selectId = useId();
  const available = items.filter((item) => !value.includes(item.key));

  return (
    <div className="rag-tag-group">
      <span className="rag-tag-group-label" id={`${selectId}-label`}>
        {group}
      </span>
      <div className="rag-tag-chips" role="group" aria-labelledby={`${selectId}-label`}>
        {value.map((key) => {
          const item = items.find((candidate) => candidate.key === key);
          const label = item?.labelEn ?? key;
          return (
            <span key={key} className="rag-chip rag-tag-chip" title={item?.labelVi ?? key}>
              {label}
              <button
                type="button"
                className="rag-tag-remove"
                aria-label={`Remove ${label}`}
                disabled={disabled}
                onClick={() => onChange(value.filter((existing) => existing !== key))}
              >
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          );
        })}
        {available.length > 0 ? (
          <select
            className="rag-tag-add"
            aria-label={`Add ${group}`}
            value=""
            disabled={disabled}
            onChange={(event) => {
              if (event.target.value) onChange([...value, event.target.value]);
            }}
          >
            <option value="">+ Add</option>
            {available.map((item) => (
              <option key={item.key} value={item.key} title={item.labelVi}>
                {item.labelEn}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  );
}
