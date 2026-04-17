import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { AppState, Task, Goal, Skill } from "@/lib/types";
import { loadState, saveState } from "@/lib/storage";

interface Ctx {
  state: AppState;
  addTask: (t: Omit<Task, "id" | "createdAt" | "status"> & { status?: Task["status"] }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addGoal: (g: Omit<Goal, "id" | "milestones" | "startDate"> & { milestones?: Goal["milestones"] }) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoal: (id: string) => void;
  skills: Skill[];
  todayISO: string;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => saveState(state), [state]);

  const update = (fn: (s: AppState) => AppState) => setState((s) => fn(s));

  const addTask: Ctx["addTask"] = (t) =>
    update((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        {
          ...t,
          id: crypto.randomUUID(),
          status: t.status ?? "Pending",
          createdAt: new Date().toISOString(),
        } as Task,
      ],
    }));

  const updateTask: Ctx["updateTask"] = (id, patch) =>
    update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  const deleteTask: Ctx["deleteTask"] = (id) =>
    update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));

  const toggleTask: Ctx["toggleTask"] = (id) =>
    update((s) => {
      const tasks = s.tasks.map((t) => {
        if (t.id !== id) return t;
        const next = t.status === "Completed" ? "Pending" : "Completed";
        return { ...t, status: next as Task["status"], completedAt: next === "Completed" ? new Date().toISOString() : undefined };
      });
      // Update streak
      const now = new Date();
      const todayStr = now.toDateString();
      const last = s.streak.lastCompletedDate ? new Date(s.streak.lastCompletedDate).toDateString() : null;
      let streak = s.streak;
      const justCompleted = tasks.find((t) => t.id === id)?.status === "Completed";
      if (justCompleted && last !== todayStr) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const continued = last === yesterday.toDateString();
        streak = {
          count: continued ? s.streak.count + 1 : 1,
          lastCompletedDate: now.toISOString(),
        };
      }
      return { ...s, tasks, streak };
    });

  const addGoal: Ctx["addGoal"] = (g) => {
    const weeks = Math.max(1, Math.ceil(g.durationDays / 7));
    const milestones =
      g.milestones && g.milestones.length
        ? g.milestones
        : Array.from({ length: weeks }, (_, i) => ({
            id: crypto.randomUUID(),
            title: `Week ${i + 1} milestone`,
            week: i + 1,
            completed: false,
          }));
    update((s) => ({
      ...s,
      goals: [
        ...s.goals,
        { ...g, id: crypto.randomUUID(), startDate: new Date().toISOString(), milestones },
      ],
    }));
  };

  const toggleMilestone: Ctx["toggleMilestone"] = (goalId, milestoneId) =>
    update((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id !== goalId
          ? g
          : { ...g, milestones: g.milestones.map((m) => (m.id === milestoneId ? { ...m, completed: !m.completed } : m)) }
      ),
    }));

  const deleteGoal: Ctx["deleteGoal"] = (id) =>
    update((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));

  // Derive skills from skill-learning tasks
  const skills: Skill[] = useMemo(() => {
    const map = new Map<string, Skill>();
    for (const t of state.tasks) {
      if (!t.skill) continue;
      const cur =
        map.get(t.skill) ?? { name: t.skill, totalTasks: 0, completedTasks: 0, lastUpdated: t.createdAt };
      cur.totalTasks += 1;
      if (t.status === "Completed") {
        cur.completedTasks += 1;
        if (t.completedAt && t.completedAt > cur.lastUpdated) cur.lastUpdated = t.completedAt;
      }
      map.set(t.skill, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.completedTasks - a.completedTasks);
  }, [state.tasks]);

  const value: Ctx = {
    state,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addGoal,
    toggleMilestone,
    deleteGoal,
    skills,
    todayISO: new Date().toISOString(),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
