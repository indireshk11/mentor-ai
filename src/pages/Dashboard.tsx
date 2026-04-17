import { useApp } from "@/store/AppStore";
import { dailyGreeting, motivationalMessage, suggestTopTasks, isToday, isThisWeek } from "@/lib/mentor";
import { TaskCard } from "@/components/TaskCard";
import { SkillCard } from "@/components/SkillCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Sparkles, Flame, Target, Trophy, Bot, ListChecks } from "lucide-react";
import { useMemo } from "react";

export default function Dashboard() {
  const { tasks, goals, username, streak, skills, loading } = useApp();
  const greeting = useMemo(() => dailyGreeting(username), [username]);
  const motivation = useMemo(() => motivationalMessage(), []);
  const top3 = useMemo(() => suggestTopTasks(tasks, 3), [tasks]);

  const todayTasks = tasks.filter((t) => isToday(t.dueDate));
  const weekTasks = tasks.filter((t) => isThisWeek(t.dueDate));
  const weekDone = weekTasks.filter((t) => t.status === "Completed").length;
  const weekPct = weekTasks.length ? (weekDone / weekTasks.length) * 100 : 0;

  const totalDone = tasks.filter((t) => t.status === "Completed").length;
  const productivity = tasks.length ? (totalDone / tasks.length) * 100 : 0;

  const learnedSkills = skills.filter((s) => s.completedTasks === s.totalTasks && s.totalTasks > 0);
  const skillsInProgress = skills.filter((s) => s.completedTasks < s.totalTasks);

  const goalProgress = goals.map((g) => {
    const done = g.milestones.filter((m) => m.completed).length;
    return { goal: g, pct: g.milestones.length ? (done / g.milestones.length) * 100 : 0 };
  });

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading your hero data…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <section className="relative overflow-hidden rounded-3xl gradient-cosmic p-6 md:p-10 border border-primary/20">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full gradient-hero opacity-20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full gradient-sunset opacity-20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary font-bold">AI Mentor</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-gradient-hero leading-none animate-pop-in">
            {greeting}
          </h1>
          <p className="mt-3 text-lg text-foreground/80 max-w-2xl">{motivation}</p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat icon={Flame} label="Streak" value={`${streak.count}d`} variant="sunset" />
            <Stat icon={ListChecks} label="Today" value={`${todayTasks.length}`} variant="electric" />
            <Stat icon={Trophy} label="Productivity" value={`${Math.round(productivity)}%`} variant="hero" />
            <Stat icon={Sparkles} label="Skills" value={`${skills.length}`} variant="pink" />
          </div>
        </div>
      </section>

      {/* AI Mentor suggestions */}
      <section>
        <SectionHeader icon={Bot} title="What should I do today?" subtitle="Top 3 missions ranked by urgency & priority" />
        <div className="grid md:grid-cols-3 gap-4">
          {top3.length === 0 && <EmptyState text="All caught up, hero! 🎉" />}
          {top3.map((t, i) => (
            <div key={t.id} className="relative">
              <div className="absolute -top-3 -left-3 z-10 w-9 h-9 rounded-full gradient-hero flex items-center justify-center font-display text-xl text-primary-foreground shadow-orange">
                {i + 1}
              </div>
              <TaskCard task={t} />
            </div>
          ))}
        </div>
      </section>

      {/* Today + Week */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader icon={ListChecks} title="Today's Tasks" />
          <div className="space-y-3">
            {todayTasks.length === 0 && <EmptyState text="Nothing due today. Plan ahead! ⚡" />}
            {todayTasks.map((t) => <TaskCard key={t.id} task={t} compact />)}
          </div>
        </div>
        <div>
          <SectionHeader icon={Target} title="This Week's Progress" />
          <div className="glass rounded-2xl p-6">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Tasks completed this week</p>
                <p className="font-display text-5xl text-gradient-electric">{weekDone}/{weekTasks.length}</p>
              </div>
              <Trophy className="w-12 h-12 text-hero animate-float" />
            </div>
            <ProgressBar value={weekPct} variant="hero" height="h-4" showLabel />
          </div>

          <SectionHeader icon={Target} title="Goal Roadmaps" className="mt-6" />
          <div className="space-y-3">
            {goalProgress.length === 0 && <EmptyState text="Create your first goal!" />}
            {goalProgress.map(({ goal, pct }) => (
              <div key={goal.id} className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{goal.title}</h4>
                  <span className="text-xs text-muted-foreground">{Math.round(pct)}%</span>
                </div>
                <ProgressBar value={pct} variant="sunset" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learned Skills */}
      <section>
        <SectionHeader
          icon={Trophy}
          title="Learned Skills"
          subtitle="Skills you've fully mastered — auto-tracked from completed tasks"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {learnedSkills.length === 0 && (
            <EmptyState text="Complete all tasks under a skill to earn your badge! 🏆" />
          )}
          {learnedSkills.map((s, i) => <SkillCard key={s.name} skill={s} index={i} />)}
        </div>
      </section>

      {/* Skills in progress */}
      <section>
        <SectionHeader icon={Sparkles} title="Skills in Progress" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillsInProgress.length === 0 && <EmptyState text="Add a Skill Learning task to start training!" />}
          {skillsInProgress.map((s, i) => <SkillCard key={s.name} skill={s} index={i} />)}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, variant }: { icon: any; label: string; value: string; variant: "hero" | "electric" | "sunset" | "pink" }) {
  const grad = { hero: "gradient-hero", electric: "gradient-electric", sunset: "gradient-sunset", pink: "bg-accent" }[variant];
  return (
    <div className="glass rounded-2xl p-4">
      <div className={`w-10 h-10 rounded-lg ${grad} flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-display text-2xl text-foreground">{value}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, className = "" }: { icon: any; title: string; subtitle?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      <div className="w-10 h-10 rounded-xl gradient-electric flex items-center justify-center shadow-glow">
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <div>
        <h2 className="font-display text-2xl md:text-3xl tracking-wide">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="glass rounded-2xl p-6 text-center text-muted-foreground">{text}</div>;
}
