import { adminRequest } from "../../../shared/api/httpClient";
import {
  AdminExerciseDeleteResponse,
  AdminExerciseDetailResponse,
  AdminExerciseFormValues,
  AdminExerciseListQuery,
  AdminExerciseListResponse,
  AdminExerciseVerifyResponse,
  AdminExerciseWriteResponse,
} from "../types/adminExercise.types";

export const adminExercisesApi = {
  list(query: AdminExerciseListQuery) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    return adminRequest<AdminExerciseListResponse>(`/admin/exercises${queryString ? `?${queryString}` : ""}`);
  },

  detail(id: number) {
    return adminRequest<AdminExerciseDetailResponse>(`/admin/exercises/${id}`);
  },

  create(payload: AdminExerciseFormValues) {
    return adminRequest<AdminExerciseWriteResponse>("/admin/exercises", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: Partial<AdminExerciseFormValues>) {
    return adminRequest<AdminExerciseWriteResponse>(`/admin/exercises/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  delete(id: number) {
    return adminRequest<AdminExerciseDeleteResponse>(`/admin/exercises/${id}`, {
      method: "DELETE",
    });
  },

  verify(id: number, isVerified: boolean) {
    return adminRequest<AdminExerciseVerifyResponse>(`/admin/exercises/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified }),
    });
  },
};
