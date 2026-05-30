import { adminRequest } from "../../../shared/api/httpClient";
import {
  AdminUserDetailResponse,
  AdminUserListQuery,
  AdminUserListResponse,
  AdminUserStatusResponse,
} from "../types/adminUser.types";

export const adminUsersApi = {
  list(query: AdminUserListQuery) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    return adminRequest<AdminUserListResponse>(`/admin/users${queryString ? `?${queryString}` : ""}`);
  },

  detail(id: number) {
    return adminRequest<AdminUserDetailResponse>(`/admin/users/${id}`);
  },

  updateStatus(id: number, isActive: boolean) {
    return adminRequest<AdminUserStatusResponse>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },
};
