export type Category =
  | "Academics"
  | "Homework"
  | "Assessments"
  | "Projects"
  | "Skill Learning"
  | "Personal Goals";

export type Priority = "High" | "Medium" | "Low";
export type Status = "Pending" | "Completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  status: Status;
  dueDate: string; // ISO
  skill?: string; // e.g. "Python"
  createdAt: string;
  completedAt?: string;
}

export interface Skill {
  name: string;
  totalTasks: number;
  completedTasks: number;
  lastUpdated: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  durationDays: number;
  startDate: string;
  milestones: Milestone[];
  skill?: string;
}

export interface Milestone {
  id: string;
  title: string;
  week: number;
  completed: boolean;
}

export interface AppState {
  tasks: Task[];
  goals: Goal[];
  username: string;
  streak: { count: number; lastCompletedDate: string | null };
}
