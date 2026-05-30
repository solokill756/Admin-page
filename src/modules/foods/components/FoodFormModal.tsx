import { FormEvent, useMemo, useState } from "react";
import { AdminFood, AdminFoodFormValues } from "../types/adminFood.types";

type FoodFormModalProps = {
  food: AdminFood | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: AdminFoodFormValues) => Promise<void>;
};

type FormErrors = Partial<Record<keyof AdminFoodFormValues, string>>;

const numberFields: Array<keyof AdminFoodFormValues> = [
  "servingSize",
  "calories",
  "proteinG",
  "totalCarbohydratesG",
  "totalFatG",
  "fiberG",
  "sodiumMg",
  "saturatedFatG",
  "cholesterolMg",
  "sugarsG",
  "potassiumMg",
  "calciumMg",
  "ironMg",
  "magnesiumMg",
  "phosphorusMg",
  "zincMg",
  "vitaminAUg",
  "vitaminCMg",
  "vitaminDUg",
  "vitaminEMg",
  "vitaminKUg",
  "vitaminB6Mg",
  "vitaminB12Ug",
  "folateDfeUg",
];

export function FoodFormModal({
  food,
  isSubmitting,
  onClose,
  onSubmit,
}: FoodFormModalProps) {
  const [values, setValues] = useState<AdminFoodFormValues>(() => ({
    foodName: food?.foodName ?? "",
    category: food?.category ?? "",
    servingSize: food?.servingSize ?? 100,
    servingUnit: food?.servingUnit ?? "g",
    calories: food?.calories ?? 0,
    proteinG: food?.proteinG ?? 0,
    totalCarbohydratesG: food?.totalCarbohydratesG ?? 0,
    totalFatG: food?.totalFatG ?? 0,
    fiberG: food?.fiberG ?? 0,
    sodiumMg: food?.sodiumMg ?? 0,
    saturatedFatG: food?.saturatedFatG ?? 0,
    cholesterolMg: food?.cholesterolMg ?? 0,
    sugarsG: food?.sugarsG ?? 0,
    potassiumMg: food?.potassiumMg ?? 0,
    calciumMg: food?.calciumMg ?? 0,
    ironMg: food?.ironMg ?? 0,
    magnesiumMg: food?.magnesiumMg ?? 0,
    phosphorusMg: food?.phosphorusMg ?? 0,
    zincMg: food?.zincMg ?? 0,
    vitaminAUg: food?.vitaminAUg ?? 0,
    vitaminCMg: food?.vitaminCMg ?? 0,
    vitaminDUg: food?.vitaminDUg ?? 0,
    vitaminEMg: food?.vitaminEMg ?? 0,
    vitaminKUg: food?.vitaminKUg ?? 0,
    vitaminB6Mg: food?.vitaminB6Mg ?? 0,
    vitaminB12Ug: food?.vitaminB12Ug ?? 0,
    folateDfeUg: food?.folateDfeUg ?? 0,
    isVerified: food?.isVerified ?? true,
  }));

  const errors = useMemo(() => validate(values), [values]);
  const isInvalid = Object.keys(errors).length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isInvalid) {
      return;
    }

    await onSubmit({
      ...values,
      category: values.category?.trim() || undefined,
      foodName: values.foodName.trim(),
      servingUnit: values.servingUnit.trim(),
      fiberG: values.fiberG ?? 0,
      sodiumMg: values.sodiumMg ?? 0,
      saturatedFatG: values.saturatedFatG ?? 0,
      cholesterolMg: values.cholesterolMg ?? 0,
      sugarsG: values.sugarsG ?? 0,
      potassiumMg: values.potassiumMg ?? 0,
      calciumMg: values.calciumMg ?? 0,
      ironMg: values.ironMg ?? 0,
      magnesiumMg: values.magnesiumMg ?? 0,
      phosphorusMg: values.phosphorusMg ?? 0,
      zincMg: values.zincMg ?? 0,
      vitaminAUg: values.vitaminAUg ?? 0,
      vitaminCMg: values.vitaminCMg ?? 0,
      vitaminDUg: values.vitaminDUg ?? 0,
      vitaminEMg: values.vitaminEMg ?? 0,
      vitaminKUg: values.vitaminKUg ?? 0,
      vitaminB6Mg: values.vitaminB6Mg ?? 0,
      vitaminB12Ug: values.vitaminB12Ug ?? 0,
      folateDfeUg: values.folateDfeUg ?? 0,
    });
  }

  function updateField<TKey extends keyof AdminFoodFormValues>(
    key: TKey,
    value: AdminFoodFormValues[TKey],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="food-modal" role="dialog" aria-modal="true" aria-labelledby="food-modal-title">
        <div className="modal-header">
          <div>
            <p className="section-kicker">{food ? "Edit" : "Create"}</p>
            <h2 id="food-modal-title">{food ? "Edit food" : "Add food"}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">x</button>
        </div>

        <form className="food-form" onSubmit={handleSubmit}>
          <TextField label="Food name *" value={values.foodName} error={errors.foodName} onChange={(value) => updateField("foodName", value)} />
          <TextField
            label="Category"
            value={values.category ?? ""}
            onChange={(value) => updateField("category", value || undefined)}
          />
          <div className="form-grid">
            <NumberField label="Serving size *" value={values.servingSize} error={errors.servingSize} onChange={(value) => updateField("servingSize", value)} />
            <TextField label="Serving unit *" value={values.servingUnit} error={errors.servingUnit} onChange={(value) => updateField("servingUnit", value)} />
            <NumberField label="Calories *" value={values.calories} error={errors.calories} onChange={(value) => updateField("calories", value)} />
            <NumberField label="Protein (g) *" value={values.proteinG} error={errors.proteinG} onChange={(value) => updateField("proteinG", value)} />
            <NumberField label="Carbohydrates (g) *" value={values.totalCarbohydratesG} error={errors.totalCarbohydratesG} onChange={(value) => updateField("totalCarbohydratesG", value)} />
            <NumberField label="Fat (g) *" value={values.totalFatG} error={errors.totalFatG} onChange={(value) => updateField("totalFatG", value)} />
            <NumberField label="Fiber (g)" value={values.fiberG ?? 0} error={errors.fiberG} onChange={(value) => updateField("fiberG", value)} />
            <NumberField label="Sodium (mg)" value={values.sodiumMg ?? 0} error={errors.sodiumMg} onChange={(value) => updateField("sodiumMg", value)} />
          </div>

          <div className="form-section-heading">
            <h3>Additional nutrients</h3>
          </div>
          <div className="form-grid">
            <NumberField label="Saturated fat (g)" value={values.saturatedFatG ?? 0} error={errors.saturatedFatG} onChange={(value) => updateField("saturatedFatG", value)} />
            <NumberField label="Cholesterol (mg)" value={values.cholesterolMg ?? 0} error={errors.cholesterolMg} onChange={(value) => updateField("cholesterolMg", value)} />
            <NumberField label="Sugars (g)" value={values.sugarsG ?? 0} error={errors.sugarsG} onChange={(value) => updateField("sugarsG", value)} />
            <NumberField label="Potassium (mg)" value={values.potassiumMg ?? 0} error={errors.potassiumMg} onChange={(value) => updateField("potassiumMg", value)} />
            <NumberField label="Calcium (mg)" value={values.calciumMg ?? 0} error={errors.calciumMg} onChange={(value) => updateField("calciumMg", value)} />
            <NumberField label="Iron (mg)" value={values.ironMg ?? 0} error={errors.ironMg} onChange={(value) => updateField("ironMg", value)} />
            <NumberField label="Magnesium (mg)" value={values.magnesiumMg ?? 0} error={errors.magnesiumMg} onChange={(value) => updateField("magnesiumMg", value)} />
            <NumberField label="Phosphorus (mg)" value={values.phosphorusMg ?? 0} error={errors.phosphorusMg} onChange={(value) => updateField("phosphorusMg", value)} />
            <NumberField label="Zinc (mg)" value={values.zincMg ?? 0} error={errors.zincMg} onChange={(value) => updateField("zincMg", value)} />
            <NumberField label="Vitamin A (ug)" value={values.vitaminAUg ?? 0} error={errors.vitaminAUg} onChange={(value) => updateField("vitaminAUg", value)} />
            <NumberField label="Vitamin C (mg)" value={values.vitaminCMg ?? 0} error={errors.vitaminCMg} onChange={(value) => updateField("vitaminCMg", value)} />
            <NumberField label="Vitamin D (ug)" value={values.vitaminDUg ?? 0} error={errors.vitaminDUg} onChange={(value) => updateField("vitaminDUg", value)} />
            <NumberField label="Vitamin E (mg)" value={values.vitaminEMg ?? 0} error={errors.vitaminEMg} onChange={(value) => updateField("vitaminEMg", value)} />
            <NumberField label="Vitamin K (ug)" value={values.vitaminKUg ?? 0} error={errors.vitaminKUg} onChange={(value) => updateField("vitaminKUg", value)} />
            <NumberField label="Vitamin B6 (mg)" value={values.vitaminB6Mg ?? 0} error={errors.vitaminB6Mg} onChange={(value) => updateField("vitaminB6Mg", value)} />
            <NumberField label="Vitamin B12 (ug)" value={values.vitaminB12Ug ?? 0} error={errors.vitaminB12Ug} onChange={(value) => updateField("vitaminB12Ug", value)} />
            <NumberField label="Folate DFE (ug)" value={values.folateDfeUg ?? 0} error={errors.folateDfeUg} onChange={(value) => updateField("folateDfeUg", value)} />
          </div>

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
              {isSubmitting ? "Saving..." : "Save food"}
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

function NumberField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: number;
  error?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step="0.1"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function validate(values: AdminFoodFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.foodName.trim()) errors.foodName = "Food name is required";
  if (!values.servingUnit.trim()) errors.servingUnit = "Serving unit is required";
  if (values.servingSize <= 0) errors.servingSize = "Serving size must be greater than 0";

  numberFields.forEach((field) => {
    const value = values[field];
    if (value !== undefined && Number(value) < 0) {
      errors[field] = "Value cannot be negative";
    }
  });

  return errors;
}

