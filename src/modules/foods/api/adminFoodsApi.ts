import { adminRequest } from "../../../shared/api/httpClient";
import {
  AdminFoodDeleteResponse,
  AdminFoodDetailResponse,
  AdminFoodFormValues,
  AdminFoodListQuery,
  AdminFoodListResponse,
  AdminFoodVerifyResponse,
  AdminFoodWriteResponse,
} from "../types/adminFood.types";

export const adminFoodsApi = {
  list(query: AdminFoodListQuery) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    return adminRequest<AdminFoodListResponse>(`/admin/foods${queryString ? `?${queryString}` : ""}`);
  },

  detail(id: number) {
    return adminRequest<AdminFoodDetailResponse>(`/admin/foods/${id}`);
  },

  create(payload: AdminFoodFormValues) {
    return adminRequest<AdminFoodWriteResponse>("/admin/foods", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: Partial<AdminFoodFormValues>) {
    return adminRequest<AdminFoodWriteResponse>(`/admin/foods/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  delete(id: number) {
    return adminRequest<AdminFoodDeleteResponse>(`/admin/foods/${id}`, {
      method: "DELETE",
    });
  },

  verify(id: number, isVerified: boolean) {
    return adminRequest<AdminFoodVerifyResponse>(`/admin/foods/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified }),
    });
  },
};
