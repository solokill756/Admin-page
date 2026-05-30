export type AdminFood = {
  id: number;
  foodName: string;
  servingUnit: string;
  category: string | null;
  servingSize: number;
  calories: number;
  proteinG: number;
  totalCarbohydratesG: number;
  totalFatG: number;
  fiberG: number;
  sodiumMg: number;
  saturatedFatG: number | null;
  cholesterolMg: number | null;
  sugarsG: number | null;
  potassiumMg: number | null;
  calciumMg: number | null;
  ironMg: number | null;
  magnesiumMg: number | null;
  phosphorusMg: number | null;
  zincMg: number | null;
  vitaminAUg: number | null;
  vitaminCMg: number | null;
  vitaminDUg: number | null;
  vitaminEMg: number | null;
  vitaminKUg: number | null;
  vitaminB6Mg: number | null;
  vitaminB12Ug: number | null;
  folateDfeUg: number | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminFoodDetail = AdminFood & {
  userId: number | null;
};

export type AdminFoodListQuery = {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: string;
  isVerified?: boolean;
  sortBy?: "createdAt" | "foodName" | "calories" | "proteinG";
  sortOrder?: "asc" | "desc";
};

export type AdminFoodFormValues = {
  foodName: string;
  servingUnit: string;
  category?: string;
  servingSize: number;
  calories: number;
  proteinG: number;
  totalCarbohydratesG: number;
  totalFatG: number;
  fiberG?: number;
  sodiumMg?: number;
  saturatedFatG?: number;
  cholesterolMg?: number;
  sugarsG?: number;
  potassiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
  magnesiumMg?: number;
  phosphorusMg?: number;
  zincMg?: number;
  vitaminAUg?: number;
  vitaminCMg?: number;
  vitaminDUg?: number;
  vitaminEMg?: number;
  vitaminKUg?: number;
  vitaminB6Mg?: number;
  vitaminB12Ug?: number;
  folateDfeUg?: number;
  isVerified?: boolean;
};

export type AdminFoodListResponse = {
  success: true;
  data: AdminFood[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminFoodDetailResponse = {
  success: true;
  data: AdminFoodDetail;
};

export type AdminFoodWriteResponse = {
  success: true;
  message: string;
  data: {
    id: number;
    foodName: string;
  };
};

export type AdminFoodDeleteResponse = {
  success: true;
  message: string;
};

export type AdminFoodVerifyResponse = {
  success: true;
  message: string;
  data: {
    id: number;
    isVerified: boolean;
  };
};

export type AdminCategory = { id: string | number; name: string; createdAt?: string };
