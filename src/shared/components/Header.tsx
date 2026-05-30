import { useAdminAuth } from "../../modules/auth/hooks/useAdminAuth";

export function Header() {
  const { admin } = useAdminAuth();
  const initials = admin?.displayName?.slice(0, 1).toUpperCase() || "A";

  return (
    <header className="admin-header">
      <div>
        <p className="section-kicker">Admin</p>
        <h1>Dashboard</h1>
      </div>
      <div className="admin-identity">
        <span className="avatar">{initials}</span>
        <div>
          <strong>{admin?.displayName || "Admin"}</strong>
          <span>{admin?.email}</span>
        </div>
      </div>
    </header>
  );
}
