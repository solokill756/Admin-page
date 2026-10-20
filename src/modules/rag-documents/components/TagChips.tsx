import { X } from "lucide-react";
import { useId, useState } from "react";
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
  const [picked, setPicked] = useState("");
  // Picking only highlights an option; adding is explicit (button or Enter), so arrow-key browsing never edits tags.
  const pickedKey = available.some((item) => item.key === picked) ? picked : "";

  function addPicked() {
    if (!pickedKey) return;
    onChange([...value, pickedKey]);
    setPicked("");
  }

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
          <span className="rag-tag-adder">
            <select
              className="rag-tag-add"
              aria-label={`Choose ${group} to add`}
              value={pickedKey}
              disabled={disabled}
              onChange={(event) => setPicked(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault(); // never submit the editor form from the picker
                  addPicked();
                }
              }}
            >
              <option value="">Choose...</option>
              {available.map((item) => (
                <option key={item.key} value={item.key} title={item.labelVi}>
                  {item.labelEn}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rag-tag-add-button"
              aria-label={`Add selected ${group}`}
              disabled={disabled || !pickedKey}
              onClick={addPicked}
            >
              + Add
            </button>
          </span>
        ) : null}
      </div>
    </div>
  );
}
