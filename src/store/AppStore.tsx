import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { Task, Goal, Skill, Milestone } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  streak_count: number;
  streak_last_date: string | null;
}

interface Ctx {
  tasks: Task[];
  goals: Goal[];
  profile: Profile | null;
  username: string;
  streak: { count: number; lastDate: string | null };
  loading: boolean;
  addTask: (t: Omit<Task, "id" | "createdAt" | "status"> & { status?: Task["status"] }) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  addGoal: (g: Omit<Goal, "id" | "milestones" | "startDate"> & { milestones?: Milestone[] }) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  skills: Skill[];
}

const AppContext = createContext<Ctx | null>(null);

// DB row → Task
const rowToTask = (r: any): Task => ({
  id: r.id,
  title: r.title,
  description: r.description ?? undefined,
  category: r.category,
  priority: r.priority,
  status: r.status,
  dueDate: r.due_date,
  skill: r.skill ?? undefined,
  createdAt: r.created_at,
  completedAt: r.completed_at ?? undefined,
});

const rowToGoal = (g: any, milestones: any[]): Goal => ({
  id: g.id,
  title: g.title,
  description: g.description ?? undefined,
  durationDays: g.duration_days,
  startDate: g.start_date,
  skill: g.skill ?? undefined,
  milestones: milestones
    .filter((m) => m.goal_id === g.id)
    .sort((a, b) => a.week - b.week)
    .map((m) => ({ id: m.id, title: m.title, week: m.week, completed: m.completed })),
});

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [tasksRes, goalsRes, milestonesRes, profileRes] = await Promise.all([
      supabase.from("tasks").select("*").order("due_date", { ascending: true }),
      supabase.from("goals").select("*").order("created_at", { ascending: true }),
      supabase.from("milestones").select("*"),
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    if (tasksRes.data) setTasks(tasksRes.data.map(rowToTask));
    if (goalsRes.data && milestonesRes.data) {
      setGoals(goalsRes.data.map((g) => rowToGoal(g, milestonesRes.data!)));
    }
    if (profileRes.data) setProfile(profileRes.data as Profile);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setGoals([]);
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [user, refresh]);

  const addTask: Ctx["addTask"] = async (t) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status ?? "Pending",
        due_date: t.dueDate,
        skill: t.skill,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    if (data) setTasks((prev) => [...prev, rowToTask(data)]);
  };

  const updateTask: Ctx["updateTask"] = async (id, patch) => {
    const dbPatch: any = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.priority !== undefined) dbPatch.priority = patch.priority;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate;
    if (patch.skill !== undefined) dbPatch.skill = patch.skill;
    if (patch.completedAt !== undefined) dbPatch.completed_at = patch.completedAt;
    const { error } = await supabase.from("tasks").update(dbPatch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const deleteTask: Ctx["deleteTask"] = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateStreakIfNeeded = async (justCompleted: boolean) => {
    if (!user || !justCompleted || !profile) return;
    const now = new Date();
    const todayStr = now.toDateString();
    const last = profile.streak_last_date ? new Date(profile.streak_last_date).toDateString() : null;
    if (last === todayStr) return;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const continued = last === yesterday.toDateString();
    const newCount = continued ? profile.streak_count + 1 : 1;
    const { error } = await supabase
      .from("profiles")
      .update({ streak_count: newCount, streak_last_date: now.toISOString() })
      .eq("user_id", user.id);
    if (!error) {
      setProfile({ ...profile, streak_count: newCount, streak_last_date: now.toISOString() });
    }
  };

  const toggleTask: Ctx["toggleTask"] = async (id) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const next = t.status === "Completed" ? "Pending" : "Completed";
    const completedAt = next === "Completed" ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("tasks")
      .update({ status: next, completed_at: completedAt })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    setTasks((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: next, completedAt: completedAt ?? undefined } : x))
    );
    await updateStreakIfNeeded(next === "Completed");
  };

  const addGoal: Ctx["addGoal"] = async (g) => {
    if (!user) return;
    const { data: goalRow, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: g.title,
        description: g.description,
        duration_days: g.durationDays,
        skill: g.skill,
      })
      .select()
      .single();
    if (error || !goalRow) { toast.error(error?.message ?? "Failed"); return; }

    const weeks = Math.max(1, Math.ceil(g.durationDays / 7));
    const milestones = g.milestones?.length
      ? g.milestones
      : Array.from({ length: weeks }, (_, i) => ({
          id: crypto.randomUUID(),
          title: `Week ${i + 1} milestone`,
          week: i + 1,
          completed: false,
        }));

    const { data: msRows } = await supabase
      .from("milestones")
      .insert(
        milestones.map((m) => ({
          goal_id: goalRow.id,
          user_id: user.id,
          title: m.title,
          week: m.week,
          completed: m.completed,
        }))
      )
      .select();

    const newGoal: Goal = rowToGoal(goalRow, msRows ?? []);
    setGoals((prev) => [...prev, newGoal]);
  };

  const toggleMilestone: Ctx["toggleMilestone"] = async (goalId, milestoneId) => {
    const goal = goals.find((g) => g.id === goalId);
    const ms = goal?.milestones.find((m) => m.id === milestoneId);
    if (!ms) return;
    const next = !ms.completed;
    const { error } = await supabase.from("milestones").update({ completed: next }).eq("id", milestoneId);
    if (error) { toast.error(error.message); return; }
    setGoals((prev) =>
      prev.map((g) =>
        g.id !== goalId
          ? g
          : { ...g, milestones: g.milestones.map((m) => (m.id === milestoneId ? { ...m, completed: next } : m)) }
      )
    );
  };

  const deleteGoal: Ctx["deleteGoal"] = async (id) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const skills: Skill[] = useMemo(() => {
    const map = new Map<string, Skill>();
    for (const t of tasks) {
      if (!t.skill) continue;
      const cur = map.get(t.skill) ?? { name: t.skill, totalTasks: 0, completedTasks: 0, lastUpdated: t.createdAt };
      cur.totalTasks += 1;
      if (t.status === "Completed") {
        cur.completedTasks += 1;
        if (t.completedAt && t.completedAt > cur.lastUpdated) cur.lastUpdated = t.completedAt;
      }
      map.set(t.skill, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.completedTasks - a.completedTasks);
  }, [tasks]);

  const username = profile?.display_name || user?.email?.split("@")[0] || "Hero";

  const value: Ctx = {
    tasks,
    goals,
    profile,
    username,
    streak: { count: profile?.streak_count ?? 0, lastDate: profile?.streak_last_date ?? null },
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addGoal,
    toggleMilestone,
    deleteGoal,
    skills,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
