import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../modules/auth/hooks/useAdminAuth";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isRestoring } = useAdminAuth();

  if (isRestoring) {
    return <div className="route-loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
