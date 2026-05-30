import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { adminFoodsApi } from "../api/adminFoodsApi";
import { AdminFood, AdminFoodFormValues, AdminFoodListQuery, AdminCategory } from "../types/adminFood.types";

export const STATIC_CATEGORIES: AdminCategory[] = [
  { id: "fruit", name: "Fruit" },
  { id: "vegetable", name: "Vegetable" },
  { id: "meat", name: "Meat" },
  { id: "dairy", name: "Dairy" },
  { id: "seafood", name: "Seafood" },
  { id: "grain", name: "Grain" },
  { id: "nut", name: "Nut" },
  { id: "beverage", name: "Beverage" },
  { id: "egg", name: "Egg" },
  { id: "fat_oil", name: "Fat & Oil" },
  { id: "other", name: "Other" }
];

const DEFAULT_QUERY: Required<Pick<AdminFoodListQuery, "page" | "limit" | "sortBy" | "sortOrder">> = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export type FoodModalState =
  | { mode: "create"; food: null }
  | { mode: "edit"; food: AdminFood };

export function useAdminFoods() {
  const [foods, setFoods] = useState<AdminFood[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [query, setQuery] = useState<AdminFoodListQuery>(DEFAULT_QUERY);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [modal, setModal] = useState<FoodModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminFood | null>(null);

  const categories = STATIC_CATEGORIES;
  const isLoadingCategories = false;
  const categoryErrorCode = null;

  const effectiveQuery = useMemo(() => ({ ...DEFAULT_QUERY, ...query }), [query]);
  const [debouncedQuery, setDebouncedQuery] = useState(effectiveQuery);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(effectiveQuery);
    }, 350);

    return () => window.clearTimeout(handle);
  }, [effectiveQuery]);

  const loadFoods = useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);

    try {
      const response = await adminFoodsApi.list(debouncedQuery);
      setFoods(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setFoods([]);
      setErrorCode(error instanceof AdminApiError ? error.code : "UNKNOWN_ERROR");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    void loadFoods();
  }, [loadFoods]);

  const updateQuery = useCallback((patch: AdminFoodListQuery, resetPage = true) => {
    setQuery((current) => ({
      ...current,
      ...patch,
      page: resetPage ? 1 : patch.page ?? current.page,
    }));
  }, []);

  const saveFood = useCallback(async (values: AdminFoodFormValues) => {
    setIsMutating(true);
    try {
      if (modal?.mode === "edit") {
        await adminFoodsApi.update(modal.food.id, values);
      } else {
        await adminFoodsApi.create(values);
      }
      setModal(null);
      await loadFoods();
      return modal?.mode === "edit" ? "Food updated successfully" : "Food created successfully";
    } finally {
      setIsMutating(false);
    }
  }, [loadFoods, modal]);

  const toggleVerify = useCallback(async (food: AdminFood) => {
    setIsMutating(true);
    try {
      await adminFoodsApi.verify(food.id, !food.isVerified);
      await loadFoods();
      return "Food verification status updated successfully";
    } finally {
      setIsMutating(false);
    }
  }, [loadFoods]);

  const deleteFood = useCallback(async () => {
    if (!deleteTarget) {
      return null;
    }

    setIsMutating(true);
    try {
      await adminFoodsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      if (foods.length === 1 && pagination.page > 1) {
        setQuery((current) => ({ ...current, page: pagination.page - 1 }));
      } else {
        await loadFoods();
      }
      return "Food deleted successfully";
    } finally {
      setIsMutating(false);
    }
  }, [deleteTarget, foods.length, loadFoods, pagination.page]);

  return {
    foods,
    categories,
    pagination,
    query: effectiveQuery,
    errorCode,
    categoryErrorCode,
    isLoading,
    isLoadingCategories,
    isMutating,
    modal,
    deleteTarget,
    setModal,
    setDeleteTarget,
    updateQuery,
    retry: loadFoods,
    retryCategories: () => {},
    saveFood,
    toggleVerify,
    deleteFood,
  };
}
