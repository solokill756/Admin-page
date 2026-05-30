import { adminRequest } from "../../../shared/api/httpClient";
import { AdminDashboardOverviewResponse } from "../types/adminDashboard.types";

export const adminDashboardApi = {
  getOverview() {
    return adminRequest<AdminDashboardOverviewResponse>("/admin/dashboard/overview");
  },
};
