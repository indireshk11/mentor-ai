import { useApp } from "@/store/AppStore";
import { TaskCard } from "@/components/TaskCard";
import { cn } from "@/lib/utils";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Planner() {
  const { state } = useApp();
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  start.setHours(0, 0, 0, 0);

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-electric">WEEKLY PLANNER</h1>
        <p className="text-muted-foreground">Your battle plan from Monday to Sunday</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-3">
        {week.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString();
          const tasks = state.tasks.filter((t) => new Date(t.dueDate).toDateString() === d.toDateString());
          const urgent = tasks.some((t) => t.priority === "High" && t.status === "Pending");
          return (
            <div
              key={i}
              className={cn(
                "glass rounded-2xl p-3 min-h-[200px] flex flex-col gap-2",
                isToday && "border-primary shadow-glow",
                urgent && !isToday && "border-secondary/60"
              )}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-xl tracking-wide">{days[d.getDay()]}</span>
                <span className={cn("text-xs", isToday ? "text-primary font-bold" : "text-muted-foreground")}>
                  {d.getDate()}
                </span>
              </div>
              {isToday && (
                <span className="text-[10px] font-bold uppercase tracking-wider gradient-hero text-primary-foreground px-2 py-0.5 rounded-full self-start">
                  Today
                </span>
              )}
              <div className="space-y-2 flex-1">
                {tasks.length === 0 && <p className="text-xs text-muted-foreground/60">No missions</p>}
                {tasks.map((t) => (
                  <div key={t.id} className="text-xs">
                    <TaskCard task={t} compact />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
