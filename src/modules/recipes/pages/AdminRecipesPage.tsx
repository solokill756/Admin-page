import { AdminApiError } from "../../../shared/api/httpClient";
import { useToast } from "../../../shared/components/ToastProvider";
import { RecipeFilterBar } from "../components/RecipeFilterBar";
import { RecipeFormModal } from "../components/RecipeFormModal";
import { RecipeTable } from "../components/RecipeTable";
import { useAdminRecipes } from "../hooks/useAdminRecipes";
import { AdminRecipeFormValues } from "../types/adminRecipe.types";

const ERROR_MESSAGES: Record<string, string> = {
  RECIPE_NOT_FOUND: "Recipe not found",
  RECIPE_TITLE_ALREADY_EXISTS: "Recipe title already exists for this user",
  VALIDATION_ERROR: "Please check the recipe fields",
  UNAUTHORIZED: "Your admin session has expired",
  ADMIN_ONLY: "Admin permission required",
  NETWORK_ERROR: "Unable to connect to server",
  UNKNOWN_ERROR: "Something went wrong. Please try again",
};

export function AdminRecipesPage() {
  const { showToast } = useToast();
  const recipesState = useAdminRecipes();

  async function handleSave(values: AdminRecipeFormValues) {
    try {
      const message = await recipesState.saveRecipe(values);
      showToast(message, "success");
    } catch (error) {
      showToast(messageForError(error, "Unable to save recipe"), "error");
    }
  }

  async function handleEdit(recipe: Parameters<typeof recipesState.openEdit>[0]) {
    try {
      await recipesState.openEdit(recipe);
    } catch (error) {
      showToast(messageForError(error, "Unable to load recipe"), "error");
    }
  }

  async function handleDeleteConfirm() {
    try {
      const message = await recipesState.deleteRecipe();
      if (message) showToast(message, "success");
    } catch (error) {
      showToast(messageForError(error, "Unable to delete recipe"), "error");
    }
  }

  async function handleTableVerify(recipe: Parameters<typeof recipesState.toggleVerify>[0]) {
    try {
      const message = await recipesState.toggleVerify(recipe);
      showToast(message, "success");
    } catch (error) {
      showToast(messageForError(error, "Unable to save recipe"), "error");
    }
  }

  return (
    <section className="foods-page">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Content</p>
          <h2>Recipe Management</h2>
          <span>Manage user and admin-created recipes, ingredients, and cooking steps.</span>
        </div>
        <button className="primary-button page-action" type="button" onClick={recipesState.openCreate}>
          Add Recipe
        </button>
      </div>

      <RecipeFilterBar query={recipesState.query} onChange={recipesState.updateQuery} />

      {recipesState.isLoading ? <p className="state-copy">Loading recipes...</p> : null}

      {!recipesState.isLoading && recipesState.errorCode ? (
        <div className="dashboard-error" role="alert">
          <strong>Failed to load recipes.</strong>
          <p>{ERROR_MESSAGES[recipesState.errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR}</p>
          <button className="secondary-button" type="button" onClick={() => void recipesState.retry()}>
            Retry
          </button>
        </div>
      ) : null}

      {!recipesState.isLoading && !recipesState.errorCode && recipesState.recipes.length === 0 ? (
        <p className="state-copy">No recipes found.</p>
      ) : null}

      {!recipesState.isLoading && !recipesState.errorCode && recipesState.recipes.length > 0 ? (
        <>
          <RecipeTable
            recipes={recipesState.recipes}
            isMutating={recipesState.isMutating}
            onEdit={(recipe) => void handleEdit(recipe)}
            onVerify={(recipe) => void handleTableVerify(recipe)}
            onDelete={recipesState.setDeleteTarget}
          />
          <div className="pagination-bar">
            <span>
              Page {recipesState.pagination.page} of {Math.max(recipesState.pagination.totalPages, 1)} - {recipesState.pagination.total} recipes
            </span>
            <div>
              <button
                className="secondary-button"
                type="button"
                disabled={recipesState.pagination.page <= 1}
                onClick={() => recipesState.updateQuery({ page: recipesState.pagination.page - 1 }, false)}
              >
                Previous
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={recipesState.pagination.page >= recipesState.pagination.totalPages}
                onClick={() => recipesState.updateQuery({ page: recipesState.pagination.page + 1 }, false)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}

      {recipesState.modal ? (
        <RecipeFormModal
          recipe={recipesState.modal.recipe}
          isSubmitting={recipesState.isMutating}
          onClose={() => recipesState.setModal(null)}
          onSubmit={handleSave}
        />
      ) : null}

      {recipesState.deleteTarget ? (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-recipe-title">
            <h2 id="delete-recipe-title">Are you sure you want to delete this recipe?</h2>
            <p>This hides the recipe from admin and user recipe lists without deleting existing food logs.</p>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => recipesState.setDeleteTarget(null)}>Cancel</button>
              <button className="danger-button" type="button" disabled={recipesState.isMutating} onClick={() => void handleDeleteConfirm()}>
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function messageForError(error: unknown, fallback: string): string {
  if (error instanceof AdminApiError) {
    return ERROR_MESSAGES[error.code] ?? fallback;
  }
  return fallback;
}
