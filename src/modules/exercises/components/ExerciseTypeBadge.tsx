import { ExerciseType } from "../types/adminExercise.types";

type ExerciseTypeBadgeProps = {
  type: ExerciseType;
};

export function ExerciseTypeBadge({ type }: ExerciseTypeBadgeProps) {
  return (
    <span className={`exercise-type-badge exercise-type-${type}`}>
      {type === "cardio" ? "Cardio" : "Strength"}
    </span>
  );
}
