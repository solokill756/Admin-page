import { AdminApiError } from "../../../shared/api/httpClient";
import { useToast } from "../../../shared/components/ToastProvider";
import { ExerciseFilterBar } from "../components/ExerciseFilterBar";
import { ExerciseFormModal } from "../components/ExerciseFormModal";
import { ExerciseTable } from "../components/ExerciseTable";
import { useAdminExercises } from "../hooks/useAdminExercises";
import { AdminExerciseFormValues } from "../types/adminExercise.types";

const ERROR_MESSAGES: Record<string, string> = {
  EXERCISE_NOT_FOUND: "Khong tim thay bai tap",
  EXERCISE_NAME_ALREADY_EXISTS: "Ten bai tap da ton tai",
  VALIDATION_ERROR: "Du lieu nhap khong hop le",
  UNAUTHORIZED: "Phien dang nhap da het han",
  ADMIN_ONLY: "Ban khong co quyen admin",
  ACCOUNT_BLOCKED: "Tai khoan da bi chan",
  NETWORK_ERROR: "Khong the ket noi server",
  UNKNOWN_ERROR: "Co loi xay ra, vui long thu lai",
};

export function AdminExercisesPage() {
  const { showToast } = useToast();
  const exercisesState = useAdminExercises();

  async function handleSave(values: AdminExerciseFormValues) {
    try {
      const message = await exercisesState.saveExercise(values);
      showToast(message, "success");
    } catch (error) {
      showToast(messageForError(error, "Unable to save exercise"), "error");
    }
  }

  async function handleDeleteConfirm() {
    try {
      const message = await exercisesState.deleteExercise();
      if (message) showToast(message, "success");
    } catch (error) {
      showToast(messageForError(error, "Unable to delete exercise"), "error");
    }
  }

  async function handleTableVerify(exercise: Parameters<typeof exercisesState.toggleVerify>[0]) {
    try {
      const message = await exercisesState.toggleVerify(exercise);
      showToast(message, "success");
    } catch (error) {
      showToast(messageForError(error, "Unable to save exercise"), "error");
    }
  }

  return (
    <section className="foods-page">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Activity</p>
          <h2>Exercise Management</h2>
          <span>Manage template exercises used for activity logs and calories burned estimates.</span>
        </div>
        <button className="primary-button page-action" type="button" onClick={() => exercisesState.setModal({ mode: "create", exercise: null })}>
          Add Exercise
        </button>
      </div>

      <ExerciseFilterBar query={exercisesState.query} onChange={exercisesState.updateQuery} />

      {exercisesState.isLoading ? <p className="state-copy">Loading exercises...</p> : null}

      {!exercisesState.isLoading && exercisesState.errorCode ? (
        <div className="dashboard-error" role="alert">
          <strong>Failed to load exercises.</strong>
          <p>{ERROR_MESSAGES[exercisesState.errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR}</p>
          <button className="secondary-button" type="button" onClick={() => void exercisesState.retry()}>
            Retry
          </button>
        </div>
      ) : null}

      {!exercisesState.isLoading && !exercisesState.errorCode && exercisesState.exercises.length === 0 ? (
        <p className="state-copy">No exercises found.</p>
      ) : null}

      {!exercisesState.isLoading && !exercisesState.errorCode && exercisesState.exercises.length > 0 ? (
        <>
          <ExerciseTable
            exercises={exercisesState.exercises}
            isMutating={exercisesState.isMutating}
            onEdit={(exercise) => exercisesState.setModal({ mode: "edit", exercise })}
            onVerify={(exercise) => void handleTableVerify(exercise)}
            onDelete={exercisesState.setDeleteTarget}
          />
          <div className="pagination-bar">
            <span>
              Page {exercisesState.pagination.page} of {Math.max(exercisesState.pagination.totalPages, 1)} - {exercisesState.pagination.total} exercises
            </span>
            <div>
              <button
                className="secondary-button"
                type="button"
                disabled={exercisesState.pagination.page <= 1}
                onClick={() => exercisesState.updateQuery({ page: exercisesState.pagination.page - 1 }, false)}
              >
                Previous
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={exercisesState.pagination.page >= exercisesState.pagination.totalPages}
                onClick={() => exercisesState.updateQuery({ page: exercisesState.pagination.page + 1 }, false)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}

      {exercisesState.modal ? (
        <ExerciseFormModal
          exercise={exercisesState.modal.exercise}
          isSubmitting={exercisesState.isMutating}
          onClose={() => exercisesState.setModal(null)}
          onSubmit={handleSave}
        />
      ) : null}

      {exercisesState.deleteTarget ? (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-exercise-title">
            <h2 id="delete-exercise-title">Are you sure you want to delete this exercise?</h2>
            <p>Existing user exercise logs will not be deleted.</p>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => exercisesState.setDeleteTarget(null)}>Cancel</button>
              <button className="danger-button" type="button" disabled={exercisesState.isMutating} onClick={() => void handleDeleteConfirm()}>
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
