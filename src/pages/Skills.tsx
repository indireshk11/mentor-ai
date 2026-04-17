import { useApp } from "@/store/AppStore";
import { SkillCard } from "@/components/SkillCard";
import { Trophy, Sparkles, Flame } from "lucide-react";

export default function Skills() {
  const { skills } = useApp();
  const learned = skills.filter((s) => s.completedTasks === s.totalTasks && s.totalTasks > 0);
  const inProgress = skills.filter((s) => s.completedTasks < s.totalTasks);

  const totalTasks = skills.reduce((a, s) => a + s.totalTasks, 0);
  const totalDone = skills.reduce((a, s) => a + s.completedTasks, 0);
  const pct = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-hero">SKILLS DASHBOARD</h1>
        <p className="text-muted-foreground">Powers unlocked — auto-tracked from your missions</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatBig icon={Trophy} label="Mastered" value={`${learned.length}`} variant="success" />
        <StatBig icon={Sparkles} label="Training" value={`${inProgress.length}`} variant="electric" />
        <StatBig icon={Flame} label="Skill XP" value={`${pct}%`} variant="sunset" sub={`${totalDone}/${totalTasks} tasks`} />
      </div>

      <section>
        <h2 className="font-display text-2xl md:text-3xl mb-4 flex items-center gap-2">
          <Trophy className="w-7 h-7 text-success" /> Mastered Skills
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {learned.length === 0 && <p className="text-muted-foreground">Complete every task in a skill to earn the badge.</p>}
          {learned.map((s, i) => <SkillCard key={s.name} skill={s} index={i} />)}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl md:text-3xl mb-4 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" /> Skills in Training
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inProgress.length === 0 && <p className="text-muted-foreground">No active training. Add a skill task to begin!</p>}
          {inProgress.map((s, i) => <SkillCard key={s.name} skill={s} index={i} />)}
        </div>
      </section>
    </div>
  );
}

function StatBig({ icon: Icon, label, value, variant, sub }: { icon: any; label: string; value: string; variant: "success" | "electric" | "sunset"; sub?: string }) {
  const grad = { success: "gradient-success", electric: "gradient-electric", sunset: "gradient-sunset" }[variant];
  return (
    <div className="glass rounded-2xl p-5">
      <div className={`w-12 h-12 rounded-xl ${grad} flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-4xl text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
