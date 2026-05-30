import {
  Apple,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Soup,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Foods", path: "/admin/foods", icon: Apple },
  { label: "Exercises", path: "/admin/exercises", icon: Dumbbell },
  { label: "Recipes", path: "/admin/recipes", icon: Soup },
  { label: "Users", path: "/admin/users", icon: Users },
];

type SidebarProps = {
  onLogout: () => void;
};

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">N</span>
        <span>Nutrition Admin</span>
      </div>

      <nav className="sidebar-nav" aria-label="Admin navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} title={item.label}>
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button className="sidebar-logout" type="button" onClick={onLogout} title="Logout">
        <LogOut size={18} aria-hidden="true" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
