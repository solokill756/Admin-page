import { AdminUser } from "../types/adminUser.types";

type UserTableProps = {
  users: AdminUser[];
  isMutating: boolean;
  onView: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
};

export function UserTable({ users, isMutating, onView, onToggleStatus }: UserTableProps) {
  return (
    <div className="table-wrap">
      <table className="user-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Profile</th>
            <th>Fitness</th>
            <th>Last Login</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="food-name-cell">
                <div>{user.displayName || "-"}</div>
                <span className="muted-cell">{user.email || "No email"}</span>
              </td>
              <td>{user.role}</td>
              <td>
                <span className={`verify-badge ${user.isActive ? "verify-badge-on" : "verify-badge-off"}`}>
                  {user.isActive ? "Active" : "Blocked"}
                </span>
              </td>
              <td>{user.isProfileComplete ? "Complete" : "Incomplete"}</td>
              <td>{user.fitnessLevel || "-"}</td>
              <td>{user.lastLoginAt ? formatDate(user.lastLoginAt) : "-"}</td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <div className="table-actions">
                  <button type="button" disabled={isMutating} onClick={() => onView(user)}>View</button>
                  <button type="button" disabled={isMutating} onClick={() => onToggleStatus(user)}>
                    {user.isActive ? "Block" : "Unblock"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}
