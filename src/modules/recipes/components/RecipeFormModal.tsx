import { FormEvent, useEffect, useMemo, useState } from "react";
import { adminFoodsApi } from "../../foods/api/adminFoodsApi";
import { AdminFood } from "../../foods/types/adminFood.types";
import { AdminRecipeDetail, AdminRecipeFormValues, RecipeDifficulty } from "../types/adminRecipe.types";

type RecipeFormModalProps = {
  recipe: AdminRecipeDetail | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: AdminRecipeFormValues) => Promise<void>;
};

type IngredientDraft = AdminRecipeFormValues["ingredients"][number];
type StepDraft = AdminRecipeFormValues["steps"][number];
type FormErrors = Partial<Record<keyof AdminRecipeFormValues, string>>;

export function RecipeFormModal({ recipe, isSubmitting, onClose, onSubmit }: RecipeFormModalProps) {
  const [tagText, setTagText] = useState(() => recipe?.tags.join(", ") ?? "");
  const [values, setValues] = useState<AdminRecipeFormValues>(() => ({
    userId: recipe?.userId ?? 1,
    title: recipe?.title ?? "",
    description: recipe?.description ?? "",
    imageUrl: recipe?.imageUrl ?? "",
    shareWith: recipe?.shareWith ?? 1,
    servings: recipe?.servings ?? 1,
    prepMinutes: recipe?.prepMinutes ?? 0,
    cookMinutes: recipe?.cookMinutes ?? 0,
    difficulty: recipe?.difficulty ?? "easy",
    sourceType: recipe?.sourceType ?? "admin",
    isVerified: recipe?.isVerified ?? true,
    tags: recipe?.tags ?? [],
    ingredients: recipe?.ingredients.length
      ? recipe.ingredients.map((item) => ({
          foodId: item.foodId,
          quantity: item.quantity,
        }))
      : [emptyIngredient()],
    steps: recipe?.steps.length
      ? recipe.steps.map((step) => ({
          order: step.order,
          instruction: step.instruction,
          duration: step.duration,
          tips: step.tips,
        }))
      : [emptyStep()],
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
      title: values.title.trim(),
      description: values.description?.trim() || null,
      imageUrl: values.imageUrl?.trim() || null,
      sourceType: values.sourceType?.trim() || "admin",
      isVerified: values.isVerified ?? true,
      tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean),
      ingredients: values.ingredients.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
      })),
      steps: values.steps.map((step, index) => ({
        ...step,
        order: index + 1,
        instruction: step.instruction.trim(),
        tips: step.tips?.trim() || null,
      })),
    });
  }

  function updateField<TKey extends keyof AdminRecipeFormValues>(
    key: TKey,
    value: AdminRecipeFormValues[TKey],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateIngredient(index: number, patch: Partial<IngredientDraft>) {
    setValues((current) => ({
      ...current,
      ingredients: current.ingredients.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function updateStep(index: number, patch: Partial<StepDraft>) {
    setValues((current) => ({
      ...current,
      steps: current.steps.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="food-modal recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title">
        <div className="modal-header">
          <div>
            <p className="section-kicker">{recipe ? "Edit" : "Create"}</p>
            <h2 id="recipe-modal-title">{recipe ? "Edit recipe" : "Add recipe"}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">x</button>
        </div>

        <form className="food-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <NumberField label="User ID *" value={values.userId} error={errors.userId} min={1} onChange={(value) => updateField("userId", value)} />
            <NumberField label="Servings *" value={values.servings} error={errors.servings} min={1} onChange={(value) => updateField("servings", value)} />
          </div>
          <TextField label="Recipe title *" value={values.title} error={errors.title} onChange={(value) => updateField("title", value)} />
          <label className="form-field">
            <span>Description</span>
            <textarea className="form-textarea" value={values.description ?? ""} onChange={(event) => updateField("description", event.target.value)} />
          </label>
          <TextField label="Image URL" value={values.imageUrl ?? ""} error={errors.imageUrl} onChange={(value) => updateField("imageUrl", value)} />
          <div className="form-grid">
            <NumberField label="Prep minutes" value={values.prepMinutes} min={0} onChange={(value) => updateField("prepMinutes", value)} />
            <NumberField label="Cook minutes" value={values.cookMinutes} min={0} onChange={(value) => updateField("cookMinutes", value)} />
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Difficulty</span>
              <select value={values.difficulty} onChange={(event) => updateField("difficulty", event.target.value as RecipeDifficulty)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <TextField label="Source type" value={values.sourceType ?? ""} onChange={(value) => updateField("sourceType", value)} />
          </div>
          <TextField label="Tags" value={tagText} onChange={setTagText} />
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={values.isVerified ?? false}
              onChange={(event) => updateField("isVerified", event.target.checked)}
            />
            <span>Verified</span>
          </label>

          <div className="form-section-heading">
            <h3>Ingredients</h3>
          </div>
          {errors.ingredients ? <p className="form-error">{errors.ingredients}</p> : null}
          {values.ingredients.map((ingredient, index) => (
            <div className="nested-form-row" key={`ingredient-${index}`}>
              <IngredientFoodPicker
                ingredient={ingredient}
                fallback={recipe?.ingredients[index]}
                onChange={(patch) => updateIngredient(index, patch)}
              />
              <div className="form-grid">
                <NumberField label="Quantity *" value={ingredient.quantity} min={0} onChange={(value) => updateIngredient(index, { quantity: value })} />
              </div>
              <div className="table-actions">
                <button type="button" onClick={() => updateField("ingredients", values.ingredients.filter((_, itemIndex) => itemIndex !== index))}>
                  Remove ingredient
                </button>
              </div>
            </div>
          ))}
          <button className="secondary-button" type="button" onClick={() => updateField("ingredients", [...values.ingredients, emptyIngredient()])}>
            Add ingredient
          </button>

          <div className="form-section-heading">
            <h3>Steps</h3>
          </div>
          {errors.steps ? <p className="form-error">{errors.steps}</p> : null}
          {values.steps.map((step, index) => (
            <div className="nested-form-row" key={`step-${index}`}>
              <label className="form-field">
                <span>Step {index + 1} instruction *</span>
                <textarea className="form-textarea" value={step.instruction} onChange={(event) => updateStep(index, { instruction: event.target.value })} />
              </label>
              <div className="form-grid">
                <NumberField label="Duration minutes" value={step.duration ?? 0} min={0} onChange={(value) => updateStep(index, { duration: value })} />
                <TextField label="Tips" value={step.tips ?? ""} onChange={(value) => updateStep(index, { tips: value })} />
              </div>
              <div className="table-actions">
                <button type="button" onClick={() => updateField("steps", values.steps.filter((_, itemIndex) => itemIndex !== index))}>
                  Remove step
                </button>
              </div>
            </div>
          ))}
          <button className="secondary-button" type="button" onClick={() => updateField("steps", [...values.steps, emptyStep(values.steps.length + 1)])}>
            Add step
          </button>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={isInvalid || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save recipe"}
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
  min,
  onChange,
}: {
  label: string;
  value: number;
  error?: string;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        step="0.01"
        value={value || ""}
        onChange={(event) => onChange(event.target.value === "" ? 0 : Number(event.target.value))}
      />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function emptyIngredient(): IngredientDraft {
  return {
    foodId: null,
    quantity: 1,
  };
}

function emptyStep(order = 1): StepDraft {
  return {
    order,
    instruction: "",
    duration: 0,
    tips: "",
  };
}

function validate(values: AdminRecipeFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.userId || values.userId < 1) errors.userId = "User ID is required";
  if (!values.title.trim()) errors.title = "Recipe title is required";
  if (!values.servings || values.servings < 1) errors.servings = "Servings must be at least 1";
  if (values.imageUrl && !/^https?:\/\//.test(values.imageUrl)) {
    errors.imageUrl = "Image URL must start with http:// or https://";
  }
  if (!values.ingredients.length || values.ingredients.some((item) => !item.foodId || item.quantity <= 0)) {
    errors.ingredients = "Each recipe ingredient must select a food and quantity";
  }
  if (!values.steps.length || values.steps.some((step) => !step.instruction.trim())) {
    errors.steps = "Each recipe needs at least one instruction";
  }
  return errors;
}

function IngredientFoodPicker({
  ingredient,
  fallback,
  onChange,
}: {
  ingredient: IngredientDraft;
  fallback?: AdminRecipeDetail["ingredients"][number];
  onChange: (patch: Partial<IngredientDraft>) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [foodOptions, setFoodOptions] = useState<AdminFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<AdminFood | null>(null);
  const [isLoadingFoods, setIsLoadingFoods] = useState(true);
  const [foodError, setFoodError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const handle = window.setTimeout(() => {
      setIsLoadingFoods(true);
      setFoodError(null);

      adminFoodsApi.list({
        page: 1,
        limit: 50,
        keyword: keyword.trim() || undefined,
        sortBy: "foodName",
        sortOrder: "asc",
      }).then((response) => {
        if (!isMounted) return;
        setFoodOptions(response.data);
        const selected = response.data.find((food) => food.id === ingredient.foodId);
        if (selected) {
          setSelectedFood(selected);
        }
      }).catch(() => {
        if (!isMounted) return;
        setFoodError("Unable to load foods");
        setFoodOptions([]);
      }).finally(() => {
        if (!isMounted) return;
        setIsLoadingFoods(false);
      });
    }, 300);

    return () => {
      isMounted = false;
      window.clearTimeout(handle);
    };
  }, [ingredient.foodId, keyword]);

  const options = useMemo(() => {
    if (!selectedFood || foodOptions.some((food) => food.id === selectedFood.id)) {
      return foodOptions;
    }
    return [selectedFood, ...foodOptions];
  }, [foodOptions, selectedFood]);

  function handleFoodChange(foodId: number | null) {
    const food = options.find((item) => item.id === foodId) ?? null;
    setSelectedFood(food);
    onChange({ foodId });
  }

  return (
    <div className="ingredient-picker">
      <TextField label="Search food" value={keyword} onChange={setKeyword} />
      <label className="form-field">
        <span>Food *</span>
        <select
          value={ingredient.foodId ?? ""}
          disabled={isLoadingFoods}
          onChange={(event) => handleFoodChange(event.target.value ? Number(event.target.value) : null)}
        >
          <option value="">Select food</option>
          {fallback && fallback.foodId === ingredient.foodId && !options.some((food) => food.id === fallback.foodId) ? (
            <option value={fallback.foodId ?? ""}>{fallback.name}</option>
          ) : null}
          {options.map((food) => (
            <option key={food.id} value={food.id}>
              {food.foodName} - {food.servingSize} {food.servingUnit}
            </option>
          ))}
        </select>
        {foodError ? <small>{foodError}</small> : null}
      </label>
      {isLoadingFoods ? <p className="state-copy">Loading food matches...</p> : null}
      <IngredientFoodSummary
        food={selectedFood ?? options.find((food) => food.id === ingredient.foodId)}
        fallback={fallback?.foodId === ingredient.foodId ? fallback : undefined}
        quantity={ingredient.quantity}
      />
    </div>
  );
}

function IngredientFoodSummary({
  food,
  fallback,
  quantity,
}: {
  food?: AdminFood;
  fallback?: AdminRecipeDetail["ingredients"][number];
  quantity: number;
}) {
  if (!food) {
    if (fallback) {
      return (
        <div className="ingredient-summary">
          <span>{quantity || 0} x {fallback.unit}</span>
          <span>{formatMacro(fallback.calories * quantity)} kcal</span>
          <span>P {formatMacro(fallback.protein * quantity)}g</span>
          <span>C {formatMacro(fallback.carbs * quantity)}g</span>
          <span>F {formatMacro(fallback.fat * quantity)}g</span>
        </div>
      );
    }
    return <p className="state-copy">Choose a food to fill ingredient nutrition from the food catalog.</p>;
  }

  return (
    <div className="ingredient-summary">
      <span>{quantity || 0} x {food.servingSize} {food.servingUnit}</span>
      <span>{formatMacro(food.calories * quantity)} kcal</span>
      <span>P {formatMacro(food.proteinG * quantity)}g</span>
      <span>C {formatMacro(food.totalCarbohydratesG * quantity)}g</span>
      <span>F {formatMacro(food.totalFatG * quantity)}g</span>
    </div>
  );
}

function formatMacro(value: number): string {
  return Number.isFinite(value)
    ? value.toLocaleString("en-US", { maximumFractionDigits: 1 })
    : "0";
}
