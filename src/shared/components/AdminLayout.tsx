import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useAdminAuth } from "../../modules/auth/hooks/useAdminAuth";

export function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      <Sidebar onLogout={handleLogout} />
      <div className="admin-main">
        <Header />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
