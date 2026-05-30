import { AdminFood } from "../types/adminFood.types";
import { FoodVerifyBadge } from "./FoodVerifyBadge";

type FoodTableProps = {
  foods: AdminFood[];
  isMutating: boolean;
  onEdit: (food: AdminFood) => void;
  onVerify: (food: AdminFood) => void;
  onDelete: (food: AdminFood) => void;
};

export function FoodTable({ foods, isMutating, onEdit, onVerify, onDelete }: FoodTableProps) {
  return (
    <div className="table-wrap">
      <table className="food-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Serving</th>
            <th>Calories</th>
            <th>Protein</th>
            <th>Carbs</th>
            <th>Fat</th>
            <th>Sodium</th>
            <th>Verified</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food.id}>
              <td className="food-name-cell">{food.foodName}</td>
              <td>{food.category || "-"}</td>
              <td>{food.servingSize} {food.servingUnit}</td>
              <td>{formatNumber(food.calories)}</td>
              <td>{formatNumber(food.proteinG)}g</td>
              <td>{formatNumber(food.totalCarbohydratesG)}g</td>
              <td>{formatNumber(food.totalFatG)}g</td>
              <td>{formatNumber(food.sodiumMg)}mg</td>
              <td><FoodVerifyBadge isVerified={food.isVerified} /></td>
              <td>{formatDate(food.updatedAt)}</td>
              <td>
                <div className="table-actions">
                  <button type="button" onClick={() => onEdit(food)} disabled={isMutating}>View/Edit</button>
                  <button type="button" onClick={() => onVerify(food)} disabled={isMutating}>
                    {food.isVerified ? "Unverify" : "Verify"}
                  </button>
                  <button type="button" onClick={() => onDelete(food)} disabled={isMutating}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}
