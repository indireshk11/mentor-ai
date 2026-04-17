import { useState } from "react";
import { useApp } from "@/store/AppStore";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Target, Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Goals() {
  const { state, addGoal, toggleMilestone, deleteGoal } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(30);
  const [skill, setSkill] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({ title: title.trim(), durationDays: days, skill: skill.trim() || undefined });
    setTitle("");
    setSkill("");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-hero">GOAL ROADMAP</h1>
          <p className="text-muted-foreground">Big dreams broken into weekly missions</p>
        </div>
        {!open && (
          <Button onClick={() => setOpen(true)} className="gradient-hero text-primary-foreground font-bold">
            <Plus className="w-5 h-5 mr-1" /> New Goal
          </Button>
        )}
      </div>

      {open && (
        <form onSubmit={submit} className="glass rounded-2xl p-5 space-y-3 animate-pop-in">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master React in 60 days"
            className="w-full bg-background/60 border border-border rounded-xl px-4 py-3"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Duration (days)</label>
              <input
                type="number"
                min={7}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full bg-background/60 border border-border rounded-xl px-3 py-2.5 mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Skill (optional)</label>
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="React"
                className="w-full bg-background/60 border border-border rounded-xl px-3 py-2.5 mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 gradient-hero text-primary-foreground font-bold">Generate Roadmap 🗺️</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {state.goals.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground">No goals yet. Set your first epic quest!</div>
        )}
        {state.goals.map((goal) => {
          const done = goal.milestones.filter((m) => m.completed).length;
          const pct = goal.milestones.length ? (done / goal.milestones.length) * 100 : 0;
          return (
            <div key={goal.id} className="glass rounded-3xl p-5 md:p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-sunset flex items-center justify-center shrink-0">
                    <Target className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl tracking-wide">{goal.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {goal.durationDays} days · {done}/{goal.milestones.length} milestones
                      {goal.skill && <> · #{goal.skill}</>}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-2 rounded-lg hover:bg-destructive/15 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <ProgressBar value={pct} variant="hero" height="h-3" showLabel />

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                {goal.milestones.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMilestone(goal.id, m.id)}
                    className={cn(
                      "text-left rounded-2xl p-4 border transition-all hover:-translate-y-0.5",
                      m.completed
                        ? "gradient-success border-transparent"
                        : "border-border bg-background/40 hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn("text-xs uppercase tracking-wider", m.completed ? "text-success-foreground/80" : "text-muted-foreground")}>
                        Week {m.week}
                      </span>
                      {m.completed && <Check className="w-4 h-4 text-success-foreground" strokeWidth={3} />}
                    </div>
                    <p className={cn("font-semibold", m.completed && "text-success-foreground")}>{m.title}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
