import { adminRequest } from "../../../shared/api/httpClient";
import {
  AdminRecipeDeleteResponse,
  AdminRecipeDetailResponse,
  AdminRecipeFormValues,
  AdminRecipeListQuery,
  AdminRecipeListResponse,
  AdminRecipeVerifyResponse,
  AdminRecipeWriteResponse,
} from "../types/adminRecipe.types";

export const adminRecipesApi = {
  list(query: AdminRecipeListQuery) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    return adminRequest<AdminRecipeListResponse>(`/admin/recipes${queryString ? `?${queryString}` : ""}`);
  },

  detail(id: number) {
    return adminRequest<AdminRecipeDetailResponse>(`/admin/recipes/${id}`);
  },

  create(payload: AdminRecipeFormValues) {
    return adminRequest<AdminRecipeWriteResponse>("/admin/recipes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: AdminRecipeFormValues) {
    return adminRequest<AdminRecipeWriteResponse>(`/admin/recipes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  delete(id: number) {
    return adminRequest<AdminRecipeDeleteResponse>(`/admin/recipes/${id}`, {
      method: "DELETE",
    });
  },

  verify(id: number, isVerified: boolean) {
    return adminRequest<AdminRecipeVerifyResponse>(`/admin/recipes/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified }),
    });
  },
};
