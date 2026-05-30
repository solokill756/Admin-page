import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { adminUsersApi } from "../api/adminUsersApi";
import { AdminUser, AdminUserListQuery } from "../types/adminUser.types";

const DEFAULT_QUERY: Required<Pick<AdminUserListQuery, "page" | "limit" | "sortBy" | "sortOrder">> = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [query, setQuery] = useState<AdminUserListQuery>(DEFAULT_QUERY);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [detail, setDetail] = useState<AdminUser | null>(null);

  const effectiveQuery = useMemo(() => ({ ...DEFAULT_QUERY, ...query }), [query]);
  const [debouncedQuery, setDebouncedQuery] = useState(effectiveQuery);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(effectiveQuery);
    }, 350);

    return () => window.clearTimeout(handle);
  }, [effectiveQuery]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);

    try {
      const response = await adminUsersApi.list(debouncedQuery);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setUsers([]);
      setErrorCode(error instanceof AdminApiError ? error.code : "UNKNOWN_ERROR");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const updateQuery = useCallback((patch: AdminUserListQuery, resetPage = true) => {
    setQuery((current) => ({
      ...current,
      ...patch,
      page: resetPage ? 1 : patch.page ?? current.page,
    }));
  }, []);

  const openDetail = useCallback(async (user: AdminUser) => {
    setIsMutating(true);
    try {
      const response = await adminUsersApi.detail(user.id);
      setDetail(response.data);
    } finally {
      setIsMutating(false);
    }
  }, []);

  const toggleStatus = useCallback(async (user: AdminUser) => {
    setIsMutating(true);
    try {
      await adminUsersApi.updateStatus(user.id, !user.isActive);
      await loadUsers();
      return user.isActive ? "User blocked successfully" : "User unblocked successfully";
    } finally {
      setIsMutating(false);
    }
  }, [loadUsers]);

  return {
    users,
    pagination,
    query: effectiveQuery,
    errorCode,
    isLoading,
    isMutating,
    detail,
    setDetail,
    updateQuery,
    retry: loadUsers,
    openDetail,
    toggleStatus,
  };
}
