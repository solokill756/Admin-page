import { AdminApiError } from "../../../shared/api/httpClient";
import { useToast } from "../../../shared/components/ToastProvider";
import { UserDetailModal } from "../components/UserDetailModal";
import { UserFilterBar } from "../components/UserFilterBar";
import { UserTable } from "../components/UserTable";
import { useAdminUsers } from "../hooks/useAdminUsers";

const ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: "User not found",
  CANNOT_BLOCK_SELF: "You cannot block your own admin account",
  VALIDATION_ERROR: "Please check your input",
  UNAUTHORIZED: "Your admin session has expired",
  ADMIN_ONLY: "Admin permission required",
  ACCOUNT_BLOCKED: "Account is blocked",
  NETWORK_ERROR: "Unable to connect to server",
  UNKNOWN_ERROR: "Something went wrong. Please try again",
};

export function AdminUsersPage() {
  const { showToast } = useToast();
  const usersState = useAdminUsers();

  async function handleView(user: Parameters<typeof usersState.openDetail>[0]) {
    try {
      await usersState.openDetail(user);
    } catch (error) {
      showToast(messageForError(error, "Unable to load user"), "error");
    }
  }

  async function handleToggleStatus(user: Parameters<typeof usersState.toggleStatus>[0]) {
    try {
      const message = await usersState.toggleStatus(user);
      showToast(message, "success");
    } catch (error) {
      showToast(messageForError(error, "Unable to update user"), "error");
    }
  }

  return (
    <section className="foods-page">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Accounts</p>
          <h2>User Management</h2>
          <span>Review registered users and block or unblock access when needed.</span>
        </div>
      </div>

      <UserFilterBar query={usersState.query} onChange={usersState.updateQuery} />

      {usersState.isLoading ? <p className="state-copy">Loading users...</p> : null}

      {!usersState.isLoading && usersState.errorCode ? (
        <div className="dashboard-error" role="alert">
          <strong>Failed to load users.</strong>
          <p>{ERROR_MESSAGES[usersState.errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR}</p>
          <button className="secondary-button" type="button" onClick={() => void usersState.retry()}>
            Retry
          </button>
        </div>
      ) : null}

      {!usersState.isLoading && !usersState.errorCode && usersState.users.length === 0 ? (
        <p className="state-copy">No users found.</p>
      ) : null}

      {!usersState.isLoading && !usersState.errorCode && usersState.users.length > 0 ? (
        <>
          <UserTable
            users={usersState.users}
            isMutating={usersState.isMutating}
            onView={(user) => void handleView(user)}
            onToggleStatus={(user) => void handleToggleStatus(user)}
          />
          <div className="pagination-bar">
            <span>
              Page {usersState.pagination.page} of {Math.max(usersState.pagination.totalPages, 1)} - {usersState.pagination.total} users
            </span>
            <div>
              <button
                className="secondary-button"
                type="button"
                disabled={usersState.pagination.page <= 1}
                onClick={() => usersState.updateQuery({ page: usersState.pagination.page - 1 }, false)}
              >
                Previous
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={usersState.pagination.page >= usersState.pagination.totalPages}
                onClick={() => usersState.updateQuery({ page: usersState.pagination.page + 1 }, false)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}

      {usersState.detail ? (
        <UserDetailModal user={usersState.detail} onClose={() => usersState.setDetail(null)} />
      ) : null}
    </section>
  );
}

function messageForError(error: unknown, fallback: string): string {
  if (error instanceof AdminApiError) {
    return ERROR_MESSAGES[error.code] ?? fallback;
  }
  return fallback;
}
