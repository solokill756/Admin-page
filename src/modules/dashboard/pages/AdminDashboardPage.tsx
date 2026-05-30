import { OverviewStatCard } from "../components/OverviewStatCard";
import { useAdminDashboardOverview } from "../hooks/useAdminDashboardOverview";
import { AdminDashboardOverview } from "../types/adminDashboard.types";

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Session expired",
  ADMIN_ONLY: "You do not have permission to access the admin page",
  NETWORK_ERROR: "Unable to connect to the server",
  UNKNOWN_ERROR: "An error occurred, please try again",
};

const SKELETON_CARDS = Array.from({ length: 9 }, (_, index) => index);

export function AdminDashboardPage() {
  const { data, errorCode, isLoading, retry } = useAdminDashboardOverview();

  if (isLoading) {
    return (
      <section className="dashboard-page">
        <DashboardHeading />
        <p className="state-copy">Loading dashboard overview...</p>
        <div className="metric-grid" aria-hidden="true">
          {SKELETON_CARDS.map((item) => (
            <article className="overview-card skeleton-card" key={item}>
              <span />
              <strong />
              <p />
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (errorCode) {
    return (
      <section className="dashboard-page">
        <DashboardHeading />
        <div className="dashboard-error" role="alert">
          <strong>Failed to load dashboard overview.</strong>
          <p>{ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR}</p>
          <button className="secondary-button" type="button" onClick={() => void retry()}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="dashboard-page">
        <DashboardHeading />
        <p className="state-copy">No overview data available.</p>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <DashboardHeading />
      <div className="metric-grid" aria-label="Dashboard overview statistics">
        {buildCards(data).map((card) => (
          <OverviewStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            description={card.description}
          />
        ))}
      </div>
    </section>
  );
}

function DashboardHeading() {
  return (
    <div className="dashboard-title">
      <p className="section-kicker">Overview</p>
      <h2>Dashboard Overview</h2>
      <span>Quick system totals for users, nutrition data, exercises, and recipes.</span>
    </div>
  );
}

function buildCards(data: AdminDashboardOverview) {
  return [
    {
      label: "Total Users",
      value: data.totalUsers,
      description: "All registered users",
    },
    {
      label: "Active Users",
      value: data.activeUsers,
      description: "Users with active accounts",
    },
    {
      label: "Blocked Users",
      value: data.blockedUsers,
      description: "Users currently blocked",
    },
    {
      label: "Total Foods",
      value: data.totalFoods,
      description: "Foods in the catalog",
    },
    {
      label: "Verified Foods",
      value: data.verifiedFoods,
      description: "Foods approved for use",
    },
    {
      label: "Unverified Foods",
      value: data.unverifiedFoods,
      description: "Foods pending verification",
    },
    {
      label: "Categories",
      value: data.totalCategories,
      description: "Food and content categories",
    },
    {
      label: "Exercises",
      value: data.totalExercises,
      description: "Exercise definitions",
    },
    {
      label: "Recipes",
      value: data.totalRecipes,
      description: "Saved recipe records",
    },
  ];
}
