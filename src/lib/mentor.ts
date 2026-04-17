import { Task } from "./types";

const greetings = [
  "Time to power up, {name}! ⚡",
  "Let's break limits today, {name}! 💪",
  "Suit up, {name} — destiny awaits!",
  "Plus Ultra, {name}! 🔥",
  "A true hero plans their day, {name} ✨",
];

const motivations = [
  "Every small win builds your legend.",
  "Discipline beats motivation. Show up.",
  "Your future self is watching — make them proud.",
  "Heroes aren't born. They're trained, one task at a time.",
  "Focus is your superpower today.",
  "Consistency unlocks mastery.",
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const dailyGreeting = (name: string) =>
  pick(greetings).replace("{name}", name || "Hero");

export const motivationalMessage = () => pick(motivations);

const priorityWeight = { High: 3, Medium: 2, Low: 1 } as const;

export function scoreTask(t: Task): number {
  if (t.status === "Completed") return -1;
  const due = new Date(t.dueDate).getTime();
  const now = Date.now();
  const daysLeft = (due - now) / (1000 * 60 * 60 * 24);
  // Closer due date and higher priority = higher score
  const urgency = daysLeft <= 0 ? 100 : Math.max(0, 30 - daysLeft) * 3;
  return urgency + priorityWeight[t.priority] * 10;
}

export function suggestTopTasks(tasks: Task[], n = 3): Task[] {
  return [...tasks]
    .filter((t) => t.status === "Pending")
    .sort((a, b) => scoreTask(b) - scoreTask(a))
    .slice(0, n);
}

export function isToday(iso: string) {
  const d = new Date(iso);
  const t = new Date();
  return d.toDateString() === t.toDateString();
}

export function isThisWeek(iso: string) {
  const d = new Date(iso);
  const t = new Date();
  const start = new Date(t);
  start.setDate(t.getDate() - t.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}
