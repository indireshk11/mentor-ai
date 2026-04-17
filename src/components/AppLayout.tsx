import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ListTodo, CalendarDays, Calendar, Target, BarChart3, Sparkles, Flame, LogOut } from "lucide-react";
import { useApp } from "@/store/AppStore";
import { useAuth } from "@/store/AuthProvider";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/planner", label: "Weekly Planner", icon: CalendarDays },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/goals", label: "Goal Roadmap", icon: Target },
  { to: "/skills", label: "Skills", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { username, streak } = useApp();
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-sidebar-border bg-sidebar/60 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl gradient-hero flex items-center justify-center shadow-glow animate-pulse-glow">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-gradient-hero leading-none">MENTOR</h1>
            <p className="text-xs text-muted-foreground">Your hero coach</p>
          </div>
        </div>

        <nav className="px-3 pb-4 lg:pb-6 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                    isActive
                      ? "gradient-electric text-primary-foreground shadow-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )
                }
              >
                <Icon className="w-5 h-5" />
                <span>{l.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden lg:block p-4 mt-auto space-y-2">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-secondary" />
              <span className="font-display text-2xl text-gradient-sunset">{streak.count}</span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </div>
            <p className="text-xs text-muted-foreground">Keep the fire burning, {username}!</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <main key={location.pathname} className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-slide-up">
        {children}
      </main>
    </div>
  );
}
