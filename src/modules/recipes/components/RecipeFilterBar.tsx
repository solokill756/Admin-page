import { AdminRecipeListQuery } from "../types/adminRecipe.types";

type RecipeFilterBarProps = {
  query: AdminRecipeListQuery;
  onChange: (patch: AdminRecipeListQuery) => void;
};

export function RecipeFilterBar({ query, onChange }: RecipeFilterBarProps) {
  return (
    <div className="recipe-filter-bar">
      <label>
        <span>Search</span>
        <input
          value={query.keyword ?? ""}
          onChange={(event) => onChange({ keyword: event.target.value || undefined })}
          placeholder="Recipe title or metadata"
        />
      </label>

      <label>
        <span>User ID</span>
        <input
          type="number"
          min="1"
          value={query.userId ?? ""}
          onChange={(event) => onChange({ userId: event.target.value ? Number(event.target.value) : undefined })}
          placeholder="All users"
        />
      </label>

      <label>
        <span>Source</span>
        <input
          value={query.sourceType ?? ""}
          onChange={(event) => onChange({ sourceType: event.target.value || undefined })}
          placeholder="admin, fridge_ai_daily_plan"
        />
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
          value={`${query.sortBy ?? "createdAt"}:${query.sortOrder ?? "desc"}`}
          onChange={(event) => {
            const [sortBy, sortOrder] = event.target.value.split(":") as [
              AdminRecipeListQuery["sortBy"],
              AdminRecipeListQuery["sortOrder"],
            ];
            onChange({ sortBy, sortOrder });
          }}
        >
          <option value="createdAt:desc">Newest</option>
          <option value="updatedAt:desc">Recently updated</option>
          <option value="title:asc">Title A-Z</option>
          <option value="userId:asc">User low-high</option>
          <option value="servings:desc">Servings high-low</option>
        </select>
      </label>
    </div>
  );
}
