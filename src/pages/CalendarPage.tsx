import { useApp } from "@/store/AppStore";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function CalendarPage() {
  const { tasks } = useApp();
  const [cursor, setCursor] = useState(new Date());
  const today = new Date();

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startBlank = first.getDay();

  // Map of yyyy-mm-dd -> {done, total}
  const map = new Map<string, { done: number; total: number }>();
  for (const t of tasks) {
    const k = new Date(t.dueDate).toDateString();
    const cur = map.get(k) ?? { done: 0, total: 0 };
    cur.total += 1;
    if (t.status === "Completed") cur.done += 1;
    map.set(k, cur);
  }

  const monthName = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  // productivity: completed / total this month
  let monthDone = 0, monthTotal = 0;
  for (const t of tasks) {
    const d = new Date(t.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      monthTotal++;
      if (t.status === "Completed") monthDone++;
    }
  }
  const score = monthTotal ? Math.round((monthDone / monthTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-sunset">MONTHLY CALENDAR</h1>
          <p className="text-muted-foreground">Track your productivity across the month</p>
        </div>
        <div className="glass rounded-2xl px-5 py-3 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Productivity</p>
          <p className="font-display text-3xl text-gradient-hero">{score}%</p>
        </div>
      </div>

      <div className="glass rounded-3xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="px-4 py-2 rounded-xl border border-border hover:border-primary"
          >
            ‹
          </button>
          <h2 className="font-display text-2xl md:text-3xl text-gradient-electric">{monthName}</h2>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="px-4 py-2 rounded-xl border border-border hover:border-primary"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs uppercase tracking-wider text-muted-foreground py-2">{d}</div>
          ))}
          {Array.from({ length: startBlank }).map((_, i) => <div key={`b${i}`} />)}
          {Array.from({ length: lastDay }, (_, i) => i + 1).map((day) => {
            const d = new Date(year, month, day);
            const data = map.get(d.toDateString());
            const isToday = d.toDateString() === today.toDateString();
            const allDone = data && data.done === data.total && data.total > 0;
            const partial = data && data.done > 0 && data.done < data.total;
            return (
              <div
                key={day}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center text-sm border transition-all",
                  isToday ? "border-primary shadow-glow" : "border-border",
                  allDone && "gradient-success text-success-foreground border-transparent",
                  partial && "bg-hero/20 border-hero/40"
                )}
              >
                <span className={cn("font-bold", allDone && "text-success-foreground")}>{day}</span>
                {data && (
                  <span className={cn("text-[10px]", allDone ? "text-success-foreground/80" : "text-muted-foreground")}>
                    {data.done}/{data.total}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
