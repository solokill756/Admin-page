import { AdminUserListQuery } from "../types/adminUser.types";

type UserFilterBarProps = {
  query: AdminUserListQuery;
  onChange: (patch: AdminUserListQuery) => void;
};

export function UserFilterBar({ query, onChange }: UserFilterBarProps) {
  return (
    <div className="user-filter-bar">
      <label>
        <span>Search</span>
        <input
          value={query.keyword ?? ""}
          onChange={(event) => onChange({ keyword: event.target.value || undefined })}
          placeholder="Email or display name"
        />
      </label>

      <label>
        <span>Role</span>
        <select
          value={query.role ?? ""}
          onChange={(event) => onChange({ role: event.target.value || undefined })}
        >
          <option value="">All</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <label>
        <span>Status</span>
        <select
          value={query.status ?? ""}
          onChange={(event) => onChange({ status: event.target.value ? event.target.value as AdminUserListQuery["status"] : undefined })}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </label>

      <label>
        <span>Sort</span>
        <select
          value={`${query.sortBy ?? "createdAt"}:${query.sortOrder ?? "desc"}`}
          onChange={(event) => {
            const [sortBy, sortOrder] = event.target.value.split(":") as [
              AdminUserListQuery["sortBy"],
              AdminUserListQuery["sortOrder"],
            ];
            onChange({ sortBy, sortOrder });
          }}
        >
          <option value="createdAt:desc">Newest</option>
          <option value="displayName:asc">Name A-Z</option>
          <option value="email:asc">Email A-Z</option>
          <option value="lastLoginAt:desc">Recent login</option>
        </select>
      </label>
    </div>
  );
}
