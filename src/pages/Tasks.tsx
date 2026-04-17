import { useState } from "react";
import { useApp } from "@/store/AppStore";
import { TaskCard } from "@/components/TaskCard";
import { AddTaskForm } from "@/components/AddTaskForm";
import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters: ("All" | Category | "Pending" | "Completed")[] = [
  "All",
  "Pending",
  "Completed",
  "Academics",
  "Homework",
  "Assessments",
  "Projects",
  "Skill Learning",
  "Personal Goals",
];

export default function Tasks() {
  const { tasks } = useApp();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const filtered = tasks.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Pending" || filter === "Completed") return t.status === filter;
    return t.category === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-hero">TASK MANAGER</h1>
          <p className="text-muted-foreground">All your missions in one place</p>
        </div>
        <AddTaskForm />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-semibold border transition-all",
              filter === f
                ? "gradient-electric text-primary-foreground border-transparent shadow-glow"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground md:col-span-2">
            No tasks here yet.
          </div>
        )}
        {filtered.map((t) => <TaskCard key={t.id} task={t} />)}
      </div>
    </div>
  );
}
