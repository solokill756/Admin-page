export type ExerciseType = "cardio" | "strength";

export type AdminExercise = {
  id: number;
  name: string;
  type: ExerciseType;
  met: number | null;
  defaultCalPerMin: number | null;
  notes: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type AdminExerciseListQuery = {
  page?: number;
  limit?: number;
  keyword?: string;
  type?: ExerciseType;
  isVerified?: boolean;
  sortBy?: "name" | "type" | "met" | "defaultCalPerMin" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type AdminExerciseFormValues = {
  name: string;
  type: ExerciseType;
  met?: number | null;
  defaultCalPerMin?: number | null;
  notes?: string | null;
  isVerified?: boolean;
};

export type AdminExerciseListResponse = {
  success: true;
  data: AdminExercise[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminExerciseDetailResponse = {
  success: true;
  data: AdminExercise;
};

export type AdminExerciseWriteResponse = {
  success: true;
  message: string;
  data: {
    id: number;
    name: string;
  };
};

export type AdminExerciseDeleteResponse = {
  success: true;
  message: string;
};

export type AdminExerciseVerifyResponse = {
  success: true;
  message: string;
  data: {
    id: number;
    isVerified: boolean;
  };
};
