import { useCallback, useEffect, useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { adminDashboardApi } from "../api/adminDashboardApi";
import { AdminDashboardOverview } from "../types/adminDashboard.types";

type OverviewState = {
  data: AdminDashboardOverview | null;
  errorCode: string | null;
  isLoading: boolean;
};

export function useAdminDashboardOverview() {
  const [state, setState] = useState<OverviewState>({
    data: null,
    errorCode: null,
    isLoading: true,
  });

  const loadOverview = useCallback(async () => {
    setState((current) => ({
      ...current,
      errorCode: null,
      isLoading: true,
    }));

    try {
      const response = await adminDashboardApi.getOverview();
      setState({
        data: response.data,
        errorCode: null,
        isLoading: false,
      });
    } catch (error) {
      setState({
        data: null,
        errorCode: error instanceof AdminApiError ? error.code : "UNKNOWN_ERROR",
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  return {
    ...state,
    retry: loadOverview,
  };
}
