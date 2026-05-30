import { AdminCategory, AdminFoodListQuery } from "../types/adminFood.types";

type FoodFilterBarProps = {
  query: AdminFoodListQuery;
  categories: AdminCategory[];
  isLoadingCategories: boolean;
  onChange: (patch: AdminFoodListQuery) => void;
};

export function FoodFilterBar({ query, categories, isLoadingCategories, onChange }: FoodFilterBarProps) {
  return (
    <div className="food-filter-bar">
      <label>
        <span>Search</span>
        <input
          value={query.keyword ?? ""}
          onChange={(event) => onChange({ keyword: event.target.value || undefined })}
          placeholder="Food name"
        />
      </label>

      <label>
        <span>Category</span>
        <select
          value={query.category ?? ""}
          onChange={(event) => onChange({ category: event.target.value || undefined })}
          disabled={isLoadingCategories}
        >
          <option value="">{isLoadingCategories ? "Loading..." : "All categories"}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
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
          value={`${query.sortBy ?? "createdAt"}:${query.sortOrder ?? "desc"}`}
          onChange={(event) => {
            const [sortBy, sortOrder] = event.target.value.split(":") as [
              AdminFoodListQuery["sortBy"],
              AdminFoodListQuery["sortOrder"],
            ];
            onChange({ sortBy, sortOrder });
          }}
        >
          <option value="createdAt:desc">Newest</option>
          <option value="createdAt:asc">Oldest</option>
          <option value="foodName:asc">Name A-Z</option>
          <option value="calories:desc">Calories high-low</option>
          <option value="proteinG:desc">Protein high-low</option>
        </select>
      </label>
    </div>
  );
}
