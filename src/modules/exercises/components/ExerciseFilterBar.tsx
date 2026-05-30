import { AdminExerciseListQuery } from "../types/adminExercise.types";

type ExerciseFilterBarProps = {
  query: AdminExerciseListQuery;
  onChange: (patch: AdminExerciseListQuery) => void;
};

export function ExerciseFilterBar({ query, onChange }: ExerciseFilterBarProps) {
  return (
    <div className="exercise-filter-bar">
      <label>
        <span>Search</span>
        <input
          value={query.keyword ?? ""}
          onChange={(event) => onChange({ keyword: event.target.value || undefined })}
          placeholder="Exercise name"
        />
      </label>

      <label>
        <span>Type</span>
        <select
          value={query.type ?? ""}
          onChange={(event) => onChange({ type: event.target.value ? event.target.value as AdminExerciseListQuery["type"] : undefined })}
        >
          <option value="">All</option>
          <option value="cardio">Cardio</option>
          <option value="strength">Strength</option>
        </select>
      </label>

      <label>
        <span>Verified</span>
        <select
          value={query.isVerified === undefined ? "all" : String(query.isVerified)}
          onChange={(event) => {
            const value = event.target.value;
            onChange({ isVerified: value === "all" ? undefined : value === "true" });
          }}
        >
          <option value="all">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </label>

      <label>
        <span>Sort</span>
        <select
          value={`${query.sortBy ?? "name"}:${query.sortOrder ?? "asc"}`}
          onChange={(event) => {
            const [sortBy, sortOrder] = event.target.value.split(":") as [
              AdminExerciseListQuery["sortBy"],
              AdminExerciseListQuery["sortOrder"],
            ];
            onChange({ sortBy, sortOrder });
          }}
        >
          <option value="createdAt:desc">Newest</option>
          <option value="createdAt:asc">Oldest</option>
          <option value="name:asc">Name A-Z</option>
          <option value="met:desc">MET high-low</option>
          <option value="defaultCalPerMin:desc">Calories/min high-low</option>
        </select>
      </label>
    </div>
  );
}
