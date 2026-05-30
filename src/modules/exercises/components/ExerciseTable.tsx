import { AdminExercise } from "../types/adminExercise.types";
import { ExerciseTypeBadge } from "./ExerciseTypeBadge";

type ExerciseTableProps = {
  exercises: AdminExercise[];
  isMutating: boolean;
  onEdit: (exercise: AdminExercise) => void;
  onVerify: (exercise: AdminExercise) => void;
  onDelete: (exercise: AdminExercise) => void;
};

export function ExerciseTable({ exercises, isMutating, onEdit, onVerify, onDelete }: ExerciseTableProps) {
  return (
    <div className="table-wrap">
      <table className="exercise-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>MET</th>
            <th>Calories / Min</th>
            <th>Verified</th>
            <th>Notes</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise) => (
            <tr key={exercise.id}>
              <td className="food-name-cell">{exercise.name}</td>
              <td><ExerciseTypeBadge type={exercise.type} /></td>
              <td>{formatNumber(exercise.met)}</td>
              <td>{formatNumber(exercise.defaultCalPerMin)}</td>
              <td>
                <span className={`verify-badge ${exercise.isVerified ? "verify-badge-on" : "verify-badge-off"}`}>
                  {exercise.isVerified ? "Verified" : "Unverified"}
                </span>
              </td>
              <td className="exercise-notes-cell">{exercise.notes || "-"}</td>
              <td>{exercise.updatedAt ? formatDate(exercise.updatedAt) : "-"}</td>
              <td>
                <div className="table-actions">
                  <button type="button" onClick={() => onEdit(exercise)} disabled={isMutating}>Edit</button>
                  <button type="button" onClick={() => onVerify(exercise)} disabled={isMutating}>
                    {exercise.isVerified ? "Unverify" : "Verify"}
                  </button>
                  <button type="button" onClick={() => onDelete(exercise)} disabled={isMutating}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatNumber(value: number | null): string {
  return value === null ? "-" : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}
