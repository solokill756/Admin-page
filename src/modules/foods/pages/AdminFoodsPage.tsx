import { useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { useToast } from "../../../shared/components/ToastProvider";
import { FoodFilterBar } from "../components/FoodFilterBar";
import { FoodFormModal } from "../components/FoodFormModal";
import { FoodImportModal } from "../components/FoodImportModal";
import { FoodTable } from "../components/FoodTable";
import { useAdminFoods } from "../hooks/useAdminFoods";
import { AdminFoodFormValues } from "../types/adminFood.types";

const ERROR_MESSAGES: Record<string, string> = {
  FOOD_NOT_FOUND: "Food not found",
  FOOD_NAME_ALREADY_EXISTS: "Food name already exists",
  VALIDATION_ERROR: "Invalid data entered",
  UNAUTHORIZED: "Session expired",
  ADMIN_ONLY: "You do not have admin privileges",
  ACCOUNT_BLOCKED: "Account has been blocked",
  NETWORK_ERROR: "Unable to connect to server",
  UNKNOWN_ERROR: "An error occurred, please try again",
};

export function AdminFoodsPage() {
  const { showToast } = useToast();
  const foodsState = useAdminFoods();
  const [isImportOpen, setIsImportOpen] = useState(false);

  async function handleSave(values: AdminFoodFormValues) {
    try {
      const message = await foodsState.saveFood(values);
      showToast(message, "success");
    } catch (error) {
      showToast(messageForError(error, "Unable to save food"), "error");
    }
  }

  async function handleTableVerify(food: Parameters<typeof foodsState.toggleVerify>[0]) {
    try {
      const message = await foodsState.toggleVerify(food);
      showToast(message, "success");
    } catch (error) {
      showToast(messageForError(error, "Unable to save food"), "error");
    }
  }

  async function handleDeleteConfirm() {
    try {
      const message = await foodsState.deleteFood();
      if (message) showToast(message, "success");
    } catch (error) {
      showToast(messageForError(error, "Unable to delete food"), "error");
    }
  }

  return (
    <section className="foods-page">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Catalog</p>
          <h2>Food Management</h2>
          <span>Manage foods used for meal logging, nutrition totals, and recipe suggestions.</span>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: "8px" }}>
          <button className="secondary-button page-action" type="button" onClick={() => setIsImportOpen(true)}>
            Import CSV
          </button>
          <button className="primary-button page-action" type="button" onClick={() => foodsState.setModal({ mode: "create", food: null })}>
            Add Food
          </button>
        </div>
      </div>

      <FoodFilterBar
        query={foodsState.query}
        categories={foodsState.categories}
        isLoadingCategories={foodsState.isLoadingCategories}
        onChange={foodsState.updateQuery}
      />

      {foodsState.isLoading ? <p className="state-copy">Loading foods...</p> : null}

      {!foodsState.isLoading && foodsState.errorCode ? (
        <div className="dashboard-error" role="alert">
          <strong>Failed to load foods.</strong>
          <p>{ERROR_MESSAGES[foodsState.errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR}</p>
          <button className="secondary-button" type="button" onClick={() => void foodsState.retry()}>
            Retry
          </button>
        </div>
      ) : null}

      {!foodsState.isLoading && !foodsState.errorCode && foodsState.foods.length === 0 ? (
        <p className="state-copy">No foods found.</p>
      ) : null}

      {!foodsState.isLoading && !foodsState.errorCode && foodsState.foods.length > 0 ? (
        <>
          <FoodTable
            foods={foodsState.foods}
            isMutating={foodsState.isMutating}
            onEdit={(food) => foodsState.setModal({ mode: "edit", food })}
            onVerify={(food) => void handleTableVerify(food)}
            onDelete={foodsState.setDeleteTarget}
          />
          <div className="pagination-bar">
            <span>
              Page {foodsState.pagination.page} of {Math.max(foodsState.pagination.totalPages, 1)} · {foodsState.pagination.total} foods
            </span>
            <div>
              <button
                className="secondary-button"
                type="button"
                disabled={foodsState.pagination.page <= 1}
                onClick={() => foodsState.updateQuery({ page: foodsState.pagination.page - 1 }, false)}
              >
                Previous
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={foodsState.pagination.page >= foodsState.pagination.totalPages}
                onClick={() => foodsState.updateQuery({ page: foodsState.pagination.page + 1 }, false)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}

      {foodsState.modal ? (
        <FoodFormModal
          food={foodsState.modal.food}
          isSubmitting={foodsState.isMutating}
          onClose={() => foodsState.setModal(null)}
          onSubmit={handleSave}
        />
      ) : null}

      {isImportOpen ? (
        <FoodImportModal
          onClose={() => setIsImportOpen(false)}
          onSuccess={(msg) => showToast(msg, "success")}
          onRefresh={() => foodsState.retry()}
        />
      ) : null}

      {foodsState.deleteTarget ? (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-food-title">
            <h2 id="delete-food-title">Are you sure you want to delete this food?</h2>
            <p>This action will hide the food from admin lists but will not remove existing user logs.</p>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => foodsState.setDeleteTarget(null)}>Cancel</button>
              <button className="danger-button" type="button" disabled={foodsState.isMutating} onClick={() => void handleDeleteConfirm()}>
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
