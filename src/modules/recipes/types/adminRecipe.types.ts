export type RecipeDifficulty = "easy" | "medium" | "hard";

export type AdminRecipe = {
  id: number;
  userId: number;
  title: string;
  imageUrl: string | null;
  servings: number;
  description: string | null;
  shareWith: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: RecipeDifficulty;
  tags: string[];
  sourceType: string | null;
  dateKey: string | null;
  mealSlot: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminRecipeIngredient = {
  position: number;
  foodId: number | null;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type AdminRecipeStep = {
  order: number;
  instruction: string;
  duration: number | null;
  tips: string | null;
};

export type AdminRecipeDetail = AdminRecipe & {
  ingredients: AdminRecipeIngredient[];
  steps: AdminRecipeStep[];
  sourceMeta: Record<string, unknown>;
};

export type AdminRecipeListQuery = {
  page?: number;
  limit?: number;
  keyword?: string;
  userId?: number;
  sourceType?: string;
  isVerified?: boolean;
  sortBy?: "title" | "userId" | "servings" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type AdminRecipeFormValues = {
  userId: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  shareWith?: number;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: RecipeDifficulty;
  tags?: string[];
  sourceType?: string | null;
  isVerified?: boolean;
  ingredients: Array<{
    foodId: number | null;
    quantity: number;
  }>;
  steps: Array<{
    order: number;
    instruction: string;
    duration?: number | null;
    tips?: string | null;
  }>;
};

export type AdminRecipeListResponse = {
  success: true;
  data: AdminRecipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminRecipeDetailResponse = {
  success: true;
  data: AdminRecipeDetail;
};

export type AdminRecipeWriteResponse = {
  success: true;
  message: string;
  data: {
    id: number;
    title: string;
  };
};

export type AdminRecipeDeleteResponse = {
  success: true;
  message: string;
};

export type AdminRecipeVerifyResponse = {
  success: true;
  message: string;
  data: {
    id: number;
    isVerified: boolean;
  };
};
