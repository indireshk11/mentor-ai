import { AppState, Task, Goal } from "./types";

const KEY = "mentor-app-state-v1";

const today = new Date();
const iso = (d: Date) => d.toISOString();
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return iso(d);
};

const demoTasks: Task[] = [
  {
    id: crypto.randomUUID(),
    title: "Finish Python Functions",
    category: "Skill Learning",
    priority: "High",
    status: "Pending",
    dueDate: addDays(1),
    skill: "Python",
    createdAt: iso(today),
  },
  {
    id: crypto.randomUUID(),
    title: "Math Assignment Ch.4",
    category: "Homework",
    priority: "High",
    status: "Pending",
    dueDate: addDays(0),
    createdAt: iso(today),
  },
  {
    id: crypto.randomUUID(),
    title: "React Hooks Practice",
    category: "Skill Learning",
    priority: "Medium",
    status: "Completed",
    dueDate: addDays(-1),
    skill: "React",
    createdAt: iso(today),
    completedAt: iso(today),
  },
  {
    id: crypto.randomUUID(),
    title: "Physics Mid-term Prep",
    category: "Assessments",
    priority: "High",
    status: "Pending",
    dueDate: addDays(3),
    createdAt: iso(today),
  },
  {
    id: crypto.randomUUID(),
    title: "Portfolio Website Build",
    category: "Projects",
    priority: "Medium",
    status: "Pending",
    dueDate: addDays(5),
    skill: "React",
    createdAt: iso(today),
  },
  {
    id: crypto.randomUUID(),
    title: "Read 30 mins daily",
    category: "Personal Goals",
    priority: "Low",
    status: "Pending",
    dueDate: addDays(0),
    createdAt: iso(today),
  },
  {
    id: crypto.randomUUID(),
    title: "DSA: Arrays & Strings",
    category: "Skill Learning",
    priority: "Medium",
    status: "Completed",
    dueDate: addDays(-2),
    skill: "DSA",
    createdAt: iso(today),
    completedAt: iso(today),
  },
];

const demoGoals: Goal[] = [
  {
    id: crypto.randomUUID(),
    title: "Master Python in 30 Days",
    description: "Become confident in Python fundamentals + projects",
    durationDays: 30,
    startDate: iso(today),
    skill: "Python",
    milestones: [
      { id: crypto.randomUUID(), title: "Syntax & Variables", week: 1, completed: true },
      { id: crypto.randomUUID(), title: "Functions & OOP", week: 2, completed: false },
      { id: crypto.randomUUID(), title: "Libraries & APIs", week: 3, completed: false },
      { id: crypto.randomUUID(), title: "Build Final Project", week: 4, completed: false },
    ],
  },
];

const defaultState: AppState = {
  tasks: demoTasks,
  goals: demoGoals,
  username: "Hero",
  streak: { count: 3, lastCompletedDate: iso(today) },
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw);
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(KEY);
}
