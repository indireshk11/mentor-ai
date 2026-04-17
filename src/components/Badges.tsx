import { Category, Priority } from "@/lib/types";
import { Book, PenLine, ClipboardCheck, FolderGit2, Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export const categoryMeta: Record<Category, { color: string; bg: string; icon: any }> = {
  Academics: { color: "text-primary", bg: "bg-primary/15 border-primary/30", icon: Book },
  Homework: { color: "text-secondary", bg: "bg-secondary/15 border-secondary/30", icon: PenLine },
  Assessments: { color: "text-accent", bg: "bg-accent/15 border-accent/30", icon: ClipboardCheck },
  Projects: { color: "text-hero", bg: "bg-hero/15 border-hero/30", icon: FolderGit2 },
  "Skill Learning": { color: "text-primary-glow", bg: "bg-primary/20 border-primary-glow/40", icon: Sparkles },
  "Personal Goals": { color: "text-success", bg: "bg-success/15 border-success/30", icon: Heart },
};

export function CategoryBadge({ category }: { category: Category }) {
  const m = categoryMeta[category];
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", m.bg, m.color)}>
      <Icon className="w-3 h-3" />
      {category}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map = {
    High: "bg-destructive/20 text-destructive border-destructive/40",
    Medium: "bg-hero/20 text-hero border-hero/40",
    Low: "bg-success/15 text-success border-success/30",
  } as const;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", map[priority])}>
      {priority}
    </span>
  );
}
