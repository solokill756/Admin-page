export type AdminDashboardOverview = {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalFoods: number;
  verifiedFoods: number;
  unverifiedFoods: number;
  totalExercises: number;
  totalWorkoutRoutines: number;
  totalRecipes: number;
};

export type AdminDashboardOverviewResponse = {
  success: true;
  data: AdminDashboardOverview;
};
