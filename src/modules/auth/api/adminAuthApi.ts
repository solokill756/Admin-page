import { adminRequest } from "../../../shared/api/httpClient";
import {
  AdminLoginResponse,
  AdminLogoutResponse,
  AdminProfileResponse,
} from "../types/adminAuth.types";

export const adminAuthApi = {
  login(email: string, password: string) {
    return adminRequest<AdminLoginResponse>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipUnauthorizedRedirect: true,
    });
  },

  me() {
    return adminRequest<AdminProfileResponse>("/admin/auth/me");
  },

  logout() {
    return adminRequest<AdminLogoutResponse>("/admin/auth/logout", {
      method: "POST",
    });
  },
};
