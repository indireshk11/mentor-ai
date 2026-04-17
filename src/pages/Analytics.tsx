import { useApp } from "@/store/AppStore";
import { ProgressBar } from "@/components/ProgressBar";
import { categoryMeta } from "@/components/Badges";
import { Category } from "@/lib/types";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Analytics() {
  const { tasks, skills, streak } = useApp();
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "Completed").length;
  const pct = total ? (done / total) * 100 : 0;

  // Per-day completion this week
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  start.setHours(0, 0, 0, 0);

  const dayCounts = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const count = tasks.filter((t) => t.completedAt && new Date(t.completedAt).toDateString() === d.toDateString()).length;
    return { day: days[d.getDay()], count, isToday: d.toDateString() === today.toDateString() };
  });
  const max = Math.max(1, ...dayCounts.map((d) => d.count));

  // Per-category breakdown
  const cats: Category[] = ["Academics", "Homework", "Assessments", "Projects", "Skill Learning", "Personal Goals"];
  const catData = cats.map((c) => {
    const all = tasks.filter((t) => t.category === c);
    const d = all.filter((t) => t.status === "Completed").length;
    return { category: c, total: all.length, done: d, pct: all.length ? (d / all.length) * 100 : 0 };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-electric">PROGRESS ANALYTICS</h1>
        <p className="text-muted-foreground">Visualize your hero journey</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Big title="Total Productivity" value={`${Math.round(pct)}%`} sub={`${done} of ${total} tasks done`} />
        <Big title="Streak" value={`${streak.count} days`} sub="Keep showing up!" />
        <Big title="Skills Earned" value={`${skills.filter((s) => s.completedTasks === s.totalTasks && s.totalTasks).length}`} sub={`${skills.length} total`} />
      </div>

      <section className="glass rounded-3xl p-6">
        <h2 className="font-display text-2xl mb-4">Weekly Completion</h2>
        <div className="flex items-end gap-3 h-48">
          {dayCounts.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex-1 w-full flex items-end">
                <div
                  className={`w-full rounded-t-xl transition-all ${d.isToday ? "gradient-hero shadow-orange" : "gradient-electric"}`}
                  style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? "8px" : "2px" }}
                  title={`${d.count} tasks`}
                />
              </div>
              <span className={`text-xs ${d.isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>{d.day}</span>
              <span className="text-[10px] text-muted-foreground">{d.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">Category Breakdown</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {catData.map((c) => {
            const Icon = categoryMeta[c.category].icon;
            return (
              <div key={c.category} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${categoryMeta[c.category].color}`} />
                    <h3 className="font-semibold">{c.category}</h3>
                  </div>
                  <span className="text-sm text-muted-foreground">{c.done}/{c.total}</span>
                </div>
                <ProgressBar value={c.pct} variant="hero" />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Big({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className="font-display text-5xl text-gradient-hero mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}
