import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { adminExercisesApi } from "../api/adminExercisesApi";
import { AdminExercise, AdminExerciseFormValues, AdminExerciseListQuery } from "../types/adminExercise.types";

const DEFAULT_QUERY: Required<Pick<AdminExerciseListQuery, "page" | "limit" | "sortBy" | "sortOrder">> = {
  page: 1,
  limit: 20,
  sortBy: "name",
  sortOrder: "asc",
};

export type ExerciseModalState =
  | { mode: "create"; exercise: null }
  | { mode: "edit"; exercise: AdminExercise };

export function useAdminExercises() {
  const [exercises, setExercises] = useState<AdminExercise[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [query, setQuery] = useState<AdminExerciseListQuery>(DEFAULT_QUERY);
  const [debouncedQuery, setDebouncedQuery] = useState({ ...DEFAULT_QUERY });
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [modal, setModal] = useState<ExerciseModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminExercise | null>(null);

  const effectiveQuery = useMemo(() => ({ ...DEFAULT_QUERY, ...query }), [query]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(effectiveQuery);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [effectiveQuery]);

  const loadExercises = useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);

    try {
      const response = await adminExercisesApi.list(debouncedQuery);
      setExercises(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setExercises([]);
      setErrorCode(error instanceof AdminApiError ? error.code : "UNKNOWN_ERROR");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    void loadExercises();
  }, [loadExercises]);

  const updateQuery = useCallback((patch: AdminExerciseListQuery, resetPage = true) => {
    setQuery((current) => ({
      ...current,
      ...patch,
      page: resetPage ? 1 : patch.page ?? current.page,
    }));
  }, []);

  const saveExercise = useCallback(async (values: AdminExerciseFormValues) => {
    setIsMutating(true);
    try {
      if (modal?.mode === "edit") {
        await adminExercisesApi.update(modal.exercise.id, values);
      } else {
        await adminExercisesApi.create(values);
      }
      setModal(null);
      await loadExercises();
      return modal?.mode === "edit" ? "Exercise updated successfully" : "Exercise created successfully";
    } finally {
      setIsMutating(false);
    }
  }, [loadExercises, modal]);

  const deleteExercise = useCallback(async () => {
    if (!deleteTarget) {
      return null;
    }

    setIsMutating(true);
    try {
      await adminExercisesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      if (exercises.length === 1 && pagination.page > 1) {
        setQuery((current) => ({ ...current, page: pagination.page - 1 }));
      } else {
        await loadExercises();
      }
      return "Exercise deleted successfully";
    } finally {
      setIsMutating(false);
    }
  }, [deleteTarget, exercises.length, loadExercises, pagination.page]);

  const toggleVerify = useCallback(async (exercise: AdminExercise) => {
    setIsMutating(true);
    try {
      await adminExercisesApi.verify(exercise.id, !exercise.isVerified);
      await loadExercises();
      return "Exercise verification status updated successfully";
    } finally {
      setIsMutating(false);
    }
  }, [loadExercises]);

  return {
    exercises,
    pagination,
    query: effectiveQuery,
    errorCode,
    isLoading,
    isMutating,
    modal,
    deleteTarget,
    setModal,
    setDeleteTarget,
    updateQuery,
    retry: loadExercises,
    saveExercise,
    toggleVerify,
    deleteExercise,
  };
}
