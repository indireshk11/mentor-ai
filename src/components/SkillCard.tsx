import { Skill } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";
import { Sparkles, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = [Sparkles, Trophy, Zap];

export function SkillCard({ skill, index = 0 }: { skill: Skill; index?: number }) {
  const pct = skill.totalTasks ? (skill.completedTasks / skill.totalTasks) * 100 : 0;
  const fullyLearned = pct === 100 && skill.totalTasks > 0;
  const Icon = icons[index % icons.length];
  const level = pct >= 80 ? "Master" : pct >= 50 ? "Adept" : pct >= 25 ? "Apprentice" : "Novice";

  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-glow",
        fullyLearned && "border-success/50"
      )}
    >
      {fullyLearned && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold gradient-success text-success-foreground">
          LEARNED
        </div>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", fullyLearned ? "gradient-success" : "gradient-electric")}>
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display text-xl tracking-wide">{skill.name}</h3>
          <p className="text-xs text-muted-foreground">{level} · {skill.completedTasks}/{skill.totalTasks} tasks</p>
        </div>
      </div>
      <ProgressBar value={pct} variant={fullyLearned ? "success" : "electric"} showLabel />
    </div>
  );
}
