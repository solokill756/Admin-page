import { AdminRecipe } from "../types/adminRecipe.types";

type RecipeTableProps = {
  recipes: AdminRecipe[];
  isMutating: boolean;
  onEdit: (recipe: AdminRecipe) => void;
  onVerify: (recipe: AdminRecipe) => void;
  onDelete: (recipe: AdminRecipe) => void;
};

export function RecipeTable({ recipes, isMutating, onEdit, onVerify, onDelete }: RecipeTableProps) {
  return (
    <div className="table-wrap">
      <table className="recipe-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>User</th>
            <th>Servings</th>
            <th>Difficulty</th>
            <th>Time</th>
            <th>Source</th>
            <th>Verified</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => (
            <tr key={recipe.id}>
              <td className="food-name-cell">
                <div>{recipe.title}</div>
                <span className="muted-cell">{recipe.description || "-"}</span>
              </td>
              <td>#{recipe.userId}</td>
              <td>{recipe.servings}</td>
              <td>{recipe.difficulty}</td>
              <td>{recipe.prepMinutes + recipe.cookMinutes} min</td>
              <td>{recipe.sourceType || "-"}</td>
              <td>
                <span className={`verify-badge ${recipe.isVerified ? "verify-badge-on" : "verify-badge-off"}`}>
                  {recipe.isVerified ? "Verified" : "Unverified"}
                </span>
              </td>
              <td>{formatDate(recipe.updatedAt)}</td>
              <td>
                <div className="table-actions">
                  <button type="button" onClick={() => onEdit(recipe)} disabled={isMutating}>Edit</button>
                  <button type="button" onClick={() => onVerify(recipe)} disabled={isMutating}>
                    {recipe.isVerified ? "Unverify" : "Verify"}
                  </button>
                  <button type="button" onClick={() => onDelete(recipe)} disabled={isMutating}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}
