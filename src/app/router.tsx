import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "../shared/components/AdminLayout";
import { ProtectedRoute } from "../shared/components/ProtectedRoute";
import { AdminLoginPage } from "../modules/auth/pages/AdminLoginPage";
import { AdminDashboardPage } from "../modules/dashboard/pages/AdminDashboardPage";
import { AdminExercisesPage } from "../modules/exercises/pages/AdminExercisesPage";
import { AdminFoodsPage } from "../modules/foods/pages/AdminFoodsPage";
import { AdminRecipesPage } from "../modules/recipes/pages/AdminRecipesPage";
import { AdminUsersPage } from "../modules/users/pages/AdminUsersPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="foods" element={<AdminFoodsPage />} />
        <Route path="exercises" element={<AdminExercisesPage />} />
        <Route path="recipes" element={<AdminRecipesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
