import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { adminRecipesApi } from "../api/adminRecipesApi";
import { AdminRecipe, AdminRecipeDetail, AdminRecipeFormValues, AdminRecipeListQuery } from "../types/adminRecipe.types";

const DEFAULT_QUERY: Required<Pick<AdminRecipeListQuery, "page" | "limit" | "sortBy" | "sortOrder">> = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export type RecipeModalState =
  | { mode: "create"; recipe: null }
  | { mode: "edit"; recipe: AdminRecipeDetail };

export function useAdminRecipes() {
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [query, setQuery] = useState<AdminRecipeListQuery>(DEFAULT_QUERY);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [modal, setModal] = useState<RecipeModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminRecipe | null>(null);

  const effectiveQuery = useMemo(() => ({ ...DEFAULT_QUERY, ...query }), [query]);
  const [debouncedQuery, setDebouncedQuery] = useState(effectiveQuery);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(effectiveQuery);
    }, 350);

    return () => window.clearTimeout(handle);
  }, [effectiveQuery]);

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);

    try {
      const response = await adminRecipesApi.list(debouncedQuery);
      setRecipes(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setRecipes([]);
      setErrorCode(error instanceof AdminApiError ? error.code : "UNKNOWN_ERROR");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    void loadRecipes();
  }, [loadRecipes]);

  const updateQuery = useCallback((patch: AdminRecipeListQuery, resetPage = true) => {
    setQuery((current) => ({
      ...current,
      ...patch,
      page: resetPage ? 1 : patch.page ?? current.page,
    }));
  }, []);

  const openCreate = useCallback(() => {
    setModal({ mode: "create", recipe: null });
  }, []);

  const openEdit = useCallback(async (recipe: AdminRecipe) => {
    setIsMutating(true);
    try {
      const response = await adminRecipesApi.detail(recipe.id);
      setModal({ mode: "edit", recipe: response.data });
    } finally {
      setIsMutating(false);
    }
  }, []);

  const saveRecipe = useCallback(async (values: AdminRecipeFormValues) => {
    setIsMutating(true);
    try {
      if (modal?.mode === "edit") {
        await adminRecipesApi.update(modal.recipe.id, values);
      } else {
        await adminRecipesApi.create(values);
      }
      setModal(null);
      await loadRecipes();
      return modal?.mode === "edit" ? "Recipe updated successfully" : "Recipe created successfully";
    } finally {
      setIsMutating(false);
    }
  }, [loadRecipes, modal]);

  const deleteRecipe = useCallback(async () => {
    if (!deleteTarget) {
      return null;
    }

    setIsMutating(true);
    try {
      await adminRecipesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      if (recipes.length === 1 && pagination.page > 1) {
        setQuery((current) => ({ ...current, page: pagination.page - 1 }));
      } else {
        await loadRecipes();
      }
      return "Recipe deleted successfully";
    } finally {
      setIsMutating(false);
    }
  }, [deleteTarget, loadRecipes, pagination.page, recipes.length]);

  const toggleVerify = useCallback(async (recipe: AdminRecipe) => {
    setIsMutating(true);
    try {
      await adminRecipesApi.verify(recipe.id, !recipe.isVerified);
      await loadRecipes();
      return "Recipe verification status updated successfully";
    } finally {
      setIsMutating(false);
    }
  }, [loadRecipes]);

  return {
    recipes,
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
    retry: loadRecipes,
    openCreate,
    openEdit,
    saveRecipe,
    deleteRecipe,
    toggleVerify,
  };
}
