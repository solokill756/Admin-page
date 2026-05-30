import { FormEvent, useMemo, useState } from "react";
import { AdminExercise, AdminExerciseFormValues, ExerciseType } from "../types/adminExercise.types";

type ExerciseFormModalProps = {
  exercise: AdminExercise | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: AdminExerciseFormValues) => Promise<void>;
};

type FormErrors = Partial<Record<keyof AdminExerciseFormValues, string>>;

export function ExerciseFormModal({ exercise, isSubmitting, onClose, onSubmit }: ExerciseFormModalProps) {
  const [values, setValues] = useState<AdminExerciseFormValues>(() => ({
    name: exercise?.name ?? "",
    type: exercise?.type ?? "cardio",
    met: exercise?.met ?? null,
    defaultCalPerMin: exercise?.defaultCalPerMin ?? null,
    notes: exercise?.notes ?? "",
    isVerified: exercise?.isVerified ?? true,
  }));

  const errors = useMemo(() => validate(values), [values]);
  const isInvalid = Object.keys(errors).length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isInvalid) {
      return;
    }

    await onSubmit({
      name: values.name.trim(),
      type: values.type,
      met: values.met ?? null,
      defaultCalPerMin: values.defaultCalPerMin ?? null,
      notes: values.notes?.trim() || null,
      isVerified: values.isVerified ?? true,
    });
  }

  function updateField<TKey extends keyof AdminExerciseFormValues>(
    key: TKey,
    value: AdminExerciseFormValues[TKey],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="food-modal exercise-modal" role="dialog" aria-modal="true" aria-labelledby="exercise-modal-title">
        <div className="modal-header">
          <div>
            <p className="section-kicker">{exercise ? "Edit" : "Create"}</p>
            <h2 id="exercise-modal-title">{exercise ? "Edit exercise" : "Add exercise"}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">x</button>
        </div>

        <form className="food-form" onSubmit={handleSubmit}>
          <TextField label="Exercise name *" value={values.name} error={errors.name} onChange={(value) => updateField("name", value)} />
          <label className="form-field">
            <span>Type *</span>
            <select value={values.type} onChange={(event) => updateField("type", event.target.value as ExerciseType)}>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
            </select>
            {errors.type ? <small>{errors.type}</small> : null}
          </label>
          <div className="form-grid">
            <NullableNumberField label="MET" value={values.met ?? null} error={errors.met} onChange={(value) => updateField("met", value)} />
            <NullableNumberField
              label="Default calories per minute"
              value={values.defaultCalPerMin ?? null}
              error={errors.defaultCalPerMin}
              onChange={(value) => updateField("defaultCalPerMin", value)}
            />
          </div>
          <label className="form-field">
            <span>Notes</span>
            <textarea
              className="form-textarea"
              value={values.notes ?? ""}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={values.isVerified ?? false}
              onChange={(event) => updateField("isVerified", event.target.checked)}
            />
            <span>Verified</span>
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={isInvalid || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save exercise"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TextField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function NullableNumberField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: number | null;
  error?: string;
  onChange: (value: number | null) => void;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
      />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function validate(values: AdminExerciseFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Exercise name is required";
  if (!values.type) errors.type = "Type is required";
  if (values.met !== null && values.met !== undefined && Number(values.met) < 0) {
    errors.met = "MET cannot be negative";
  }
  if (values.defaultCalPerMin !== null && values.defaultCalPerMin !== undefined && Number(values.defaultCalPerMin) < 0) {
    errors.defaultCalPerMin = "Calories per minute cannot be negative";
  }
  return errors;
}
