export type AdminUserStatusLabel = "active" | "blocked" | "other";

export type AdminUser = {
  id: number;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  status: number;
  statusLabel: AdminUserStatusLabel;
  isActive: boolean;
  isProfileComplete: boolean;
  age: number | null;
  sex: string | null;
  weight: number | null;
  goalWeight: number | null;
  height: number | null;
  dietType: string | null;
  allergies: string[];
  fitnessLevel: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserListQuery = {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: string;
  status?: "active" | "blocked";
  sortBy?: "createdAt" | "displayName" | "email" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
};

export type AdminUserListResponse = {
  success: true;
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminUserDetailResponse = {
  success: true;
  data: AdminUser;
};

export type AdminUserStatusResponse = {
  success: true;
  message: string;
  data: {
    id: number;
    status: number;
    isActive: boolean;
  };
};
